import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SCENE_PROMPTS: Record<string, string> = {
  promo_hook: "Cinematic dark moody photo of a young Black male artist alone in a dimly lit bedroom studio, headphones around neck, laptop screen showing unreleased tracks, warm amber LED strip lights, lo-fi aesthetic, streetwear hoodie, scattered notebooks, intimate atmosphere, shallow depth of field, hip-hop culture authentic, 16:9 cinematic",
  promo_answer: "Cinematic photo of a frustrated young Hispanic male artist at a cluttered desk with laptop, crumpled papers, unpaid bills visible, dim harsh overhead light, stressed expression, streetwear outfit, bedroom studio with cheap equipment, moody blue-grey color grading, sense of struggle and isolation, hip-hop culture authentic urban setting, 16:9 cinematic",
  promo_proof: "Futuristic professional recording studio with glowing neon-accented mixing console, holographic-style UI screens floating, dark ambient lighting with electric blue and purple accents, high-tech equipment, sleek modern aesthetic, 2030 vision of music technology, cinematic wide shot, no people, clean and premium feel, 16:9 cinematic",
  promo_culture: "Cinematic photo of a diverse group of young Black and Hispanic creatives collaborating in a professional recording studio, energy and excitement, one person at the mixing board, another with headphones vibing, streetwear fashion, warm golden studio lighting, monitors showing waveforms, authentic hip-hop culture community moment, candid feel, 16:9 cinematic",
  promo_tryit: "Close-up cinematic photo of a young Black male audio engineer at a professional mixing console, hands on faders, multiple monitor screens showing waveforms and spectral analysis, studio monitors glowing, focused expression, headphones on, warm amber and cool blue lighting contrast, professional recording studio, hip-hop culture authentic, 16:9 cinematic",
  promo_cta: "Cinematic aspirational photo of a young Black female artist on a lit concert stage, spotlight from above, crowd silhouettes in background, confident powerful pose, streetwear meets stage fashion, dramatic purple and gold lighting, smoke effects, success and triumph moment, hip-hop culture celebration, wide cinematic framing, 16:9",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Verify admin via auth header
    const authHeader = req.headers.get('authorization');
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Check admin role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (!roleData) {
        return new Response(JSON.stringify({ error: 'Admin access required' }), {
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const { scenes } = await req.json().catch(() => ({ scenes: Object.keys(SCENE_PROMPTS) }));
    const targetScenes = (scenes as string[]).filter(s => s in SCENE_PROMPTS);

    const results: Record<string, string> = {};

    for (const sceneKey of targetScenes) {
      const prompt = SCENE_PROMPTS[sceneKey];

      console.log(`[generate-promo-imagery] Generating: ${sceneKey}`);

      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-image',
          messages: [{ role: 'user', content: `Generate a high-quality cinematic photograph: ${prompt}` }],
          modalities: ['image', 'text'],
        }),
      });

      if (!aiResponse.ok) {
        const errText = await aiResponse.text();
        console.error(`[generate-promo-imagery] AI error for ${sceneKey}: ${aiResponse.status} ${errText}`);
        continue;
      }

      const aiData = await aiResponse.json();
      const imageData = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

      if (!imageData) {
        console.error(`[generate-promo-imagery] No image returned for ${sceneKey}`);
        continue;
      }

      // Extract base64 and upload to storage
      const base64Match = imageData.match(/^data:([^;]+);base64,(.+)$/);
      if (!base64Match) continue;

      const mimeType = base64Match[1];
      const base64 = base64Match[2];
      const ext = mimeType.includes('png') ? 'png' : 'jpg';
      const storagePath = `promo/${sceneKey}_${Date.now()}.${ext}`;

      // Decode base64 to Uint8Array
      const binaryStr = atob(base64);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      const { error: uploadError } = await supabase.storage
        .from('brand-assets')
        .upload(storagePath, bytes, { contentType: mimeType, upsert: true });

      if (uploadError) {
        console.error(`[generate-promo-imagery] Upload error for ${sceneKey}:`, uploadError.message);
        continue;
      }

      const { data: urlData } = supabase.storage.from('brand-assets').getPublicUrl(storagePath);
      const publicUrl = urlData.publicUrl;

      // Deactivate old assets for this context
      await supabase
        .from('brand_assets')
        .update({ is_active: false })
        .eq('asset_context', sceneKey)
        .eq('is_active', true);

      // Insert new asset record
      await supabase.from('brand_assets').insert({
        name: `Promo ${sceneKey} background`,
        asset_type: 'image',
        storage_path: storagePath,
        public_url: publicUrl,
        asset_context: sceneKey,
        is_active: true,
        category: 'promo',
        prompt_used: prompt,
      });

      results[sceneKey] = publicUrl;
      console.log(`[generate-promo-imagery] Done: ${sceneKey}`);
    }

    return new Response(JSON.stringify({ success: true, generated: results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[generate-promo-imagery] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
