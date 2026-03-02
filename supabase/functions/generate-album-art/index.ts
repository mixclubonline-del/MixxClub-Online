import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, style, trackAnalysis, genre, mood, character } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Use genre/mood from trackAnalysis or top-level params
    const artGenre = trackAnalysis?.genre || genre || 'electronic';
    const artMood = mood || trackAnalysis?.mood || 'energetic';
    const artStyle = style || 'Modern';

    // Character-aware prompt context
    const charContext = character?.name
      ? `This is associated with the character "${character.name}" (${character.role}).`
      : '';

    const enhancedPrompt = `Create square album artwork for a music release.
Style: ${artStyle}
Genre: ${artGenre}
Mood: ${artMood}
${charContext}
User prompt: ${prompt || `${artGenre} album cover, ${artMood} atmosphere`}

Requirements:
- Square format suitable for album covers
- High quality, professional design
- Vibrant colors and strong visual impact
- No text or typography
- Abstract or representational based on genre`;

    console.log('[AlbumArt] Generating with prompt:', enhancedPrompt.substring(0, 100) + '...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro-image-preview',
        messages: [
          { role: 'user', content: enhancedPrompt }
        ],
        modalities: ['text', 'image']
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits required. Please add funds to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('[AlbumArt] Gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();

    // Primary: Lovable AI gateway format with images array
    let imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    // Fallback 1: OpenAI-style multimodal content array
    if (!imageUrl) {
      const content = data.choices?.[0]?.message?.content;
      if (Array.isArray(content)) {
        const imageContent = content.find((c: any) => c.type === 'image_url');
        imageUrl = imageContent?.image_url?.url;
      }
    }

    // Fallback 2: Gemini native inline data format
    if (!imageUrl) {
      const inlineData = data.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
      if (inlineData?.inlineData) {
        imageUrl = `data:${inlineData.inlineData.mimeType};base64,${inlineData.inlineData.data}`;
      }
    }

    if (!imageUrl) {
      console.error('[AlbumArt] No image in response:', JSON.stringify(data).substring(0, 500));
      throw new Error('No image generated');
    }

    console.log('[AlbumArt] ✅ Image generated successfully');

    return new Response(JSON.stringify({ imageUrl, image_url: imageUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in generate-album-art:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
