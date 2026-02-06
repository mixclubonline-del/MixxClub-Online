import { motion } from 'framer-motion';
import { Star, Crown, Gem, Award, Sparkles, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const TIERS = [
  { name: 'Newcomer', threshold: 0, icon: Star, color: 'text-zinc-400', glow: 'rgba(161,161,170,0.15)' },
  { name: 'Supporter', threshold: 500, icon: Award, color: 'text-blue-400', glow: 'rgba(96,165,250,0.15)' },
  { name: 'Advocate', threshold: 2000, icon: Sparkles, color: 'text-purple-400', glow: 'rgba(192,132,252,0.15)' },
  { name: 'Champion', threshold: 5000, icon: Crown, color: 'text-amber-400', glow: 'rgba(251,191,36,0.15)' },
  { name: 'Legend', threshold: 10000, icon: Gem, color: 'text-pink-400', glow: 'rgba(244,114,182,0.15)' },
];

interface TierProgressCardProps {
  totalEarned: number;
}

export function TierProgressCard({ totalEarned }: TierProgressCardProps) {
  let currentTierIndex = 0;
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (totalEarned >= TIERS[i].threshold) {
      currentTierIndex = i;
      break;
    }
  }
  const currentTier = TIERS[currentTierIndex] || TIERS[0];
  const nextTier = TIERS[currentTierIndex + 1];

  const progressToNext = nextTier
    ? ((totalEarned - currentTier.threshold) / (nextTier.threshold - currentTier.threshold)) * 100
    : 100;

  const coinzToNext = nextTier ? nextTier.threshold - totalEarned : 0;
  const CurrentIcon = currentTier.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div
        className="relative rounded-xl border border-white/[0.08] p-6 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${currentTier.glow} 0%, rgba(0,0,0,0.2) 100%)`,
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-36 h-36 opacity-[0.06] pointer-events-none">
          <CurrentIcon className="w-full h-full" />
        </div>
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full blur-3xl pointer-events-none" style={{ background: currentTier.glow }} />

        <div className="relative z-10">
          {/* Current Tier */}
          <div className="flex items-center gap-4 mb-5">
            <div
              className="p-3 rounded-xl"
              style={{ background: currentTier.glow, backdropFilter: 'blur(8px)' }}
            >
              <CurrentIcon className={`h-8 w-8 ${currentTier.color}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium tracking-wide uppercase">Current Tier</p>
              <h3 className={`text-2xl font-bold ${currentTier.color}`}>
                {currentTier.name}
              </h3>
            </div>
          </div>

          {/* Progress to Next */}
          {nextTier ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Progress to {nextTier.name}
                </span>
                <span className={TIERS[currentTierIndex + 1]?.color || 'text-foreground'}>
                  {coinzToNext.toLocaleString()} coinz to go
                </span>
              </div>
              <Progress value={progressToNext} className="h-2" />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                <span>
                  {totalEarned.toLocaleString()} / {nextTier.threshold.toLocaleString()} earned coinz
                </span>
              </div>
            </div>
          ) : (
            <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0">
              Max Tier Reached! 🎉
            </Badge>
          )}

          {/* Tier Benefits Preview */}
          <div className="mt-5 pt-4 border-t border-white/[0.06]">
            <p className="text-xs text-muted-foreground mb-2 font-medium tracking-wide uppercase">Tier Benefits</p>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="outline" className="text-xs border-white/10 bg-white/[0.03]">Early Access</Badge>
              <Badge variant="outline" className="text-xs border-white/10 bg-white/[0.03]">Exclusive Drops</Badge>
              {currentTierIndex >= 2 && (
                <Badge variant="outline" className="text-xs border-white/10 bg-white/[0.03]">2x Missions</Badge>
              )}
              {currentTierIndex >= 3 && (
                <Badge variant="outline" className="text-xs border-white/10 bg-white/[0.03]">VIP Support</Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
