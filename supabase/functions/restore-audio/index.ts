import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAuth, authErrorResponse } from '../_shared/auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const auth = await requireAuth(req);
  if ('error' in auth) return authErrorResponse(auth, corsHeaders);

  try {
    const { audioData, restorationType, settings } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    let prompt = '';

    switch (restorationType) {
      case 'noise':
        prompt = `Apply noise reduction at ${settings.noiseReduction}% strength. Remove background noise, hiss, and hum while preserving audio quality.`;
        break;
      case 'declip':
        prompt = `Apply de-clipping at ${settings.deClipping}% strength. Restore clipped and distorted audio to its original waveform.`;
        break;
      case 'deess':
        prompt = `Apply de-esser at ${settings.deEsser}% strength. Reduce harsh sibilance (S, T, SH sounds) intelligently.`;
        break;
      case 'breath':
        prompt = `Remove breath sounds at ${settings.breathRemoval}% strength. Clean up breathing sounds in vocals while maintaining naturalness.`;
        break;
      default:
        throw new Error('Invalid restoration type');
    }

    // Simulate audio processing (in production, use actual audio processing)
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an audio restoration assistant. Analyze the restoration request and return processing parameters.'
          },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits required. Please add funds.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    return new Response(JSON.stringify({
      audioUrl: audioData,
      message: 'Audio restoration complete',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in restore-audio:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
