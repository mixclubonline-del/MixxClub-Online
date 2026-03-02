/**
 * useDailyRewards — Daily login check-in system with streak rewards.
 * 
 * Uses fan_stats.engagement_streak and last_activity_at.
 * Awards escalating coinz: Day 1=5, Day 3=10, Day 7=50, Day 14=100, Day 30=200.
 */

import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useMixxWallet } from './useMixxWallet';
import { useFanStats, isStreakActive } from './useFanStats';

const STREAK_REWARDS: { day: number; reward: number }[] = [
    { day: 1, reward: 5 },
    { day: 3, reward: 10 },
    { day: 7, reward: 50 },
    { day: 14, reward: 100 },
    { day: 21, reward: 150 },
    { day: 30, reward: 200 },
];

function getRewardForDay(streak: number): number {
    let reward = 5; // base daily
    for (const sr of STREAK_REWARDS) {
        if (streak >= sr.day) {
            reward = sr.reward;
        }
    }
    return reward;
}

export function useDailyRewards() {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { earnCoinz } = useMixxWallet();
    const { stats, todayComplete } = useFanStats();

    const claimDailyReward = useMutation({
        mutationFn: async () => {
            if (!user?.id || !stats) throw new Error('Not authenticated');
            if (todayComplete) throw new Error('Already claimed today');

            const wasActive = isStreakActive(stats.last_activity_at);
            const newStreak = wasActive ? stats.engagement_streak + 1 : 1;
            const reward = getRewardForDay(newStreak);
            const newLongest = Math.max(stats.longest_streak, newStreak);

            // Update fan_stats
            const { error } = await supabase
                .from('fan_stats')
                .update({
                    engagement_streak: newStreak,
                    longest_streak: newLongest,
                    last_activity_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .eq('user_id', user.id);

            if (error) throw error;

            // Award coinz
            await earnCoinz({
                amount: reward,
                source: 'daily_reward',
                description: `Day ${newStreak} streak reward`,
                referenceType: 'streak',
                referenceId: `day-${newStreak}`,
            });

            return { reward, streak: newStreak, isNew: !wasActive };
        },
        onSuccess: ({ reward, streak }) => {
            queryClient.invalidateQueries({ queryKey: ['fan-stats'] });
            toast({
                title: `🔥 Day ${streak} Streak!`,
                description: `+${reward} MixxCoinz earned`,
            });
        },
        onError: (error) => {
            if (error.message === 'Already claimed today') {
                toast({
                    title: 'Already checked in!',
                    description: 'Come back tomorrow for more rewards',
                });
            } else {
                toast({
                    title: 'Check-in failed',
                    description: error.message,
                    variant: 'destructive',
                });
            }
        },
    });

    const nextReward = stats ? getRewardForDay(
        isStreakActive(stats.last_activity_at)
            ? stats.engagement_streak + 1
            : 1
    ) : 5;

    return {
        claimDailyReward: claimDailyReward.mutateAsync,
        isClaiming: claimDailyReward.isPending,
        canClaim: !todayComplete,
        currentStreak: stats?.engagement_streak || 0,
        longestStreak: stats?.longest_streak || 0,
        nextReward,
        todayComplete,
        streakRewards: STREAK_REWARDS,
        getRewardForDay,
    };
}
