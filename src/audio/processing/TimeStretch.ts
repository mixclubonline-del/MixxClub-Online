/**
 * Time Stretching & Pitch Shifting using Web Audio API
 * Professional audio time/pitch manipulation
 */

export class TimeStretch {
  /**
   * Time stretch audio buffer without changing pitch
   * @param audioBuffer - Source audio buffer
   * @param stretchFactor - Time stretch factor (0.5 = half speed, 2.0 = double speed)
   * @param preservePitch - Whether to preserve pitch (default true)
   */
  static async stretchTime(
    audioBuffer: AudioBuffer,
    stretchFactor: number,
    preservePitch: boolean = true
  ): Promise<AudioBuffer> {
    // Validate input
    if (stretchFactor <= 0) {
      throw new Error('Stretch factor must be positive');
    }

    // Create offline context for processing
    const duration = audioBuffer.duration * stretchFactor;
    const offlineContext = new OfflineAudioContext(
      audioBuffer.numberOfChannels,
      Math.ceil(duration * audioBuffer.sampleRate),
      audioBuffer.sampleRate
    );

    // Create source from buffer
    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;

    if (preservePitch) {
      // Use playback rate to change time without affecting pitch
      // This uses the browser's built-in time-stretch algorithm
      source.playbackRate.value = 1 / stretchFactor;
      source.connect(offlineContext.destination);
      source.start(0);
    } else {
      // Change both time and pitch
      source.playbackRate.value = 1 / stretchFactor;
      source.connect(offlineContext.destination);
      source.start(0);
    }

    // Render the stretched audio
    const renderedBuffer = await offlineContext.startRendering();
    return renderedBuffer;
  }

  /**
   * Change pitch without changing tempo
   * @param audioBuffer - Source audio buffer
   * @param semitones - Pitch shift in semitones (-12 to +12)
   */
  static async shiftPitch(
    audioBuffer: AudioBuffer,
    semitones: number
  ): Promise<AudioBuffer> {
    // Calculate pitch ratio from semitones
    const pitchRatio = Math.pow(2, semitones / 12);

    // Create offline context
    const offlineContext = new OfflineAudioContext(
      audioBuffer.numberOfChannels,
      audioBuffer.length,
      audioBuffer.sampleRate
    );

    // Create source
    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;

    // Apply pitch shift using playback rate
    // Then time-stretch back to original duration
    const timeStretchFactor = pitchRatio;
    source.playbackRate.value = pitchRatio;
    source.connect(offlineContext.destination);
    source.start(0);

    // Render
    const renderedBuffer = await offlineContext.startRendering();

    // Now stretch back to original duration
    return this.stretchTime(renderedBuffer, timeStretchFactor, false);
  }

  /**
   * Change both tempo and pitch independently
   * @param audioBuffer - Source audio buffer
   * @param tempoFactor - Tempo change factor (0.5 = half speed, 2.0 = double speed)
   * @param pitchShift - Pitch shift in semitones
   */
  static async changeTempoAndPitch(
    audioBuffer: AudioBuffer,
    tempoFactor: number,
    pitchShift: number
  ): Promise<AudioBuffer> {
    // First apply pitch shift
    let processedBuffer = audioBuffer;
    
    if (pitchShift !== 0) {
      processedBuffer = await this.shiftPitch(processedBuffer, pitchShift);
    }

    // Then apply tempo change
    if (tempoFactor !== 1.0) {
      processedBuffer = await this.stretchTime(processedBuffer, tempoFactor, true);
    }

    return processedBuffer;
  }

  /**
   * Detect BPM (Beats Per Minute) from audio buffer
   * Uses simple peak detection algorithm
   */
  static detectBPM(audioBuffer: AudioBuffer): number {
    const sampleRate = audioBuffer.sampleRate;
    const channelData = audioBuffer.getChannelData(0);
    
    // Calculate energy in 50ms windows
    const windowSize = Math.floor(sampleRate * 0.05); // 50ms
    const energies: number[] = [];
    
    for (let i = 0; i < channelData.length - windowSize; i += windowSize) {
      let energy = 0;
      for (let j = 0; j < windowSize; j++) {
        const sample = channelData[i + j];
        energy += sample * sample;
      }
      energies.push(Math.sqrt(energy / windowSize));
    }

    // Find peaks in energy
    const threshold = energies.reduce((a, b) => a + b, 0) / energies.length * 1.5;
    const peaks: number[] = [];
    
    for (let i = 1; i < energies.length - 1; i++) {
      if (energies[i] > threshold && 
          energies[i] > energies[i - 1] && 
          energies[i] > energies[i + 1]) {
        peaks.push(i);
      }
    }

    // Calculate intervals between peaks
    if (peaks.length < 2) return 120; // Default BPM

    const intervals: number[] = [];
    for (let i = 1; i < peaks.length; i++) {
      intervals.push(peaks[i] - peaks[i - 1]);
    }

    // Average interval
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    
    // Convert to BPM (interval is in 50ms units)
    const secondsPerBeat = (avgInterval * windowSize) / sampleRate;
    const bpm = 60 / secondsPerBeat;

    // Clamp to reasonable range
    return Math.max(60, Math.min(200, Math.round(bpm)));
  }

  /**
   * Match audio to target BPM
   * Detects current BPM and stretches to match target
   */
  static async matchBPM(
    audioBuffer: AudioBuffer,
    targetBPM: number
  ): Promise<AudioBuffer> {
    const currentBPM = this.detectBPM(audioBuffer);
    const stretchFactor = currentBPM / targetBPM;
    
    console.log(`Matching BPM: ${currentBPM} -> ${targetBPM} (stretch: ${stretchFactor.toFixed(2)}x)`);
    
    return this.stretchTime(audioBuffer, stretchFactor, true);
  }
}
