import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: Date;
}

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'first-track', title: 'First Steps', description: 'Create your first track', unlocked: false },
  { id: 'first-recording', title: 'Sound Engineer', description: 'Record your first audio', unlocked: false },
  { id: 'collab-master', title: 'Team Player', description: 'Collaborate with another user', unlocked: false },
  { id: 'effect-wizard', title: 'Effect Master', description: 'Apply 5 different effects', unlocked: false },
];

export const useAchievements = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [achievements, setAchievements] = useState<Achievement[]>(DEFAULT_ACHIEVEMENTS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadAchievements();
    } else {
      setAchievements(DEFAULT_ACHIEVEMENTS);
    }
  }, [user]);

  const loadAchievements = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Disable database loading for now - achievements are local only
      console.log('[Achievements] Using local storage only');
    } catch (error) {
      console.error('Failed to load achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const unlockAchievement = async (id: string) => {
    const achievement = achievements.find(a => a.id === id);
    if (!achievement || achievement.unlocked) return;
    
    // Update local state immediately
    setAchievements(prev => prev.map(a => 
      a.id === id ? { ...a, unlocked: true, unlockedAt: new Date() } : a
    ));
    
    // Show toast
    toast({
      title: "Achievement Unlocked! 🎉",
      description: `${achievement.title} - ${achievement.description}`,
    });
  };

  return { 
    achievements, 
    unlockAchievement, 
    loading,
    refetch: loadAchievements 
  };
};
