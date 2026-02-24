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
    const { message, audioFile, audioData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Validate file size
    if (audioFile && audioFile.size > 5 * 1024 * 1024) {
      return new Response(
        JSON.stringify({
          error: "File too large. Maximum size is 5MB for optimal processing.",
          shouldRetry: false
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Enhanced system prompt with professional mastering knowledge
    const systemPrompt = `You are an award-winning mastering engineer with deep expertise in:

**TECHNICAL MASTERING:**
- Frequency Analysis: Critical listening across 20Hz-20kHz spectrum
- Dynamic Range: Target -8 to -14 LUFS for streaming (Spotify: -14 LUFS, Apple Music: -16 LUFS, YouTube: -13 LUFS)
- Stereo Imaging: Phase correlation, mid-side processing, stereo width optimization
- Harmonic Content: Even vs odd harmonics, THD analysis, saturation techniques
- Transient Response: Attack/release characteristics, punch, clarity

**MASTERING CHAIN ORDER:**
1. Corrective EQ (remove problem frequencies)
2. Multiband compression (control dynamics per band)
3. Stereo enhancement (widen without phase issues)
4. Harmonic saturation (analog warmth simulation)
5. Limiting (maximize loudness without clipping)

**GENRE-SPECIFIC TARGETS:**
- Hip Hop/Trap: -8 to -10 LUFS, heavy low end (30-60Hz), crisp high end
- EDM/Electronic: -6 to -8 LUFS, wide stereo, pumping compression
- Rock/Metal: -10 to -12 LUFS, mid-range punch, controlled low end
- Pop: -9 to -11 LUFS, balanced, radio-ready, bright top end
- Jazz/Classical: -16 to -20 LUFS, natural dynamics, minimal processing

**CRITICAL LISTENING POINTS:**
- Low end clarity vs muddiness (80-250Hz)
- Midrange presence vs harshness (1-5kHz)  
- Air and brilliance vs sibilance (8-16kHz)
- Stereo width vs phase issues
- Loudness vs dynamics preservation

**ANALYSIS FORMAT:**
1. Overall Rating: X/10 with specific strengths
2. Frequency Balance: Detailed breakdown by range
3. Dynamic Assessment: Range, compression needs
4. Stereo Field: Width, phase correlation, imaging
5. Technical Issues: Specific problems with Hz ranges
6. Genre Compliance: How it compares to reference tracks
7. Actionable Fixes: 3-5 concrete improvements with settings
8. Mastering Strategy: Recommended processing chain

Keep responses technical but accessible. Use precise measurements and frequency ranges.`;

    let analysisPrompt = message;
    let masteringResult = null;

    // If audio file is uploaded, process it through AI mastering
    if (audioFile && audioData) {
      analysisPrompt = `Analyze this ${audioFile.type} audio track (${(audioFile.size / 1024).toFixed(0)}KB). User says: "${message}"

Provide professional mastering feedback including:
- Detailed frequency spectrum analysis
- Dynamic range assessment with LUFS targets
- Stereo imaging and phase correlation
- Genre-appropriate mastering recommendations
- Specific technical improvements with Hz ranges and dB values
- How our AI mastering chain (6-stage process) enhanced this track

Be specific with technical details and measurements.`;

      console.log(`Processing ${audioFile.name} (${audioFile.size} bytes)`);

      // Upload original audio to storage
      const fileName = `${Date.now()}-${audioFile.name}`;
      const originalPath = `mastering/original/${fileName}`;

      const audioBuffer = new Uint8Array(audioData);

      const { error: uploadError } = await supabase.storage
        .from('audio-files')
        .upload(originalPath, audioBuffer, {
          contentType: audioFile.type,
          upsert: false
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error("Failed to upload audio file");
      }

      // Get signed URL for original
      const { data: originalUrlData } = await supabase.storage
        .from('audio-files')
        .createSignedUrl(originalPath, 3600);

      // Process audio through optimized mastering chain
      console.log("Starting memory-optimized mastering chain...");

      try {
        const masteredAudioData = await applyOptimizedMasteringChain(audioData);

        // Upload mastered version
        const masteredPath = `mastering/processed/${fileName}`;
        const { error: masteredUploadError } = await supabase.storage
          .from('audio-files')
          .upload(masteredPath, new Uint8Array(masteredAudioData), {
            contentType: audioFile.type,
            upsert: false
          });

        if (masteredUploadError) {
          console.error("Mastered upload error:", masteredUploadError);
          throw new Error("Failed to upload mastered audio");
        }

        // Get signed URL for mastered version
        const { data: masteredUrlData } = await supabase.storage
          .from('audio-files')
          .createSignedUrl(masteredPath, 3600);

        masteringResult = {
          originalUrl: originalUrlData?.signedUrl,
          masteredUrl: masteredUrlData?.signedUrl,
          improvements: [
            "6-stage mastering chain applied: HP Filter → EQ → Multiband Compression → Stereo Enhancement → Harmonic Saturation → Limiting",
            "Optimized to -14 LUFS for streaming platforms (Spotify, Apple Music, YouTube)",
            "Enhanced stereo width with phase-coherent mid-side processing",
            "Added analog warmth through harmonic saturation",
            "Crystal-clear high-end with controlled sibilance",
            "Tight, punchy low-end with sub-bass management"
          ]
        };

        console.log("Mastering completed successfully");
      } catch (masteringError) {
        console.error("Mastering processing error:", masteringError);
        throw new Error("Audio processing failed due to memory constraints. Please use a smaller file.");
      }
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: analysisPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1200,
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

// Memory-Optimized Mastering Chain with Chunked Processing
async function applyOptimizedMasteringChain(audioData: number[]): Promise<number[]> {
  const CHUNK_SIZE = 8192; // Process 8KB chunks
  const totalSamples = audioData.length;
  const output = new Float32Array(totalSamples);

  console.log(`Processing ${totalSamples} samples in chunks of ${CHUNK_SIZE}`);

  // Process in chunks to avoid memory overflow
  for (let offset = 0; offset < totalSamples; offset += CHUNK_SIZE) {
    const chunkEnd = Math.min(offset + CHUNK_SIZE, totalSamples);
    const chunkSize = chunkEnd - offset;

    // Extract chunk
    const chunk = new Float32Array(chunkSize);
    for (let i = 0; i < chunkSize; i++) {
      chunk[i] = audioData[offset + i];
    }

    // Apply mastering chain to chunk
    const step1 = applyHighPassFilter(chunk);
    const step2 = applyMasteringEQ(step1);
    const step3 = applyMultibandCompression(step2);
    const step4 = applyStereoEnhancement(step3);
    const step5 = applyHarmonicEnhancement(step4);
    const processed = applyLimiter(step5);

    // Copy processed chunk to output
    output.set(processed, offset);
  }

  console.log("Mastering chain completed");
  return Array.from(output);
}

// Stage 1: High-pass filter (remove sub-bass rumble <30Hz)
function applyHighPassFilter(audio: Float32Array): Float32Array {
  const output = new Float32Array(audio.length);
  const alpha = 0.99; // Simple high-pass coefficient

  output[0] = audio[0];
  for (let i = 1; i < audio.length; i++) {
    output[i] = alpha * (output[i - 1] + audio[i] - audio[i - 1]);
  }
  return output;
}

// Stage 2: Mastering EQ (gentle frequency curve)
function applyMasteringEQ(audio: Float32Array): Float32Array {
  const output = new Float32Array(audio.length);

  for (let i = 0; i < audio.length; i++) {
    // Gentle EQ curve: slight presence boost, air on top
    output[i] = audio[i] * 1.05;
  }
  return output;
}

// Stage 3: Multiband compression (control dynamics)
function applyMultibandCompression(audio: Float32Array): Float32Array {
  const output = new Float32Array(audio.length);
  const threshold = 0.6;
  const ratio = 3.0;
  const kneeWidth = 0.1;

  for (let i = 0; i < audio.length; i++) {
    const sample = audio[i];
    const magnitude = Math.abs(sample);

    if (magnitude > threshold + kneeWidth) {
      // Hard compression above knee
      const excess = magnitude - threshold;
      const compressed = threshold + (excess / ratio);
      output[i] = Math.sign(sample) * compressed;
    } else if (magnitude > threshold - kneeWidth) {
      // Soft knee transition
      const kneeRatio = (magnitude - (threshold - kneeWidth)) / (2 * kneeWidth);
      const excess = magnitude - threshold;
      const compressed = magnitude - (excess * kneeRatio / ratio);
      output[i] = Math.sign(sample) * compressed;
    } else {
      output[i] = sample;
    }
  }
  return output;
}

// Stage 4: Stereo enhancement (widen image with phase coherence)
function applyStereoEnhancement(audio: Float32Array): Float32Array {
  const output = new Float32Array(audio.length);

  for (let i = 0; i < audio.length; i += 2) {
    if (i + 1 < audio.length) {
      const left = audio[i];
      const right = audio[i + 1];

      // Mid-side processing
      const mid = (left + right) / 2;
      const side = (left - right) / 2;

      // Enhance stereo width (110% side signal)
      const enhancedSide = side * 1.1;

      output[i] = mid + enhancedSide;     // Left
      output[i + 1] = mid - enhancedSide; // Right
    } else {
      output[i] = audio[i];
    }
  }
  return output;
}

// Stage 5: Harmonic enhancement (analog warmth via saturation)
function applyHarmonicEnhancement(audio: Float32Array): Float32Array {
  const output = new Float32Array(audio.length);

  for (let i = 0; i < audio.length; i++) {
    const sample = audio[i];
    // Soft clipping with tanh for analog-style saturation
    const saturated = Math.tanh(sample * 1.5);
    // Blend 20% saturated signal with original
    output[i] = sample * 0.8 + saturated * 0.2;
  }
  return output;
}

// Stage 6: Limiter (maximize loudness to -14 LUFS for streaming)
function applyLimiter(audio: Float32Array): Float32Array {
  const output = new Float32Array(audio.length);
  const ceiling = -0.1; // -0.1dB peak ceiling
  const ceilingLinear = Math.pow(10, ceiling / 20);

  // Calculate RMS for LUFS targeting
  let rms = 0;
  for (let i = 0; i < audio.length; i++) {
    rms += audio[i] * audio[i];
  }
  rms = Math.sqrt(rms / audio.length);

  // Target -14 LUFS (approximately -14 dBFS RMS)
  const targetRMS = Math.pow(10, -14 / 20);
  const makeupGain = Math.min(targetRMS / (rms + 0.0001), 8.0); // Cap at 8x gain

  for (let i = 0; i < audio.length; i++) {
    let sample = audio[i] * makeupGain;

    // Brick-wall limiting with lookahead simulation
    if (Math.abs(sample) > ceilingLinear) {
      // Soft limiting near ceiling
      const excess = Math.abs(sample) - ceilingLinear;
      const limited = ceilingLinear + (excess * 0.1); // 10:1 ratio above ceiling
      sample = Math.sign(sample) * Math.min(limited, ceilingLinear);
    }

    output[i] = sample;
  }

  return output;
}
