import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, trackData, sessionData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case "mix-analysis":
        systemPrompt = `You are an expert mixing engineer with 20+ years of experience in hip-hop and R&B production. Analyze the provided track data and provide specific, actionable mixing recommendations. Focus on:
- Frequency balance and EQ suggestions
- Compression settings (attack, release, ratio, threshold)
- Spatial placement (panning, reverb, delay)
- Level adjustments
- Effects chain recommendations
Keep responses concise, technical, and actionable.`;
        userPrompt = `Analyze this track and provide mixing recommendations:
Track Type: ${trackData.type}
Current Volume: ${trackData.volume}
Peak Level: ${trackData.peakLevel}
RMS Level: ${trackData.rmsLevel}
Analysis: ${JSON.stringify(trackData.analysis || {})}`;
        break;

      case "mastering-suggestions":
        systemPrompt = `You are a mastering engineer specializing in hip-hop and R&B. Provide specific mastering chain recommendations including:
- Target LUFS levels
- EQ adjustments for final polish
- Multiband compression settings
- Limiting/maximizing approach
- Reference track comparisons
Be specific with numbers and settings.`;
        userPrompt = `Provide mastering recommendations for this session:
Tempo: ${sessionData.tempo} BPM
Tracks: ${sessionData.trackCount}
Master Peak: ${sessionData.masterPeak}
Genre: Hip-Hop/R&B`;
        break;

      case "vocal-enhancement":
        systemPrompt = `You are a vocal production specialist for hip-hop and R&B. Provide specific vocal enhancement recommendations including:
- De-essing settings
- Vocal rider/compression
- EQ for presence and clarity
- Saturation/harmonic enhancement
- Auto-tune/pitch correction settings
- Reverb and delay for depth
Focus on modern hip-hop and R&B vocal production techniques.`;
        userPrompt = `Provide vocal enhancement recommendations for:
${JSON.stringify(trackData)}`;
        break;

      case "creative-suggestion":
        systemPrompt = `You are a creative music producer. Suggest innovative effects, arrangements, or production techniques that could enhance the track. Think outside the box but keep it practical and implementable.`;
        userPrompt = `Suggest creative enhancements for:
Track: ${trackData.name} (${trackData.type})
Current effects: ${JSON.stringify(trackData.effects || [])}`;
        break;

      default:
        systemPrompt = "You are a helpful AI music production assistant.";
        userPrompt = JSON.stringify(trackData);
    }

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
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const suggestion = data.choices?.[0]?.message?.content;

    return new Response(
      JSON.stringify({ suggestion }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("AI Studio Assistant error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
