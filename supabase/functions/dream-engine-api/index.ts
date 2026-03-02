import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ActionRequest {
  action: string;
  mode?: string;
  prompt?: string;
  context?: string;
  options?: Record<string, unknown>;
  url?: string;
  name?: string;
  makeActive?: boolean;
  assetId?: string;
  limit?: number;
  prefix?: string;
  description?: string;
  icon?: string;
  [key: string]: unknown;
}

interface ApiResponse {
  ok: boolean;
  error?: string;
  [key: string]: unknown;
}

// deno-lint-ignore no-explicit-any
type SupabaseClientType = any;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase: SupabaseClientType = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const body: ActionRequest = await req.json();
    const { action } = body;

    if (!action) {
      return jsonResponse({ ok: false, error: "Missing 'action' parameter" }, 400);
    }

    console.log(`[dream-engine-api] Action: ${action}`, JSON.stringify(body));

    switch (action) {
      case "list-contexts":
        return await handleListContexts(supabase);

      case "get-live":
        return await handleGetLive(supabase, body.context || "");

      case "get-live-all":
        return await handleGetLiveAll(supabase);

      case "get-capabilities":
        return await handleGetCapabilities();

      case "generate":
        return await handleGenerate(supabase, supabaseUrl, body);

      case "save":
        return await handleSave(supabase, supabaseUrl, body);

      case "set-active":
        return await handleSetActive(supabase, body.assetId || "", body.context || "");

      case "list-history":
        return await handleListHistory(supabase, body);

      case "add-context":
        return await handleAddContext(supabase, body);

      default:
        return jsonResponse({ ok: false, error: `Unknown action: ${action}` }, 400);
    }
  } catch (error) {
    console.error("[dream-engine-api] Error:", error);
    return jsonResponse({
      ok: false,
      error: error instanceof Error ? error.message : "Internal server error",
    }, 500);
  }
});

// ============================================================================
// ACTION HANDLERS
// ============================================================================

async function handleListContexts(supabase: SupabaseClientType): Promise<Response> {
  const { data, error } = await supabase
    .from("asset_contexts")
    .select("*")
    .order("context_prefix");

  if (error) {
    console.error("[list-contexts] Error:", error);
    return jsonResponse({ ok: false, error: error.message }, 500);
  }

  return jsonResponse({ ok: true, contexts: data });
}

async function handleGetLive(
  supabase: SupabaseClientType,
  context: string
): Promise<Response> {
  if (!context) {
    return jsonResponse({ ok: false, error: "Missing 'context' parameter" }, 400);
  }

  const { data, error } = await supabase
    .from("brand_assets")
    .select("*")
    .eq("asset_context", context)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("[get-live] Error:", error);
    return jsonResponse({ ok: false, error: error.message }, 500);
  }

  return jsonResponse({ ok: true, asset: data });
}

async function handleGetLiveAll(supabase: SupabaseClientType): Promise<Response> {
  const { data: contexts, error: ctxError } = await supabase
    .from("asset_contexts")
    .select("context_prefix, name");

  if (ctxError) {
    console.error("[get-live-all] Context error:", ctxError);
    return jsonResponse({ ok: false, error: ctxError.message }, 500);
  }

  const { data: assets, error: assetError } = await supabase
    .from("brand_assets")
    .select("*")
    .eq("is_active", true);

  if (assetError) {
    console.error("[get-live-all] Asset error:", assetError);
    return jsonResponse({ ok: false, error: assetError.message }, 500);
  }

  // deno-lint-ignore no-explicit-any
  const assetMap: Record<string, any> = {};
  for (const asset of assets || []) {
    if (asset.asset_context) {
      assetMap[asset.asset_context] = {
        id: asset.id,
        name: asset.name,
        public_url: asset.public_url,
        asset_type: asset.asset_type,
        prompt_used: asset.prompt_used,
        created_at: asset.created_at,
      };
    }
  }

  return jsonResponse({
    ok: true,
    contexts: contexts || [],
    assets: assetMap,
  });
}

async function handleGetCapabilities(): Promise<Response> {
  const capabilities = {
    image: {
      available: true,
      provider: "lovable-gemini-3-pro",
      description: "AI image generation via Lovable API",
    },
    video: {
      available: !!Deno.env.get("REPLICATE_API_KEY"),
      provider: "replicate-minimax",
      description: "Video generation via Replicate",
    },
    audio: {
      available: !!Deno.env.get("REPLICATE_API_KEY"),
      provider: "replicate-stable-audio",
      description: "Audio/music generation via Replicate (Stable Audio 2.5)",
    },
    speech: {
      available: false,
      provider: "elevenlabs",
      description: "Text-to-speech via ElevenLabs",
      reason: "ElevenLabs connector not linked",
    },
    imageEdit: {
      available: true,
      provider: "lovable-gemini-3-pro",
      description: "Image editing via Lovable API",
    },
  };

  return jsonResponse({ ok: true, capabilities });
}

