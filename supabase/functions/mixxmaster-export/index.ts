import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { session_id, include_stems = true, version_number } = await req.json();

    if (!session_id) {
      return new Response(
        JSON.stringify({ error: 'session_id required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get session
    const { data: session, error: sessionError } = await supabaseClient
      .from('mixxmaster_sessions')
      .select('*')
      .eq('id', session_id)
      .single();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: 'Session not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let manifest = session.manifest_data;

    // If version specified, get that version's manifest
    if (version_number) {
      const { data: version } = await supabaseClient
        .from('mixxmaster_versions')
        .select('manifest_snapshot')
        .eq('session_id', session_id)
        .eq('version_number', version_number)
        .single();

      if (version) {
        manifest = version.manifest_snapshot;
      }
    }

    // Get stems if requested
    let stems = [];
    if (include_stems) {
      const { data: stemData } = await supabaseClient
        .from('mixxmaster_stems')
        .select('*')
        .eq('session_id', session_id);

      stems = stemData || [];
    }

    // Get AI analysis
    const { data: aiAnalysis } = await supabaseClient
      .from('mixxmaster_ai_metadata')
      .select('*')
      .eq('session_id', session_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Build complete package
    const exportPackage = {
      manifest,
      stems: stems.map((s: any) => ({
        ...s,
        download_url: include_stems ? supabaseClient.storage
          .from('audio-files')
          .getPublicUrl(s.storage_path).data.publicUrl : null,
      })),
      ai_analysis: aiAnalysis,
      exported_at: new Date().toISOString(),
    };

    return new Response(
      JSON.stringify({
        success: true,
        package: exportPackage,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('MixxMaster export error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
