import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface GamificationStats {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXp: number;
  streak: number;
  weeklyGoal: number;
  weeklyProgress: number;
  isLoading: boolean;
}

export const useGamificationStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<GamificationStats>({
    level: 1,
    xp: 0,
    xpToNextLevel: 250,
    totalXp: 0,
    streak: 0,
    weeklyGoal: 5,
    weeklyProgress: 0,
    isLoading: true
  });

  useEffect(() => {
    if (!user) {
      setStats(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const fetchStats = async () => {
      try {
        // Fetch points and level from profiles
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('points, level')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
        }

        const totalXp = profile?.points ?? 0;
        const level = profile?.level ?? Math.max(1, Math.floor(totalXp / 250) + 1);
        const xpForCurrentLevel = (level - 1) * 250;
        const currentLevelXP = totalXp - xpForCurrentLevel;
        const xpToNextLevel = 250;

        // Calculate weekly progress from recent activities
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);

        // Count recent projects
        const { data: recentProjects } = await supabase
          .from('projects')
          .select('id')
          .or(`user_id.eq.${user.id},engineer_id.eq.${user.id}`)
          .gte('created_at', weekStart.toISOString());

        // Count recent audio uploads
        const { data: recentUploads } = await supabase
          .from('audio_files')
          .select('id')
          .eq('user_id', user.id)
          .gte('created_at', weekStart.toISOString());

        // Count recent sessions
        const { data: recentSessions } = await supabase
          .from('collaboration_sessions')
          .select('id')
          .eq('host_user_id', user.id)
          .gte('created_at', weekStart.toISOString());

        const weeklyProgress = 
          (recentProjects?.length ?? 0) + 
          (recentUploads?.length ?? 0) + 
          (recentSessions?.length ?? 0);

        // Calculate streak (consecutive days with activity)
        const { data: recentAchievements } = await supabase
          .from('achievements')
          .select('earned_at')
          .eq('user_id', user.id)
          .order('earned_at', { ascending: false })
          .limit(7);

        let streak = 0;
        if (recentAchievements && recentAchievements.length > 0) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const uniqueDays = new Set(
            recentAchievements.map(a => {
              const date = new Date(a.earned_at);
              return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
            })
          );
          
          // Count consecutive days going back
          for (let i = 0; i < 7; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            const dateKey = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
            if (uniqueDays.has(dateKey)) {
              streak++;
            } else if (i > 0) {
              break; // Streak broken
            }
          }
        }

        setStats({
          level,
          xp: currentLevelXP,
          xpToNextLevel,
          totalXp,
          streak,
          weeklyGoal: 5,
          weeklyProgress,
          isLoading: false
        });
      } catch (error) {
        console.error('Error fetching gamification stats:', error);
        setStats(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchStats();

    // Subscribe to profile changes for real-time updates
    const channel = supabase
      .channel('gamification-stats')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return stats;
};
