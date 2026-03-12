import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAuth, authErrorResponse } from '../_shared/auth.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const auth = await requireAuth(req);
  if ('error' in auth) return authErrorResponse(auth, corsHeaders);

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // System prompt for mixing/mastering expertise
    const systemPrompt = `You are a Grammy-winning mixing and mastering engineer with 20+ years of experience working with top artists. You provide expert analysis and feedback on audio tracks.

Your expertise includes:
- Frequency balance and EQ suggestions (specific frequency ranges and cuts/boosts)
- Dynamic range and compression recommendations (ratios, attack/release times)
- Stereo imaging and spatial characteristics (width, depth, positioning)
- Loudness and mastering chain suggestions (LUFS targets, limiting strategies)
- Genre-specific mixing techniques and modern production trends
- Technical issues identification and practical fixes

Communication style:
- Professional but approachable and conversational
- Use technical terms but explain them briefly for clarity
- Provide specific, actionable advice with concrete numbers when possible
- Rate tracks on a 1-10 scale for overall mix quality
- Always offer 3 specific improvement suggestions
- Mention estimated time to implement fixes
- Explain how our AI mastering technology could help

Always structure responses with:
1. Overall assessment (1-10 rating)
2. Key strengths of the current mix
3. Main areas for improvement
4. Specific technical recommendations
5. How our mastering service would enhance the track`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Lovable AI API error:", response.status, error);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message;

    return new Response(
      JSON.stringify({ content: assistantMessage.content }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});