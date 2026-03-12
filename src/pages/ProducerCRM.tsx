import { useState, useEffect, lazy, Suspense } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePartnershipNotifications } from '@/hooks/usePartnershipNotifications';
import { supabase } from '@/integrations/supabase/client';
import { CRMPortal } from '@/components/crm/CRMPortal';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import {
  Disc3,
  ShoppingBag,
  Users,
  TrendingUp,
  Upload,
  Sparkles,
  DollarSign,
  Radio,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAdminPreview } from '@/stores/useAdminPreview';
import { isStarterHub } from '@/config/starterFeatures';
import { FeatureGated } from '@/components/backend/FeatureGated';
import { AIMasteringService } from '@/components/mastering/AIMasteringService';

// Producer-specific hubs
import { ProducerDashboardHub } from '@/components/crm/producer/ProducerDashboardHub';
import { HubSkeleton } from '@/components/crm/design';
import { ProducerCRMSlideshow } from '@/components/crm/ProducerCRMSlideshow';
import { ProducerAssistantIntro } from '@/components/crm/ProducerAssistantIntro';

// Lazy-loaded hub components for code splitting
const ProducerCatalogHub = lazy(() => import('@/components/crm/producer/ProducerCatalogHub').then(m => ({ default: m.ProducerCatalogHub })));
const ProducerSalesHub = lazy(() => import('@/components/crm/producer/ProducerSalesHub').then(m => ({ default: m.ProducerSalesHub })));
const ProducerCollabsHub = lazy(() => import('@/components/crm/producer/ProducerCollabsHub').then(m => ({ default: m.ProducerCollabsHub })));
const ProducerRevenueHub = lazy(() => import('@/components/crm/producer/ProducerRevenueHub').then(m => ({ default: m.ProducerRevenueHub })));
const ClientsHub = lazy(() => import('@/components/crm/clients/ClientsHub').then(m => ({ default: m.ClientsHub })));
const MatchesHub = lazy(() => import('@/components/crm/matches/MatchesHub').then(m => ({ default: m.MatchesHub })));
const SessionCommandCenter = lazy(() => import('@/components/crm/sessions/SessionCommandCenter').then(m => ({ default: m.SessionCommandCenter })));
const ActiveWorkHub = lazy(() => import('@/components/crm/ActiveWorkHub').then(m => ({ default: m.ActiveWorkHub })));
const MessagingHub = lazy(() => import('@/components/crm/messaging/MessagingHub').then(m => ({ default: m.MessagingHub })));
const CollaborativeEarnings = lazy(() => import('@/components/crm/CollaborativeEarnings').then(m => ({ default: m.CollaborativeEarnings })));
const CommunityHub = lazy(() => import('@/components/crm/community').then(m => ({ default: m.CommunityHub })));
const GrowthHub = lazy(() => import('@/components/crm/GrowthHub').then(m => ({ default: m.GrowthHub })));
const BrandHub = lazy(() => import('@/components/crm/BrandHub').then(m => ({ default: m.BrandHub })));
const RevenueHub = lazy(() => import('@/components/crm/RevenueHub').then(m => ({ default: m.RevenueHub })));
const TriPartnershipView = lazy(() => import('@/components/crm/partnerships/TriPartnershipView').then(m => ({ default: m.TriPartnershipView })));
const NotificationsHub = lazy(() => import('@/components/crm/notifications').then(m => ({ default: m.NotificationsHub })));
const ScheduleHub = lazy(() => import('@/components/crm/schedule').then(m => ({ default: m.ScheduleHub })));

// Go Live
import { ProducerGoLiveModal } from '@/components/live/ProducerGoLiveModal';
// Beat Pipeline
import { BeatSessionLauncher } from '@/components/producer/BeatSessionLauncher';
// Phase 4: AI Collab Pipeline + Auto-Split Revenue
import { AICollabPipeline } from '@/components/producer/AICollabPipeline';
import { AutoSplitDashboard } from '@/components/crm/revenue/AutoSplitDashboard';

