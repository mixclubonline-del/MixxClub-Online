/**
 * UnlockPulseIndicator
 * 
 * Persistent header indicator showing community progress toward next milestone.
 * Pulses when progress > 80%.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Users, ChevronDown } from 'lucide-react';
import { useCommunityMilestones } from '@/hooks/useCommunityMilestones';
import { Progress } from '@/components/ui/progress';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface UnlockPulseIndicatorProps {
  className?: string;
  compact?: boolean;
}

export function UnlockPulseIndicator({ className, compact = false }: UnlockPulseIndicatorProps) {
  const { data: milestones, isLoading } = useCommunityMilestones();
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading) {
    return (
      <div className={cn('h-8 w-24 bg-muted/50 rounded-full animate-pulse', className)} />
    );
  }

  // Find the next unlockable milestone
  const nextMilestone = milestones.find((m) => !m.is_unlocked);
  const recentUnlock = milestones.find((m) => {
    if (!m.is_unlocked || !m.unlocked_at) return false;
    const unlockedDate = new Date(m.unlocked_at);
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return unlockedDate > dayAgo;
  });

  if (!nextMilestone && !recentUnlock) {
    return null;
  }

  const progress = nextMilestone?.progress_percentage || 100;
  const isNearUnlock = progress >= 80;
  const justUnlocked = !!recentUnlock;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <motion.button
          className={cn(
            'relative flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all',
            'bg-background/60 backdrop-blur-sm hover:bg-background/80',
            isNearUnlock && !justUnlocked && 'border-primary/50',
            justUnlocked && 'border-green-500/50 bg-green-500/10',
            !isNearUnlock && !justUnlocked && 'border-border/50',
            className
          )}
          animate={isNearUnlock && !justUnlocked ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {/* Glow effect when near unlock */}
          {isNearUnlock && !justUnlocked && (
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/20 blur-md -z-10"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}

          {/* Icon */}
          {justUnlocked ? (
            <Unlock className="w-4 h-4 text-green-500" />
          ) : (
            <Lock className="w-4 h-4 text-muted-foreground" />
          )}

          {/* Text */}
          {!compact && (
            <span className="text-xs font-medium text-foreground">
              {justUnlocked ? (
                'New unlock!'
              ) : isNearUnlock ? (
                'Almost there!'
              ) : (
                <>Next: {Math.round(progress)}%</>
              )}
            </span>
          )}

          {/* Compact badge */}
          {compact && (
            <span className="text-xs font-bold text-foreground">
              {Math.round(progress)}%
            </span>
          )}

          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        </motion.button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Community Unlocks</h3>
          </div>

          {/* Recent unlock celebration */}
          <AnimatePresence>
            {recentUnlock && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 rounded-lg bg-green-500/10 border border-green-500/20"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Unlock className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-500">Just Unlocked!</span>
                </div>
                <p className="text-sm font-semibold text-foreground">{recentUnlock.milestone_name}</p>
                <p className="text-xs text-muted-foreground">{recentUnlock.reward_description}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Next milestone */}
          {nextMilestone && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  {nextMilestone.milestone_name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {nextMilestone.current_value} / {nextMilestone.target_value}
                </span>
              </div>

              <Progress value={progress} className="h-2" />

              <p className="text-xs text-muted-foreground">
                {nextMilestone.target_value - nextMilestone.current_value} more members to unlock
              </p>

              {nextMilestone.reward_description && (
                <p className="text-xs text-primary">
                  🎁 {nextMilestone.reward_description}
                </p>
              )}
            </div>
          )}

          {/* Summary */}
          <div className="pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground text-center">
              {milestones.filter((m) => m.is_unlocked).length} of {milestones.length} milestones unlocked
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
