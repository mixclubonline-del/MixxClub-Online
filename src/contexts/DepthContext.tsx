import React, { createContext, useContext, ReactNode } from 'react';
import { useDepthLayer } from '@/hooks/useDepthLayer';
import { usePuttinIn } from '@/hooks/usePuttinIn';
import {
  DepthLayer,
  LayerCapabilities,
  DepthLayerConfig,
  PuttinInScore,
  PuttinInMetrics,
} from '@/types/depth';

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
