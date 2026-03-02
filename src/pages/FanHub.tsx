/**
 * FanHub — The fully realized Fan CRM dashboard.
 * 
 * 9 tabs delivering every promise from the ForFans landing page:
 * 1. Feed (Discover) — AI-curated artist discovery
 * 2. Day 1s — Early artist support with OG proof
 * 3. Communities — Artist circles, listening parties, taste groups
 * 4. Drops — Release calendar, alerts, exclusive content
 * 5. Connect — Tiered DMs, creative voting, meet & greets
 * 6. Missions — Streaks, challenges, referrals (existing)
 * 7. Wallet — MixxCoinz balance, tiers, transactions (existing)
 * 8. Trophies — Achievement wall, badges, leaderboard
 * 9. Curator — Promotion requests, premiere slots, earnings (existing)
 */

import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useFanStats } from '@/hooks/useFanStats';
import { CRMPortal } from '@/components/crm/CRMPortal';
import {
  Heart,
  Star,
  Coins,
  Compass,
  Sparkles,
  Users,
  Bell,
  MessageCircle,
  Trophy,
  Headphones,
  Zap,
} from 'lucide-react';
import { FanFeedHub } from '@/components/crm/fan/FanFeedHub';
import { FanDay1sHub } from '@/components/crm/fan/FanDay1sHub';
import { FanCommunitiesHub } from '@/components/crm/fan/FanCommunitiesHub';
import { FanDropsHub } from '@/components/crm/fan/FanDropsHub';
import { FanConnectHub } from '@/components/crm/fan/FanConnectHub';
import { FanMissionsHub } from '@/components/crm/fan/FanMissionsHub';
import { FanWalletHub } from '@/components/crm/fan/FanWalletHub';
import { FanTrophiesHub } from '@/components/crm/fan/FanTrophiesHub';
import { FanCuratorHub } from '@/components/crm/fan/FanCuratorHub';
import { isStarterHub } from '@/config/starterFeatures';
import { FeatureGated } from '@/components/backend/FeatureGated';

const FanHub = () => {
  const { user } = useAuth();
  const { stats, currentTier, streakMultiplier } = useFanStats();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'feed';

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  const profile = {
    id: user?.id,
    full_name: user?.user_metadata?.full_name || 'Fan',
    avatar_url: user?.user_metadata?.avatar_url || null,
    tagline: `${currentTier.charAt(0).toUpperCase() + currentTier.slice(1)} • ${streakMultiplier}x streak multiplier`,
  };

  // Real stats from useFanStats — no zeros, no mocks
  const headerStats = [
    {
      icon: <Star className="w-4 h-4" />,
      label: 'Day 1s',
      value: stats?.day1_badges || 0,
      color: 'text-yellow-500',
    },
    {
      icon: <Heart className="w-4 h-4" />,
      label: 'Following',
      value: stats?.artists_supported || 0,
      color: 'text-pink-500',
    },
    {
      icon: <Coins className="w-4 h-4" />,
      label: 'MixxCoinz',
      value: stats?.mixxcoinz_earned || 0,
      color: 'text-amber-500',
    },
    {
      icon: <Sparkles className="w-4 h-4" />,
      label: 'Streak',
      value: stats?.engagement_streak || 0,
      color: 'text-purple-500',
    },
  ];

  const quickActions = [
    {
      label: 'Discover Artists',
      icon: <Compass className="w-4 h-4" />,
      onClick: () => handleTabChange('feed'),
      variant: 'default' as const,
    },
    {
      label: 'Earn Coinz',
      icon: <Coins className="w-4 h-4" />,
      onClick: () => handleTabChange('missions'),
      variant: 'outline' as const,
    },
  ];

  const gated = (tabId: string, content: React.ReactNode) => {
    if (isStarterHub('fan', tabId)) return content;
    return (
      <FeatureGated feature={tabId} userId={user?.id || ''} communityGated communityMilestoneKey={tabId}>
        {content}
      </FeatureGated>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'feed':
        return <FanFeedHub />;
      case 'day1s':
        return <FanDay1sHub />;
      case 'communities':
        return gated('communities', <FanCommunitiesHub />);
      case 'drops':
        return <FanDropsHub />;
      case 'connect':
        return gated('connect', <FanConnectHub />);
      case 'missions':
        return <FanMissionsHub />;
      case 'wallet':
        return gated('wallet', <FanWalletHub />);
      case 'trophies':
        return <FanTrophiesHub />;
      case 'curator':
        return gated('curator', <FanCuratorHub />);
      default:
        return <FanFeedHub />;
    }
  };

  return (
    <CRMPortal
      userType="fan"
      profile={profile}
      stats={headerStats}
      quickActions={quickActions}
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      {renderContent()}
    </CRMPortal>
  );
};

export default FanHub;