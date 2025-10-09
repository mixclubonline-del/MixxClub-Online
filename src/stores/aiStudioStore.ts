import { create } from 'zustand';

export interface AudioRegion {
  id: string;
  trackId: string;
  startTime: number;
  duration: number;
  audioBuffer?: AudioBuffer;
  offset: number;
  fadeIn: number;
  fadeOut: number;
  gain: number;
  locked: boolean;
  color?: string;
  name: string;
}

export interface EffectUnit {
  id: string;
  type: 'eq' | 'compressor' | 'reverb' | 'delay' | 'limiter' | 'saturator' | 'mixxtune';
  enabled: boolean;
  rackPosition: number;
  parameters?: Record<string, any>;
  preset?: string;
}

export interface SendUnit {
  amount: number;
  preFader?: boolean;
}

export interface Track {
  id: string;
  name: string;
  type: 'audio' | 'midi' | 'bus';
  color: string;
  volume: number;
  pan: number;
  mute: boolean;
  solo: boolean;
  armed: boolean;
  audioBuffer?: AudioBuffer;
  busGroupId?: string;
  effects?: EffectUnit[];
  sends?: Record<string, SendUnit>;
  peakLevel?: number;
  rmsLevel?: number;
  regions?: AudioRegion[];
  waveformData?: number[];
}

export interface BusGroup {
  id: string;
  name: string;
  color: string;
  volume: number;
  pan: number;
  mute: boolean;
  solo: boolean;
  effects?: EffectUnit[];
  isReturnBus?: boolean;
}

export interface TimeSelection {
  start: number;
  end: number;
}

interface AIStudioStore {
  tracks: Track[];
  busGroups: BusGroup[];
  regions: AudioRegion[];
  selectedRegions: string[];
  selectedTrackId: string | null;
  isPlaying: boolean;
  currentTime: number;
  bpm: number;
  tempo: number;
  duration: number;
  masterVolume: number;
  masterPeakLevel: number;
  timeSelection: TimeSelection | null;
  
  // Track actions
  addTrack: (track: Track) => void;
  updateTrack: (id: string, updates: Partial<Track>) => void;
  removeTrack: (id: string) => void;
  selectTrack: (id: string | null) => void;
  setSelectedTrack: (id: string | null) => void;
  
  // Bus actions
  addBusGroup: (bus: BusGroup) => void;
  updateBusGroup: (id: string, updates: Partial<BusGroup>) => void;
  removeBusGroup: (id: string) => void;
  createBusGroup: (bus: BusGroup) => void;
  deleteBusGroup: (id: string) => void;
  
  // Region actions
  addRegion: (region: AudioRegion) => void;
  updateRegion: (id: string, updates: Partial<AudioRegion>) => void;
  removeRegion: (id: string) => void;
  selectRegion: (id: string, addToSelection?: boolean) => void;
  clearRegionSelection: () => void;
  duplicateRegion: (id: string) => void;
  reverseRegion: (id: string) => void;
  
  // Effect actions
  addTrackEffect: (trackId: string, effect: EffectUnit) => void;
  updateTrackEffect: (trackId: string, effectId: string, updates: Partial<EffectUnit>) => void;
  removeTrackEffect: (trackId: string, effectId: string) => void;
  
  // Transport actions
  setPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setBpm: (bpm: number) => void;
  setTempo: (tempo: number) => void;
  
  // Master actions
  setMasterVolume: (volume: number) => void;
  updateMasterLevels: (peak: number) => void;
  
  // Selection actions
  setTimeSelection: (selection: TimeSelection | null) => void;
}

