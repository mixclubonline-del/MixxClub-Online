/**
 * Professional Waveform Generator
 * Generates accurate peak/RMS waveform data from audio buffers
 */

export interface WaveformData {
  peaks: Float32Array;
  rms: Float32Array;
  duration: number;
  sampleRate: number;
  channels: number;
  // Multi-resolution data for professional rendering
  multiResolution?: {
    low: Float32Array;    // 100 samples/sec - Overview
    medium: Float32Array; // 500 samples/sec - Normal zoom
    high: Float32Array;   // 2000 samples/sec - Detail view
  };
}

export interface WaveformOptions {
  samplesPerPixel?: number;
  width?: number;
  normalize?: boolean;
}

export class WaveformGenerator {
  /**
   * Generate waveform data from AudioBuffer
   * Uses peak detection for visual accuracy
   */
  static generateFromBuffer(
    audioBuffer: AudioBuffer,
    options: WaveformOptions = {}
  ): WaveformData {
    const { samplesPerPixel = 512, width, normalize = true } = options;
    
    const channelData = audioBuffer.getChannelData(0); // Use first channel
    const sampleRate = audioBuffer.sampleRate;
    const duration = audioBuffer.duration;
    
    // Calculate number of bars based on width or duration
    const bars = width || Math.ceil(channelData.length / samplesPerPixel);
    const peaks = new Float32Array(bars);
    const rms = new Float32Array(bars);
    
    let maxPeak = 0;
    
    // Process audio in chunks
    for (let i = 0; i < bars; i++) {
      const startSample = i * samplesPerPixel;
      const endSample = Math.min(startSample + samplesPerPixel, channelData.length);
      
      let peak = 0;
      let sumSquares = 0;
      let count = 0;
      
      // Find peak and RMS in this chunk
      for (let j = startSample; j < endSample; j++) {
        const sample = Math.abs(channelData[j]);
        peak = Math.max(peak, sample);
        sumSquares += sample * sample;
        count++;
      }
      
      peaks[i] = peak;
      rms[i] = count > 0 ? Math.sqrt(sumSquares / count) : 0;
      maxPeak = Math.max(maxPeak, peak);
    }
    
    // Normalize to -1 to 1 range
    if (normalize && maxPeak > 0) {
      for (let i = 0; i < bars; i++) {
        peaks[i] /= maxPeak;
        rms[i] /= maxPeak;
      }
    }
    
    return {
      peaks,
      rms,
      duration,
      sampleRate,
      channels: audioBuffer.numberOfChannels,
    };
  }
  
  /**
   * Generate waveform from audio file
   */
  static async generateFromFile(
    file: File,
    audioContext: AudioContext,
    options: WaveformOptions = {}
  ): Promise<WaveformData> {
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    return this.generateFromBuffer(audioBuffer, options);
  }
  
  /**
   * Generate waveform from URL (Supabase storage, etc.)
   */
  static async generateFromUrl(
    url: string,
    audioContext: AudioContext,
    options: WaveformOptions = {}
  ): Promise<WaveformData> {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    return this.generateFromBuffer(audioBuffer, options);
  }
  
  /**
   * Generate multi-resolution waveform data for professional rendering
   * Uses Web Worker pool for non-blocking generation (PHASE 6)
   */
  static async generateMultiResolutionAsync(
    audioBuffer: AudioBuffer,
    onProgress?: (progress: number, stage?: string) => void
  ): Promise<WaveformData> {
    const channelData = audioBuffer.getChannelData(0);
    const duration = audioBuffer.duration;
    const sampleRate = audioBuffer.sampleRate;

    try {
      // Use Web Worker for async generation
      const { waveformWorkerPool } = await import('./waveformWorkerPool');
      
      const { low, medium, high } = await waveformWorkerPool.generateMultiResolution(
        channelData,
        duration,
        onProgress
      );

      return {
        peaks: medium,
        rms: new Float32Array(medium.length),
        duration,
        sampleRate,
        channels: audioBuffer.numberOfChannels,
        multiResolution: { low, medium, high }
      };
    } catch (error) {
      console.warn('[WaveformGenerator] Worker failed, falling back to main thread:', error);
      // Fallback to synchronous generation
      return this.generateMultiResolution(audioBuffer);
    }
  }

  /**
   * Generate multi-resolution waveform data (synchronous fallback)
   */
  static generateMultiResolution(audioBuffer: AudioBuffer): WaveformData {
    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    const duration = audioBuffer.duration;

    // Generate 3 resolution levels
    const low = this.resampleToPeaks(channelData, Math.ceil(duration * 100));
    const medium = this.resampleToPeaks(channelData, Math.ceil(duration * 500));
    const high = this.resampleToPeaks(channelData, Math.ceil(duration * 2000));

    return {
      peaks: medium,
      rms: new Float32Array(medium.length),
      duration,
      sampleRate,
      channels: audioBuffer.numberOfChannels,
      multiResolution: { low, medium, high }
    };
  }

  /**
   * Resample audio data to target number of peaks
   */
  private static resampleToPeaks(data: Float32Array, targetLength: number): Float32Array {
    const result = new Float32Array(targetLength);
    const samplesPerPeak = Math.floor(data.length / targetLength);
    
    for (let i = 0; i < targetLength; i++) {
      const start = i * samplesPerPeak;
      const end = Math.min(start + samplesPerPeak, data.length);
      let peak = 0;
      
      for (let j = start; j < end; j++) {
        peak = Math.max(peak, Math.abs(data[j]));
      }
      
      result[i] = peak;
    }
    
    return result;
  }

  /**
   * Get peaks array from waveform data (handles both formats)
   */
  static getPeaks(waveformData: Float32Array | WaveformData): Float32Array {
    if (waveformData instanceof Float32Array) {
      return waveformData;
    }
    return waveformData.peaks;
  }

  /**
   * Get waveform length (handles both formats)
   */
  static getLength(waveformData: Float32Array | WaveformData): number {
    if (waveformData instanceof Float32Array) {
      return waveformData.length;
    }
    return waveformData.peaks.length;
  }

  /**
   * Downsample waveform data for zoom levels
   */
  static downsample(
    waveformData: WaveformData,
    targetBars: number
  ): WaveformData {
    if (targetBars >= waveformData.peaks.length) {
      return waveformData;
    }
    
    const ratio = waveformData.peaks.length / targetBars;
    const newPeaks = new Float32Array(targetBars);
    const newRms = new Float32Array(targetBars);
    
    for (let i = 0; i < targetBars; i++) {
      const startIdx = Math.floor(i * ratio);
      const endIdx = Math.floor((i + 1) * ratio);
      
      let maxPeak = 0;
      let sumRms = 0;
      let count = 0;
      
      for (let j = startIdx; j < endIdx; j++) {
        maxPeak = Math.max(maxPeak, waveformData.peaks[j]);
        sumRms += waveformData.rms[j];
        count++;
      }
      
      newPeaks[i] = maxPeak;
      newRms[i] = count > 0 ? sumRms / count : 0;
    }
    
    return {
      peaks: newPeaks,
      rms: newRms,
      duration: waveformData.duration,
      sampleRate: waveformData.sampleRate,
      channels: waveformData.channels,
    };
  }
}
