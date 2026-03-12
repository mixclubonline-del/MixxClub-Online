import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Replicate from "https://esm.sh/replicate@0.25.2";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { safeErrorResponse } from "../_shared/error-handler.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Check Replicate Video Prediction Status
 *
 * Polls a Replicate prediction by ID. When complete, downloads the video
 * and uploads to storage for a permanent public URL.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const REPLICATE_API_KEY = Deno.env.get("REPLICATE_API_KEY");
    if (!REPLICATE_API_KEY) {
      throw new Error("REPLICATE_API_KEY is not configured");
    }

    const { predictionId } = await req.json();
    if (!predictionId) {
      throw new Error("predictionId is required");
    }

    console.log("Checking Replicate prediction:", predictionId);

    const replicate = new Replicate({ auth: REPLICATE_API_KEY });
    const prediction = await replicate.predictions.get(predictionId);

    console.log("Prediction status:", prediction.status);

    // Still processing
    if (prediction.status === "starting" || prediction.status === "processing") {
      return new Response(
        JSON.stringify({
          success: true,
          done: false,
          status: prediction.status,
          message: "Video still generating...",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Failed
    if (prediction.status === "failed" || prediction.status === "canceled") {
      throw new Error(`Prediction ${prediction.status}: ${prediction.error || "Unknown error"}`);
    }

    // Succeeded — extract video URL
    const output = prediction.output;
    let videoUrl: string | null = null;

    if (typeof output === "string") {
      videoUrl = output;
    } else if (Array.isArray(output) && output.length > 0) {
      videoUrl = output[0];
    } else if (output && typeof output === "object" && "url" in output) {
      videoUrl = (output as { url: string }).url;
    }

    if (!videoUrl) {
      throw new Error("Replicate returned no video URL");
    }

    console.log("Video ready, downloading from:", videoUrl);

    // Download and re-upload to storage for permanence
    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok) {
      // Fallback: return Replicate's temporary URL
      return new Response(
        JSON.stringify({
          success: true,
          done: true,
          videoUrl,
          provider: "replicate",
          storageFallback: true,
          message: "Video ready (temporary URL)",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const videoBuffer = await videoResponse.arrayBuffer();
    const videoBytes = new Uint8Array(videoBuffer);
    console.log(`Downloaded video: ${videoBytes.length} bytes`);

    // Upload to storage
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const fileName = `replicate-${Date.now()}.mp4`;
    const storagePath = `generated-videos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("brand-assets")
      .upload(storagePath, videoBytes, {
        contentType: "video/mp4",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return new Response(
        JSON.stringify({
          success: true,
          done: true,
          videoUrl,
          provider: "replicate",
          storageFallback: true,
          message: "Video ready (temporary URL — storage upload failed)",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from("brand-assets")
      .getPublicUrl(storagePath);

    const permanentUrl = publicUrlData.publicUrl;
    console.log("Video uploaded to storage:", permanentUrl);

    return new Response(
      JSON.stringify({
        success: true,
        done: true,
        videoUrl: permanentUrl,
        storagePath,
        provider: "replicate",
        message: "Video generation complete",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error in check-replicate-video:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage, success: false }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
