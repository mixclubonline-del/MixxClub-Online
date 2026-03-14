import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, filename } = await req.json();

    if (!prompt || !filename) {
      return new Response(
        JSON.stringify({ error: 'prompt and filename are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log(`[generate-promo-image] Generating: ${filename}`);

    // Call Lovable AI gateway with image generation model
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro-image-preview',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        modalities: ['image', 'text'],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error(`[generate-promo-image] AI gateway error ${aiResponse.status}:`, errText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please wait and try again.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits required. Please add funds.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const imageData = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const description = aiData.choices?.[0]?.message?.content || '';

    if (!imageData) {
      return new Response(
        JSON.stringify({ error: 'No image generated', description }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract base64 data
    const base64Match = imageData.match(/^data:image\/(png|jpeg|webp);base64,(.+)$/);
    if (!base64Match) {
      throw new Error('Invalid image data format');
    }

    const mimeType = `image/${base64Match[1]}`;
    const ext = base64Match[1] === 'jpeg' ? 'jpg' : base64Match[1];
    const rawBase64 = base64Match[2];

    // Decode base64 to Uint8Array
    const binaryString = atob(rawBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Upload to brand-assets bucket
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const storagePath = `promo-campaign/${filename}.${ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('brand-assets')
      .upload(storagePath, bytes, {
        contentType: mimeType,
        upsert: true,
        cacheControl: '31536000',
      });

    if (uploadError) {
      console.error('[generate-promo-image] Upload error:', uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('brand-assets')
      .getPublicUrl(storagePath);

    // Save to brand_assets table
    await supabaseAdmin.from('brand_assets').insert({
      name: filename,
      asset_type: 'image',
      category: 'promotional',
      storage_path: storagePath,
      public_url: urlData.publicUrl,
      asset_context: 'promo_campaign',
      is_active: true,
      prompt_used: prompt.substring(0, 500),
    });

    console.log(`[generate-promo-image] Success: ${storagePath}`);

    return new Response(
      JSON.stringify({
        url: urlData.publicUrl,
        storagePath,
        description,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[generate-promo-image] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An internal error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
