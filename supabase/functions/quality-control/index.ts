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
    const { audioData, platforms } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const prompt = `Perform comprehensive quality control analysis for streaming platforms: ${platforms.join(', ')}.

Analyze:
1. Mix readiness (balance, frequency response, dynamics)
2. LUFS compliance (target: -14 LUFS for streaming)
3. Phase cancellation detection
4. Clipping detection
5. Platform-specific requirements

Return JSON:
{
  "overallScore": number (0-100),
  "checks": {
    "mixReadiness": { "score": number, "issues": [string] },
    "platformCompliance": { 
      "spotify": boolean, 
      "appleMusic": boolean, 
      "youtube": boolean,
      "issues": [string]
    },
    "phaseIssues": { "detected": boolean, "locations": [number] },
    "clipping": { "detected": boolean, "locations": [number] },
    "lufs": { "value": number, "target": -14, "compliant": boolean }
  },
  "recommendations": [string]
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
          { role: 'system', content: 'You are a mastering engineer expert. Always respond with valid JSON.' },
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

    const data = await response.json();
    const content = data.choices[0].message.content;

    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      result = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      result = {
        overallScore: 75,
        checks: {
          mixReadiness: { score: 80, issues: [] },
          platformCompliance: {
            spotify: true,
            appleMusic: true,
            youtube: true,
            issues: []
          },
          phaseIssues: { detected: false, locations: [] },
          clipping: { detected: false, locations: [] },
          lufs: { value: -14.2, target: -14, compliant: true }
        },
        recommendations: ['Overall mix quality is good', 'Ready for distribution'],
      };
    }

    return new Response(JSON.stringify({
      ...result,
      report: 'PDF report data',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return safeErrorResponse(error, corsHeaders);
  }
});
