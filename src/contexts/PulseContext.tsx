// Pulse Context - React integration for energy state system
import { createContext, useContext, useEffect, ReactNode, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { usePulseStore, useCurrentEnergy, usePulseConfig } from '@/stores/pulseStore';
import { useDepth } from '@/contexts/DepthContext';
import { EnergyState, PulseConfig, PULSE_CONFIGS } from '@/types/pulse';
import { DepthLayer } from '@/types/depth';

interface PulseContextValue {
  // Current state
  currentEnergy: EnergyState;
  previousEnergy: EnergyState | null;
  config: PulseConfig;
  transitionInProgress: boolean;
  
  // Depth integration
  currentLayer: DepthLayer;
  isFocusMode: boolean;
  ambientIntensity: number;
  
  // Actions
  setEnergy: (energy: EnergyState) => void;
  
  // Helpers
  isEnergy: (energy: EnergyState) => boolean;
  canAccessEnergy: (energy: EnergyState) => boolean;
}

const PulseContext = createContext<PulseContextValue | null>(null);

interface PulseProviderProps {
  children: ReactNode;
}

export function PulseProvider({ children }: PulseProviderProps) {
  const location = useLocation();
  const { currentLayer, loading: depthLoading } = useDepth();
  
  // Pulse store
  const currentEnergy = useCurrentEnergy();
  const config = usePulseConfig();
  const { 
    previousEnergy, 
    transitionInProgress, 
    setEnergy: storeSetEnergy,
    detectFromRoute,
    isFocusMode,
    getAmbientIntensity,
  } = usePulseStore();
  
  // Auto-detect energy from route changes
  useEffect(() => {
    detectFromRoute(location.pathname);
  }, [location.pathname, detectFromRoute]);
  
  // Memoized context value
  const value = useMemo<PulseContextValue>(() => ({
    currentEnergy,
    previousEnergy,
    config,
    transitionInProgress,
    currentLayer,
    isFocusMode: isFocusMode(),
    ambientIntensity: getAmbientIntensity(),
    
    setEnergy: (energy: EnergyState) => storeSetEnergy(energy, 'manual'),
    
    isEnergy: (energy: EnergyState) => currentEnergy === energy,
    
    // Depth-based energy access (some energies require higher depth)
    canAccessEnergy: (energy: EnergyState) => {
      // COLLABORATE requires at least "in-the-room"
      if (energy === 'COLLABORATE') {
        return currentLayer !== 'posted-up';
      }
      // MANAGE requires at least "on-the-mic"
      if (energy === 'MANAGE') {
        return currentLayer === 'on-the-mic' || currentLayer === 'on-stage';
      }
      // All other energies accessible to everyone
      return true;
    },
  }), [
    currentEnergy,
    previousEnergy,
    config,
    transitionInProgress,
    currentLayer,
    isFocusMode,
    getAmbientIntensity,
    storeSetEnergy,
  ]);
  
  return (
    <PulseContext.Provider value={value}>
      {children}
    </PulseContext.Provider>
  );
}

// Hook to access pulse context
export function usePulse(): PulseContextValue {
  const context = useContext(PulseContext);
  if (!context) {
    throw new Error('usePulse must be used within a PulseProvider');
  }
  return context;
}

// Gate component for energy-specific content
interface PulseGateProps {
  energy: EnergyState | EnergyState[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function PulseGate({ energy, children, fallback = null }: PulseGateProps) {
  const { currentEnergy } = usePulse();
  
  const energies = Array.isArray(energy) ? energy : [energy];
  const isActive = energies.includes(currentEnergy);
  
  return isActive ? <>{children}</> : <>{fallback}</>;
}

// Get all available energy states
export function getAllEnergyStates(): EnergyState[] {
  return Object.keys(PULSE_CONFIGS) as EnergyState[];
}
