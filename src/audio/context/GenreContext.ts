/**
 * GenreContext - Genre-aware Velvet Curve presets
 * 
 * Each genre has optimal Velvet Curve settings based on
 * the sonic character and production styles of 2026.
 */

export interface VelvetSettings {
  warmth: number;    // 0-1: Chest resonance (320Hz)
  power: number;     // 0-1: Compression ratio/intensity
  silkEdge: number;  // 0-1: Air and presence (8kHz)
  emotion: number;   // 0-1: Midrange presence (1kHz)
  velvetAmount: number; // 0-1: Master blend
}

export type GenrePreset = 
  | 'trap'
  | 'drill'
  | 'rnb'
  | 'reggaeton'
  | 'afrobeat'
  | 'amapiano'
  | 'melodic-trap'
  | 'default';

export interface GenrePresetConfig extends VelvetSettings {
  name: string;
  description: string;
  bpmRange: [number, number];
}

/**
 * Genre-specific Velvet Curve presets
 * 
 * These values are tuned for the sonic characteristics of each genre:
 * - Trap: Clean 808s, crisp hi-hats, maximum punch
 * - Drill: Clinical, aggressive dynamics, dark tone
 * - R&B: Maximum velvet warmth, silky highs, gentle dynamics
 * - Reggaeton: Balanced warmth, strong punch for dembow
 * - Afrobeat: Warm but not heavy, groovy dynamics, open highs
 */
export const GENRE_PRESETS: Record<GenrePreset, GenrePresetConfig> = {
  trap: {
    name: 'Trap',
    description: 'Clean 808s, crisp hi-hats, maximum punch',
    warmth: 0.6,
    power: 0.85,
    silkEdge: 0.6,
    emotion: 0.4,
    velvetAmount: 0.75,
    bpmRange: [130, 160],
  },
  
  drill: {
    name: 'Drill',
    description: 'Clinical, aggressive dynamics, dark tone',
    warmth: 0.5,
    power: 0.9,
    silkEdge: 0.5,
    emotion: 0.35,
    velvetAmount: 0.7,
    bpmRange: [138, 145],
  },
  
  rnb: {
    name: 'R&B',
    description: 'Maximum velvet warmth, silky highs, gentle dynamics',
    warmth: 0.85,
    power: 0.6,
    silkEdge: 0.7,
    emotion: 0.75,
    velvetAmount: 0.85,
    bpmRange: [80, 110],
  },
  
  reggaeton: {
    name: 'Reggaeton',
    description: 'Balanced warmth, strong punch for dembow',
    warmth: 0.7,
    power: 0.8,
    silkEdge: 0.55,
    emotion: 0.5,
    velvetAmount: 0.75,
    bpmRange: [88, 100],
  },
  
  afrobeat: {
    name: 'Afrobeat',
    description: 'Warm but not heavy, groovy dynamics, open highs',
    warmth: 0.75,
    power: 0.7,
    silkEdge: 0.65,
    emotion: 0.6,
    velvetAmount: 0.8,
    bpmRange: [100, 115],
  },
  
  amapiano: {
    name: 'Amapiano',
    description: 'South African house groove, deep warmth',
    warmth: 0.8,
    power: 0.65,
    silkEdge: 0.6,
    emotion: 0.55,
    velvetAmount: 0.8,
    bpmRange: [108, 120],
  },
  
  'melodic-trap': {
    name: 'Melodic Trap',
    description: 'Softer punch, more emotion, vocal-forward',
    warmth: 0.7,
    power: 0.75,
    silkEdge: 0.65,
    emotion: 0.6,
    velvetAmount: 0.8,
    bpmRange: [130, 150],
  },
  
  default: {
    name: 'Default',
    description: 'Balanced starting point',
    warmth: 0.7,
    power: 0.75,
    silkEdge: 0.6,
    emotion: 0.5,
    velvetAmount: 0.75,
    bpmRange: [90, 150],
  },
};

/**
 * Default Velvet settings (balanced starting point)
 */
export const DEFAULT_VELVET_SETTINGS: VelvetSettings = {
  warmth: 0.7,
  power: 0.75,
  silkEdge: 0.6,
  emotion: 0.5,
  velvetAmount: 0.75,
};

/**
 * Get suggested genre based on BPM
 */
export const suggestGenreByBPM = (bpm: number): GenrePreset => {
  const matches: GenrePreset[] = [];
  
  Object.entries(GENRE_PRESETS).forEach(([genre, config]) => {
    const [min, max] = config.bpmRange;
    if (bpm >= min && bpm <= max) {
      matches.push(genre as GenrePreset);
    }
  });
  
  // Prioritize modern genres
  const priority: GenrePreset[] = ['trap', 'drill', 'reggaeton', 'afrobeat', 'rnb', 'amapiano', 'melodic-trap'];
  
  for (const genre of priority) {
    if (matches.includes(genre)) {
      return genre;
    }
  }
  
  return 'default';
};

/**
 * Interpolate between two genre presets
 */
export const blendPresets = (
  presetA: GenrePreset,
  presetB: GenrePreset,
  blend: number // 0 = full A, 1 = full B
): VelvetSettings => {
  const a = GENRE_PRESETS[presetA];
  const b = GENRE_PRESETS[presetB];
  const t = Math.max(0, Math.min(1, blend));
  
  return {
    warmth: a.warmth + (b.warmth - a.warmth) * t,
    power: a.power + (b.power - a.power) * t,
    silkEdge: a.silkEdge + (b.silkEdge - a.silkEdge) * t,
    emotion: a.emotion + (b.emotion - a.emotion) * t,
    velvetAmount: a.velvetAmount + (b.velvetAmount - a.velvetAmount) * t,
  };
};
