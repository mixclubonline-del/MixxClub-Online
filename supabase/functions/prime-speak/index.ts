import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createLogger } from "../_shared/logger.ts";

const logger = createLogger("prime-speak");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voice = 'alloy' } = await req.json();
    
    if (!text) {
      throw new Error("Text is required");
    }

    // Try OpenAI TTS first (higher quality), fall back to Google
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
    
    if (!OPENAI_API_KEY && !GOOGLE_AI_API_KEY) {
      throw new Error("No TTS API key configured");
    }

    logger.info("Prime speak request", { textLength: text.length, voice });

    if (OPENAI_API_KEY) {
      // Use OpenAI TTS
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: text,
          voice: voice, // alloy, echo, fable, onyx, nova, shimmer
          response_format: 'mp3',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        logger.error("OpenAI TTS error", error);
        
        // Fall back to Google if available
        if (GOOGLE_AI_API_KEY) {
          return await googleTTS(GOOGLE_AI_API_KEY, text);
        }
        
        throw new Error(error.error?.message || 'Failed to generate speech');
      }

      // Convert audio buffer to base64
      const arrayBuffer = await response.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      return new Response(
        JSON.stringify({ 
          audioContent: base64Audio,
          audioUrl: `data:audio/mp3;base64,${base64Audio}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use Google TTS
    return await googleTTS(GOOGLE_AI_API_KEY!, text);

  } catch (error) {
    logger.error("Prime speak error", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function googleTTS(apiKey: string, text: string): Promise<Response> {
  const baseUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;
  
  const response = await fetch(baseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      input: { text },
      voice: {
        languageCode: "en-US",
        name: "en-US-Studio-M", // Male studio voice
        ssmlGender: "MALE"
      },
      audioConfig: {
        audioEncoding: "MP3",
        pitch: -2.0, // Slightly deeper for Prime's authority
        speakingRate: 1.05 // Slightly faster, energetic
      }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google TTS error: ${response.status} - ${errorText}`);
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
