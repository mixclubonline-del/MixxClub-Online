import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useServiceAccess } from '@/hooks/useServiceAccess';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Music, Plus, TrendingUp, Award, Upload, Sparkles, Lock, DollarSign } from 'lucide-react';
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
import { ArtistCRMChatbot } from '@/components/crm/ArtistCRMChatbot';
import { ArtistCRMSlideshow } from '@/components/crm/ArtistCRMSlideshow';
import { ArtistAssistantIntro } from '@/components/crm/ArtistAssistantIntro';
import { DistributionWorkflow } from '@/components/crm/DistributionWorkflow';

import { DynamicAppAccessHub } from '@/components/crm/DynamicAppAccessHub';

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
      label: 'New Project',
      icon: <Plus className="w-4 h-4" />,
      onClick: () => navigate('/artist-crm?tab=active-work'),
      variant: 'default' as const,
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
      case 'active-work':
        return (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Your Sessions</h2>
              <p className="text-muted-foreground">Manage your active music projects</p>
            </div>
            
            {/* Quick Action: New Project */}
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Ready to create something amazing?</h3>
                  <p className="text-sm text-muted-foreground">Start a new project and connect with top engineers</p>
                </div>
                <Button onClick={() => navigate('/artist-studio')} size="lg">
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </div>
            </Card>

            {/* Projects Grid */}
            {projects.length > 0 ? (
              <div className="space-y-6">
                {/* Distribution CTA for Completed Projects */}
                {projects.some((p: any) => p.status === 'completed') && (
                  <DistributionWorkflow 
                    projectId={projects.find((p: any) => p.status === 'completed')?.id || ''} 
                    projectTitle={projects.find((p: any) => p.status === 'completed')?.title || ''} 
                  />
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                  {projects.map((project) => (
                    <CompletedProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Music className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No sessions yet</h3>
                <p className="text-muted-foreground mb-6">Start your first project to begin your journey</p>
                <Button onClick={() => navigate('/artist-studio')} size="lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Project
                </Button>
              </Card>
            )}
          </div>
        );

      case 'opportunities':
        return (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Find Your Perfect Engineer</h2>
              <p className="text-muted-foreground">AI-powered matching for your unique sound</p>
            </div>
            
            <AIMatchingEngine 
              userGenre={profile?.genre || 'Hip Hop'}
              projectType="mixing"
              budget={500}
              urgency="medium"
            />
            
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4">All Engineers</h3>
              <RecommendedEngineers />
            </div>
            
            {mixingAccess ? (
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">Book a New Session</h3>
                <JobPostingForm />
              </div>
            ) : (
              <div className="mt-8">
                <LockedServiceTab 
                  serviceName="Professional Mixing"
                  serviceType="mixing"
                  description="Upgrade to access our professional mixing services"
                  features={[
                    "Post unlimited mixing jobs",
                    "Connect with verified engineers",
                    "Live collaboration studio",
                    "Quick turnaround times"
                  ]}
                />
              </div>
            )}

            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4">Pro Responses</h3>
              <JobApplicationManager />
            </div>
          </div>
        );

      case 'studio':
        return (
          <div className="space-y-6">
            {activeSessionId ? (
              <CollaborationWorkspace 
                sessionId={activeSessionId}
                onLeaveSession={() => setActiveSessionId(null)}
              />
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">Studio Collaboration</h2>
                  <p className="text-muted-foreground">Connect with your engineer in real-time</p>
                </div>
                
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <SessionManager projectId={undefined} />
                  </div>
                  <div>
                    <RealTimeCollaboration />
                  </div>
                </div>
              </>
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
            {/* Dynamic App Access Hub */}
            <DynamicAppAccessHub userRole="artist" />
            
            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">{stats.map((stat, index) => (
                <Card key={index} className="p-4 md:p-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${stat.color}`}>
                      {stat.icon}
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Recent Projects */}
            <Card className="p-4 md:p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Sessions</h3>
              {projects.slice(0, 5).length > 0 ? (
                <div className="space-y-3">
                  {projects.slice(0, 5).map((project) => (
                    <div 
                      key={project.id} 
                      className="flex items-center justify-between pb-3 border-b last:border-0 cursor-pointer hover:bg-muted/50 -mx-2 px-2 py-2 rounded"
                      onClick={() => navigate(`/project/${project.id}`)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{project.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {project.engineer?.full_name || 'No engineer assigned'}
                        </p>
                      </div>
                      <Badge variant="outline">{project.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Music className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">No projects yet. Start your first session!</p>
                  <Button className="mt-4" onClick={() => navigate('/artist-crm?tab=active-work')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Project
                  </Button>
                </div>
              )}
            </Card>

            {pendingApplications > 0 && (
              <Card className="p-6 bg-primary/5 border-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">You have {pendingApplications} new response{pendingApplications !== 1 ? 's' : ''}!</h3>
                    <p className="text-sm text-muted-foreground">Engineers are waiting to work with you</p>
                  </div>
                  <Button onClick={() => navigate('/artist-crm?tab=opportunities')}>
                    View Responses
                  </Button>
                </div>
              </Card>
            )}
          </div>
        );
    }
  };

  return (
    <>
      <CRMLayout
        userType="artist"
        profile={profile}
        stats={stats}
        quickActions={quickActions}
      >
        {renderContent()}
      </CRMLayout>
      <ArtistCRMChatbot />
    </>
  );
};

export default ArtistCRM;
