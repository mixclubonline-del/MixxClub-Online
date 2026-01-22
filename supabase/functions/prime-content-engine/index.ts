import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContentRequest {
  contentType: 'hot-take' | 'production-tip' | 'industry-insight' | 'platform-promo' | 'trend-reaction';
  topic?: string;
  platforms?: string[];
  includeVoice?: boolean;
  includeImage?: boolean;
  includeVideo?: boolean;
  trendData?: any;
}

interface PlatformContent {
  caption: string;
  hashtags: string[];
  format?: string;
}

interface GeneratedContent {
  id?: string;
  script: string;
  audioUrl?: string | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
  platformContent: Record<string, PlatformContent>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const googleApiKey = Deno.env.get("GOOGLE_AI_API_KEY")!;
    const elevenLabsKey = Deno.env.get("ELEVENLABS_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseKey);

    const body: ContentRequest = await req.json();
    const {
      contentType,
      topic,
      platforms = ['tiktok', 'instagram', 'twitter'],
      includeVoice = true,
      includeImage = true,
      includeVideo = false,
      trendData
    } = body;

    console.log("Prime Content Engine request:", { contentType, topic, platforms });

    // Step 1: Get Prime's persona configuration
    const { data: persona } = await supabase
      .from('prime_persona_config')
      .select('*')
      .eq('is_active', true)
      .single();

    const personaPrompt = persona?.persona_prompt || getDefaultPersona();
    const platformGuidelines = persona?.platform_guidelines || {};
    const voiceId = persona?.voice_id || 'n2GT0XqyIfmevnaDjYT0';

    // Step 2: Fetch trends if no topic provided
    let topicContext = topic;
    let sourceTrendId = null;

    if (!topicContext && !trendData) {
      console.log("Fetching music trends...");
      const trendsResponse = await fetch(`${supabaseUrl}/functions/v1/scrape-music-trends`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({ query: 'music production mixing engineering trending', limit: 5 })
      });

      if (trendsResponse.ok) {
        const trendsData = await trendsResponse.json();
        if (trendsData.trends?.length > 0) {
          const topTrend = trendsData.trends[0];
          topicContext = `${topTrend.title}: ${topTrend.description}`;
          sourceTrendId = topTrend.id;
        }
      }
    } else if (trendData) {
      topicContext = `${trendData.title}: ${trendData.description}`;
      sourceTrendId = trendData.id;
    }

    if (!topicContext) {
      topicContext = "The state of music production in 2025 and how independent artists are breaking through";
    }

