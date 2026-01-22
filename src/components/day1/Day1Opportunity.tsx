import { motion } from 'framer-motion';
import { Sparkles, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePotentialDay1, getTierIcon, getTierLabel } from '@/hooks/useDay1Status';

interface Day1OpportunityProps {
  artistId: string;
  className?: string;
}

export function Day1Opportunity({ artistId, className }: Day1OpportunityProps) {
  const { isLoading, potentialRank, potentialTier, isDay1Opportunity } = usePotentialDay1(artistId);

  if (isLoading || !isDay1Opportunity) return null;

  const icon = getTierIcon(potentialTier);
  const label = getTierLabel(potentialTier);

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium",
        "bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30",
        "text-primary",
        className
      )}
    >
      <Sparkles className="h-3 w-3" />
      <span>
        Be follower <span className="font-bold">#{potentialRank}</span>
      </span>
      <span className="opacity-60">•</span>
      <span className="flex items-center gap-1">
        {icon} {label}
      </span>
    </motion.div>
  );
}

interface RisingStarIndicatorProps {
  followerCount: number;
  className?: string;
}

export function RisingStarIndicator({ followerCount, className }: RisingStarIndicatorProps) {
  if (followerCount >= 100) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs",
        "bg-amber-500/10 text-amber-500 border border-amber-500/20",
        className
      )}
    >
      <TrendingUp className="h-3 w-3" />
      <span>Rising</span>
    </motion.div>
  );
}

export default Day1Opportunity;
