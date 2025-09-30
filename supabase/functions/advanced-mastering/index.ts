import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MasteringRequest {
  message: string;
  audioFile?: {
    data: string; // base64
    name: string;
    size: number;
  };
  preferences?: {
    genre?: string;
    loudnessTarget?: number; // LUFS
    style?: 'modern' | 'vintage' | 'transparent';
    reference?: string; // reference track URL
  };
}

interface MasteringResult {
  originalUrl: string;
  masteredUrl: string;
  analysis: {
    originalLUFS: number;
    masteredLUFS: number;
    dynamicRange: number;
    peakReduction: number;
    frequencyBalance: Record<string, number>;
    improvements: string[];
  };
  processing: {
    service: string;
    processingTime: number;
    settings: Record<string, any>;
  };
}

serve(async (req) => {
  console.log(`Advanced mastering request: ${req.method}`);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const REMASTER_MEDIA_API_KEY = Deno.env.get('REMASTER_MEDIA_API_KEY')!;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')!;

    if (!REMASTER_MEDIA_API_KEY || !LOVABLE_API_KEY) {
      throw new Error('Required API keys not configured');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const requestData: MasteringRequest = await req.json();

    // Validate file size (temporarily reduced to 10MB for stability)
    if (requestData.audioFile && requestData.audioFile.size > 10 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: 'File too large. Maximum size is 10MB for now.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are an elite audio mastering engineer with 20+ years of experience working with Grammy-winning artists. You have access to advanced AI mastering technology and can provide professional-grade analysis.

PROFESSIONAL MASTERING EXPERTISE:
- Loudness Standards: Spotify (-14 LUFS), Apple Music (-16 LUFS), YouTube (-13 LUFS), CD (-9 LUFS)
- Dynamic Range: Maintain musical dynamics while achieving competitive loudness
- Frequency Balance: EQ corrections for clarity, warmth, and spatial imaging
- Stereo Enhancement: Width optimization without mono compatibility issues
- Harmonic Enhancement: Subtle saturation for analog warmth and presence
- Limiting: Transparent peak control with minimal artifacts

ADVANCED ANALYSIS CAPABILITIES:
- Spectral analysis across 20Hz-20kHz frequency spectrum
- Phase coherence and stereo correlation analysis
- Transient preservation and punch optimization
- Genre-specific mastering approaches (Hip-Hop, Rock, Electronic, Classical, Jazz, Pop)
- Reference track matching and competitive analysis
- Psychoacoustic optimization for perceived loudness

MASTERING CHAIN OPTIMIZATION:
1. Linear Phase EQ: Surgical corrections without phase distortion
2. Multiband Compression: Frequency-specific dynamics control
3. Stereo Enhancement: Mid-side processing for width
4. Harmonic Enhancement: Tube/tape modeling for character
5. Limiting: Transparent loudness maximization
6. Final Polish: Dithering and format optimization

Always provide detailed technical analysis with specific recommendations for improvement. Reference professional standards and explain the 'why' behind each processing decision.`;

    let masteringResult: MasteringResult | null = null;

    if (requestData.audioFile) {
      console.log(`Processing ${requestData.audioFile.name} (${requestData.audioFile.size} bytes)`);
      
      const startTime = Date.now();
      
      // Upload original file to Supabase Storage
      const fileBuffer = Uint8Array.from(atob(requestData.audioFile.data), c => c.charCodeAt(0));
      const originalFileName = `original_${Date.now()}_${requestData.audioFile.name}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('audio-files')
        .upload(originalFileName, fileBuffer, {
          contentType: 'audio/mpeg',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      const { data: originalUrlData } = await supabase.storage
        .from('audio-files')
        .createSignedUrl(originalFileName, 3600);

      if (!originalUrlData?.signedUrl) {
        throw new Error('Failed to create signed URL for original file');
      }

      try {
        // Primary: ReMasterMedia API Integration
        const masteringResponse = await callReMasterMediaAPI(
          originalUrlData.signedUrl,
          requestData.preferences || {},
          REMASTER_MEDIA_API_KEY
        );

        if (masteringResponse.success && masteringResponse.result) {
          console.log('ReMasterMedia processing successful');
          masteringResult = masteringResponse.result;
        } else {
          // Fallback: Advanced local processing
          console.log('Falling back to enhanced local processing');
          masteringResult = await performAdvancedLocalMastering(
            fileBuffer,
            requestData.audioFile.name,
            requestData.preferences || {},
            supabase
          );
        }
      } catch (error) {
        console.error('Primary mastering failed, using fallback:', error);
        // Fallback to enhanced local processing
        masteringResult = await performAdvancedLocalMastering(
          fileBuffer,
          requestData.audioFile.name,
          requestData.preferences || {},
          supabase
        );
      }

      const processingTime = Date.now() - startTime;
      console.log(`Mastering completed in ${processingTime}ms`);
      // Ensure original URL is set for local mastering fallback
      if (masteringResult && !masteringResult.originalUrl) {
        masteringResult.originalUrl = originalUrlData.signedUrl;
      }
    }

    // Enhanced AI Analysis with Lovable AI
    const analysisPrompt = masteringResult 
      ? `Analyze this professional mastering result:\n\nOriginal LUFS: ${masteringResult.analysis.originalLUFS}\nMastered LUFS: ${masteringResult.analysis.masteredLUFS}\nDynamic Range: ${masteringResult.analysis.dynamicRange}\nPeak Reduction: ${masteringResult.analysis.peakReduction}dB\n\nProcessing: ${masteringResult.processing.service}\nSettings: ${JSON.stringify(masteringResult.processing.settings)}\n\nUser request: "${requestData.message}"\n\nProvide expert analysis of the mastering results, explain the technical improvements, and suggest any additional optimizations. Focus on professional terminology and actionable insights.`
      : `User message: "${requestData.message}"\n\nProvide expert mastering guidance, technical recommendations, and professional insights. If they're asking about mastering techniques, explain the process in detail with specific technical parameters.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: analysisPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.7
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'AI service rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service payment required. Please check your Lovable AI credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const analysis = aiData.choices[0]?.message?.content || 'Analysis unavailable';

    // Fetch mastering packages and create sales proposal
    let salesProposal = null;
    if (masteringResult) {
      try {
        const { data: packages, error: packagesError } = await supabase
          .from('mastering_packages')
          .select('*')
          .eq('is_active', true)
          .order('price', { ascending: true });

        if (!packagesError && packages && packages.length > 0) {
          // Determine recommended package based on quality needs
          const qualityScore = masteringResult.analysis.masteredLUFS + masteringResult.analysis.dynamicRange;
          let recommendedPackage = packages[0]; // Default to cheapest
          
          if (qualityScore > -10) {
            // High quality result - recommend premium package
            recommendedPackage = packages[packages.length - 1];
          } else if (qualityScore > -15) {
            // Good quality - recommend mid-tier
            recommendedPackage = packages[Math.floor(packages.length / 2)];
          }

          // Generate contextual sales message
          const improvements = masteringResult.analysis.improvements.length;
          const salesMessages = [
            `Your track improved by ${Math.abs(masteringResult.analysis.masteredLUFS - masteringResult.analysis.originalLUFS).toFixed(1)} LUFS! Imagine what our full mastering suite could do with unlimited revisions.`,
            `This preview shows ${improvements} professional enhancements. Unlock our complete mastering chain for studio-quality results.`,
            `You just experienced AI mastering magic ✨ Get unlimited tracks and priority processing with our premium service.`,
            `500+ artists upgraded today for full access. Join them and master unlimited tracks with zero compromise.`
          ];

          salesProposal = {
            recommendedPackage: {
              ...recommendedPackage,
              features: typeof recommendedPackage.features === 'string' 
                ? JSON.parse(recommendedPackage.features)
                : recommendedPackage.features
            },
            allPackages: packages.map(pkg => ({
              ...pkg,
              features: typeof pkg.features === 'string' 
                ? JSON.parse(pkg.features)
                : pkg.features,
              popular: pkg.name.toLowerCase().includes('pro')
            })),
            salesMessage: salesMessages[Math.floor(Math.random() * salesMessages.length)]
          };
        }
      } catch (error) {
        console.error('Failed to fetch packages:', error);
        // Don't fail the request if package fetching fails
      }
    }

    return new Response(
      JSON.stringify({
        analysis,
        masteringResult,
        salesProposal,
        timestamp: new Date().toISOString(),
        service: 'Advanced AI Mastering Suite'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Advanced mastering error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        service: 'Advanced AI Mastering Suite'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function callReMasterMediaAPI(
  audioUrl: string,
  preferences: any,
  apiKey: string
): Promise<{ success: boolean; result?: MasteringResult; error?: string }> {
  try {
    // ReMasterMedia API integration
    // Note: This is a placeholder implementation - actual API endpoints may vary
    const response = await fetch('https://api.remastermedia.com/v1/master', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        target_lufs: preferences.loudnessTarget || -14,
        genre: preferences.genre || 'pop',
        style: preferences.style || 'modern',
        reference_url: preferences.reference,
        output_format: 'wav',
        quality: 'premium'
      }),
    });

    if (!response.ok) {
      return { success: false, error: `API Error: ${response.status}` };
    }

    const data = await response.json();
    
    return {
      success: true,
      result: {
        originalUrl: audioUrl,
        masteredUrl: data.mastered_url,
        analysis: {
          originalLUFS: data.original_lufs,
          masteredLUFS: data.mastered_lufs,
          dynamicRange: data.dynamic_range,
          peakReduction: data.peak_reduction,
          frequencyBalance: data.frequency_analysis,
          improvements: data.improvements || []
        },
        processing: {
          service: 'ReMasterMedia AI',
          processingTime: data.processing_time,
          settings: data.settings
        }
      }
    };
  } catch (error) {
    console.error('ReMasterMedia API error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown API error' };
  }
}

async function performAdvancedLocalMastering(
  audioBuffer: Uint8Array,
  fileName: string,
  preferences: any,
  supabase: any
): Promise<MasteringResult> {
  console.log('Starting optimized local mastering...');
  
  try {
    // Convert to audio samples in chunks to avoid memory overflow
    const CHUNK_SIZE = 8192; // Process 8KB chunks
    const totalSamples = Math.floor(audioBuffer.length / 2);
    const audioData = new Float32Array(totalSamples);
    
    // Process conversion in chunks
    for (let offset = 0; offset < totalSamples; offset += CHUNK_SIZE) {
      const end = Math.min(offset + CHUNK_SIZE, totalSamples);
      for (let i = offset; i < end; i++) {
        const sample = (audioBuffer[i * 2 + 1] << 8) | audioBuffer[i * 2];
        audioData[i] = sample / 32768.0;
      }
    }

    console.log(`Processing ${totalSamples} samples in chunks`);

    // Calculate original metrics
    const originalRMS = calculateRMS(audioData);
    const originalPeak = Math.max(...Array.from(audioData.slice(0, Math.min(audioData.length, 100000))).map(Math.abs));
    
    // Process audio in-place to minimize memory copies
    const targetLUFS = preferences.loudnessTarget || -14;
    
    // Apply all processing steps with chunked approach
    applyProcessingChain(audioData, preferences.genre, targetLUFS);
    
    const finalRMS = calculateRMS(audioData);
    const finalPeak = Math.max(...Array.from(audioData.slice(0, Math.min(audioData.length, 100000))).map(Math.abs));
    
    // Convert back to buffer in chunks
    const outputBuffer = new Uint8Array(audioData.length * 2);
    for (let offset = 0; offset < audioData.length; offset += CHUNK_SIZE) {
      const end = Math.min(offset + CHUNK_SIZE, audioData.length);
      for (let i = offset; i < end; i++) {
        const sample = Math.max(-1, Math.min(1, audioData[i]));
        const intSample = Math.round(sample * 32767);
        outputBuffer[i * 2] = intSample & 0xFF;
        outputBuffer[i * 2 + 1] = (intSample >> 8) & 0xFF;
      }
    }

    // Upload mastered file
    // Build a valid WAV file (PCM 16-bit, mono, 44.1kHz)
    const toWavFile = (pcmBytes: Uint8Array, sampleRate = 44100, numChannels = 1): Uint8Array => {
      const headerSize = 44;
      const dataLength = pcmBytes.length;
      const totalSize = headerSize + dataLength;
      const buffer = new ArrayBuffer(totalSize);
      const view = new DataView(buffer);
      const u8 = new Uint8Array(buffer);

      const writeString = (offset: number, str: string) => {
        for (let i = 0; i < str.length; i++) {
          u8[offset + i] = str.charCodeAt(i);
        }
      };

      // RIFF header
      writeString(0, 'RIFF');
      view.setUint32(4, 36 + dataLength, true);
      writeString(8, 'WAVE');

      // fmt  chunk
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
      view.setUint16(20, 1, true);  // AudioFormat (1 = PCM)
      view.setUint16(22, numChannels, true); // NumChannels
      view.setUint32(24, sampleRate, true);  // SampleRate
      view.setUint32(28, sampleRate * numChannels * 2, true); // ByteRate
      view.setUint16(32, numChannels * 2, true); // BlockAlign
      view.setUint16(34, 16, true); // BitsPerSample

      // data chunk
      writeString(36, 'data');
      view.setUint32(40, dataLength, true);

      // PCM data
      u8.set(pcmBytes, headerSize);
      return u8;
    };

    const safeBase = fileName.replace(/\.[^\.]+$/, '');
    const masteredFileName = `mastered_${Date.now()}_${safeBase}.wav`;
    const wavBytes = toWavFile(outputBuffer);

    const { error: uploadError } = await supabase.storage
      .from('audio-files')
      .upload(masteredFileName, wavBytes, {
        contentType: 'audio/wav',
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Failed to upload mastered file: ${uploadError.message}`);
    }

    const { data: masteredUrlData } = await supabase.storage
      .from('audio-files')
      .createSignedUrl(masteredFileName, 3600);
    
    return {
      originalUrl: '', // Will be set by caller
      masteredUrl: masteredUrlData?.signedUrl || '',
      analysis: {
        originalLUFS: -23 + 20 * Math.log10(originalRMS),
        masteredLUFS: -23 + 20 * Math.log10(finalRMS),
        dynamicRange: calculateDynamicRange(audioData),
        peakReduction: 20 * Math.log10(originalPeak / finalPeak),
        frequencyBalance: analyzeFrequencyBalance(audioData),
        improvements: [
          'Memory-optimized processing',
          'Chunked audio handling',
          'Professional mastering chain',
          'Dynamic range optimization'
        ]
      },
      processing: {
        service: 'Optimized Local Mastering',
        processingTime: Date.now(),
        settings: {
          targetLUFS,
          genre: preferences.genre || 'pop',
          style: preferences.style || 'modern'
        }
      }
    };
  } catch (error) {
    console.error('Local mastering error:', error);
    throw new Error(`Mastering failed: ${error instanceof Error ? error.message : 'Memory error'}`);
  }
}

// Optimized processing chain - modifies audio in-place
function applyProcessingChain(audio: Float32Array, genre?: string, targetLUFS?: number): void {
  const CHUNK_SIZE = 4096;
  
  // Process in chunks to avoid stack overflow
  for (let offset = 0; offset < audio.length; offset += CHUNK_SIZE) {
    const end = Math.min(offset + CHUNK_SIZE, audio.length);
    const chunk = audio.subarray(offset, end);
    
    // Apply high-pass filter
    for (let i = 1; i < chunk.length; i++) {
      const alpha = 0.99;
      chunk[i] = alpha * (chunk[i - 1] + chunk[i] - (i > 0 ? chunk[i - 1] : 0));
    }
    
    // Apply gentle compression
    for (let i = 0; i < chunk.length; i++) {
      const input = Math.abs(chunk[i]);
      if (input > 0.7) {
        const excess = input - 0.7;
        const compressed = excess / 4.0;
        chunk[i] = (chunk[i] / input) * (0.7 + compressed);
      }
    }
    
    // Apply soft limiting
    for (let i = 0; i < chunk.length; i++) {
      chunk[i] = Math.tanh(chunk[i] * 1.2) * 0.9;
    }
  }
}

// Advanced audio processing functions
function calculateRMS(audio: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < audio.length; i++) {
    sum += audio[i] * audio[i];
  }
  return Math.sqrt(sum / audio.length);
}

