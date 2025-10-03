import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Star, Flame, Trophy, Zap, Target } from 'lucide-react';
import { useGamificationStats } from '@/hooks/useGamificationStats';

export const GamificationHub = () => {
  const { level, xp, xpToNextLevel, streak, weeklyGoal, weeklyProgress } = useGamificationStats();
  
  const xpPercentage = (xp / xpToNextLevel) * 100;
  const goalPercentage = (weeklyProgress / weeklyGoal) * 100;

  return (
    <Card className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 backdrop-blur-sm border-primary/20">
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.1), transparent)',
            'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.1), transparent)',
            'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.1), transparent)',
          ]
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      <div className="relative p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-center">
          {/* Level Badge */}
          <div className="md:col-span-2 flex justify-center md:justify-start">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="relative"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                <div className="w-16 h-16 rounded-full bg-background flex flex-col items-center justify-center">
                  <Star className="w-5 h-5 text-yellow-500 mb-1" />
                  <span className="text-xs font-medium text-muted-foreground">Level</span>
                  <span className="text-lg font-bold">{level}</span>
                </div>
              </div>
              {/* Glow effect */}
              <motion.div
                className="absolute inset-0 rounded-full bg-yellow-500/30 blur-xl -z-10"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          </div>

          {/* XP Progress */}
          <div className="md:col-span-5 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="font-semibold">Experience Points</span>
              </div>
              <span className="text-muted-foreground">
                {xp.toLocaleString()} / {xpToNextLevel.toLocaleString()} XP
              </span>
            </div>
            <div className="relative">
              <Progress value={xpPercentage} className="h-3" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {(xpToNextLevel - xp).toLocaleString()} XP to level {level + 1}
            </p>
          </div>

          {/* Streak Counter */}
          <div className="md:col-span-2 flex justify-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative p-4 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30"
            >
              <div className="flex flex-col items-center">
                <motion.div
                  animate={{ 
                    rotate: [0, -10, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Flame className="w-6 h-6 text-orange-500 mb-1" />
                </motion.div>
                <span className="text-2xl font-bold">{streak}</span>
                <span className="text-xs text-muted-foreground">day streak</span>
              </div>
            </motion.div>
          </div>

          {/* Weekly Goal */}
          <div className="md:col-span-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-green-500" />
                <span className="font-semibold">Weekly Goal</span>
              </div>
              <span className="text-muted-foreground">
                {weeklyProgress} / {weeklyGoal}
              </span>
            </div>
            <Progress value={goalPercentage} className="h-2" />
            {goalPercentage >= 100 ? (
              <Badge variant="default" className="gap-1">
                <Trophy className="w-3 h-3" />
                Goal Completed!
              </Badge>
            ) : (
              <p className="text-xs text-muted-foreground">
                {weeklyGoal - weeklyProgress} more to reach your goal
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};