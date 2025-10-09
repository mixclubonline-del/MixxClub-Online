/**
 * Transient Detection for surgical audio editing
 * Uses spectral flux algorithm to detect transient peaks (drum hits, note attacks)
 */

export interface Transient {
  time: number; // Time in seconds
  sampleIndex: number; // Exact sample position
  magnitude: number; // Strength of transient (0-1)
}

export class TransientDetector {
  /**
   * Detect transients in an audio buffer
   * @param audioBuffer - The audio buffer to analyze
   * @param sensitivity - Detection sensitivity (0.1 = very sensitive, 0.5 = moderate, 0.9 = only strong hits)
   * @param minTimeBetween - Minimum time between transients in seconds (prevents double-detection)
   */
  static detect(
    audioBuffer: AudioBuffer,
    sensitivity: number = 0.3,
    minTimeBetween: number = 0.01
  ): Transient[] {
    const sampleRate = audioBuffer.sampleRate;
    const channelData = audioBuffer.getChannelData(0); // Use first channel
    const transients: Transient[] = [];

    // Calculate energy envelope using RMS in short windows
    const windowSize = Math.floor(sampleRate * 0.005); // 5ms windows
    const hopSize = Math.floor(windowSize / 2); // 50% overlap
    const energyValues: number[] = [];

    for (let i = 0; i < channelData.length - windowSize; i += hopSize) {
      let sum = 0;
      for (let j = 0; j < windowSize; j++) {
        const sample = channelData[i + j];
        sum += sample * sample;
      }
      energyValues.push(Math.sqrt(sum / windowSize));
    }

    // Calculate spectral flux (difference between consecutive energy values)
    const fluxValues: number[] = [];
    for (let i = 1; i < energyValues.length; i++) {
      const diff = Math.max(0, energyValues[i] - energyValues[i - 1]);
      fluxValues.push(diff);
    }

    // Normalize flux values
    const maxFlux = Math.max(...fluxValues);
    if (maxFlux === 0) return transients;

    const normalizedFlux = fluxValues.map(f => f / maxFlux);

    // Find peaks above threshold
    const threshold = 1 - sensitivity; // Invert sensitivity for intuitive control
    const minSamplesBetween = Math.floor(minTimeBetween * sampleRate);

    let lastTransientSample = -minSamplesBetween;

    for (let i = 1; i < normalizedFlux.length - 1; i++) {
      const prev = normalizedFlux[i - 1];
      const current = normalizedFlux[i];
      const next = normalizedFlux[i + 1];

      // Peak detection: current value is higher than neighbors and above threshold
      if (current > prev && current > next && current > threshold) {
        const sampleIndex = i * hopSize;
        const time = sampleIndex / sampleRate;

        // Ensure minimum time between transients
        if (sampleIndex - lastTransientSample >= minSamplesBetween) {
          transients.push({
            time,
            sampleIndex,
            magnitude: current,
          });
          lastTransientSample = sampleIndex;
        }
      }
    }

    return transients;
  }

  /**
   * Find the nearest transient to a given time
   * @param transients - Array of detected transients
   * @param targetTime - Time to snap to (in seconds)
   * @param maxDistance - Maximum distance to search (in seconds)
   */
  static findNearest(
    transients: Transient[],
    targetTime: number,
    maxDistance: number = 0.1
  ): Transient | null {
    let nearest: Transient | null = null;
    let minDistance = maxDistance;

    for (const transient of transients) {
      const distance = Math.abs(transient.time - targetTime);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = transient;
      }
    }

    return nearest;
  }

  /**
   * Get transients within a time range
   */
  static getInRange(
    transients: Transient[],
    startTime: number,
    endTime: number
  ): Transient[] {
    return transients.filter(t => t.time >= startTime && t.time <= endTime);
  }
}
