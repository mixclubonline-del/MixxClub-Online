import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useMixxWallet } from './useMixxWallet';

export interface MixxMission {
  id: string;
  name: string;
  description: string | null;
  category: 'daily' | 'weekly' | 'achievement' | 'community' | 'special';
  icon_name: string;
  metric_type: string;
  target_value: number;
  coinz_reward: number;
  xp_reward: number;
  role_required: string | null;
  tier_required: number;
  repeatable: boolean;
  reset_interval: 'daily' | 'weekly' | null;
  is_active: boolean;
  sort_order: number;
}

export interface MissionProgress {
  id: string;
  user_id: string;
  mission_id: string;
  current_value: number;
  completed_at: string | null;
  claimed_at: string | null;
  last_reset_at: string | null;
  times_completed: number;
}

export interface MissionWithProgress extends MixxMission {
  progress: MissionProgress | null;
  isCompleted: boolean;
  isClaimed: boolean;
  progressPercent: number;
}

export function useMissions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { earnCoinz } = useMixxWallet();

  // Fetch all active missions
  const missionsQuery = useQuery({
    queryKey: ['mixx-missions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mixx_missions')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return (data || []) as MixxMission[];
    },
    staleTime: 60000,
  });

  // Fetch user's mission progress
  const progressQuery = useQuery({
    queryKey: ['mixx-mission-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('mixx_mission_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return (data || []) as MissionProgress[];
    },
    enabled: !!user?.id,
  });

  // Combine missions with progress
  const missionsWithProgress: MissionWithProgress[] = (missionsQuery.data || []).map(mission => {
    const progress = progressQuery.data?.find(p => p.mission_id === mission.id) || null;
    const currentValue = progress?.current_value || 0;
    const isCompleted = currentValue >= mission.target_value;
    const isClaimed = !!progress?.claimed_at;
    const progressPercent = Math.min((currentValue / mission.target_value) * 100, 100);

    return {
      ...mission,
      progress,
      isCompleted,
      isClaimed,
      progressPercent,
    };
  });

  // Update mission progress
  const updateProgressMutation = useMutation({
    mutationFn: async ({ 
      missionId, 
      increment = 1 
    }: { 
      missionId: string; 
      increment?: number;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const mission = missionsQuery.data?.find(m => m.id === missionId);
      if (!mission) throw new Error('Mission not found');

      // Get or create progress record
      const existingProgress = progressQuery.data?.find(p => p.mission_id === missionId);
      
      if (existingProgress) {
        const newValue = Math.min(existingProgress.current_value + increment, mission.target_value);
        const nowCompleted = newValue >= mission.target_value && !existingProgress.completed_at;

        const { error } = await supabase
          .from('mixx_mission_progress')
          .update({
            current_value: newValue,
            completed_at: nowCompleted ? new Date().toISOString() : existingProgress.completed_at,
            times_completed: nowCompleted ? existingProgress.times_completed + 1 : existingProgress.times_completed,
          })
          .eq('id', existingProgress.id);

        if (error) throw error;
        return { mission, newValue, nowCompleted };
      } else {
        const newValue = Math.min(increment, mission.target_value);
        const nowCompleted = newValue >= mission.target_value;

        const { error } = await supabase
          .from('mixx_mission_progress')
          .insert({
            user_id: user.id,
            mission_id: missionId,
            current_value: newValue,
            completed_at: nowCompleted ? new Date().toISOString() : null,
            times_completed: nowCompleted ? 1 : 0,
          });

        if (error) throw error;
        return { mission, newValue, nowCompleted };
      }
    },
    onSuccess: ({ mission, nowCompleted }) => {
      queryClient.invalidateQueries({ queryKey: ['mixx-mission-progress'] });
      
      if (nowCompleted) {
        toast({
          title: '🎯 Mission Complete!',
          description: `"${mission.name}" - Claim your ${mission.coinz_reward} coinz reward!`,
        });
      }
    },
  });

  // Claim mission reward
  const claimRewardMutation = useMutation({
    mutationFn: async (missionId: string) => {
      if (!user?.id) throw new Error('Not authenticated');

      const mission = missionsQuery.data?.find(m => m.id === missionId);
      const progress = progressQuery.data?.find(p => p.mission_id === missionId);

      if (!mission || !progress) throw new Error('Mission not found');
      if (progress.current_value < mission.target_value) throw new Error('Mission not completed');
      if (progress.claimed_at) throw new Error('Already claimed');

      // Mark as claimed
      const { error: progressError } = await supabase
        .from('mixx_mission_progress')
        .update({ claimed_at: new Date().toISOString() })
        .eq('id', progress.id);

      if (progressError) throw progressError;

      // Award coinz
      await earnCoinz({
        amount: mission.coinz_reward,
        source: 'mission',
        description: `Completed: ${mission.name}`,
        referenceType: 'mission',
        referenceId: missionId,
      });

      return { mission, reward: mission.coinz_reward };
    },
    onSuccess: ({ mission, reward }) => {
      queryClient.invalidateQueries({ queryKey: ['mixx-mission-progress'] });
      toast({
        title: '🪙 Reward Claimed!',
        description: `+${reward} MixxCoinz from "${mission.name}"`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to claim reward',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Filter missions by category
  const dailyMissions = missionsWithProgress.filter(m => m.category === 'daily');
  const weeklyMissions = missionsWithProgress.filter(m => m.category === 'weekly');
  const achievementMissions = missionsWithProgress.filter(m => m.category === 'achievement');
  const communityMissions = missionsWithProgress.filter(m => m.category === 'community');

  // Stats
  const completedCount = missionsWithProgress.filter(m => m.isCompleted).length;
  const claimedCount = missionsWithProgress.filter(m => m.isClaimed).length;
  const unclaimedRewards = missionsWithProgress
    .filter(m => m.isCompleted && !m.isClaimed)
    .reduce((sum, m) => sum + m.coinz_reward, 0);

  return {
    missions: missionsWithProgress,
    dailyMissions,
    weeklyMissions,
    achievementMissions,
    communityMissions,
    isLoading: missionsQuery.isLoading || progressQuery.isLoading,
    completedCount,
    claimedCount,
    unclaimedRewards,
    updateProgress: updateProgressMutation.mutateAsync,
    claimReward: claimRewardMutation.mutateAsync,
    isClaiming: claimRewardMutation.isPending,
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ['mixx-missions'] });
      queryClient.invalidateQueries({ queryKey: ['mixx-mission-progress'] });
    },
  };
}
