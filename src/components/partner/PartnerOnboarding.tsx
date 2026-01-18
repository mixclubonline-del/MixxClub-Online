/**
 * PartnerOnboarding Component
 * Join program flow for new partners
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Gift, 
  Link2,
  ChevronRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { TIER_CONFIG, TIER_THRESHOLDS } from '@/hooks/usePartnerProgram';
import { cn } from '@/lib/utils';

interface PartnerOnboardingProps {
  onJoin: () => Promise<void>;
  isJoining: boolean;
}

const PartnerOnboarding: React.FC<PartnerOnboardingProps> = ({ onJoin, isJoining }) => {
  const [step, setStep] = useState(1);

  const benefits = [
    {
      icon: DollarSign,
      title: 'Earn Up to 30%',
      description: 'Commission on every referral purchase',
    },
    {
      icon: TrendingUp,
      title: 'Tier Progression',
      description: 'Unlock higher rates as you grow',
    },
    {
      icon: Link2,
      title: 'Custom Links',
      description: 'Track campaigns with unique URLs',
    },
    {
      icon: Gift,
      title: 'Exclusive Perks',
      description: 'VIP access and early features',
    },
  ];

  const handleJoin = async () => {
    await onJoin();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <Badge variant="outline" className="mb-4">
          <Sparkles className="h-3 w-3 mr-1" />
          Partner Program
        </Badge>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Turn Your Network Into Revenue
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Join the MixClub Partner Program and earn commissions for every user you bring to the platform.
        </p>
      </motion.div>

      {/* Benefits Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-4"
      >
        {benefits.map((benefit, idx) => (
          <Card key={idx} className="bg-card/50 border-border/50">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <benefit.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{benefit.title}</p>
                <p className="text-xs text-muted-foreground">{benefit.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Tier Preview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Commission Tiers</CardTitle>
            <CardDescription>
              Start at Bronze and climb to Platinum as you refer more users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3">
              {Object.entries(TIER_CONFIG).map(([key, tier], idx) => (
                <div
                  key={key}
                  className={cn(
                    'p-3 rounded-lg border text-center transition-all',
                    idx === 0 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border/50 bg-muted/30'
                  )}
                >
                  <span className="text-2xl block mb-1">{tier.icon}</span>
                  <p className="text-sm font-medium">{tier.name}</p>
                  <p className="text-lg font-bold text-primary">
                    {tier.commissionRate}%
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {TIER_THRESHOLDS[key as keyof typeof TIER_THRESHOLDS]}+ refs
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Earnings Calculator Preview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Potential Monthly Earnings
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-foreground">$500</span>
                  <span className="text-sm text-muted-foreground">- $5,000+</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on 10-100 referrals/month at average order value
                </p>
              </div>
              <div className="text-right">
                <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">
                  Join 500+ partners
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <Button 
          size="lg" 
          className="w-full"
          onClick={handleJoin}
          disabled={isJoining}
        >
          {isJoining ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Setting Up Your Account...
            </>
          ) : (
            <>
              Join Partner Program
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
        
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-green-500" />
            Free to join
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-green-500" />
            No minimum payout
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-green-500" />
            Real-time tracking
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default PartnerOnboarding;
