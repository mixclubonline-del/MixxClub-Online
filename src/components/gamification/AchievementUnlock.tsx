import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Trophy, Star, Zap, Award, Crown, Gem, Music, Users, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  trophy: Trophy,
  star: Star,
  zap: Zap,
  award: Award,
  crown: Crown,
  gem: Gem,
  music: Music,
  users: Users,
  'check-circle': CheckCircle,
};

const badgeTypeColors: Record<string, string> = {
  milestone: 'from-blue-500 to-cyan-500',
  legendary: 'from-amber-500 to-orange-500',
  epic: 'from-purple-500 to-pink-500',
  rare: 'from-emerald-500 to-teal-500',
  common: 'from-slate-400 to-slate-500',
};

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  badge_name?: string;
  badge_type?: string;
  xp_reward?: number;
}

interface AchievementUnlockProps {
  achievement: Achievement | null;
  onClose: () => void;
  onShare?: (achievement: Achievement) => void;
}

export const AchievementUnlock = ({ achievement, onClose, onShare }: AchievementUnlockProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const triggerConfetti = useCallback(() => {
    const colors = ['#9b87f5', '#F97316', '#22c55e', '#3b82f6'];
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors,
    });

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });
    }, 250);
  }, []);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      triggerConfetti();
    } else {
      setIsVisible(false);
    }
  }, [achievement, triggerConfetti]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleShare = () => {
    if (achievement && onShare) {
      onShare(achievement);
    }
  };

  const Icon = achievement ? (iconMap[achievement.icon] || Trophy) : Trophy;
  const badgeColor = achievement?.badge_type 
    ? badgeTypeColors[achievement.badge_type] || badgeTypeColors.common
    : badgeTypeColors.common;

  return (
    <AnimatePresence>
      {isVisible && achievement && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-2 -right-2 z-10 bg-background/50 backdrop-blur"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Card */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">
              {/* Header gradient */}
              <div className={cn(
                "h-32 bg-gradient-to-br flex items-center justify-center relative",
                badgeColor
              )}>
                {/* Animated rings */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute w-24 h-24 rounded-full border-4 border-white/30"
                />
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                  className="absolute w-24 h-24 rounded-full border-4 border-white/20"
                />

                {/* Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 10, delay: 0.2 }}
                  className="relative z-10 w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg"
                >
                  <Icon className="h-10 w-10 text-primary" />
                </motion.div>
              </div>

              {/* Content */}
              <div className="p-6 text-center space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Badge variant="outline" className="mb-2 text-xs uppercase tracking-wider">
                    Achievement Unlocked!
                  </Badge>
                  <h2 className="text-2xl font-bold">{achievement.title}</h2>
                  <p className="text-muted-foreground text-sm mt-2">{achievement.description}</p>
                </motion.div>

                {/* Rewards */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center justify-center gap-3"
                >
                  {achievement.badge_name && (
                    <Badge className={cn("bg-gradient-to-r text-white border-0", badgeColor)}>
                      {achievement.badge_name}
                    </Badge>
                  )}
                  {achievement.xp_reward && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      +{achievement.xp_reward} XP
                    </Badge>
                  )}
                </motion.div>

                {/* Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex gap-3 pt-2"
                >
                  <Button variant="outline" className="flex-1" onClick={handleClose}>
                    Continue
                  </Button>
                  {onShare && (
                    <Button className="flex-1" onClick={handleShare}>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hook to manage achievement unlock state
export const useAchievementUnlock = () => {
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);

  const showAchievement = useCallback((achievement: Achievement) => {
    setUnlockedAchievement(achievement);
  }, []);

  const hideAchievement = useCallback(() => {
    setUnlockedAchievement(null);
  }, []);

  return {
    unlockedAchievement,
    showAchievement,
    hideAchievement,
  };
};

export default AchievementUnlock;
