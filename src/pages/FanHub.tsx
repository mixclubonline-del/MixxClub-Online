/**
 * FanHub — The fully realized Fan CRM dashboard.
 * 
 * 9 tabs with lazy-loaded components for optimal code splitting.
 */

import { lazy, Suspense, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdminPreview } from '@/stores/useAdminPreview';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useFanStats } from '@/hooks/useFanStats';
import { CRMPortal } from '@/components/crm/CRMPortal';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { HubSkeleton } from '@/components/crm/design';
import {
  Heart,
  Star,
  Coins,
  Compass,
  Sparkles,
} from 'lucide-react';
import { isStarterHub } from '@/config/starterFeatures';
import { FeatureGated } from '@/components/backend/FeatureGated';

// Lazy-loaded fan hub components
const FanFeedHub = lazy(() => import('@/components/crm/fan/FanFeedHub').then(m => ({ default: m.FanFeedHub })));
const FanDay1sHub = lazy(() => import('@/components/crm/fan/FanDay1sHub').then(m => ({ default: m.FanDay1sHub })));
const FanCommunitiesHub = lazy(() => import('@/components/crm/fan/FanCommunitiesHub').then(m => ({ default: m.FanCommunitiesHub })));
const FanDropsHub = lazy(() => import('@/components/crm/fan/FanDropsHub').then(m => ({ default: m.FanDropsHub })));
const FanConnectHub = lazy(() => import('@/components/crm/fan/FanConnectHub').then(m => ({ default: m.FanConnectHub })));
const FanMissionsHub = lazy(() => import('@/components/crm/fan/FanMissionsHub').then(m => ({ default: m.FanMissionsHub })));
const FanWalletHub = lazy(() => import('@/components/crm/fan/FanWalletHub').then(m => ({ default: m.FanWalletHub })));
const FanTrophiesHub = lazy(() => import('@/components/crm/fan/FanTrophiesHub').then(m => ({ default: m.FanTrophiesHub })));
const FanCuratorHub = lazy(() => import('@/components/crm/fan/FanCuratorHub').then(m => ({ default: m.FanCuratorHub })));

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
    <ErrorBoundary>
      <CRMPortal
        userType="fan"
        profile={profile}
        stats={headerStats}
        quickActions={quickActions}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      >
        <Suspense fallback={<HubSkeleton variant="cards" count={4} />}>
          {renderContent()}
        </Suspense>
      </CRMPortal>
    </ErrorBoundary>
  );
};

export default FanHub;
