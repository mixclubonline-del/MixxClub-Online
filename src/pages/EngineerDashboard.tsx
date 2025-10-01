import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useEngineerEarnings } from '@/hooks/useEngineerEarnings';
import { EarningsOverview } from '@/components/engineer/EarningsOverview';
import { PayoutManagement } from '@/components/engineer/PayoutManagement';
import { BadgesDisplay } from '@/components/engineer/BadgesDisplay';
import { EngineerLeaderboard } from '@/components/engineer/EngineerLeaderboard';
import { Music, Clock, Zap, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Project {
  id: string;
  title: string;
  status: string;
  client_id: string;
  created_at: string;
  profiles?: {
    full_name: string | null;
    email: string;
  };
}

const EngineerDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { stats, badges, streak, loading: dataLoading } = useEngineerEarnings(user?.id);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user?.id) {
      fetchProjects();
    }
  }, [user?.id]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('engineer_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      // Fetch client profiles separately
      if (data && data.length > 0) {
        const clientIds = data.map(p => p.client_id);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', clientIds);

        const projectsWithProfiles = data.map(project => ({
          ...project,
          profiles: profilesData?.find(p => p.id === project.client_id) || null
        }));

        setProjects(projectsWithProfiles as any);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoadingProjects(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-500';
      case 'in_progress':
        return 'bg-blue-500/10 text-blue-500';
      case 'pending':
        return 'bg-orange-500/10 text-orange-500';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container px-6 py-24 flex items-center justify-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container px-6 py-24">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Engineer Dashboard</h1>
            <p className="text-muted-foreground">
              Manage projects, track earnings, and view your performance
            </p>
          </div>
          <div className="flex items-center gap-4">
            {streak.current_streak > 0 && (
              <Badge variant="outline" className="gap-2 py-2 px-4">
                <Zap className="w-4 h-4 text-yellow-500" />
                {streak.current_streak} Day Streak
              </Badge>
            )}
            {stats.averageRating >= 4.5 && (
              <Badge variant="outline" className="gap-2 py-2 px-4">
                <Award className="w-4 h-4 text-primary" />
                Top Rated
              </Badge>
            )}
          </div>
        </div>

        {/* Earnings Overview */}
        <div className="mb-8">
          <EarningsOverview
            totalEarnings={stats.totalEarnings}
            pendingEarnings={stats.pendingEarnings}
            paidEarnings={stats.paidEarnings}
            totalBonuses={stats.totalBonuses}
          />
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Music className="w-4 h-4 text-primary" />
                Active Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.activeProjects}</div>
              <p className="text-sm text-muted-foreground">In progress</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="w-4 h-4 text-green-500" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.completedProjects}</div>
              <p className="text-sm text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Award className="w-4 h-4 text-primary" />
                Average Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.averageRating.toFixed(1)}</div>
              <p className="text-sm text-muted-foreground">Out of 5.0</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Projects */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
              <CardDescription>Your latest assignments</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingProjects ? (
                <p className="text-muted-foreground">Loading projects...</p>
              ) : projects.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No projects yet</p>
                  <p className="text-sm mt-1">Projects will appear here once assigned</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-medium">{project.title}</div>
                          <div className="text-sm text-muted-foreground">
                            Client: {project.profiles?.full_name || 'Unknown'}
                          </div>
                        </div>
                        <Badge className={getStatusColor(project.status)}>
                          {getStatusLabel(project.status)}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Created {new Date(project.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => navigate(`/engineer-crm`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payout Management */}
          <PayoutManagement
            engineerId={user?.id || ''}
            availableBalance={stats.paidEarnings}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Badges & Streaks */}
          <BadgesDisplay
            badges={badges}
            currentStreak={streak.current_streak}
            longestStreak={streak.longest_streak}
          />

          {/* Leaderboard */}
          <EngineerLeaderboard />
        </div>
      </div>
    </div>
  );
};

export default EngineerDashboard;
