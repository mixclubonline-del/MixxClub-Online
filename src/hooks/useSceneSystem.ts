/**
 * Scene System Hook
 * 
 * React hook for connecting components to the scene system.
 * Handles initialization, cleanup, and provides convenient selectors.
 * 
 * IMPORTANT: Uses `useShallow` to prevent infinite re-render loops
 * when selectors return new array/object references with identical content.
 */

import { useEffect } from 'react';
import { useSceneStore, selectActiveStudios, selectPublicStudios, selectCommunityProgress } from '@/stores/sceneStore';

/**
 * Initialize the scene system.
 * Call this once at the app root level.
 */
// Track initialization globally to prevent multiple inits
let isInitialized = false;
let initPromise: Promise<void> | null = null;

export function useSceneSystemInit() {
  const isConnected = useSceneStore(state => state.isConnected);
  
  useEffect(() => {
    // Only initialize once across all component instances
    if (isInitialized) return;
    isInitialized = true;
    
    // Get store methods directly from the store (not via selector)
    const { initialize, cleanup } = useSceneStore.getState();
    
    initPromise = initialize().catch(e => {
      console.error('Scene system init failed:', e);
    });
    
    return () => {
      cleanup();
      isInitialized = false;
      initPromise = null;
    };
  }, []); // Empty deps - run once
  
  return { isConnected };
}

/**
 * Get all studios and their states.
 * Uses memoized selectors from the store to prevent rerender loops.
 */
export function useStudios() {
  // Use direct selectors - they're already memoized in the store
  const studios = useSceneStore(state => state.studios);
  const activeStudios = useSceneStore(selectActiveStudios);
  const publicStudios = useSceneStore(selectPublicStudios);
  
  return {
    studios,
    activeStudios,
    publicStudios,
    activeCount: activeStudios.length,
    totalCount: studios.length,
  };
}

/**
 * Get community pulse data.
 */
export function useCommunityPulse() {
  const communityPulse = useSceneStore(state => state.communityPulse);
  const progress = useSceneStore(selectCommunityProgress);
  
  return {
    ...communityPulse,
    nextUnlockProgress: progress,
  };
}

/**
 * Get the currently featured session.
 */
export function useFeaturedSession() {
  const featuredSession = useSceneStore(state => state.featuredSession);
  const rotateFeaturedSession = useSceneStore(state => state.rotateFeaturedSession);
  
  return {
    featuredSession,
    rotate: rotateFeaturedSession,
  };
}

/**
 * Get recent scene events.
 */
export function useSceneEvents() {
  const recentEvents = useSceneStore(state => state.recentEvents);
  const publishEvent = useSceneStore(state => state.publishEvent);
  
  return {
    events: recentEvents,
    publish: publishEvent,
  };
}

/**
 * Get connection status.
 */
export function useSceneConnection() {
  const isConnected = useSceneStore(state => state.isConnected);
  const lastSyncAt = useSceneStore(state => state.lastSyncAt);
  
  return {
    isConnected,
    lastSyncAt,
  };
}

/**
 * Subscribe to a specific studio's updates.
 */
export function useStudio(studioId: string) {
  const studio = useSceneStore(state => 
    state.studios.find(s => s.id === studioId)
  );
  const updateStudio = useSceneStore(state => state.updateStudio);
  
  return {
    studio,
    update: (updates: Parameters<typeof updateStudio>[1]) => 
      updateStudio(studioId, updates),
  };
}

/**
 * Combined hook for easy access to all scene data.
 * Use this for components that need multiple pieces of scene state.
 */
export function useSceneSystem() {
  const studios = useSceneStore(state => state.studios);
  const communityPulse = useSceneStore(state => state.communityPulse);
  const featuredSession = useSceneStore(state => state.featuredSession);
  const isConnected = useSceneStore(state => state.isConnected);
  const activeStudios = useSceneStore(selectActiveStudios);
  
  return {
    studios,
    activeStudios,
    communityPulse,
    featuredSession,
    isConnected,
    activeCount: activeStudios.length,
  };
}
