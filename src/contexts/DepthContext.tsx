import React, { createContext, useContext, ReactNode, useEffect, useRef, useState } from 'react';
import { useDepthLayer } from '@/hooks/useDepthLayer';
import { usePuttinIn } from '@/hooks/usePuttinIn';
import {
  DepthLayer,
  LayerCapabilities,
  DepthLayerConfig,
  PuttinInScore,
  PuttinInMetrics,
  DEPTH_LAYERS,
} from '@/types/depth';
import { hubEventBus } from '@/lib/hubEventBus';
import { analytics } from '@/hooks/useAnalytics';

interface DepthContextValue {
  // Current depth state
  currentLayer: DepthLayer;
  layerInfo: DepthLayerConfig;
  capabilities: LayerCapabilities;
  
  // Puttin' In score
  puttinInScore: number;
  puttinInBreakdown: PuttinInMetrics;
  progressToNext: number;
  nextLayer: DepthLayer | null;
  
  // Helpers
  can: (capability: keyof LayerCapabilities) => boolean;
  isAtLeast: (layer: DepthLayer) => boolean;
  isTheGlow: boolean;
  
  // Quick layer checks
  isPostedUp: boolean;
  isInTheRoom: boolean;
  isOnTheMic: boolean;
  isOnStage: boolean;
  
  // Tracking actions
  trackTime: (minutes: number) => Promise<void>;
  trackAttention: (action: 'follow' | 'watch' | 'engage') => Promise<void>;
  trackSupport: (artistId: string) => Promise<void>;
  trackWork: (type: 'project' | 'session' | 'collab') => Promise<void>;
  
  // Celebration state
  celebrationPending: DepthLayer | null;
  dismissCelebration: () => void;
  
  // Loading state
  loading: boolean;
}

const DepthContext = createContext<DepthContextValue | null>(null);

interface DepthProviderProps {
  children: ReactNode;
}

export function DepthProvider({ children }: DepthProviderProps) {
  const depth = useDepthLayer();
  const puttinIn = usePuttinIn();
  const previousLayerRef = useRef<DepthLayer | null>(null);
  const previousCapabilitiesRef = useRef<LayerCapabilities | null>(null);
  const [celebrationPending, setCelebrationPending] = useState<DepthLayer | null>(null);

  const dismissCelebration = () => setCelebrationPending(null);

  // Publish depth layer change events and trigger celebrations
  useEffect(() => {
    const currentLayer = depth.currentLayer;
    const previousLayer = previousLayerRef.current;
    
    // Skip initial render
    if (previousLayer === null) {
      previousLayerRef.current = currentLayer;
      previousCapabilitiesRef.current = depth.capabilities;
      return;
    }
    
    // Layer changed
    if (previousLayer !== currentLayer) {
      // Determine if this is a level UP (celebration worthy)
      const layerOrder: DepthLayer[] = ['posted-up', 'in-the-room', 'on-the-mic', 'on-stage'];
      const prevIndex = layerOrder.indexOf(previousLayer);
      const currentIndex = layerOrder.indexOf(currentLayer);
      const isLevelUp = currentIndex > prevIndex;

      hubEventBus.publish('depth:layer_changed', {
        from: previousLayer,
        to: currentLayer,
        score: depth.puttinInScore,
        progressToNext: depth.progressToNext,
        isLevelUp,
      }, 'DepthContext');

      // Track in analytics
      analytics.trackDepthLayerChange(previousLayer, currentLayer, depth.puttinInScore);

      // Trigger celebration for level ups
      if (isLevelUp) {
        setCelebrationPending(currentLayer);
        analytics.trackMilestoneReached(currentLayer, depth.puttinInScore);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => setCelebrationPending(null), 5000);
      }
      
      // Check for new capabilities unlocked
      const prevCaps = previousCapabilitiesRef.current;
      const currentCaps = depth.capabilities;
      
      if (prevCaps && currentCaps) {
        const unlockedCapabilities = (Object.keys(currentCaps) as Array<keyof LayerCapabilities>)
          .filter(cap => currentCaps[cap] && !prevCaps[cap]);
        
        if (unlockedCapabilities.length > 0) {
          hubEventBus.publish('depth:capability_unlocked', {
            layer: currentLayer,
            capabilities: unlockedCapabilities,
          }, 'DepthContext');
        }
      }
      
      previousLayerRef.current = currentLayer;
      previousCapabilitiesRef.current = currentCaps;
    }
  }, [depth.currentLayer, depth.capabilities, depth.puttinInScore, depth.progressToNext]);

  const value: DepthContextValue = {
    // From useDepthLayer
    currentLayer: depth.currentLayer,
    layerInfo: depth.layerInfo,
    capabilities: depth.capabilities,
    puttinInScore: depth.puttinInScore,
    progressToNext: depth.progressToNext,
    nextLayer: depth.nextLayer,
    can: depth.can,
    isAtLeast: depth.isAtLeast,
    isTheGlow: depth.isTheGlow,
    isPostedUp: depth.isPostedUp,
    isInTheRoom: depth.isInTheRoom,
    isOnTheMic: depth.isOnTheMic,
    isOnStage: depth.isOnStage,
    loading: depth.loading,
    
    // From usePuttinIn
    puttinInBreakdown: puttinIn.metrics,
    trackTime: puttinIn.trackTime,
    trackAttention: puttinIn.trackAttention,
    trackSupport: puttinIn.trackSupport,
    trackWork: puttinIn.trackWork,
    
    // Celebration state
    celebrationPending,
    dismissCelebration,
  };

  return (
    <DepthContext.Provider value={value}>
      {children}
    </DepthContext.Provider>
  );
}

export function useDepth(): DepthContextValue {
  const context = useContext(DepthContext);
  if (!context) {
    throw new Error('useDepth must be used within a DepthProvider');
  }
  return context;
}

/**
 * HOC to gate content based on depth layer
 */
interface DepthGateProps {
  requires: DepthLayer;
  children: ReactNode;
  fallback?: ReactNode;
}

export function DepthGate({ requires, children, fallback = null }: DepthGateProps) {
  const { isAtLeast, loading } = useDepth();
  
  if (loading) return null;
  
  if (!isAtLeast(requires)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}
