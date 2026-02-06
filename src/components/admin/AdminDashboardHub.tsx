import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Headphones, DollarSign, Activity, TrendingUp, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface PlatformStats {
  totalUsers: number;
  activeSessions: number;
  totalRevenue: number;
  recentSignups: any[];
  roleDistribution: Record<string, number>;
  recentActivity: any[];
}

export const AdminDashboardHub = () => {
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0,
    activeSessions: 0,
    totalRevenue: 0,
    recentSignups: [],
    roleDistribution: {},
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlatformStats();
  }, []);

  const fetchPlatformStats = async () => {
    try {
      const [
        { count: userCount },
        { count: sessionCount },
        { data: revenueData },
        { data: signups },
        { data: roles },
        { data: activity },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('collaboration_sessions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('payments').select('amount').eq('status', 'completed'),
        supabase.from('profiles').select('id, full_name, avatar_url, created_at').order('created_at', { ascending: false }).limit(8),
        supabase.from('user_roles').select('role'),
        supabase.from('activity_feed').select('*').order('created_at', { ascending: false }).limit(10),
      ]);

      const totalRevenue = revenueData?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      const distribution: Record<string, number> = {};
      roles?.forEach((r) => {
        distribution[r.role] = (distribution[r.role] || 0) + 1;
      });

      setStats({
        totalUsers: userCount || 0,
        activeSessions: sessionCount || 0,
        totalRevenue,
        recentSignups: signups || [],
        roleDistribution: distribution,
        recentActivity: activity || [],
      });
    } catch (error) {
      console.error('Failed to fetch platform stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const metricCards = [
    { icon: Users, label: 'Total Users', value: stats.totalUsers, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { icon: Headphones, label: 'Active Sessions', value: stats.activeSessions, color: 'text-green-500', bg: 'bg-green-500/10' },
    { icon: DollarSign, label: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { icon: TrendingUp, label: 'Roles Assigned', value: Object.values(stats.roleDistribution).reduce((a, b) => a + b, 0), color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((metric, i) => (
          <Card key={i} className="bg-background/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${metric.bg}`}>
                  <metric.icon className={`w-5 h-5 ${metric.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Role Distribution */}
        <Card className="bg-background/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Role Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.roleDistribution).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">{role}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${Math.min((count / stats.totalUsers) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Signups */}
        <Card className="bg-background/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-4 h-4" /> Recent Signups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentSignups.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                      {user.full_name?.charAt(0) || '?'}
                    </div>
                    <span className="text-sm text-foreground">{user.full_name || 'Unnamed'}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(user.created_at), 'MMM d')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-background/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-4 h-4" /> Recent Platform Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
            ) : (
              stats.recentActivity.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.activity_type}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(item.created_at), 'MMM d, h:mm a')}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
