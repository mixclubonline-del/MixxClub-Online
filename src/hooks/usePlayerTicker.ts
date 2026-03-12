import { useEffect, useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

export interface TickerItem {
  id: string;
  type: 'premiere' | 'session';
  label: string;
  title: string;
  detail: string; // votes or participant count
  time: string;
}

async function fetchTickerItems(): Promise<TickerItem[]> {
  const [premieresRes, sessionsRes] = await Promise.all([
    supabase
      .from('premieres')
      .select('id, title, status, total_votes, premiere_date, genre')
      .eq('status', 'live')
      .order('premiere_date', { ascending: false })
      .limit(10),
    supabase
      .from('collaboration_sessions')
      .select('id, title, status, session_type, created_at, max_participants')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  const premieres: TickerItem[] = (premieresRes.data || []).map((p) => ({
    id: p.id,
    type: 'premiere' as const,
    label: '🎬 Premiere',
    title: p.title,
    detail: `${p.total_votes ?? 0} votes`,
    time: formatDistanceToNow(new Date(p.premiere_date), { addSuffix: false }),
  }));

  const sessions: TickerItem[] = (sessionsRes.data || []).map((s) => ({
    id: s.id,
    type: 'session' as const,
    label: '🎧 Live Session',
    title: s.title,
    detail: s.session_type || 'Collab',
    time: formatDistanceToNow(new Date(s.created_at), { addSuffix: false }),
  }));

  const merged = [...premieres, ...sessions];

  // If no live data, return idle items
  if (merged.length === 0) {
    return getIdleTickerItems();
  }

  return merged;
}

function getIdleTickerItems(): TickerItem[] {
  return [
    { id: 'idle-1', type: 'premiere', label: '🎬 Premiere', title: 'Waiting for the next drop...', detail: '', time: '' },
    { id: 'idle-2', type: 'session', label: '🎧 Live Session', title: 'No active sessions right now', detail: '', time: '' },
  ];
}

export function usePlayerTicker() {
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['player-ticker'],
    queryFn: fetchTickerItems,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });

  // Realtime subscriptions for instant updates
  useEffect(() => {
    const channel = supabase
      .channel('player-ticker-realtime')
      .on(
        'postgres_changes' as any,
        { event: '*', schema: 'public', table: 'premieres' } as any,
        () => {
          queryClient.invalidateQueries({ queryKey: ['player-ticker'] });
        }
      )
      .on(
        'postgres_changes' as any,
        { event: '*', schema: 'public', table: 'collaboration_sessions' } as any,
        () => {
          queryClient.invalidateQueries({ queryKey: ['player-ticker'] });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [queryClient]);

  return { items, isLoading };
}

export default usePlayerTicker;
