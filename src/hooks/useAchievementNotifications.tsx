import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

export interface UnlockedAchievement {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  badge_name: string | null;
  badge_type: string | null;
  earned_at: string;
}

export const useAchievementNotifications = () => {
  const { user } = useAuth();
  const [latestAchievement, setLatestAchievement] = useState<UnlockedAchievement | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`achievements-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'achievements',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const achievement = payload.new as UnlockedAchievement;
          setLatestAchievement(achievement);
          
          // Trigger confetti
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FFD700', '#FFA500', '#FF6347', '#9333ea', '#06b6d4'],
          });

          // Show toast
          toast.success(`🎉 Achievement Unlocked!`, {
            description: `${achievement.title} - ${achievement.description || ''}`,
            duration: 5000,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const clearLatestAchievement = () => setLatestAchievement(null);

  return { latestAchievement, clearLatestAchievement };
};
