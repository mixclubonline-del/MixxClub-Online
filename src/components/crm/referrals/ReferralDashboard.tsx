/**
 * ReferralDashboard — Full referral tracking hub with GlassPanel design tokens.
 * 
 * Visualizes referral tree, pending/completed commissions, share links,
 * and conversion funnel using real data from partners + referrals tables.
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassPanel, HubHeader, HubSkeleton, EmptyState, StaggeredList } from '@/components/crm/design';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users, DollarSign, TrendingUp, Link2, Copy, CheckCircle2,
  Clock, Gift, Share2, ExternalLink, Crown, Target, BarChart3,
  ArrowRight, Sparkles, UserPlus
} from 'lucide-react';
import { usePartnerProgram, TIER_CONFIG } from '@/hooks/usePartnerProgram';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';

const ACCENT = 'rgba(34, 197, 94, 0.4)';
const ACCENT_GOLD = 'rgba(245, 158, 11, 0.35)';
const ACCENT_BLUE = 'rgba(59, 130, 246, 0.35)';
const ACCENT_PURPLE = 'rgba(168, 85, 247, 0.35)';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
  trend?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, accent, trend }) => (
  <GlassPanel accent={accent} padding="p-4" hoverable>
    <div className="flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: accent.replace(/[\d.]+\)$/, '0.15)') }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground truncate">{label}</p>
      </div>
    </div>
    {trend && (
      <div className="mt-2 flex items-center gap-1">
        <TrendingUp className="w-3 h-3 text-green-400" />
        <span className="text-xs text-green-400">{trend}</span>
      </div>
    )}
  </GlassPanel>
);

const ReferralDashboard: React.FC = () => {
  const {
    partner,
    isPartner,
    isLoading,
    tier,
    tierBenefits,
    nextTier,
    tierProgress,
    stats,
    referralHistory,
    joinProgram,
    isJoining,
    generateAffiliateLink,
  } = usePartnerProgram();

  const [copiedLink, setCopiedLink] = useState(false);
  const [campaignInput, setCampaignInput] = useState('');

  const handleCopyLink = (campaign?: string) => {
    const link = generateAffiliateLink(campaign || undefined);
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareTwitter = () => {
    const link = generateAffiliateLink('twitter');
    const text = encodeURIComponent(`Level up your sound with Mixxclub — professional mixing, mastering & a creator community that pays. Join free: ${link}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  // Aggregate referral stats
  const referralStats = useMemo(() => {
    const completed = referralHistory.filter(r => r.status === 'completed').length;
    const pending = referralHistory.filter(r => r.status === 'pending').length;
    const active = referralHistory.filter(r => r.status === 'active').length;
    const totalCommissions = referralHistory.reduce((sum, r) => sum + (r.commission_amount || 0), 0);
    return { completed, pending, active, totalCommissions };
  }, [referralHistory]);

  // Conversion funnel data
  const funnelStages = useMemo(() => {
    const total = referralHistory.length || 1;
    const clicked = total; // All referrals = clicks that converted to signups
    const active = referralHistory.filter(r => r.status === 'active' || r.status === 'completed').length;
    const paid = referralHistory.filter(r => r.status === 'completed').length;
    return [
      { label: 'Link Clicks → Signups', count: clicked, pct: 100 },
      { label: 'Active Users', count: active, pct: Math.round((active / total) * 100) },
      { label: 'Paid Conversions', count: paid, pct: Math.round((paid / total) * 100) },
    ];
  }, [referralHistory]);

  if (isLoading) {
    return <HubSkeleton rows={4} />;
  }

  if (!isPartner) {
    return (
      <div className="space-y-6">
        <HubHeader
          icon={<Gift className="w-5 h-5 text-green-400" />}
          title="Referral Program"
          subtitle="Earn commissions by inviting creators"
          accent={ACCENT}
        />
        <GlassPanel accent={ACCENT} glow padding="p-8">
          <div className="text-center max-w-md mx-auto">
            <motion.div
              className="w-20 h-20 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring' }}
            >
              <Gift className="w-10 h-10 text-green-400" />
            </motion.div>
            <h3 className="text-xl font-bold text-foreground mb-2">Start Earning with Referrals</h3>
            <p className="text-muted-foreground text-sm mb-2">
              Share Mixxclub with your network and earn <span className="text-green-400 font-semibold">10-30% commission</span> on every referral's purchases.
            </p>
            <div className="flex flex-wrap justify-center gap-3 my-6">
              {['🥉 Bronze 10%', '🥈 Silver 15%', '🥇 Gold 20%', '👑 Platinum 30%'].map((t) => (
                <Badge key={t} variant="outline" className="text-xs border-green-500/20 text-green-300/80">
                  {t}
                </Badge>
              ))}
            </div>
            <Button
              onClick={() => joinProgram()}
              disabled={isJoining}
              className="bg-green-600 hover:bg-green-700 text-white gap-2"
            >
              <UserPlus className="w-4 h-4" />
              {isJoining ? 'Joining...' : 'Join Referral Program'}
            </Button>
          </div>
        </GlassPanel>
      </div>
    );
  }

  const tierConfig = TIER_CONFIG[tier];

  return (
    <div className="space-y-6">
      {/* Header */}
      <HubHeader
        icon={<Gift className="w-5 h-5 text-green-400" />}
        title="Referral Dashboard"
        subtitle={`${tierConfig.icon} ${tierConfig.name} Partner · ${tierBenefits.commissionRate}% commission`}
        accent={ACCENT}
        action={
          <Badge
            variant="outline"
            className={cn('text-white border-0 px-3 py-1 bg-gradient-to-r', tierConfig.color)}
          >
            {tierConfig.icon} {tierConfig.name}
          </Badge>
        }
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={<Users className="w-5 h-5 text-blue-400" />}
          label="Total Referrals"
          value={stats.totalReferrals.toString()}
          accent={ACCENT_BLUE}
        />
        <StatCard
          icon={<DollarSign className="w-5 h-5 text-green-400" />}
          label="Total Earned"
          value={`$${stats.totalEarned.toFixed(2)}`}
          accent={ACCENT}
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-amber-400" />}
          label="Pending"
          value={`$${stats.pendingEarnings.toFixed(2)}`}
          accent={ACCENT_GOLD}
        />
        <StatCard
          icon={<Target className="w-5 h-5 text-purple-400" />}
          label="Conversion"
          value={`${stats.conversionRate}%`}
          accent={ACCENT_PURPLE}
        />
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-white/[0.03] border border-white/[0.08]">
          <TabsTrigger value="overview" className="gap-1.5 text-xs sm:text-sm">
            <BarChart3 className="w-3.5 h-3.5" /> Overview
          </TabsTrigger>
          <TabsTrigger value="referrals" className="gap-1.5 text-xs sm:text-sm">
            <Users className="w-3.5 h-3.5" /> Referrals
          </TabsTrigger>
          <TabsTrigger value="share" className="gap-1.5 text-xs sm:text-sm">
            <Share2 className="w-3.5 h-3.5" /> Share
          </TabsTrigger>
        </TabsList>

        {/* ─── Overview Tab ─── */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Tier Progression */}
            <GlassPanel accent={ACCENT} glow padding="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Crown className="w-5 h-5 text-amber-400" />
                <h3 className="font-semibold text-foreground">Tier Progression</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {tierConfig.icon} {tierConfig.name}
                  </span>
                  {nextTier && (
                    <span className="text-muted-foreground">
                      {TIER_CONFIG[nextTier]?.icon} {TIER_CONFIG[nextTier]?.name}
                    </span>
                  )}
                </div>
                <Progress value={tierProgress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {nextTier
                    ? `${stats.totalReferrals} referrals · ${Math.round(tierProgress)}% to ${TIER_CONFIG[nextTier]?.name}`
                    : 'Maximum tier reached!'}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-white/[0.06]">
                <p className="text-xs text-muted-foreground mb-2">Current benefits:</p>
                <div className="flex flex-wrap gap-2">
                  {tierBenefits.features.map((f) => (
                    <Badge key={f} variant="outline" className="text-xs border-white/10 text-muted-foreground">
                      {f}
                    </Badge>
                  ))}
                </div>
              </div>
            </GlassPanel>

            {/* Conversion Funnel */}
            <GlassPanel accent={ACCENT_PURPLE} padding="p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                <h3 className="font-semibold text-foreground">Conversion Funnel</h3>
              </div>
              <div className="space-y-4">
                {funnelStages.map((stage, i) => (
                  <div key={stage.label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-muted-foreground">{stage.label}</span>
                      <span className="text-foreground font-medium">{stage.count}</span>
                    </div>
                    <div className="relative h-2 rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{
                          background: `linear-gradient(90deg, ${['#3b82f6', '#8b5cf6', '#22c55e'][i]}, ${['#60a5fa', '#a78bfa', '#4ade80'][i]})`,
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${stage.pct}%` }}
                        transition={{ delay: 0.2 + i * 0.15, duration: 0.6 }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{stage.pct}%</p>
                  </div>
                ))}
              </div>
            </GlassPanel>
          </div>

          {/* Recent Referrals Preview */}
          <GlassPanel accent={ACCENT_BLUE} padding="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold text-foreground">Recent Activity</h3>
              </div>
              <Badge variant="outline" className="text-xs border-white/10">
                {referralHistory.length} total
              </Badge>
            </div>
            {referralHistory.length === 0 ? (
              <EmptyState
                icon={UserPlus}
                title="No referrals yet"
                description="Share your link to start earning commissions"
              />
            ) : (
              <StaggeredList className="space-y-2">
                {referralHistory.slice(0, 5).map((ref) => (
                  <div
                    key={ref.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                        ref.status === 'completed' ? 'bg-green-500/10' : ref.status === 'active' ? 'bg-blue-500/10' : 'bg-amber-500/10'
                      )}>
                        {ref.status === 'completed' ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        ) : ref.status === 'active' ? (
                          <Users className="w-4 h-4 text-blue-400" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {ref.referred_user?.full_name || 'Pending Signup'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(ref.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant="outline"
                        className={cn('text-xs capitalize', {
                          'border-green-500/20 text-green-400': ref.status === 'completed',
                          'border-blue-500/20 text-blue-400': ref.status === 'active',
                          'border-amber-500/20 text-amber-400': ref.status === 'pending',
                        })}
                      >
                        {ref.status}
                      </Badge>
                      {ref.commission_amount != null && ref.commission_amount > 0 && (
                        <span className="text-sm font-semibold text-green-400">
                          +${ref.commission_amount.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </StaggeredList>
            )}
          </GlassPanel>
        </TabsContent>

        {/* ─── Referrals Tab ─── */}
        <TabsContent value="referrals">
          <GlassPanel accent={ACCENT_BLUE} padding="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold text-foreground">All Referrals</h3>
            </div>

            {/* Summary badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="outline" className="border-green-500/20 text-green-400 text-xs">
                {referralStats.completed} completed
              </Badge>
              <Badge variant="outline" className="border-blue-500/20 text-blue-400 text-xs">
                {referralStats.active} active
              </Badge>
              <Badge variant="outline" className="border-amber-500/20 text-amber-400 text-xs">
                {referralStats.pending} pending
              </Badge>
            </div>

            {referralHistory.length === 0 ? (
              <EmptyState
                icon={UserPlus}
                title="No referrals yet"
                description="Share your affiliate link to start building your network and earning commissions."
              />
            ) : (
              <StaggeredList className="space-y-2">
                {referralHistory.map((ref) => (
                  <div
                    key={ref.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn(
                        'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                        ref.status === 'completed' ? 'bg-green-500/10' : ref.status === 'active' ? 'bg-blue-500/10' : 'bg-amber-500/10'
                      )}>
                        {ref.status === 'completed' ? <CheckCircle2 className="w-4 h-4 text-green-400" /> :
                         ref.status === 'active' ? <Users className="w-4 h-4 text-blue-400" /> :
                         <Clock className="w-4 h-4 text-amber-400" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {ref.referred_user?.full_name || 'Pending Signup'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Code: <span className="font-mono">{ref.referral_code}</span> · {format(new Date(ref.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant="outline" className={cn('text-xs capitalize', {
                        'border-green-500/20 text-green-400': ref.status === 'completed',
                        'border-blue-500/20 text-blue-400': ref.status === 'active',
                        'border-amber-500/20 text-amber-400': ref.status === 'pending',
                      })}>
                        {ref.status}
                      </Badge>
                      <span className="text-sm font-medium text-foreground min-w-[60px] text-right">
                        {ref.commission_amount ? `$${ref.commission_amount.toFixed(2)}` : '—'}
                      </span>
                    </div>
                  </div>
                ))}
              </StaggeredList>
            )}
          </GlassPanel>
        </TabsContent>

        {/* ─── Share Tab ─── */}
        <TabsContent value="share" className="space-y-4">
          {/* Main Link */}
          <GlassPanel accent={ACCENT} glow padding="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Link2 className="w-5 h-5 text-green-400" />
              <h3 className="font-semibold text-foreground">Your Affiliate Link</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Earn <span className="text-green-400 font-semibold">{tierBenefits.commissionRate}%</span> commission on every referral's purchases.
            </p>

            <div className="flex gap-2 mb-4">
              <Input
                value={generateAffiliateLink()}
                readOnly
                className="font-mono text-xs bg-white/[0.03] border-white/[0.08]"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopyLink()}
                className="shrink-0 border-white/[0.1]"
              >
                {copiedLink ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <Button variant="outline" size="sm" onClick={() => handleCopyLink()} className="gap-1.5 border-white/[0.1]">
                <Copy className="w-3.5 h-3.5" /> Copy Link
              </Button>
              <Button variant="outline" size="sm" onClick={handleShareTwitter} className="gap-1.5 border-white/[0.1]">
                <ExternalLink className="w-3.5 h-3.5" /> Twitter/X
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-white/[0.1]"
                onClick={() => {
                  const link = generateAffiliateLink('whatsapp');
                  window.open(`https://wa.me/?text=${encodeURIComponent(`Check out Mixxclub — professional mixing, mastering & creator tools: ${link}`)}`, '_blank');
                }}
              >
                <Share2 className="w-3.5 h-3.5" /> WhatsApp
              </Button>
            </div>
          </GlassPanel>

          {/* Campaign Link Generator */}
          <GlassPanel accent={ACCENT_PURPLE} padding="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h3 className="font-semibold text-foreground">Campaign Tracker</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Create tagged links to track which channels drive the most referrals.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Campaign name (e.g. youtube, instagram)"
                value={campaignInput}
                onChange={(e) => setCampaignInput(e.target.value)}
                className="bg-white/[0.03] border-white/[0.08]"
              />
              <Button
                onClick={() => {
                  if (!campaignInput.trim()) {
                    toast.error('Enter a campaign name');
                    return;
                  }
                  handleCopyLink(campaignInput.trim());
                  setCampaignInput('');
                }}
                className="shrink-0 gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" /> Generate
              </Button>
            </div>
          </GlassPanel>

          {/* Payout Info */}
          <GlassPanel accent={ACCENT_GOLD} padding="p-5">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-5 h-5 text-amber-400" />
              <h3 className="font-semibold text-foreground">Payout Status</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-lg font-bold text-foreground">${stats.pendingEarnings.toFixed(2)}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <p className="text-xs text-muted-foreground">Min. Threshold</p>
                <p className="text-lg font-bold text-foreground">$50.00</p>
              </div>
            </div>
            <Button
              className="w-full"
              disabled={stats.pendingEarnings < 50}
            >
              {stats.pendingEarnings >= 50
                ? 'Request Payout'
                : `$${(50 - stats.pendingEarnings).toFixed(2)} more to request payout`}
            </Button>
          </GlassPanel>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReferralDashboard;
