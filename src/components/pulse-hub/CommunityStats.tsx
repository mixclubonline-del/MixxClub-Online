import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Briefcase, DollarSign, TrendingUp } from 'lucide-react';

export default function CommunityStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['community-stats'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];

      const [totalMembers, activeToday, projectsInProgress, totalEarnings] = await Promise.all([
        supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true }),
        supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', today),
        supabase
          .from('projects')
          .select('id', { count: 'exact', head: true })
          .in('status', ['pending', 'in_progress']),
        supabase
          .from('engineer_earnings')
          .select('total_amount')
          .eq('status', 'paid')
      ]);

      const earnings = totalEarnings.data?.reduce((sum, e) => sum + (Number(e.total_amount) || 0), 0) || 0;

      return {
        totalMembers: totalMembers.count || 0,
        activeToday: activeToday.count || 0,
        projectsInProgress: projectsInProgress.count || 0,
        totalEarnings: earnings
      };
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-card/30 backdrop-blur-sm border-white/5">
            <CardContent className="p-4 text-center">
              <Skeleton className="w-10 h-10 rounded-full mx-auto mb-3" />
              <Skeleton className="h-6 w-16 mx-auto mb-2" />
              <Skeleton className="h-3 w-24 mx-auto" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      icon: Users,
      value: stats?.totalMembers.toLocaleString() || '0',
      label: 'Total Members',
      color: 'text-primary'
    },
    {
      icon: TrendingUp,
      value: stats?.activeToday.toLocaleString() || '0',
      label: 'Active Today',
      color: 'text-green-500'
    },
    {
      icon: Briefcase,
      value: stats?.projectsInProgress.toLocaleString() || '0',
      label: 'Projects Active',
      color: 'text-accent-cyan'
    },
    {
      icon: DollarSign,
      value: `$${(stats?.totalEarnings || 0).toLocaleString()}`,
      label: 'Total Earnings',
      color: 'text-yellow-500'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((stat, i) => (
        <Card key={i} className="bg-card/30 backdrop-blur-sm border-white/5 hover:border-primary/20 transition-all">
          <CardContent className="p-4 text-center">
            <stat.icon className={`w-10 h-10 mx-auto mb-3 ${stat.color}`} />
            <p className="text-2xl font-bold mb-1">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
