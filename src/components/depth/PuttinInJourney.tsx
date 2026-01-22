import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Users, Mic, Star, Check, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDepth } from '@/contexts/DepthContext';
import { DepthLayer, DEPTH_LAYERS } from '@/types/depth';
import { NovaCelebration } from '@/components/characters/NovaCelebration';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PuttinInJourneyProps {
  compact?: boolean;
  showCelebration?: boolean;
  className?: string;
}

const MILESTONES: Array<{
  layer: DepthLayer;
  icon: React.ElementType;
  label: string;
  threshold: number;
  celebration: string;
  capabilities: string[];
}> = [
  {
    layer: 'posted-up',
    icon: Eye,
    label: 'Posted Up',
    threshold: 0,
    celebration: 'Welcome to the building',
    capabilities: ['See the hallway', 'Feel the vibe'],
  },
  {
    layer: 'in-the-room',
    icon: Users,
    label: 'In the Room',
    threshold: 10,
    celebration: "You're in!",
    capabilities: ['See who\'s behind doors', 'Knock on sessions', 'Earn MixxCoinz'],
  },
  {
    layer: 'on-the-mic',
    icon: Mic,
    label: 'On the Mic',
    threshold: 100,
    celebration: 'Time to shine',
    capabilities: ['Enter sessions', 'Host your own', 'Access CRM'],
  },
  {
    layer: 'on-stage',
    icon: Star,
    label: 'On Stage',
    threshold: 500,
    celebration: 'You ARE the energy',
    capabilities: ['Be the glow', 'Featured placement', 'Full platform access'],
  },
];

export function PuttinInJourney({ compact = false, showCelebration = false, className }: PuttinInJourneyProps) {
  const { currentLayer, puttinInScore, progressToNext, nextLayer, loading } = useDepth();
  const [celebrationType, setCelebrationType] = useState<'milestone' | null>(null);

  const currentIndex = MILESTONES.findIndex(m => m.layer === currentLayer);

  // Trigger celebration on layer change
  useEffect(() => {
    if (showCelebration && currentLayer !== 'posted-up') {
      setCelebrationType('milestone');
      const timer = setTimeout(() => setCelebrationType(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [currentLayer, showCelebration]);

  if (loading) return null;

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {MILESTONES.map((milestone, index) => {
          const Icon = milestone.icon;
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div
              key={milestone.layer}
              className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center transition-all',
                isCompleted && 'bg-accent text-accent-foreground',
                isCurrent && 'bg-primary text-primary-foreground ring-2 ring-primary/50',
                !isCompleted && !isCurrent && 'bg-muted text-muted-foreground'
              )}
            >
              <Icon className="w-3 h-3" />
            </div>
          );
        })}
        <span className="text-xs text-muted-foreground ml-1">
          {puttinInScore} pts
        </span>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={cn('relative', className)}>
        {/* Celebration overlay */}
        <AnimatePresence>
          {celebrationType && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute -top-24 left-1/2 -translate-x-1/2 z-10"
            >
              <NovaCelebration
                type="milestone"
                title={MILESTONES[currentIndex]?.celebration}
                message={`You've reached ${MILESTONES[currentIndex]?.label}!`}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress track */}
        <div className="relative flex items-center justify-between">
          {/* Background line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-muted -translate-y-1/2 rounded-full" />

          {/* Filled progress line */}
          <motion.div
            className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-primary via-accent to-accent-gold -translate-y-1/2 rounded-full"
            initial={{ width: '0%' }}
            animate={{
              width: `${((currentIndex + (progressToNext / 100)) / (MILESTONES.length - 1)) * 100}%`,
            }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />

          {/* Milestone nodes */}
          {MILESTONES.map((milestone, index) => {
            const Icon = milestone.icon;
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isLocked = index > currentIndex;

            return (
              <Tooltip key={milestone.layer}>
                <TooltipTrigger asChild>
                  <motion.div
                    className="relative z-10"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all cursor-pointer',
                        isCompleted && 'bg-accent border-accent text-accent-foreground',
                        isCurrent && 'bg-primary border-primary text-primary-foreground',
                        isLocked && 'bg-muted/50 border-muted text-muted-foreground'
                      )}
                      animate={isCurrent ? {
                        boxShadow: [
                          '0 0 0 0 hsl(var(--primary) / 0.4)',
                          '0 0 0 8px hsl(var(--primary) / 0)',
                        ],
                      } : {}}
                      transition={isCurrent ? {
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeOut',
                      } : {}}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : isLocked ? (
                        <Lock className="w-4 h-4" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </motion.div>

                    {/* Label */}
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <span className={cn(
                        'text-xs font-medium',
                        isCurrent ? 'text-primary' : 'text-muted-foreground'
                      )}>
                        {milestone.label}
                      </span>
                    </div>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[200px]">
                  <div className="space-y-2">
                    <div className="font-semibold">{milestone.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {milestone.threshold} points required
                    </div>
                    <div className="text-xs space-y-1">
                      <div className="font-medium">Unlocks:</div>
                      {milestone.capabilities.map((cap, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <Check className="w-3 h-3 text-accent" />
                          {cap}
                        </div>
                      ))}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Current score display */}
        <div className="mt-12 text-center">
          <div className="text-2xl font-bold text-foreground">{puttinInScore}</div>
          <div className="text-sm text-muted-foreground">Puttin' In Score</div>
          {nextLayer && (
            <div className="text-xs text-muted-foreground mt-1">
              {DEPTH_LAYERS[nextLayer].minPuttinIn - puttinInScore} more to {DEPTH_LAYERS[nextLayer].label}
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
