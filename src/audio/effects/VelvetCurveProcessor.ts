/**
 * VelvetCurveProcessor - Mixxclub's Psychoacoustic Comfort Engine
 * 
 * The Velvet Curve doctrine: "We measure serenity, not sharpness."
 * This processor applies subtle, genre-aware psychoacoustic enhancement
 * that makes audio feel comfortable and professional.
 * 
 * Signal Chain:
 * INPUT → Warmth (320Hz) → Silk Edge (8kHz) → Emotion (1kHz) 
 *       → Power Compressor → Harmonic Enhancer → OUTPUT
 */

import { GenrePreset, GENRE_PRESETS, DEFAULT_VELVET_SETTINGS, type VelvetSettings } from '@/audio/context/GenreContext';
import { breathingPattern, warmthModulation } from '@/audio/modulation/BeatBreathing';

export class VelvetCurveProcessor {
  private context: AudioContext;
  private inputNode: GainNode;
  private outputNode: GainNode;
  
  // Core Velvet Curve filters
  private warmthFilter: BiquadFilterNode; // 320Hz - chest resonance
  private silkEdgeFilter: BiquadFilterNode; // 8kHz - air and presence  
  private emotionFilter: BiquadFilterNode; // 1kHz - perceptual crossover
  private powerCompressor: DynamicsCompressorNode;
  private harmonicEnhancer: BiquadFilterNode; // High-pass cleanup at 80Hz
  
  // Makeup and output control
  private makeupGain: GainNode;
  
  // Current settings
  private settings: VelvetSettings = { ...DEFAULT_VELVET_SETTINGS };
  private bpm: number = 120;
  private beatPhase: number = 0;
  private isBreathingEnabled: boolean = true;
  private animationFrameId: number | null = null;
  private transportStartTime: number = 0;
  
  // Base values for modulation
  private baseWarmth: number = 0.7;
  private baseSilkEdge: number = 0.6;
  
  constructor(context: AudioContext) {
    this.context = context;
    
    // Create nodes
    this.inputNode = context.createGain();
    this.inputNode.gain.value = 1.0;
    
    // Warmth Filter - Chest Resonance at 320Hz
    this.warmthFilter = context.createBiquadFilter();
    this.warmthFilter.type = 'peaking';
    this.warmthFilter.frequency.value = 320;
    this.warmthFilter.Q.value = 1.2;
    this.warmthFilter.gain.value = 0; // Will be set by velvet amount
    
    // Silk Edge Filter - Air and Presence at 8kHz
    this.silkEdgeFilter = context.createBiquadFilter();
    this.silkEdgeFilter.type = 'highshelf';
    this.silkEdgeFilter.frequency.value = 8000;
    this.silkEdgeFilter.gain.value = 0;
    
    // Emotion Filter - Perceptual Sensitivity at 1kHz
    this.emotionFilter = context.createBiquadFilter();
    this.emotionFilter.type = 'peaking';
    this.emotionFilter.frequency.value = 1000;
    this.emotionFilter.Q.value = 0.8;
    this.emotionFilter.gain.value = 0;
    
    // Power Compressor - Gentle dynamics control
    this.powerCompressor = context.createDynamicsCompressor();
    this.powerCompressor.threshold.value = -18;
    this.powerCompressor.knee.value = 20;
    this.powerCompressor.ratio.value = 3;
    this.powerCompressor.attack.value = 0.01;
    this.powerCompressor.release.value = 0.2;
    
    // Harmonic Enhancer - High-pass cleanup at 80Hz
    this.harmonicEnhancer = context.createBiquadFilter();
    this.harmonicEnhancer.type = 'highpass';
    this.harmonicEnhancer.frequency.value = 30; // Sub-bass cleanup
    this.harmonicEnhancer.Q.value = 0.7;
    
    // Makeup Gain
    this.makeupGain = context.createGain();
    this.makeupGain.gain.value = 1.0;
    
    // Output
    this.outputNode = context.createGain();
    this.outputNode.gain.value = 1.0;
    
    // Wire the chain
    this.inputNode.connect(this.warmthFilter);
    this.warmthFilter.connect(this.silkEdgeFilter);
    this.silkEdgeFilter.connect(this.emotionFilter);
    this.emotionFilter.connect(this.powerCompressor);
    this.powerCompressor.connect(this.harmonicEnhancer);
    this.harmonicEnhancer.connect(this.makeupGain);
    this.makeupGain.connect(this.outputNode);
    
    // Apply default settings
    this.applySettings(this.settings);
  }
  
  /**
   * Get input node for connecting to signal chain
   */
  getInputNode(): GainNode {
    return this.inputNode;
  }
  
  /**
   * Get output node for connecting to next processor
   */
  getOutputNode(): GainNode {
    return this.outputNode;
  }
  
  /**
   * Set Velvet Amount (0-1) - Master control for all Velvet processing
   */
  setVelvetAmount(amount: number): void {
    const clampedAmount = Math.max(0, Math.min(1, amount));
    this.settings.velvetAmount = clampedAmount;
    
    const now = this.context.currentTime;
    const rampTime = 0.05; // 50ms ramp for smoothness
    
    // Scale all parameters by velvet amount
    this.warmthFilter.gain.linearRampToValueAtTime(
      this.settings.warmth * 6 * clampedAmount, // +6dB max at warmth=1
      now + rampTime
    );
    
    this.silkEdgeFilter.gain.linearRampToValueAtTime(
      this.settings.silkEdge * 4 * clampedAmount, // +4dB max
      now + rampTime
    );
    
    this.emotionFilter.gain.linearRampToValueAtTime(
      this.settings.emotion * 3 * clampedAmount, // +3dB max
      now + rampTime
    );
    
    // Adjust compressor based on power setting
    const ratio = 1 + (this.settings.power * 5 * clampedAmount); // 1:1 to 6:1
    this.powerCompressor.ratio.linearRampToValueAtTime(ratio, now + rampTime);
  }
  
