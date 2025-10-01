import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, Clock, AlertCircle, Award, Music, TrendingUp, DollarSign, Zap } from 'lucide-react';
import EnhancedCRM from '@/components/crm/EnhancedCRM';
import SessionManager from '@/components/collaboration/SessionManager';
import { toast } from 'sonner';
import { JobPool } from '@/components/JobPool';
import { EarningsOverview } from '@/components/engineer/EarningsOverview';
import { PayoutManagement } from '@/components/engineer/PayoutManagement';

const EngineerCRM = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch tasks
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

      // Fetch projects
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

      // Fetch achievements
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user?.id)
        .order('earned_at', { ascending: false });

      if (achievementsError) throw achievementsError;
      setAchievements(achievementsData || []);

      // Fetch earnings
      const { data: earningsData, error: earningsError } = await supabase
        .from('engineer_earnings')
        .select('*')
        .eq('engineer_id', user?.id);

      if (earningsError) throw earningsError;

      // Calculate earnings totals
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
        
        // Award points for task completion
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

  const getLevelProgress = () => {
    if (!profile) return 0;
    const currentLevelPoints = (profile.level - 1) * 1000;
    const progressInLevel = profile.points - currentLevelPoints;
    return (progressInLevel / 1000) * 100;
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container px-4 md:px-6 pt-24 pb-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">Welcome to Your Pro Studio</h1>
              <p className="text-muted-foreground">Let's create some magic today 🎚️</p>
            </div>
            
            <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">Level {profile?.level || 1}</div>
                  <div className="text-sm text-muted-foreground">Pro Rank</div>
                </div>
                <div className="w-px h-12 bg-border"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">{profile?.points || 0}</div>
                  <div className="text-sm text-muted-foreground">Session Points</div>
                </div>
              </div>
              <div className="mt-4">
                <Progress value={getLevelProgress()} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  {1000 - (profile?.points % 1000)} points to Level {(profile?.level || 1) + 1}
                </p>
              </div>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-yellow-500/10">
                  <Clock className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{pendingTasks}</div>
                  <div className="text-sm text-muted-foreground">Tracks Queued</div>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <AlertCircle className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{inProgressTasks}</div>
                  <div className="text-sm text-muted-foreground">In Progress</div>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{completedTasks}</div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Music className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{projects.length}</div>
                  <div className="text-sm text-muted-foreground">Active Sessions</div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="open-sessions" className="space-y-6">
          <div className="overflow-x-auto pb-2">
            <TabsList className="inline-flex w-auto min-w-full">
              <TabsTrigger value="open-sessions" className="whitespace-nowrap">Open Sessions</TabsTrigger>
              <TabsTrigger value="tasks" className="whitespace-nowrap">My Tasks</TabsTrigger>
              <TabsTrigger value="projects" className="whitespace-nowrap">My Sessions</TabsTrigger>
              <TabsTrigger value="collaboration" className="gap-2 whitespace-nowrap">
                <Zap className="w-4 h-4" />
                Live Studio
              </TabsTrigger>
              <TabsTrigger value="payments" className="gap-2 whitespace-nowrap">
                <DollarSign className="w-4 h-4" />
                Payments
              </TabsTrigger>
              <TabsTrigger value="achievements" className="whitespace-nowrap">Badges</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="open-sessions" className="space-y-4">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Open Session Opportunities</h2>
              <p className="text-muted-foreground">
                Browse artists looking for pros to work on their tracks - apply to the ones that match your vibe
              </p>
            </div>
            <JobPool />
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Your Task List</h2>
            
            {tasks.length === 0 ? (
              <Card className="p-12 text-center">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">All caught up!</h3>
                <p className="text-muted-foreground">No pending tasks - check "Open Sessions" to find new work</p>
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
                          {task.due_date && (
                            <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      
                      {task.status !== 'completed' && (
                        <div className="flex gap-2">
                          {task.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => updateTaskStatus(task.id, 'in_progress')}
                            >
                              Start Task
                            </Button>
                          )}
                          {task.status === 'in_progress' && (
                            <Button
                              size="sm"
                              onClick={() => updateTaskStatus(task.id, 'review')}
                            >
                              Mark for Review
                            </Button>
                          )}
                          {task.status === 'review' && (
                            <Button
                              size="sm"
                              onClick={() => updateTaskStatus(task.id, 'completed')}
                            >
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
          </TabsContent>

          <TabsContent value="projects" className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Your Active Sessions</h2>
            
            {projects.length === 0 ? (
              <Card className="p-12 text-center">
                <Music className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No active sessions</h3>
                <p className="text-muted-foreground">Apply to jobs in "Open Sessions" to start working with artists</p>
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
                              <span>Client: {project.client.full_name}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Music className="w-4 h-4" />
                            <span>{project.audio_files?.[0]?.count || 0} files</span>
                          </div>
                        </div>
                      </div>
                      
                      <Button variant="outline" size="sm">View Project</Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="collaboration" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Live Studio Collaboration</h2>
                <p className="text-muted-foreground">Work directly with artists in real-time</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground">Live</span>
              </div>
            </div>
            
            {/* Session Manager */}
            <SessionManager projectId={projects[0]?.id} />
            
            {/* Enhanced CRM for active projects */}
            {projects.length > 0 && (
              <div className="grid gap-6 mt-8">
                <h3 className="text-lg font-semibold">Active Project Collaboration</h3>
                {projects.filter(p => p.status !== 'completed').slice(0, 2).map((project) => (
                  <div key={project.id} className="space-y-4">
                    <h4 className="text-md font-medium flex items-center gap-2">
                      <Music className="w-4 h-4" />
                      {project.title}
                    </h4>
                    <EnhancedCRM projectId={project.id} />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Payments & Earnings</h2>
              <p className="text-muted-foreground">
                Track your earnings and request payouts
              </p>
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
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Your Studio Badges</h2>
            
            {achievements.length === 0 ? (
              <Card className="p-12 text-center">
                <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No badges yet</h3>
                <p className="text-muted-foreground">Complete sessions to unlock achievements and level up your pro status</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                  <Card key={achievement.id} className="p-6 text-center hover:shadow-lg transition-shadow">
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EngineerCRM;