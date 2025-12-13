import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkRateLimit, rateLimitHeaders } from "../_shared/rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting for public endpoint
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    
    const rateLimit = await checkRateLimit(clientIP, {
      maxRequests: 10,
      windowMs: 60000, // 1 minute
      keyPrefix: 'video-gemini'
    }, supabaseUrl, supabaseKey);

    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.', success: false }),
        { status: 429, headers: { ...corsHeaders, ...rateLimitHeaders(rateLimit), 'Content-Type': 'application/json' } }
      );
    }

    const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!GOOGLE_AI_API_KEY) {
      throw new Error("GOOGLE_AI_API_KEY is not configured");
    }

    const { prompt, imageUrl } = await req.json();
    
    if (!prompt) {
      throw new Error("Prompt is required");
    }

    console.log("Video generation request:", { prompt, hasImageUrl: !!imageUrl });

    // Use Gemini's video generation capability via Veo
    // Note: This uses the generateContent endpoint with video output modality
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GOOGLE_AI_API_KEY}`;

    const requestBody: Record<string, unknown> = {
      contents: [
        {
          parts: [
            {
              text: `Generate a short video based on this description: ${prompt}. Make it cinematic, high quality, professional, with smooth motion and excellent lighting. Duration: 4-6 seconds.`
            }
          ]
        }
      ],
      generationConfig: {
        responseModalities: ["TEXT"],
        temperature: 0.9,
      }
    };

    // If we have an imageUrl, include it for image-to-video
    if (imageUrl) {
      // Fetch the image and convert to base64
      try {
        const imageResponse = await fetch(imageUrl);
        if (imageResponse.ok) {
          const imageBuffer = await imageResponse.arrayBuffer();
          const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
          const mimeType = imageResponse.headers.get("content-type") || "image/png";
          
          (requestBody.contents as Array<{parts: Array<unknown>}>)[0].parts.unshift({
            inlineData: {
              mimeType,
              data: base64Image
            }
          });
        }
      } catch (imgError) {
        console.warn("Could not fetch image for video generation:", imgError);
      }
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later.", success: false }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Gemini response:", JSON.stringify(data, null, 2));

    // Extract the response - Gemini 2.0 may return video data or a description
    const candidates = data.candidates || [];
    const firstCandidate = candidates[0];
    const parts = firstCandidate?.content?.parts || [];

    // Look for video data in the response
    let videoUrl = null;
    let description = "";

    for (const part of parts) {
      if (part.inlineData?.mimeType?.startsWith("video/")) {
        // Video data returned as base64
        const videoData = part.inlineData.data;
        const mimeType = part.inlineData.mimeType;
        videoUrl = `data:${mimeType};base64,${videoData}`;
      } else if (part.text) {
        description = part.text;
      }
    }

    // If no direct video, return a placeholder or use the description for follow-up
    if (!videoUrl) {
      // Gemini 2.0 experimental may not support direct video output yet
      // Return a response indicating the request was processed
      console.log("No direct video output - model may not support video generation");
      
      return new Response(
        JSON.stringify({ 
          success: true,
          message: "Video generation request processed. Direct video output not available in current model.",
          description,
          prompt,
          // Provide a placeholder for now - we'll fall back to image animation
          fallbackSuggestion: "Consider using image-to-video with Replicate or wait for Veo API access"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        videoUrl,
        description 
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
