import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createLogger } from "../_shared/logger.ts";

const logger = createLogger("generate-image-gemini");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, style, trackAnalysis } = await req.json();
    
    const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
    
    if (!GOOGLE_AI_API_KEY) {
      logger.error("GOOGLE_AI_API_KEY is not configured");
      throw new Error("GOOGLE_AI_API_KEY is not configured");
    }

    // Build enhanced prompt for album art
    let enhancedPrompt = prompt;
    
    if (style) {
      enhancedPrompt = `${style} style: ${prompt}`;
    }
    
    if (trackAnalysis) {
      const { genre, mood } = trackAnalysis;
      enhancedPrompt = `Create professional album artwork. Genre: ${genre || 'hip-hop'}. Mood: ${mood || 'energetic'}. Style: ${style || 'modern'}. Concept: ${prompt}. High quality, suitable for streaming platforms, visually striking, professional music industry standard.`;
    }

    logger.info("Generating image with Gemini", { prompt: enhancedPrompt.substring(0, 100) });

    // Use Gemini 2.0 Flash with image generation
    const baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${GOOGLE_AI_API_KEY}`;
    
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `Generate a high-quality image: ${enhancedPrompt}` }]
        }],
        generationConfig: {
          responseModalities: ["image", "text"],
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("Gemini Image API error", { status: response.status, error: errorText });
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), 
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`Gemini Image API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract image from response
    const imagePart = data.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
    const textPart = data.candidates?.[0]?.content?.parts?.find((p: any) => p.text);
    
    if (imagePart?.inlineData) {
      const imageUrl = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
      
      logger.info("Image generated successfully");
      
      return new Response(
        JSON.stringify({ 
          imageUrl,
          description: textPart?.text || "Album artwork generated successfully"
        }), 
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If no image, return error with any text response
    return new Response(
      JSON.stringify({ 
        error: "No image generated", 
        message: textPart?.text || "The AI was unable to generate an image for this prompt. Try a different description."
      }), 
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    logger.error("Generate image error", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
