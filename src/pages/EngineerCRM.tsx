import { useEffect, useState } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAdminPreview } from '@/stores/useAdminPreview';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, Clock, AlertCircle, Music, Plus, Upload, Award, TrendingUp, DollarSign, Headphones } from 'lucide-react';
import { CRMPortal } from '@/components/crm/CRMPortal';
import EnhancedCRM from '@/components/crm/EnhancedCRM';
import SessionManager from '@/components/collaboration/SessionManager';
import CollaborationWorkspace from '@/components/collaboration/CollaborationWorkspace';
import { RealTimeCollaboration } from '@/components/RealTimeCollaboration';
import { toast } from 'sonner';
import { JobPool } from '@/components/JobPool';
import { EarningsOverview } from '@/components/engineer/EarningsOverview';
import { PayoutManagement } from '@/components/engineer/PayoutManagement';
import { RecommendedArtists } from '@/components/crm/RecommendedArtists';
import { MusicalProfile } from '@/components/crm/MusicalProfile';
import { EngineerReviews } from '@/components/review/EngineerReviews';
import { BrandHub } from '@/components/crm/BrandHub';
import { EngineerCRMChatbot } from '@/components/crm/EngineerCRMChatbot';
import EngineerCRMSlideshow from '@/components/crm/EngineerCRMSlideshow';
import { EngineerAssistantIntro } from '@/components/crm/EngineerAssistantIntro';
import { DynamicAppAccessHub } from '@/components/crm/DynamicAppAccessHub';
import { ActiveWorkHub } from '@/components/crm/ActiveWorkHub';
import { DashboardHub } from '@/components/crm/DashboardHub';
import { OpportunitiesHub } from '@/components/crm/opportunities';
import { EngineerCRMDashboard } from '@/components/crm/EngineerCRMDashboard';
import { RevenueHub } from '@/components/crm/RevenueHub';
import { CommunityHub } from '@/components/crm/community';
import { GrowthHub } from '@/components/crm/growth';
import { MessagingHub } from '@/components/crm/messaging';
import { CollaborativeEarnings } from '@/components/crm/CollaborativeEarnings';
import { AIMatchesHub } from '@/components/crm/matches';
import { SessionsHub } from '@/components/crm/sessions';
import { ClientsHub } from '@/components/crm/clients';
import { MusicHub } from '@/components/crm/MusicHub';
import { StoreHub } from '@/components/crm/StoreHub';
import { OnboardingReminder } from '@/components/crm/OnboardingReminder';

