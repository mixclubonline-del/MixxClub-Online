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
import { CollapsibleCard } from '@/components/ui/collapsible-card';
import { Button } from '@/components/ui/button';
import { Users, Music, FileAudio, TrendingUp, Rocket, TestTube2, Zap, CheckCircle, Bot, Shield, Smartphone, Sparkles, Activity, AlertTriangle, FileText, Target, DollarSign, Eye, Megaphone, Headphones, BarChart3, Plug, UserCog } from 'lucide-react';

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

          <CollapsibleCard
            title="Notification Test Panel"
            storageKey="admin-notification-test"
          >
            <NotificationTestPanel />
          </CollapsibleCard>
          
          <div className="grid md:grid-cols-2 gap-6">
            <CollapsibleCard
              title="Mobile Deployment Checklist"
              storageKey="admin-mobile-deployment"
            >
              <MobileDeploymentChecklist />
            </CollapsibleCard>
            <CollapsibleCard
              title="Performance Optimizer"
              storageKey="admin-performance-optimizer"
            >
              <PerformanceOptimizer />
            </CollapsibleCard>
          </div>

          {/* Launch Readiness Test */}
          <Card variant="glass-ember" hover="glow" className="border-[hsl(var(--glass-edge-ember))] animate-glass-breathe">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Rocket className="w-6 h-6" />
                    Command Center
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Comprehensive platform control and real-time monitoring
                  </p>
                </div>
                <Button 
                  onClick={() => navigate('/admin/command-center')}
                  size="lg"
                  className="gap-2"
                >
                  <Activity className="w-5 h-5" />
                  Open Dashboard
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Real-time Monitoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Quick Actions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>System Health</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Activity Feed</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card variant="glass-near" hover="lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>

            <Card variant="glass-near" hover="lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Engineers</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeEngineers}</div>
              </CardContent>
            </Card>

            <Card variant="glass-near" hover="lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <Music className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProjects}</div>
              </CardContent>
            </Card>

            <Card variant="glass-near" hover="lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Audio Files</CardTitle>
                <FileAudio className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalAudioFiles}</div>
              </CardContent>
            </Card>
          </div>

          {/* Admin Feature Cards */}
          <CollapsibleCard
            title="Admin Features"
            storageKey="admin-features"
            contentClassName="pt-0"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <Card variant="glass-ember" hover="glow" className="p-6 cursor-pointer group" onClick={() => navigate('/admin/launch-control')}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="glass-pill p-2 rounded-lg border border-[hsl(var(--glass-edge-ember))]" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent-blue)))' }}>
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-bold">Launch Control</h3>
                </div>
              </Card>

            <Card variant="glass-near" hover="lift" className="p-6 cursor-pointer group" onClick={() => navigate('/admin/core-testing')}>
              <div className="flex items-center gap-3 mb-3">
                <div className="glass-pill p-2 rounded-lg border border-[hsl(var(--glass-border))]" style={{ background: 'linear-gradient(135deg, hsl(270 100% 65%), hsl(210 100% 60%))' }}>
                  <TestTube2 className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold">Core Testing</h3>
              </div>
            </Card>

            <Card variant="glass-near" hover="lift" className="p-6 cursor-pointer group" onClick={() => navigate('/admin/mobile-testing')}>
              <div className="flex items-center gap-3 mb-3">
                <div className="glass-pill p-2 rounded-lg border border-[hsl(var(--glass-border))]" style={{ background: 'linear-gradient(135deg, hsl(160 100% 50%), hsl(170 100% 45%))' }}>
                  <Smartphone className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold">Mobile Testing</h3>
              </div>
            </Card>

            <Card variant="glass-near" hover="lift" className="p-6 cursor-pointer group" onClick={() => navigate('/admin/revenue')}>
              <div className="flex items-center gap-3 mb-3">
                <div className="glass-pill p-2 rounded-lg border border-[hsl(var(--glass-border))]" style={{ background: 'linear-gradient(135deg, hsl(45 100% 55%), hsl(55 100% 50%))' }}>
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold">Revenue Features</h3>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 glass-scrollbar">
            <Card className="p-6 hover:shadow-lg transition-all cursor-pointer group bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20" onClick={() => navigate('/admin-security')}>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-red-600 to-orange-600">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold">Security</h3>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all cursor-pointer group bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20" onClick={() => navigate('/admin/ux-optimization')}>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-pink-600 to-rose-600">
                  <Eye className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold">UX Optimization</h3>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all cursor-pointer group bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/20 dark:to-violet-950/20" onClick={() => navigate('/admin/marketing')}>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600">
                  <Megaphone className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold">Marketing & Growth</h3>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all cursor-pointer group bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-950/20 dark:to-teal-950/20" onClick={() => navigate('/admin/customer-success')}>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-600 to-teal-600">
                  <Headphones className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold">Customer Success</h3>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all cursor-pointer group bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950/20 dark:to-gray-950/20" onClick={() => navigate('/admin/data-reporting')}>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-slate-600 to-gray-600">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold">Data & Reporting</h3>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all cursor-pointer group bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20" onClick={() => navigate('/admin/integration-automation')}>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600">
                  <Plug className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold">Integration & Automation</h3>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all cursor-pointer group bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950/20 dark:to-sky-950/20" onClick={() => navigate('/admin/team-management')}>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-sky-600">
                  <UserCog className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold">Team Management</h3>
              </div>
            </Card>
          </div>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer mt-4" onClick={() => navigate("/admin/launch-readiness")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5" />
                Launch Readiness
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                System health, performance metrics, and launch checklist
              </p>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                Check System Status
              </Button>
            </CardContent>
          </Card>
          </CollapsibleCard>
        </div>
      </AdminLayout>
      <AdminMixxBot />
    </>
  );
}
