/**
 * TierProgressionCard Component
 * Visual tier progression showing current status and path to next tier
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp, Star, Sparkles } from 'lucide-react';
import { TIER_CONFIG, TIER_THRESHOLDS } from '@/hooks/usePartnerProgram';
import { cn } from '@/lib/utils';

interface TierProgressionCardProps {
  currentTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  totalReferrals: number;
  nextTier: { name: string; referralsNeeded: number } | null;
  tierProgress: number;
}

const TierProgressionCard: React.FC<TierProgressionCardProps> = ({
  currentTier,
  totalReferrals,
  nextTier,
  tierProgress,
}) => {
  const tiers = ['bronze', 'silver', 'gold', 'platinum'] as const;
  const currentIndex = tiers.indexOf(currentTier);

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5 text-primary" />
          Tier Progression
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tier Timeline */}
        <div className="relative">
          <div className="flex justify-between items-center">
            {tiers.map((tier, index) => {
              const isActive = index === currentIndex;
              const isCompleted = index < currentIndex;
              const config = TIER_CONFIG[tier];
              
              return (
                <div key={tier} className="flex flex-col items-center relative z-10">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center text-xl',
                      'border-2 transition-all duration-300',
                      isActive && 'ring-4 ring-primary/30 border-primary bg-primary/20',
                      isCompleted && 'border-green-500 bg-green-500/20',
                      !isActive && !isCompleted && 'border-muted bg-muted/50'
                    )}
                  >
                    {config.icon}
                  </motion.div>
                  <span className={cn(
                    'text-xs mt-2 font-medium',
                    isActive && 'text-primary',
                    isCompleted && 'text-green-500',
                    !isActive && !isCompleted && 'text-muted-foreground'
                  )}>
                    {config.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {TIER_THRESHOLDS[tier]}+ refs
                  </span>
                </div>
              );
            })}
          </div>
          
          {/* Connection Line */}
          <div className="absolute top-6 left-6 right-6 h-0.5 bg-muted -z-0">
            <motion.div
              className="h-full bg-gradient-to-r from-green-500 to-primary"
              initial={{ width: '0%' }}
              animate={{ width: `${(currentIndex / (tiers.length - 1)) * 100}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Current Status */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{TIER_CONFIG[currentTier].icon}</span>
              <div>
                <Badge 
                  variant="outline" 
                  className={cn(
                    'bg-gradient-to-r text-white border-0',
                    TIER_CONFIG[currentTier].color
                  )}
                >
                  {TIER_CONFIG[currentTier].name} Partner
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  {TIER_CONFIG[currentTier].commissionRate}% commission rate
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">{totalReferrals}</p>
              <p className="text-xs text-muted-foreground">total referrals</p>
            </div>
          </div>

          {nextTier ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress to {nextTier.name}</span>
                <span className="text-foreground font-medium">
                  {nextTier.referralsNeeded} more needed
                </span>
              </div>
              <Progress value={tierProgress} className="h-2" />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                <span>
                  Unlock {nextTier.name} tier for {
                    TIER_CONFIG[nextTier.name.toLowerCase() as keyof typeof TIER_CONFIG]?.commissionRate || 0
                  }% commission
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-green-500">
              <Sparkles className="h-4 w-4" />
              <span>Maximum tier reached! You're a top partner.</span>
            </div>
          )}
        </div>

        {/* Benefits Preview */}
        <div className="space-y-2">
          <p className="text-sm font-medium flex items-center gap-2">
            <Star className="h-4 w-4 text-primary" />
            Your Benefits
          </p>
          <div className="flex flex-wrap gap-2">
            {TIER_CONFIG[currentTier].features.map((feature, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {feature}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TierProgressionCard;
