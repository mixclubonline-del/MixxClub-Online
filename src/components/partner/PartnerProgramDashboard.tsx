/**
 * PartnerProgramDashboard Component
 * Full user-facing partner dashboard with tabs for overview, referrals, earnings, links, and benefits
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Link2, 
  Gift,
  Copy,
  ExternalLink,
  CheckCircle2,
  Clock,
  XCircle,
  LayoutDashboard,
  History,
  Wallet,
  Star
} from 'lucide-react';
import { usePartnerProgram, TIER_CONFIG, Referral } from '@/hooks/usePartnerProgram';
import TierProgressionCard from './TierProgressionCard';
import PartnerOnboarding from './PartnerOnboarding';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const PartnerProgramDashboard: React.FC = () => {
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

  const [campaignName, setCampaignName] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = (campaign?: string) => {
    const link = generateAffiliateLink(campaign);
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <XCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: 'bg-green-500/10 text-green-500 border-green-500/20',
      completed: 'bg-green-500/10 text-green-500 border-green-500/20',
      pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    };
    return variants[status] || 'bg-muted text-muted-foreground';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading partner data...</div>
      </div>
    );
  }

  // Show onboarding if not a partner
  if (!isPartner) {
    return <PartnerOnboarding onJoin={joinProgram} isJoining={isJoining} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Partner Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {tier.charAt(0).toUpperCase() + tier.slice(1)} Partner!
          </p>
        </div>
        <Badge 
          variant="outline" 
          className={cn(
            'bg-gradient-to-r text-white border-0 px-4 py-1.5',
            TIER_CONFIG[tier].color
          )}
        >
          <span className="mr-1">{TIER_CONFIG[tier].icon}</span>
          {TIER_CONFIG[tier].name} Tier
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalReferrals}</p>
                <p className="text-xs text-muted-foreground">Total Referrals</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">${stats.totalEarned.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Total Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">${stats.pendingEarnings.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <TrendingUp className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.conversionRate}%</p>
                <p className="text-xs text-muted-foreground">Conversion</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="overview" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="referrals" className="gap-2">
            <History className="h-4 w-4" />
            Referrals
          </TabsTrigger>
          <TabsTrigger value="earnings" className="gap-2">
            <Wallet className="h-4 w-4" />
            Earnings
          </TabsTrigger>
          <TabsTrigger value="links" className="gap-2">
            <Link2 className="h-4 w-4" />
            Links
          </TabsTrigger>
          <TabsTrigger value="benefits" className="gap-2">
            <Star className="h-4 w-4" />
            Benefits
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <TierProgressionCard
              currentTier={tier}
              totalReferrals={stats.totalReferrals}
              nextTier={nextTier}
              tierProgress={tierProgress}
            />
            
            {/* Quick Share */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Link2 className="h-5 w-5 text-primary" />
                  Your Affiliate Link
                </CardTitle>
                <CardDescription>
                  Share this link to earn {tierBenefits.commissionRate}% on referrals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input 
                    value={partner?.affiliate_code || ''} 
                    readOnly 
                    className="font-mono bg-muted/50"
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleCopyLink()}
                  >
                    {copiedLink ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleCopyLink()}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a 
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out MixClub - the ultimate platform for music creators! ${generateAffiliateLink('twitter')}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Share
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Recent Referrals</CardTitle>
            </CardHeader>
            <CardContent>
              {referralHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No referrals yet. Share your link to get started!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {referralHistory.slice(0, 5).map((referral) => (
                    <div 
                      key={referral.id} 
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(referral.status)}
                        <div>
                          <p className="text-sm font-medium">
                            {referral.referred_user?.full_name || 'Anonymous User'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(referral.created_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className={getStatusBadge(referral.status)}>
                          {referral.status}
                        </Badge>
                        {referral.commission_amount && (
                          <p className="text-sm font-medium text-green-500 mt-1">
                            +${referral.commission_amount.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Referrals Tab */}
        <TabsContent value="referrals">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle>Referral History</CardTitle>
              <CardDescription>
                Track all your referrals and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {referralHistory.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No referrals yet</p>
                  <p className="text-sm">Share your affiliate link to start earning commissions</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {referralHistory.map((referral) => (
                    <div 
                      key={referral.id} 
                      className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {getStatusIcon(referral.status)}
                        <div>
                          <p className="font-medium">
                            {referral.referred_user?.full_name || 'Pending Signup'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Code: {referral.referral_code}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(referral.created_at), 'MMM d, yyyy h:mm a')}
                        </p>
                        <Badge variant="outline" className={getStatusBadge(referral.status)}>
                          {referral.status}
                        </Badge>
                        <p className="font-medium min-w-[80px] text-right">
                          {referral.commission_amount 
                            ? `$${referral.commission_amount.toFixed(2)}` 
                            : '-'
                          }
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Earnings Tab */}
        <TabsContent value="earnings">
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
              <CardContent className="p-6">
                <DollarSign className="h-8 w-8 text-green-500 mb-2" />
                <p className="text-3xl font-bold">${stats.totalEarned.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Total Earned</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
              <CardContent className="p-6">
                <Clock className="h-8 w-8 text-yellow-500 mb-2" />
                <p className="text-3xl font-bold">${stats.pendingEarnings.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Pending Payout</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
              <CardContent className="p-6">
                <TrendingUp className="h-8 w-8 text-blue-500 mb-2" />
                <p className="text-3xl font-bold">{tierBenefits.commissionRate}%</p>
                <p className="text-sm text-muted-foreground">Your Rate</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle>Payout Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                  <p className="text-sm text-muted-foreground mb-2">Minimum Payout Threshold</p>
                  <p className="text-lg font-medium">$50.00</p>
                </div>
                <Button 
                  className="w-full" 
                  disabled={stats.pendingEarnings < 50}
                >
                  {stats.pendingEarnings >= 50 
                    ? 'Request Payout' 
                    : `$${(50 - stats.pendingEarnings).toFixed(2)} more to request payout`
                  }
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Links Tab */}
        <TabsContent value="links">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle>Affiliate Links</CardTitle>
              <CardDescription>
                Create custom campaign links to track your marketing efforts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main Link */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Your Affiliate Link</label>
                <div className="flex gap-2">
                  <Input 
                    value={generateAffiliateLink()} 
                    readOnly 
                    className="font-mono text-sm bg-muted/50"
                  />
                  <Button onClick={() => handleCopyLink()}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </div>

              {/* Campaign Link Generator */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Create Campaign Link</label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Campaign name (e.g., youtube, instagram)"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                  />
                  <Button 
                    onClick={() => {
                      if (campaignName) {
                        handleCopyLink(campaignName);
                        setCampaignName('');
                      }
                    }}
                    disabled={!campaignName}
                  >
                    Generate & Copy
                  </Button>
                </div>
                {campaignName && (
                  <p className="text-xs text-muted-foreground font-mono">
                    Preview: {generateAffiliateLink(campaignName)}
                  </p>
                )}
              </div>

              {/* Quick Share Buttons */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Quick Share</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['Twitter', 'Facebook', 'LinkedIn', 'Email'].map((platform) => (
                    <Button key={platform} variant="outline" size="sm">
                      Share on {platform}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Benefits Tab */}
        <TabsContent value="benefits">
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(TIER_CONFIG).map(([key, tierConfig]) => {
              const isCurrentTier = key === tier;
              const tierIndex = Object.keys(TIER_CONFIG).indexOf(key);
              const currentTierIndex = Object.keys(TIER_CONFIG).indexOf(tier);
              const isUnlocked = tierIndex <= currentTierIndex;

              return (
                <Card 
                  key={key} 
                  className={cn(
                    'relative overflow-hidden transition-all',
                    isCurrentTier && 'ring-2 ring-primary',
                    !isUnlocked && 'opacity-60'
                  )}
                >
                  {isCurrentTier && (
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium">
                      Current
                    </div>
                  )}
                  <CardHeader className={cn(
                    'bg-gradient-to-r text-white',
                    tierConfig.color
                  )}>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{tierConfig.icon}</span>
                      <div>
                        <CardTitle className="text-white">{tierConfig.name}</CardTitle>
                        <CardDescription className="text-white/80">
                          {tierConfig.commissionRate}% commission
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ul className="space-y-2">
                      {tierConfig.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className={cn(
                            'h-4 w-4',
                            isUnlocked ? 'text-green-500' : 'text-muted-foreground'
                          )} />
                          <span className={!isUnlocked ? 'text-muted-foreground' : ''}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PartnerProgramDashboard;
