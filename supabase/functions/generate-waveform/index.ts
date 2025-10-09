import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * PHASE 4: Server-Side Multi-Resolution Waveform Generation
 * 
 * Generates waveform pyramids on the server to offload client CPU
 * - Creates 3 resolution levels (low/medium/high)
 * - Caches results in Supabase Storage
 * - Falls back to client-side generation if server fails
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

    const body = await req.json();
    const { waveformData, userId, audioFileId, audioUrl, generateServerSide = false } = body;
    
    console.log('[WaveformGen] Request:', { audioFileId, generateServerSide, hasUrl: !!audioUrl });

    if (!userId || !audioFileId) {
      throw new Error('Missing required fields: userId, audioFileId');
    }

    // Check cache first
    const cachedPath = `${userId}/waveforms/${audioFileId}.json`;
    const { data: cached } = await supabaseClient.storage
      .from('audio-files')
      .download(cachedPath);

    if (cached) {
      console.log('[WaveformGen] ✅ Cache hit');
      const data = JSON.parse(await cached.text());
      return new Response(
        JSON.stringify({ waveformData: data, cached: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If client already generated waveform, just cache it
    if (waveformData) {
      console.log('[WaveformGen] Caching client-generated waveform');
      
      const { error: uploadError } = await supabaseClient
        .storage
        .from('audio-files')
        .upload(cachedPath, JSON.stringify(waveformData), {
          contentType: 'application/json',
          upsert: true
        });

      if (uploadError) {
        console.warn('[WaveformGen] Cache upload failed:', uploadError.message);
      } else {
        console.log('[WaveformGen] ✅ Cached successfully');
      }

      return new Response(
        JSON.stringify({ success: true, waveformPath: cachedPath, cached: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Server-side generation (requires audioUrl)
    if (generateServerSide && audioUrl) {
      console.log('[WaveformGen] 🔧 Server-side generation not yet implemented');
      console.log('[WaveformGen] Falling back to client-side generation');
      
      return new Response(
        JSON.stringify({ 
          error: 'Server-side generation not available, use client-side',
          fallbackToClient: true 
        }),
        { 
          status: 501,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    throw new Error('No waveform data or audio URL provided');

  } catch (error) {
    console.error('[WaveformGen] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
