import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DreamRequest {
  mode: 'image' | 'video' | 'audio' | 'speech' | 'image-edit';
  prompt: string;
  context?: string;
  sourceAsset?: string;
  options?: {
    model?: string;
    style?: string;
    save?: boolean;
    makeActive?: boolean;
    name?: string;
  };
}

interface DreamResponse {
  ok: boolean;
  asset?: {
    url: string;
    type: string;
    context?: string;
    savedAssetId?: string;
  };
  provider?: string;
  generationTimeMs?: number;
  error?: string;
}

// Style presets for prompt enhancement
const stylePresets: Record<string, string> = {
  cinematic: "cinematic lighting, dramatic atmosphere, film quality, 8K resolution, professional photography",
  product: "product photography, clean white background, studio lighting, commercial quality",
  portrait: "portrait photography, soft lighting, shallow depth of field, professional headshot",
  abstract: "abstract art, flowing shapes, vibrant colors, modern aesthetic",
  technical: "technical illustration, clean lines, detailed schematic, professional diagram",
  gaming: "game art style, vibrant colors, dynamic action, high detail fantasy",
  neon: "neon lighting, cyberpunk aesthetic, glowing effects, dark background with vibrant accents",
};

// Context-specific prompt enhancements
const contextEnhancements: Record<string, string> = {
  economy_: "premium currency design, metallic sheen, collectible coin aesthetic, gaming economy visual",
  landing_: "hero image, website banner, professional marketing, eye-catching composition",
  prime_: "AI assistant character, friendly professional, tech-forward aesthetic",
  studio_: "music studio environment, professional audio workspace, creative atmosphere",
  unlock_: "celebration visual, achievement unlocked, reward moment, confetti and glow",
  badge_: "achievement badge design, icon style, clean emblem, award aesthetic",
};

async function generateImage(prompt: string, context?: string, style?: string): Promise<{ url: string; provider: string }> {
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!lovableApiKey) {
    throw new Error("LOVABLE_API_KEY not configured");
  }

  // Build enhanced prompt
  let enhancedPrompt = prompt;
  
  // Add style preset if specified
  if (style && stylePresets[style]) {
    enhancedPrompt = `${enhancedPrompt}. Style: ${stylePresets[style]}`;
  }
  
  // Add context enhancement if applicable
  if (context) {
    const prefix = Object.keys(contextEnhancements).find(p => context.startsWith(p));
    if (prefix) {
      enhancedPrompt = `${enhancedPrompt}. ${contextEnhancements[prefix]}`;
    }
  }

  console.log("Generating image with prompt:", enhancedPrompt.substring(0, 100) + "...");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${lovableApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-pro-image-preview",
      messages: [
        {
          role: "user",
          content: enhancedPrompt,
        },
      ],
      modalities: ["text", "image"],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Lovable AI error:", errorText);
    throw new Error(`Image generation failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (Array.isArray(content)) {
    const imageContent = content.find((c: any) => c.type === "image_url");
    if (imageContent?.image_url?.url) {
      return { url: imageContent.image_url.url, provider: "lovable-gemini-3-pro" };
    }
  }

  throw new Error("No image generated in response");
}

async function generateVideo(prompt: string, sourceImage?: string): Promise<{ url: string; provider: string }> {
  const replicateKey = Deno.env.get("REPLICATE_API_KEY");
  
  if (replicateKey) {
    // Use Replicate for video generation
    const { default: Replicate } = await import("npm:replicate@0.25.2");
    const replicate = new Replicate({ auth: replicateKey });
    
    const input: Record<string, unknown> = {
      prompt,
      num_frames: 49,
    };
    
    if (sourceImage) {
      input.first_frame_image = sourceImage;
    }
    
    console.log("Generating video with Replicate...");
    const output = await replicate.run(
      "minimax/video-01",
      { input }
    );
    
    if (typeof output === "string") {
      return { url: output, provider: "replicate-minimax" };
    }
    if (Array.isArray(output) && output[0]) {
      return { url: output[0], provider: "replicate-minimax" };
    }
    
    throw new Error("Replicate did not return video URL");
  }
  
  // Fallback: Use Lovable AI Veo if available
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!lovableApiKey) {
    throw new Error("No video generation provider available. Configure REPLICATE_API_KEY.");
  }
  
  // Try Lovable AI video generation
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${lovableApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/veo-3.1",
      messages: [{ role: "user", content: prompt }],
    }),
  });
  
  if (!response.ok) {
    throw new Error("Video generation not available through Lovable AI");
  }
  
  const data = await response.json();
  // Parse video URL from response
  const videoUrl = data.choices?.[0]?.message?.content;
  if (typeof videoUrl === "string" && videoUrl.startsWith("http")) {
    return { url: videoUrl, provider: "lovable-veo" };
  }
  
  throw new Error("Video generation failed");
}

async function generateAudio(prompt: string): Promise<{ url: string; provider: string }> {
  const sunoKey = Deno.env.get("SUNO_API_KEY");
  
  if (!sunoKey) {
    throw new Error("Audio generation requires SUNO_API_KEY to be configured");
  }
  
  // Suno API integration
  console.log("Generating audio with Suno...");
  const response = await fetch("https://api.suno.ai/v1/generations", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${sunoKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      duration: 30,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Suno API error: ${response.status}`);
  }
  
  const data = await response.json();
  if (data.audio_url) {
    return { url: data.audio_url, provider: "suno" };
  }
  
  throw new Error("Audio generation failed");
}

