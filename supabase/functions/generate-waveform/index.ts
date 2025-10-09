import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Waveform Caching Service
 * Stores pre-generated waveform data in Supabase storage
 * Client generates waveforms, this service caches them for future use
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { waveformData, userId, audioFileId } = await req.json();
    
    console.log('Caching waveform for audio file:', audioFileId);

    if (!waveformData || !userId || !audioFileId) {
      throw new Error('Missing required fields: waveformData, userId, audioFileId');
    }

    // Store waveform data in storage
    const waveformPath = `${userId}/waveforms/${audioFileId}.json`;
    const { error: uploadError } = await supabaseClient
      .storage
      .from('audio-files')
      .upload(waveformPath, JSON.stringify(waveformData), {
        contentType: 'application/json',
        upsert: true
      });

    if (uploadError) {
      throw new Error(`Failed to cache waveform: ${uploadError.message}`);
    }

    console.log('Waveform cached successfully:', waveformPath);

    return new Response(
      JSON.stringify({ 
        success: true, 
        waveformPath
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-waveform:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
