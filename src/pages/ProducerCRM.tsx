import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
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

// Producer-specific hubs
import { ProducerDashboardHub } from '@/components/crm/producer/ProducerDashboardHub';
import { ProducerCatalogHub } from '@/components/crm/producer/ProducerCatalogHub';
import { ProducerSalesHub } from '@/components/crm/producer/ProducerSalesHub';
import { ProducerCollabsHub } from '@/components/crm/producer/ProducerCollabsHub';
import { ProducerRevenueHub } from '@/components/crm/producer/ProducerRevenueHub';

// Shared CRM hubs
import { ClientsHub } from '@/components/crm/clients/ClientsHub';
import { MatchesHub } from '@/components/crm/matches/MatchesHub';
import { SessionCommandCenter } from '@/components/crm/sessions/SessionCommandCenter';
import { ActiveWorkHub } from '@/components/crm/ActiveWorkHub';
import { MessagingHub } from '@/components/crm/messaging/MessagingHub';
import { CollaborativeEarnings } from '@/components/crm/CollaborativeEarnings';
import { CommunityHub } from '@/components/crm/CommunityHub';
import { GrowthHub } from '@/components/crm/GrowthHub';
import { BrandHub } from '@/components/crm/BrandHub';
import { RevenueHub } from '@/components/crm/RevenueHub';
import { TriPartnershipView } from '@/components/crm/partnerships/TriPartnershipView';

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
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';

  const [profile, setProfile] = useState<DbProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [beatCount, setBeatCount] = useState(0);
  const [salesCount, setSalesCount] = useState(0);
  const [collabCount, setCollabCount] = useState(0);
  const [showGoLive, setShowGoLive] = useState(false);

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      // Fetch real profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch beat count from projects (producer-created)
      const { data: beats } = await supabase
        .from('projects')
        .select('id')
        .eq('client_id', user?.id);
      setBeatCount(beats?.length || 0);

      // Fetch partnerships count
      const { data: partnerships } = await supabase
        .from('partnerships')
        .select('id')
        .or(`artist_id.eq.${user?.id},engineer_id.eq.${user?.id}`)
        .eq('status', 'active');
      setCollabCount(partnerships?.length || 0);

      // Fetch completed projects as sales proxy
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
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

  const renderContent = () => {
    switch (activeTab) {
      case 'catalog':
        return (
          <div className="space-y-6">
            <ProducerCatalogHub />
            <BeatSessionLauncher />
          </div>
        );
      case 'sales':
        return <ProducerSalesHub />;
      case 'collabs':
        return <ProducerCollabsHub />;
      case 'clients':
        return <ClientsHub userType="artist" />;
      case 'matches':
        return (
          <div className="space-y-6">
            <AICollabPipeline userType="producer" />
            <MatchesHub userType="artist" />
          </div>
        );
      case 'sessions':
        return <SessionCommandCenter userType="producer" />;
      case 'active-work':
        return <ActiveWorkHub />;
      case 'messages':
        return <MessagingHub userType="producer" />;
      case 'earnings':
        return (
          <div className="space-y-6">
            <AutoSplitDashboard userType="producer" />
            <CollaborativeEarnings userType="producer" />
          </div>
        );
      case 'revenue':
        return <RevenueHub userType="producer" userId={user?.id} />;
      case 'community':
        return <CommunityHub userType="producer" />;
      case 'growth':
        return <GrowthHub userType="producer" />;
      case 'profile':
        return <BrandHub />;
      case 'tri-collabs':
        return <TriPartnershipView userType="producer" />;
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
        {renderContent()}
      </CRMPortal>
      <ProducerGoLiveModal open={showGoLive} onOpenChange={setShowGoLive} />
    </ErrorBoundary>
  );
};

export default ProducerCRM;