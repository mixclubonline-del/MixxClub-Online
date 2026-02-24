import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.21.0';

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
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const {
      platform,
      targetAudience = 'independent musicians',
      budgetRange = '$50-100',
      genre = 'all genres',
      tone = 'professional and inspiring',
      variantCount = 5,
    }: AdCopyRequest = await req.json();

    // Using OPENAI_API_KEY for Google AI (this is intentional - using same key)
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash' });

    const platformSpecs: Record<string, { headline: number; description: number }> = {
      google: { headline: 30, description: 90 },
      facebook: { headline: 40, description: 125 },
      instagram: { headline: 40, description: 125 },
      tiktok: { headline: 25, description: 100 },
    };

    const specs = platformSpecs[platform] || platformSpecs.facebook;

    const prompt = `Generate ${variantCount} compelling ad copy variants for MixClub, an online platform connecting musicians with professional audio engineers.

Platform: ${platform}
Target Audience: ${targetAudience}
Budget Range: ${budgetRange}
Genre Focus: ${genre}
Tone: ${tone}

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

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

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
