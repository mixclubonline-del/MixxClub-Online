/**
 * MixxTune Melody Analyzer
 * 
 * Extracts melodic features from audio for AI-powered pitch correction adaptation
 * Works in conjunction with Gemini AI to provide context-aware auto-tune
 */

export interface AudioFeatures {
  spectralCentroid: number;
  zeroCrossingRate: number;
  frequencyPeaks: number[];
  rmsEnergy: number;
  pitchVariance: number;
  tempo?: number;
}

export interface MelodyAnalysis {
  pattern_type: 'sustained' | 'stepwise' | 'ornamental' | 'melismatic' | 'rapped' | 'mixed';
  correction_strength: number;
  speed_factor: number;
  humanize_factor: number;
  context_description: string;
  style_notes: string;
  detected_phrases?: Array<{
    start_time: number;
    pattern: string;
    intensity: 'low' | 'medium' | 'high';
  }>;
}

export class MelodyAnalyzer {
  private audioContext: AudioContext;
  private analyserNode: AnalyserNode;
  private lastAnalysis: MelodyAnalysis | null = null;
  private analysisInterval: number | null = null;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
    this.analyserNode = audioContext.createAnalyser();
    this.analyserNode.fftSize = 4096; // Higher resolution for melody detection
    this.analyserNode.smoothingTimeConstant = 0.8;
  }

  /**
   * Connect audio source for real-time analysis
   */
  connect(sourceNode: AudioNode, destinationNode: AudioNode) {
    sourceNode.connect(this.analyserNode);
    this.analyserNode.connect(destinationNode);
  }

  /**
   * Extract audio features from current audio buffer
   */
  extractFeatures(): AudioFeatures {
    const bufferLength = this.analyserNode.frequencyBinCount;
    const frequencyData = new Uint8Array(bufferLength);
    const timeData = new Uint8Array(bufferLength);
    
    this.analyserNode.getByteFrequencyData(frequencyData);
    this.analyserNode.getByteTimeDomainData(timeData);

    // Calculate spectral centroid (brightness)
    let weightedSum = 0;
    let totalMagnitude = 0;
    for (let i = 0; i < bufferLength; i++) {
      const frequency = (i * this.audioContext.sampleRate) / (2 * bufferLength);
      weightedSum += frequency * frequencyData[i];
      totalMagnitude += frequencyData[i];
    }
    const spectralCentroid = totalMagnitude > 0 ? weightedSum / totalMagnitude : 0;

    // Calculate zero crossing rate (indicates pitch changes)
    let zeroCrossings = 0;
    for (let i = 1; i < timeData.length; i++) {
      if ((timeData[i] >= 128 && timeData[i - 1] < 128) ||
          (timeData[i] < 128 && timeData[i - 1] >= 128)) {
        zeroCrossings++;
      }
    }
    const zeroCrossingRate = zeroCrossings / timeData.length;

    // Find frequency peaks (melodic notes)
    const frequencyPeaks: number[] = [];
    const threshold = 100;
    for (let i = 5; i < bufferLength - 5; i++) {
      if (frequencyData[i] > threshold &&
          frequencyData[i] > frequencyData[i - 1] &&
          frequencyData[i] > frequencyData[i + 1]) {
        const frequency = (i * this.audioContext.sampleRate) / (2 * bufferLength);
        if (frequency >= 80 && frequency <= 1200) { // Vocal range
          frequencyPeaks.push(Math.round(frequency));
        }
      }
    }

    // Calculate RMS energy (loudness/intensity)
    let sumSquares = 0;
    for (let i = 0; i < timeData.length; i++) {
      const normalized = (timeData[i] - 128) / 128;
      sumSquares += normalized * normalized;
    }
    const rmsEnergy = Math.sqrt(sumSquares / timeData.length);

    // Calculate pitch variance (melodic movement)
    let pitchVariance = 0;
    if (frequencyPeaks.length > 1) {
      const avgPitch = frequencyPeaks.reduce((a, b) => a + b, 0) / frequencyPeaks.length;
      pitchVariance = frequencyPeaks.reduce((sum, pitch) => 
        sum + Math.abs(pitch - avgPitch), 0
      ) / frequencyPeaks.length;
    }

    return {
      spectralCentroid,
      zeroCrossingRate,
      frequencyPeaks: frequencyPeaks.slice(0, 10), // Top 10 peaks
      rmsEnergy,
      pitchVariance,
    };
  }

  /**
   * Start continuous melody analysis with AI
   */
  async startContinuousAnalysis(
    trackContext: {
      key: string;
      scale: string;
      bpm?: number;
      genre?: string;
    },
    onAnalysisUpdate: (analysis: MelodyAnalysis) => void,
    intervalMs: number = 2000 // Analyze every 2 seconds
  ) {
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
    }

    const analyze = async () => {
      try {
        const features = this.extractFeatures();
        
        // Only analyze if there's significant audio present
        if (features.rmsEnergy < 0.01) {
          return;
        }

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-melody`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({
              audioFeatures: features,
              trackContext,
            }),
          }
        );

        if (response.ok) {
          const { analysis } = await response.json();
          this.lastAnalysis = analysis;
          onAnalysisUpdate(analysis);
        }
      } catch (error) {
        console.error('Melody analysis error:', error);
      }
    };

    // Initial analysis
    await analyze();

    // Continuous analysis
    this.analysisInterval = window.setInterval(analyze, intervalMs);
  }

  /**
   * Stop continuous analysis
   */
  stopContinuousAnalysis() {
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }
  }

  /**
   * Get the last melody analysis result
   */
  getLastAnalysis(): MelodyAnalysis | null {
    return this.lastAnalysis;
  }

  /**
   * Disconnect and cleanup
   */
  disconnect() {
    this.stopContinuousAnalysis();
    try {
      this.analyserNode.disconnect();
    } catch (e) {
      // Already disconnected
    }
  }
}
