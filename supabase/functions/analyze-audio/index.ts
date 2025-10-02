import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { checkRateLimit, rateLimitHeaders } from '../_shared/rate-limit.ts';
import { analysisCache } from '../_shared/response-cache.ts';
import { handleError, validateRequest, createResponse, AppError } from '../_shared/error-handler.ts';
import { createLogger } from '../_shared/logger.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

serve(async (req) => {
  const requestId = crypto.randomUUID();
  const logger = createLogger('analyze-audio');
  logger.setContext({ requestId });
  const startTime = Date.now();
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    logger.info('Received analysis request', { fileName: body.fileName });
    
    // Validate required fields
    validateRequest(body, ['fileId', 'filePath', 'fileName']);
    
    const { fileId, filePath, fileName } = body;
    
    // Rate limiting - 10 requests per 5 minutes per file
    const rateLimitResult = await checkRateLimit(
      fileId,
      { maxRequests: 10, windowMs: 5 * 60 * 1000, keyPrefix: 'analyze-audio' },
      supabaseUrl,
      supabaseServiceKey
    );
    
    if (!rateLimitResult.allowed) {
      logger.warn('Rate limit exceeded', { fileId });
      throw new AppError('Rate limit exceeded. Please try again later.', 429, 'RATE_LIMIT_EXCEEDED');
    }
    
    // Check cache first (5 minute TTL)
    const cacheKey = `analysis:${fileId}`;
    const cached = analysisCache.get(cacheKey);
    
    if (cached) {
      logger.info('Returning cached analysis', { fileId });
      return createResponse({
        ...cached,
        cached: true
      }, 200, rateLimitHeaders(rateLimitResult));
    }
    
    if (!fileId || !filePath) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    logger.info('Starting AI-powered analysis', { fileName });

    // Use Lovable AI for audio analysis
    const analysisResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert audio engineer and music producer. Analyze the provided audio file information and extract detailed musical information. Focus on:

1. BPM (Beats Per Minute) - detect the tempo accurately
2. Time Signature - determine if it's 4/4, 3/4, 6/8, etc.
3. Key signature - identify the musical key
4. Genre characteristics
5. Instrumentation likely present

Based on the filename, genre conventions, and typical patterns, provide accurate estimates.

Provide your analysis in the specified function format.`
          },
          {
            role: 'user',
            content: `Please analyze this audio file: "${fileName}". 

Extract BPM and musical information for DAW session setup. Consider:
- Filename patterns that might indicate genre/style
- Common BPM ranges for different genres
- Typical time signatures for different styles

Make educated estimates based on filename analysis and genre conventions.`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_audio_metrics",
              description: "Extract musical and technical information from audio files",
              parameters: {
                type: "object",
                properties: {
                  bpm: {
                    type: "integer",
                    description: "Detected beats per minute",
                    minimum: 60,
                    maximum: 200
                  },
                  timeSignature: {
                    type: "string",
                    enum: ["4/4", "3/4", "6/8", "2/4", "5/4", "7/8", "other"],
                    description: "Musical time signature"
                  },
                  keySignature: {
                    type: "string",
                    description: "Musical key (e.g., 'C major', 'A minor')"
                  },
                  genre: {
                    type: "string",
                    description: "Musical genre or style"
                  },
                  confidence: {
                    type: "number",
                    minimum: 0,
                    maximum: 1,
                    description: "Confidence level in the analysis"
                  },
                  audioQuality: {
                    type: "string",
                    enum: ["low", "medium", "high"],
                    description: "Perceived audio quality"
                  },
                  duration: {
                    type: "number",
                    description: "Duration in seconds"
                  },
                  instruments: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of likely instruments"
                  },
                  rhythmPattern: {
                    type: "string",
                    description: "Description of the rhythm pattern"
                  },
                  recommendations: {
                    type: "object",
                    properties: {
                      sessionBpm: {
                        type: "integer",
                        description: "Recommended BPM for DAW session"
                      },
                      sessionTimeSignature: {
                        type: "string",
                        description: "Recommended time signature for DAW session"
                      },
                      suggestedEffects: {
                        type: "array",
                        items: { type: "string" },
                        description: "Suggested audio effects for this track"
                      }
                    },
                    required: ["sessionBpm", "sessionTimeSignature", "suggestedEffects"]
                  }
                },
                required: ["bpm", "timeSignature", "keySignature", "genre", "confidence", "audioQuality", "duration", "instruments", "rhythmPattern", "recommendations"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "analyze_audio_metrics" } }
      }),
    });

    if (!analysisResponse.ok) {
      const errorText = await analysisResponse.text();
      logger.warn('AI analysis failed, using fallback', { 
        status: analysisResponse.status, 
        error: errorText 
      });
      
      const fallbackAnalysis = generateFallbackAnalysis(fileName);
      
      // Cache fallback for 2 minutes
      analysisCache.set(cacheKey, { analysis: fallbackAnalysis, source: 'fallback' }, 2 * 60 * 1000);

      return createResponse({
        analysis: fallbackAnalysis,
        source: 'fallback'
      }, 200, rateLimitHeaders(rateLimitResult));
    }

    const aiResponse = await analysisResponse.json();
    console.log('AI Response:', JSON.stringify(aiResponse, null, 2));
    
    let analysis;
    
    if (aiResponse.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments) {
      try {
        analysis = JSON.parse(aiResponse.choices[0].message.tool_calls[0].function.arguments);
      } catch (parseError) {
        console.error('Error parsing tool call arguments:', parseError);
        analysis = generateFallbackAnalysis(fileName);
      }
    } else {
      console.warn('No tool calls found in AI response, using fallback');
      analysis = generateFallbackAnalysis(fileName);
    }

    const duration = Date.now() - startTime;
    logger.performance('Analysis completed', duration, { fileName, source: 'ai' });
    
    // Cache successful analysis for 5 minutes
    const result = { analysis, source: 'ai' };
    analysisCache.set(cacheKey, result, 5 * 60 * 1000);

    return createResponse(result, 200, rateLimitHeaders(rateLimitResult));

  } catch (error) {
    logger.error('Error in analyze-audio function', error);
    
    // Try fallback for graceful degradation
    try {
      const body = await req.clone().json();
      const fallbackAnalysis = generateFallbackAnalysis(body.fileName || 'unknown_file');
      
      return createResponse({ 
        analysis: fallbackAnalysis,
        source: 'error_fallback'
      });
    } catch (fallbackError) {
      const errorResponse = handleError(error, requestId);
      return createResponse(errorResponse.body, errorResponse.status);
    }
  }
});

function generateFallbackAnalysis(fileName: string): any {
  const lowerFileName = fileName.toLowerCase();
  
  // Try to detect BPM from filename
  const bpmMatch = lowerFileName.match(/(\d{2,3})\s*bpm/);
  const detectedBpm = bpmMatch ? parseInt(bpmMatch[1]) : null;
  
  // Genre-based BPM estimation
  let estimatedBpm = 120; // Default
  let timeSignature = "4/4";
  let genre = "Unknown";
  let instruments = ["Unknown"];
  let confidence = 0.4;
  
  if (lowerFileName.includes('trap') || lowerFileName.includes('hip hop') || lowerFileName.includes('hiphop')) {
    estimatedBpm = detectedBpm || 140;
    genre = "Hip Hop/Trap";
    instruments = ["808", "Hi-hats", "Snare", "Vocals"];
    confidence = detectedBpm ? 0.8 : 0.6;
  } else if (lowerFileName.includes('house') || lowerFileName.includes('techno') || lowerFileName.includes('edm')) {
    estimatedBpm = detectedBpm || 128;
    genre = "Electronic/House";
    instruments = ["Kick", "Hi-hats", "Synth", "Bass"];
    confidence = detectedBpm ? 0.8 : 0.6;
  } else if (lowerFileName.includes('drill')) {
    estimatedBpm = detectedBpm || 150;
    genre = "Drill";
    instruments = ["808", "Hi-hats", "Snare", "Vocals"];
    confidence = detectedBpm ? 0.8 : 0.7;
  } else if (lowerFileName.includes('pop')) {
    estimatedBpm = detectedBpm || 120;
    genre = "Pop";
    instruments = ["Drums", "Bass", "Vocals", "Guitar"];
    confidence = detectedBpm ? 0.8 : 0.5;
  } else if (lowerFileName.includes('rock')) {
    estimatedBpm = detectedBpm || 120;
    genre = "Rock";
    instruments = ["Guitar", "Bass", "Drums", "Vocals"];
    confidence = detectedBpm ? 0.8 : 0.5;
  } else if (lowerFileName.includes('jazz')) {
    estimatedBpm = detectedBpm || 120;
    timeSignature = "4/4";
    genre = "Jazz";
    instruments = ["Piano", "Bass", "Drums", "Saxophone"];
    confidence = detectedBpm ? 0.8 : 0.4;
  } else if (lowerFileName.includes('beat') || lowerFileName.includes('instrumental')) {
    estimatedBpm = detectedBpm || 120;
    genre = "Instrumental/Beat";
    instruments = ["Drums", "Bass", "Synth"];
    confidence = detectedBpm ? 0.9 : 0.6;
  }

  return {
    bpm: estimatedBpm,
    timeSignature,
    keySignature: "C major",
    genre,
    confidence,
    audioQuality: "medium",
    duration: 180, // Default 3 minutes
    instruments,
    rhythmPattern: "Standard " + genre.split('/')[0] + " pattern",
    recommendations: {
      sessionBpm: estimatedBpm,
      sessionTimeSignature: timeSignature,
      suggestedEffects: ["EQ", "Compressor", "Reverb"]
    }
  };
}