import { motion } from 'framer-motion';
import { Star, Award, Sparkles, Crown, Gem, Check, Lock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MixxCoin } from '@/components/economy/MixxCoin';

interface TierBenefitsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTier: string;
  totalEarned: number;
}

const TIERS = [
  {
    name: 'Newcomer',
    threshold: 0,
    icon: Star,
    color: 'text-zinc-400',
    bgColor: 'bg-zinc-500/10',
    benefits: ['Basic access', 'Mission rewards', 'Community feed'],
  },
  {
    name: 'Supporter',
    threshold: 500,
    icon: Award,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    benefits: ['Early access to premieres', '5% merch discount', 'Supporter badge'],
  },
  {
    name: 'Advocate',
    threshold: 2000,
    icon: Sparkles,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    benefits: ['2x daily mission slots', 'Exclusive badges', 'Priority support'],
  },
  {
    name: 'Champion',
    threshold: 5000,
    icon: Crown,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    benefits: ['VIP support line', '15% merch discount', '2x voting weight'],
  },
  {
    name: 'Legend',
    threshold: 10000,
    icon: Gem,
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    benefits: ['Direct artist messaging', 'Exclusive drops access', '25% merch discount', 'Legend badge'],
  },
];

export function TierBenefitsModal({ 
  open, 
  onOpenChange, 
  currentTier,
  totalEarned 
}: TierBenefitsModalProps) {
  const currentTierIndex = TIERS.findIndex(
    t => t.name.toLowerCase() === currentTier.toLowerCase()
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-400" />
            Fan Tier Benefits
          </DialogTitle>
          <DialogDescription>
            Level up by earning MixxCoinz to unlock exclusive perks
          </DialogDescription>
        </DialogHeader>

        {/* Current Progress */}
        <div className="bg-accent/50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Earned</span>
            <div className="flex items-center gap-2">
              <MixxCoin type="earned" size="sm" />
              <span className="font-bold">{totalEarned.toLocaleString()}</span>
            </div>
          </div>
          {currentTierIndex < TIERS.length - 1 && (
            <>
              <Progress 
                value={(totalEarned / TIERS[currentTierIndex + 1].threshold) * 100} 
                className="h-2 mb-1"
              />
              <p className="text-xs text-muted-foreground text-right">
                {(TIERS[currentTierIndex + 1].threshold - totalEarned).toLocaleString()} to {TIERS[currentTierIndex + 1].name}
              </p>
            </>
          )}
        </div>

        {/* Tiers List */}
        <div className="space-y-3 overflow-y-auto flex-1 pr-1">
          {TIERS.map((tier, i) => {
            const isUnlocked = i <= currentTierIndex;
            const isCurrent = i === currentTierIndex;
            const TierIcon = tier.icon;

            return (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`p-4 rounded-lg border transition-all ${
                  isCurrent
                    ? `${tier.bgColor} border-${tier.color.replace('text-', '')}/30`
                    : isUnlocked
                    ? 'bg-accent/30 border-border'
                    : 'bg-muted/20 border-border opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`p-2 rounded-lg ${tier.bgColor}`}>
                    <TierIcon className={`h-5 w-5 ${tier.color}`} />
                  </div>

                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className={`font-semibold ${tier.color}`}>{tier.name}</h4>
                        {isCurrent && (
                          <Badge className="bg-primary/20 text-primary text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <MixxCoin type="earned" size="sm" />
                        <span className="text-muted-foreground">
                          {tier.threshold.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Benefits */}
                    <ul className="space-y-1">
                      {tier.benefits.map((benefit, j) => (
                        <li 
                          key={j} 
                          className="flex items-center gap-2 text-sm"
                        >
                          {isUnlocked ? (
                            <Check className="h-3 w-3 text-green-400 shrink-0" />
                          ) : (
                            <Lock className="h-3 w-3 text-muted-foreground shrink-0" />
                          )}
                          <span className={isUnlocked ? '' : 'text-muted-foreground'}>
                            {benefit}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="pt-3 mt-2 border-t border-border/50">
          <p className="text-xs text-center text-muted-foreground">
            Tier progress is based on lifetime earned coinz (not balance)
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
