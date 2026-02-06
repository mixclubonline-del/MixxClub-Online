import { create } from 'zustand';

type PreviewRole = 'artist' | 'engineer' | 'producer' | 'fan';

interface AdminPreviewState {
  previewRole: PreviewRole | null;
  isPreviewMode: boolean;
  enterPreview: (role: PreviewRole) => void;
  exitPreview: () => void;
}

export const useAdminPreview = create<AdminPreviewState>((set) => ({
  previewRole: null,
  isPreviewMode: false,
  enterPreview: (role) => set({ previewRole: role, isPreviewMode: true }),
  exitPreview: () => set({ previewRole: null, isPreviewMode: false }),
}));
