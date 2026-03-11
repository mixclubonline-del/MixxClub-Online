import { useEffect, useState, lazy, Suspense } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type DbProfile = Database['public']['Tables']['profiles']['Row'];
type DbProject = Database['public']['Tables']['projects']['Row'];
type DbAchievement = Database['public']['Tables']['achievements']['Row'];

interface ArtistProject extends DbProject {
  audio_files: { count: number }[];
  engineer: { full_name: string | null; avatar_url: string | null } | null;
}
import { useAuth } from '@/hooks/useAuth';
import { useAdminPreview } from '@/stores/useAdminPreview';
import { useServiceAccess } from '@/hooks/useServiceAccess';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Music, Plus, TrendingUp, Award, Upload, Sparkles, Lock, DollarSign, Headphones } from 'lucide-react';
import { CRMPortal } from '@/components/crm/CRMPortal';
import { EngineerCRMDashboard } from '@/components/crm/EngineerCRMDashboard';
import { AdvancedMixingStudio } from '@/components/mixing/AdvancedMixingStudio';
import { AIMasteringService } from '@/components/mastering/AIMasteringService';
import { LockedServiceTab } from '@/components/crm/LockedServiceTab';
import { CompletedProjectCard } from '@/components/crm/CompletedProjectCard';
import { toast } from 'sonner';
import { JobApplicationManager } from '@/components/crm/JobApplicationManager';
import { JobPostingForm } from '@/components/JobPostingForm';
import { PackagesShop } from '@/components/crm/PackagesShop';
import { RecommendedEngineers } from '@/components/crm/RecommendedEngineers';
import { AIMatchingEngine } from '@/components/ai/AIMatchingEngine';
import { MusicalProfile } from '@/components/crm/MusicalProfile';


import ProfileInsights from '@/components/crm/ProfileInsights';
import SessionManager from '@/components/collaboration/SessionManager';
import CollaborationWorkspace from '@/components/collaboration/CollaborationWorkspace';
import HybridDAW from '@/pages/HybridDAW';
import { ArtistCRMChatbot } from '@/components/crm/ArtistCRMChatbot';
import { ArtistCRMSlideshow } from '@/components/crm/ArtistCRMSlideshow';
import { ArtistAssistantIntro } from '@/components/crm/ArtistAssistantIntro';
import { DistributionWorkflow } from '@/components/crm/DistributionWorkflow';
import { DynamicAppAccessHub } from '@/components/crm/DynamicAppAccessHub';
import { DashboardHub } from '@/components/crm/DashboardHub';
import { OnboardingReminder } from '@/components/crm/OnboardingReminder';
import { isStarterHub } from '@/config/starterFeatures';
import { FeatureGated } from '@/components/backend/FeatureGated';
import { HubSkeleton } from '@/components/crm/design';

// Lazy-loaded hub components for code splitting
const MusicHub = lazy(() => import('@/components/crm/MusicHub').then(m => ({ default: m.MusicHub })));
const StoreHub = lazy(() => import('@/components/crm/StoreHub').then(m => ({ default: m.StoreHub })));
const ActiveWorkHub = lazy(() => import('@/components/crm/ActiveWorkHub').then(m => ({ default: m.ActiveWorkHub })));
const BrandHub = lazy(() => import('@/components/crm/BrandHub').then(m => ({ default: m.BrandHub })));
const RevenueHub = lazy(() => import('@/components/crm/RevenueHub').then(m => ({ default: m.RevenueHub })));
const GrowthHub = lazy(() => import('@/components/crm/growth').then(m => ({ default: m.GrowthHub })));
const CommunityHub = lazy(() => import('@/components/crm/community').then(m => ({ default: m.CommunityHub })));
const MessagingHub = lazy(() => import('@/components/crm/messaging').then(m => ({ default: m.MessagingHub })));
const ClientsHub = lazy(() => import('@/components/crm/clients').then(m => ({ default: m.ClientsHub })));
const MatchesHub = lazy(() => import('@/components/crm/matches/MatchesHub').then(m => ({ default: m.MatchesHub })));
const OpportunitiesHub = lazy(() => import('@/components/crm/opportunities').then(m => ({ default: m.OpportunitiesHub })));
const CollaborativeEarnings = lazy(() => import('@/components/crm/CollaborativeEarnings').then(m => ({ default: m.CollaborativeEarnings })));
const SessionCommandCenter = lazy(() => import('@/components/crm/sessions/SessionCommandCenter').then(m => ({ default: m.SessionCommandCenter })));
const NotificationsHub = lazy(() => import('@/components/crm/notifications').then(m => ({ default: m.NotificationsHub })));
const ScheduleHub = lazy(() => import('@/components/crm/schedule').then(m => ({ default: m.ScheduleHub })));
const TriPartnershipView = lazy(() => import('@/components/crm/partnerships/TriPartnershipView').then(m => ({ default: m.TriPartnershipView })));

