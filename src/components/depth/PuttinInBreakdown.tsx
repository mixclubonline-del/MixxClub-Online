import { motion } from 'framer-motion';
import { useDepth } from '@/contexts/DepthContext';
import { Clock, Eye, Heart, Wrench, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const PILLAR_CONFIG = {
  time: {
    icon: Clock,
    label: 'Time',
    description: 'Hours in the building',
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
  },
  attention: {
    icon: Eye,
    label: 'Attention',
    description: 'What you follow & engage',
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
  },
  support: {
    icon: Heart,
    label: 'Support',
    description: 'Day 1 backing',
    color: 'text-pink-400',
    bgColor: 'bg-pink-400/10',
  },
  work: {
    icon: Wrench,
    label: 'Work',
    description: 'What you create',
    color: 'text-orange-400',
    bgColor: 'bg-orange-400/10',
  },
  love: {
    icon: Sparkles,
    label: 'Love',
    description: 'Community standing',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
  },
};

interface PuttinInBreakdownProps {
  compact?: boolean;
  className?: string;
}

export function PuttinInBreakdown({ compact = false, className }: PuttinInBreakdownProps) {
  const { puttinInBreakdown, puttinInScore, loading } = useDepth();

  if (loading) return null;

  const pillars = Object.entries(PILLAR_CONFIG).map(([key, config]) => ({
    ...config,
    key,
    value: puttinInBreakdown[key as keyof typeof puttinInBreakdown],
  }));

  // Find the highest pillar for visual emphasis
  const maxValue = Math.max(...pillars.map(p => p.value));

  if (compact) {
    return (
      <div className={cn("flex gap-2", className)}>
        {pillars.map((pillar, index) => {
          const Icon = pillar.icon;
          const isTop = pillar.value === maxValue && maxValue > 0;
          
          return (
            <motion.div
              key={pillar.key}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-md text-xs",
                pillar.bgColor,
                isTop && "ring-1 ring-current"
              )}
              title={`${pillar.label}: ${pillar.value}`}
            >
              <Icon className={cn("w-3 h-3", pillar.color)} />
              <span className={pillar.color}>{pillar.value}</span>
            </motion.div>
          );
        })}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "p-4 rounded-xl",
        "bg-card/80 backdrop-blur-sm border border-border/50",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Puttin' In</h3>
        <span className="text-lg font-mono font-bold text-primary">{puttinInScore}</span>
      </div>

      {/* Pillars Grid */}
      <div className="grid grid-cols-5 gap-2">
        {pillars.map((pillar, index) => {
          const Icon = pillar.icon;
          const isTop = pillar.value === maxValue && maxValue > 0;
          const percentage = maxValue > 0 ? (pillar.value / maxValue) * 100 : 0;
          
          return (
            <motion.div
              key={pillar.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="flex flex-col items-center text-center"
            >
              {/* Icon with background bar */}
              <div className="relative w-full h-16 flex items-end justify-center mb-2">
                {/* Background bar */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${percentage}%` }}
                  transition={{ delay: 0.3 + index * 0.08, duration: 0.5 }}
                  className={cn(
                    "absolute bottom-0 w-8 rounded-t-md",
                    pillar.bgColor
                  )}
                />
                {/* Icon */}
                <div className={cn(
                  "relative z-10 w-8 h-8 rounded-full flex items-center justify-center",
                  pillar.bgColor,
                  isTop && "ring-2 ring-current animate-pulse"
                )}>
                  <Icon className={cn("w-4 h-4", pillar.color)} />
                </div>
              </div>
              
              {/* Value */}
              <span className={cn("text-sm font-mono font-medium", pillar.color)}>
                {pillar.value}
              </span>
              
              {/* Label */}
              <span className="text-[10px] text-muted-foreground mt-0.5">
                {pillar.label}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground text-center mt-4 italic">
        "What's understood doesn't need to be said"
      </p>
    </motion.div>
  );
}
