import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAuth, authErrorResponse } from '../_shared/auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced cinematic prompt engineering
function enhancePrompt(prompt: string, context: string): string {
  const cinematicPrefix = `Create a stunning, ultra high-resolution cinematic image. Professional photography quality, dramatic lighting, rich color grading, film-like atmosphere. `;
  
  const contextEnhancements: Record<string, string> = {
    origin: `Style: Epic origin story visual. Dark, moody, atmospheric with hints of golden light breaking through. Think Blade Runner meets renaissance painting. `,
    people: `Style: Powerful human portrait or group composition. Dramatic rim lighting, emotional depth, documentary-style authenticity with artistic flair. `,
    sound: `Style: Abstract audio visualization. Flowing energy, sound waves made visible, synesthesia-inspired colors, dynamic motion frozen in time. `,
    future: `Style: Visionary futuristic aesthetic. Sleek, hopeful, technological wonder. Clean lines meeting organic forms, aspirational yet grounded. `,
  };

  const contextHint = contextEnhancements[context] || '';
  const qualitySuffix = ` Ultra high resolution, 8K quality, masterpiece composition, award-winning photography.`;

  return `${cinematicPrefix}${contextHint}${prompt}${qualitySuffix}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const auth = await requireAuth(req);
  if ('error' in auth) return authErrorResponse(auth, corsHeaders);

  try {
    const { prompt, context } = await req.json();
    
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Enhance the prompt with cinematic direction
    const enhancedPrompt = enhancePrompt(prompt, context || 'origin');

    console.log(`[LandingForge] Context: ${context}`);
    console.log(`[LandingForge] Original prompt: ${prompt.substring(0, 80)}...`);
    console.log(`[LandingForge] Enhanced prompt: ${enhancedPrompt.substring(0, 120)}...`);

    const startTime = Date.now();

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro-image-preview',
        messages: [
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    const elapsed = Date.now() - startTime;
    console.log(`[LandingForge] API response in ${elapsed}ms, status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[LandingForge] API error: ${response.status} - ${errorText}`);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Usage limit reached. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Image generation failed. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();

    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const textContent = data.choices?.[0]?.message?.content;

    if (!imageUrl) {
      console.error('[LandingForge] No image in response:', JSON.stringify(data).substring(0, 500));
      return new Response(
        JSON.stringify({ error: 'No image generated. Try a different prompt.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[LandingForge] ✓ Image generated successfully for "${context}" in ${elapsed}ms`);

    return new Response(
      JSON.stringify({
        imageUrl,
        textContent,
        context,
        model: 'gemini-3-pro-image-preview',
        generationTimeMs: elapsed
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[LandingForge] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