const ArtistCRM = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'dashboard';

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  const [profile, setProfile] = useState<DbProfile | null>(null);
  const [projects, setProjects] = useState<ArtistProject[]>([]);
  const [achievements, setAchievements] = useState<DbAchievement[]>([]);
  const [pendingApplications, setPendingApplications] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [showAssistantIntro, setShowAssistantIntro] = useState(false);
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [checkingSlideshow, setCheckingSlideshow] = useState(true);

  const {
    mixingAccess,
    masteringAccess,
    collaborationAccess,
    mixingSubscription,
    masteringSubscription,
    loading: servicesLoading
  } = useServiceAccess();

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

      setCheckingSlideshow(false);
      fetchData();
    };

    checkAccess();
  }, [user, navigate, isPreviewMode]);

  const handleSlideshowComplete = () => {
    if (user) {
      localStorage.setItem(`artist_crm_slideshow_seen_${user.id}`, 'true');
    }
    setShowSlideshow(false);
    setShowAssistantIntro(true); // Show assistant intro after slideshow
  };

  const handleSlideshowSkip = () => {
    if (user) {
      localStorage.setItem(`artist_crm_slideshow_seen_${user.id}`, 'true');
    }
    setShowSlideshow(false);
    setShowAssistantIntro(true); // Show assistant intro even if skipped
  };

  const handleAssistantIntroClose = () => {
    if (user) {
      localStorage.setItem(`artist_assistant_intro_seen_${user.id}`, 'true');
    }
    setShowAssistantIntro(false);
    // Navigate to dashboard after intro
    navigate('/artist-crm?tab=dashboard');
  };

  const handleAssistantNavigate = (tab: string) => {
    if (user) {
      localStorage.setItem(`artist_assistant_intro_seen_${user.id}`, 'true');
    }
    setShowAssistantIntro(false);
    navigate(`/artist-crm?tab=${tab}`);
  };

  const handleOpenChatbot = () => {
    // Chatbot is always visible in the bottom right
    // This just closes the intro
    if (user) {
      localStorage.setItem(`artist_assistant_intro_seen_${user.id}`, 'true');
    }
    setShowAssistantIntro(false);
  };

  const fetchData = async () => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          *,
          audio_files(count),
          engineer:profiles!projects_engineer_id_fkey(full_name, avatar_url)
        `)
        .eq('client_id', user?.id)
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;
      setProjects(projectsData || []);

      const { data: achievementsData, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user?.id)
        .order('earned_at', { ascending: false });

      if (achievementsError) throw achievementsError;
      setAchievements(achievementsData || []);

      const { data: jobs } = await supabase
        .from('job_postings')
        .select('id')
        .eq('artist_id', user?.id);

      const jobIds = jobs?.map(j => j.id) || [];

      if (jobIds.length > 0) {
        const { data: applicationsData } = await supabase
          .from('job_applications')
          .select('id')
          .eq('status', 'pending')
          .in('job_id', jobIds);

        setPendingApplications(applicationsData?.length || 0);
      }
    } catch (error: unknown) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading || servicesLoading || checkingSlideshow) {
    return (
      <div className="min-h-screen p-6 md:p-10 space-y-6">
        <HubSkeleton variant="stats" count={4} />
        <HubSkeleton variant="tabs" count={5} />
      </div>
    );
  }

  // Show slideshow first, then assistant intro
  if (showSlideshow) {
    return (
      <ArtistCRMSlideshow
        onComplete={handleSlideshowComplete}
        onSkip={handleSlideshowSkip}
      />
    );
  }

  // Show assistant intro after slideshow
  if (showAssistantIntro) {
    return (
      <ArtistAssistantIntro
        open={showAssistantIntro}
        onClose={handleAssistantIntroClose}
        onNavigate={handleAssistantNavigate}
        onOpenChatbot={handleOpenChatbot}
      />
    );
  }

  const stats = [
    {
      icon: <Music className="w-4 h-4 text-primary" />,
      label: 'Sessions',
      value: projects.length,
      color: 'bg-primary/10'
    },
    {
      icon: <TrendingUp className="w-4 h-4 text-green-500" />,
      label: 'Released',
      value: projects.filter(p => p.status === 'completed').length,
      color: 'bg-green-500/10'
    },
    {
      icon: <Award className="w-4 h-4 text-yellow-500" />,
      label: 'Badges',
      value: achievements.length,
      color: 'bg-yellow-500/10'
    },
    {
      icon: <DollarSign className="w-4 h-4 text-blue-500" />,
      label: 'In Progress',
      value: projects.filter(p => p.status === 'in_progress').length,
      color: 'bg-blue-500/10'
    },
  ];

  const quickActions = [
    {
      label: 'New Project',
      icon: <Plus className="w-4 h-4" />,
      onClick: () => navigate('/artist-crm?tab=active-work'),
    },
    {
      label: 'Book Session',
      icon: mixingAccess ? <Upload className="w-4 h-4" /> : <Lock className="w-4 h-4" />,
      onClick: () => navigate('/artist-crm?tab=opportunities'),
    },
    {
      label: 'AI Master',
      icon: masteringAccess ? <Sparkles className="w-4 h-4" /> : <Lock className="w-4 h-4" />,
      onClick: () => navigate('/mixing-showcase'),
    },
  ];

  const gated = (tabId: string, content: React.ReactNode) => {
    if (isStarterHub('artist', tabId)) return content;
    return (
      <FeatureGated feature={tabId} userId={user?.id || ''} communityGated communityMilestoneKey={tabId}>
        {content}
      </FeatureGated>
    );
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'mastering':
        return <AIMasteringService subscription={masteringSubscription || null} />;

      case 'music':
        return <MusicHub />;

      case 'clients':
        return gated('clients', <ClientsHub userType="artist" />);

      case 'matches':
        return gated('matches', <MatchesHub userType="artist" />);

      case 'sessions':
        return gated('sessions', <SessionCommandCenter userType="artist" />);
      case 'active-work':
        return gated('active-work', <ActiveWorkHub />);

      case 'store':
        return gated('store', <StoreHub />);

      case 'opportunities':
        return gated('opportunities', <OpportunitiesHub userRole="client" />);

      case 'business':
        return gated('business', (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Packages & Services</h2>
              <p className="text-muted-foreground">Upgrade your studio capabilities</p>
            </div>
            <PackagesShop />

            {masteringAccess ? (
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">AI Mastering Studio</h3>
                <AIMasteringService subscription={masteringSubscription} />
              </div>
            ) : (
              <div className="mt-8">
                <LockedServiceTab
                  serviceName="AI Mastering"
                  serviceType="mastering"
                  description="Upgrade to access AI-powered mastering"
                  features={[
                    "AI neural mastering engine",
                    "Platform optimization",
                    "Real-time analysis",
                    "Instant preview"
                  ]}
                />
              </div>
            )}
          </div>
        ));

      case 'profile':
        return gated('profile', <BrandHub />);

      case 'revenue':
        return gated('revenue', <RevenueHub userType="artist" userId={user?.id} />);

      case 'community':
        return gated('community', <CommunityHub userType="artist" />);

      case 'growth':
        return gated('growth', <GrowthHub />);

      case 'messages':
        return gated('messages', <MessagingHub userType="artist" />);

      case 'earnings':
        return gated('earnings', <CollaborativeEarnings userType="artist" />);

      case 'tri-collabs':
        return gated('tri-collabs', <TriPartnershipView userType="artist" />);

      case 'notifications':
        return gated('notifications', <NotificationsHub />);

      case 'schedule':
        return gated('schedule', <ScheduleHub />);

      default:
        return (
          <>
            <OnboardingReminder userType="artist" />
            <DashboardHub />
          </>
        );
    }
  };

  return (
    <ErrorBoundary>
      <CRMPortal
        userType="artist"
        profile={profile}
        stats={stats}
        quickActions={quickActions}
        activeTab={currentTab}
        onTabChange={handleTabChange}
      >
        {renderContent()}
      </CRMPortal>
      <ArtistCRMChatbot />
    </ErrorBoundary>
  );
};

export default ArtistCRM;
