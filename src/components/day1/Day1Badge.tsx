import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { type RecognitionTier, getTierIcon, getTierLabel, getTierColor } from '@/hooks/useDay1Status';

interface Day1BadgeProps {
  tier: RecognitionTier;
  followerRank?: number;
  compact?: boolean;
  showRank?: boolean;
  className?: string;
}

export function Day1Badge({
  tier,
  followerRank,
  compact = false,
  showRank = true,
  className,
}: Day1BadgeProps) {
  const icon = getTierIcon(tier);
  const label = getTierLabel(tier);
  const colorClass = getTierColor(tier);

  const bgClasses: Record<RecognitionTier, string> = {
    before_day1: 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-500/50',
    day1: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50',
    early_supporter: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/50',
    supporter: 'bg-muted/50 border-border',
  };

  if (compact) {
    return (
      <span 
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
          bgClasses[tier],
          colorClass,
          className
        )}
        title={showRank && followerRank ? `Follower #${followerRank}` : label}
      >
        <span>{icon}</span>
        <span>{label}</span>
      </span>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "inline-flex flex-col items-center gap-1 px-4 py-2 rounded-lg border",
        bgClasses[tier],
        className
      )}
    >
      <span className="text-2xl">{icon}</span>
      <span className={cn("text-sm font-semibold", colorClass)}>{label}</span>
      {showRank && followerRank && (
        <span className="text-xs text-muted-foreground">
          Follower #{followerRank}
        </span>
      )}
    </motion.div>
  );
}

export default Day1Badge;
