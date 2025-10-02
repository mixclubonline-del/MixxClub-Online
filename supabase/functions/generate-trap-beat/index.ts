import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const SUNO_API_KEY = Deno.env.get('SUNO_API_KEY');

    if (!SUNO_API_KEY) {
      throw new Error('SUNO_API_KEY not configured');
    }

    // Define trap beat prompts for different intensity levels
    const prompts: Record<number, string> = {
      1: "Ambient trap intro, subtle hi-hats, atmospheric pads, minimal, clean, 3 seconds",
      2: "Trap beat buildup, adding bass kicks, rolling hi-hats, building energy, 3 seconds",
      3: "Hard trap beat drop, heavy 808 bass, snare rolls, aggressive hi-hats, energetic, 3 seconds",
      4: "Peak trap intensity, layered percussion, multiple 808s, rapid hi-hats, maximum energy, 3 seconds",
      5: "Epic trap finale, full arrangement, triumphant synths, powerful bass, climactic, 3 seconds"
    };

    const prompt = prompts[intensity] || prompts[1];

    console.log(`Generating trap beat for intensity ${intensity}:`, prompt);

    // Generate music with Suno API
    const generateResponse = await fetch('https://api.sunoapi.com/api/v1/gateway/generate/music', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUNO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: `Trap Beat - Intensity ${intensity}`,
        tags: 'trap, hip hop, instrumental, beat',
        prompt: prompt,
        mv: 'chirp-v3-5',
        continue_clip_id: null,
        continue_at: null
      }),
    });

    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      console.error('Suno API generation error:', errorText);
      throw new Error(`Failed to generate beat: ${generateResponse.status}`);
    }

    const generateData = await generateResponse.json();
    console.log('Generation started:', generateData);

    // Get the task IDs
    const taskIds = generateData.data?.map((item: any) => item.song_id) || [];
    
    if (taskIds.length === 0) {
      throw new Error('No task IDs returned from generation');
    }

    // Poll for completion
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max
    let audioUrl = null;

    while (attempts < maxAttempts && !audioUrl) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      const statusResponse = await fetch(`https://api.sunoapi.com/api/v1/gateway/query?ids=${taskIds.join(',')}`, {
        headers: {
          'Authorization': `Bearer ${SUNO_API_KEY}`,
        },
      });

      if (!statusResponse.ok) {
        console.error('Status check failed:', await statusResponse.text());
        attempts++;
        continue;
      }

      const statusData = await statusResponse.json();
      console.log('Status check:', statusData);

      // Check if any track is complete
      const completedTrack = statusData.data?.find((track: any) => 
        track.status === 'complete' && track.audio_url
      );

      if (completedTrack) {
        audioUrl = completedTrack.audio_url;
        break;
      }

      attempts++;
    }

    if (!audioUrl) {
      throw new Error('Beat generation timed out');
    }

    return new Response(
      JSON.stringify({ 
        audioUrl,
        intensity,
        cached: false
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
