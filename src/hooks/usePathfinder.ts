import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSceneFlowStore } from '@/stores/sceneFlowStore';
import { isFullImmersiveRoute } from '@/config/immersiveRoutes';
import {
  PATHFINDER_JOURNEYS,
  getJourneyById,
  getJourneyForRole,
  type PathfinderJourney,
  type PathfinderStep,
} from '@/config/pathfinderJourneys';

const LS_KEY = 'pathfinder_v1';

interface PathfinderState {
  journeyId: string;
  stepIndex: number;
  dismissed: boolean;
  completed: boolean;
}

function loadLocal(): PathfinderState | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveLocal(state: PathfinderState) {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}

export function usePathfinder() {
  const { user, activeRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const scene = useSceneFlowStore((s) => s.scene);
  const go = useSceneFlowStore((s) => s.go);
  const [state, setState] = useState<PathfinderState | null>(null);
  const [isReady, setIsReady] = useState(false);
  const autoStartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Load persisted state ───
  useEffect(() => {
    const load = async () => {
      if (user) {
        const { data } = await supabase
          .from('pathfinder_progress')
          .select('journey_id, current_step, is_completed, dismissed_at')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data && !data.is_completed && !data.dismissed_at) {
          setState({ journeyId: data.journey_id, stepIndex: data.current_step, dismissed: false, completed: false });
        } else if (!data) {
          // Check localStorage migration
          const local = loadLocal();
          if (local && !local.dismissed && !local.completed) {
            setState(local);
            // Persist to DB
            await supabase.from('pathfinder_progress').upsert({
              user_id: user.id,
              journey_id: local.journeyId,
              current_step: local.stepIndex,
            });
          }
        }
      } else {
        const local = loadLocal();
        if (local && !local.dismissed && !local.completed) {
          setState(local);
        }
      }
      setIsReady(true);
    };
    load();
  }, [user]);

  // ─── Auto-start for first-time visitors on the Hallway (Phase 1) ───
  useEffect(() => {
    if (!isReady || state) return;
    if (location.pathname !== '/') return;

    const alreadyStarted = localStorage.getItem('pathfinder_v1_started');
    if (alreadyStarted) return;

    autoStartTimerRef.current = setTimeout(() => {
      startJourney('visitor');
      localStorage.setItem('pathfinder_v1_started', '1');
    }, 3000);

    return () => {
      if (autoStartTimerRef.current) clearTimeout(autoStartTimerRef.current);
    };
  }, [isReady, state, location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Auto-start role-specific journey (Phase 2) ───
  useEffect(() => {
    if (!isReady || !user || !activeRole) return;
    // Don't interrupt an active journey
    if (state && !state.dismissed && !state.completed) return;

    const roleJourney = getJourneyForRole(activeRole);
    if (!roleJourney) return;

    const roleKey = `pathfinder_v1_${roleJourney.id}_started`;
    if (localStorage.getItem(roleKey)) return;

    // Small delay so the page settles
    const timer = setTimeout(() => {
      startJourney(roleJourney.id);
      localStorage.setItem(roleKey, '1');
    }, 2000);

    return () => clearTimeout(timer);
  }, [isReady, user, activeRole, state]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Persist changes ───
  const persist = useCallback(async (newState: PathfinderState) => {
    setState(newState);
    saveLocal(newState);
    if (user) {
      await supabase.from('pathfinder_progress').upsert({
        user_id: user.id,
        journey_id: newState.journeyId,
        current_step: newState.stepIndex,
        is_completed: newState.completed,
        dismissed_at: newState.dismissed ? new Date().toISOString() : null,
        completed_at: newState.completed ? new Date().toISOString() : null,
      });
    }
  }, [user]);

  // ─── Derived values ───
  const journey: PathfinderJourney | undefined = state ? getJourneyById(state.journeyId) : undefined;
  const currentStep: PathfinderStep | undefined = journey?.steps[state?.stepIndex ?? 0];
  const isActive = !!state && !state.dismissed && !state.completed && !!journey;
  const totalSteps = journey?.steps.length ?? 0;
  const isOnImmersiveRoute = isFullImmersiveRoute(location.pathname);

  // ─── Check if user is currently at the step's target ───
  const isAtCurrentStep = useCallback(() => {
    if (!currentStep) return false;
    // For routes with query params, match pathname portion
    const stepPath = currentStep.route.split('?')[0];
    const routeMatch = location.pathname === stepPath;
    if (!routeMatch) return false;
    if (currentStep.sceneHint) return scene === currentStep.sceneHint;
    return true;
  }, [currentStep, location.pathname, scene]);

  // ─── Actions ───
  const startJourney = useCallback((journeyId: string) => {
    const j = getJourneyById(journeyId);
    if (!j) return;
    persist({ journeyId, stepIndex: 0, dismissed: false, completed: false });
  }, [persist]);

  const next = useCallback(() => {
    if (!state || !journey) return;
    const nextIdx = state.stepIndex + 1;
    if (nextIdx >= journey.steps.length) {
      persist({ ...state, completed: true });
    } else {
      persist({ ...state, stepIndex: nextIdx });
    }
  }, [state, journey, persist]);

  const skip = useCallback(() => {
    next();
  }, [next]);

  const dismiss = useCallback(() => {
    if (!state) return;
    persist({ ...state, dismissed: true });
  }, [state, persist]);

  const goToStep = useCallback(() => {
    if (!currentStep) return;
    // If target is a scene on `/`, navigate there and trigger scene change
    if (currentStep.route === '/' && currentStep.sceneHint) {
      if (location.pathname !== '/') {
        navigate('/');
      }
      if (scene !== currentStep.sceneHint) {
        go(currentStep.sceneHint);
      }
    } else {
      navigate(currentStep.route);
    }
  }, [currentStep, location.pathname, navigate, scene, go]);

  return {
    isActive,
    isReady,
    journey,
    currentStep,
    stepIndex: state?.stepIndex ?? 0,
    totalSteps,
    isOnImmersiveRoute,
    isAtCurrentStep: isAtCurrentStep(),
    next,
    skip,
    dismiss,
    goToStep,
    startJourney,
    allJourneys: PATHFINDER_JOURNEYS,
  };
}
