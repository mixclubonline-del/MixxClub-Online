import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  mixxcoinz_earned: number;
  current_tier: string;
  engagement_streak: number;
}

export function useFanLeaderboard(limit: number = 10) {
  const { user } = useAuth();

  const leaderboardQuery = useQuery({
    queryKey: ['fan-leaderboard', limit],
    queryFn: async () => {
      // Fetch top fans by mixxcoinz_earned
      const { data, error } = await supabase
        .from('fan_stats')
        .select(`
          user_id,
          mixxcoinz_earned,
          current_tier,
          engagement_streak,
          profiles:user_id (
            username,
            full_name,
            avatar_url
          )
        `)
        .order('mixxcoinz_earned', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Map to LeaderboardEntry format with ranks
      const entries: LeaderboardEntry[] = (data || []).map((entry, index) => {
        const profile = entry.profiles as { 
          username: string | null; 
          full_name: string | null; 
          avatar_url: string | null 
        } | null;
        
        return {
          rank: index + 1,
          user_id: entry.user_id,
          username: profile?.username || null,
          full_name: profile?.full_name || null,
          avatar_url: profile?.avatar_url || null,
          mixxcoinz_earned: entry.mixxcoinz_earned || 0,
          current_tier: entry.current_tier || 'newcomer',
          engagement_streak: entry.engagement_streak || 0,
        };
      });

      return entries;
    },
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: true,
  });

  // Get current user's rank
  const userRankQuery = useQuery({
    queryKey: ['fan-leaderboard-rank', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Get user's stats
      const { data: userStats, error: statsError } = await supabase
        .from('fan_stats')
        .select('mixxcoinz_earned')
        .eq('user_id', user.id)
        .maybeSingle();

      if (statsError) throw statsError;
      if (!userStats) return null;

      // Count how many users have more coinz
      const { count, error: countError } = await supabase
        .from('fan_stats')
        .select('*', { count: 'exact', head: true })
        .gt('mixxcoinz_earned', userStats.mixxcoinz_earned);

      if (countError) throw countError;

      return (count || 0) + 1; // +1 because count gives users ahead
    },
    enabled: !!user?.id,
    staleTime: 60000,
  });

  const isUserInTop = leaderboardQuery.data?.some(
    entry => entry.user_id === user?.id
  );

  return {
    leaderboard: leaderboardQuery.data || [],
    isLoading: leaderboardQuery.isLoading,
    error: leaderboardQuery.error,
    userRank: userRankQuery.data,
    isUserInTop,
    refetch: leaderboardQuery.refetch,
  };
}
