/**
 * useABVariant — Deterministic A/B variant assignment backed by funnel_events.
 *
 * Assigns a variant based on hash(sessionId + testName) so the same user
 * always sees the same variant. Logs impressions once per session.
 */

import { useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ABVariant = 'control' | 'variant_a' | 'variant_b';

interface ABVariantConfig {
  name: string;
  weight: number;
}

function getSessionId(): string {
  const KEY = 'ab_session_id';
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}

/** Simple deterministic hash → 0..1 */
function hashToFloat(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash % 10000) / 10000;
}

function pickVariant(variants: ABVariantConfig[], hash: number): string {
  const totalWeight = variants.reduce((s, v) => s + v.weight, 0);
  let cumulative = 0;
  for (const v of variants) {
    cumulative += v.weight / totalWeight;
    if (hash < cumulative) return v.name;
  }
  return variants[0]?.name || 'control';
}

export function useABVariant(
  testName: string,
  fallbackVariants: ABVariantConfig[] = [
    { name: 'control', weight: 50 },
    { name: 'variant_a', weight: 50 },
  ],
) {
  const sessionId = useMemo(getSessionId, []);
  const impressionLogged = useRef(false);

  const variant = useMemo(() => {
    const hash = hashToFloat(sessionId + testName);
    return pickVariant(fallbackVariants, hash);
  }, [sessionId, testName, fallbackVariants]);

  // Log impression once per session per test
  useEffect(() => {
    if (impressionLogged.current) return;
    impressionLogged.current = true;

    supabase
      .from('funnel_events')
      .insert([{
        session_id: sessionId,
        funnel_source: 'ab_test' as any,
        step: 'impression' as any,
        step_data: { test_name: testName, variant } as any,
      }])
      .then(({ error }) => {
        if (error) console.warn('[ABVariant] impression log failed:', error.message);
      });
  }, [sessionId, testName, variant]);

  const trackConversion = (eventName: string, data?: Record<string, unknown>) => {
    supabase
      .from('funnel_events')
      .insert([{
        session_id: sessionId,
        funnel_source: 'ab_test' as any,
        step: 'conversion' as any,
        step_data: { test_name: testName, variant, event: eventName, ...data } as any,
      }])
      .then(({ error }) => {
        if (error) console.warn('[ABVariant] conversion log failed:', error.message);
      });
  };

  return { variant, trackConversion, sessionId };
}
