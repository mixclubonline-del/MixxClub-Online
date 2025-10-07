import { create } from 'zustand';

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
}

export interface EffectUnit {
  id: string;
  name: string;
  type: 'eq' | 'compressor' | 'reverb' | 'delay' | 'limiter' | 'saturator';
  enabled: boolean;
  parameters: Record<string, number>;
  rackPosition: number;
}

export interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  currentOperation: string;
}

interface AIStudioStore {
  // Tracks
  tracks: Track[];
  selectedTrackId: string | null;
  
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
  
  setPlaying: (playing: boolean) => void;
  setRecording: (recording: boolean) => void;
  setCurrentTime: (time: number) => void;
  setTempo: (tempo: number) => void;
  
  setProcessing: (processing: Partial<ProcessingState>) => void;
  setViewMode: (mode: 'studio' | 'console' | '3d' | 'compact') => void;
  setMasterVolume: (volume: number) => void;
  updateMasterLevels: (peak: number) => void;
}

export const useAIStudioStore = create<AIStudioStore>((set) => ({
  // Initial state with demo tracks
  tracks: [
    {
      id: 'track-1',
      name: 'Vocals',
      type: 'vocal',
      volume: 0.8,
      pan: 0,
      mute: false,
      solo: false,
      peakLevel: 0,
      rmsLevel: 0,
    },
    {
      id: 'track-2',
      name: 'Drums',
      type: 'drums',
      volume: 0.75,
      pan: 0,
      mute: false,
      solo: false,
      peakLevel: 0,
      rmsLevel: 0,
    },
    {
      id: 'track-3',
      name: 'Bass',
      type: 'bass',
      volume: 0.7,
      pan: 0,
      mute: false,
      solo: false,
      peakLevel: 0,
      rmsLevel: 0,
    },
    {
      id: 'track-4',
      name: 'Keys',
      type: 'keys',
      volume: 0.65,
      pan: 0,
      mute: false,
      solo: false,
      peakLevel: 0,
      rmsLevel: 0,
    },
  ],
  selectedTrackId: null,
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
  setTempo: (tempo) => set({ tempo }),
  
  setProcessing: (processing) => set((state) => ({
    processing: { ...state.processing, ...processing },
  })),
  
  setViewMode: (mode) => set({ viewMode: mode }),
  setMasterVolume: (volume) => set({ masterVolume: volume }),
  updateMasterLevels: (peak) => set({ masterPeakLevel: peak }),
}));
