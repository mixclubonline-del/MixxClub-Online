import { create } from 'zustand';

export interface AudioRegion {
  id: string;
  trackId: string;
  startTime: number;
  duration: number;
  sourceStartOffset: number;
  fadeIn: { duration: number; curve: 'linear' | 'exponential' | 'logarithmic' };
  fadeOut: { duration: number; curve: 'linear' | 'exponential' | 'logarithmic' };
  gain: number;
  color?: string;
}

export interface Track {
  id: string;
  name: string;
  type: 'vocal' | 'drums' | 'bass' | 'keys' | 'guitar' | 'other';
  volume: number;
  pan: number;
  mute: boolean;
  solo: boolean;
  audioBuffer?: AudioBuffer;
  waveformData?: number[];
  peakLevel: number;
  rmsLevel: number;
  analysis?: AudioAnalysis;
  color?: string;
  regions: AudioRegion[];
  effects: EffectUnit[];
  sends: { [busId: string]: { amount: number; preFader: boolean } };
}

export interface EffectUnit {
  id: string;
  name: string;
  type: 'eq' | 'compressor' | 'reverb' | 'delay' | 'limiter' | 'saturator' | 'mixxtune';
  enabled: boolean;
  parameters: Record<string, number>;
  rackPosition: number;
}

export interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  currentOperation: string;
  error?: string;
}

export interface AudioAnalysis {
  rms: number;
  peak: number;
  spectral: number[];
  lufs: number;
}

interface AIStudioStore {
  // Tracks
  tracks: Track[];
  selectedTrackId: string | null;
  
  // Regions & Selection
  selectedRegions: Set<string>;
  
  // Arrangement View
  scrollMode: 'none' | 'page' | 'continuous';
  snapEnabled: boolean;
  snapMode: 'bars' | 'beats' | 'quarter' | 'eighth' | 'sixteenth';
  
  // Effects
  effects: EffectUnit[];
  
  // Transport
  isPlaying: boolean;
  isRecording: boolean;
  currentTime: number;
  duration: number;
  tempo: number;
  
  // Processing
  processing: ProcessingState;
  
  // View mode
  viewMode: 'studio' | 'console' | '3d' | 'compact';
  
  // Master
  masterVolume: number;
  masterPeakLevel: number;
  
  // Actions
  addTrack: (track: Track) => void;
  removeTrack: (id: string) => void;
  updateTrack: (id: string, updates: Partial<Track>) => void;
  setSelectedTrack: (id: string | null) => void;
  
  addEffect: (effect: EffectUnit) => void;
  removeEffect: (id: string) => void;
  updateEffect: (id: string, updates: Partial<EffectUnit>) => void;
  reorderEffect: (id: string, newPosition: number) => void;
  
  // Track effect actions
  addTrackEffect: (trackId: string, effect: EffectUnit) => void;
  removeTrackEffect: (trackId: string, effectId: string) => void;
  updateTrackEffect: (trackId: string, effectId: string, updates: Partial<EffectUnit>) => void;
  
  // Send actions
  updateTrackSend: (trackId: string, busId: string, amount: number, preFader?: boolean) => void;
  
