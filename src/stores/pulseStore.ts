// Pulse Store - Energy State Management with Zustand
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { EnergyState, PulseTransition, PulseState, getPulseConfig } from '@/types/pulse';
import { detectEnergyFromRoute } from '@/lib/pulseRouteMap';
import { hubEventBus } from '@/lib/hubEventBus';

interface PulseStore extends PulseState {
  // Actions
  setEnergy: (energy: EnergyState, trigger?: 'route' | 'action' | 'manual', source?: string) => void;
  detectFromRoute: (path: string) => void;
  startTransition: () => void;
  endTransition: () => void;
  
  // Selectors (memoized for stability)
  getConfig: () => ReturnType<typeof getPulseConfig>;
  isFocusMode: () => boolean;
  getAmbientIntensity: () => number;
}

const MAX_HISTORY_SIZE = 50;

export const usePulseStore = create<PulseStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    currentEnergy: 'DISCOVER',
    previousEnergy: null,
    transitionInProgress: false,
    transitionHistory: [],
    
    // Set energy state with transition tracking
    setEnergy: (energy, trigger = 'manual', source) => {
      const { currentEnergy, transitionHistory } = get();
      
      // Don't transition to same state
      if (energy === currentEnergy) return;
      
      const transition: PulseTransition = {
        from: currentEnergy,
        to: energy,
        timestamp: Date.now(),
        trigger,
        source,
      };
      
      // Publish transition started event
      hubEventBus.publish('energy:transition_started', {
        from: currentEnergy,
        to: energy,
        trigger,
      }, 'pulseStore');
      
      // Start transition animation
      set({ transitionInProgress: true });
      
      // Update state after brief delay for animation
      setTimeout(() => {
        set({
          currentEnergy: energy,
          previousEnergy: currentEnergy,
          transitionInProgress: false,
          transitionHistory: [
            transition,
            ...transitionHistory.slice(0, MAX_HISTORY_SIZE - 1),
          ],
        });
        
        // Publish energy changed event
        hubEventBus.publish('energy:changed', {
          from: currentEnergy,
          to: energy,
          trigger,
          source,
        }, 'pulseStore');
        
        // Publish transition completed event
        hubEventBus.publish('energy:transition_completed', {
          energy,
          duration: 150,
        }, 'pulseStore');
      }, 150); // Brief transition delay
    },
    
    // Auto-detect energy from route
    detectFromRoute: (path) => {
      const detectedEnergy = detectEnergyFromRoute(path);
      const { currentEnergy } = get();
      
      if (detectedEnergy !== currentEnergy) {
        get().setEnergy(detectedEnergy, 'route', path);
      }
    },
    
    // Transition control
    startTransition: () => set({ transitionInProgress: true }),
    endTransition: () => set({ transitionInProgress: false }),
    
    // Memoized selectors
    getConfig: () => getPulseConfig(get().currentEnergy),
    isFocusMode: () => getPulseConfig(get().currentEnergy).focusMode,
    getAmbientIntensity: () => getPulseConfig(get().currentEnergy).ambientIntensity,
  }))
);

// Selector hooks for optimized re-renders
export const useCurrentEnergy = () => usePulseStore((s) => s.currentEnergy);
export const usePreviousEnergy = () => usePulseStore((s) => s.previousEnergy);
export const useTransitionInProgress = () => usePulseStore((s) => s.transitionInProgress);
export const usePulseConfig = () => usePulseStore((s) => getPulseConfig(s.currentEnergy));
export const useIsFocusMode = () => usePulseStore((s) => getPulseConfig(s.currentEnergy).focusMode);
