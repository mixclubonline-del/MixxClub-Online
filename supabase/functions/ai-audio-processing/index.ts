import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AIProcessingRequest {
  audioData: Float32Array;
  effectType: 'pitch' | 'harmony' | 'reverb' | 'filter' | 'enhance' | 'spatial';
  parameters: { [key: string]: number };
  trackId: string;
  userId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audioData, effectType, parameters, trackId, userId }: AIProcessingRequest = await req.json();
    
    console.log(`Processing ${effectType} effect for track ${trackId}`);

    // Simulate AI processing based on effect type
    const processedAudio = await processAudioWithAI(audioData, effectType, parameters);
    
    // Generate analysis data
    const analysis = generateAudioAnalysis(audioData, effectType);
    
    // Create response
    const response = {
      success: true,
      processedAudio: Array.from(processedAudio), // Convert to regular array for JSON
      analysis,
      effectType,
      parameters,
      trackId,
      processingTime: Date.now(),
      suggestions: generateAISuggestions(effectType, parameters, analysis)
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('AI Processing Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error?.message || 'Processing failed',
      timestamp: Date.now()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processAudioWithAI(
  audioData: Float32Array, 
  effectType: string, 
  parameters: { [key: string]: number }
): Promise<Float32Array> {
  // Simulate AI processing with realistic audio manipulation
  const processed = new Float32Array(audioData.length);
  
  switch (effectType) {
    case 'pitch':
      // Simulate pitch correction
      for (let i = 0; i < audioData.length; i++) {
        const correction = parameters.correction / 100;
        const speed = Math.max(0.1, parameters.speed / 100);
        processed[i] = audioData[i] * (1 + correction * 0.1 * Math.sin(i * speed));
      }
      break;

    case 'harmony':
      // Simulate harmony generation
      for (let i = 0; i < audioData.length; i++) {
        const voiceCount = parameters.voices || 2;
        const spread = parameters.spread / 100;
        let harmonized = audioData[i];
        
        for (let v = 1; v <= voiceCount; v++) {
          const offset = v * spread * 0.1;
          const harmonicIndex = Math.min(audioData.length - 1, Math.floor(i + offset * 100));
          harmonized += audioData[harmonicIndex] * (0.5 / v);
        }
        
        processed[i] = harmonized / (1 + voiceCount * 0.3);
      }
      break;

    case 'reverb':
      // Simulate reverb effect
      const roomSize = parameters.room / 100;
      const decay = parameters.decay / 100;
      
      for (let i = 0; i < audioData.length; i++) {
        let reverbed = audioData[i];
        
        // Add early reflections
        for (let delay = 1; delay <= 10; delay++) {
          const delayIndex = i - Math.floor(delay * roomSize * 20);
          if (delayIndex >= 0) {
            reverbed += audioData[delayIndex] * (decay * 0.1 / delay);
          }
        }
        
        processed[i] = reverbed;
      }
      break;

    case 'filter':
      // Simulate adaptive filtering
      const cutoff = parameters.cutoff / 20000; // Normalize to 0-1
      const resonance = parameters.resonance / 100;
      
      for (let i = 1; i < audioData.length; i++) {
        const filtered = audioData[i] * cutoff + processed[i-1] * (1 - cutoff);
        processed[i] = filtered + (filtered - processed[i-1]) * resonance;
      }
      break;

    case 'enhance':
      // Simulate AI enhancement
      for (let i = 0; i < audioData.length; i++) {
        const clarity = parameters.clarity / 100;
        const warmth = parameters.warmth / 100;
        const presence = parameters.presence / 100;
        
        let enhanced = audioData[i];
        enhanced *= (1 + clarity * 0.2); // Clarity boost
        enhanced = Math.tanh(enhanced * (1 + warmth * 0.3)); // Warmth (soft saturation)
        enhanced *= (1 + presence * 0.15); // Presence boost
        
        processed[i] = Math.max(-1, Math.min(1, enhanced));
      }
      break;

    case 'spatial':
      // Simulate 3D spatialization
      const width = parameters.width / 100;
      const depth = parameters.depth / 100;
      
      for (let i = 0; i < audioData.length; i++) {
        const spatial = audioData[i];
        const panorama = Math.sin(i * 0.001) * width;
        const depthEffect = Math.cos(i * 0.0005) * depth * 0.3;
        
        processed[i] = spatial * (1 + panorama * 0.2 + depthEffect);
      }
      break;

    default:
      // Pass through unprocessed
      processed.set(audioData);
  }

  return processed;
}

function generateAudioAnalysis(audioData: Float32Array, effectType: string) {
  // Calculate basic audio metrics
  let rms = 0;
  let peak = 0;
  let dynamicRange = 0;
  
  for (let i = 0; i < audioData.length; i++) {
    const sample = Math.abs(audioData[i]);
    rms += sample * sample;
    peak = Math.max(peak, sample);
  }
  
  rms = Math.sqrt(rms / audioData.length);
  dynamicRange = peak > 0 ? 20 * Math.log10(peak / (rms + 0.001)) : 0;
  
  // Calculate frequency content (simplified)
  const frequencyBins = {
    low: 0,
    mid: 0,
    high: 0
  };
  
  const binSize = Math.floor(audioData.length / 3);
  for (let i = 0; i < audioData.length; i++) {
    const sample = Math.abs(audioData[i]);
    if (i < binSize) frequencyBins.low += sample;
    else if (i < binSize * 2) frequencyBins.mid += sample;
    else frequencyBins.high += sample;
  }
  
  frequencyBins.low /= binSize;
  frequencyBins.mid /= binSize;
  frequencyBins.high /= binSize;

  return {
    rms: Math.round(rms * 100) / 100,
    peak: Math.round(peak * 100) / 100,
    dynamicRange: Math.round(dynamicRange * 10) / 10,
    frequencyBalance: frequencyBins,
    quality: calculateQualityScore(rms, peak, dynamicRange),
    effectType,
    timestamp: Date.now()
  };
}

function calculateQualityScore(rms: number, peak: number, dynamicRange: number): number {
  // Simple quality scoring algorithm
  let score = 50; // Base score
  
  // Good RMS level (not too quiet, not too loud)
  if (rms > 0.1 && rms < 0.7) score += 20;
  else score -= Math.abs(0.4 - rms) * 50;
  
  // Good peak management (avoid clipping)
  if (peak < 0.95) score += 15;
  else score -= (peak - 0.95) * 100;
  
  // Good dynamic range
  if (dynamicRange > 10 && dynamicRange < 30) score += 15;
  else score -= Math.abs(20 - dynamicRange);
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

function generateAISuggestions(effectType: string, parameters: any, analysis: any): string[] {
  const suggestions: string[] = [];
  
  switch (effectType) {
    case 'pitch':
      if (parameters.correction > 80) {
        suggestions.push("Consider reducing pitch correction for a more natural sound");
      }
      if (analysis.quality < 70) {
        suggestions.push("Try adjusting the speed parameter for better pitch tracking");
      }
      break;
      
    case 'harmony':
      if (parameters.voices > 3) {
        suggestions.push("Many voices can muddy the mix - try fewer harmonies");
      }
      if (analysis.frequencyBalance.mid < 0.3) {
        suggestions.push("Consider EQing the mid frequencies for clarity");
      }
      break;
      
    case 'reverb':
      if (parameters.room > 70 && parameters.decay > 60) {
        suggestions.push("Large room with long decay may overwhelm the mix");
      }
      if (analysis.dynamicRange < 10) {
        suggestions.push("Consider using less reverb to preserve dynamics");
      }
      break;
      
    case 'enhance':
      if (parameters.clarity > 80) {
        suggestions.push("High clarity settings may introduce harshness");
      }
      if (analysis.quality > 85) {
        suggestions.push("Great enhancement! Consider subtle adjustments for polish");
      }
      break;
  }
  
  // General suggestions based on analysis
  if (analysis.peak > 0.9) {
    suggestions.push("Audio is close to clipping - consider reducing gain");
  }
  
  if (analysis.dynamicRange < 5) {
    suggestions.push("Low dynamic range detected - consider using less compression");
  }
  
  if (analysis.rms < 0.1) {
    suggestions.push("Audio level is quite low - consider boosting the signal");
  }
  
  return suggestions;
}