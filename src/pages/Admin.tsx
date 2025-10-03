import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { NotificationTestPanel } from '@/components/admin/NotificationTestPanel';
import AdminMixxBot from '@/components/admin/AdminMixxBot';
import { MobileDeploymentChecklist } from '@/components/admin/MobileDeploymentChecklist';
import { PerformanceOptimizer } from '@/components/admin/PerformanceOptimizer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Music, FileAudio, TrendingUp, Rocket, TestTube2, Zap, CheckCircle, Bot, Shield, Smartphone, Sparkles, Activity, AlertTriangle, FileText, Target } from 'lucide-react';

export default function Admin() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    totalAudioFiles: 0,
    activeEngineers: 0,
  });

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase.rpc('is_admin', { user_uuid: user.id });
      console.log('Admin check:', { user: user.id, data, error });
      
      if (error || !data) {
        console.log('Not admin, redirecting to home');
        navigate('/');
        return;
      }

      setIsAdmin(true);
      fetchStats();
    };

    if (!loading) {
      checkAdmin();
    }
  }, [user, loading, navigate]);

  const fetchStats = async () => {
    const [usersData, projectsData, audioData, engineersData] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('projects').select('id', { count: 'exact', head: true }),
      supabase.from('audio_files').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'engineer'),
    ]);

    setStats({
      totalUsers: usersData.count || 0,
      totalProjects: projectsData.count || 0,
      totalAudioFiles: audioData.count || 0,
      activeEngineers: engineersData.count || 0,
    });
  };

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">Manage your platform from here</p>
          </div>

          <NotificationTestPanel />
          
          <div className="grid md:grid-cols-2 gap-6">
            <MobileDeploymentChecklist />
            <PerformanceOptimizer />
          </div>

          {/* Launch Readiness Test */}
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-purple-500/5">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Rocket className="w-6 h-6" />
                    $50M Launch System
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Comprehensive readiness test for all launch systems
                  </p>
                </div>
                <Button 
                  onClick={() => navigate('/admin/launch-readiness')}
                  size="lg"
                  className="gap-2"
                >
                  <TestTube2 className="w-5 h-5" />
                  Run Tests
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Database Tables</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Edge Functions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Analytics</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>A/B Testing</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Engineers</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeEngineers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <Music className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProjects}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Audio Files</CardTitle>
                <FileAudio className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalAudioFiles}</div>
              </CardContent>
            </Card>
          </div>

          {/* New Admin Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <Card className="p-6 hover:shadow-lg transition-all cursor-pointer group bg-gradient-to-br from-primary/10 to-primary/20" onClick={() => navigate('/admin/launch-control')}>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-primary">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold">Launch Control</h3>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all cursor-pointer group bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20" onClick={() => navigate('/admin/core-testing')}>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600">
                  <TestTube2 className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold">Core Testing</h3>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all cursor-pointer group bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20" onClick={() => navigate('/admin/mobile-testing')}>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600">
                  <Smartphone className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold">Mobile Testing</h3>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all cursor-pointer group bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20" onClick={() => navigate('/admin-security')}>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-red-600 to-orange-600">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold">Security</h3>
              </div>
            </Card>
          </div>
        </div>
      </AdminLayout>
      <AdminMixxBot />
    </>
  );
}
