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

    const { session_id, manifest, engineer_signature, changes_summary } = await req.json();

    if (!session_id || !manifest) {
      return new Response(
        JSON.stringify({ error: 'session_id and manifest required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify checksum
    const manifestCopy = { ...manifest };
    const providedChecksum = manifestCopy.checksum;
    delete manifestCopy.checksum;

    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(manifestCopy));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const calculatedChecksum = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    if (providedChecksum !== calculatedChecksum) {
      return new Response(
        JSON.stringify({ error: 'Checksum verification failed - manifest may be corrupted' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get current session
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

    // Calculate diff between old and new manifest
    const oldManifest = session.manifest_data;
    const diff = {
      added: [],
      modified: [],
      removed: [],
      pluginChanges: [],
      routingChanges: [],
    };

    // Compare stems
    const oldStems = Object.values(oldManifest.audio).flat();
    const newStems = Object.values(manifest.audio).flat();
    
    newStems.forEach(newStem => {
      const oldStem = oldStems.find(s => s.id === newStem.id);
      if (!oldStem) {
        diff.added.push(`Stem: ${newStem.name}`);
      } else if (JSON.stringify(oldStem) !== JSON.stringify(newStem)) {
        diff.modified.push(`Stem: ${newStem.name}`);
      }
    });

    oldStems.forEach(oldStem => {
      const newStem = newStems.find(s => s.id === oldStem.id);
      if (!newStem) {
        diff.removed.push(`Stem: ${oldStem.name}`);
      }
    });

    // Update session
    const { error: updateError } = await supabaseClient
      .from('mixxmaster_sessions')
      .update({
        manifest_data: manifest,
        checksum: providedChecksum,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session_id);

    if (updateError) {
      console.error('Session update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create version record
    const { data: userData } = await supabaseClient.auth.getUser();
    const engineerId = userData?.user?.id;

    const { data: version, error: versionError } = await supabaseClient
      .from('mixxmaster_versions')
      .insert({
        session_id,
        engineer_id: engineerId,
        engineer_signature,
        changes_summary: changes_summary || 'Version update',
        diff_data: diff,
        manifest_snapshot: manifest,
      })
      .select()
      .single();

    if (versionError) {
      console.error('Version creation error:', versionError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        session_id,
        version_number: version?.version_number,
        diff,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('MixxMaster parse error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
