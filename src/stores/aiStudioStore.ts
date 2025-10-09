import { create } from 'zustand';

import { WaveformData } from '@/services/waveformGenerator';

export interface FadeConfig {
  duration: number;
  curve: string;
}

export interface AudioRegion {
  id: string;
  trackId: string;
  startTime: number;
  duration: number;
  audioBuffer?: AudioBuffer;
  offset?: number;
  sourceStartOffset?: number;
  fadeIn: FadeConfig;
  fadeOut: FadeConfig;
  gain: number;
  locked?: boolean;
  color?: string;
  name?: string;
}

export interface EffectUnit {
  id: string;
  name?: string;
  type: 'eq' | 'compressor' | 'reverb' | 'delay' | 'limiter' | 'saturator' | 'mixxtune';
  enabled: boolean;
  rackPosition: number;
  parameters?: Record<string, any>;
  preset?: string;
}

export interface SendUnit {
  amount: number;
  preFader: boolean;
}

export interface Track {
  id: string;
  name: string;
  type: 'audio' | 'midi' | 'bus' | 'vocal' | 'drums' | 'bass' | 'keys' | 'guitar' | 'other';
  color?: string;
  volume: number;
  pan: number;
  mute: boolean;
  solo: boolean;
  armed?: boolean;
  frozen?: boolean;
  filePath?: string;
  audioBuffer?: AudioBuffer;
  busGroupId?: string;
  effects?: EffectUnit[];
  sends?: Record<string, SendUnit>;
  peakLevel?: number;
  rmsLevel?: number;
  regions?: AudioRegion[];
  waveformData?: Float32Array | WaveformData;
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
  trackIds: string[];
}

export interface TimeSelection {
  start: number;
  end: number;
}

interface AIStudioStore {
  tracks: Track[];
  busGroups: BusGroup[];
  regions: AudioRegion[];
  selectedRegions: Set<string>;
  selectedTrackId: string | null;
  isPlaying: boolean;
  currentTime: number;
  bpm: number;
  duration: number;
  masterVolume: number;
  masterPeakLevel: number;
  timeSelection: TimeSelection | null;
  vcaGroups: any[];
  totalLatency: number;
  latencyCompensation: boolean;
  effects: EffectUnit[];
  scrollMode: string;
  snapEnabled: boolean;
  snapMode: string;
  rippleMode: string;
  
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
  createBusGroup: (name: string, trackIds: string[]) => void;
  deleteBusGroup: (id: string) => void;
  
  // Region actions
  addRegion: (region: AudioRegion) => void;
  updateRegion: (id: string, updates: Partial<AudioRegion>) => void;
  removeRegion: (id: string) => void;
  selectRegion: (id: string, addToSelection?: boolean) => void;
  clearRegionSelection: () => void;
  duplicateRegion: (id: string) => void;
  reverseRegion: (id: string) => void;
  trimRegionStart: (id: string, newStart: number) => void;
  trimRegionEnd: (id: string, newEnd: number) => void;
  
  // Effect actions
  addTrackEffect: (trackId: string, effect: EffectUnit) => void;
  updateTrackEffect: (trackId: string, effectId: string, updates: Partial<EffectUnit>) => void;
  removeTrackEffect: (trackId: string, effectId: string) => void;
  
  // Transport actions
  setPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setBpm: (bpm: number) => void;
  
  // Master actions
  setMasterVolume: (volume: number) => void;
  updateMasterLevels: (peak: number) => void;
  
  // Send actions
  updateTrackSend: (trackId: string, busId: string, amount: number, preFader?: boolean) => void;
  
  // VCA actions
  createVCAGroup: (name: string, trackIds: string[]) => void;
  updateVCAGroup: (id: string, updates: any) => void;
  deleteVCAGroup: (id: string) => void;
  
  // Track freeze actions
  freezeTrack: (id: string) => void;
  unfreezeTrack: (id: string) => void;
  
  // Utility actions
  calculateTotalLatency: () => number;
  calculateSessionDuration: () => number;
  clearSelection: () => void;
  setScrollMode: (mode: string) => void;
  setSnapEnabled: (enabled: boolean) => void;
  setSnapMode: (mode: string) => void;
  setRippleMode: (mode: string) => void;
  splitRegion: (id: string, position: number) => void;
  isRecording: boolean;
  setRecording: (recording: boolean) => void;
  
  // Selection actions
  setTimeSelection: (selection: TimeSelection | null) => void;
}

