import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { safeErrorResponse } from "../_shared/error-handler.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userTrackUrl, referenceTrackUrl, userTrackName, referenceTrackName } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Simulate spectral analysis (in production, use FFT analysis on actual audio)
    const userMix = {
      lufs: -12.5,
      peak: -0.8,
      stereoWidth: 75,
      dynamicRange: 7.2,
      spectrum: Array.from({ length: 10 }, () => Math.random() * 100), // 10-band spectrum
    };

    const referenceMix = {
      lufs: -14.0,
      peak: -1.0,
      stereoWidth: 85,
      dynamicRange: 9.5,
      spectrum: Array.from({ length: 10 }, () => Math.random() * 100),
    };

    const deltas = {
      lufs: userMix.lufs - referenceMix.lufs,
      peak: userMix.peak - referenceMix.peak,
      stereoWidth: userMix.stereoWidth - referenceMix.stereoWidth,
      dynamicRange: userMix.dynamicRange - referenceMix.dynamicRange,
      spectrum: userMix.spectrum.map((val, i) => val - referenceMix.spectrum[i]),
    };

    const prompt = `Compare these two audio tracks and provide professional mixing advice:

Your Mix: ${userTrackName}
- LUFS: ${userMix.lufs.toFixed(1)} dB
- Peak: ${userMix.peak.toFixed(1)} dBFS
- Stereo Width: ${userMix.stereoWidth}%
- Dynamic Range: ${userMix.dynamicRange.toFixed(1)} dB

Reference Track: ${referenceTrackName}
- LUFS: ${referenceMix.lufs.toFixed(1)} dB
- Peak: ${referenceMix.peak.toFixed(1)} dBFS
- Stereo Width: ${referenceMix.stereoWidth}%
- Dynamic Range: ${referenceMix.dynamicRange.toFixed(1)} dB

Differences:
- LUFS Delta: ${deltas.lufs > 0 ? '+' : ''}${deltas.lufs.toFixed(1)} dB
- Peak Delta: ${deltas.peak > 0 ? '+' : ''}${deltas.peak.toFixed(1)} dB
- Stereo Width Delta: ${deltas.stereoWidth > 0 ? '+' : ''}${deltas.stereoWidth}%
- Dynamic Range Delta: ${deltas.dynamicRange > 0 ? '+' : ''}${deltas.dynamicRange.toFixed(1)} dB

Provide actionable mixing suggestions to match the reference track's characteristics. Focus on:
1. EQ adjustments (specific frequency bands)
2. Compression/dynamics changes
3. Stereo width adjustments
4. Overall loudness recommendations

Return as JSON: {
  "suggestions": [
    {
      "action": "specific action to take",
      "priority": "high"|"medium"|"low",
      "reason": "why this adjustment is needed"
    }
  ],
  "summary": "overall comparison summary"
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: 'You are a professional mixing and mastering engineer. Analyze track comparisons and provide specific, actionable mixing advice. Always respond with valid JSON.' },
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
        return new Response(JSON.stringify({ error: 'AI credits required. Please add funds to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    let comparison;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      comparison = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      comparison = {
        suggestions: [],
        summary: 'Comparison complete. Review metrics for details.',
        error: 'Failed to parse detailed AI response'
      };
    }

    // Add raw metrics to response
    comparison.userMix = userMix;
    comparison.referenceMix = referenceMix;
    comparison.deltas = deltas;

    return new Response(JSON.stringify({ comparison }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in compare-reference-track:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