  setPlaying: (playing: boolean) => void;
  setRecording: (recording: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setTempo: (tempo: number) => void;
  
  setProcessing: (processing: Partial<ProcessingState>) => void;
  setViewMode: (mode: 'studio' | 'console' | '3d' | 'compact') => void;
  setMasterVolume: (volume: number) => void;
  updateMasterLevels: (peak: number) => void;
  
  // Region actions
  addRegion: (trackId: string, region: AudioRegion) => void;
  removeRegion: (regionId: string) => void;
  updateRegion: (regionId: string, updates: Partial<AudioRegion>) => void;
  splitRegion: (regionId: string, splitTime: number) => void;
  duplicateRegion: (regionId: string) => void;
  
  // Selection actions
  selectRegion: (regionId: string, multiSelect?: boolean) => void;
  clearSelection: () => void;
  
  // Arrangement actions
  setScrollMode: (mode: 'none' | 'page' | 'continuous') => void;
  setSnapEnabled: (enabled: boolean) => void;
  setSnapMode: (mode: 'bars' | 'beats' | 'quarter' | 'eighth' | 'sixteenth') => void;
}

export const useAIStudioStore = create<AIStudioStore>((set, get) => ({
  // Initial state - blank session
  tracks: [],
  selectedTrackId: null,
  selectedRegions: new Set<string>(),
  scrollMode: 'continuous',
  snapEnabled: true,
  snapMode: 'beats',
  effects: [],
  isPlaying: false,
  isRecording: false,
  currentTime: 0,
  duration: 180,
  tempo: 120,
  processing: {
    isProcessing: false,
    progress: 0,
    currentOperation: '',
  },
  viewMode: 'studio',
  masterVolume: 0.8,
  masterPeakLevel: 0,
  
  // Actions
  addTrack: (track) => set((state) => ({
    tracks: [...state.tracks, track],
  })),
  
  removeTrack: (id) => set((state) => ({
    tracks: state.tracks.filter((t) => t.id !== id),
    selectedTrackId: state.selectedTrackId === id ? null : state.selectedTrackId,
  })),
  
  updateTrack: (id, updates) => set((state) => ({
    tracks: state.tracks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
  })),
  
  setSelectedTrack: (id) => set({ selectedTrackId: id }),
  
  addEffect: (effect) => set((state) => ({
    effects: [...state.effects, effect],
  })),
  
  removeEffect: (id) => set((state) => ({
    effects: state.effects.filter((e) => e.id !== id),
  })),
  
  updateEffect: (id, updates) => set((state) => ({
    effects: state.effects.map((e) => (e.id === id ? { ...e, ...updates } : e)),
  })),
  
  reorderEffect: (id, newPosition) => set((state) => {
    const effects = [...state.effects];
    const effectIndex = effects.findIndex((e) => e.id === id);
    if (effectIndex === -1) return state;
    
    const [effect] = effects.splice(effectIndex, 1);
    effects.splice(newPosition, 0, { ...effect, rackPosition: newPosition });
    
    return { effects };
  }),
  
  setPlaying: (playing) => set({ isPlaying: playing }),
  setRecording: (recording) => set({ isRecording: recording }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setTempo: (tempo) => set({ tempo }),
  
  setProcessing: (processing) => set((state) => ({
    processing: { ...state.processing, ...processing },
  })),
  
  setViewMode: (mode) => set({ viewMode: mode }),
  setMasterVolume: (volume) => set({ masterVolume: volume }),
  updateMasterLevels: (peak) => set({ masterPeakLevel: peak }),
  
  // Region actions
  addRegion: (trackId, region) => set((state) => ({
    tracks: state.tracks.map((t) => 
      t.id === trackId ? { ...t, regions: [...t.regions, region] } : t
    ),
  })),
  
  removeRegion: (regionId) => set((state) => ({
    tracks: state.tracks.map((t) => ({
      ...t,
      regions: t.regions.filter((r) => r.id !== regionId),
    })),
    selectedRegions: new Set(Array.from(state.selectedRegions).filter(id => id !== regionId)),
  })),
  
  updateRegion: (regionId, updates) => set((state) => ({
    tracks: state.tracks.map((t) => ({
      ...t,
      regions: t.regions.map((r) => (r.id === regionId ? { ...r, ...updates } : r)),
    })),
  })),
  
  splitRegion: (regionId, splitTime) => set((state) => {
    const tracks = state.tracks.map((track) => {
      const regionIndex = track.regions.findIndex((r) => r.id === regionId);
      if (regionIndex === -1) return track;
      
      const region = track.regions[regionIndex];
      const relativeTime = splitTime - region.startTime;
      
      if (relativeTime <= 0 || relativeTime >= region.duration) return track;
      
      const leftRegion: AudioRegion = {
        ...region,
        id: `${regionId}-left`,
        duration: relativeTime,
      };
      
      const rightRegion: AudioRegion = {
        ...region,
        id: `${regionId}-right`,
        startTime: splitTime,
        sourceStartOffset: region.sourceStartOffset + relativeTime,
        duration: region.duration - relativeTime,
      };
      
      const newRegions = [...track.regions];
      newRegions.splice(regionIndex, 1, leftRegion, rightRegion);
      
      return { ...track, regions: newRegions };
    });
    
    return { tracks };
  }),
  
  duplicateRegion: (regionId) => set((state) => {
    const tracks = state.tracks.map((track) => {
      const region = track.regions.find((r) => r.id === regionId);
      if (!region) return track;
      
      const newRegion: AudioRegion = {
        ...region,
        id: `region-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        startTime: region.startTime + region.duration + 0.1,
      };
      
      return { ...track, regions: [...track.regions, newRegion] };
    });
    
    return { tracks };
  }),
  
  // Selection actions
  selectRegion: (regionId, multiSelect = false) => set((state) => {
    const newSelection = new Set(multiSelect ? state.selectedRegions : []);
    if (newSelection.has(regionId)) {
      newSelection.delete(regionId);
    } else {
      newSelection.add(regionId);
    }
    return { selectedRegions: newSelection };
  }),
  
  clearSelection: () => set({ selectedRegions: new Set() }),
  
  // Arrangement actions
  setScrollMode: (mode) => set({ scrollMode: mode }),
  setSnapEnabled: (enabled) => set({ snapEnabled: enabled }),
  setSnapMode: (mode) => set({ snapMode: mode }),
  
  // Track effect actions
  addTrackEffect: (trackId, effect) => set((state) => ({
    tracks: state.tracks.map((t) => 
      t.id === trackId ? { ...t, effects: [...t.effects, effect] } : t
    ),
  })),
  
  removeTrackEffect: (trackId, effectId) => set((state) => ({
    tracks: state.tracks.map((t) => 
      t.id === trackId ? { ...t, effects: t.effects.filter(e => e.id !== effectId) } : t
    ),
  })),
  
  updateTrackEffect: (trackId, effectId, updates) => set((state) => ({
    tracks: state.tracks.map((t) => 
      t.id === trackId 
        ? { ...t, effects: t.effects.map(e => e.id === effectId ? { ...e, ...updates } : e) }
        : t
    ),
  })),
  
  // Send actions
  updateTrackSend: (trackId, busId, amount, preFader = false) => set((state) => ({
    tracks: state.tracks.map((t) => 
      t.id === trackId 
        ? { 
            ...t, 
            sends: { 
              ...t.sends, 
              [busId]: { amount, preFader } 
            } 
          }
        : t
    ),
  })),
}));
