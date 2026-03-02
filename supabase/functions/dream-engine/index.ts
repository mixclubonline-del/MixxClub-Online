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
  characterId?: string; // For speech mode: 'prime' | 'jax' | 'rell' | 'nova'
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
    operationId?: string;
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
  demo_phase_: "cinematic documentary photography, emotional storytelling, Mixxclub narrative visual, music industry atmosphere, 8K quality",
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

  // Primary path: Lovable AI gateway format with images array
  const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (imageUrl) {
    return { url: imageUrl, provider: "lovable-gemini-3-pro" };
  }

  // Fallback 1: Check content array format (OpenAI-style multimodal)
  const content = data.choices?.[0]?.message?.content;
  if (Array.isArray(content)) {
    const imageContent = content.find((c: any) => c.type === "image_url");
    if (imageContent?.image_url?.url) {
      return { url: imageContent.image_url.url, provider: "lovable-gemini-3-pro" };
    }
  }

  // Fallback 2: Direct inline data from Gemini native format
  const inlineData = data.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
  if (inlineData?.inlineData) {
    const dataUrl = `data:${inlineData.inlineData.mimeType};base64,${inlineData.inlineData.data}`;
    return { url: dataUrl, provider: "lovable-gemini-3-pro" };
  }

  // Log actual response structure for debugging
  console.error("Unexpected response structure:", JSON.stringify(data).substring(0, 500));
  throw new Error("No image generated in response");
}

async function generateVideo(prompt: string, sourceImage?: string, model?: string): Promise<{ url: string; provider: string; operationId?: string }> {
  // Premium path: VEO 2.0 (async, high quality)
  if (model === 'veo') {
    const googleKey = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!googleKey) {
      throw new Error("GOOGLE_AI_API_KEY not configured for VEO video generation");
    }

    const BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
    const apiUrl = `${BASE_URL}/models/veo-2.0-generate-001:predictLongRunning`;

    const instance: Record<string, unknown> = {
      prompt: `${prompt}. Cinematic quality, professional lighting, smooth motion.`,
    };
    if (sourceImage) {
      instance.image = { uri: sourceImage };
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "x-goog-api-key": googleKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        instances: [instance],
        parameters: { aspectRatio: "16:9", sampleCount: 1 },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("VEO API error:", response.status, errorText);
      throw new Error(`VEO API error: ${response.status}`);
    }

    const data = await response.json();
    const operationName = data.name;
    if (!operationName) {
      throw new Error("VEO did not return an operation name");
    }

    // Return operation ID for async polling
    return { url: "", provider: "veo-2.0", operationId: operationName };
  }

  // Primary path: Replicate (sync, fast)
  const replicateKey = Deno.env.get("REPLICATE_API_KEY");

  if (replicateKey) {
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

  throw new Error("No video generation provider available. Configure REPLICATE_API_KEY or use model='veo'.");
}

async function generateAudio(prompt: string): Promise<{ url: string; provider: string }> {
  const replicateKey = Deno.env.get("REPLICATE_API_KEY");

  if (!replicateKey) {
    throw new Error("Audio generation requires REPLICATE_API_KEY to be configured");
  }

  // Replicate stable-audio-2.5 integration
  console.log("Generating audio with Replicate stable-audio-2.5...");
  const { default: Replicate } = await import("npm:replicate@0.25.2");
  const replicate = new Replicate({ auth: replicateKey });

  const prediction = await replicate.predictions.create({
    model: "stability-ai/stable-audio-2.5",
    input: {
      prompt: `${prompt}. Professional studio quality, clean mix`,
      seconds_total: 30,
      steps: 8,
    },
  });

  // Poll for completion
  let attempts = 0;
  while (attempts < 60) {
    await new Promise(resolve => setTimeout(resolve, 3000));
    const status = await replicate.predictions.get(prediction.id);

    if (status.status === 'succeeded') {
      const audioUrl = typeof status.output === 'string'
        ? status.output
        : Array.isArray(status.output) ? status.output[0] : null;
      if (audioUrl) {
        return { url: audioUrl, provider: "replicate-stable-audio" };
      }
    }

    if (status.status === 'failed' || status.status === 'canceled') {
      throw new Error(`Audio generation failed: ${status.error || status.status}`);
    }
    attempts++;
  }

  throw new Error("Audio generation timed out");
}

// Character voice mapping
const CHARACTER_VOICES: Record<string, string> = {
  prime: 'n2GT0XqyIfmevnaDjYT0',   // OG Hip-hop head, mature mentor
  jax: '6OzrBCQf8cjERkYgzSg8',     // Young energy, artist
  rell: 'CwhRBWXzGAHq8TQ4Fs17',   // Professional, engineer (Roger)
  nova: 'EXAVITQu4vr4xnSDxMaL',   // Expressive, community (Sarah)
};

async function generateSpeech(text: string, characterId?: string): Promise<{ url: string; provider: string }> {
  const elevenLabsKey = Deno.env.get("ELEVEN_LABS_API_KEY");

  if (!elevenLabsKey) {
    throw new Error("Speech generation requires ELEVEN_LABS_API_KEY to be configured.");
  }

  // Select voice based on character, default to Prime
  const voiceId = characterId && CHARACTER_VOICES[characterId]
    ? CHARACTER_VOICES[characterId]
    : CHARACTER_VOICES.prime;

  console.log(`Generating speech with ElevenLabs: voice=${voiceId}, character=${characterId || 'prime'}`);

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "xi-api-key": elevenLabsKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_turbo_v2_5",
        voice_settings: {
          stability: 0.6,
          similarity_boost: 0.8,
          style: 0.4,
          use_speaker_boost: true,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("ElevenLabs error:", errorText);

    if (response.status === 429) {
      throw new Error("Voice generation rate limit. Please try again in a moment.");
    }
    if (response.status === 401) {
      throw new Error("ElevenLabs API key invalid or expired.");
    }

    throw new Error(`Speech generation failed: ${response.status}`);
  }

  // Convert to base64 audio using Deno's encoding
  const audioBuffer = await response.arrayBuffer();
  const uint8Array = new Uint8Array(audioBuffer);

  // Use btoa with chunks to avoid stack overflow
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.slice(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, [...chunk]);
  }
  const base64Audio = btoa(binary);

  return {
    url: `data:audio/mpeg;base64,${base64Audio}`,
    provider: `elevenlabs-${characterId || 'prime'}`
  };
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
    const { mode, prompt, context, sourceAsset, characterId, options } = body;

    if (!mode || !prompt) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing required fields: mode, prompt" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Dream Engine request: mode=${mode}, context=${context}, character=${characterId || 'default'}, user=${user.id}`);

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
        result = await generateVideo(prompt, sourceAsset, options?.model);
        break;
      case 'audio':
        result = await generateAudio(prompt);
        break;
      case 'speech':
        result = await generateSpeech(prompt, characterId);
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
        operationId: 'operationId' in result ? (result as any).operationId : undefined,
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
