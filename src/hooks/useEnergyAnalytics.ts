import { useEffect, useRef, useCallback } from 'react';
import { useHubEvent } from '@/lib/hubEventBus';
import { analytics } from '@/hooks/useAnalytics';

export type EnergyState = 'DISCOVER' | 'CREATE' | 'COLLABORATE' | 'MANAGE' | 'EARN' | 'CELEBRATE';

interface EnergyTransition {
  from: EnergyState;
  to: EnergyState;
  timestamp: number;
  trigger?: string;
}

interface EnergySession {
  sessionId: string;
  startTime: number;
  transitions: EnergyTransition[];
  dwellTime: Record<EnergyState, number>;
}

const ENERGY_STATES: EnergyState[] = ['DISCOVER', 'CREATE', 'COLLABORATE', 'MANAGE', 'EARN', 'CELEBRATE'];

function createEmptyDwellTime(): Record<EnergyState, number> {
  return {
    DISCOVER: 0,
    CREATE: 0,
    COLLABORATE: 0,
    MANAGE: 0,
    EARN: 0,
    CELEBRATE: 0,
  };
}

/**
 * useEnergyAnalytics - Track how users flow between energy states
 * 
 * Measures:
 * - Dwell time per energy state
 * - Transition patterns (which flows are common?)
 * - Session summaries
 */
export function useEnergyAnalytics() {
  const sessionRef = useRef<EnergySession>({
    sessionId: `energy-${Date.now()}`,
    startTime: Date.now(),
    transitions: [],
    dwellTime: createEmptyDwellTime(),
  });

  const currentEnergyRef = useRef<EnergyState>('DISCOVER');
  const lastTransitionTimeRef = useRef<number>(Date.now());

  // Update dwell time for current state
  const updateDwellTime = useCallback(() => {
    const now = Date.now();
    const elapsed = (now - lastTransitionTimeRef.current) / 1000; // seconds
    sessionRef.current.dwellTime[currentEnergyRef.current] += elapsed;
    lastTransitionTimeRef.current = now;
  }, []);

  // Listen to energy change events
  useHubEvent<{ from: EnergyState; to: EnergyState; trigger?: string }>('energy:changed', (event) => {
    const { from, to, trigger } = event.payload as { from: EnergyState; to: EnergyState; trigger?: string };

    // Update dwell time for previous state
    updateDwellTime();

    // Record transition
    const transition: EnergyTransition = {
      from,
      to,
      timestamp: Date.now(),
      trigger,
    };

    sessionRef.current.transitions.push(transition);
    currentEnergyRef.current = to;

    // Track in analytics
    analytics.track('energy_transition', {
      from,
      to,
      trigger,
      sessionId: sessionRef.current.sessionId,
    });

    if (import.meta.env.DEV) {
      console.log('🔄 Energy Transition:', from, '→', to, trigger ? `(${trigger})` : '');
    }
  });

  // Get current session analytics
  const getSessionSummary = useCallback(() => {
    updateDwellTime();

    const session = sessionRef.current;
    const totalTime = Object.values(session.dwellTime).reduce((a, b) => a + b, 0);

    // Find primary energy (most time spent)
    const primaryEnergy = ENERGY_STATES.reduce((a, b) =>
      session.dwellTime[a] > session.dwellTime[b] ? a : b
    );

    // Calculate transition patterns
    const transitionCounts: Record<string, number> = {};
    session.transitions.forEach(t => {
      const key = `${t.from}→${t.to}`;
      transitionCounts[key] = (transitionCounts[key] || 0) + 1;
    });

    return {
      sessionId: session.sessionId,
      duration: totalTime,
      primaryEnergy,
      dwellTime: { ...session.dwellTime },
      dwellPercentages: ENERGY_STATES.reduce((acc, state) => ({
        ...acc,
        [state]: totalTime > 0 ? Math.round((session.dwellTime[state] / totalTime) * 100) : 0,
      }), {} as Record<EnergyState, number>),
      transitionCount: session.transitions.length,
      topTransitions: Object.entries(transitionCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5),
    };
  }, [updateDwellTime]);

  // Flush session data (call on unmount or navigation)
  const flushSession = useCallback(() => {
    const summary = getSessionSummary();

    analytics.track('energy_session_complete', summary);

    if (import.meta.env.DEV) {
      console.log('📊 Energy Session Summary:', summary);
    }

    return summary;
  }, [getSessionSummary]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      flushSession();
    };
  }, [flushSession]);

  return {
    getSessionSummary,
    flushSession,
    getCurrentEnergy: () => currentEnergyRef.current,
  };
}

/**
 * Hook to get energy flow visualization data
 */
export function useEnergyFlowData() {
  const { getSessionSummary } = useEnergyAnalytics();

  const getFlowData = useCallback(() => {
    const summary = getSessionSummary();

    return {
      nodes: ENERGY_STATES.map(state => ({
        id: state,
        label: state,
        value: summary.dwellPercentages[state],
      })),
      primaryEnergy: summary.primaryEnergy,
      totalTransitions: summary.transitionCount,
    };
  }, [getSessionSummary]);

  return { getFlowData };
}
