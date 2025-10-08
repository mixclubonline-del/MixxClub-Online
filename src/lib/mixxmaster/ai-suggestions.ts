import { supabase } from '@/integrations/supabase/client';

export interface AISuggestion {
  id: string;
  type: 'eq' | 'compression' | 'balance' | 'effects' | 'arrangement';
  title: string;
  description: string;
  confidence: number;
  parameters: Record<string, any>;
  targetStem?: string;
  impact: 'low' | 'medium' | 'high';
}

export interface AudioAnalysis {
  spectralBalance: {
    lowEnd: number;
    midRange: number;
    highEnd: number;
  };
  dynamics: {
    crestFactor: number;
    rmsLevel: number;
    peakLevel: number;
  };
  stereoField: {
    width: number;
    phaseCorrelation: number;
  };
  tempo: {
    bpm: number;
    confidence: number;
  };
}

export async function analyzeAudioForSuggestions(
  sessionId: string,
  stems: Array<{ id: string; name: string; audioData: Float32Array }>
): Promise<AISuggestion[]> {
  const suggestions: AISuggestion[] = [];

  for (const stem of stems) {
    const analysis = analyzeAudioData(stem.audioData);
    
    // EQ suggestions based on spectral balance
    if (analysis.spectralBalance.lowEnd > 0.6) {
      suggestions.push({
        id: `eq_${stem.id}_low`,
        type: 'eq',
        title: 'Reduce Low-End Mud',
        description: `${stem.name} has excessive low-end energy. Apply high-pass filter at 80Hz and reduce 200-400Hz by -3dB`,
        confidence: 0.85,
        parameters: {
          highPassFreq: 80,
          reductionFreq: 300,
          reductionDb: -3
        },
        targetStem: stem.id,
        impact: 'high'
      });
    }

    if (analysis.spectralBalance.highEnd < 0.3) {
      suggestions.push({
        id: `eq_${stem.id}_high`,
        type: 'eq',
        title: 'Add Air and Presence',
        description: `${stem.name} lacks high-frequency sparkle. Boost 8-12kHz by +2dB for clarity`,
        confidence: 0.78,
        parameters: {
          boostFreq: 10000,
          boostDb: 2,
          q: 0.7
        },
        targetStem: stem.id,
        impact: 'medium'
      });
    }

    // Compression suggestions based on dynamics
    if (analysis.dynamics.crestFactor > 15) {
      suggestions.push({
        id: `comp_${stem.id}`,
        type: 'compression',
        title: 'Control Dynamic Range',
        description: `${stem.name} has inconsistent levels. Apply compression with 3:1 ratio, -12dB threshold`,
        confidence: 0.82,
        parameters: {
          ratio: 3,
          threshold: -12,
          attack: 10,
          release: 100
        },
        targetStem: stem.id,
        impact: 'high'
      });
    }

    // Stereo width suggestions
    if (analysis.stereoField.width < 0.4) {
      suggestions.push({
        id: `stereo_${stem.id}`,
        type: 'effects',
        title: 'Widen Stereo Image',
        description: `${stem.name} sounds narrow. Apply subtle stereo widening (110-120%)`,
        confidence: 0.75,
        parameters: {
          widthPercent: 115,
          preserveMono: true
        },
        targetStem: stem.id,
        impact: 'medium'
      });
    }
  }

  // Global balance suggestions
  const globalBalance = calculateGlobalBalance(stems);
  if (globalBalance.vocalToInstrumentalRatio < 0.6) {
    suggestions.push({
      id: 'balance_vocals',
      type: 'balance',
      title: 'Vocals Too Quiet',
      description: 'Lead vocals are buried in the mix. Increase vocal volume by 2-3dB and add presence boost',
      confidence: 0.88,
      parameters: {
        volumeIncrease: 2.5,
        presenceBoostFreq: 3000,
        presenceBoostDb: 2
      },
      impact: 'high'
    });
  }

  // Store suggestions in database
  try {
    await supabase.functions.invoke('mixxmaster-ai-suggest', {
      body: { sessionId, suggestions }
    });
  } catch (error) {
    console.error('Failed to store AI suggestions:', error);
  }

  return suggestions.sort((a, b) => b.confidence - a.confidence);
}

