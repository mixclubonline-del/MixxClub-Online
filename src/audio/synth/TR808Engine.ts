/**
 * TR808 Engine - Authentic 808 bass synthesis with pitch envelope and slide
 * The heart of Trap, Drill, Reggaeton, and modern hip-hop production
 */

export interface TR808Preset {
  id: string;
  name: string;
  description: string;
  decay: number;          // 0.1-5.0 seconds
  slideTime: number;      // 0-300ms portamento
  pitchEnvAmount: number; // 0-100 pitch drop amount
  pitchEnvDecay: number;  // 0.01-0.5s pitch envelope decay
  saturation: number;     // 0-100 distortion amount
  subLevel: number;       // 0-100 sub bass level
  clickLevel: number;     // 0-100 attack click
  waveform: 'sine' | 'triangle';
}

export const TR808_PRESETS: Record<string, TR808Preset> = {
  'atlanta-trap': {
    id: 'atlanta-trap',
    name: 'Atlanta Trap',
    description: 'Long sustaining 808 with moderate slide',
    decay: 2.5,
    slideTime: 0.08,
    pitchEnvAmount: 40,
    pitchEnvDecay: 0.15,
    saturation: 15,
    subLevel: 85,
    clickLevel: 30,
    waveform: 'sine',
  },
  'uk-drill': {
    id: 'uk-drill',
    name: 'UK Drill',
    description: 'Short punchy 808 with aggressive slide',
    decay: 0.8,
    slideTime: 0.15,
    pitchEnvAmount: 60,
    pitchEnvDecay: 0.08,
    saturation: 45,
    subLevel: 70,
    clickLevel: 50,
    waveform: 'sine',
  },
  'ny-drill': {
    id: 'ny-drill',
    name: 'NY Drill',
    description: 'Gritty distorted 808 with fast slide',
    decay: 0.6,
    slideTime: 0.1,
    pitchEnvAmount: 70,
    pitchEnvDecay: 0.06,
    saturation: 65,
    subLevel: 60,
    clickLevel: 60,
    waveform: 'sine',
  },
  'reggaeton': {
    id: 'reggaeton',
    name: 'Reggaeton',
    description: 'Clean short 808 for dembow rhythm',
    decay: 0.4,
    slideTime: 0,
    pitchEnvAmount: 20,
    pitchEnvDecay: 0.05,
    saturation: 0,
    subLevel: 90,
    clickLevel: 20,
    waveform: 'sine',
  },
  'afrobeat': {
    id: 'afrobeat',
    name: 'Afrobeat',
    description: 'Warm sustaining bass with groove',
    decay: 1.2,
    slideTime: 0,
    pitchEnvAmount: 25,
    pitchEnvDecay: 0.12,
    saturation: 10,
    subLevel: 80,
    clickLevel: 15,
    waveform: 'triangle',
  },
  'melodic-trap': {
    id: 'melodic-trap',
    name: 'Melodic Trap',
    description: 'Smooth 808 for melodic rap',
    decay: 2.0,
    slideTime: 0.12,
    pitchEnvAmount: 35,
    pitchEnvDecay: 0.2,
    saturation: 8,
    subLevel: 90,
    clickLevel: 25,
    waveform: 'sine',
  },
};

export class TR808Engine {
  private ctx: AudioContext;
  private outputGain: GainNode;
  private saturationNode: WaveShaperNode;
  
  // Current voice for legato/slide
  private currentOsc: OscillatorNode | null = null;
  private currentGain: GainNode | null = null;
  private currentFreq = 0;
  
  // Settings
  private preset: TR808Preset = TR808_PRESETS['atlanta-trap'];
  
  constructor(ctx: AudioContext, destination?: AudioNode) {
    this.ctx = ctx;
    
    // Create output gain
    this.outputGain = ctx.createGain();
    this.outputGain.gain.value = 0.8;
    
    // Create saturation waveshaper
    this.saturationNode = ctx.createWaveShaper();
    this.updateSaturationCurve();
    
    // Connect chain
    this.saturationNode.connect(this.outputGain);
    this.outputGain.connect(destination || ctx.destination);
  }
  
  /**
   * Update the saturation/distortion curve
   */
  private updateSaturationCurve(): void {
    const samples = 44100;
    const curve = new Float32Array(samples);
    const amount = this.preset.saturation / 100;
    
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      
      if (amount === 0) {
        curve[i] = x;
      } else {
        // Soft clipping with adjustable drive
        const k = amount * 10 + 1;
        curve[i] = (Math.tanh(k * x) / Math.tanh(k));
      }
    }
    
