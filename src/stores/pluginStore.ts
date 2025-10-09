import { create } from 'zustand';
import { MixxPlugin } from '@/types/mixxPlugin';

interface PluginStore {
  plugins: MixxPlugin[];
  openPlugins: string[];
  openPlugin: (id: string) => void;
  closePlugin: (id: string) => void;
  updatePluginParameter: (pluginId: string, parameterId: string, value: number) => void;
}

export const usePluginStore = create<PluginStore>((set) => ({
  plugins: [],
  openPlugins: [],
  
  openPlugin: (id) => set((state) => ({
    openPlugins: [...state.openPlugins, id]
  })),
  
  closePlugin: (id) => set((state) => ({
    openPlugins: state.openPlugins.filter(p => p !== id)
  })),
  
  updatePluginParameter: (pluginId, parameterId, value) => set((state) => ({
    plugins: state.plugins.map(plugin =>
      plugin.id === pluginId
        ? {
            ...plugin,
            parameters: plugin.parameters.map(param =>
              param.id === parameterId ? { ...param, value } : param
            )
          }
        : plugin
    )
  }))
}));
