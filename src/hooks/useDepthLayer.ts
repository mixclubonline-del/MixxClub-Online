import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePuttinIn } from '@/hooks/usePuttinIn';
import {
  DepthLayer,
  LayerCapabilities,
  DEPTH_LAYERS,
  LAYER_CAPABILITIES,
  getCapabilities,
  hasCapability,
} from '@/types/depth';

/**
 * useDepthLayer - Determine user's current depth in the community
 * 
 * Posted Up → In the Room → On the Mic → On Stage
 * 
 * Based on authentication status and "puttin' in" score
 */
export function useDepthLayer() {
  const { user, userRole } = useAuth();
  const { score, loading } = usePuttinIn();

  // Determine current layer
  const currentLayer: DepthLayer = useMemo(() => {
    // Not signed in = Posted Up (in the building, feeling the vibe)
    if (!user) return 'posted-up';
    
    // Use the calculated layer from puttin' in score
    return score.currentLayer;
  }, [user, score.currentLayer]);

  // Get capabilities for current layer
  const capabilities: LayerCapabilities = useMemo(() => {
    return getCapabilities(currentLayer);
  }, [currentLayer]);

  // Helper to check specific capability
  const can = (capability: keyof LayerCapabilities): boolean => {
    return capabilities[capability];
  };

  // Layer display info
  const layerInfo = DEPTH_LAYERS[currentLayer];

  // Check if user is at or above a certain layer
  const isAtLeast = (layer: DepthLayer): boolean => {
    const layerOrder: DepthLayer[] = ['posted-up', 'in-the-room', 'on-the-mic', 'on-stage'];
    return layerOrder.indexOf(currentLayer) >= layerOrder.indexOf(layer);
  };

  // Is the user "the glow" (visible to lower layers)
  const isTheGlow = currentLayer === 'on-stage';

  return {
    // Current state
    currentLayer,
    layerInfo,
    capabilities,
    loading,
    
    // Score details
    puttinInScore: score.total,
    progressToNext: score.progressToNext,
    nextLayer: score.nextLayer,
    
    // Helpers
    can,
    isAtLeast,
    isTheGlow,
    
    // Quick checks
    isPostedUp: currentLayer === 'posted-up',
    isInTheRoom: currentLayer === 'in-the-room',
    isOnTheMic: currentLayer === 'on-the-mic',
    isOnStage: currentLayer === 'on-stage',
  };
}

/**
 * Hook to check if current user can see specific content based on depth
 */
export function useDepthGate(requiredLayer: DepthLayer) {
  const { currentLayer, isAtLeast } = useDepthLayer();
  
  return {
    hasAccess: isAtLeast(requiredLayer),
    currentLayer,
    requiredLayer,
  };
}