    this.saturationNode.curve = curve;
  }
  
  /**
   * Set the current preset
   */
  setPreset(presetId: string): void {
    if (TR808_PRESETS[presetId]) {
      this.preset = TR808_PRESETS[presetId];
      this.updateSaturationCurve();
    }
  }
  
  /**
   * Get current preset
   */
  getPreset(): TR808Preset {
    return this.preset;
  }
  
  /**
   * Set individual parameter
   */
  setParameter(param: keyof TR808Preset, value: number | string): void {
    (this.preset as any)[param] = value;
    if (param === 'saturation') {
      this.updateSaturationCurve();
    }
  }
  
  /**
   * Trigger an 808 note with optional slide from previous note
   */
  trigger(
    frequency: number,
    velocity: number = 1.0,
    time?: number
  ): void {
    const now = time ?? this.ctx.currentTime;
    const {
      decay,
      slideTime,
      pitchEnvAmount,
      pitchEnvDecay,
      subLevel,
      clickLevel,
      waveform,
    } = this.preset;
    
    // Calculate slide behavior
    const shouldSlide = this.currentOsc && slideTime > 0 && this.currentFreq !== frequency;
    
    if (shouldSlide && this.currentOsc && this.currentGain) {
      // SLIDE: Glide pitch to new frequency
      this.currentOsc.frequency.cancelScheduledValues(now);
      this.currentOsc.frequency.linearRampToValueAtTime(frequency, now + slideTime);
      
      // Retrigger envelope but don't stop oscillator
      this.currentGain.gain.cancelScheduledValues(now);
      this.currentGain.gain.setValueAtTime(this.currentGain.gain.value, now);
      this.currentGain.gain.linearRampToValueAtTime(velocity * (subLevel / 100), now + 0.005);
      this.currentGain.gain.exponentialRampToValueAtTime(0.001, now + decay);
      
      this.currentFreq = frequency;
      return;
    }
    
    // No slide or new note: create fresh oscillator
    this.stopCurrent(now);
    
    // Main oscillator (sub bass)
    const osc = this.ctx.createOscillator();
    osc.type = waveform;
    
    // Pitch envelope: start higher and drop to target
    const pitchStart = frequency * (1 + pitchEnvAmount / 100);
    osc.frequency.setValueAtTime(pitchStart, now);
    osc.frequency.exponentialRampToValueAtTime(frequency, now + pitchEnvDecay);
    
    // Gain envelope
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    
    // Attack click
    if (clickLevel > 0) {
      gain.gain.linearRampToValueAtTime(velocity * (clickLevel / 100) * 1.2, now + 0.003);
    }
    
    // Main body
    gain.gain.linearRampToValueAtTime(velocity * (subLevel / 100), now + 0.01);
    
    // Decay
    gain.gain.exponentialRampToValueAtTime(0.001, now + decay);
    
    // Connect
    osc.connect(gain);
    gain.connect(this.saturationNode);
    
    // Start and stop
    osc.start(now);
    osc.stop(now + decay + 0.1);
    
    osc.onended = () => {
      try {
        osc.disconnect();
        gain.disconnect();
      } catch {}
      
      if (this.currentOsc === osc) {
        this.currentOsc = null;
        this.currentGain = null;
      }
    };
    
    // Store reference for slide
    this.currentOsc = osc;
    this.currentGain = gain;
    this.currentFreq = frequency;
  }
  
  /**
   * Stop current note immediately
   */
  private stopCurrent(time: number): void {
    if (this.currentGain) {
      try {
        this.currentGain.gain.cancelScheduledValues(time);
        this.currentGain.gain.setValueAtTime(this.currentGain.gain.value, time);
        this.currentGain.gain.exponentialRampToValueAtTime(0.001, time + 0.02);
      } catch {}
    }
    
    if (this.currentOsc) {
      try {
        this.currentOsc.stop(time + 0.03);
      } catch {}
    }
  }
  
  /**
   * Stop all playback
   */
  stop(): void {
    this.stopCurrent(this.ctx.currentTime);
    this.currentOsc = null;
    this.currentGain = null;
    this.currentFreq = 0;
  }
  
  /**
   * Get the output node for routing
   */
  getOutputNode(): GainNode {
    return this.outputGain;
  }
  
  /**
   * Set master output volume
   */
  setVolume(value: number): void {
    const now = this.ctx.currentTime;
    this.outputGain.gain.linearRampToValueAtTime(value, now + 0.01);
  }
  
  /**
   * Convert MIDI note to frequency
   */
  static midiToFreq(note: number): number {
    return 440 * Math.pow(2, (note - 69) / 12);
  }
  
  /**
   * Get note name from MIDI note
   */
  static noteToName(note: number): string {
    const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(note / 12) - 1;
    return `${names[note % 12]}${octave}`;
  }
}
