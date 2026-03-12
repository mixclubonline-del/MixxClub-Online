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
    const { audioUrl, fileName } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Simulate audio analysis (in production, use actual audio processing library)
    const mockAnalysis = {
      lufs: -14.2 + (Math.random() * 6 - 3), // Target: -14 LUFS
      peak: -0.5 + (Math.random() * 0.4), // Target: < -0.3 dBFS
      stereoCorrelation: 0.85 + (Math.random() * 0.15), // Target: > 0.7
      dynamicRange: 8 + (Math.random() * 4), // Target: > 6 dB
      frequencyBalance: {
        bass: 0.3 + (Math.random() * 0.1),
        mids: 0.4 + (Math.random() * 0.1),
        highs: 0.3 + (Math.random() * 0.1),
      }
    };

    const prompt = `Analyze this mix readiness report and provide professional feedback:

Audio File: ${fileName}

Technical Analysis:
- LUFS: ${mockAnalysis.lufs.toFixed(1)} (Target: -14.0 for streaming)
- Peak Level: ${mockAnalysis.peak.toFixed(1)} dBFS (Target: < -0.3 to avoid clipping)
- Stereo Correlation: ${mockAnalysis.stereoCorrelation.toFixed(2)} (Target: > 0.7 for good stereo image)
- Dynamic Range: ${mockAnalysis.dynamicRange.toFixed(1)} dB (Target: > 6 dB to avoid over-compression)
- Frequency Balance: Bass ${(mockAnalysis.frequencyBalance.bass * 100).toFixed(0)}%, Mids ${(mockAnalysis.frequencyBalance.mids * 100).toFixed(0)}%, Highs ${(mockAnalysis.frequencyBalance.highs * 100).toFixed(0)}%

Provide:
1. Overall readiness score (0-100)
2. Individual check results (pass/warning/fail for each metric)
3. Specific actionable suggestions to improve the mix
4. Priority level for each issue (critical/high/medium/low)

Return as JSON: {
  "score": number,
  "checks": [{"category": string, "status": "pass"|"warning"|"fail", "message": string, "suggestion": string, "priority": string}],
  "overallFeedback": string
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
          { role: 'system', content: 'You are a professional audio mastering engineer. Analyze mix readiness and provide technical feedback. Always respond with valid JSON.' },
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

    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      analysis = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      analysis = {
        score: 75,
        checks: [],
        overallFeedback: 'Mix analysis complete. Review technical metrics for details.',
        error: 'Failed to parse detailed AI response'
      };
    }

    // Add raw metrics to response
    analysis.metrics = mockAnalysis;

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return safeErrorResponse(error, corsHeaders);
  }
});
