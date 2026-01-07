/**
 * Scene System Hook
 * 
 * React hook for connecting components to the scene system.
 * Handles initialization, cleanup, and provides convenient selectors.
 */

import { useEffect } from 'react';
import { useSceneStore, selectActiveStudios, selectPublicStudios, selectCommunityProgress } from '@/stores/sceneStore';

/**
 * Initialize the scene system.
 * Call this once at the app root level.
 */
export function useSceneSystemInit() {
  const initialize = useSceneStore(state => state.initialize);
  const cleanup = useSceneStore(state => state.cleanup);
  const isConnected = useSceneStore(state => state.isConnected);
  
  useEffect(() => {
    initialize();
    return () => cleanup();
  }, [initialize, cleanup]);
  
  return { isConnected };
}

/**
 * Get all studios and their states.
 */
export function useStudios() {
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