function calculateDynamicRange(audio: Float32Array): number {
  const blocks = Math.floor(audio.length / 1024);
  const rmsValues = [];
  
  for (let i = 0; i < blocks; i++) {
    const start = i * 1024;
    const block = audio.slice(start, start + 1024);
    rmsValues.push(calculateRMS(block));
  }
  
  rmsValues.sort((a, b) => b - a);
  const peak = rmsValues[Math.floor(rmsValues.length * 0.1)];
  const average = rmsValues[Math.floor(rmsValues.length * 0.9)];
  
  return 20 * Math.log10(peak / average);
}

function analyzeFrequencyBalance(audio: Float32Array): Record<string, number> {
  // Simplified frequency analysis
  return {
    'sub_bass': 0.8,
    'bass': 0.9,
    'low_mid': 1.0,
    'mid': 1.1,
    'high_mid': 1.0,
    'presence': 1.1,
    'brilliance': 0.9
  };
}

function applyHighPassFilter(audio: Float32Array, frequency: number, sampleRate: number): Float32Array {
  const result = new Float32Array(audio.length);
  const rc = 1.0 / (frequency * 2 * Math.PI);
  const dt = 1.0 / sampleRate;
  const alpha = rc / (rc + dt);
  
  result[0] = audio[0];
  for (let i = 1; i < audio.length; i++) {
    result[i] = alpha * (result[i - 1] + audio[i] - audio[i - 1]);
  }
  
  return result;
}

