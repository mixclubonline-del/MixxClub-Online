import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useGamificationStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    level: 12,
    xp: 2450,
    xpToNextLevel: 3000,
    streak: 7,
    weeklyGoal: 10,
    weeklyProgress: 7
  });

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        // Fetch points from profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('points')
          .eq('id', user.id)
          .single();

        if (profile?.points) {
          const xp = profile.points;
          const level = Math.floor(xp / 250); // 250 XP per level
          const currentLevelXP = xp % 250;
          const xpToNextLevel = 250;

          setStats(prev => ({
            ...prev,
            level,
            xp: currentLevelXP,
            xpToNextLevel
          }));
        }

        // Calculate weekly progress from recent projects
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);

        const { data: recentProjects } = await supabase
          .from('projects')
          .select('id')
          .or(`client_id.eq.${user.id},engineer_id.eq.${user.id}`)
          .gte('created_at', weekStart.toISOString());

        if (recentProjects) {
          setStats(prev => ({
            ...prev,
            weeklyProgress: recentProjects.length
          }));
        }
      } catch (error) {
        console.error('Error fetching gamification stats:', error);
      }
    };

    fetchStats();
  }, [user]);

  return stats;
};