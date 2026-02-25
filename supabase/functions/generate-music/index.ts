import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { prompt, genre, mood, duration, generateType } = await req.json();
    const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');

    if (!REPLICATE_API_KEY) {
      throw new Error('REPLICATE_API_KEY not configured');
    }

    const replicate = new Replicate({ auth: REPLICATE_API_KEY });

    // Build prompt with genre/mood context
    const isInstrumental = generateType === 'beat' || generateType === 'melody';
    const musicPrompt = `${isInstrumental ? '[Instrumental] [No vocals] ' : ''}${prompt}. Genre: ${genre}. Mood: ${mood}. Professional studio quality.`;

    console.log(`Generating music via Replicate (type: ${generateType}):`, musicPrompt);

    // Use stable-audio-2.5 for instrumentals, minimax/music-1.5 for full songs
    const model = isInstrumental
      ? "stability-ai/stable-audio-2.5"
      : "minimax/music-1.5";

    const input = isInstrumental
      ? {
        prompt: musicPrompt,
        seconds_total: Math.min(duration || 30, 180), // stable-audio max 3 min
        steps: 8,
      }
      : {
        prompt: musicPrompt,
        song_duration: duration || 30,
      };

    // Create async prediction
    const prediction = await replicate.predictions.create({
      model,
      input,
    });

    console.log("Replicate prediction created:", prediction.id, prediction.status);

    // Poll for completion
    let attempts = 0;
    const maxAttempts = 120; // 6 minutes max
    let audioUrl = null;

    while (attempts < maxAttempts && !audioUrl) {
      await new Promise(resolve => setTimeout(resolve, 3000));

      const status = await replicate.predictions.get(prediction.id);

      if (status.status === 'succeeded') {
        audioUrl = typeof status.output === 'string'
          ? status.output
          : Array.isArray(status.output)
            ? status.output[0]
            : null;
        break;
      }

      if (status.status === 'failed' || status.status === 'canceled') {
        throw new Error(`Music generation failed: ${status.error || status.status}`);
      }

      attempts++;
    }

    if (!audioUrl) {
      throw new Error('Music generation timed out');
    }

    return new Response(JSON.stringify({
      audioUrl,
      audio_url: audioUrl,
      status: 'complete',
      provider: `replicate-${isInstrumental ? 'stable-audio' : 'minimax-music'}`,
      message: 'Music generation complete.',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in generate-music:', error);

    if (error.message?.includes('Rate limit') || error.status === 429) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
