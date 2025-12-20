import { useState, useCallback, useRef, useEffect } from 'react';

export interface VersionSnapshot {
  id: string;
  timestamp: number;
  label: string;
  description?: string;
  state: any;
  userId: string;
  userName: string;
  type: 'auto' | 'manual' | 'checkpoint';
}

interface UseVersionHistoryOptions {
  maxSnapshots?: number;
  autoSaveInterval?: number; // in milliseconds
  sessionId: string;
  userId: string;
  userName: string;
}

export const useVersionHistory = (options: UseVersionHistoryOptions) => {
  const {
    maxSnapshots = 50,
    autoSaveInterval = 30000, // 30 seconds
    sessionId,
    userId,
    userName
  } = options;

  const [snapshots, setSnapshots] = useState<VersionSnapshot[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isSaving, setIsSaving] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout>();
  const lastStateRef = useRef<any>(null);

  // Generate unique ID
  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Create a new snapshot
  const createSnapshot = useCallback((
    state: any,
    label: string,
    type: 'auto' | 'manual' | 'checkpoint' = 'manual',
    description?: string
  ) => {
    const snapshot: VersionSnapshot = {
      id: generateId(),
      timestamp: Date.now(),
      label,
      description,
      state: JSON.parse(JSON.stringify(state)), // Deep clone
      userId,
      userName,
      type
    };

    setSnapshots(prev => {
      // Remove any snapshots after current index (for branching)
      const newSnapshots = prev.slice(0, currentIndex + 1);
      newSnapshots.push(snapshot);

      // Trim to max snapshots (keep checkpoints and manual saves longer)
      if (newSnapshots.length > maxSnapshots) {
        const autoSnapshots = newSnapshots.filter(s => s.type === 'auto');
        const importantSnapshots = newSnapshots.filter(s => s.type !== 'auto');
        
        // Remove oldest auto snapshots first
        while (autoSnapshots.length > maxSnapshots / 2 && newSnapshots.length > maxSnapshots) {
          const oldestAuto = autoSnapshots.shift();
          if (oldestAuto) {
            const idx = newSnapshots.findIndex(s => s.id === oldestAuto.id);
            if (idx > 0) newSnapshots.splice(idx, 1);
          }
        }
      }

      return newSnapshots;
    });

    setCurrentIndex(prev => prev + 1);
    lastStateRef.current = state;

    return snapshot;
  }, [currentIndex, maxSnapshots, userId, userName]);

  // Undo - go to previous snapshot
  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      return snapshots[currentIndex - 1];
    }
    return null;
  }, [currentIndex, snapshots]);

  // Redo - go to next snapshot
  const redo = useCallback(() => {
    if (currentIndex < snapshots.length - 1) {
      setCurrentIndex(prev => prev + 1);
      return snapshots[currentIndex + 1];
    }
    return null;
  }, [currentIndex, snapshots]);

  // Go to specific snapshot
  const goToSnapshot = useCallback((snapshotId: string) => {
    const index = snapshots.findIndex(s => s.id === snapshotId);
    if (index >= 0) {
      setCurrentIndex(index);
      return snapshots[index];
    }
    return null;
  }, [snapshots]);

  // Get current snapshot
  const getCurrentSnapshot = useCallback(() => {
    return currentIndex >= 0 ? snapshots[currentIndex] : null;
  }, [currentIndex, snapshots]);

  // Auto-save functionality
  const startAutoSave = useCallback((getState: () => any) => {
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setInterval(() => {
      const currentState = getState();
      
      // Only save if state has changed
      if (JSON.stringify(currentState) !== JSON.stringify(lastStateRef.current)) {
        setIsSaving(true);
        createSnapshot(currentState, 'Auto-save', 'auto');
        setTimeout(() => setIsSaving(false), 500);
      }
    }, autoSaveInterval);
  }, [autoSaveInterval, createSnapshot]);

  const stopAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
    }
  }, []);

  // Create checkpoint (important save point)
  const createCheckpoint = useCallback((state: any, name: string, description?: string) => {
    return createSnapshot(state, name, 'checkpoint', description);
  }, [createSnapshot]);

  // Delete snapshot
  const deleteSnapshot = useCallback((snapshotId: string) => {
    setSnapshots(prev => {
      const index = prev.findIndex(s => s.id === snapshotId);
      if (index < 0) return prev;

      const newSnapshots = prev.filter(s => s.id !== snapshotId);
      
      // Adjust current index if needed
      if (index <= currentIndex) {
        setCurrentIndex(curr => Math.max(0, curr - 1));
      }

      return newSnapshots;
    });
  }, [currentIndex]);

  // Export history
  const exportHistory = useCallback(() => {
    return {
      sessionId,
      exportedAt: Date.now(),
      snapshots: snapshots.map(s => ({
        ...s,
        state: undefined // Don't export state data for security
      }))
    };
  }, [sessionId, snapshots]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAutoSave();
    };
  }, [stopAutoSave]);

  return {
    snapshots,
    currentIndex,
    currentSnapshot: getCurrentSnapshot(),
    canUndo: currentIndex > 0,
    canRedo: currentIndex < snapshots.length - 1,
    isSaving,
    createSnapshot,
    createCheckpoint,
    undo,
    redo,
    goToSnapshot,
    deleteSnapshot,
    startAutoSave,
    stopAutoSave,
    exportHistory
  };
};