  /**
   * Set individual parameter with smooth ramping
   */
  setParameter(param: keyof VelvetSettings, value: number): void {
    const now = this.context.currentTime;
    const rampTime = 0.05;
    const clampedValue = Math.max(0, Math.min(1, value));
    
    this.settings[param] = clampedValue;
    const velvet = this.settings.velvetAmount;
    
    switch (param) {
      case 'warmth':
        this.baseWarmth = clampedValue;
        this.warmthFilter.gain.linearRampToValueAtTime(
          clampedValue * 6 * velvet,
          now + rampTime
        );
        break;
        
      case 'silkEdge':
        this.baseSilkEdge = clampedValue;
        this.silkEdgeFilter.gain.linearRampToValueAtTime(
          clampedValue * 4 * velvet,
          now + rampTime
        );
        break;
        
      case 'emotion':
        this.emotionFilter.gain.linearRampToValueAtTime(
          clampedValue * 3 * velvet,
          now + rampTime
        );
        break;
        
      case 'power':
        const ratio = 1 + (clampedValue * 5 * velvet);
        this.powerCompressor.ratio.linearRampToValueAtTime(ratio, now + rampTime);
        break;
        
      case 'velvetAmount':
        this.setVelvetAmount(clampedValue);
        break;
    }
  }
  
  /**
   * Apply a complete settings object
   */
  applySettings(settings: Partial<VelvetSettings>): void {
    const newSettings = { ...this.settings, ...settings };
    
    Object.keys(settings).forEach(key => {
      this.setParameter(key as keyof VelvetSettings, newSettings[key as keyof VelvetSettings]);
    });
  }
  
  /**
   * Apply a genre preset
   */
  applyGenrePreset(genre: GenrePreset): void {
    const preset = GENRE_PRESETS[genre];
    if (preset) {
      this.applySettings(preset);
      console.log(`[VelvetCurve] Applied genre preset: ${genre}`);
    }
  }
  
  /**
   * Set BPM for beat-synced breathing
   */
  setBPM(bpm: number): void {
    this.bpm = Math.max(60, Math.min(200, bpm));
  }
  
  /**
   * Start beat-locked modulation
   */
  startBreathing(transportStartTime: number): void {
    this.transportStartTime = transportStartTime;
    this.isBreathingEnabled = true;
    this.updateModulation();
  }
  
  /**
   * Stop beat-locked modulation
   */
  stopBreathing(): void {
    this.isBreathingEnabled = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    // Reset to base values
    const now = this.context.currentTime;
    this.warmthFilter.gain.linearRampToValueAtTime(
      this.baseWarmth * 6 * this.settings.velvetAmount,
      now + 0.1
    );
    this.silkEdgeFilter.gain.linearRampToValueAtTime(
      this.baseSilkEdge * 4 * this.settings.velvetAmount,
      now + 0.1
    );
  }
  
  /**
   * Update modulation based on beat phase
   */
  private updateModulation = (): void => {
    if (!this.isBreathingEnabled) return;
    
    // Calculate beat phase from transport time
    const elapsed = this.context.currentTime - this.transportStartTime;
    const beatsElapsed = (elapsed * this.bpm) / 60;
    this.beatPhase = beatsElapsed % 1;
    
    // Apply breathing modulation
    const breatheAmount = 0.15; // 15% modulation depth
    const warmthAmount = 0.1; // 10% modulation depth
    
    const breathe = breathingPattern(this.beatPhase, breatheAmount);
    const warmth = warmthModulation(this.beatPhase, warmthAmount);
    
    // Modulate filter gains
    const velvet = this.settings.velvetAmount;
    this.warmthFilter.gain.value = this.baseWarmth * 6 * velvet * breathe;
    this.silkEdgeFilter.gain.value = this.baseSilkEdge * 4 * velvet * warmth;
    
    // Continue animation loop
    this.animationFrameId = requestAnimationFrame(this.updateModulation);
  };
  
  /**
   * Get current beat phase (0-1) for UI visualization
   */
  getBeatPhase(): number {
    return this.beatPhase;
  }
  
  /**
   * Get current gain reduction from compressor
   */
  getGainReduction(): number {
    return Math.abs(this.powerCompressor.reduction);
  }
  
  /**
   * Get current settings
   */
  getSettings(): VelvetSettings {
    return { ...this.settings };
  }
  
  /**
   * Cleanup and disconnect all nodes
   */
  destroy(): void {
    this.stopBreathing();
    
    this.inputNode.disconnect();
    this.warmthFilter.disconnect();
    this.silkEdgeFilter.disconnect();
    this.emotionFilter.disconnect();
    this.powerCompressor.disconnect();
    this.harmonicEnhancer.disconnect();
    this.makeupGain.disconnect();
    this.outputNode.disconnect();
  }
}