export const useAIStudioStore = create<AIStudioStore>((set, get) => ({
  tracks: [],
  busGroups: [],
  regions: [],
  selectedRegions: [],
  selectedTrackId: null,
  isPlaying: false,
  currentTime: 0,
  bpm: 120,
  tempo: 120,
  duration: 240,
  masterVolume: 1,
  masterPeakLevel: -Infinity,
  timeSelection: null,
  
  addTrack: (track) => set((state) => ({ 
    tracks: [...state.tracks, track] 
  })),
  
  updateTrack: (id, updates) => set((state) => ({
    tracks: state.tracks.map(t => t.id === id ? { ...t, ...updates } : t)
  })),
  
  removeTrack: (id) => set((state) => ({
    tracks: state.tracks.filter(t => t.id !== id),
    regions: state.regions.filter(r => r.trackId !== id),
    selectedTrackId: state.selectedTrackId === id ? null : state.selectedTrackId
  })),
  
  selectTrack: (id) => set({ selectedTrackId: id }),
  
  setSelectedTrack: (id) => set({ selectedTrackId: id }),
  
  addBusGroup: (bus) => set((state) => ({ 
    busGroups: [...state.busGroups, bus] 
  })),
  
  updateBusGroup: (id, updates) => set((state) => ({
    busGroups: state.busGroups.map(b => b.id === id ? { ...b, ...updates } : b)
  })),
  
  removeBusGroup: (id) => set((state) => ({
    busGroups: state.busGroups.filter(b => b.id !== id)
  })),
  
  createBusGroup: (bus) => set((state) => ({ 
    busGroups: [...state.busGroups, bus] 
  })),
  
  deleteBusGroup: (id) => set((state) => ({
    busGroups: state.busGroups.filter(b => b.id !== id)
  })),
  
  addRegion: (region) => set((state) => ({ 
    regions: [...state.regions, region] 
  })),
  
  updateRegion: (id, updates) => set((state) => ({
    regions: state.regions.map(r => r.id === id ? { ...r, ...updates } : r)
  })),
  
  removeRegion: (id) => set((state) => ({
    regions: state.regions.filter(r => r.id !== id),
    selectedRegions: state.selectedRegions.filter(rid => rid !== id)
  })),
  
  selectRegion: (id, addToSelection) => set((state) => ({
    selectedRegions: addToSelection 
      ? [...state.selectedRegions, id]
      : [id]
  })),
  
  clearRegionSelection: () => set({ selectedRegions: [] }),
  
  duplicateRegion: (id) => set((state) => {
    const region = state.regions.find(r => r.id === id);
    if (!region) return state;
    const newRegion: AudioRegion = {
      ...region,
      id: `region-${Date.now()}`,
      startTime: region.startTime + region.duration,
    };
    return { regions: [...state.regions, newRegion] };
  }),
  
  reverseRegion: (id) => set((state) => {
    const region = state.regions.find(r => r.id === id);
    if (!region || !region.audioBuffer) return state;
    
    const buffer = region.audioBuffer;
    const reversed = new AudioBuffer({
      length: buffer.length,
      numberOfChannels: buffer.numberOfChannels,
      sampleRate: buffer.sampleRate,
    });
    
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const original = buffer.getChannelData(channel);
      const reversedData = reversed.getChannelData(channel);
      for (let i = 0; i < buffer.length; i++) {
        reversedData[i] = original[buffer.length - 1 - i];
      }
    }
    
    return {
      regions: state.regions.map(r =>
        r.id === id ? { ...r, audioBuffer: reversed } : r
      )
    };
  }),
  
  addTrackEffect: (trackId, effect) => set((state) => ({
    tracks: state.tracks.map(t => 
      t.id === trackId 
        ? { ...t, effects: [...(t.effects || []), effect] }
        : t
    )
  })),
  
  updateTrackEffect: (trackId, effectId, updates) => set((state) => ({
    tracks: state.tracks.map(t =>
      t.id === trackId
        ? {
            ...t,
            effects: t.effects?.map(e =>
              e.id === effectId ? { ...e, ...updates } : e
            )
          }
        : t
    )
  })),
  
  removeTrackEffect: (trackId, effectId) => set((state) => ({
    tracks: state.tracks.map(t =>
      t.id === trackId
        ? { ...t, effects: t.effects?.filter(e => e.id !== effectId) }
        : t
    )
  })),
  
  setPlaying: (playing) => set({ isPlaying: playing }),
  
  setCurrentTime: (time) => set({ currentTime: time }),
  
  setBpm: (bpm) => set({ bpm, tempo: bpm }),
  
  setTempo: (tempo) => set({ tempo, bpm: tempo }),
  
  setMasterVolume: (volume) => set({ masterVolume: volume }),
  
  updateMasterLevels: (peak) => set({ masterPeakLevel: peak }),
  
  setTimeSelection: (selection) => set({ timeSelection: selection }),
}));
