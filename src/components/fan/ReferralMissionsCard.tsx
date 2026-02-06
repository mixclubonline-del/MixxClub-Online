import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Copy, Check, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useReferralSystem } from '@/hooks/useReferralSystem';
import { MixxCoin } from '@/components/economy/MixxCoin';

const REFERRAL_MILESTONES = [
  { count: 5, reward: 250, label: 'Starter' },
  { count: 10, reward: 500, label: 'Connector' },
  { count: 25, reward: 1500, label: 'Ambassador' },
];

const COINZ_PER_REFERRAL = 50;

export function ReferralMissionsCard() {
  const [copied, setCopied] = useState(false);
  const { myReferralCode: referralCode, referralStats, loading: isLoading } = useReferralSystem();

  const handleCopy = async () => {
    if (!referralCode) return;
    
    const referralLink = `${window.location.origin}/signup?ref=${referralCode}`;
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const totalReferrals = referralStats?.total || 0;
  const nextMilestone = REFERRAL_MILESTONES.find(m => m.count > totalReferrals);
  const progressToNext = nextMilestone 
    ? (totalReferrals / nextMilestone.count) * 100 
    : 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div
        className="relative rounded-xl border border-blue-500/20 p-5 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(34,211,238,0.05) 100%)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        <div className="absolute -top-12 -left-12 w-36 h-36 rounded-full bg-blue-500/8 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div
                className="p-2 rounded-xl"
                style={{ background: 'rgba(59,130,246,0.15)' }}
              >
                <Users className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold">Invite Friends</h3>
                <p className="text-xs text-muted-foreground">
                  Earn {COINZ_PER_REFERRAL} coinz per friend
                </p>
              </div>
            </div>
            <Badge
              className="border-blue-500/30 text-blue-400"
              style={{ background: 'rgba(59,130,246,0.12)' }}
            >
              <Gift className="h-3 w-3 mr-1" />
              {totalReferrals} invited
            </Badge>
          </div>

          {/* Referral Code */}
          <div className="flex items-center gap-2 mb-4">
            <div
              className="flex-1 rounded-lg px-3 py-2 font-mono text-sm border border-white/[0.06]"
              style={{ background: 'rgba(0,0,0,0.2)' }}
            >
              {referralCode || 'Loading...'}
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleCopy}
              disabled={!referralCode}
              className="shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Progress to Next Milestone */}
          {nextMilestone && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Next: {nextMilestone.label}
                </span>
                <div className="flex items-center gap-1">
                  <MixxCoin type="earned" size="sm" />
                  <span className="text-blue-400 font-medium">
                    +{nextMilestone.reward}
                  </span>
                </div>
              </div>
              <Progress value={progressToNext} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                {totalReferrals} / {nextMilestone.count} friends
              </p>
            </div>
          )}

          {/* Milestones */}
          <div className="mt-5 pt-3 border-t border-white/[0.06]">
            <p className="text-xs text-muted-foreground mb-2 font-medium tracking-wide uppercase">Milestones</p>
            <div className="flex gap-2">
              {REFERRAL_MILESTONES.map((milestone) => {
                const achieved = totalReferrals >= milestone.count;
                return (
                  <Badge
                    key={milestone.count}
                    variant={achieved ? 'default' : 'outline'}
                    className={`text-xs ${
                      achieved 
                        ? 'bg-blue-500 text-white border-0' 
                        : 'text-muted-foreground border-white/10'
                    }`}
                  >
                    {milestone.count} = {milestone.reward}
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