    // Step 3: Generate script with Gemini
    const scriptPrompt = buildScriptPrompt(contentType, topicContext, personaPrompt, platforms, platformGuidelines);
    
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${googleApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: scriptPrompt }] }],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 2000,
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${await geminiResponse.text()}`);
    }

    const geminiData = await geminiResponse.json();
    const rawOutput = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Parse the structured output
    const parsedContent = parseGeneratedContent(rawOutput, platforms);
    
    console.log("Generated script:", parsedContent.script.substring(0, 200) + "...");

    // Step 4: Generate voice with ElevenLabs (if requested)
    let audioUrl = null;
    if (includeVoice && elevenLabsKey && parsedContent.script) {
      try {
        const voiceScript = parsedContent.script.length > 1000 
          ? parsedContent.script.substring(0, 1000) 
          : parsedContent.script;

        const ttsResponse = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'xi-api-key': elevenLabsKey
            },
            body: JSON.stringify({
              text: voiceScript,
              model_id: 'eleven_multilingual_v2',
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.8,
                style: 0.7,
                use_speaker_boost: true
              }
            })
          }
        );

        if (ttsResponse.ok) {
          const audioBuffer = await ttsResponse.arrayBuffer();
          const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
          audioUrl = `data:audio/mpeg;base64,${base64Audio}`;
          console.log("Voice generated successfully");
        } else {
          console.error("ElevenLabs error:", await ttsResponse.text());
        }
      } catch (voiceError) {
        console.error("Voice generation failed:", voiceError);
      }
    }

    // Step 5: Generate image (if requested)
    let imageUrl = null;
    if (includeImage) {
      try {
        const imagePrompt = buildImagePrompt(contentType, topicContext);
        
        const imageResponse = await fetch(`${supabaseUrl}/functions/v1/generate-image-gemini`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`
          },
          body: JSON.stringify({
            prompt: imagePrompt,
            style: 'cyberpunk-studio'
          })
        });

        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          imageUrl = imageData.imageUrl;
          console.log("Image generated successfully");
        }
      } catch (imageError) {
        console.error("Image generation failed:", imageError);
      }
    }

    // Step 6: Generate video (if requested)
    let videoUrl = null;
    if (includeVideo && imageUrl) {
      try {
        const videoResponse = await fetch(`${supabaseUrl}/functions/v1/generate-video`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`
          },
          body: JSON.stringify({
            type: 'image-to-video',
            imageUrl: imageUrl,
            prompt: `Prime delivering wisdom in a professional music studio, subtle movement, cinematic lighting`
          })
        });

        if (videoResponse.ok) {
          const videoData = await videoResponse.json();
          videoUrl = videoData.output;
          console.log("Video generated successfully");
        }
      } catch (videoError) {
        console.error("Video generation failed:", videoError);
      }
    }

    // Step 7: Save to content queue
    const { data: savedContent, error: saveError } = await supabase
      .from('prime_content_queue')
      .insert({
        content_type: contentType,
        topic: topicContext,
        source_trend_id: sourceTrendId,
        script: parsedContent.script,
        audio_url: audioUrl,
        image_url: imageUrl,
        video_url: videoUrl,
        platform_content: parsedContent.platformContent,
        status: 'ready',
        generation_metadata: {
          model: 'gemini-2.5-flash',
          voice_id: voiceId,
          platforms_requested: platforms,
          generated_at: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (saveError) {
      console.error("Failed to save content:", saveError);
    }

    const result: GeneratedContent = {
      id: savedContent?.id,
      script: parsedContent.script,
      audioUrl,
      imageUrl,
      videoUrl,
      platformContent: parsedContent.platformContent
    };

    return new Response(JSON.stringify({ success: true, content: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: unknown) {
    console.error("Prime Content Engine error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getDefaultPersona(): string {
  return `You are Prime - the OG head engineer and studio owner of MixClub. You've been in the game for 20+ years, worked with legends, and now you're building the platform you wish existed when you started.

Voice characteristics:
- Direct but not cold
- Industry veteran wisdom, not academic
- Hip-hop culture fluent (not try-hard)
- Business-aware but artist-first
- Quotable one-liners are your signature

Always keep it real, drop value, and end with something memorable.`;
}

function buildScriptPrompt(
  contentType: string,
  topic: string,
  persona: string,
  platforms: string[],
  guidelines: any
): string {
  const contentTypeInstructions: Record<string, string> = {
    'hot-take': `Create a bold, opinionated take on this topic. Start with a controversial or surprising hook, give context, deliver your perspective, and end with a quotable line.`,
    'production-tip': `Share a practical production technique. Start with a common problem, explain the fix clearly, and level up with an advanced application.`,
    'industry-insight': `Analyze this from an industry veteran's perspective. Connect it to historical context, explain what it means for artists/engineers, and tie it back to MixClub's mission.`,
    'platform-promo': `Naturally weave MixClub into the conversation. Start with a real problem artists face, show how MixClub addresses it, and invite them to check it out.`,
    'trend-reaction': `React to this trending topic with Prime's unique take. Be timely, relevant, and add value that only a 20-year veteran could provide.`
  };

  return `${persona}

CONTENT TYPE: ${contentType}
${contentTypeInstructions[contentType] || contentTypeInstructions['hot-take']}

TOPIC/TREND: ${topic}

Generate content in the following JSON format:
{
  "main_script": "The full script in Prime's voice (60-90 seconds when spoken)",
  "platforms": {
    ${platforms.map(p => `"${p}": { "caption": "Platform-optimized caption", "hashtags": ["relevant", "hashtags"] }`).join(',\n    ')}
  }
}

Platform-specific notes:
- TikTok: Punchy hooks, max 150 chars for caption, 5 hashtags
- Instagram: Visual storytelling, max 300 chars, 10 hashtags  
- Twitter: Quotable takes, max 280 chars, can suggest thread
- YouTube Shorts: Hook-value-CTA format, max 100 chars

Remember: Keep it real. No corporate speak. End memorable.`;
}

function buildImagePrompt(contentType: string, topic: string): string {
  const baseStyle = "Professional music studio aesthetic, cyberpunk purple and blue neon lighting, high-end mixing console";
  
  const typeModifiers: Record<string, string> = {
    'hot-take': "Bold text overlay space, dramatic lighting, confrontational energy",
    'production-tip': "Close-up on mixing equipment, educational vibe, clean composition",
    'industry-insight': "Wide shot of modern studio, sophisticated atmosphere",
    'platform-promo': "MixClub branding integration, welcoming energy, community feel",
    'trend-reaction': "Breaking news energy, dynamic composition, attention-grabbing"
  };

  return `${baseStyle}. ${typeModifiers[contentType] || typeModifiers['hot-take']}. Topic context: ${topic.substring(0, 100)}. Ultra high resolution, 16:9 aspect ratio for social media.`;
}

function parseGeneratedContent(rawOutput: string, platforms: string[]): { script: string; platformContent: Record<string, PlatformContent> } {
  try {
    // Try to extract JSON from the response
    const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        script: parsed.main_script || rawOutput,
        platformContent: parsed.platforms || {}
      };
    }
  } catch (e) {
    console.log("Could not parse JSON, using raw output");
  }

  // Fallback: use raw output and generate basic platform content
  const platformContent: Record<string, PlatformContent> = {};
  const shortScript = rawOutput.length > 150 ? rawOutput.substring(0, 147) + "..." : rawOutput;

  platforms.forEach(platform => {
    platformContent[platform] = {
      caption: shortScript,
      hashtags: ['MixClub', 'MusicProduction', 'StudioLife', 'ProducerLife', 'AudioEngineering']
    };
  });

  return {
    script: rawOutput,
    platformContent
  };
}
