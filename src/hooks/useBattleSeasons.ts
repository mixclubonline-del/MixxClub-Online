import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface BattleSeason {
  id: string;
  name: string;
  description: string | null;
  season_number: number;
  start_date: string;
  end_date: string | null;
  status: string;
  prize_pool_cents: number;
  rules: Record<string, unknown>;
  created_at: string;
}

export interface BattleSeasonEntry {
  id: string;
  season_id: string;
  user_id: string;
  wins: number;
  losses: number;
  draws: number;
  points: number;
  rank: number | null;
  trophies: Array<{ name: string; icon: string; season: number }>;
  created_at: string;
  profile?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    username: string | null;
  };
}

export function useBattleSeasons() {
  return useQuery({
    queryKey: ['battle-seasons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('battle_seasons')
        .select('*')
        .order('season_number', { ascending: false });
      if (error) throw error;
      return (data || []) as BattleSeason[];
    },
  });
}

export function useCurrentSeason() {
  return useQuery({
    queryKey: ['battle-season-current'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('battle_seasons')
        .select('*')
        .eq('status', 'active')
        .order('season_number', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as BattleSeason | null;
    },
  });
}

export function useSeasonLeaderboard(seasonId: string | undefined) {
  return useQuery({
    queryKey: ['battle-season-leaderboard', seasonId],
    queryFn: async () => {
      if (!seasonId) return [];
      const { data, error } = await supabase
        .from('battle_season_entries')
        .select(`
          *,
          profile:profiles!battle_season_entries_user_id_fkey(id, full_name, avatar_url, username)
        `)
        .eq('season_id', seasonId)
        .order('points', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []).map(d => ({
        ...d,
        trophies: (d.trophies as unknown as BattleSeasonEntry['trophies']) || [],
      })) as BattleSeasonEntry[];
    },
    enabled: !!seasonId,
  });
}

export function useUserSeasonStats(seasonId: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['battle-season-user', seasonId, user?.id],
    queryFn: async () => {
      if (!seasonId || !user?.id) return null;
      const { data, error } = await supabase
        .from('battle_season_entries')
        .select('*')
        .eq('season_id', seasonId)
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data ? {
        ...data,
        trophies: (data.trophies as unknown as BattleSeasonEntry['trophies']) || [],
      } as BattleSeasonEntry : null;
    },
    enabled: !!seasonId && !!user?.id,
  });
}

export function useUserTrophies(userId?: string) {
  const { user } = useAuth();
  const targetId = userId || user?.id;

  return useQuery({
    queryKey: ['user-trophies', targetId],
    queryFn: async () => {
      if (!targetId) return [];
      const { data, error } = await supabase
        .from('battle_season_entries')
        .select(`
          *,
          season:battle_seasons!battle_season_entries_season_id_fkey(name, season_number)
        `)
        .eq('user_id', targetId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(d => ({
        ...d,
        trophies: (d.trophies as unknown as BattleSeasonEntry['trophies']) || [],
      }));
    },
    enabled: !!targetId,
  });
}
