import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Replicate from "https://esm.sh/replicate@0.25.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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
        // Stable Video Diffusion - animate a still image
        output = await replicate.run(
          "stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438",
          {
            input: {
              input_image: imageUrl,
              video_length: "14_frames_with_svd",
              sizing_strategy: "maintain_aspect_ratio",
              frames_per_second: 6,
              motion_bucket_id: 127,
              cond_aug: 0.02,
            },
          }
        );
        break;

      case "text-to-video":
        // AnimateDiff for text-to-video
        output = await replicate.run(
          "lucataco/animate-diff:beecf59c4aee8d81bf04f0381033dfa10dc16e845b4ae00d281e2fa377e48571",
          {
            input: {
              prompt: prompt,
              n_prompt: "bad quality, worse quality, low resolution",
              num_frames: 16,
              num_inference_steps: 25,
              guidance_scale: 7.5,
            },
          }
        );
        break;

      case "logo-animation":
        // Use image-to-video for logo animation with subtle motion
        output = await replicate.run(
          "stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438",
          {
            input: {
              input_image: imageUrl,
              video_length: "14_frames_with_svd",
              sizing_strategy: "maintain_aspect_ratio",
              frames_per_second: 8,
              motion_bucket_id: 40, // Lower motion for subtle logo animation
              cond_aug: 0.01,
            },
          }
        );
        break;

      case "studio-ambiance":
        // Generate ambient studio background video
        output = await replicate.run(
          "lucataco/animate-diff:beecf59c4aee8d81bf04f0381033dfa10dc16e845b4ae00d281e2fa377e48571",
          {
            input: {
              prompt: prompt || "cyberpunk music studio interior, neon lights pulsing, mixing console with glowing screens, audio equipment, ambient lighting, professional recording studio, purple and blue neon glow, subtle camera movement",
              n_prompt: "people, faces, text, watermark, low quality",
              num_frames: 24,
              num_inference_steps: 30,
              guidance_scale: 7.5,
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
