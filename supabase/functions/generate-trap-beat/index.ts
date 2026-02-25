import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Replicate from "https://esm.sh/replicate@0.25.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { intensity } = await req.json();
    const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');

    if (!REPLICATE_API_KEY) {
      throw new Error('REPLICATE_API_KEY not configured');
    }

    const replicate = new Replicate({ auth: REPLICATE_API_KEY });

    // Define trap beat prompts for different intensity levels
    const prompts: Record<number, string> = {
      1: "Ambient trap intro, subtle hi-hats, atmospheric pads, minimal, clean, 140 BPM",
      2: "Trap beat buildup, 808 bass kicks, rolling hi-hats, building energy, dark atmosphere, 140 BPM",
      3: "Hard trap beat drop, heavy 808 bass, snare rolls, aggressive hi-hats, energetic, 150 BPM",
      4: "Peak trap intensity, layered percussion, multiple 808 patterns, rapid hi-hats, maximum energy, 150 BPM",
      5: "Epic trap finale, full arrangement, triumphant synths, powerful 808 bass, climactic drop, 160 BPM",
    };

    const prompt = prompts[intensity] || prompts[1];

    console.log(`Generating trap beat for intensity ${intensity} via Replicate:`, prompt);

    // Use Replicate's stability-ai/stable-audio-2.5 for instrumental generation
    const prediction = await replicate.predictions.create({
      model: "stability-ai/stable-audio-2.5",
      input: {
        prompt: `${prompt}. Trap instrumental, no vocals, professional mix, studio quality`,
        seconds_total: 10,
        steps: 100,
      },
    });

    console.log("Replicate prediction created:", prediction.id, prediction.status);

    // Poll for completion (stable-audio is relatively fast)
    let attempts = 0;
    const maxAttempts = 60;
    let audioUrl = null;

    while (attempts < maxAttempts && !audioUrl) {
      await new Promise(resolve => setTimeout(resolve, 3000));

      const status = await replicate.predictions.get(prediction.id);
      console.log(`Poll ${attempts + 1}: ${status.status}`);

      if (status.status === 'succeeded') {
        // stable-audio-2.5 returns the audio URL as the output
        audioUrl = typeof status.output === 'string'
          ? status.output
          : Array.isArray(status.output)
            ? status.output[0]
            : null;
        break;
      }

      if (status.status === 'failed' || status.status === 'canceled') {
        throw new Error(`Beat generation failed: ${status.error || status.status}`);
      }

      attempts++;
    }

    if (!audioUrl) {
      throw new Error('Beat generation timed out');
    }

    return new Response(
      JSON.stringify({
        audioUrl,
        audio_url: audioUrl, // backward compat for orchestrator
        intensity,
        cached: false,
        provider: 'replicate-stable-audio',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error generating trap beat:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
