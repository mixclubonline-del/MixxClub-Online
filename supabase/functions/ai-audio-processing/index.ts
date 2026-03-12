import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { safeErrorResponse } from "../_shared/error-handler.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AIProcessingRequest {
  audioData: number[]; // Changed from Float32Array to number[] for JSON compatibility
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
    
    // Generate analysis data (convert to Float32Array for analysis)
    const analysis = generateAudioAnalysis(new Float32Array(audioData), effectType);
    
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

  } catch (error) {
    return safeErrorResponse(error, corsHeaders);
  }
});

async function processAudioWithAI(
  audioData: number[], 
  effectType: string, 
  parameters: { [key: string]: number }
): Promise<Float32Array> {
  // Convert back to Float32Array for processing
  const audioFloat32 = new Float32Array(audioData);
  // Simulate AI processing with realistic audio manipulation
  const processed = new Float32Array(audioFloat32.length);
  
  switch (effectType) {
    case 'pitch':
      // Simulate pitch correction
      for (let i = 0; i < audioFloat32.length; i++) {
        const correction = parameters.correction / 100;
        const speed = Math.max(0.1, parameters.speed / 100);
        processed[i] = audioFloat32[i] * (1 + correction * 0.1 * Math.sin(i * speed));
      }
      break;

    case 'harmony':
      // Simulate harmony generation
      for (let i = 0; i < audioFloat32.length; i++) {
        const voiceCount = parameters.voices || 2;
        const spread = parameters.spread / 100;
        let harmonized = audioFloat32[i];
        
        for (let v = 1; v <= voiceCount; v++) {
          const offset = v * spread * 0.1;
          const harmonicIndex = Math.min(audioFloat32.length - 1, Math.floor(i + offset * 100));
          harmonized += audioFloat32[harmonicIndex] * (0.5 / v);
        }
        
        processed[i] = harmonized / (1 + voiceCount * 0.3);
      }
      break;

    case 'reverb':
      // Simulate reverb effect
      const roomSize = parameters.room / 100;
      const decay = parameters.decay / 100;
      
      for (let i = 0; i < audioFloat32.length; i++) {
        let reverbed = audioFloat32[i];
        
        // Add early reflections
        for (let delay = 1; delay <= 10; delay++) {
          const delayIndex = i - Math.floor(delay * roomSize * 20);
          if (delayIndex >= 0) {
            reverbed += audioFloat32[delayIndex] * (decay * 0.1 / delay);
          }
        }
        
        processed[i] = reverbed;
      }
      break;

    case 'filter':
      // Simulate adaptive filtering
      const cutoff = parameters.cutoff / 20000; // Normalize to 0-1
      const resonance = parameters.resonance / 100;
      
      for (let i = 1; i < audioFloat32.length; i++) {
        const filtered = audioFloat32[i] * cutoff + processed[i-1] * (1 - cutoff);
        processed[i] = filtered + (filtered - processed[i-1]) * resonance;
      }
      break;

    case 'enhance':
      // Simulate AI enhancement
      for (let i = 0; i < audioFloat32.length; i++) {
        const clarity = parameters.clarity / 100;
        const warmth = parameters.warmth / 100;
        const presence = parameters.presence / 100;
        
        let enhanced = audioFloat32[i];
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
      
      for (let i = 0; i < audioFloat32.length; i++) {
        const spatial = audioFloat32[i];
        const panorama = Math.sin(i * 0.001) * width;
        const depthEffect = Math.cos(i * 0.0005) * depth * 0.3;
        
        processed[i] = spatial * (1 + panorama * 0.2 + depthEffect);
      }
      break;

    default:
      // Pass through unprocessed
      processed.set(audioFloat32);
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
  
  // Normalize frequency content
  const totalEnergy = frequencyBins.low + frequencyBins.mid + frequencyBins.high;
  if (totalEnergy > 0) {
    frequencyBins.low /= totalEnergy;
    frequencyBins.mid /= totalEnergy;
    frequencyBins.high /= totalEnergy;
  }
  
  // Calculate quality score
  const quality = Math.min(100, Math.max(0, 
    (dynamicRange * 2) + 
    (rms * 100) + 
    ((1 - Math.abs(frequencyBins.mid - 0.4)) * 50)
  ));
  
  return {
    rms: Math.round(rms * 1000) / 1000,
    peak: Math.round(peak * 1000) / 1000,
    dynamicRange: Math.round(dynamicRange * 100) / 100,
    frequencyBalance: {
      low: Math.round(frequencyBins.low * 1000) / 1000,
      mid: Math.round(frequencyBins.mid * 1000) / 1000,
      high: Math.round(frequencyBins.high * 1000) / 1000
    },
    quality: Math.round(quality),
    effectType
  };
}

function generateAISuggestions(effectType: string, parameters: any, analysis: any): string[] {
  const suggestions: string[] = [];
  
  switch (effectType) {
    case 'pitch':
      if (parameters.correction > 50) {
        suggestions.push("Consider reducing pitch correction for more natural sound");
      }
      if (analysis.quality < 70) {
        suggestions.push("Try adjusting the correction speed for better results");
      }
      break;
      
    case 'harmony':
      if (parameters.voices > 3) {
        suggestions.push("Too many harmony voices might muddy the mix");
      }
      if (analysis.frequencyBalance.mid < 0.3) {
        suggestions.push("Consider boosting mid frequencies for clearer harmonies");
      }
      break;
      
    case 'reverb':
      if (parameters.room > 80) {
        suggestions.push("Large room sizes can create excessive reverb tail");
      }
      if (analysis.dynamicRange < 10) {
        suggestions.push("Try reducing reverb intensity to preserve dynamics");
      }
      break;
      
    case 'filter':
      if (parameters.resonance > 75) {
        suggestions.push("High resonance might cause unwanted ringing");
      }
      break;
      
    case 'enhance':
      if (parameters.clarity > 80) {
        suggestions.push("Excessive clarity enhancement can introduce harshness");
      }
      if (analysis.peak > 0.9) {
        suggestions.push("Consider reducing enhancement to prevent clipping");
      }
      break;
      
    case 'spatial':
      if (parameters.width > 90) {
        suggestions.push("Extreme width settings might cause phase issues");
      }
      break;
  }
  
  // General suggestions based on analysis
  if (analysis.rms < 0.1) {
    suggestions.push("Audio level is quite low, consider normalizing");
  }
  
  if (analysis.dynamicRange > 30) {
    suggestions.push("High dynamic range detected - consider gentle compression");
  }
  
  return suggestions;
}