import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { analysisType, userData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    let prompt = '';

    switch (analysisType) {
      case 'pricing':
        prompt = `Analyze this service data and recommend optimal pricing:
        
Service Type: ${userData.serviceType || 'Mixing'}
Years Experience: ${userData.yearsExperience || 0}
Average Project Duration: ${userData.avgDuration || 'N/A'}
Current Price: ${userData.currentPrice || 'N/A'}
Completed Projects: ${userData.completedProjects || 0}
Average Rating: ${userData.avgRating || 'N/A'}
Location: ${userData.location || 'N/A'}

Provide:
1. Recommended price range (min-max)
2. Justification based on experience and market
3. Upsell opportunities (additional services to offer)
4. Competitor benchmarks

Return as JSON: {
  "recommendedPrice": { "min": number, "max": number },
  "justification": string,
  "upsellOpportunities": [string],
  "marketBenchmark": string
}`;
        break;

      case 'forecast':
        prompt = `Analyze this business data and forecast revenue:

Monthly Projects: ${JSON.stringify(userData.monthlyProjects || [])}
Average Project Value: ${userData.avgProjectValue || 0}
Client Retention Rate: ${userData.retentionRate || 0}%
Pipeline Projects: ${userData.pipelineProjects || 0}
Seasonal Trends: ${userData.seasonality || 'Unknown'}

Provide:
1. Next 3 months revenue forecast
2. Growth recommendations
3. Risk factors
4. Opportunities

Return as JSON: {
  "forecast": [{ "month": string, "projected": number, "confidence": string }],
  "recommendations": [string],
  "risks": [string],
  "opportunities": [string]
}`;
        break;

      case 'trends':
        prompt = `Analyze music industry trends and provide insights:

User Genre: ${userData.primaryGenre || 'General'}
Services Offered: ${JSON.stringify(userData.services || [])}
Target Market: ${userData.targetMarket || 'Independent Artists'}

Provide:
1. Current trending genres/styles
2. Emerging production techniques
3. Market demand shifts
4. Competitive landscape

Return as JSON: {
  "trendingGenres": [{ "name": string, "growth": string }],
  "techniques": [string],
  "demandShifts": [string],
  "competitiveInsights": [string]
}`;
        break;

      default:
        throw new Error('Invalid analysis type');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3.1',
        messages: [
          { role: 'system', content: 'You are a business consultant specializing in audio production and music industry economics. Always respond with valid JSON.' },
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
      analysis = { error: 'Failed to parse AI response', rawResponse: content };
    }

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in business-analytics:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
