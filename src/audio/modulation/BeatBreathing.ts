/**
 * BeatBreathing - Beat-locked modulation utilities for Velvet Curve
 * 
 * Creates organic, alive sound by modulating parameters in sync with the beat.
 * The breathing pattern completes one full sine wave cycle per beat,
 * creating a subtle pumping effect that makes the mix feel alive.
 */

/**
 * Breathing Pattern - Primary modulation
 * Sine wave completing one cycle per beat
 * 
 * @param phase - Beat phase (0-1, where 0 = start of beat)
 * @param amount - Modulation depth (0-1)
 * @returns Multiplier value (centered around 1.0)
 */
export const breathingPattern = (phase: number, amount: number): number => {
  // Sine wave: peaks at 0.25 beat, troughs at 0.75 beat
  const modulation = Math.sin(phase * Math.PI * 2);
  return 1.0 + modulation * amount;
};

/**
 * Warmth Modulation - 90° offset from breathing (push-pull dynamic)
 * Creates complementary movement to breathing
 * 
 * @param phase - Beat phase (0-1)
 * @param amount - Modulation depth (0-1)
 * @returns Multiplier value (centered around 1.0)
 */
export const warmthModulation = (phase: number, amount: number): number => {
  // Cosine wave: peaks at 0 beat (downbeat), troughs at 0.5 beat
  const modulation = Math.cos(phase * Math.PI * 2);
  return 1.0 + modulation * amount;
};

/**
 * Subtle Pulse - Gentler modulation for background elements
 * Half-speed wave for ambient processing
 * 
 * @param phase - Beat phase (0-1)
 * @param amount - Modulation depth (0-1)
 * @returns Multiplier value
 */
export const subtlePulse = (phase: number, amount: number): number => {
  // Half-speed sine wave (completes over 2 beats)
  const modulation = Math.sin(phase * Math.PI);
  return 1.0 + modulation * amount * 0.5;
};

/**
 * Sidechain Duck - Simulates sidechain compression feel
 * Quick attack, gradual release aligned with beat
 * 
 * @param phase - Beat phase (0-1)
 * @param amount - Duck depth (0-1)
 * @returns Multiplier value (dips at beat start)
 */
export const sidechainDuck = (phase: number, amount: number): number => {
  // Exponential decay from beat start
  const envelope = Math.exp(-phase * 4);
  return 1.0 - envelope * amount * 0.3;
};

/**
 * Tension Build - Modulation that increases toward beat end
 * Good for building energy before next downbeat
 * 
 * @param phase - Beat phase (0-1)
 * @param amount - Build intensity (0-1)
 * @returns Multiplier value (rises toward 1.0)
 */
export const tensionBuild = (phase: number, amount: number): number => {
  // Rising curve that resets at beat
  const ramp = phase * phase; // Quadratic rise
  return 1.0 + ramp * amount * 0.2;
};

/**
 * Calculate beat phase from transport time
 * 
 * @param currentTime - Current AudioContext time
 * @param transportStartTime - Time when transport started
 * @param bpm - Beats per minute
 * @returns Beat phase (0-1)
 */
export const calculateBeatPhase = (
  currentTime: number,
  transportStartTime: number,
  bpm: number
): number => {
  const elapsed = currentTime - transportStartTime;
  const beatsElapsed = (elapsed * bpm) / 60;
  return beatsElapsed % 1;
};

/**
 * Get current beat number (integer)
 * 
 * @param currentTime - Current AudioContext time
 * @param transportStartTime - Time when transport started
 * @param bpm - Beats per minute
 * @returns Current beat number (0-indexed)
 */
export const getCurrentBeat = (
  currentTime: number,
  transportStartTime: number,
  bpm: number
): number => {
  const elapsed = currentTime - transportStartTime;
  const beatsElapsed = (elapsed * bpm) / 60;
  return Math.floor(beatsElapsed);
};

/**
 * Check if we're on a downbeat (beat 1 of a bar)
 * 
 * @param beat - Current beat number
 * @param beatsPerBar - Beats per bar (usually 4)
 * @returns True if on downbeat
 */
export const isDownbeat = (beat: number, beatsPerBar: number = 4): boolean => {
  return beat % beatsPerBar === 0;
};

/**
 * Get bar number from beat
 * 
 * @param beat - Current beat number
 * @param beatsPerBar - Beats per bar
 * @returns Current bar number (0-indexed)
 */
export const getCurrentBar = (beat: number, beatsPerBar: number = 4): number => {
  return Math.floor(beat / beatsPerBar);
};