async function handleGenerate(
  supabase: SupabaseClientType,
  supabaseUrl: string,
  body: ActionRequest
): Promise<Response> {
  const { mode, prompt, context, options } = body;

  if (!mode || !prompt) {
    return jsonResponse({ ok: false, error: "Missing 'mode' or 'prompt'" }, 400);
  }

  const opts = (options || {}) as {
    style?: string;
    save?: boolean;
    makeActive?: boolean;
    name?: string;
    width?: number;
    height?: number;
    duration?: number;
    sourceImageUrl?: string;
  };

  const startTime = Date.now();

  const dreamEngineUrl = `${supabaseUrl}/functions/v1/dream-engine`;
  const dreamEnginePayload = {
    mode,
    prompt,
    context,
    style: opts.style,
    width: opts.width,
    height: opts.height,
    duration: opts.duration,
    sourceImageUrl: opts.sourceImageUrl,
  };

  console.log("[generate] Calling dream-engine:", dreamEnginePayload);

  const response = await fetch(dreamEngineUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
    },
    body: JSON.stringify(dreamEnginePayload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[generate] Dream engine error:", errorText);
    return jsonResponse({ ok: false, error: `Generation failed: ${errorText}` }, 500);
  }

  const result = await response.json();
  const generationTimeMs = Date.now() - startTime;

  console.log("[generate] Result:", { ...result, generationTimeMs });

  // Log to generation_history
  await supabase.from("generation_history").insert({
    mode,
    prompt,
    context: context || null,
    provider: result.provider || "unknown",
    result_url: result.url || result.imageUrl || result.videoUrl,
    generation_time_ms: generationTimeMs,
    metadata: { options: opts, result },
  });

  // Auto-save if requested
  let savedAssetId: string | null = null;
  if (opts.save && (result.url || result.imageUrl || result.videoUrl)) {
    const saveResult = await saveAssetInternal(supabase, supabaseUrl, {
      url: result.url || result.imageUrl || result.videoUrl,
      context: context || "generated_",
      mode,
      prompt,
      name: opts.name || `Generated ${mode} - ${new Date().toISOString()}`,
      makeActive: opts.makeActive || false,
    });
    savedAssetId = saveResult.assetId || null;
  }

  return jsonResponse({
    ok: true,
    result: {
      url: result.url || result.imageUrl || result.videoUrl,
      type: mode,
      context: context || null,
      savedAssetId,
      provider: result.provider || "unknown",
      generationTimeMs,
    },
  });
}

async function handleSave(
  supabase: SupabaseClientType,
  supabaseUrl: string,
  body: ActionRequest
): Promise<Response> {
  const { url, context, mode, prompt, name, makeActive } = body;

  if (!url || !context || !mode) {
    return jsonResponse({ ok: false, error: "Missing url, context, or mode" }, 400);
  }

  const result = await saveAssetInternal(supabase, supabaseUrl, {
    url,
    context,
    mode,
    prompt: prompt || "",
    name: name || `Saved ${mode} - ${new Date().toISOString()}`,
    makeActive: makeActive || false,
  });

  if (!result.ok) {
    return jsonResponse({ ok: false, error: result.error }, 500);
  }

  return jsonResponse({
    ok: true,
    assetId: result.assetId,
    publicUrl: result.publicUrl,
  });
}

