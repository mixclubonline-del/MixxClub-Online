/**
 * StreakTracker - Visual streak tracking with animations
 * Shows daily activity streaks with fire animations and level progress
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Flame, Trophy, Zap, Star, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface StreakData {
  current_count: number;
  longest_count: number;
  streak_type: string;
  last_activity_at: string;
}

interface UserLevel {
  level: number;
  xp: number;
  xpToNextLevel: number;
  title: string;
}

export const StreakTracker = () => {
  const { user } = useAuth();
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStreakData();
      updateDailyStreak();
    }
  }, [user]);

  const fetchStreakData = async () => {
    try {
      // Fetch streak
      const { data: streakData } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user?.id)
        .eq('streak_type', 'daily_login')
        .maybeSingle();

      setStreak(streakData);

      // Calculate level from achievements/XP
      const { data: achievements } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user?.id);

      const totalXP = (achievements?.length || 0) * 100; // 100 XP per achievement
      const level = Math.floor(totalXP / 500) + 1;
      const xpInCurrentLevel = totalXP % 500;

      setUserLevel({
        level,
        xp: xpInCurrentLevel,
        xpToNextLevel: 500,
        title: getLevelTitle(level)
      });

    } catch (error) {
      console.error('Error fetching streak data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateDailyStreak = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];

      // Check if streak exists
      const { data: existing } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .eq('streak_type', 'daily_login')
        .single();

      if (!existing) {
        // Create new streak
        await supabase.from('user_streaks').insert({
          user_id: user.id,
          streak_type: 'daily_login',
          current_count: 1,
          longest_count: 1,
          last_activity_at: today
        });
      } else if (existing.last_activity_at !== today) {
        const lastDate = new Date(existing.last_activity_at);
        const daysDiff = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

        let newCount = 1;
        if (daysDiff === 1) {
          // Continue streak
          newCount = (existing.current_count || 0) + 1;
        }
        // If daysDiff > 1, streak resets to 1

        const newLongest = Math.max(newCount, existing.longest_count || 0);

        await supabase
          .from('user_streaks')
          .update({
            current_count: newCount,
            longest_count: newLongest,
            last_activity_at: today
          })
          .eq('id', existing.id);
      }
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  const getLevelTitle = (level: number): string => {
    const titles = [
      'Newcomer',       // 1
      'Rising Star',    // 2
      'Beat Maker',     // 3
      'Studio Rat',     // 4
      'Mix Master',     // 5
      'Sound Architect',// 6
      'Audio Wizard',   // 7
      'Platinum Pro',   // 8
      'Legend',         // 9
      'GOAT'            // 10+
    ];
    return titles[Math.min(level - 1, titles.length - 1)];
  };

  const getFlameColor = (streak: number): string => {
    if (streak >= 30) return 'text-purple-500';
    if (streak >= 14) return 'text-orange-500';
    if (streak >= 7) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (loading) {
    return (
      <Card className="p-4 animate-pulse">
        <div className="h-20 bg-muted rounded" />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Streak Section */}
      <div className="p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, -5, 5, 0]
              }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="relative"
            >
              <Flame className={cn("w-10 h-10", getFlameColor(streak?.current_count || 0))} />
              {(streak?.current_count || 0) >= 7 && (
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="absolute inset-0"
                >
                  <Flame className="w-10 h-10 text-yellow-500/50 blur-sm" />
                </motion.div>
              )}
            </motion.div>
            <div>
              <p className="text-2xl font-bold">{streak?.current_count || 0} Day Streak</p>
              <p className="text-xs text-muted-foreground">
                Longest: {streak?.longest_count || 0} days
              </p>
            </div>
          </div>
          
          {/* Streak Milestones */}
          <div className="flex gap-2">
            {[7, 14, 30].map((milestone) => (
              <Badge
                key={milestone}
                variant={(streak?.current_count || 0) >= milestone ? 'default' : 'outline'}
                className={cn(
                  "transition-all",
                  (streak?.current_count || 0) >= milestone && "bg-gradient-to-r from-orange-500 to-red-500"
                )}
              >
                {milestone}🔥
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Level Section */}
      {userLevel && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                <Star className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-bold">Level {userLevel.level}</p>
                <p className="text-xs text-muted-foreground">{userLevel.title}</p>
              </div>
            </div>
            <Badge variant="secondary">
              {userLevel.xp} / {userLevel.xpToNextLevel} XP
            </Badge>
          </div>
          
          <div className="relative">
            <Progress value={(userLevel.xp / userLevel.xpToNextLevel) * 100} className="h-3" />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-xs font-bold text-white">
                {userLevel.level + 1}
              </div>
            </motion.div>
          </div>
          
          <p className="text-xs text-muted-foreground text-center mt-2">
            {userLevel.xpToNextLevel - userLevel.xp} XP to next level
          </p>
        </div>
      )}

      {/* Level Up Animation */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowLevelUp(false)}
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, ease: 'easeOut' }}
              >
                <Trophy className="w-24 h-24 text-yellow-500 mx-auto" />
              </motion.div>
              <h2 className="text-4xl font-bold mt-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                LEVEL UP!
              </h2>
              <p className="text-xl text-white mt-2">
                You're now Level {userLevel?.level}
              </p>
              <p className="text-muted-foreground">{userLevel?.title}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};
