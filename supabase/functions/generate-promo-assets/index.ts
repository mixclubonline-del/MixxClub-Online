import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SceneConfig {
  context: string;
  name: string;
  prompt: string;
}

const SCENES: SceneConfig[] = [
  {
    context: "promo_hook",
    name: "Promo Hook — The Problem",
    prompt:
      "Cinematic 16:9 background image. Frustrated independent music artist alone in a dimly lit bedroom studio, headphones draped around neck, staring at a laptop screen showing a rejected upload notification. Raw, emotional, introspective. Purple-tinted shadows cast by a single warm desk lamp. Shallow depth of field, film grain, 8K quality. Cyberpunk aesthetic with subtle purple and cyan color palette. No text or UI overlays. Ultra high resolution.",
  },
  {
    context: "promo_answer",
    name: "Promo Answer — The Solution",
    prompt:
      "Cinematic 16:9 background image. Split-screen composition: left side shows a smartphone uploading a music track with a glowing cyan progress bar, right side shows a professional mixing engineer in a high-end studio nodding approvingly at monitors showing waveforms. The two halves connected by flowing light trails in cyan and purple. Dark environment, dramatic volumetric lighting, 8K quality. Cyberpunk aesthetic. No text or UI overlays. Ultra high resolution.",
  },
  {
    context: "promo_proof",
    name: "Promo Proof — The Evidence",
    prompt:
      "Cinematic 16:9 background image. Close-up macro shot of a professional studio mixing console with glowing VU meters peaking into the green-yellow range, dual widescreen monitors behind showing audio waveforms and spectrograms. Dramatic rim lighting, shallow depth of field, bokeh. Cyberpunk color palette with purple and cyan neon reflections on brushed metal fader surfaces. 8K quality. No text or UI overlays. Ultra high resolution.",
  },
  {
    context: "promo_tryit",
    name: "Promo Try It — Interactive Demo",
    prompt:
      "Cinematic 16:9 background image. Hands hovering over a futuristic holographic audio interface in mid-air, dragging a glowing music file icon into a pulsing AI processing ring. Particles of sound visualized as cyan light streams radiating outward. Dark professional studio environment, dramatic volumetric purple lighting from above. 8K quality. No text or UI overlays. Ultra high resolution.",
  },
  {
    context: "promo_culture",
    name: "Promo Culture — The Community",
    prompt:
      "Cinematic 16:9 background image. Diverse group of young musicians and producers gathered in a neon-lit underground studio lounge. Some wearing headphones, one working on a beat pad controller, another sketching album art on a tablet. Purple and cyan ambient lighting from LED strips, authentic streetwear fashion, candid relaxed energy. Community vibe, warm camaraderie. 8K quality, film grain. No text or UI overlays. Ultra high resolution.",
  },
  {
    context: "promo_cta",
    name: "Promo CTA — The Invitation",
    prompt:
      "Cinematic 16:9 background image. Epic wide establishing shot of a futuristic music city skyline at golden hour, a massive holographic glowing logo floating above the tallest building casting purple light downward. Flying vehicles leaving cyan light trails across the sky, atmospheric mist in lower levels between buildings. Cinematic matte painting style, purple and gold color palette. 8K quality. No text or UI overlays. Ultra high resolution.",
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const results: Record<string, { success: boolean; error?: string; assetId?: string }> = {};

    for (const scene of SCENES) {
      try {
        console.log(`[generate-promo-assets] Generating: ${scene.context}`);

        // 1. Call Lovable AI gateway for image generation
        const aiResponse = await fetch(
          "https://ai.gateway.lovable.dev/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-3-pro-image-preview",
              messages: [
                { role: "user", content: scene.prompt },
              ],
              modalities: ["image", "text"],
            }),
          }
        );

        if (!aiResponse.ok) {
          const errText = await aiResponse.text();
          throw new Error(`AI gateway ${aiResponse.status}: ${errText.substring(0, 200)}`);
        }

        const aiData = await aiResponse.json();
        const imageObj = aiData.choices?.[0]?.message?.images?.[0];

        if (!imageObj?.image_url?.url) {
          throw new Error("No image returned from AI gateway");
        }

        // 2. Decode base64 image
        const dataUrl: string = imageObj.image_url.url;
        const match = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
        if (!match) {
          throw new Error("Invalid image data URL format");
        }
        const mimeType = match[1];
        const base64Data = match[2];
        const ext = mimeType === "image/png" ? "png" : "jpg";
        const binaryStr = atob(base64Data);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }

        // 3. Upload to brand-assets bucket
        const storagePath = `promo/${scene.context}_${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("brand-assets")
          .upload(storagePath, bytes, {
            contentType: mimeType,
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Storage upload failed: ${uploadError.message}`);
        }

        // 4. Get public URL
        const { data: urlData } = supabase.storage
          .from("brand-assets")
          .getPublicUrl(storagePath);

        const publicUrl = urlData.publicUrl;

        // 5. Deactivate previous assets with same context
        await supabase
          .from("brand_assets")
          .update({ is_active: false })
          .eq("asset_context", scene.context)
          .eq("is_active", true);

        // 6. Insert new brand_asset record
        const { data: assetData, error: insertError } = await supabase
          .from("brand_assets")
          .insert({
            name: scene.name,
            asset_type: "image",
            storage_path: storagePath,
            public_url: publicUrl,
            asset_context: scene.context,
            is_active: true,
            category: "promo",
            prompt_used: scene.prompt,
            file_size_bytes: bytes.length,
          })
          .select("id")
          .single();

        if (insertError) {
          throw new Error(`DB insert failed: ${insertError.message}`);
        }

        results[scene.context] = { success: true, assetId: assetData.id };
        console.log(`[generate-promo-assets] ✓ ${scene.context} — ${assetData.id}`);
      } catch (sceneError) {
        const msg = sceneError instanceof Error ? sceneError.message : String(sceneError);
        console.error(`[generate-promo-assets] ✗ ${scene.context}:`, msg);
        results[scene.context] = { success: false, error: msg };
      }
    }

    const succeeded = Object.values(results).filter((r) => r.success).length;
    const failed = Object.values(results).filter((r) => !r.success).length;

    return new Response(
      JSON.stringify({ summary: { succeeded, failed, total: SCENES.length }, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[generate-promo-assets] Fatal:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
