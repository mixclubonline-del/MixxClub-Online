import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders } from '../_shared/cors.ts';
import { safeErrorResponse } from '../_shared/error-handler.ts';

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { trackData, analysisType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (analysisType) {
      case "mix":
        systemPrompt = "You are an expert mixing engineer. Analyze the track data and provide specific, actionable mixing suggestions.";
        userPrompt = `Analyze this track mix data and provide suggestions:\n${JSON.stringify(trackData, null, 2)}`;
        break;
      case "master":
        systemPrompt = "You are an expert mastering engineer. Provide professional mastering advice.";
        userPrompt = `Provide mastering suggestions for this track:\n${JSON.stringify(trackData, null, 2)}`;
        break;
      case "arrangement":
        systemPrompt = "You are an expert music producer. Analyze arrangement and structure.";
        userPrompt = `Analyze the arrangement of this project:\n${JSON.stringify(trackData, null, 2)}`;
        break;
      default:
        systemPrompt = "You are a helpful music production assistant.";
        userPrompt = JSON.stringify(trackData);
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "provide_mixing_suggestions",
              description: "Provide specific mixing suggestions for tracks",
              parameters: {
                type: "object",
                properties: {
                  suggestions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        track: { type: "string" },
                        parameter: { type: "string" },
                        currentValue: { type: "number" },
                        suggestedValue: { type: "number" },
                        reason: { type: "string" },
                        priority: { type: "string", enum: ["low", "medium", "high"] }
                      },
                      required: ["track", "parameter", "reason", "priority"]
                    }
                  }
                },
                required: ["suggestions"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "provide_mixing_suggestions" } }
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
          JSON.stringify({ error: "Payment required. Please add credits to your Lovable workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (toolCall) {
      const suggestions = JSON.parse(toolCall.function.arguments);
      return new Response(
        JSON.stringify(suggestions),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ suggestions: [] }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
