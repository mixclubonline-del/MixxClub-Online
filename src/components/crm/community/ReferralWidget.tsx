import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Copy, Check, Share2, Users, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export const ReferralWidget: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const referralCode = 'MIXCLUB-KJ9B2F';

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast.success('Referral code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const stats = {
    totalReferrals: 12,
    earnings: 250,
    pending: 3,
  };

  return (
    <Card className="bg-gradient-to-br from-green-900/40 to-card/50 border-green-500/30 p-4 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl" />

      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-lg bg-green-500/20">
            <Gift className="w-4 h-4 text-green-400" />
          </div>
          <h3 className="font-semibold text-foreground">Refer & Earn</h3>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Earn $20 for every friend who subscribes!
        </p>

        {/* Referral Code */}
        <motion.div
          className="bg-background/50 rounded-lg p-3 flex items-center justify-between mb-4 border border-green-500/20"
          whileHover={{ scale: 1.01 }}
        >
          <code className="text-green-400 font-mono font-bold text-sm">{referralCode}</code>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="h-8 w-8 text-muted-foreground hover:text-green-400"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 bg-background/30 rounded-lg">
            <Users className="w-4 h-4 mx-auto mb-1 text-blue-400" />
            <p className="text-lg font-bold text-foreground">{stats.totalReferrals}</p>
            <p className="text-[10px] text-muted-foreground">Referrals</p>
          </div>
          <div className="text-center p-2 bg-background/30 rounded-lg">
            <DollarSign className="w-4 h-4 mx-auto mb-1 text-green-400" />
            <p className="text-lg font-bold text-foreground">${stats.earnings}</p>
            <p className="text-[10px] text-muted-foreground">Earned</p>
          </div>
          <div className="text-center p-2 bg-background/30 rounded-lg">
            <Gift className="w-4 h-4 mx-auto mb-1 text-yellow-400" />
            <p className="text-lg font-bold text-foreground">{stats.pending}</p>
            <p className="text-[10px] text-muted-foreground">Pending</p>
          </div>
        </div>

        <Button className="w-full bg-green-600 hover:bg-green-700 gap-2">
          <Share2 className="w-4 h-4" />
          Share & Earn
        </Button>

        <p className="text-xs text-center text-muted-foreground mt-3">
          No limit on earnings. Track your referrals in real-time.
        </p>
      </div>
    </Card>
  );
};
