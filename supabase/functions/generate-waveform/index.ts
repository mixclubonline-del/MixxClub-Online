import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireAuth, authErrorResponse } from '../_shared/auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Waveform Generator
 * 
 * Two modes:
 * 1. Standard: Requires userId + audioFileId, caches in Supabase Storage
 * 2. Promo/Campaign: Generates a procedural waveform visualization from genre/mood
 *    context when no userId/audioFileId are provided (e.g., from orchestrator)
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const auth = await requireAuth(req);
  if ('error' in auth) return authErrorResponse(auth, corsHeaders);

  try {
    const body = await req.json();
    const { waveformData, userId, audioFileId, audioUrl, generateServerSide = false,
      genre, mood, character, campaign, phase } = body;

    console.log('[WaveformGen] Request:', { audioFileId, generateServerSide, hasUrl: !!audioUrl, hasPromoContext: !!campaign });

    // ===== PROMO/CAMPAIGN MODE =====
    // When called from orchestrator without userId/audioFileId,
    // generate a procedural waveform visualization
    if (!userId || !audioFileId) {
      if (campaign || phase || genre) {
        console.log('[WaveformGen] Promo mode — generating procedural waveform');
        const waveform = generateProceduralWaveform(genre || 'trap', mood || 'energetic');
        return new Response(
          JSON.stringify({
            waveformData: waveform,
            cached: false,
            procedural: true,
            genre: genre || 'trap',
            provider: 'procedural-waveform',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // No promo context and no userId — error
      throw new Error('Missing required fields: userId, audioFileId');
    }

    // ===== STANDARD MODE =====
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

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
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

/**
 * Generate a procedural waveform visualization based on genre/mood.
 * Returns an array of amplitude values (0-1) for rendering.
 */
function generateProceduralWaveform(genre: string, mood: string): number[] {
  const samples = 200;
  const waveform: number[] = [];

  // Seed random from genre string for consistent results per genre
  let seed = 0;
  for (let i = 0; i < genre.length; i++) seed += genre.charCodeAt(i);
  const random = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return (seed / 0x7fffffff);
  };

  // Genre-specific waveform characteristics
  const isHard = ['trap', 'drill', 'dubstep', 'hardstyle'].includes(genre.toLowerCase());
  const isChill = ['lofi', 'ambient', 'jazz', 'r&b', 'soul'].includes(genre.toLowerCase());
  const baseAmplitude = isHard ? 0.7 : isChill ? 0.3 : 0.5;
  const variance = isHard ? 0.3 : isChill ? 0.15 : 0.25;

  for (let i = 0; i < samples; i++) {
    const position = i / samples;

    // Envelope: build up → peak → sustain → tail
    let envelope = 1.0;
    if (position < 0.05) envelope = position / 0.05; // attack
    else if (position > 0.9) envelope = (1 - position) / 0.1; // release

    // Genre-specific patterns
    let value = baseAmplitude;

    // Add beat hits for hard genres
    if (isHard && i % 12 < 3) {
      value += 0.2;
    }

    // Add smoothness for chill genres
    if (isChill) {
      value += Math.sin(position * Math.PI * 4) * 0.1;
    }

    // Random variation
    value += (random() - 0.5) * variance;

    // Apply envelope and clamp
    value = Math.max(0.05, Math.min(1.0, value * envelope));

    waveform.push(Math.round(value * 1000) / 1000);
  }

  return waveform;
}
