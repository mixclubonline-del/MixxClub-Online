/**
 * Audio Processing Operations for professional editing
 * Reverse, normalize, time stretch, pitch shift, etc.
 */

export class AudioOperations {
  /**
   * Reverse an audio buffer
   */
  static reverse(audioBuffer: AudioBuffer): AudioBuffer {
    const audioContext = new AudioContext();
    const reversedBuffer = audioContext.createBuffer(
      audioBuffer.numberOfChannels,
      audioBuffer.length,
      audioBuffer.sampleRate
    );

    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      const reversedData = reversedBuffer.getChannelData(channel);
      
      for (let i = 0; i < channelData.length; i++) {
        reversedData[i] = channelData[channelData.length - 1 - i];
      }
    }

    return reversedBuffer;
  }

  /**
   * Normalize audio buffer to target peak level
   * @param audioBuffer - Buffer to normalize
   * @param targetPeak - Target peak level (0-1), default 0.95
   */
  static normalize(audioBuffer: AudioBuffer, targetPeak: number = 0.95): AudioBuffer {
    const audioContext = new AudioContext();
    const normalizedBuffer = audioContext.createBuffer(
      audioBuffer.numberOfChannels,
      audioBuffer.length,
      audioBuffer.sampleRate
    );

    // Find current peak across all channels
    let currentPeak = 0;
    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      for (let i = 0; i < channelData.length; i++) {
        const abs = Math.abs(channelData[i]);
        if (abs > currentPeak) currentPeak = abs;
      }
    }

    // Calculate gain factor
    const gain = currentPeak > 0 ? targetPeak / currentPeak : 1;

    // Apply gain to all channels
    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const inputData = audioBuffer.getChannelData(channel);
      const outputData = normalizedBuffer.getChannelData(channel);
      
      for (let i = 0; i < inputData.length; i++) {
        outputData[i] = inputData[i] * gain;
      }
    }

    return normalizedBuffer;
  }

  /**
   * Create a slice of an audio buffer
   * @param audioBuffer - Source buffer
   * @param startTime - Start time in seconds
   * @param duration - Duration in seconds
   */
  static slice(
    audioBuffer: AudioBuffer,
    startTime: number,
    duration: number
  ): AudioBuffer {
    const audioContext = new AudioContext();
    const startSample = Math.floor(startTime * audioBuffer.sampleRate);
    const lengthSamples = Math.floor(duration * audioBuffer.sampleRate);
    
    const slicedBuffer = audioContext.createBuffer(
      audioBuffer.numberOfChannels,
      lengthSamples,
      audioBuffer.sampleRate
    );

    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const inputData = audioBuffer.getChannelData(channel);
      const outputData = slicedBuffer.getChannelData(channel);
      
      for (let i = 0; i < lengthSamples; i++) {
        const sampleIndex = startSample + i;
        outputData[i] = sampleIndex < inputData.length ? inputData[sampleIndex] : 0;
      }
    }

    return slicedBuffer;
  }

  /**
   * Apply fade in/out to audio buffer
   */
  static applyFade(
    audioBuffer: AudioBuffer,
    fadeInDuration: number,
    fadeOutDuration: number,
    curve: 'linear' | 'exponential' | 'logarithmic' = 'linear'
  ): AudioBuffer {
    const audioContext = new AudioContext();
    const fadedBuffer = audioContext.createBuffer(
      audioBuffer.numberOfChannels,
      audioBuffer.length,
      audioBuffer.sampleRate
    );

    const fadeInSamples = Math.floor(fadeInDuration * audioBuffer.sampleRate);
    const fadeOutSamples = Math.floor(fadeOutDuration * audioBuffer.sampleRate);

    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const inputData = audioBuffer.getChannelData(channel);
      const outputData = fadedBuffer.getChannelData(channel);
      
      for (let i = 0; i < inputData.length; i++) {
        let gain = 1;

        // Fade in
        if (i < fadeInSamples) {
          const progress = i / fadeInSamples;
          gain *= this.getFadeGain(progress, curve);
        }

        // Fade out
        if (i > inputData.length - fadeOutSamples) {
          const progress = (inputData.length - i) / fadeOutSamples;
          gain *= this.getFadeGain(progress, curve);
        }

        outputData[i] = inputData[i] * gain;
      }
    }

    return fadedBuffer;
  }

  private static getFadeGain(
    progress: number,
    curve: 'linear' | 'exponential' | 'logarithmic'
  ): number {
    switch (curve) {
      case 'exponential':
        return Math.pow(progress, 2);
      case 'logarithmic':
        return Math.sqrt(progress);
      case 'linear':
      default:
        return progress;
    }
  }

  /**
   * Calculate RMS (Root Mean Square) level
   */
  static calculateRMS(audioBuffer: AudioBuffer): number {
    let sumSquares = 0;
    let sampleCount = 0;

    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      for (let i = 0; i < channelData.length; i++) {
        sumSquares += channelData[i] * channelData[i];
        sampleCount++;
      }
    }

    return Math.sqrt(sumSquares / sampleCount);
  }

  /**
   * Calculate peak level
   */
  static calculatePeak(audioBuffer: AudioBuffer): number {
    let peak = 0;

    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      for (let i = 0; i < channelData.length; i++) {
        const abs = Math.abs(channelData[i]);
        if (abs > peak) peak = abs;
      }
    }

    return peak;
  }

  /**
   * Detect silence regions in audio buffer
   * @param audioBuffer - Buffer to analyze
   * @param threshold - Silence threshold (0-1), default 0.01
   * @param minDuration - Minimum silence duration in seconds, default 0.1
   * @returns Array of [startTime, endTime] pairs for silence regions
   */
  static detectSilence(
    audioBuffer: AudioBuffer,
    threshold: number = 0.01,
    minDuration: number = 0.1
  ): Array<[number, number]> {
    const sampleRate = audioBuffer.sampleRate;
    const minSamples = Math.floor(minDuration * sampleRate);
    const silenceRegions: Array<[number, number]> = [];

    let silenceStart: number | null = null;
    let silenceLength = 0;

    // Use first channel for detection
    const channelData = audioBuffer.getChannelData(0);

    for (let i = 0; i < channelData.length; i++) {
      const isSilent = Math.abs(channelData[i]) < threshold;

      if (isSilent) {
        if (silenceStart === null) {
          silenceStart = i;
        }
        silenceLength++;
      } else {
        if (silenceStart !== null && silenceLength >= minSamples) {
          silenceRegions.push([
            silenceStart / sampleRate,
            (silenceStart + silenceLength) / sampleRate,
          ]);
        }
        silenceStart = null;
        silenceLength = 0;
      }
    }

    // Handle silence at the end
    if (silenceStart !== null && silenceLength >= minSamples) {
      silenceRegions.push([
        silenceStart / sampleRate,
        (silenceStart + silenceLength) / sampleRate,
      ]);
    }

    return silenceRegions;
  }
}
