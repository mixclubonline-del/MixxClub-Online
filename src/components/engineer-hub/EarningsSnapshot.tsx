import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, TrendingUp, Clock, Award } from 'lucide-react';

export default function EarningsSnapshot() {
  const { user } = useAuth();

  const { data: earnings, isLoading } = useQuery({
    queryKey: ['engineer-earnings', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const [thisMonth, pending, topProject, allEarnings] = await Promise.all([
        supabase
          .from('engineer_earnings')
          .select('total_amount')
          .eq('engineer_id', user.id)
          .eq('status', 'paid')
          .gte('created_at', firstDayOfMonth),
        supabase
          .from('engineer_earnings')
          .select('total_amount')
          .eq('engineer_id', user.id)
          .eq('status', 'pending'),
        supabase
          .from('engineer_earnings')
          .select('total_amount, projects(title)')
          .eq('engineer_id', user.id)
          .eq('status', 'paid')
          .order('total_amount', { ascending: false })
          .limit(1)
          .single(),
        supabase
          .from('engineer_earnings')
          .select('total_amount, created_at')
          .eq('engineer_id', user.id)
          .eq('status', 'paid')
          .order('created_at', { ascending: true })
      ]);

      const thisMonthTotal = thisMonth.data?.reduce((sum, e) => sum + (Number(e.total_amount) || 0), 0) || 0;
      const pendingTotal = pending.data?.reduce((sum, e) => sum + (Number(e.total_amount) || 0), 0) || 0;

      let trend = 0;
      if (allEarnings.data && allEarnings.data.length >= 6) {
        const last6 = allEarnings.data.slice(-6);
        const first3 = last6.slice(0, 3).reduce((sum, e) => sum + (Number(e.total_amount) || 0), 0) / 3;
        const last3 = last6.slice(3).reduce((sum, e) => sum + (Number(e.total_amount) || 0), 0) / 3;
        trend = first3 > 0 ? ((last3 - first3) / first3) * 100 : 0;
      }

      return {
        thisMonth: thisMonthTotal,
        pending: pendingTotal,
        topProject: topProject.data,
        trendPercentage: trend
      };
    },
    enabled: !!user?.id,
  });

  if (!user) {
    return (
      <Card className="bg-card/30 backdrop-blur-sm border-white/5">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Sign in to view earnings</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-card/30 backdrop-blur-sm border-white/5">
            <CardContent className="p-4">
              <Skeleton className="h-10 w-10 rounded-full mb-3" />
              <Skeleton className="h-6 w-20 mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      icon: DollarSign,
      value: `$${earnings?.thisMonth?.toFixed(2) || '0.00'}`,
      label: 'This Month',
      color: 'text-green-500'
    },
    {
      icon: Clock,
      value: `$${earnings?.pending?.toFixed(2) || '0.00'}`,
      label: 'Pending Payout',
      color: 'text-yellow-500'
    },
    {
      icon: TrendingUp,
      value: `${earnings?.trendPercentage ? (earnings.trendPercentage > 0 ? '+' : '') + earnings.trendPercentage.toFixed(1) : '0'}%`,
      label: 'Growth Trend',
      color: earnings?.trendPercentage && earnings.trendPercentage > 0 ? 'text-green-500' : 'text-red-500'
    },
    {
      icon: Award,
      value: `$${earnings?.topProject?.total_amount?.toFixed(2) || '0.00'}`,
      label: 'Top Project',
      color: 'text-primary'
    }
  ];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <Card key={i} className="bg-card/30 backdrop-blur-sm border-white/5 hover:border-primary/20 transition-all">
          <CardContent className="p-4">
            <stat.icon className={`w-10 h-10 mb-3 ${stat.color}`} />
            <p className="text-2xl font-bold mb-1">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
