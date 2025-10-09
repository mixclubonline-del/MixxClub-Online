/**
 * Zero-Crossing Detection for pop-free audio editing
 * Finds points where audio waveform crosses zero amplitude
 */

export interface ZeroCrossing {
  time: number; // Time in seconds
  sampleIndex: number; // Exact sample position
}

export class ZeroCrossingDetector {
  /**
   * Find zero crossings in an audio buffer
   * @param audioBuffer - The audio buffer to analyze
   * @param startTime - Start time in seconds
   * @param endTime - End time in seconds
   */
  static detect(
    audioBuffer: AudioBuffer,
    startTime: number = 0,
    endTime?: number
  ): ZeroCrossing[] {
    const sampleRate = audioBuffer.sampleRate;
    const channelData = audioBuffer.getChannelData(0);
    const startSample = Math.floor(startTime * sampleRate);
    const endSample = endTime 
      ? Math.floor(endTime * sampleRate) 
      : channelData.length;

    const crossings: ZeroCrossing[] = [];

    for (let i = startSample + 1; i < endSample; i++) {
      const prev = channelData[i - 1];
      const current = channelData[i];

      // Zero crossing occurs when sign changes
      if ((prev < 0 && current >= 0) || (prev > 0 && current <= 0)) {
        crossings.push({
          time: i / sampleRate,
          sampleIndex: i,
        });
      }
    }

    return crossings;
  }

  /**
   * Find nearest zero crossing to a target time
   * @param audioBuffer - The audio buffer
   * @param targetTime - Time to snap to (in seconds)
   * @param maxDistance - Maximum search distance (in seconds)
   * @param direction - Search direction: 'both', 'before', or 'after'
   */
  static findNearest(
    audioBuffer: AudioBuffer,
    targetTime: number,
    maxDistance: number = 0.01, // 10ms default
    direction: 'both' | 'before' | 'after' = 'both'
  ): ZeroCrossing | null {
    const sampleRate = audioBuffer.sampleRate;
    const targetSample = Math.floor(targetTime * sampleRate);
    const maxSamples = Math.floor(maxDistance * sampleRate);

    const channelData = audioBuffer.getChannelData(0);

    let searchStart = targetSample;
    let searchEnd = targetSample;

    if (direction === 'both' || direction === 'before') {
      searchStart = Math.max(1, targetSample - maxSamples);
    }
    if (direction === 'both' || direction === 'after') {
      searchEnd = Math.min(channelData.length - 1, targetSample + maxSamples);
    }

    let nearestCrossing: ZeroCrossing | null = null;
    let minDistance = maxSamples;

    // Search backwards from target
    if (direction === 'both' || direction === 'before') {
      for (let i = targetSample; i >= searchStart; i--) {
        const prev = channelData[i - 1];
        const current = channelData[i];

        if ((prev < 0 && current >= 0) || (prev > 0 && current <= 0)) {
          const distance = Math.abs(i - targetSample);
          if (distance < minDistance) {
            minDistance = distance;
            nearestCrossing = {
              time: i / sampleRate,
              sampleIndex: i,
            };
          }
          break; // Found nearest before
        }
      }
    }

    // Search forwards from target
    if (direction === 'both' || direction === 'after') {
      for (let i = targetSample + 1; i <= searchEnd; i++) {
        const prev = channelData[i - 1];
        const current = channelData[i];

        if ((prev < 0 && current >= 0) || (prev > 0 && current <= 0)) {
          const distance = Math.abs(i - targetSample);
          if (distance < minDistance) {
            minDistance = distance;
            nearestCrossing = {
              time: i / sampleRate,
              sampleIndex: i,
            };
          }
          break; // Found nearest after
        }
      }
    }

    return nearestCrossing;
  }

  /**
   * Snap a time value to nearest zero crossing
   * Returns original time if no zero crossing found within maxDistance
   */
  static snapToZeroCrossing(
    audioBuffer: AudioBuffer,
    time: number,
    maxDistance: number = 0.01
  ): number {
    const crossing = this.findNearest(audioBuffer, time, maxDistance);
    return crossing ? crossing.time : time;
  }
}