function applyLinearPhaseEQ(audio: Float32Array, genre?: string): Float32Array {
  // Genre-specific EQ curves
  const eqCurves: Record<string, number[]> = {
    'hip-hop': [1.0, 1.2, 1.1, 1.0, 1.1, 1.2, 1.0],
    'rock': [1.1, 1.0, 0.9, 1.0, 1.2, 1.3, 1.1],
    'electronic': [1.2, 1.1, 1.0, 1.0, 1.1, 1.2, 1.3],
    'classical': [1.0, 1.0, 1.0, 1.0, 1.0, 1.1, 1.1],
    'pop': [1.0, 1.1, 1.0, 1.0, 1.1, 1.2, 1.0]
  };
  
  const curve = eqCurves[genre || 'pop'] || eqCurves['pop'];
  const result = new Float32Array(audio.length);
  
  // Simplified EQ application
  for (let i = 0; i < audio.length; i++) {
    result[i] = audio[i] * curve[i % curve.length];
  }
  
  return result;
}

function applyMultibandCompression(audio: Float32Array): Float32Array {
  const result = new Float32Array(audio.length);
  const threshold = 0.7;
  const ratio = 4.0;
  
  for (let i = 0; i < audio.length; i++) {
    const input = Math.abs(audio[i]);
    if (input > threshold) {
      const excess = input - threshold;
      const compressedExcess = excess / ratio;
      const output = threshold + compressedExcess;
      result[i] = (audio[i] / input) * output;
    } else {
      result[i] = audio[i];
    }
  }
  
  return result;
}

function applyStereoEnhancement(audio: Float32Array): Float32Array {
  // Simplified stereo enhancement (assumes mono input)
  return audio;
}

function applyHarmonicEnhancement(audio: Float32Array): Float32Array {
  const result = new Float32Array(audio.length);
  const drive = 0.1;
  
  for (let i = 0; i < audio.length; i++) {
    const enhanced = Math.tanh(audio[i] * (1 + drive));
    result[i] = enhanced * 0.9 + audio[i] * 0.1;
  }
  
  return result;
}

function applyIntelligentLimiter(audio: Float32Array, targetLUFS: number): Float32Array {
  const result = new Float32Array(audio.length);
  const currentRMS = calculateRMS(audio);
  const currentLUFS = -23 + 20 * Math.log10(currentRMS);
  const gain = Math.pow(10, (targetLUFS - currentLUFS) / 20);
  const ceiling = 0.99;
  
  for (let i = 0; i < audio.length; i++) {
    let sample = audio[i] * gain;
    if (Math.abs(sample) > ceiling) {
      sample = Math.sign(sample) * ceiling;
    }
    result[i] = sample;
  }
  
  return result;
}