/**
 * ReferralTracker — Post-signup referral leaderboard + share mechanics
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Share2, Users, Trophy, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWaitlistReferralStats } from '@/hooks/useLaunchCampaign';

interface ReferralTrackerProps {
  referralCode: string;
  position?: number | null;
  className?: string;
}

export function ReferralTracker({ referralCode, position, className }: ReferralTrackerProps) {
  const [copied, setCopied] = useState(false);
  const { data: referralStats } = useWaitlistReferralStats(referralCode);

  const referralCount = referralStats?.count || 0;
  const untilBump = 3 - (referralCount % 3);
  const shareUrl = `${window.location.origin}/request-access?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className={`space-y-4 ${className || ''}`}
    >
      {/* Referral Stats */}
      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Your Referral Power</span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="text-center p-2 rounded-lg bg-background/50">
            <p className="text-2xl font-black text-primary">{referralCount}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Referred</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-background/50">
            <p className="text-2xl font-black text-foreground">#{position || '—'}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Position</p>
          </div>
        </div>

        {referralCount < 3 ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ArrowUp className="w-3 h-3 text-green-500" />
            <span>
              Refer <span className="text-foreground font-semibold">{untilBump} more</span> to skip ahead in line
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-green-500">
            <ArrowUp className="w-3 h-3" />
            <span className="font-semibold">You've been bumped up! Keep going for more boosts.</span>
          </div>
        )}
      </div>

      {/* Share Link */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Share2 className="w-3.5 h-3.5" />
          Share your personal link
        </p>
        <div className="flex items-center gap-2">
          <Input
            value={shareUrl}
            readOnly
            className="bg-muted/30 border-border/50 text-xs font-mono"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopy}
            className="shrink-0"
          >
            {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
