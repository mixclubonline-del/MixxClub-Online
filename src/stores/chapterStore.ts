/**
 * Chapter Store
 * 
 * Zustand state machine for horizontal storybook navigation.
 * Manages chapter index, transition state, and chapter registry.
 */

import { create } from 'zustand';

export interface ChapterDef {
  id: string;
  title: string;
  subtitle?: string;
}

export const DEFAULT_CHAPTERS: ChapterDef[] = [
  { id: 'hallway', title: 'Enter', subtitle: 'The Hallway' },
  { id: 'demo', title: 'Experience', subtitle: 'Insider Demo' },
  { id: 'club', title: 'Explore', subtitle: 'The Club' },
  { id: 'choose', title: 'Join', subtitle: 'Choose Your Path' },
];

type TransitionDir = 'left' | 'right' | null;

interface ChapterState {
  chapters: ChapterDef[];
  active: number;
  transitioning: boolean;
  direction: TransitionDir;
  durationMs: number;

  // Actions
  goTo: (index: number) => void;
  next: () => void;
  prev: () => void;
  setChapters: (chapters: ChapterDef[]) => void;
}

export const useChapterStore = create<ChapterState>((set, get) => ({
  chapters: DEFAULT_CHAPTERS,
  active: 0,
  transitioning: false,
  direction: null,
  durationMs: 600,

  goTo: (index) => {
    const { active, transitioning, chapters, durationMs } = get();
    if (transitioning || index === active || index < 0 || index >= chapters.length) return;

    const dir: TransitionDir = index > active ? 'left' : 'right';
    set({ transitioning: true, direction: dir, active: index });

    window.setTimeout(() => {
      set({ transitioning: false, direction: null });
    }, durationMs);
  },

  next: () => {
    const { active, chapters } = get();
    if (active < chapters.length - 1) get().goTo(active + 1);
  },

  prev: () => {
    const { active } = get();
    if (active > 0) get().goTo(active - 1);
  },

  setChapters: (chapters) => set({ chapters }),
}));
