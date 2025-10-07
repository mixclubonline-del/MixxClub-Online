// Core plugin system types for Mixx Club DAW

export type PluginCategory = 
  | 'utility' 
  | 'dynamics' 
  | 'eq' 
  | 'spatial' 
  | 'mastering' 
  | 'creative' 
  | 'voice' 
  | 'ai';

export type PluginParameterType = 
  | 'knob' 
  | 'slider' 
  | 'toggle' 
  | 'select' 
  | 'xy-pad';

export interface PluginParameter {
  id: string;
  name: string;
  type: PluginParameterType;
  value: number;
  min: number;
  max: number;
  default: number;
  unit?: string;
  options?: string[]; // for select type
  displayValue?: (value: number) => string;
}

export interface AISuggestion {
  id: string;
  parameter: string;
  suggestedValue: number;
  currentValue: number;
  reason: string;
  confidence: number; // 0-1
  category: 'mix' | 'master' | 'creative' | 'technical';
}

export interface PluginPreset {
  id: string;
  name: string;
  description?: string;
  parameters: Record<string, number>;
  isAIGenerated: boolean;
  tags?: string[];
}

export interface MixxPlugin {
  id: string;
  name: string;
  type: string;
  category: PluginCategory;
  version: string;
  enabled: boolean;
  
  // Audio processing
  audioContext?: AudioContext;
  audioNode?: AudioNode;
  inputNode?: GainNode;
  outputNode?: GainNode;
  
  // Parameters
  parameters: PluginParameter[];
  
  // AI features
  aiSuggestions: AISuggestion[];
  supportsAI: boolean;
  
  // Presets
  presets: PluginPreset[];
  currentPreset?: string;
  
  // UI state
  isOpen: boolean;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  
  // Processing
  processAudio?: (input: Float32Array) => Float32Array;
  updateParameter?: (id: string, value: number) => void;
  applyAIPreset?: (suggestion: AISuggestion) => void;
  analyze?: (audioData: Float32Array) => Promise<AISuggestion[]>;
  
  // Lifecycle
  initialize?: (audioContext: AudioContext) => void;
  cleanup?: () => void;
}

export interface PluginChain {
  id: string;
  trackId: string;
  plugins: MixxPlugin[];
  order: string[]; // plugin IDs in processing order
}

export interface PluginState {
  availablePlugins: MixxPlugin[];
  activeChains: PluginChain[];
  openPlugins: string[]; // plugin IDs with open windows
}

export interface AudioAnalysisResult {
  rms: number;
  peak: number;
  spectralCentroid: number;
  dynamicRange: number;
  lufs: number;
  frequencyBalance: {
    low: number; // 20-250Hz
    lowMid: number; // 250-500Hz
    mid: number; // 500-2kHz
    highMid: number; // 2k-6kHz
    high: number; // 6k-20kHz
  };
  suggestions: string[];
}
