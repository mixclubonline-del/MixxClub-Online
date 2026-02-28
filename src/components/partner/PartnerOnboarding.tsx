// ============= Full file contents =============

import { useState } from "react";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Gift, 
  ChevronRight,
  Sparkles,
  Award
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TIER_CONFIG, TIER_THRESHOLDS } from "@/hooks/usePartnerProgram";
import { cn } from "@/lib/utils";

interface PartnerOnboardingProps {
  onJoin: () => Promise<void>;
  isJoining: boolean;
}

const PartnerOnboarding: React.FC<PartnerOnboardingProps> = ({ onJoin, isJoining }) => {
  const [step, setStep] = useState(1);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <Badge variant="secondary" className="mb-4">
          <Sparkles className="w-3 h-3 mr-1" />
          Partner Program
        </Badge>
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Join the Mixxclub Partner Network
        </h1>
        <p className="text-xl text-muted-foreground">
          Turn your influence into income. Earn up to 30% recurring commissions.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <Card className="bg-gradient-to-br from-background to-primary/5 border-primary/20">
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold mb-2">Earn</h3>
            <p className="text-sm text-muted-foreground">
              Get paid for every artist and engineer you refer
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-background to-purple-500/5 border-purple-500/20">
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="font-bold mb-2">Grow</h3>
            <p className="text-sm text-muted-foreground">
              Unlock higher tiers and bonuses as you scale
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-background to-pink-500/5 border-pink-500/20">
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center mx-auto mb-4">
              <Gift className="w-6 h-6 text-pink-500" />
            </div>
            <h3 className="font-bold mb-2">Rewards</h3>
            <p className="text-sm text-muted-foreground">
              Exclusive perks, merch, and studio time
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border-2">
        <CardHeader className="bg-muted/50 border-b">
          <CardTitle>Program Tiers</CardTitle>
          <CardDescription>
            Start at Bronze and work your way up to Platinum status
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {Object.entries(TIER_CONFIG).map(([key, tier]: [string, any]) => (
              <div key={key} className="p-6 flex items-center gap-4 hover:bg-muted/30 transition-colors">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center border-2",
                  key === 'platinum' ? "bg-slate-100 border-slate-300" :
                  key === 'gold' ? "bg-yellow-50 border-yellow-200" :
                  key === 'silver' ? "bg-slate-50 border-slate-200" :
                  "bg-orange-50 border-orange-200"
                )}>
                  <AwardIcon tier={key} className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold capitalize">{key} Partner</h4>
                    <Badge variant="outline">{tier.commission}% Commission</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {tier.benefits && tier.benefits[0]}
                  </p>
                  <div className="text-xs font-medium text-muted-foreground">
                    Requires {TIER_THRESHOLDS[key as keyof typeof TIER_THRESHOLDS]} referrals
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 text-center">
        <Button 
          size="lg" 
          className="w-full md:w-auto px-12 py-6 text-lg gap-2"
          onClick={onJoin}
          disabled={isJoining}
        >
          {isJoining ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Joining...
            </>
          ) : (
            <>
              Join Partner Program
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground mt-4">
          By joining, you agree to the Mixxclub Partner Terms & Conditions
        </p>
      </div>
    </div>
  );
};

function AwardIcon({ tier, className }: { tier: string, className?: string }) {
  const colors = {
    bronze: "text-orange-600",
    silver: "text-slate-500",
    gold: "text-yellow-600",
    platinum: "text-slate-800"
  };
  
  return <Award className={cn(colors[tier as keyof typeof colors], className)} />;
}

export default PartnerOnboarding;