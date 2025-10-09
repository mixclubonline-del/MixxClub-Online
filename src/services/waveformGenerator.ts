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
