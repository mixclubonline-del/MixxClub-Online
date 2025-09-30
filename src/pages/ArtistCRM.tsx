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
import { Upload, Music, TrendingUp, Award, MessageSquare, DollarSign, Zap, Users } from 'lucide-react';
import { RealTimeCollaboration } from '@/components/RealTimeCollaboration';
import EnhancedCRM from '@/components/crm/EnhancedCRM';
import SessionManager from '@/components/collaboration/SessionManager';
import { EngineerCRMDashboard } from '@/components/crm/EngineerCRMDashboard';
import { AdvancedMixingStudio } from '@/components/mixing/AdvancedMixingStudio';
import { JobApplicationManager } from '@/components/crm/JobApplicationManager';
import { toast } from 'sonner';

const ArtistCRM = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [pendingApplications, setPendingApplications] = useState(0);
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
      // Fetch profile with gamification data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch projects
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

      // Fetch achievements
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user?.id)
        .order('earned_at', { ascending: false });

      if (achievementsError) throw achievementsError;
      setAchievements(achievementsData || []);

      // Fetch pending applications count
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

  const getLevelProgress = () => {
    if (!profile) return 0;
    const currentLevelPoints = (profile.level - 1) * 1000;
    const progressInLevel = profile.points - currentLevelPoints;
    return (progressInLevel / 1000) * 100;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-500',
      in_progress: 'bg-blue-500',
      review: 'bg-purple-500',
      completed: 'bg-green-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container px-6 py-8">
        {/* Header with Gamification */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">Welcome back, {profile?.full_name || 'Artist'}!</h1>
              <p className="text-muted-foreground">Transform your tracks into masterpieces</p>
            </div>
            
            <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">Level {profile?.level || 1}</div>
                  <div className="text-sm text-muted-foreground">Artist Level</div>
                </div>
                <div className="w-px h-12 bg-border"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">{profile?.points || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Points</div>
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
                <div className="p-3 rounded-lg bg-primary/10">
                  <Music className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{projects.length}</div>
                  <div className="text-sm text-muted-foreground">Total Projects</div>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {projects.filter(p => p.status === 'completed').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-yellow-500/10">
                  <Award className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{achievements.length}</div>
                  <div className="text-sm text-muted-foreground">Achievements</div>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <DollarSign className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {projects.filter(p => p.status === 'in_progress').length}
                  </div>
                  <div className="text-sm text-muted-foreground">In Progress</div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="applications" className="relative">
              Applications
              {pendingApplications > 0 && (
                <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center bg-primary text-primary-foreground">
                  {pendingApplications}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="collaboration" className="gap-2">
              <Zap className="w-4 h-4" />
              Live Studio
            </TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

            <TabsContent value="projects" className="space-y-4">
              <EngineerCRMDashboard />
            </TabsContent>

            <TabsContent value="applications" className="space-y-4">
              <JobApplicationManager />
            </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Your Achievements</h2>
            
            {achievements.length === 0 ? (
              <Card className="p-12 text-center">
                <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No achievements yet</h3>
                <p className="text-muted-foreground">Complete projects to earn badges and achievements</p>
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

          <TabsContent value="collaboration" className="space-y-6">
            <AdvancedMixingStudio />
          </TabsContent>

          <TabsContent value="activity">
            <Card className="p-12 text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Activity Feed Coming Soon</h3>
              <p className="text-muted-foreground">Track your project updates and collaboration in real-time</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ArtistCRM;