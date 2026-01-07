import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ ok: false, step: "auth", message: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client as user
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(
        JSON.stringify({ ok: false, step: "auth", message: "Invalid or expired session" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Authenticated user:", user.id);

    // Parse body
    const { imageUrl, assetContext, promptUsed, name, category, setActive = true, deactivateSiblings = false, assetType = 'image', durationSeconds = null, fileSizeBytes = null } = await req.json();

    if (!imageUrl || !assetContext || !name) {
      return new Response(
        JSON.stringify({ ok: false, step: "validation", message: "Missing required fields: imageUrl, assetContext, name" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Processing image for context:", assetContext);

    // Resolve image bytes
    let bytes: Uint8Array;
    let contentType = "image/png";

    if (imageUrl.startsWith("data:image/")) {
      // Data URL
      const match = imageUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.*)$/);
      if (!match) {
        return new Response(
          JSON.stringify({ ok: false, step: "decode", message: "Invalid data URL format" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      contentType = match[1];
      const base64Data = match[2];
      bytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
      console.log("Decoded data URL, bytes:", bytes.length, "type:", contentType);
    } else {
      // Remote URL - fetch server-side (no CORS issues)
      console.log("Fetching remote URL:", imageUrl.substring(0, 100));
      const resp = await fetch(imageUrl);
      if (!resp.ok) {
        return new Response(
          JSON.stringify({ ok: false, step: "download", message: `Failed to fetch image: ${resp.status}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      contentType = resp.headers.get("content-type") || "image/png";
      const arrayBuffer = await resp.arrayBuffer();
      bytes = new Uint8Array(arrayBuffer);
      console.log("Downloaded remote image, bytes:", bytes.length, "type:", contentType);
    }

    // Determine extension
    const ext = contentType.includes("jpeg") || contentType.includes("jpg") 
      ? "jpg" 
      : contentType.includes("webp") 
        ? "webp" 
        : "png";

    const fileName = `${assetContext}_${Date.now()}.${ext}`;
    const filePath = `landing/${fileName}`;

    console.log("Uploading to storage:", filePath);

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from("brand-assets")
      .upload(filePath, bytes, { contentType, upsert: false });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return new Response(
        JSON.stringify({ ok: false, step: "upload", message: uploadError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Upload successful");

    // Get public URL
    const { data: urlData } = supabase.storage.from("brand-assets").getPublicUrl(filePath);
    const publicUrl = urlData.publicUrl;

    console.log("Public URL:", publicUrl);

    // If deactivateSiblings is true, deactivate all other assets with same context
    if (deactivateSiblings && setActive) {
      console.log("Deactivating sibling assets for context:", assetContext);
      const { error: deactivateError } = await supabase
        .from("brand_assets")
        .update({ is_active: false })
        .eq("asset_context", assetContext);
      
      if (deactivateError) {
        console.warn("Failed to deactivate siblings:", deactivateError);
        // Don't fail the whole operation, just log warning
      }
    }

    // Insert into database
    const { data: asset, error: dbError } = await supabase.from("brand_assets").insert({
      name,
      asset_type: assetType,
      storage_path: filePath,
      public_url: publicUrl,
      asset_context: assetContext,
      prompt_used: promptUsed || null,
      category: category || null,
      is_active: setActive,
      created_by: user.id,
      duration_seconds: durationSeconds,
      file_size_bytes: fileSizeBytes,
    }).select().single();

    if (dbError) {
      console.error("DB insert error:", dbError);
      return new Response(
        JSON.stringify({ ok: false, step: "db_insert", message: dbError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Asset saved:", asset.id);

    return new Response(
      JSON.stringify({ ok: true, asset }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ ok: false, step: "unknown", message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
