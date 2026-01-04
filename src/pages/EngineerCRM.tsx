import { useEffect, useState } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, Clock, AlertCircle, Music, Plus, Upload, Award, TrendingUp, DollarSign, Headphones } from 'lucide-react';
import { CRMLayout } from '@/components/crm/CRMLayout';
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
import ProfileEditor from '@/components/crm/ProfileEditor';
import ProfileInsights from '@/components/crm/ProfileInsights';
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

const EngineerCRM = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'sessions';

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

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        navigate('/auth');
        return;
      }

      // Check if user is admin - admins should use admin panel
      const { data: isAdmin } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });

      if (isAdmin) {
        toast.error('Please use the Admin Panel');
        navigate('/admin');
        return;
      }

      fetchData();
    };

    checkAccess();
  }, [user, navigate]);

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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ProfileEditor />
            </div>
            <div>
              <ProfileInsights />
            </div>
            <div className="lg:col-span-3">
              <MusicalProfile />
            </div>
            <div className="lg:col-span-3 mt-8">
              <h3 className="text-xl font-bold mb-4">Your Badges</h3>
              {achievements.length === 0 ? (
                <Card className="p-12 text-center">
                  <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No badges yet</h3>
                  <p className="text-muted-foreground">Complete projects to unlock achievements</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map((achievement) => (
                    <Card key={achievement.id} className="p-6 text-center">
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

            <div className="lg:col-span-3 mt-8">
              <h3 className="text-xl font-bold mb-4">Client Reviews</h3>
              <EngineerReviews engineerId={user?.id || ''} />
            </div>
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
        return <DashboardHub />;
    }
  };

  return (
    <ErrorBoundary>
      <CRMLayout
        userType="engineer"
        profile={profile}
        stats={stats}
        quickActions={quickActions}
      >
        {renderContent()}
      </CRMLayout>
      <EngineerCRMChatbot />
    </ErrorBoundary>
  );
};

export default EngineerCRM;
