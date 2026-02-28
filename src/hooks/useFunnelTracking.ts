import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { analytics } from '@/hooks/useAnalytics';

type FunnelSource = 'quick_start' | 'immersive' | 'promo';
type FunnelStep = 'landed' | 'role_selected' | 'auth_started' | 'auth_completed' | 'action_selected' | 'scene_2' | 'scene_3' | 'scene_4' | 'signup_started' | 'signup_completed';

function getSessionId(): string {
  const KEY = 'funnel_session_id';
  let id = sessionStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(KEY, id);
  }
  return id;
}

/**
 * Shared funnel tracking hook.
 * Fires events to both the client-side analytics queue and the funnel_events table.
 */
export function useFunnelTracking(funnelSource: FunnelSource) {
  const sessionId = useRef(getSessionId());

  const trackStep = useCallback(
    (step: FunnelStep, stepData?: Record<string, unknown>) => {
      // Client-side analytics (GA4-ready queue)
      analytics.track('funnel_step', { funnel_source: funnelSource, step, ...stepData });

      // Fire-and-forget DB insert — no await, no UI blocking
      supabase
        .from('funnel_events')
        .insert([{
          session_id: sessionId.current,
          funnel_source: funnelSource,
          step,
          step_data: (stepData ?? {}) as any,
        }])
        .then(({ error }) => {
          if (error) console.warn('[FunnelTracking] insert failed:', error.message);
        });
    },
    [funnelSource],
  );

  return { trackStep };
}
