import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Replicate from "https://esm.sh/replicate@0.25.2";
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
      keyPrefix: 'video-gen'
    }, supabaseUrl, supabaseKey);

    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.', success: false }),
        { status: 429, headers: { ...corsHeaders, ...rateLimitHeaders(rateLimit), 'Content-Type': 'application/json' } }
      );
    }

    const REPLICATE_API_KEY = Deno.env.get("REPLICATE_API_KEY");
    if (!REPLICATE_API_KEY) {
      throw new Error("REPLICATE_API_KEY is not configured");
    }

    const replicate = new Replicate({ auth: REPLICATE_API_KEY });
    const body = await req.json();
    const { type, prompt, imageUrl, duration = 4 } = body;

    console.log("Video generation request:", { type, prompt, imageUrl, duration });

    let output;

    switch (type) {
      case "image-to-video":
        // Use minimax video-01 for image-to-video
        output = await replicate.run(
          "minimax/video-01",
          {
            input: {
              prompt: prompt || "Smooth cinematic animation with subtle movement",
              first_frame_image: imageUrl,
            },
          }
        );
        break;

      case "text-to-video":
        // Use minimax video-01 for text-to-video
        output = await replicate.run(
          "minimax/video-01",
          {
            input: {
              prompt: prompt,
            },
          }
        );
        break;

      case "logo-animation":
        // Use minimax for logo animation with subtle motion
        output = await replicate.run(
          "minimax/video-01",
          {
            input: {
              prompt: "Subtle logo animation, gentle glow effect, professional brand reveal, minimal movement",
              first_frame_image: imageUrl,
            },
          }
        );
        break;

      case "studio-ambiance":
        // Generate ambient studio background video
        output = await replicate.run(
          "minimax/video-01",
          {
            input: {
              prompt: prompt || "Cyberpunk music studio interior, neon lights pulsing rhythmically, mixing console with glowing screens, professional recording equipment, purple and blue ambient lighting, cinematic atmosphere",
            },
          }
        );
        break;

      default:
        throw new Error(`Unknown video type: ${type}`);
    }

    console.log("Video generation output:", output);

    return new Response(JSON.stringify({ output, success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error in generate-video:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage, success: false }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
