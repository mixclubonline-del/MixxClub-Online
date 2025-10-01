import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Music, FileAudio, TrendingUp, DollarSign, Settings } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav';

export default function MobileAdmin() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    totalAudioFiles: 0,
    activeEngineers: 0,
    pendingPayouts: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase.rpc('is_admin', { user_uuid: user.id });
      
      if (error || !data) {
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
    const [usersData, projectsData, audioData, engineersData, payoutsData] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('projects').select('id', { count: 'exact', head: true }),
      supabase.from('audio_files').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'engineer'),
      supabase.from('payout_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    ]);

    setStats({
      totalUsers: usersData.count || 0,
      totalProjects: projectsData.count || 0,
      totalAudioFiles: audioData.count || 0,
      activeEngineers: engineersData.count || 0,
      pendingPayouts: payoutsData.count || 0,
      totalRevenue: 0,
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
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage your platform</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="cursor-pointer active:scale-95 transition-transform" onClick={() => navigate('/mobile-admin/users')}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer active:scale-95 transition-transform">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Engineers</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeEngineers}</div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer active:scale-95 transition-transform">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Projects</CardTitle>
                <Music className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProjects}</div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer active:scale-95 transition-transform">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Audio Files</CardTitle>
                <FileAudio className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAudioFiles}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              className="w-full justify-start" 
              variant="ghost"
              onClick={() => navigate('/mobile-admin/payouts')}
            >
              <DollarSign className="mr-2 h-5 w-5" />
              <div className="flex-1 text-left">
                <div className="font-medium">Pending Payouts</div>
                <div className="text-xs text-muted-foreground">
                  {stats.pendingPayouts} request{stats.pendingPayouts !== 1 ? 's' : ''} awaiting review
                </div>
              </div>
              {stats.pendingPayouts > 0 && (
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {stats.pendingPayouts}
                </div>
              )}
            </Button>

            <Button 
              className="w-full justify-start" 
              variant="ghost"
              onClick={() => navigate('/mobile-admin/users')}
            >
              <Users className="mr-2 h-5 w-5" />
              <div className="flex-1 text-left">
                <div className="font-medium">User Management</div>
                <div className="text-xs text-muted-foreground">Manage roles and permissions</div>
              </div>
            </Button>

            <Button 
              className="w-full justify-start" 
              variant="ghost"
              onClick={() => navigate('/admin/features')}
            >
              <Settings className="mr-2 h-5 w-5" />
              <div className="flex-1 text-left">
                <div className="font-medium">Feature Flags</div>
                <div className="text-xs text-muted-foreground">Toggle platform features</div>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>

      {isMobile && <MobileBottomNav />}
    </div>
  );
}
