import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAuth, authErrorResponse } from '../_shared/auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// MixxCoinz Frequency Coin prompts - Better Dream Method enhanced
const ECONOMY_PROMPTS: Record<string, string> = {
  earned: `Product photography of a premium digital currency coin floating in dramatic space, 8K hyperrealistic.

THE COIN:
- Titanium/gunmetal metal core with precision machined edges like high-end studio equipment
- Surface features holographic concentric frequency rings that pulse outward
- Color gradient: purple (hsl 280) transitioning to cyan (hsl 200) on the rings
- Center emblem: stylized letter "M" constructed from audio waveform peaks
- Edge details: 32 vinyl-groove notches around the circumference like a record rim
- Beveled edge with subtle cyan highlights

LIGHTING & ATMOSPHERE:
- Soft cyan-purple glow emanating from beneath the coin
- Chromatic aberration on edges (light split into rainbow fringe)
- Dark moody background with subtle fog/mist
- Dramatic rim lighting emphasizing the metallic surface

MEANING: This is the Work Coin - earned through creative effort, studio sessions, and community engagement. It represents proof-of-work in the music economy.`,

  purchased: `Product photography of a premium digital currency coin floating in dramatic space, 8K hyperrealistic luxury product photography.

THE COIN:
- Polished gold/brass metal core with warm lustrous finish like investment-grade precious metal
- Surface features geometric gem/diamond facet patterns that catch and refract light
- Sparkle effects on the faceted surfaces representing stored value
- Center emblem: geometric crown or gem symbol (wealth/investment motif)
- Edge details: gold-plated beveled rim with subtle decorative notches
- Mirror-like reflections on the polished surface

LIGHTING & ATMOSPHERE:
- Warm amber-gold glow emanating from beneath the coin
- Golden light rays in the background
- Dark background with subtle gold particle effects
- Dramatic lighting emphasizing the precious metal quality

MEANING: This is the Value Coin - purchased as an investment in creative career growth. It represents financial support for the platform and its creators.`,

  hero: `Two premium digital currency coins floating side by side in dramatic cinematic space, slightly angled toward each other, 8K hyperrealistic.

LEFT COIN (The Work Coin):
- Titanium/gunmetal core with purple-cyan holographic frequency rings
- Waveform "M" emblem in the center
- Cyan-purple glow beneath

RIGHT COIN (The Value Coin):
- Polished gold core with geometric gem facets
- Crown/gem emblem in the center
- Amber-gold glow beneath

BETWEEN THEM:
- Subtle energy bridge of mixed purple and gold particles connecting the two
- Tiny sparks flowing between the coins suggesting synergy
- The coins are equal in size, representing balanced economy

BACKGROUND:
- Dark atmospheric space with fog
- Mixed purple and gold ambient lighting
- Cinematic rim lighting on both coins

MEANING: The Balance - representing the unified economy where earned effort and financial investment work together. This is the hero shot for the Economy page.`,

  celebration: `Dynamic action shot of a digital currency coin (titanium with purple-cyan frequency rings) exploding in celebration, 8K high-speed photography aesthetic.

THE MOMENT:
- Main coin is mid-spin, rotating dynamically
- Burst of particle effects radiating outward from the coin
- Smaller coins (mini versions) exploding away in all directions
- Light fragments and energy waves spiraling outward
- Motion blur on the particles suggesting explosive energy

COLORS:
- Purple, cyan, and gold particles mixed in the explosion
- Energy trails with chromatic aberration
- Bright center point where the burst originates

ATMOSPHERE:
- Dark background illuminated by the burst
- The explosion provides all the lighting
- Euphoric, celebratory, achievement unlocked feeling

MEANING: The Reward Moment - this is what users see when they earn coins, complete missions, or claim rewards. Pure euphoria visualized.`,
};

const ASSET_NAMES: Record<string, string> = {
  earned: 'MixxCoinz Earned - Frequency Coin',
  purchased: 'MixxCoinz Purchased - Value Coin',
  hero: 'MixxCoinz Hero - Dual Coin Display',
  celebration: 'MixxCoinz Celebration - Reward Burst',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { assetType } = await req.json();
    
    if (!assetType || !ECONOMY_PROMPTS[assetType]) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid asset type', 
          validTypes: Object.keys(ECONOMY_PROMPTS) 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prompt = ECONOMY_PROMPTS[assetType];
    const context = `economy_coin_${assetType}`;
    
    console.log(`Generating MixxCoinz asset: ${assetType}`);
    console.log(`Context: ${context}`);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Use Gemini 3 Pro Image for highest quality coin renders
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
            content: prompt,
          },
        ],
        modalities: ['image', 'text'],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please wait a moment and try again.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Usage limit reached. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract image from response
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const textContent = data.choices?.[0]?.message?.content;
    
    if (!imageUrl) {
      console.error('No image in response:', JSON.stringify(data).substring(0, 500));
      return new Response(
        JSON.stringify({ 
          error: 'No image generated',
          message: textContent || 'The AI was unable to generate an image for this prompt.',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully generated ${assetType} coin image`);

    return new Response(
      JSON.stringify({
        imageUrl,
        textContent,
        context,
        assetType,
        assetName: ASSET_NAMES[assetType],
        prompt: prompt.substring(0, 200) + '...',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Generate economy asset error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
