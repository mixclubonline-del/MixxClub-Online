import { create } from 'zustand';
import { MixxPlugin } from '@/types/mixxPlugin';

interface PluginStore {
  plugins: MixxPlugin[];
  openPlugins: string[];
  activePlugin: string | null;
  openPlugin: (id: string) => void;
  closePlugin: (id: string) => void;
  updatePluginParameter: (pluginId: string, parameterId: string, value: number) => void;
  setActivePlugin: (id: string | null) => void;
  addPlugin: (plugin: MixxPlugin) => void;
  removePlugin: (id: string) => void;
}

export const usePluginStore = create<PluginStore>((set) => ({
  plugins: [],
  openPlugins: [],
  activePlugin: null,
  
  openPlugin: (id) => set((state) => ({
    openPlugins: state.openPlugins.includes(id) ? state.openPlugins : [...state.openPlugins, id],
    activePlugin: id
  })),
  
  closePlugin: (id) => set((state) => ({
    openPlugins: state.openPlugins.filter(p => p !== id),
    activePlugin: state.activePlugin === id ? null : state.activePlugin
  })),
  
  setActivePlugin: (id) => set({ activePlugin: id }),
  
  addPlugin: (plugin) => set((state) => ({
    plugins: [...state.plugins, plugin]
  })),
  
  removePlugin: (id) => set((state) => ({
    plugins: state.plugins.filter(p => p.id !== id),
    openPlugins: state.openPlugins.filter(p => p !== id),
    activePlugin: state.activePlugin === id ? null : state.activePlugin
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
