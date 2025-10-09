import { create } from 'zustand';

export interface PluginPreview {
  pluginId: string;
  pluginName: string;
  trackId: string;
  effectType: 'eq' | 'compressor' | 'reverb' | 'delay' | 'saturator' | 'limiter';
  isActive: boolean;
}

interface PluginPreviewStore {
  preview: PluginPreview | null;
  
  startPreview: (pluginId: string, pluginName: string, trackId: string, effectType: PluginPreview['effectType']) => void;
  stopPreview: () => void;
  confirmPreview: () => void;
}

export const usePluginPreviewStore = create<PluginPreviewStore>((set) => ({
  preview: null,
  
  startPreview: (pluginId, pluginName, trackId, effectType) => set({
    preview: { pluginId, pluginName, trackId, effectType, isActive: true }
  }),
  
  stopPreview: () => set({ preview: null }),
  
  confirmPreview: () => set({ preview: null })
}));
