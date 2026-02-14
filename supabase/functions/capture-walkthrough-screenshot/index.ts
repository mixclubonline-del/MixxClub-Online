import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SITE_BASE = "https://mixxclub.lovable.app";

const VIEWPORT_CONFIG: Record<string, { width: number; crop: number }> = {
  desktop: { width: 1920, crop: 1080 },
  mobile: { width: 390, crop: 844 },
};

function sanitizePath(path: string): string {
  return path
    .replace(/^\//, "")
    .replace(/\//g, "-")
    .replace(/[^a-zA-Z0-9\-_]/g, "")
    || "home";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ ok: false, message: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    // Verify user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ ok: false, message: "Invalid or expired session" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Admin check
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ ok: false, message: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Parse body
    const body = await req.json();
    const path: string = body.path;
    const viewport: string = body.viewport || "desktop";
    const name: string = body.name || `Walkthrough - ${path}`;

    if (!path || typeof path !== "string") {
      return new Response(
        JSON.stringify({ ok: false, message: "Missing required field: path" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const config = VIEWPORT_CONFIG[viewport];
    if (!config) {
      return new Response(
        JSON.stringify({ ok: false, message: `Invalid viewport: ${viewport}. Use 'desktop' or 'mobile'.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const targetUrl = `${SITE_BASE}${path.startsWith("/") ? path : "/" + path}`;
    const thumbUrl = `https://image.thum.io/get/width/${config.width}/crop/${config.crop}/noanimate/${targetUrl}`;

    console.log("Capturing screenshot:", thumbUrl);

    // Fetch screenshot from thum.io
    const imgResp = await fetch(thumbUrl);
    if (!imgResp.ok) {
      const errText = await imgResp.text();
      console.error("thum.io error:", imgResp.status, errText);
      return new Response(
        JSON.stringify({ ok: false, message: `Screenshot service returned ${imgResp.status}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const contentType = imgResp.headers.get("content-type") || "image/png";
    const bytes = new Uint8Array(await imgResp.arrayBuffer());
    console.log("Screenshot downloaded:", bytes.length, "bytes");

    // Build filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const sanitized = sanitizePath(path);
    const ext = contentType.includes("jpeg") || contentType.includes("jpg") ? "jpg" : "png";
    const filePath = `walkthrough/${sanitized}_${viewport}_${timestamp}.${ext}`;

    // Upload to storage using service role for reliability
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { error: uploadError } = await serviceClient.storage
      .from("brand-assets")
      .upload(filePath, bytes, { contentType, upsert: false });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return new Response(
        JSON.stringify({ ok: false, message: uploadError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Get public URL
    const { data: urlData } = serviceClient.storage
      .from("brand-assets")
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;
    console.log("Uploaded:", publicUrl);

    // Insert into brand_assets
    const { data: asset, error: dbError } = await serviceClient
      .from("brand_assets")
      .insert({
        name,
        asset_type: "image",
        storage_path: filePath,
        public_url: publicUrl,
        asset_context: "walkthrough",
        is_active: true,
        created_by: user.id,
        file_size_bytes: bytes.length,
        metadata: { path, viewport, captured_at: new Date().toISOString() },
      })
      .select()
      .single();

    if (dbError) {
      console.error("DB insert error:", dbError);
      return new Response(
        JSON.stringify({ ok: false, message: dbError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log("Asset saved:", asset.id);

    return new Response(
      JSON.stringify({ ok: true, asset }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ ok: false, message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
