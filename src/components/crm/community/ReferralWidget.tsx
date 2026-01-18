import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gift, Copy, Check, Share2, Users, DollarSign, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { usePartnerProgram, TIER_CONFIG } from '@/hooks/usePartnerProgram';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export const ReferralWidget: React.FC = () => {
  const navigate = useNavigate();
  const { 
    partner, 
    isPartner, 
    tier, 
    stats, 
    generateAffiliateLink,
    joinProgram,
    isJoining 
  } = usePartnerProgram();
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    const link = generateAffiliateLink();
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const tierConfig = TIER_CONFIG[tier];

  return (
    <Card className="bg-gradient-to-br from-green-900/40 to-card/50 border-green-500/30 p-4 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl" />

      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-green-500/20">
              <Gift className="w-4 h-4 text-green-400" />
            </div>
            <h3 className="font-semibold text-foreground">Refer & Earn</h3>
          </div>
          {isPartner && (
            <span className={cn(
              "text-lg",
              tierConfig.icon
            )}>
              {tierConfig.icon}
            </span>
          )}
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Earn up to {isPartner ? tierConfig.commissionRate : 30}% on every referral!
        </p>

        {isPartner ? (
          <>
            {/* Referral Code */}
            <motion.div
              className="bg-background/50 rounded-lg p-3 flex items-center justify-between mb-4 border border-green-500/20"
              whileHover={{ scale: 1.01 }}
            >
              <code className="text-green-400 font-mono font-bold text-sm">
                {partner?.affiliate_code || 'MIXX-DEMO'}
              </code>
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
                <p className="text-lg font-bold text-foreground">${stats.totalEarned.toFixed(0)}</p>
                <p className="text-[10px] text-muted-foreground">Earned</p>
              </div>
              <div className="text-center p-2 bg-background/30 rounded-lg">
                <Gift className="w-4 h-4 mx-auto mb-1 text-yellow-400" />
                <p className="text-lg font-bold text-foreground">{stats.pendingReferrals}</p>
                <p className="text-[10px] text-muted-foreground">Pending</p>
              </div>
            </div>

            <Button 
              className="w-full bg-green-600 hover:bg-green-700 gap-2"
              onClick={() => navigate('/partner-program')}
            >
              <ExternalLink className="w-4 h-4" />
              View Dashboard
            </Button>
          </>
        ) : (
          <>
            <div className="text-center py-4 mb-4">
              <p className="text-2xl font-bold text-green-400 mb-1">10% - 30%</p>
              <p className="text-xs text-muted-foreground">Commission per referral</p>
            </div>
            <Button 
              className="w-full bg-green-600 hover:bg-green-700 gap-2"
              onClick={joinProgram}
              disabled={isJoining}
            >
              {isJoining ? 'Joining...' : (
                <>
                  <Share2 className="w-4 h-4" />
                  Join Partner Program
                </>
              )}
            </Button>
          </>
        )}

        <p className="text-xs text-center text-muted-foreground mt-3">
          {isPartner 
            ? `${tierConfig.name} tier • ${tierConfig.commissionRate}% commission`
            : 'No limit on earnings. Track your referrals in real-time.'
          }
        </p>
      </div>
    </Card>
  );
};
