import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { project_id, stems, session_data } = await req.json();

    // Validate request
    if (!project_id || !stems || !Array.isArray(stems)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: project_id and stems array required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user has access to project
    const { data: project, error: projectError } = await supabaseClient
      .from('projects')
      .select('*')
      .eq('id', project_id)
      .single();

    if (projectError || !project) {
      return new Response(
        JSON.stringify({ error: 'Project not found or access denied' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Organize stems by category
    const stemCollection = {
      vocals: stems.filter(s => s.category === 'vocals'),
      drums: stems.filter(s => s.category === 'drums'),
      instruments: stems.filter(s => s.category === 'instruments'),
      fx: stems.filter(s => s.category === 'fx'),
    };

    // Create manifest
    const manifest = {
      version: '1.0',
      sessionId: crypto.randomUUID(),
      projectId: project_id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: project.client_id,
      audio: stemCollection,
      sessionData: session_data || {
        mixChain: { chains: [], version: '1.0' },
        routing: { buses: [], auxSends: [] },
        tempoMap: { bpm: 120, timeSignature: '4/4', markers: [], tempoChanges: [] },
        aiAnalysis: null,
      },
      metadata: {
        artistInfo: {
          artistId: project.client_id,
          artistName: project.project_name || 'Unnamed Project',
          projectName: project.project_name || 'Unnamed Project',
        },
        versionHistory: [],
        source: 'original',
      },
      checksum: '',
    };

    // Calculate checksum
    const manifestStr = JSON.stringify(manifest);
    const encoder = new TextEncoder();
    const data = encoder.encode(manifestStr);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    manifest.checksum = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Create MixxMaster session
    const { data: session, error: sessionError } = await supabaseClient
      .from('mixxmaster_sessions')
      .insert({
        project_id,
        manifest_data: manifest,
        format_version: '1.0',
        storage_mode: 'hybrid',
        checksum: manifest.checksum,
        created_by: project.client_id,
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Session creation error:', sessionError);
      return new Response(
        JSON.stringify({ error: 'Failed to create session', details: sessionError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create stem records
    const stemRecords = stems.map(stem => ({
      session_id: session.id,
      stem_category: stem.category,
      stem_name: stem.name,
      storage_path: stem.storage_path,
      file_size: stem.file_size,
      duration_seconds: stem.duration_seconds,
      sample_rate: stem.sample_rate || 48000,
      bit_depth: stem.bit_depth || 24,
      channels: stem.channels || 2,
      waveform_data: stem.waveform_data,
    }));

    const { error: stemsError } = await supabaseClient
      .from('mixxmaster_stems')
      .insert(stemRecords);

    if (stemsError) {
      console.error('Stems creation error:', stemsError);
    }

    // Trigger PrimeBot analysis if stems exist
    if (stems.length > 0) {
      try {
        await supabaseClient.functions.invoke('primebot-analyze', {
          body: { session_id: session.id, stems }
        });
      } catch (error) {
        console.error('PrimeBot analysis trigger error:', error);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        session_id: session.id,
        manifest: manifest 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('MixxMaster create error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