interface DbProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  tagline?: string | null;
  role?: string | null;
}

const ProducerCRM = () => {
  const { user } = useAuth();
  usePartnershipNotifications(user?.id);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';

  const [profile, setProfile] = useState<DbProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [beatCount, setBeatCount] = useState(0);
  const [salesCount, setSalesCount] = useState(0);
  const [collabCount, setCollabCount] = useState(0);
  const [showGoLive, setShowGoLive] = useState(false);
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [showAssistantIntro, setShowAssistantIntro] = useState(false);

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  const { isPreviewMode } = useAdminPreview();

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) return;

      // Check if user is admin - admins should use admin panel (unless previewing)
      if (!isPreviewMode) {
        const { data: isAdmin } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin'
        });

        if (isAdmin) {
          toast.error('Please use the Admin Panel');
          navigate('/admin');
          return;
        }
      }

      // Check if slideshow has been seen
      const slideshowSeen = localStorage.getItem(`producer_crm_slideshow_seen_${user.id}`);
      const introSeen = localStorage.getItem(`producer_assistant_intro_seen_${user.id}`);

      if (!slideshowSeen) {
        setShowSlideshow(true);
      } else if (!introSeen) {
        setShowAssistantIntro(true);
      }

      fetchData();
    };

    checkAccess();
  }, [user, navigate, isPreviewMode]);

  const handleSlideshowComplete = () => {
    if (user) localStorage.setItem(`producer_crm_slideshow_seen_${user.id}`, 'true');
    setShowSlideshow(false);
    setShowAssistantIntro(true);
  };

  const handleSlideshowSkip = () => {
    if (user) localStorage.setItem(`producer_crm_slideshow_seen_${user.id}`, 'true');
    setShowSlideshow(false);
    setShowAssistantIntro(true);
  };

  const handleAssistantIntroClose = () => {
    if (user) localStorage.setItem(`producer_assistant_intro_seen_${user.id}`, 'true');
    setShowAssistantIntro(false);
    navigate('/producer-crm?tab=dashboard');
  };

  const handleAssistantNavigate = (tab: string) => {
    if (user) localStorage.setItem(`producer_assistant_intro_seen_${user.id}`, 'true');
    setShowAssistantIntro(false);
    navigate(`/producer-crm?tab=${tab}`);
  };

  const handleOpenChatbot = () => {
    if (user) localStorage.setItem(`producer_assistant_intro_seen_${user.id}`, 'true');
    setShowAssistantIntro(false);
  };

  const fetchData = async () => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();

      if (profileError) throw profileError;
      setProfile(profileData);

      const { data: beats } = await supabase
        .from('projects')
        .select('id')
        .eq('client_id', user?.id);
      setBeatCount(beats?.length || 0);

      const { data: partnerships } = await supabase
        .from('partnerships')
        .select('id')
        .or(`artist_id.eq.${user?.id},engineer_id.eq.${user?.id}`)
        .eq('status', 'active');
      setCollabCount(partnerships?.length || 0);

      const { data: completedProjects } = await supabase
        .from('projects')
        .select('id')
        .eq('client_id', user?.id)
        .eq('status', 'completed');
      setSalesCount(completedProjects?.length || 0);
    } catch (error: unknown) {
      console.error('Error fetching producer data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (showSlideshow) {
    return (
      <ProducerCRMSlideshow
        onComplete={handleSlideshowComplete}
        onSkip={handleSlideshowSkip}
      />
    );
  }

  if (showAssistantIntro) {
    return (
      <ProducerAssistantIntro
        open={showAssistantIntro}
        onClose={handleAssistantIntroClose}
        onNavigate={handleAssistantNavigate}
        onOpenChatbot={handleOpenChatbot}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen p-6 md:p-10 space-y-6">
        <HubSkeleton variant="stats" count={4} />
        <HubSkeleton variant="tabs" count={5} />
      </div>
    );
  }

  const stats = [
    { icon: <Disc3 className="w-4 h-4 text-amber-500" />, label: 'Beats', value: beatCount, color: 'bg-amber-500/10' },
    { icon: <ShoppingBag className="w-4 h-4 text-green-500" />, label: 'Sales', value: salesCount, color: 'bg-green-500/10' },
    { icon: <TrendingUp className="w-4 h-4 text-blue-500" />, label: 'Projects', value: beatCount, color: 'bg-blue-500/10' },
    { icon: <Users className="w-4 h-4 text-purple-500" />, label: 'Collabs', value: collabCount, color: 'bg-purple-500/10' },
  ];

  const quickActions = [
    {
      label: 'Upload Beat',
      icon: <Upload className="w-4 h-4" />,
      onClick: () => handleTabChange('catalog'),
      variant: 'default' as const,
    },
    {
      label: 'Go Live',
      icon: <Radio className="w-4 h-4" />,
      onClick: () => setShowGoLive(true),
      variant: 'outline' as const,
    },
    {
      label: 'Find Artists',
      icon: <Sparkles className="w-4 h-4" />,
      onClick: () => handleTabChange('matches'),
      variant: 'outline' as const,
    },
  ];

  const gated = (tabId: string, content: React.ReactNode) => {
    if (isStarterHub('producer', tabId)) return content;
    return (
      <FeatureGated feature={tabId} userId={user?.id || ''} communityGated communityMilestoneKey={tabId}>
        {content}
      </FeatureGated>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'mastering':
        return <AIMasteringService subscription={null} />;
      case 'catalog':
        return (
          <div className="space-y-6">
            <ProducerCatalogHub />
            <BeatSessionLauncher />
          </div>
        );
      case 'sales':
        return gated('sales', <ProducerSalesHub />);
      case 'collabs':
        return gated('collabs', <ProducerCollabsHub />);
      case 'clients':
        return gated('clients', <ClientsHub userType="artist" />);
      case 'matches':
        return gated('matches', (
          <div className="space-y-6">
            <AICollabPipeline userType="producer" />
            <MatchesHub userType="artist" />
          </div>
        ));
      case 'sessions':
        return gated('sessions', <SessionCommandCenter userType="producer" />);
      case 'active-work':
        return gated('active-work', <ActiveWorkHub />);
      case 'messages':
        return gated('messages', <MessagingHub userType="producer" />);
      case 'earnings':
        return gated('earnings', (
          <div className="space-y-6">
            <AutoSplitDashboard userType="producer" />
            <CollaborativeEarnings userType="producer" />
          </div>
        ));
      case 'revenue':
        return gated('revenue', <RevenueHub userType="producer" userId={user?.id} />);
      case 'community':
        return gated('community', <CommunityHub userType="producer" />);
      case 'growth':
        return gated('growth', <GrowthHub userType="producer" />);
      case 'profile':
        return gated('profile', <BrandHub />);
      case 'tri-collabs':
        return gated('tri-collabs', <TriPartnershipView userType="producer" />);
      case 'notifications':
        return gated('notifications', <NotificationsHub />);
      case 'schedule':
        return gated('schedule', <ScheduleHub />);
      case 'dashboard':
      default:
        return <ProducerDashboardHub />;
    }
  };

  return (
    <ErrorBoundary>
      <CRMPortal
        userType="producer"
        profile={profile}
        stats={stats}
        quickActions={quickActions}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      >
        <Suspense fallback={<HubSkeleton variant="cards" count={4} />}>
          {renderContent()}
        </Suspense>
      </CRMPortal>
      <ProducerGoLiveModal open={showGoLive} onOpenChange={setShowGoLive} />
    </ErrorBoundary>
  );
};

export default ProducerCRM;
