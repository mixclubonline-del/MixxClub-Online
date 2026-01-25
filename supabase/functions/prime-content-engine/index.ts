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
  videoReference?: string; // URL to canonical video reference
  videoStyle?: 'talking-head' | 'b-roll-voiceover' | 'text-overlay' | 'reaction';
  audience?: 'general' | 'artists' | 'engineers' | 'labels';
}

interface CaptionVariant {
  id: string;
  text: string;
  tone: string;
}

interface PlatformContent {
  caption: string;
  hashtags: string[];
  format?: string;
  variants?: CaptionVariant[];
}

interface GeneratedContent {
  id?: string;
  script: string;
  audioUrl?: string | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
  platformContent: Record<string, PlatformContent>;
}

interface VisualIdentity {
  character_appearance?: {
    description: string;
    lighting: string;
    framing: string;
    energy: string;
    attire: string;
  };
  video_style?: {
    duration_tiktok: string;
    duration_reels: string;
    duration_twitter: string;
    motion: string;
    background: string;
    text_overlay_style: string;
    transitions: string;
  };
  voice_characteristics?: {
    tone: string;
    pacing: string;
    style: string;
  };
  canonical_references?: string[];
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
      trendData,
      videoReference,
      trendData,
      videoReference,
      videoStyle = 'talking-head',
      audience = 'general'
    } = body;

    console.log("Prime Content Engine request:", { contentType, topic, platforms, videoStyle, audience });

    // Step 1: Get Prime's persona configuration with visual identity
    const { data: persona } = await supabase
      .from('prime_persona_config')
      .select('*')
      .eq('is_active', true)
      .single();

    const personaPrompt = persona?.persona_prompt || getDefaultPersona();
    const platformGuidelines = persona?.platform_guidelines || {};
    const voiceId = persona?.voice_id || 'n2GT0XqyIfmevnaDjYT0';
    const visualIdentity: VisualIdentity = persona?.visual_identity || {};

    // Step 2: Get canonical video reference if not provided
    let canonicalVideoUrl = videoReference;
    if (!canonicalVideoUrl && includeVideo) {
      const { data: brandAsset } = await supabase
        .from('prime_brand_assets')
        .select('public_url')
        .eq('asset_type', 'video-reference')
        .eq('is_canonical', true)
        .single();
      
      canonicalVideoUrl = brandAsset?.public_url;
      console.log("Using canonical video reference:", canonicalVideoUrl);
    }

    // Step 3: Fetch trends if no topic provided
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

    // Step 4: Generate script with Gemini (enhanced with visual identity context)
    const scriptPrompt = buildScriptPrompt(contentType, topicContext, personaPrompt, platforms, platformGuidelines, visualIdentity, audience);
    
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

    // Step 5: Generate voice with ElevenLabs (if requested)
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

    // Step 6: Generate image (if requested) - enhanced with visual identity
    let imageUrl = null;
    if (includeImage) {
      try {
        const imagePrompt = buildImagePrompt(contentType, topicContext, visualIdentity, videoStyle);
        
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

    // Step 7: Generate video (if requested) - uses canonical reference for consistency
    let videoUrl = null;
    let thumbnailUrl = null;
    if (includeVideo) {
      try {
        const videoPrompt = buildVideoPrompt(contentType, topicContext, visualIdentity, videoStyle);
        
        // Use image-to-video if we have an image, or text-to-video with visual identity guidance
        const videoPayload: any = {
          type: imageUrl ? 'image-to-video' : 'text-to-video',
          prompt: videoPrompt,
          duration: 5
        };

        if (imageUrl) {
          videoPayload.imageUrl = imageUrl;
        }

        const videoResponse = await fetch(`${supabaseUrl}/functions/v1/generate-video`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`
          },
          body: JSON.stringify(videoPayload)
        });

        if (videoResponse.ok) {
          const videoData = await videoResponse.json();
          videoUrl = videoData.output;
          thumbnailUrl = imageUrl; // Use the generated image as thumbnail
          console.log("Video generated successfully");
        }
      } catch (videoError) {
        console.error("Video generation failed:", videoError);
      }
    }

    // Step 8: Save to content queue with enhanced metadata
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
        thumbnail_url: thumbnailUrl,
        platform_content: parsedContent.platformContent,
        status: 'ready',
        generation_metadata: {
          model: 'gemini-2.5-flash',
          voice_id: voiceId,
          platforms_requested: platforms,
          video_style: videoStyle,
          audience_target: audience,
          canonical_reference_used: canonicalVideoUrl || null,
          visual_identity_version: visualIdentity ? 'v1' : null,
          generated_at: new Date().toISOString()
        },
        priority: 'normal', // Default, unless specified otherwise (webhook logic separate)
        audience_segment: audience,
        caption_variants: parsedContent.globalVariants || [] // Store global variants if any
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
      thumbnailUrl,
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
  guidelines: any,
  visualIdentity: VisualIdentity,
  audience: string = 'general'
): string {
  const contentTypeInstructions: Record<string, string> = {
    'hot-take': `Create a bold, opinionated take on this topic. Start with a controversial or surprising hook, give context, deliver your perspective, and end with a quotable line.`,
    'production-tip': `Share a practical production technique. Start with a common problem, explain the fix clearly, and level up with an advanced application.`,
    'industry-insight': `Analyze this from an industry veteran's perspective. Connect it to historical context, explain what it means for artists/engineers, and tie it back to MixClub's mission.`,
    'platform-promo': `Naturally weave MixClub into the conversation. Start with a real problem artists face, show how MixClub addresses it, and invite them to check it out.`,
    'trend-reaction': `React to this trending topic with Prime's unique take. Be timely, relevant, and add value that only a 20-year veteran could provide.`
  };

    : '';

  const audienceContext = audience !== 'general' 
    ? `\n\nTARGET AUDIENCE: ${audience.toUpperCase()}. Adjust vocabulary and tone.\n- Engineers: Use technical terms (LUFS, phase, compression), relate to workflow struggles.\n- Artists: Focus on creativity, releasing music, getting heard, dealing with technical hurdles.\n- Labels: Focus on ROI, market trends, breaking artists.` 
    : '';

  return `${persona}
${voiceContext}
${audienceContext}

CONTENT TYPE: ${contentType}
${contentTypeInstructions[contentType] || contentTypeInstructions['hot-take']}

TOPIC/TREND: ${topic}

Generate content in the following JSON format:
{
  "main_script": "The full script in Prime's voice (60-90 seconds when spoken)",
  "hook": "The attention-grabbing first line (must stop the scroll)",
  "quotable": "One memorable line that could be shared standalone",
  "platforms": {
    ${platforms.map(p => `"${p}": { "caption": "Platform-optimized caption", "hashtags": ["relevant", "hashtags"], "format": "vertical/square" }`).join(',\n    ')}
  },
  "variants": [
    { "text": "Alternative caption option 1 (Provocative)", "tone": "Provocative" },
    { "text": "Alternative caption option 2 (Educational)", "tone": "Educational" },
    { "text": "Alternative caption option 3 (Question/Engagement)", "tone": "Question" }
  ]
}

Platform-specific notes:
- TikTok: Punchy hooks, max 150 chars for caption, 5 hashtags, vertical format
- Instagram: Visual storytelling, max 300 chars, 10 hashtags, square or vertical
- Twitter: Quotable takes, max 280 chars, can suggest thread, square format
- YouTube Shorts: Hook-value-CTA format, max 100 chars, vertical

Remember: 
- Keep it real. No corporate speak. 
- Start with the hook that stops the scroll.
- End memorable - something they'll quote to their friends.
- This is OG energy, not try-hard energy.`;
}

function buildImagePrompt(
  contentType: string, 
  topic: string, 
  visualIdentity: VisualIdentity,
  videoStyle: string
): string {
  const appearance = visualIdentity.character_appearance;
  const videoInfo = visualIdentity.video_style;
  
  const characterDescription = appearance 
    ? `${appearance.description}. Lighting: ${appearance.lighting}. ${appearance.framing}. Energy: ${appearance.energy}.`
    : "Professional Black male engineer, studio environment, confident presence. Warm studio lighting with subtle neon accents.";
  
  const backgroundStyle = videoInfo?.background || "Professional studio with mixing console visible";
  
  const typeModifiers: Record<string, string> = {
    'hot-take': "Bold confrontational energy, strong eye contact, hands gesturing while making a point",
    'production-tip': "Hands on mixing console or pointing to equipment, educational but not stuffy",
    'industry-insight': "Thoughtful expression, perhaps leaning back slightly, wisdom in the eyes",
    'platform-promo': "Welcoming energy, gesturing invitingly, community builder vibe",
    'trend-reaction': "Animated expression, reacting genuinely, dynamic energy"
  };

  const styleModifiers: Record<string, string> = {
    'talking-head': "Medium shot, direct to camera, speaking with intention",
    'b-roll-voiceover': "Wide shot of studio environment, Prime working at console",
    'text-overlay': "Clean composition with space for text overlays, bold framing",
    'reaction': "Close-up on face showing genuine reaction, expressive"
  };

  return `${characterDescription}

${backgroundStyle}. ${typeModifiers[contentType] || typeModifiers['hot-take']}. ${styleModifiers[videoStyle] || styleModifiers['talking-head']}.

Topic context: ${topic.substring(0, 100)}

Style requirements:
- Ultra high resolution, cinematic quality
- 9:16 aspect ratio for TikTok/Reels OR 1:1 for Twitter
- No text overlays in image (will be added in post)
- Warm but professional color grading
- Subtle depth of field, subject in sharp focus`;
}

function buildVideoPrompt(
  contentType: string,
  topic: string,
  visualIdentity: VisualIdentity,
  videoStyle: string
): string {
  const appearance = visualIdentity.character_appearance;
  const videoInfo = visualIdentity.video_style;

  const motionStyle = videoInfo?.motion || "Subtle natural movement, not static freeze";
  
  const stylePrompts: Record<string, string> = {
    'talking-head': "Prime speaking directly to camera with subtle head movements and hand gestures, professional studio background with soft neon accents, cinematic lighting, calm authoritative energy",
    'b-roll-voiceover': "Slow pan across professional mixing studio, hands adjusting console faders, ambient studio atmosphere, warm lighting with subtle equipment LEDs",
    'text-overlay': "Static or slow zoom shot of Prime in studio, clean composition allowing space for text overlays, bold professional framing",
    'reaction': "Prime reacting expressively to something, genuine emotion, dynamic but not over-the-top, studio setting"
  };

  return `${stylePrompts[videoStyle] || stylePrompts['talking-head']}

Motion: ${motionStyle}
Character: ${appearance?.description || 'Professional Black male engineer, OG studio veteran presence'}
Energy: ${appearance?.energy || 'Calm authority, not hyperactive'}

5 second clip, smooth motion, professional quality, suitable for social media. Topic context: ${topic.substring(0, 50)}`;
}

function parseGeneratedContent(rawOutput: string, platforms: string[]): { script: string; platformContent: Record<string, PlatformContent>; globalVariants?: CaptionVariant[] } {
  try {
    // Try to extract JSON from the response
    const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        script: parsed.main_script || rawOutput,
        platformContent: parsed.platforms || {},
        globalVariants: parsed.variants?.map((v: any, i: number) => ({ id: `var_${i}`, ...v })) || []
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
      hashtags: ['MixClub', 'MusicProduction', 'StudioLife', 'ProducerLife', 'AudioEngineering'],
      format: platform === 'twitter' ? 'square' : 'vertical'
    };
  });

  return {
    script: rawOutput,
    platformContent
  };
}
