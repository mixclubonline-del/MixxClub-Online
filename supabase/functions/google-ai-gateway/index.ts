import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createLogger } from "../_shared/logger.ts";
import { checkRateLimit, rateLimitHeaders } from "../_shared/rate-limit.ts";

const logger = createLogger("google-ai-gateway");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface GoogleAIRequest {
  type: 'chat' | 'image' | 'video' | 'tts';
  messages?: ChatMessage[];
  prompt?: string;
  model?: string;
  voice?: string;
  imageUrl?: string;
  audioUrl?: string;
  context?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting for public endpoint
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

    const rateLimit = await checkRateLimit(clientIP, {
      maxRequests: 30,
      windowMs: 60000, // 1 minute
      keyPrefix: 'ai-gateway'
    }, supabaseUrl, supabaseKey);

    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, ...rateLimitHeaders(rateLimit), 'Content-Type': 'application/json' } }
      );
    }

    const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");

    if (!GOOGLE_AI_API_KEY) {
      logger.error("GOOGLE_AI_API_KEY is not configured");
      throw new Error("GOOGLE_AI_API_KEY is not configured");
    }

    const request: GoogleAIRequest = await req.json();
    const { type = 'chat', messages, prompt, model, context, voice, imageUrl, audioUrl } = request;

    logger.info(`Processing ${type} request`, { model, messageCount: messages?.length });

    switch (type) {
      case 'chat':
        return await handleChat(GOOGLE_AI_API_KEY, messages || [], model || 'gemini-3.1-flash', context);

      case 'image':
        return await handleImageGeneration(GOOGLE_AI_API_KEY, prompt || '', model || 'gemini-2.0-flash-exp-image-generation');

      case 'tts':
        return await handleTTS(GOOGLE_AI_API_KEY, prompt || '', voice || 'Kore');

      default:
        throw new Error(`Unsupported request type: ${type}`);
    }
  } catch (error) {
    logger.error("Google AI Gateway error", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function handleChat(
  apiKey: string,
  messages: ChatMessage[],
  model: string,
  context?: any
): Promise<Response> {
  const baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}`;

  // Convert messages to Gemini format
  const contents = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

  // Extract system instruction
  const systemMessage = messages.find(m => m.role === 'system');

  const requestBody: any = {
    contents,
    generationConfig: {
      temperature: 0.9,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
    }
  };

  if (systemMessage) {
    requestBody.systemInstruction = {
      parts: [{ text: systemMessage.content }]
    };
  }

  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Gemini API error:", response.status, errorText);

    if (response.status === 429) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  // Stream the response
  return new Response(response.body, {
    headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
  });
}

async function handleImageGeneration(
  apiKey: string,
  prompt: string,
  model: string
): Promise<Response> {
  const baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        responseModalities: ["image", "text"],
      }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Gemini Image API error:", response.status, errorText);
    throw new Error(`Gemini Image API error: ${response.status}`);
  }

  const data = await response.json();

  // Extract image from response
  const imagePart = data.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);

  if (imagePart?.inlineData) {
    return new Response(
      JSON.stringify({
        imageUrl: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`,
        text: data.candidates?.[0]?.content?.parts?.find((p: any) => p.text)?.text
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ error: "No image generated", text: data.candidates?.[0]?.content?.parts?.[0]?.text }),
    { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleTTS(
  apiKey: string,
  text: string,
  voice: string
): Promise<Response> {
  // Using Google Cloud TTS via Gemini
  const baseUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: { text },
      voice: {
        languageCode: "en-US",
        name: `en-US-Studio-${voice === 'Kore' ? 'M' : 'O'}`,
        ssmlGender: voice === 'Kore' ? 'MALE' : 'FEMALE'
      },
      audioConfig: {
        audioEncoding: "MP3",
        pitch: 0,
        speakingRate: 1.0
      }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Google TTS API error:", response.status, errorText);
    throw new Error(`Google TTS API error: ${response.status}`);
  }

  const data = await response.json();

  return new Response(
    JSON.stringify({
      audioContent: data.audioContent,
      audioUrl: `data:audio/mp3;base64,${data.audioContent}`
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
