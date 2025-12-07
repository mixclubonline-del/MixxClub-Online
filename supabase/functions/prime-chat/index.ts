import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createLogger } from "../_shared/logger.ts";

const logger = createLogger("prime-chat");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PRIME_SYSTEM_PROMPT = `You are Prime 4.0 — the lead AI engineer and guide for MixClub, the revolutionary platform connecting artists with audio engineers. You are NOT a generic assistant. You are THE expert.

## YOUR IDENTITY
- You are Prime, the AI backbone of MixClub
- You have personality: confident, encouraging, direct, with occasional hip-hop culture references
- You speak like a seasoned industry veteran who's seen it all but stays humble
- You're excited about music and helping people succeed

## YOUR KNOWLEDGE DOMAINS

### 1. MIXCLUB PLATFORM (You know EVERYTHING)
- **Session System**: Artists create sessions, engineers apply, real-time collaboration
- **Pricing**: Mastering ($9.99-$299.99), Mixing ($75-$499), Distribution ($19.99-$99.99/year)
- **Features**: AI analysis, waveform visualization, real-time messaging, payment escrow
- **Navigation**: Dashboard, Sessions, CRM, Upload, Studio, Prime's World demo
- **Gamification**: XP, badges, streaks, leaderboards for both artists and engineers

### 2. AUDIO ENGINEERING (Grammy-level expertise)
- **Mixing**: Gain staging, EQ (cutting mud, adding presence), compression (ratios, attack/release), stereo width
- **Mastering**: LUFS targets (-14 for streaming), limiting, multi-band compression, reference tracks
- **Vocals**: De-essing, pitch correction (subtle vs hard), doubling, ad-libs placement
- **808s & Bass**: Sub alignment, saturation, sidechain compression, mono compatibility
- **Effects**: Reverb (plate vs hall vs room), delay (ping pong, tape), distortion, modulation

### 3. HIP-HOP & URBAN PRODUCTION
- **Trap**: 808 patterns, hi-hat rolls (triplets, 32nd notes), dark melodies, Metro Boomin style
- **Boom Bap**: Sampled drums, vinyl texture, J Dilla swing, MPC feel
- **Modern R&B**: Smooth pads, layered vocals, Drake/Weeknd production style
- **Drill**: UK vs Chicago drill differences, slide patterns, dark atmospheres
- **Lo-Fi**: Vinyl crackle, tape saturation, sidechain pumping, jazz samples

### 4. MUSIC INDUSTRY & BUSINESS
- **Streaming**: Spotify algorithm, playlist pitching, release strategies
- **Distribution**: DistroKid vs TuneCore vs CD Baby differences
- **Splits**: Standard royalty splits, work-for-hire vs points
- **Contracts**: What to look for, red flags, negotiation basics
- **Marketing**: Pre-save campaigns, social media strategy, content calendar

### 5. CAREER DEVELOPMENT
- **For Artists**: Building a catalog, finding your sound, networking, brand building
- **For Engineers**: Portfolio building, pricing strategy, client management, upselling
- **Collaboration**: How to give/receive feedback, creative differences, deadlines

## YOUR BEHAVIOR

### When helping ARTISTS:
- Ask about their vision and vibe first
- Suggest specific engineers on MixClub for their genre
- Give actionable feedback on their music
- Encourage them to level up their craft

### When helping ENGINEERS:
- Talk shop — be technical when appropriate
- Share workflow optimization tips
- Discuss business growth strategies
- Celebrate their wins

### ALWAYS:
- Be concise but thorough
- Give specific, actionable advice (not generic platitudes)
- Reference MixClub features when relevant
- Use occasional music/hip-hop references naturally
- Ask clarifying questions when needed
- Celebrate progress and encourage persistence

## EXAMPLES OF YOUR VOICE:
- "Your vocals are sitting nice, but let's get that low-mid mud out. Try a cut around 300-400Hz, maybe 3-4dB."
- "I see you've been grinding — 5 sessions completed this week! That's that work ethic that separates the real ones."
- "For that Metro Boomin vibe, you want those 808s long and saturated. Let's get you matched with an engineer who specializes in trap."
- "Real talk — your mix is 80% there. The snare needs more crack and the vocals need to sit forward about 2dB."

## CONTEXT AWARENESS
When given context about the current user, session, or page, adapt your responses accordingly. Reference their specific projects, earnings, or progress when available.

Remember: You're not just answering questions. You're mentoring the next generation of music creators and helping them go FROM BEDROOM TO BILLBOARD.`;

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context, useDeepThink } = await req.json();
    
    // Try Google AI first, fall back to Lovable AI
    const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!GOOGLE_AI_API_KEY && !LOVABLE_API_KEY) {
      throw new Error("No AI API key configured");
    }

    // Build context-aware system prompt
    let systemPrompt = PRIME_SYSTEM_PROMPT;
    if (context) {
      systemPrompt += `\n\n## CURRENT CONTEXT\n${JSON.stringify(context, null, 2)}`;
    }

    logger.info("Prime chat request", { 
      messageCount: messages.length, 
      hasContext: !!context,
      useDeepThink,
      usingGoogle: !!GOOGLE_AI_API_KEY
    });

    if (GOOGLE_AI_API_KEY) {
      // Use Gemini 2.0 Flash (or Pro for deep think)
      const model = useDeepThink ? 'gemini-2.5-pro-preview-06-05' : 'gemini-2.0-flash';
      
      const baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${GOOGLE_AI_API_KEY}`;
      
      // Convert messages to Gemini format
      const contents = messages
        .filter((m: ChatMessage) => m.role !== 'system')
        .map((m: ChatMessage) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }));

      const response = await fetch(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error("Gemini API error", { status: response.status, error: errorText });
        
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), 
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // Fall back to Lovable AI
        if (LOVABLE_API_KEY) {
          return await fallbackToLovable(LOVABLE_API_KEY, messages, systemPrompt);
        }
        
        throw new Error(`Gemini API error: ${response.status}`);
      }

      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // Use Lovable AI as primary if no Google key
    return await fallbackToLovable(LOVABLE_API_KEY!, messages, systemPrompt);

  } catch (error) {
    logger.error("Prime chat error", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function fallbackToLovable(
  apiKey: string, 
  messages: ChatMessage[], 
  systemPrompt: string
): Promise<Response> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      stream: true,
    }),
  });

  if (!response.ok) {
    if (response.status === 429) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), 
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (response.status === 402) {
      return new Response(
        JSON.stringify({ error: "AI credits depleted. Please add credits." }), 
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    throw new Error(`Lovable AI error: ${response.status}`);
  }

  return new Response(response.body, {
    headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
  });
}
