import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserProgress {
  level: number;
  points: number;
  pointsToNextLevel: number;
  progressPercent: number;
  title: string;
}

export interface Achievement {
  id: string;
  achievement_type: string;
  title: string;
  description: string | null;
  icon: string | null;
  earned_at: string;
  badge_name: string | null;
  badge_type: string | null;
}

const LEVEL_TITLES: Record<number, string> = {
  1: 'Newcomer',
  2: 'Rising Star',
  3: 'Skilled Artist',
  4: 'Pro Creator',
  5: 'Master Engineer',
  6: 'Industry Veteran',
  7: 'Legend',
  8: 'Icon',
  9: 'Hall of Famer',
  10: 'GOAT'
};

const XP_PER_LEVEL = 1000;

export const calculateLevel = (points: number): UserProgress => {
  const level = Math.floor(points / XP_PER_LEVEL) + 1;
  const pointsInCurrentLevel = points % XP_PER_LEVEL;
  const progressPercent = (pointsInCurrentLevel / XP_PER_LEVEL) * 100;
  const pointsToNextLevel = XP_PER_LEVEL - pointsInCurrentLevel;
  const title = LEVEL_TITLES[Math.min(level, 10)] || 'Legend';

  return {
    level,
    points,
    pointsToNextLevel,
    progressPercent,
    title
  };
};

export const useGamification = () => {
  const { user } = useAuth();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile-gamification', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('points, level')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const { data: achievements, isLoading: achievementsLoading } = useQuery({
    queryKey: ['user-achievements', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      return data as Achievement[];
    },
    enabled: !!user?.id
  });

  const progress = calculateLevel(profile?.points || 0);

  return {
    progress,
    achievements: achievements || [],
    isLoading: profileLoading || achievementsLoading,
    hasUser: !!user
  };
};

// Demo data for unauthenticated users
export const getDemoProgress = (): UserProgress => {
  return calculateLevel(2750);
};

export const getDemoAchievements = (): Achievement[] => {
  return [
    {
      id: '1',
      achievement_type: 'first_upload',
      title: 'First Upload',
      description: 'Uploaded your first track',
      icon: 'upload',
      earned_at: new Date().toISOString(),
      badge_name: 'Uploader',
      badge_type: 'milestone'
    },
    {
      id: '2',
      achievement_type: 'first_collab',
      title: 'Collaborator',
      description: 'Completed your first collaboration',
      icon: 'users',
      earned_at: new Date().toISOString(),
      badge_name: 'Team Player',
      badge_type: 'social'
    },
    {
      id: '3',
      achievement_type: 'streak_7',
      title: '7-Day Streak',
      description: 'Active for 7 days straight',
      icon: 'flame',
      earned_at: new Date().toISOString(),
      badge_name: 'On Fire',
      badge_type: 'streak'
    }
  ];
};