async function saveAssetInternal(
  supabase: SupabaseClientType,
  _supabaseUrl: string,
  params: {
    url: string;
    context: string;
    mode: string;
    prompt: string;
    name: string;
    makeActive: boolean;
  }
): Promise<{ ok: boolean; assetId?: string; publicUrl?: string; error?: string }> {
  try {
    const assetResponse = await fetch(params.url);
    if (!assetResponse.ok) {
      throw new Error(`Failed to fetch asset: ${assetResponse.status}`);
    }

    const assetBlob = await assetResponse.blob();
    const arrayBuffer = await assetBlob.arrayBuffer();
    const assetBytes = new Uint8Array(arrayBuffer);

    const contentType = assetResponse.headers.get("content-type") || "image/png";
    let extension = "png";
    if (contentType.includes("jpeg") || contentType.includes("jpg")) extension = "jpg";
    else if (contentType.includes("webp")) extension = "webp";
    else if (contentType.includes("mp4")) extension = "mp4";
    else if (contentType.includes("webm")) extension = "webm";
    else if (contentType.includes("mp3")) extension = "mp3";
    else if (contentType.includes("wav")) extension = "wav";

    const timestamp = Date.now();
    const sanitizedContext = params.context.replace(/[^a-zA-Z0-9_-]/g, "_");
    const storagePath = `dream-engine/${sanitizedContext}/${timestamp}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("brand-assets")
      .upload(storagePath, assetBytes, {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const { data: urlData } = supabase.storage
      .from("brand-assets")
      .getPublicUrl(storagePath);

    const publicUrl = urlData.publicUrl;

    if (params.makeActive) {
      await supabase
        .from("brand_assets")
        .update({ is_active: false })
        .eq("asset_context", params.context);
    }

    const { data: insertData, error: insertError } = await supabase
      .from("brand_assets")
      .insert({
        name: params.name,
        asset_type: params.mode === "video" ? "video" : params.mode === "audio" ? "audio" : "image",
        storage_path: storagePath,
        public_url: publicUrl,
        asset_context: params.context,
        prompt_used: params.prompt,
        is_active: params.makeActive,
        file_size_bytes: assetBytes.length,
      })
      .select("id")
      .single();

    if (insertError) {
      throw new Error(`Insert failed: ${insertError.message}`);
    }

    return {
      ok: true,
      assetId: insertData.id,
      publicUrl,
    };
  } catch (error) {
    console.error("[saveAssetInternal] Error:", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Save failed",
    };
  }
}

async function handleSetActive(
  supabase: SupabaseClientType,
  assetId: string,
  context: string
): Promise<Response> {
  if (!assetId || !context) {
    return jsonResponse({ ok: false, error: "Missing assetId or context" }, 400);
  }

  const { data: currentActive } = await supabase
    .from("brand_assets")
    .select("id")
    .eq("asset_context", context)
    .eq("is_active", true)
    .maybeSingle();

  const previousActiveId = currentActive?.id || null;

  const { error: deactivateError } = await supabase
    .from("brand_assets")
    .update({ is_active: false })
    .eq("asset_context", context);

  if (deactivateError) {
    console.error("[set-active] Deactivate error:", deactivateError);
    return jsonResponse({ ok: false, error: deactivateError.message }, 500);
  }

  const { error: activateError } = await supabase
    .from("brand_assets")
    .update({ is_active: true })
    .eq("id", assetId);

  if (activateError) {
    console.error("[set-active] Activate error:", activateError);
    return jsonResponse({ ok: false, error: activateError.message }, 500);
  }

  return jsonResponse({
    ok: true,
    previousActiveId,
  });
}

async function handleListHistory(
  supabase: SupabaseClientType,
  body: ActionRequest
): Promise<Response> {
  const { limit = 20, context, mode } = body;

  let query = supabase
    .from("generation_history")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(Math.min(limit, 100));

  if (context) {
    query = query.ilike("context", `${context}%`);
  }

  if (mode) {
    query = query.eq("mode", mode);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[list-history] Error:", error);
    return jsonResponse({ ok: false, error: error.message }, 500);
  }

  return jsonResponse({ ok: true, history: data });
}

async function handleAddContext(
  supabase: SupabaseClientType,
  body: ActionRequest
): Promise<Response> {
  const { prefix, name, description, icon } = body;

  if (!prefix || !name) {
    return jsonResponse({ ok: false, error: "Missing prefix or name" }, 400);
  }

  const normalizedPrefix = prefix.endsWith("_") ? prefix : `${prefix}_`;

  const { data: existing } = await supabase
    .from("asset_contexts")
    .select("id")
    .eq("context_prefix", normalizedPrefix)
    .maybeSingle();

  if (existing) {
    return jsonResponse({ ok: false, error: `Context prefix '${normalizedPrefix}' already exists` }, 400);
  }

  const { data, error } = await supabase
    .from("asset_contexts")
    .insert({
      context_prefix: normalizedPrefix,
      name,
      description: description || null,
      icon: icon || null,
    })
    .select()
    .single();

  if (error) {
    console.error("[add-context] Error:", error);
    return jsonResponse({ ok: false, error: error.message }, 500);
  }

  return jsonResponse({ ok: true, context: data });
}

// ============================================================================
// HELPERS
// ============================================================================

function jsonResponse(data: ApiResponse, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}
