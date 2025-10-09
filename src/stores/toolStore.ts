import { create } from 'zustand';

export type ToolMode = 'pointer' | 'trim' | 'scissor' | 'glue' | 'fade' | 'mute';

interface ToolStore {
  currentTool: ToolMode;
  setTool: (tool: ToolMode) => void;
}

export const useToolStore = create<ToolStore>((set) => ({
  currentTool: 'pointer',
  setTool: (tool) => set({ currentTool: tool }),
}));
