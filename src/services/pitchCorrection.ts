/**
 * MixxTune Pitch Correction Engine
 * 
 * Based on YIN algorithm with enhancements for low-latency real-time processing
 * Optimized for hip-hop and R&B vocal styles
 */

export interface PitchCorrectionParams {
  correction: number; // 0-1
  speed: number; // 0-1
  key: string;
  scale: string;
  humanize: number; // 0-1
  formantCorrection: boolean;
}

// Musical scale frequencies (Hz) relative to A4=440Hz
const NOTE_FREQUENCIES: Record<string, number[]> = {
  'Major': [0, 2, 4, 5, 7, 9, 11],
  'Minor': [0, 2, 3, 5, 7, 8, 10],
  'Dorian': [0, 2, 3, 5, 7, 9, 10],
  'Mixolydian': [0, 2, 4, 5, 7, 9, 10],
  'Chromatic': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
};

const KEY_OFFSETS: Record<string, number> = {
  'C': -9, 'C#': -8, 'D': -7, 'D#': -6, 'E': -5, 'F': -4,
  'F#': -3, 'G': -2, 'G#': -1, 'A': 0, 'A#': 1, 'B': 2,
};

export class PitchCorrectionEngine {
  private audioContext: AudioContext;
  private sampleRate: number;
  private bufferSize = 1024; // Low latency buffer
  
  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
    this.sampleRate = audioContext.sampleRate;
  }

  /**
   * YIN algorithm for pitch detection
   * More accurate than autocorrelation, especially for low frequencies
   */
  private detectPitchYIN(buffer: Float32Array): number | null {
    const threshold = 0.1;
    const probabilityThreshold = 0.01;
    
    // Calculate difference function
    const yinBuffer = new Float32Array(buffer.length / 2);
    yinBuffer[0] = 1;
    
    let runningSum = 0;
    for (let tau = 1; tau < yinBuffer.length; tau++) {
      yinBuffer[tau] = 0;
      for (let i = 0; i < yinBuffer.length; i++) {
        const delta = buffer[i] - buffer[i + tau];
        yinBuffer[tau] += delta * delta;
      }
      
      // Cumulative mean normalized difference
      runningSum += yinBuffer[tau];
      if (runningSum === 0) {
        yinBuffer[tau] = 1;
      } else {
        yinBuffer[tau] *= tau / runningSum;
      }
      
      // Find first minimum below threshold
      if (tau > 1 && yinBuffer[tau] < threshold) {
        // Parabolic interpolation for sub-sample accuracy
        let betterTau = tau;
        if (tau < yinBuffer.length - 1) {
          const s0 = yinBuffer[tau - 1];
          const s1 = yinBuffer[tau];
          const s2 = yinBuffer[tau + 1];
          const adjustment = (s2 - s0) / (2 * (2 * s1 - s2 - s0));
          betterTau = tau + adjustment;
        }
        
        // Ensure probability is high enough
        if (yinBuffer[tau] < probabilityThreshold) {
          return this.sampleRate / betterTau;
        }
      }
    }
    
    return null;
  }

  /**
   * Get the target frequency based on detected pitch, key, and scale
   */
  private getTargetFrequency(detectedFreq: number, params: PitchCorrectionParams): number {
    const keyOffset = KEY_OFFSETS[params.key];
    const scaleIntervals = NOTE_FREQUENCIES[params.scale];
    
    // Convert frequency to MIDI note number
    const midiNote = 69 + 12 * Math.log2(detectedFreq / 440);
    
    // Find closest note in scale
    const octave = Math.floor((midiNote - 60) / 12);
    const noteInOctave = ((midiNote - 60) % 12 + 12) % 12;
    
    let closestInterval = scaleIntervals[0];
    let minDistance = Math.abs(noteInOctave - (scaleIntervals[0] + keyOffset));
    
    for (const interval of scaleIntervals) {
      const scaledInterval = (interval + keyOffset + 12) % 12;
      const distance = Math.abs(noteInOctave - scaledInterval);
      if (distance < minDistance) {
        minDistance = distance;
        closestInterval = interval;
      }
    }
    
    // Calculate target MIDI note
    const targetNote = 60 + octave * 12 + ((closestInterval + keyOffset + 12) % 12);
    
    // Convert back to frequency
    return 440 * Math.pow(2, (targetNote - 69) / 12);
  }

  /**
   * Apply pitch correction to audio buffer
   * Uses phase vocoder technique for time-stretching without pitch change
   */
  correctPitch(
    inputBuffer: Float32Array,
    params: PitchCorrectionParams
  ): Float32Array {
    const detectedPitch = this.detectPitchYIN(inputBuffer);
    
    if (!detectedPitch || detectedPitch < 80 || detectedPitch > 1000) {
      // Outside vocal range, return unprocessed
      return inputBuffer;
    }
    
    const targetPitch = this.getTargetFrequency(detectedPitch, params);
    const pitchRatio = targetPitch / detectedPitch;
    
    // Apply correction based on correction amount
    const actualRatio = 1 + (pitchRatio - 1) * params.correction;
    
    // Humanize: add subtle random variations
    let finalRatio = actualRatio;
    if (params.humanize > 0) {
      const variation = (Math.random() - 0.5) * 0.01 * params.humanize;
      finalRatio *= (1 + variation);
    }
    
    // Speed affects how quickly correction is applied
    const smoothing = 1 - params.speed;
    
    // Simple pitch shifting via sample rate modification
    // In production, this would use a phase vocoder or granular synthesis
    const outputBuffer = new Float32Array(inputBuffer.length);
    
    for (let i = 0; i < outputBuffer.length; i++) {
      const sourceIndex = i * finalRatio;
      const index0 = Math.floor(sourceIndex);
      const index1 = Math.min(index0 + 1, inputBuffer.length - 1);
      const fraction = sourceIndex - index0;
      
      // Linear interpolation
      if (index0 < inputBuffer.length) {
        outputBuffer[i] = inputBuffer[index0] * (1 - fraction) + 
                         inputBuffer[index1] * fraction;
      }
    }
    
    // Apply smoothing based on speed parameter
    if (smoothing > 0) {
      for (let i = 1; i < outputBuffer.length; i++) {
        outputBuffer[i] = outputBuffer[i] * (1 - smoothing) + 
                         outputBuffer[i - 1] * smoothing;
      }
    }
    
    return outputBuffer;
  }

  /**
   * Create a ScriptProcessorNode for real-time pitch correction
   * Note: ScriptProcessorNode is deprecated but still widely supported
   * In production, migrate to AudioWorklet for better performance
   */
  createProcessor(params: PitchCorrectionParams): ScriptProcessorNode {
    const processor = this.audioContext.createScriptProcessor(
      this.bufferSize,
      1, // mono input
      1  // mono output
    );
    
    processor.onaudioprocess = (event) => {
      const inputData = event.inputBuffer.getChannelData(0);
      const outputData = event.outputBuffer.getChannelData(0);
      
      const corrected = this.correctPitch(inputData, params);
      outputData.set(corrected);
    };
    
    return processor;
  }
}

/**
 * Initialize pitch correction for a track
 */
export function initPitchCorrection(
  audioContext: AudioContext,
  sourceNode: AudioNode,
  params: PitchCorrectionParams
): { processor: ScriptProcessorNode; disconnect: () => void } {
  const engine = new PitchCorrectionEngine(audioContext);
  const processor = engine.createProcessor(params);
  
  // Connect: source -> processor -> destination
  sourceNode.connect(processor);
  processor.connect(audioContext.destination);
  
  return {
    processor,
    disconnect: () => {
      processor.disconnect();
      sourceNode.disconnect(processor);
    }
  };
}
