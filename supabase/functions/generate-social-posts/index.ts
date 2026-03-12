import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAuth, authErrorResponse } from '../_shared/auth.ts';
import { safeErrorResponse } from '../_shared/error-handler.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const auth = await requireAuth(req);
  if ('error' in auth) return authErrorResponse(auth, corsHeaders);

  try {
    const { trackName, genre, mood, vibe, additionalDetails, targetPlatform } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const platforms = targetPlatform === 'all' || !targetPlatform
      ? ['instagram', 'twitter', 'tiktok', 'facebook']
      : [targetPlatform];

    const prompt = `Generate 3 variations of social media posts for each platform: ${platforms.join(', ')}

Track Details:
- Name: ${trackName}
- Genre: ${genre || 'Not specified'}
- Mood: ${mood || 'Not specified'}
- Vibe: ${vibe || 'Not specified'}
${additionalDetails ? `- Additional: ${additionalDetails}` : ''}

Platform Guidelines:
- Instagram: Engaging caption with emojis, 5-10 relevant hashtags, call-to-action
- Twitter: Concise hook (under 280 chars), 2-3 hashtags, conversational tone
- TikTok: Catchy hook, trending language, 3-5 hashtags, encourage interaction
- Facebook: Longer storytelling format, personal touch, link preview friendly

Return as JSON: {"instagram": [variation1, variation2, variation3], "twitter": [...], ...}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: 'You are a social media marketing expert for musicians. Always respond with valid JSON.' },
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
    const content = data.choices[0].message.content;

    let posts;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      posts = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      posts = { error: 'Failed to parse AI response' };
    }

    return new Response(JSON.stringify({ posts }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return safeErrorResponse(error, corsHeaders);
  }
});
