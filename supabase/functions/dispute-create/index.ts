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

    const { projectId, reason } = await req.json();

    // Verify user is part of the project
    const { data: project, error: projectError } = await supabaseClient
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .or(`client_id.eq.${user.id},engineer_id.eq.${user.id}`)
      .single();

    if (projectError || !project) {
      throw new Error('Project not found or unauthorized');
    }

    // Set escrow to on_hold
    await supabaseClient
      .from('projects')
      .update({ escrow: 'on_hold' })
      .eq('id', projectId);

    await supabaseClient
      .from('payments')
      .update({ escrow: 'on_hold' })
      .eq('project_id', projectId);

    // Create dispute
    const { data, error } = await supabaseClient
      .from('disputes')
      .insert({
        project_id: projectId,
        opened_by: user.id,
        reason,
        status: 'open'
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify(data),
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