export const useAIStudioStore = create<AIStudioStore>((set, get) => ({
  tracks: [],
  busGroups: [],
  regions: [],
  selectedRegions: new Set<string>(),
  selectedTrackId: null,
  isPlaying: false,
  currentTime: 0,
  bpm: 120,
  duration: 240,
  masterVolume: 1,
  masterPeakLevel: -Infinity,
  timeSelection: null,
  vcaGroups: [],
  totalLatency: 0,
  latencyCompensation: true,
  effects: [],
  scrollMode: 'page',
  snapEnabled: true,
  snapMode: 'grid',
  rippleMode: 'off',
  isRecording: false,
  
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
  
  createBusGroup: (name, trackIds) => set((state) => ({
    busGroups: [...state.busGroups, {
      id: `bus-${Date.now()}`,
      name,
      trackIds,
      color: '#888888',
      volume: 1,
      pan: 0,
      mute: false,
      solo: false,
    }]
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
  
  removeRegion: (id) => set((state) => {
    const newSelected = new Set(state.selectedRegions);
    newSelected.delete(id);
    return {
      regions: state.regions.filter(r => r.id !== id),
      selectedRegions: newSelected
    };
  }),
  
  selectRegion: (id, addToSelection) => set((state) => {
    const newSelected = new Set(state.selectedRegions);
    if (addToSelection) {
      newSelected.add(id);
    } else {
      newSelected.clear();
      newSelected.add(id);
    }
    return { selectedRegions: newSelected };
  }),
  
  clearRegionSelection: () => set({ selectedRegions: new Set<string>() }),
  
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
  
  trimRegionStart: (id, newStart) => set((state) => ({
    regions: state.regions.map(r =>
      r.id === id
        ? {
            ...r,
            startTime: newStart,
            offset: r.offset + (newStart - r.startTime),
            duration: r.duration - (newStart - r.startTime)
          }
        : r
    )
  })),
  
  trimRegionEnd: (id, newEnd) => set((state) => ({
    regions: state.regions.map(r =>
      r.id === id
        ? {
            ...r,
            duration: newEnd - r.startTime
          }
        : r
    )
  })),
  
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
  
  setBpm: (bpm) => set({ bpm }),
  
  setMasterVolume: (volume) => set({ masterVolume: volume }),
  
  updateMasterLevels: (peak) => set({ masterPeakLevel: peak }),
  
  updateTrackSend: (trackId, busId, amount, preFader) => set((state) => ({
    tracks: state.tracks.map(t =>
      t.id === trackId
        ? {
            ...t,
            sends: {
              ...t.sends,
              [busId]: { amount, preFader: preFader ?? false }
            }
          }
        : t
    )
  })),
  
  createVCAGroup: (name, trackIds) => set((state) => ({
    vcaGroups: [...state.vcaGroups, { id: `vca-${Date.now()}`, name, trackIds }]
  })),
  
  updateVCAGroup: (id, updates) => set((state) => ({
    vcaGroups: state.vcaGroups.map(v => v.id === id ? { ...v, ...updates } : v)
  })),
  
  deleteVCAGroup: (id) => set((state) => ({
    vcaGroups: state.vcaGroups.filter(v => v.id !== id)
  })),
  
  freezeTrack: (id) => set((state) => ({
    tracks: state.tracks.map(t => t.id === id ? { ...t, frozen: true } : t)
  })),
  
  unfreezeTrack: (id) => set((state) => ({
    tracks: state.tracks.map(t => t.id === id ? { ...t, frozen: false } : t)
  })),
  
  calculateTotalLatency: () => {
    const state = get();
    return state.tracks.reduce((sum, t) => sum + ((t.effects?.length ?? 0) * 5), 0);
  },
  
  clearSelection: () => set({ selectedRegions: new Set<string>(), selectedTrackId: null }),
  
  setScrollMode: (mode) => set({ scrollMode: mode }),
  
  setSnapEnabled: (enabled) => set({ snapEnabled: enabled }),
  
  setSnapMode: (mode) => set({ snapMode: mode }),
  
  setRippleMode: (mode) => set({ rippleMode: mode }),
  
  calculateSessionDuration: () => {
    const state = get();
    const maxTime = Math.max(...state.regions.map(r => r.startTime + r.duration), 0);
    return maxTime;
  },
  
  splitRegion: (id, position) => set((state) => {
    const region = state.regions.find(r => r.id === id);
    if (!region || position <= region.startTime || position >= region.startTime + region.duration) {
      return state;
    }
    
    const splitOffset = position - region.startTime;
    const newRegion: AudioRegion = {
      ...region,
      id: `region-${Date.now()}`,
      startTime: position,
      offset: region.offset + splitOffset,
      duration: region.duration - splitOffset,
    };
    
    return {
      regions: [
        ...state.regions.map(r =>
          r.id === id ? { ...r, duration: splitOffset } : r
        ),
        newRegion
      ]
    };
  }),
  
  setRecording: (recording) => set({ isRecording: recording }),
  
  setTimeSelection: (selection) => set({ timeSelection: selection }),
}));
