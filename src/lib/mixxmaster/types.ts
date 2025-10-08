// Core MixxMaster.tsx Format Type Definitions
// Universal session container for cross-DAW collaboration

export interface MixxMasterManifest {
  version: string; // Format version (e.g., "1.0")
  sessionId: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  audio: AudioStemCollection;
  sessionData: SessionData;
  metadata: MixxMasterMetadata;
  checksum: string; // AES-256 hash for integrity
}

export interface AudioStemCollection {
  vocals: AudioStem[];
  drums: AudioStem[];
  instruments: AudioStem[];
  fx: AudioStem[];
}

export interface AudioStem {
  id: string;
  name: string;
  category: 'vocals' | 'drums' | 'instruments' | 'fx';
  storagePath: string; // Cloud reference to Supabase Storage
  fileSize: number;
  durationSeconds: number;
  sampleRate: number;
  bitDepth: number;
  channels: number;
  waveformData?: WaveformData;
}

export interface WaveformData {
  peaks: number[];
  duration: number;
  sampleRate: number;
}

export interface SessionData {
  mixChain: MixChainData;
  routing: RoutingData;
  tempoMap: TempoMapData;
  aiAnalysis: AIAnalysisData;
}

export interface MixChainData {
  chains: PluginChain[];
  version: string;
}

export interface PluginChain {
  trackName: string;
  trackType: 'vocal' | 'drum' | 'instrument' | 'fx' | 'master';
  plugins: PluginInstance[];
}

export interface PluginInstance {
  id: string;
  name: string;
  type: 'eq' | 'compressor' | 'reverb' | 'delay' | 'saturation' | 'limiter' | 'other';
  manufacturer: string;
  parameters: Record<string, number | string | boolean>;
  dawSpecific?: {
    logic?: string;
    flStudio?: string;
    proTools?: string;
    studioOne?: string;
  };
  bypass: boolean;
  order: number;
}

export interface RoutingData {
  buses: BusConfiguration[];
  auxSends: AuxSend[];
}

export interface BusConfiguration {
  id: string;
  name: string;
  tracks: string[];
  output: string;
  volume: number;
  pan: number;
}

export interface AuxSend {
  id: string;
  name: string;
  sourceTrack: string;
  destination: string;
  sendLevel: number;
  preFader: boolean;
}

export interface TempoMapData {
  bpm: number;
  timeSignature: string;
  markers: TimeMarker[];
  tempoChanges: TempoChange[];
}

export interface TimeMarker {
  id: string;
  name: string;
  position: number; // In seconds
  type: 'section' | 'verse' | 'chorus' | 'bridge' | 'custom';
}

export interface TempoChange {
  position: number; // In seconds
  bpm: number;
}

export interface AIAnalysisData {
  version: string; // PrimeBot version (e.g., "4.0")
  analyzedAt: string;
  spectralAnalysis: SpectralAnalysis;
  tonalAnalysis: TonalAnalysis;
  emotionAnalysis: EmotionAnalysis;
  mixingSuggestions: MixingSuggestion[];
  pluginRecommendations: PluginRecommendation[];
  confidenceScore: number; // 0.00 - 1.00
  processingTimeMs: number;
}

export interface SpectralAnalysis {
  frequencyBalance: {
    low: number; // 20-250Hz
    lowMid: number; // 250-500Hz
    mid: number; // 500-2kHz
    highMid: number; // 2k-6kHz
    high: number; // 6k-20kHz
  };
  clarityScore: number; // 0-100
  muddiness: number; // 0-100
  brightness: number; // 0-100
  problematicFrequencies: FrequencyIssue[];
}

export interface FrequencyIssue {
  frequency: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
  suggestion: string;
}

export interface TonalAnalysis {
  key: string; // e.g., "C major"
  tempo: number;
  timeSignature: string;
  harmonicComplexity: number; // 0-100
  chordProgression: string[];
  scaleType: string;
}

export interface EmotionAnalysis {
  mood: string;
  energy: number; // 0-100
  valence: number; // 0-100 (negative to positive)
  arousal: number; // 0-100 (calm to excited)
  dominantEmotion: 'happy' | 'sad' | 'energetic' | 'calm' | 'aggressive' | 'melancholic';
}

export interface MixingSuggestion {
  id: string;
  category: 'eq' | 'compression' | 'spatial' | 'dynamics' | 'general';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  targetTrack?: string;
  parameters?: Record<string, any>;
  confidenceScore: number;
}

export interface PluginRecommendation {
  pluginType: 'eq' | 'compressor' | 'reverb' | 'delay' | 'saturation' | 'limiter';
  targetTrack: string;
  reason: string;
  suggestedSettings?: Record<string, any>;
  alternatives?: string[];
}

export interface MixxMasterMetadata {
  artistInfo: ArtistInfo;
  versionHistory: VersionHistoryEntry[];
  source: 'original' | 'legacy_import' | 'template';
  tags?: string[];
  notes?: string;
}

export interface ArtistInfo {
  artistId: string;
  artistName: string;
  projectName: string;
  genre?: string;
  releaseDate?: string;
  collaboration?: {
    engineerId?: string;
    engineerName?: string;
  };
}

export interface VersionHistoryEntry {
  versionNumber: number;
  createdAt: string;
  createdBy: string;
  engineerSignature?: string;
  changesSummary: string;
  diffData?: VersionDiff;
}

export interface VersionDiff {
  added: string[];
  modified: string[];
  removed: string[];
  pluginChanges: PluginChange[];
  routingChanges: string[];
}

export interface PluginChange {
  track: string;
  action: 'added' | 'removed' | 'modified';
  plugin: string;
  parameterChanges?: Record<string, { old: any; new: any }>;
}

// Storage mode types
export type StorageMode = 'hybrid' | 'full_package' | 'reference_only';

// DAW platform types
export type DAWPlatform = 'logic' | 'fl_studio' | 'protools' | 'studio_one';

// Session status types
export type SessionStatus = 'draft' | 'active' | 'delivered' | 'archived';

// Plugin chain template types
export interface PluginChainTemplate {
  id: string;
  creatorId: string;
  templateName: string;
  description: string;
  category: 'vocal' | 'drums' | 'master' | 'creative' | 'other';
  pluginChain: PluginChain;
  price: number;
  downloadsCount: number;
  ratingAverage?: number;
  isPublic: boolean;
  createdAt: string;
}

// DAW plugin mapping types
export interface DAWPluginMapping {
  id: string;
  pluginName: string;
  pluginType: string;
  dawPlatform: DAWPlatform;
  nativePluginId: string;
  parameterMappings: Record<string, string>;
}

// Error types
export class MixxMasterError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'MixxMasterError';
  }
}