function analyzeAudioData(audioData: Float32Array): AudioAnalysis {
  // Calculate RMS and peak levels
  let sumSquares = 0;
  let peak = 0;
  
  for (let i = 0; i < audioData.length; i++) {
    const sample = Math.abs(audioData[i]);
    sumSquares += sample * sample;
    peak = Math.max(peak, sample);
  }
  
  const rms = Math.sqrt(sumSquares / audioData.length);
  const crestFactor = peak > 0 ? 20 * Math.log10(peak / rms) : 0;

  // Simplified spectral analysis (frequency bands)
  const lowEnd = analyzeFrequencyBand(audioData, 0, 250);
  const midRange = analyzeFrequencyBand(audioData, 250, 2000);
  const highEnd = analyzeFrequencyBand(audioData, 2000, 20000);

  // Stereo analysis (if stereo data available)
  const stereoWidth = calculateStereoWidth(audioData);
  const phaseCorrelation = calculatePhaseCorrelation(audioData);

  // Tempo detection (simplified)
  const tempo = detectTempo(audioData);

  return {
    spectralBalance: { lowEnd, midRange, highEnd },
    dynamics: {
      crestFactor,
      rmsLevel: 20 * Math.log10(rms),
      peakLevel: 20 * Math.log10(peak)
    },
    stereoField: { width: stereoWidth, phaseCorrelation },
    tempo
  };
}

function analyzeFrequencyBand(audioData: Float32Array, lowFreq: number, highFreq: number): number {
  // Simplified band energy calculation
  // In production, use FFT for accurate frequency analysis
  const bandEnergy = audioData.reduce((sum, sample, i) => {
    // Simplified frequency mapping
    const freq = (i / audioData.length) * 22050;
    if (freq >= lowFreq && freq <= highFreq) {
      return sum + sample * sample;
    }
    return sum;
  }, 0);

  return Math.min(1, bandEnergy / (audioData.length * 0.1));
}

function calculateStereoWidth(audioData: Float32Array): number {
  // Simplified stereo width (assumes interleaved L/R)
  let sumDifference = 0;
  let count = 0;

  for (let i = 0; i < audioData.length - 1; i += 2) {
    const left = audioData[i];
    const right = audioData[i + 1];
    sumDifference += Math.abs(left - right);
    count++;
  }

  return count > 0 ? Math.min(1, sumDifference / count) : 0.5;
}

function calculatePhaseCorrelation(audioData: Float32Array): number {
  // Simplified phase correlation
  let sumProduct = 0;
  let sumLeft = 0;
  let sumRight = 0;

  for (let i = 0; i < audioData.length - 1; i += 2) {
    const left = audioData[i];
    const right = audioData[i + 1];
    sumProduct += left * right;
    sumLeft += left * left;
    sumRight += right * right;
  }

  const denominator = Math.sqrt(sumLeft * sumRight);
  return denominator > 0 ? sumProduct / denominator : 1;
}

function detectTempo(audioData: Float32Array): { bpm: number; confidence: number } {
  // Simplified tempo detection via onset detection
  const onsets = detectOnsets(audioData);
  const avgInterval = onsets.length > 1
    ? (onsets[onsets.length - 1] - onsets[0]) / (onsets.length - 1)
    : 0;

  const bpm = avgInterval > 0 ? 60 / avgInterval : 120;
  const confidence = Math.min(0.9, onsets.length / 100);

  return { bpm: Math.round(bpm), confidence };
}

function detectOnsets(audioData: Float32Array): number[] {
  const onsets: number[] = [];
  const windowSize = 512;
  const hopSize = 256;
  const threshold = 0.3;

  for (let i = 0; i < audioData.length - windowSize; i += hopSize) {
    const windowEnergy = audioData.slice(i, i + windowSize)
      .reduce((sum, sample) => sum + sample * sample, 0) / windowSize;

    if (windowEnergy > threshold && (onsets.length === 0 || i - onsets[onsets.length - 1] > hopSize * 2)) {
      onsets.push(i / 44100); // Convert to seconds (assuming 44.1kHz)
    }
  }

  return onsets;
}

function calculateGlobalBalance(stems: Array<{ name: string; audioData: Float32Array }>) {
  const vocalStems = stems.filter(s => s.name.toLowerCase().includes('vocal'));
  const instrumentalStems = stems.filter(s => !s.name.toLowerCase().includes('vocal'));

  const vocalEnergy = vocalStems.reduce((sum, stem) => 
    sum + stem.audioData.reduce((s, sample) => s + sample * sample, 0), 0);
  
  const instrumentalEnergy = instrumentalStems.reduce((sum, stem) => 
    sum + stem.audioData.reduce((s, sample) => s + sample * sample, 0), 0);

  const vocalToInstrumentalRatio = instrumentalEnergy > 0
    ? Math.sqrt(vocalEnergy / instrumentalEnergy)
    : 1;

  return { vocalToInstrumentalRatio };
}

export async function applySuggestion(
  sessionId: string,
  suggestionId: string,
  stemId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('ai_mixing_suggestions')
      .update({
        applied: true,
        applied_at: new Date().toISOString(),
        applied_by: (await supabase.auth.getUser()).data.user?.id
      })
      .eq('id', suggestionId);

    return !error;
  } catch (error) {
    console.error('Failed to mark suggestion as applied:', error);
    return false;
  }
}
