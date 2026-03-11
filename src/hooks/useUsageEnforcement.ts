/**
 * useUsageEnforcement — Tier-aware usage limit enforcement.
 *
 * Reads subscription tier from useSubscriptionManagement,
 * queries user_subscriptions for usage data, and exposes
 * canUseFeature / trackUsage methods.
 */

import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptionManagement } from '@/hooks/useSubscriptionManagement';

/** Per-tier feature limits. null = unlimited. */
const TIER_LIMITS: Record<string, Record<string, number | null>> = {
  free: {
    projects: 3,
    audio_uploads: 10,
    ai_matching: 2,
    storage_mb: 500,
    collaborations: 5,
  },
  starter: {
    projects: 15,
    audio_uploads: 50,
    ai_matching: 10,
    storage_mb: 5000,
    collaborations: 25,
  },
  pro: {
    projects: null,
    audio_uploads: null,
    ai_matching: 50,
    storage_mb: 25000,
    collaborations: null,
  },
  studio: {
    projects: null,
    audio_uploads: null,
    ai_matching: null,
    storage_mb: null,
    collaborations: null,
  },
};

export interface UsageState {
  tier: string;
  limits: Record<string, number | null>;
  /** Current usage counts keyed by feature */
  usage: Record<string, number>;
}

export function useUsageEnforcement() {
  const { user } = useAuth();
  const { currentPlan, loading: subLoading } = useSubscriptionManagement();
  const queryClient = useQueryClient();

  const tier = currentPlan?.tier || 'free';
  const limits = TIER_LIMITS[tier] || TIER_LIMITS.free;

  // Get live usage counts
  const { data: usageCounts = {}, isLoading: usageLoading } = useQuery({
    queryKey: ['usage-counts', user?.id],
    queryFn: async (): Promise<Record<string, number>> => {
      if (!user?.id) return {};

      const [projectsRes, audioRes, matchingRes] = await Promise.all([
        supabase.from('projects').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('audio_files').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('ai_collaboration_matches').select('id', { count: 'exact', head: true }).eq('artist_id', user.id),
      ]);

      return {
        projects: projectsRes.count || 0,
        audio_uploads: audioRes.count || 0,
        ai_matching: matchingRes.count || 0,
      };
    },
    enabled: !!user?.id,
    staleTime: 30_000,
  });

  const loading = subLoading || usageLoading;

  /**
   * Check if user can use a feature based on their tier limits.
   * Returns true if unlimited or under limit.
   */
  const canUseFeature = useCallback(
    (feature: string): boolean => {
      const limit = limits[feature];
      if (limit === null || limit === undefined) return true; // unlimited or unknown feature
      const current = usageCounts[feature] || 0;
      return current < limit;
    },
    [limits, usageCounts],
  );

  /**
   * Get usage info for a specific feature.
   */
  const getFeatureUsage = useCallback(
    (feature: string) => {
      const limit = limits[feature];
      const current = usageCounts[feature] || 0;
      const isUnlimited = limit === null || limit === undefined;

      return {
        current,
        limit: isUnlimited ? Infinity : limit!,
        isUnlimited,
        percentage: isUnlimited ? 0 : Math.min((current / limit!) * 100, 100),
        remaining: isUnlimited ? Infinity : Math.max(limit! - current, 0),
        limitReached: !isUnlimited && current >= limit!,
      };
    },
    [limits, usageCounts],
  );

  /**
   * Refresh usage counts after an action (e.g., creating a project).
   */
  const refreshUsage = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['usage-counts'] });
  }, [queryClient]);

  /**
   * Overall usage summary across all features.
   */
  const overallUsage = useMemo(() => {
    const features = Object.keys(limits);
    const limited = features.filter(f => limits[f] !== null);
    if (limited.length === 0) return { percentage: 0, anyLimitReached: false };

    const percentages = limited.map(f => {
      const limit = limits[f]!;
      const current = usageCounts[f] || 0;
      return Math.min((current / limit) * 100, 100);
    });

    return {
      percentage: percentages.reduce((a, b) => a + b, 0) / percentages.length,
      anyLimitReached: percentages.some(p => p >= 100),
    };
  }, [limits, usageCounts]);

  return {
    tier,
    limits,
    usage: usageCounts,
    loading,
    canUseFeature,
    getFeatureUsage,
    refreshUsage,
    overallUsage,
  };
}
