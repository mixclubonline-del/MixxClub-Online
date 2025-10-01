import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, Clock, AlertCircle, Music, Plus, Upload, Award, TrendingUp, DollarSign } from 'lucide-react';
import { CRMLayout } from '@/components/crm/CRMLayout';
import EnhancedCRM from '@/components/crm/EnhancedCRM';
import SessionManager from '@/components/collaboration/SessionManager';
import { toast } from 'sonner';
import { JobPool } from '@/components/JobPool';
import { EarningsOverview } from '@/components/engineer/EarningsOverview';
import { PayoutManagement } from '@/components/engineer/PayoutManagement';
import { RecommendedArtists } from '@/components/crm/RecommendedArtists';
import { MusicalProfile } from '@/components/crm/MusicalProfile';
import ProfileEditor from '@/components/crm/ProfileEditor';
import ProfileInsights from '@/components/crm/ProfileInsights';

const EngineerCRM = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'dashboard';
  
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

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchData();
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

      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          *,
          project:projects(title, client:profiles!projects_client_id_fkey(full_name))
        `)
        .eq('engineer_id', user?.id)
        .order('created_at', { ascending: false });

      if (tasksError) throw tasksError;
      setTasks(tasksData || []);

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
        await supabase.rpc('award_points', {
          user_id: user?.id,
          points_to_add: 50
        });
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

  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;

  const stats = [
    {
      icon: <Clock className="w-4 h-4 text-yellow-500" />,
      label: 'Queued',
      value: pendingTasks,
      color: 'bg-yellow-500/10'
    },
    {
      icon: <AlertCircle className="w-4 h-4 text-blue-500" />,
      label: 'In Progress',
      value: inProgressTasks,
      color: 'bg-blue-500/10'
    },
    {
      icon: <CheckCircle className="w-4 h-4 text-green-500" />,
      label: 'Completed',
      value: completedTasks,
      color: 'bg-green-500/10'
    },
    {
      icon: <Music className="w-4 h-4 text-primary" />,
      label: 'Sessions',
      value: projects.length,
      color: 'bg-primary/10'
    },
  ];

  const quickActions = [
    {
      label: 'Browse Jobs',
      icon: <Music className="w-4 h-4" />,
      onClick: () => navigate('/engineer-crm?tab=opportunities'),
    },
    {
      label: 'View Earnings',
      icon: <DollarSign className="w-4 h-4" />,
      onClick: () => navigate('/engineer-crm?tab=business'),
    },
  ];

  const renderContent = () => {
    switch (currentTab) {
      case 'active-work':
        return (
          <div className="space-y-6">
            {/* Tasks Section */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Your Tasks</h2>
              {tasks.length === 0 ? (
                <Card className="p-12 text-center">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">All caught up!</h3>
                  <p className="text-muted-foreground">No pending tasks</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <Card key={task.id} className="p-6">
                      <div className="flex items-start gap-4">
                        <Checkbox
                          checked={task.status === 'completed'}
                          onCheckedChange={(checked) => {
                            updateTaskStatus(task.id, checked ? 'completed' : 'pending');
                          }}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{task.title}</h3>
                            <Badge className={`${getPriorityColor(task.priority)} text-white`}>
                              {task.priority}
                            </Badge>
                            <Badge variant="outline">{task.status.replace('_', ' ')}</Badge>
                          </div>
                          {task.description && (
                            <p className="text-muted-foreground mb-3">{task.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Project: {task.project?.title}</span>
                            {task.project?.client && (
                              <span>Client: {task.project.client.full_name}</span>
                            )}
                          </div>
                        </div>
                        {task.status !== 'completed' && (
                          <div className="flex gap-2">
                            {task.status === 'pending' && (
                              <Button size="sm" onClick={() => updateTaskStatus(task.id, 'in_progress')}>
                                Start
                              </Button>
                            )}
                            {task.status === 'in_progress' && (
                              <Button size="sm" onClick={() => updateTaskStatus(task.id, 'completed')}>
                                Complete
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Projects Section */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Active Sessions</h2>
              {projects.length === 0 ? (
                <Card className="p-12 text-center">
                  <Music className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No active sessions</h3>
                  <p className="text-muted-foreground">Browse opportunities to start working</p>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {projects.map((project) => (
                    <Card key={project.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/project/${project.id}`)}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                          <p className="text-muted-foreground mb-4">{project.description}</p>
                          <div className="flex items-center gap-6 text-sm">
                            {project.client && (
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                  {project.client.avatar_url ? (
                                    <img src={project.client.avatar_url} alt="" className="w-full h-full rounded-full" />
                                  ) : (
                                    <span className="text-xs">{project.client.full_name?.charAt(0)}</span>
                                  )}
                                </div>
                                <span>{project.client.full_name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button variant="outline" size="sm">View</Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'opportunities':
        return (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Find Your Next Session</h2>
              <p className="text-muted-foreground">Browse artists looking for pros like you</p>
            </div>
            <RecommendedArtists />
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4">All Open Jobs</h3>
              <JobPool />
            </div>
          </div>
        );

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
              <MusicalProfile userType="engineer" />
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
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <Card key={index} className="p-4">
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

            {/* Recent Activity */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Tasks</h3>
                {tasks.slice(0, 3).length > 0 ? (
                  <div className="space-y-3">
                    {tasks.slice(0, 3).map((task) => (
                      <div key={task.id} className="flex items-center gap-3 pb-3 border-b last:border-0">
                        <Checkbox checked={task.status === 'completed'} disabled />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{task.title}</p>
                          <p className="text-sm text-muted-foreground">{task.project?.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No recent tasks</p>
                )}
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Earnings Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Earned</span>
                    <span className="font-bold text-lg">${earnings.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Pending</span>
                    <span className="font-semibold">${earnings.pending.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Bonuses</span>
                    <span className="font-semibold text-green-500">${earnings.bonuses.toFixed(2)}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <CRMLayout
      userType="engineer"
      profile={profile}
      stats={stats}
      quickActions={quickActions}
    >
      {renderContent()}
    </CRMLayout>
  );
};

export default EngineerCRM;