async function generateSpeech(text: string): Promise<{ url: string; provider: string }> {
  // For now, return error until ElevenLabs is connected
  throw new Error("Speech generation requires ElevenLabs connector. Please link it in settings.");
}

async function saveAsset(
  supabase: any,
  userId: string,
  url: string,
  context: string,
  mode: string,
  prompt: string,
  name?: string,
  makeActive?: boolean
): Promise<string> {
  // Determine asset type
  const assetType = mode === 'video' ? 'video' : mode === 'audio' ? 'audio' : 'image';
  
  // Call save-brand-asset function
  const { data, error } = await supabase.functions.invoke('save-brand-asset', {
    body: {
      imageUrl: url,
      assetContext: context,
      promptUsed: prompt,
      name: name || `${context}_${Date.now()}`,
      assetType,
      setActive: makeActive ?? false,
      deactivateSiblings: makeActive ?? false,
    },
  });
  
  if (error || !data?.ok) {
    console.error("Save asset error:", error || data);
    throw new Error(data?.message || "Failed to save asset");
  }
  
  return data.asset.id;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ ok: false, error: "Invalid or expired session" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: DreamRequest = await req.json();
    const { mode, prompt, context, sourceAsset, options } = body;

    if (!mode || !prompt) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing required fields: mode, prompt" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Dream Engine request: mode=${mode}, context=${context}, user=${user.id}`);

    let result: { url: string; provider: string };

    switch (mode) {
      case 'image':
        result = await generateImage(prompt, context, options?.style);
        break;
      case 'image-edit':
        if (!sourceAsset) {
          throw new Error("image-edit mode requires sourceAsset");
        }
        result = await generateImage(`${prompt}. Reference image: ${sourceAsset}`, context, options?.style);
        break;
      case 'video':
        result = await generateVideo(prompt, sourceAsset);
        break;
      case 'audio':
        result = await generateAudio(prompt);
        break;
      case 'speech':
        result = await generateSpeech(prompt);
        break;
      default:
        throw new Error(`Unknown mode: ${mode}`);
    }

    const generationTimeMs = Date.now() - startTime;

    // Save to generation history
    const { data: historyData, error: historyError } = await supabase.from("generation_history").insert({
      user_id: user.id,
      mode,
      prompt,
      context: context || null,
      provider: result.provider,
      result_url: result.url,
      generation_time_ms: generationTimeMs,
    }).select().single();

    if (historyError) {
      console.warn("Failed to save generation history:", historyError);
    }

    // Auto-save if requested
    let savedAssetId: string | undefined;
    if (options?.save && context) {
      savedAssetId = await saveAsset(
        supabase,
        user.id,
        result.url,
        context,
        mode,
        prompt,
        options.name,
        options.makeActive
      );

      // Update history with saved asset ID
      if (historyData?.id) {
        await supabase.from("generation_history")
          .update({ saved_asset_id: savedAssetId })
          .eq("id", historyData.id);
      }
    }

    const response: DreamResponse = {
      ok: true,
      asset: {
        url: result.url,
        type: mode === 'video' ? 'video' : mode === 'audio' ? 'audio' : 'image',
        context,
        savedAssetId,
      },
      provider: result.provider,
      generationTimeMs,
    };

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    console.error("Dream Engine error:", err);
    
    return new Response(
      JSON.stringify({ ok: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
