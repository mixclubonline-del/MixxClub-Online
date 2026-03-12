import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAuth, authErrorResponse } from '../_shared/auth.ts';
import { safeErrorResponse } from '../_shared/error-handler.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Generate Video via Google VEO 2.0 (Async)
 * 
 * Uses the Gemini API predictLongRunning endpoint.
 * Returns an operation ID immediately — caller must poll via check-video-status.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const auth = await requireAuth(req);
  if ('error' in auth) return authErrorResponse(auth, corsHeaders);

  try {
    const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!GOOGLE_AI_API_KEY) {
      throw new Error("GOOGLE_AI_API_KEY is not configured");
    }

    const { prompt, imageUrl, aspectRatio, sampleCount } = await req.json();
    
    if (!prompt) {
      throw new Error("Prompt is required");
    }

    console.log("VEO video generation request:", { 
      prompt: prompt.substring(0, 100), 
      hasImageUrl: !!imageUrl,
      aspectRatio: aspectRatio || "16:9",
      sampleCount: sampleCount || 1
    });

    const BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
    // VEO 3.1 is available via Gemini API without GCP billing requirement
    const MODEL_ID = "veo-3.1-generate-preview";
    const apiUrl = `${BASE_URL}/models/${MODEL_ID}:predictLongRunning`;

    // Build request body
    const instance: Record<string, unknown> = {
      prompt: `${prompt}. Cinematic quality, professional lighting, smooth motion.`,
    };

    // Image-to-video: include source image reference
    if (imageUrl) {
      instance.image = { uri: imageUrl };
    }

    const requestBody = {
      instances: [instance],
      parameters: {
        aspectRatio: aspectRatio || "16:9",
        sampleCount: sampleCount || 1,
      },
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "x-goog-api-key": GOOGLE_AI_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("VEO API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 403) {
        return new Response(
          JSON.stringify({ success: false, error: "VEO API access denied. Check API key permissions." }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`VEO API error: ${response.status} - ${errorText.substring(0, 200)}`);
    }

    const data = await response.json();
    console.log("VEO operation response:", JSON.stringify(data).substring(0, 500));

    // VEO returns an operation name for polling
    const operationName = data.name;
    if (!operationName) {
      throw new Error("VEO did not return an operation name");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        operationName,
        message: "Video generation started. Poll check-video-status for completion.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error in generate-video-gemini:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage, success: false }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
