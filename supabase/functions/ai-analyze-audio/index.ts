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

    const { audio_file_id, analysis_type } = await req.json();

    // Create analysis job
    const { data: job, error } = await supabaseClient
      .from('ai_analysis_jobs')
      .insert({
        user_id: user.id,
        audio_file_id: audio_file_id,
        analysis_type: analysis_type || 'full_profile',
        status: 'queued',
      })
      .select()
      .single();

    if (error) throw error;

    // In a real implementation, this would trigger background processing
    // For now, we'll simulate completion
    const mockResults = {
      mixing_quality: { score: 0.85, issues: [] },
      mastering_analysis: { loudness: -14, dynamic_range: 8 },
      genre_detection: { primary: 'Electronic', confidence: 0.92 },
      mood_analysis: { energy: 0.8, valence: 0.6 },
    };

    await supabaseClient
      .from('ai_analysis_jobs')
      .update({
        status: 'completed',
        results: mockResults,
        confidence_scores: { overall: 0.88 },
        completed_at: new Date().toISOString(),
      })
      .eq('id', job.id);

    return new Response(
      JSON.stringify({ job_id: job.id, status: 'queued' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
