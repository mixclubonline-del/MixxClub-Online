/**
 * useUnlockCelebration Hook
 * 
 * Detects newly unlocked milestones since last visit
 * and provides celebration trigger mechanism.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

const SEEN_UNLOCKS_KEY = 'mixx_seen_unlocks';

export interface UnlockedMilestone {
  id: string;
  name: string;
  description: string | null;
  unlock_type: string;
  tier: number;
  reward_description: string | null;
  icon_name: string | null;
  unlocked_at: string | null;
}

function getSeenUnlocks(): string[] {
  try {
    const stored = localStorage.getItem(SEEN_UNLOCKS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveSeenUnlocks(ids: string[]): void {
  try {
    localStorage.setItem(SEEN_UNLOCKS_KEY, JSON.stringify(ids));
  } catch {
    // Ignore localStorage errors
  }
}

async function fetchUnlockedMilestones(): Promise<UnlockedMilestone[]> {
  const { data, error } = await supabase
    .from('unlockables')
    .select('id, name, description, unlock_type, tier, reward_description, icon_name, unlocked_at')
    .eq('is_unlocked', true)
    .order('unlocked_at', { ascending: false });

  if (error) {
    console.error('Error fetching unlocked milestones:', error);
    return [];
  }

  return (data || []) as UnlockedMilestone[];
}

export function useUnlockCelebration() {
  const [newUnlock, setNewUnlock] = useState<UnlockedMilestone | null>(null);
  const [hasChecked, setHasChecked] = useState(false);
  const queryClient = useQueryClient();
  const seenIdsRef = useRef<string[]>(getSeenUnlocks());

  const { data: unlockedMilestones = [], isLoading } = useQuery({
    queryKey: ['unlocked-milestones-celebration'],
    queryFn: fetchUnlockedMilestones,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Realtime subscription for live unlock updates
  useEffect(() => {
    const channel = supabase
      .channel('unlockables-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'unlockables',
        },
        (payload: RealtimePostgresChangesPayload<{ [key: string]: unknown }>) => {
          const updated = payload.new as Record<string, unknown>;
          // Check if this update is setting is_unlocked to true
          if (updated.is_unlocked === true && !seenIdsRef.current.includes(updated.id as string)) {
            // Transform and trigger celebration immediately
            const milestone: UnlockedMilestone = {
              id: updated.id as string,
              name: updated.name as string,
              description: (updated.description as string) || null,
              unlock_type: updated.unlock_type as string,
              tier: updated.tier as number,
              reward_description: (updated.reward_description as string) || null,
              icon_name: (updated.icon_name as string) || null,
              unlocked_at: (updated.unlocked_at as string) || null,
            };
            setNewUnlock(milestone);
            // Refetch the full list to stay in sync
            queryClient.invalidateQueries({ queryKey: ['unlocked-milestones-celebration'] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Check for new unlocks on mount
  useEffect(() => {
    if (isLoading || hasChecked || unlockedMilestones.length === 0) return;

    const seenIds = getSeenUnlocks();
    const unseenUnlocks = unlockedMilestones.filter(
      (u) => !seenIds.includes(u.id)
    );

    if (unseenUnlocks.length > 0) {
      // Show the most recent unlock first
      setNewUnlock(unseenUnlocks[0]);
    }

    setHasChecked(true);
  }, [unlockedMilestones, isLoading, hasChecked]);

  // Mark the current unlock as seen and check for next
  const markAsSeen = useCallback(() => {
    if (!newUnlock) return;

    const seenIds = getSeenUnlocks();
    const updatedSeenIds = [...seenIds, newUnlock.id];
    saveSeenUnlocks(updatedSeenIds);
    seenIdsRef.current = updatedSeenIds;

    // Check if there are more unseen unlocks
    const remainingUnseen = unlockedMilestones.filter(
      (u) => !updatedSeenIds.includes(u.id)
    );

    if (remainingUnseen.length > 0) {
      setNewUnlock(remainingUnseen[0]);
    } else {
      setNewUnlock(null);
    }
  }, [newUnlock, unlockedMilestones]);

  // Dismiss without showing next
  const dismissAll = useCallback(() => {
    const allIds = unlockedMilestones.map((u) => u.id);
    saveSeenUnlocks(allIds);
    seenIdsRef.current = allIds;
    setNewUnlock(null);
  }, [unlockedMilestones]);

  return {
    newUnlock,
    markAsSeen,
    dismissAll,
    isLoading,
    totalUnlocked: unlockedMilestones.length,
  };
}
