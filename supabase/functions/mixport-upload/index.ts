import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      throw new Error('Unauthorized');
    }

    const { projectId, fileId, kind, contentHash } = await req.json();

    // Verify user has access to project
    const { data: project, error: projectError } = await supabaseClient
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .or(`client_id.eq.${user.id},engineer_id.eq.${user.id}`)
      .single();

    if (projectError || !project) {
      throw new Error('Project not found or unauthorized');
    }

    // Update file record with kind and content hash
    const { error: fileError } = await supabaseClient
      .from('audio_files')
      .update({ 
        kind,
        content_hash: contentHash,
        processing_status: 'completed'
      })
      .eq('id', fileId);

    if (fileError) {
      throw fileError;
    }

    // If deliverable, update project status
    if (kind === 'deliverable') {
      await supabaseClient
        .from('projects')
        .update({ status: 'delivered' })
        .eq('id', projectId);
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
