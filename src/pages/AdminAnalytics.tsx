import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { BarChart3, Users, Music, FolderKanban, TrendingUp, Clock } from 'lucide-react';

interface AnalyticsData {
  totalUsers: number;
  totalProjects: number;
  totalAudioFiles: number;
  activeEngineers: number;
  projectsThisMonth: number;
  avgProjectDuration: number;
}

export default function AdminAnalytics() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    totalProjects: 0,
    totalAudioFiles: 0,
    activeEngineers: 0,
    projectsThisMonth: 0,
    avgProjectDuration: 0,
  });
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      checkAdminStatus();
      fetchAnalytics();
    }
  }, [user, loading, navigate]);

  const checkAdminStatus = async () => {
    const { data, error } = await supabase.rpc('is_admin', { user_uuid: user?.id });
    if (error || !data) {
      navigate('/');
    }
  };

  const fetchAnalytics = async () => {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const [usersRes, projectsRes, audioRes, engineersRes, monthlyProjectsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('projects').select('id, created_at, updated_at', { count: 'exact' }),
        supabase.from('audio_files').select('id', { count: 'exact', head: true }),
        supabase
          .from('engineer_profiles')
          .select('id', { count: 'exact', head: true })
          .eq('is_available', true),
        supabase
          .from('projects')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', startOfMonth.toISOString()),
      ]);

      // Calculate average project duration
      let avgDuration = 0;
      if (projectsRes.data && projectsRes.data.length > 0) {
        const durations = projectsRes.data
          .filter((p) => p.updated_at && p.created_at)
          .map((p) => {
            const start = new Date(p.created_at).getTime();
            const end = new Date(p.updated_at).getTime();
            return (end - start) / (1000 * 60 * 60 * 24); // Convert to days
          });
        avgDuration = durations.length > 0
          ? durations.reduce((sum, d) => sum + d, 0) / durations.length
          : 0;
      }

      setAnalytics({
        totalUsers: usersRes.count || 0,
        totalProjects: projectsRes.count || 0,
        totalAudioFiles: audioRes.count || 0,
        activeEngineers: engineersRes.count || 0,
        projectsThisMonth: monthlyProjectsRes.count || 0,
        avgProjectDuration: avgDuration,
      });
    } catch (error: any) {
      toast.error('Failed to fetch analytics data');
    } finally {
      setDataLoading(false);
    }
  };

  if (loading || dataLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Business metrics and performance insights
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registered accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalProjects}</div>
              <p className="text-xs text-muted-foreground">All time projects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Audio Files</CardTitle>
              <Music className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalAudioFiles}</div>
              <p className="text-xs text-muted-foreground">Uploaded files</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Engineers</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.activeEngineers}</div>
              <p className="text-xs text-muted-foreground">Available for work</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projects This Month</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.projectsThisMonth}</div>
              <p className="text-xs text-muted-foreground">Current month activity</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Project Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.avgProjectDuration.toFixed(1)} days</div>
              <p className="text-xs text-muted-foreground">Average turnaround</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Platform Performance</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">User Growth Rate</span>
                <span className="text-sm text-green-500">
                  {analytics.totalUsers > 0 ? '+' : ''}
                  {((analytics.projectsThisMonth / Math.max(analytics.totalUsers, 1)) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{
                    width: `${Math.min((analytics.projectsThisMonth / Math.max(analytics.totalUsers, 1)) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Engineer Utilization</span>
                <span className="text-sm">
                  {analytics.activeEngineers > 0
                    ? ((analytics.projectsThisMonth / analytics.activeEngineers) * 100).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${Math.min(analytics.activeEngineers > 0 ? (analytics.projectsThisMonth / analytics.activeEngineers) * 100 : 0, 100)}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
