import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AdCopyRequest {
  platform: 'google' | 'facebook' | 'tiktok' | 'instagram';
  targetAudience?: string;
  budgetRange?: string;
  genre?: string;
  tone?: string;
  variantCount?: number;
  prompt_context?: string;
  character?: { name: string; role: string; tone: string };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const {
      platform = 'instagram',
      targetAudience = 'independent musicians',
      budgetRange = '$50-100',
      genre = 'all genres',
      tone = 'professional and inspiring',
      variantCount = 5,
      prompt_context,
      character,
    }: AdCopyRequest = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const platformSpecs: Record<string, { headline: number; description: number }> = {
      google: { headline: 30, description: 90 },
      facebook: { headline: 40, description: 125 },
      instagram: { headline: 40, description: 125 },
      tiktok: { headline: 25, description: 100 },
    };

    const specs = platformSpecs[platform] || platformSpecs.facebook;

    const charContext = character
      ? `\nBrand Voice: ${character.name} (${character.role}) — ${character.tone}`
      : '';

    const campaignContext = prompt_context
      ? `\nCampaign: ${prompt_context}`
      : '';

    const prompt = `Generate ${variantCount} compelling ad copy variants for MixxClub, an online platform connecting musicians with professional audio engineers.

Platform: ${platform}
Target Audience: ${targetAudience}
Budget Range: ${budgetRange}
Genre Focus: ${genre}
Tone: ${tone}${charContext}${campaignContext}

Ad Character Limits:
- Headline: ${specs.headline} characters
- Description: ${specs.description} characters

Key Value Props:
- Professional mixing/mastering starting at $29
- Get matched with perfect engineer in 60 seconds
- Pay only when satisfied
- Top-rated engineers (4.8+ stars)
- Fast turnaround (24-48 hours)

Generate ${variantCount} unique ad variants with:
1. Headline (under ${specs.headline} chars)
2. Description (under ${specs.description} chars)
3. Call-to-action (under 20 chars)

Format as JSON array with objects containing: headline, description, cta, focus (what pain point it addresses)`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3.1',
        messages: [
          { role: 'system', content: 'You are a music industry advertising expert. Always respond with valid JSON arrays.' },
          { role: 'user', content: prompt }
        ],
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
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices[0].message.content;

    // Parse JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    let adVariants = [];

    if (jsonMatch) {
      adVariants = JSON.parse(jsonMatch[0]);
    } else {
      // Fallback if AI doesn't return JSON
      adVariants = [
        {
          headline: 'Professional Mixing From $29',
          description: 'Get studio-quality sound without the studio price. Match with top engineers in 60 seconds.',
          cta: 'Get Matched Now',
          focus: 'Affordability',
        },
      ];
    }

    console.log(`Generated ${adVariants.length} ad copy variants for ${platform}`);

    return new Response(JSON.stringify({ variants: adVariants, platform, generated_at: new Date().toISOString() }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error generating ad copy:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
