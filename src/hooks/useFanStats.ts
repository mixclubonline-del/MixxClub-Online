import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface FanStats {
  id: string;
  user_id: string;
  total_votes: number;
  total_comments: number;
  total_shares: number;
  total_premieres_attended: number;
  mixxcoinz_earned: number;
  artists_supported: number;
  day1_badges: number;
  engagement_streak: number;
  longest_streak: number;
  last_activity_at: string;
  current_tier: string;
  created_at: string;
  updated_at: string;
}

const TIER_THRESHOLDS = {
  newcomer: 0,
  supporter: 500,
  advocate: 2000,
  champion: 5000,
  legend: 10000,
};

export function calculateTier(mixxcoinzEarned: number): string {
  if (mixxcoinzEarned >= TIER_THRESHOLDS.legend) return 'legend';
  if (mixxcoinzEarned >= TIER_THRESHOLDS.champion) return 'champion';
  if (mixxcoinzEarned >= TIER_THRESHOLDS.advocate) return 'advocate';
  if (mixxcoinzEarned >= TIER_THRESHOLDS.supporter) return 'supporter';
  return 'newcomer';
}

export function getStreakMultiplier(streak: number): number {
  if (streak >= 30) return 3;
  if (streak >= 14) return 2;
  if (streak >= 7) return 1.5;
  return 1;
}

export function isStreakActive(lastActivityAt: string | null): boolean {
  if (!lastActivityAt) return false;
  const lastActivity = new Date(lastActivityAt);
  const now = new Date();
  const hoursSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
  return hoursSinceActivity < 36; // 36 hour grace period
}

export function useFanStats() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const statsQuery = useQuery({
    queryKey: ['fan-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Try to fetch existing stats
      const { data, error } = await supabase
        .from('fan_stats')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      // If no stats exist, create them
      if (!data) {
        const { data: newStats, error: insertError } = await supabase
          .from('fan_stats')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (insertError) throw insertError;
        return newStats as FanStats;
      }

      return data as FanStats;
    },
    enabled: !!user?.id,
    staleTime: 30000,
  });

  const updateStatsMutation = useMutation({
    mutationFn: async (updates: Partial<Pick<FanStats, 
      'total_votes' | 'total_comments' | 'total_shares' | 
      'total_premieres_attended' | 'mixxcoinz_earned' | 
      'artists_supported' | 'day1_badges'
    >>) => {
      if (!user?.id || !statsQuery.data) throw new Error('No stats available');

      const currentStats = statsQuery.data;
      const newStats = {
        total_votes: updates.total_votes ?? currentStats.total_votes,
        total_comments: updates.total_comments ?? currentStats.total_comments,
        total_shares: updates.total_shares ?? currentStats.total_shares,
        total_premieres_attended: updates.total_premieres_attended ?? currentStats.total_premieres_attended,
        mixxcoinz_earned: updates.mixxcoinz_earned ?? currentStats.mixxcoinz_earned,
        artists_supported: updates.artists_supported ?? currentStats.artists_supported,
        day1_badges: updates.day1_badges ?? currentStats.day1_badges,
      };

      // Calculate new tier based on earned coinz
      const newTier = calculateTier(newStats.mixxcoinz_earned);

      const { error } = await supabase
        .from('fan_stats')
        .update({
          ...newStats,
          current_tier: newTier,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      return { ...newStats, current_tier: newTier };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fan-stats'] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update stats',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const incrementStatMutation = useMutation({
    mutationFn: async ({ 
      stat, 
      amount = 1 
    }: { 
      stat: 'total_votes' | 'total_comments' | 'total_shares' | 'mixxcoinz_earned';
      amount?: number;
    }) => {
      if (!user?.id || !statsQuery.data) throw new Error('No stats available');

      const currentValue = statsQuery.data[stat] || 0;
      const newValue = currentValue + amount;

      const updates: Record<string, number> = { [stat]: newValue };

      // Update tier if mixxcoinz_earned changed
      const newTier = stat === 'mixxcoinz_earned' 
        ? calculateTier(newValue)
        : statsQuery.data.current_tier;

      const { error } = await supabase
        .from('fan_stats')
        .update({
          ...updates,
          current_tier: newTier,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      return { stat, newValue };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fan-stats'] });
    },
  });

  const stats = statsQuery.data;
  const streakMultiplier = stats ? getStreakMultiplier(stats.engagement_streak) : 1;
  const isActive = stats ? isStreakActive(stats.last_activity_at) : false;
  const todayComplete = isActive && stats?.last_activity_at 
    ? new Date(stats.last_activity_at).toDateString() === new Date().toDateString()
    : false;

  return {
    stats,
    isLoading: statsQuery.isLoading,
    error: statsQuery.error,
    streakMultiplier,
    isStreakActive: isActive,
    todayComplete,
    currentTier: stats?.current_tier || 'newcomer',
    updateStats: updateStatsMutation.mutateAsync,
    incrementStat: incrementStatMutation.mutateAsync,
    isUpdating: updateStatsMutation.isPending || incrementStatMutation.isPending,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['fan-stats'] }),
  };
}
