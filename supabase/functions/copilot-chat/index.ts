import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createLogger } from "../_shared/logger.ts";

const logger = createLogger("copilot-chat");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      logger.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are the AI Copilot for MixClub, a professional music production CRM platform.

Your role is to help users with:
- Project recommendations based on deadlines, priority, and workload
- Mixing and mastering workflow advice
- Tips for improving audio quality and production techniques
- Navigation assistance within the platform
- Collaboration suggestions and best practices
- Time management and project organization

Be concise, friendly, professional, and actionable. Provide specific, practical advice.
When suggesting actions, be clear about the next steps.`;

    logger.info("Sending request to Lovable AI", { messageCount: messages.length });

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
        stream: true,
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

    logger.info("Streaming response started");

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    logger.error("Copilot chat error", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
