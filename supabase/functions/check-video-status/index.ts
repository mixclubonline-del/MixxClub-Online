import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { safeErrorResponse } from "../_shared/error-handler.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Check VEO Video Generation Status
 * 
 * Polls a VEO operation by name. When complete, downloads the video
 * and uploads to Lovable Cloud storage for a permanent public URL.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!GOOGLE_AI_API_KEY) {
      throw new Error("GOOGLE_AI_API_KEY is not configured");
    }

    const { operationName } = await req.json();
    if (!operationName) {
      throw new Error("operationName is required");
    }

    console.log("Checking VEO operation status:", operationName);

    const BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
    const pollUrl = `${BASE_URL}/${operationName}`;

    const response = await fetch(pollUrl, {
      method: "GET",
      headers: {
        "x-goog-api-key": GOOGLE_AI_API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("VEO poll error:", response.status, errorText);
      throw new Error(`VEO poll failed: ${response.status}`);
    }

    const data = await response.json();
    console.log("VEO operation status:", JSON.stringify(data).substring(0, 500));

    // Operation still running
    if (!data.done) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          done: false,
          message: "Video still generating...",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Operation complete — extract video
    const generatedVideos = data.response?.generateVideoResponse?.generatedSamples 
      || data.response?.generatedSamples
      || [];

    if (generatedVideos.length === 0) {
      // Check for error in operation
      if (data.error) {
        throw new Error(`VEO generation failed: ${data.error.message || JSON.stringify(data.error)}`);
      }
      throw new Error("VEO returned no generated videos");
    }

    // Get the first video URI
    const videoFile = generatedVideos[0]?.video;
    if (!videoFile?.uri) {
      throw new Error("No video URI in VEO response");
    }

    const videoUri = videoFile.uri;
    console.log("VEO video ready, downloading from:", videoUri);

    // Download the video from Google's temporary URI
    const videoResponse = await fetch(videoUri, {
      headers: {
        "x-goog-api-key": GOOGLE_AI_API_KEY,
      },
    });

    if (!videoResponse.ok) {
      throw new Error(`Failed to download video: ${videoResponse.status}`);
    }

    const videoBuffer = await videoResponse.arrayBuffer();
    const videoBytes = new Uint8Array(videoBuffer);
    console.log(`Downloaded video: ${videoBytes.length} bytes`);

    // Upload to Lovable Cloud storage
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const fileName = `veo-${Date.now()}.mp4`;
    const storagePath = `generated-videos/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("brand-assets")
      .upload(storagePath, videoBytes, {
        contentType: "video/mp4",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      // Fall back to returning the temporary Google URI
      return new Response(
        JSON.stringify({
          success: true,
          done: true,
          videoUrl: videoUri,
          provider: "veo-2.0",
          storageFallback: true,
          message: "Video ready (temporary URL — storage upload failed)",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get public URL
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
        provider: "veo-2.0",
        message: "Video generation complete",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error in check-video-status:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage, success: false }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
