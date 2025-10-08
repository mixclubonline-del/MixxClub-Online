import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createLogger } from "../_shared/logger.ts";

const logger = createLogger("analyze-melody");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audioFeatures, trackContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      logger.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // System prompt for melody analysis specialized in hip-hop and R&B
    const systemPrompt = `You are an expert music theory AI specializing in melody analysis for auto-tune systems.
Your expertise focuses on hip-hop and R&B vocal production.

Analyze the provided audio features and return precise melody context that will be used for real-time pitch correction.

Key responsibilities:
- Identify melodic patterns and phrases
- Detect melodic movement (stepwise, leaps, ornamentations)
- Recognize common hip-hop/R&B melodic patterns (pentatonic runs, blue notes, vocal inflections)
- Suggest optimal pitch correction behavior for different melodic contexts
- Identify emotional intensity and performance style

Return structured analysis that helps the auto-tune engine adapt to the melody, not just the key.`;

    const userPrompt = `Analyze this audio for melody context:

Audio Features:
- Spectral Centroid: ${audioFeatures.spectralCentroid} Hz
- Zero Crossing Rate: ${audioFeatures.zeroCrossingRate}
- Frequency Peaks: ${JSON.stringify(audioFeatures.frequencyPeaks)}
- RMS Energy: ${audioFeatures.rmsEnergy}
- Pitch Variance: ${audioFeatures.pitchVariance}

Track Context:
- Key: ${trackContext.key}
- Scale: ${trackContext.scale}
- BPM: ${trackContext.bpm || 'unknown'}
- Genre: ${trackContext.genre || 'hip-hop/R&B'}

Provide melody analysis with:
1. Melodic pattern type (sustained, stepwise, ornamental, melismatic, rapped)
2. Recommended correction strength (0-1)
3. Speed adaptation factor (0-1)
4. Humanize factor (0-1)
5. Melodic context description
6. Performance style notes`;

    logger.info("Sending melody analysis request to Lovable AI");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_melody",
              description: "Return melody analysis for auto-tune adaptation",
              parameters: {
                type: "object",
                properties: {
                  pattern_type: {
                    type: "string",
                    enum: ["sustained", "stepwise", "ornamental", "melismatic", "rapped", "mixed"]
                  },
                  correction_strength: {
                    type: "number",
                    description: "0-1 value for how aggressively to correct pitch"
                  },
                  speed_factor: {
                    type: "number",
                    description: "0-1 value for correction speed adaptation"
                  },
                  humanize_factor: {
                    type: "number",
                    description: "0-1 value for preserving natural variations"
                  },
                  context_description: {
                    type: "string",
                    description: "Brief description of the melodic context"
                  },
                  style_notes: {
                    type: "string",
                    description: "Notes about performance style and recommendations"
                  },
                  detected_phrases: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        start_time: { type: "number" },
                        pattern: { type: "string" },
                        intensity: { type: "string", enum: ["low", "medium", "high"] }
                      }
                    }
                  }
                },
                required: ["pattern_type", "correction_strength", "speed_factor", "humanize_factor", "context_description", "style_notes"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "analyze_melody" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        logger.warn("Rate limit exceeded");
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded. Please try again in a moment." }), 
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        logger.warn("Payment required");
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits to your workspace." }), 
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      logger.error("AI gateway error", { status: response.status, error: errorText });
      return new Response(
        JSON.stringify({ error: "AI gateway error" }), 
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    const toolCall = data.choices[0].message.tool_calls?.[0];
    
    if (toolCall && toolCall.function.name === "analyze_melody") {
      const analysis = JSON.parse(toolCall.function.arguments);
      logger.info("Melody analysis complete", { patternType: analysis.pattern_type });
      
      return new Response(
        JSON.stringify({ analysis }), 
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    throw new Error("No valid melody analysis returned");

  } catch (error) {
    logger.error("Melody analysis error", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
