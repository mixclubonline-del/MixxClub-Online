import { useEffect, useState } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useServiceAccess } from '@/hooks/useServiceAccess';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Music, Plus, TrendingUp, Award, Upload, Sparkles, Lock, DollarSign, Headphones } from 'lucide-react';
import { CRMLayout } from '@/components/crm/CRMLayout';
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
import ProfileEditor from '@/components/crm/ProfileEditor';
import ProfileInsights from '@/components/crm/ProfileInsights';
import SessionManager from '@/components/collaboration/SessionManager';
import CollaborationWorkspace from '@/components/collaboration/CollaborationWorkspace';
import { RealTimeCollaboration } from '@/components/RealTimeCollaboration';
import StudioHub from '@/components/studio/StudioHub';
import { ArtistCRMChatbot } from '@/components/crm/ArtistCRMChatbot';
import { ArtistCRMSlideshow } from '@/components/crm/ArtistCRMSlideshow';
import { ArtistAssistantIntro } from '@/components/crm/ArtistAssistantIntro';
import { DistributionWorkflow } from '@/components/crm/DistributionWorkflow';
import { DynamicAppAccessHub } from '@/components/crm/DynamicAppAccessHub';
import { ActiveWorkHub } from '@/components/crm/ActiveWorkHub';
import { DashboardHub } from '@/components/crm/DashboardHub';
import { OpportunitiesHub } from '@/components/crm/OpportunitiesHub';
import { YourMatches } from '@/components/crm/YourMatches';
import { Profile3DSection } from '@/components/crm/dashboard/Profile3DSection';
import { Interactive3DShowcase } from '@/components/3d/r3f/Interactive3DShowcase';
import { Suspense, lazy } from 'react';

const Stats3DChart = lazy(() => import('@/components/3d/r3f/Stats3DChart').then(m => ({ default: m.Stats3DChart })));
const Globe3D = lazy(() => import('@/components/3d/r3f/Globe3D').then(m => ({ default: m.Globe3D })));

const ArtistCRM = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'dashboard';
  
  const [profile, setProfile] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
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

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        navigate('/auth');
        return;
      }

      // Check if user is admin - admins should use admin panel
      const { data: isAdmin } = await supabase.rpc('is_admin', { 
        user_uuid: user.id 
      });

      if (isAdmin) {
        toast.error('Please use the Admin Panel');
        navigate('/admin');
        return;
      }

      // Check if slideshow should be shown first
      const slideshowKey = `artist_crm_slideshow_seen_${user.id}`;
      const slideshowSeen = localStorage.getItem(slideshowKey);

      if (!slideshowSeen) {
        // Check if user has completed onboarding
        const { data: onboardingData } = await supabase
          .from('onboarding_profiles')
          .select('onboarding_completed')
          .eq('user_id', user.id)
          .single();

        if (onboardingData?.onboarding_completed) {
          setShowSlideshow(true);
        }
      } else {
        // Check if assistant intro should be shown after slideshow
        const assistantIntroKey = `artist_assistant_intro_seen_${user.id}`;
        const assistantIntroSeen = localStorage.getItem(assistantIntroKey);

        if (!assistantIntroSeen) {
          const { data: onboardingData } = await supabase
            .from('onboarding_profiles')
            .select('onboarding_completed')
            .eq('user_id', user.id)
            .single();

          if (onboardingData?.onboarding_completed) {
            setShowAssistantIntro(true);
          }
        }
      }
      
      setCheckingSlideshow(false);
      fetchData();
    };

    checkAccess();
  }, [user, navigate]);

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
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading || servicesLoading || checkingSlideshow) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
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
      label: 'Open Studio',
      icon: <Headphones className="w-4 h-4" />,
      onClick: () => navigate('/artist-crm?tab=studio'),
      variant: 'default' as const,
    },
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

  const renderContent = () => {
    switch (currentTab) {
      case 'matches':
        return <YourMatches />;
        
      case 'active-work':
        return (
          <ActiveWorkHub 
            userRole="client" 
            onStartSession={() => {
              navigate('/artist-crm?tab=studio');
              setTimeout(() => {
                const createBtn = document.querySelector('[data-create-session]');
                if (createBtn instanceof HTMLElement) createBtn.click();
              }, 100);
            }}
            onUploadStems={() => navigate('/artist-crm?tab=studio')}
            onJoinSession={() => navigate('/artist-crm?tab=studio')}
            onReviewApprove={() => navigate('/artist-crm?tab=profile')}
          />
        );

      case 'opportunities':
        return <OpportunitiesHub userRole="client" />;

      case 'studio':
        return (
          <div className="space-y-6">
            {activeSessionId ? (
              <CollaborationWorkspace 
                sessionId={activeSessionId}
                onLeaveSession={() => setActiveSessionId(null)}
              />
            ) : (
              <StudioHub 
                userRole="artist"
                onTrackSelect={() => {}}
              />
            )}
          </div>
        );

      case 'business':
        return (
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
        );

      case 'profile':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="lg:col-span-2">
              <ProfileEditor />
            </div>
            <div>
              <ProfileInsights />
            </div>
            <div className="lg:col-span-3">
              <MusicalProfile userType="artist" />
            </div>
            <div className="lg:col-span-3 mt-4 md:mt-8">
              <h3 className="text-xl font-bold mb-4">Your Badges</h3>
              {achievements.length === 0 ? (
                <Card className="p-12 text-center">
                  <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No badges yet</h3>
                  <p className="text-muted-foreground">Complete sessions to unlock achievements</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {achievements.map((achievement) => (
                    <Card key={achievement.id} className="p-4 md:p-6 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                        <Award className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-semibold mb-2">{achievement.badge_name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{achievement.badge_description}</p>
                      <Badge variant="outline">{achievement.badge_type}</Badge>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            {/* 3D Profile & Stats Section */}
            <Suspense fallback={
              <Card className="p-6 bg-gradient-to-br from-card/50 to-card animate-pulse">
                <div className="h-[300px] bg-muted rounded-lg" />
              </Card>
            }>
              <Profile3DSection 
                userName={profile?.full_name || user?.email || 'Artist'}
                stats={[
                  { label: 'Sessions', value: projects.length, color: '#8b5cf6' },
                  { label: 'Released', value: projects.filter(p => p.status === 'completed').length, color: '#06b6d4' },
                  { label: 'In Progress', value: projects.filter(p => p.status === 'in_progress').length, color: '#f59e0b' },
                ]}
              />
            </Suspense>

            {/* Main Dashboard */}
            <DashboardHub />
            
            {/* Interactive 3D Showcase */}
            <Suspense fallback={
              <Card className="p-6 bg-gradient-to-br from-card/50 to-card animate-pulse">
                <div className="h-[400px] bg-muted rounded-lg" />
              </Card>
            }>
              <Card className="p-6 bg-gradient-to-br from-card/50 to-card border-primary/30">
                <h3 className="text-lg font-bold mb-4">Interactive Studio</h3>
                <Interactive3DShowcase className="h-[400px] rounded-lg overflow-hidden border border-primary/20" />
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Drag to interact • Scroll to zoom
                </p>
              </Card>
            </Suspense>
          </div>
        );
    }
  };

  return (
    <ErrorBoundary>
      <CRMLayout
        userType="artist"
        profile={profile}
        stats={stats}
        quickActions={quickActions}
      >
        {renderContent()}
      </CRMLayout>
      <ArtistCRMChatbot />
    </ErrorBoundary>
  );
};

export default ArtistCRM;