const EngineerCRM = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'dashboard';
  
  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  const [profile, setProfile] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [earnings, setEarnings] = useState({
    total: 0,
    pending: 0,
    paid: 0,
    bonuses: 0,
    available: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [showAssistantIntro, setShowAssistantIntro] = useState(false);
  const [showSlideshow, setShowSlideshow] = useState(false);

  const { isPreviewMode } = useAdminPreview();

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        navigate('/auth');
        return;
      }

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

      fetchData();
    };

    checkAccess();
  }, [user, navigate, isPreviewMode]);

  const fetchData = async () => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Tasks table not yet implemented - stubbed for Phase 3
      setTasks([]);

      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          *,
          client:profiles!projects_client_id_fkey(full_name, avatar_url),
          audio_files(count)
        `)
        .eq('engineer_id', user?.id)
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

      const { data: earningsData, error: earningsError } = await supabase
        .from('engineer_earnings')
        .select('*')
        .eq('engineer_id', user?.id);

      if (earningsError) throw earningsError;

      const totalEarnings = earningsData?.reduce((sum, e) => sum + Number(e.total_amount || 0), 0) || 0;
      const pendingEarnings = earningsData?.filter(e => e.status === 'pending').reduce((sum, e) => sum + Number(e.total_amount || 0), 0) || 0;
      const paidEarnings = earningsData?.filter(e => e.status === 'paid').reduce((sum, e) => sum + Number(e.total_amount || 0), 0) || 0;
      const bonuses = earningsData?.reduce((sum, e) => sum + Number(e.bonus_amount || 0), 0) || 0;

      setEarnings({
        total: totalEarnings,
        pending: pendingEarnings,
        paid: paidEarnings,
        bonuses: bonuses,
        available: pendingEarnings
      });
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const updates: any = { status: newStatus };
      if (newStatus === 'completed') {
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId);

      if (error) throw error;
      toast.success('Task updated successfully');
      fetchData();
    } catch (error: any) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      urgent: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-500';
  };

  const handleSlideshowComplete = () => {
    if (user) {
      localStorage.setItem(`engineer_crm_slideshow_seen_${user.id}`, 'true');
    }
    setShowSlideshow(false);
    setShowAssistantIntro(true); // Show assistant intro after slideshow
  };

  const handleSlideshowSkip = () => {
    if (user) {
      localStorage.setItem(`engineer_crm_slideshow_seen_${user.id}`, 'true');
    }
    setShowSlideshow(false);
    setShowAssistantIntro(true); // Show assistant intro even if skipped
  };

  const handleAssistantIntroClose = () => {
    if (user) {
      localStorage.setItem(`engineer_assistant_intro_seen_${user.id}`, 'true');
    }
    setShowAssistantIntro(false);
    // Navigate to dashboard after intro
    navigate('/engineer-crm?tab=dashboard');
  };

  const handleAssistantNavigate = (tab: string) => {
    if (user) {
      localStorage.setItem(`engineer_assistant_intro_seen_${user.id}`, 'true');
    }
    setShowAssistantIntro(false);
    navigate(`/engineer-crm?tab=${tab}`);
  };

  const handleOpenChatbot = () => {
    // Chatbot is always visible in the bottom right
    // This just closes the intro
    if (user) {
      localStorage.setItem(`engineer_assistant_intro_seen_${user.id}`, 'true');
    }
    setShowAssistantIntro(false);
  };

  // Show slideshow first, then assistant intro
  if (showSlideshow) {
    return (
      <EngineerCRMSlideshow
        onComplete={handleSlideshowComplete}
        onSkip={handleSlideshowSkip}
      />
    );
  }

  // Show assistant intro after slideshow
  if (showAssistantIntro) {
    return (
      <EngineerAssistantIntro
        open={showAssistantIntro}
        onClose={handleAssistantIntroClose}
        onNavigate={handleAssistantNavigate}
        onOpenChatbot={handleOpenChatbot}
      />
    );
  }

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

  const newSessions = projects.filter(p => p.status === 'pending').length;
  const inProgress = projects.filter(p => p.status === 'in_progress').length;
  const delivered = projects.filter(p => p.status === 'completed' || p.status === 'delivered').length;

  const stats = [
    {
      icon: <Music className="w-4 h-4 text-success" />,
      label: 'New Sessions',
      value: newSessions,
      color: 'bg-success/10'
    },
    {
      icon: <Clock className="w-4 h-4 text-primary" />,
      label: 'In Progress',
      value: inProgress,
      color: 'bg-primary/10'
    },
    {
      icon: <CheckCircle className="w-4 h-4 text-accent" />,
      label: 'Delivered',
      value: delivered,
      color: 'bg-accent/10'
    },
    {
      icon: <DollarSign className="w-4 h-4 text-primary-glow" />,
      label: 'Total Earnings',
      value: `$${earnings.total.toFixed(0)}`,
      color: 'bg-primary-glow/10'
    },
  ];

  const quickActions = [
    {
      label: 'Find New Projects',
      icon: <Music className="w-4 h-4" />,
      onClick: () => navigate('/engineer-crm?tab=opportunities'),
    },
    {
      label: 'View Active Sessions',
      icon: <Clock className="w-4 h-4" />,
      onClick: () => {
        navigate('/engineer-crm?tab=sessions');
        setTimeout(() => {
          document.getElementById('in-progress-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      },
    },
    {
      label: 'View Earnings',
      icon: <DollarSign className="w-4 h-4" />,
      onClick: () => navigate('/engineer-crm?tab=business'),
    },
  ];

  const renderContent = () => {
    switch (currentTab) {
      case 'clients':
        return <ClientsHub userType="engineer" />;

      case 'matches':
        return <AIMatchesHub userType="engineer" />;

      case 'sessions':
        return <SessionsHub />;
      case 'active-work':
        return <ActiveWorkHub />;

      case 'music':
        return <MusicHub />;

      case 'store':
        return <StoreHub />;

      case 'opportunities':
        return <OpportunitiesHub userRole="engineer" />;

      case 'business':
        return (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Earnings & Payments</h2>
              <p className="text-muted-foreground">Track your income and manage payouts</p>
            </div>
            <EarningsOverview
              totalEarnings={earnings.total}
              pendingEarnings={earnings.pending}
              paidEarnings={earnings.paid}
              totalBonuses={earnings.bonuses}
            />
            <PayoutManagement
              engineerId={user?.id || ''}
              availableBalance={earnings.available}
            />
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            <BrandHub />
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Client Reviews</h3>
              <EngineerReviews engineerId={user?.id || ''} />
            </Card>
          </div>
        );

      case 'revenue':
        return <RevenueHub userType="engineer" userId={user?.id} />;

      case 'community':
        return <CommunityHub userType="engineer" />;

      case 'growth':
        return <GrowthHub userType="engineer" />;

      case 'messages':
        return <MessagingHub userType="engineer" />;

      case 'earnings':
        return <CollaborativeEarnings userType="engineer" />;

      default:
        return (
          <>
            <OnboardingReminder userType="engineer" />
            <DashboardHub />
          </>
        );
    }
  };

  return (
    <ErrorBoundary>
      <CRMPortal
        userType="engineer"
        profile={profile}
        stats={stats}
        quickActions={quickActions}
        activeTab={currentTab}
        onTabChange={handleTabChange}
      >
        {renderContent()}
      </CRMPortal>
      <EngineerCRMChatbot />
    </ErrorBoundary>
  );
};

export default EngineerCRM;
