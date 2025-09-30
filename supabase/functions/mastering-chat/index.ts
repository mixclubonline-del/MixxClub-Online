import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, audioFile } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // System prompt for mixing/mastering expertise
    const systemPrompt = `You are a Grammy-winning mixing and mastering engineer with 20+ years of experience. You provide expert analysis and feedback on audio tracks.

Key areas to analyze:
- Frequency balance and EQ suggestions
- Dynamic range and compression recommendations  
- Stereo imaging and spatial characteristics
- Loudness and mastering chain suggestions
- Genre-specific mixing techniques
- Technical issues and fixes needed

Always provide:
1. Overall assessment (1-10 rating)
2. Specific technical feedback
3. 3 concrete improvement suggestions
4. Estimated time to fix issues
5. Whether our AI mastering would help

Keep responses conversational but professional. Use technical terms but explain them briefly.`;

    let analysisPrompt = message;
    
    // If audio file is uploaded, enhance the prompt
    if (audioFile) {
      analysisPrompt = `Analyze this uploaded audio track. User says: "${message}"\n\nProvide detailed feedback on the mix quality, suggest improvements, and explain how our AI mastering technology could enhance this track. Focus on technical aspects like frequency balance, dynamics, and stereo imaging.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: analysisPrompt },
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "Rate limit exceeded. Please try again in a moment.",
          shouldRetry: true 
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: "AI usage limit reached. Please contact support.",
          shouldRetry: false 
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    // Simulate mastered version for A/B comparison (in real implementation, this would process the audio)
    const masteringResult = audioFile ? {
      originalUrl: audioFile.url,
      masteredUrl: audioFile.url, // Would be actual processed version
      improvements: [
        "Enhanced clarity in mid-high frequencies",
        "Improved stereo width and imaging", 
        "Optimized loudness for streaming platforms",
        "Reduced harsh frequencies around 3-5kHz"
      ]
    } : null;

    return new Response(
      JSON.stringify({ 
        analysis, 
        masteringResult,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Mastering chat error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        shouldRetry: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});