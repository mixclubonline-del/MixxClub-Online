import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, TrendingUp, TrendingDown, Wallet, PiggyBank, Target } from 'lucide-react';
import { RevenueAnalytics } from '@/hooks/useRevenueStreams';

interface RevenueOverviewProps {
  analytics: RevenueAnalytics | null;
  loading: boolean;
}

export const RevenueOverview = ({ analytics, loading }: RevenueOverviewProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) return null;

  const stats = [
    {
      label: 'Total Revenue',
      value: analytics.totalRevenue,
      icon: DollarSign,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      trend: analytics.monthlyGrowth,
      description: 'All time earnings',
    },
    {
      label: 'This Month',
      value: analytics.thisMonth,
      icon: TrendingUp,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      trend: analytics.monthlyGrowth,
      description: 'Current period',
    },
    {
      label: 'Available Balance',
      value: analytics.totalRevenue - analytics.completedPayouts - analytics.pendingPayouts,
      icon: Wallet,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      description: 'Ready for payout',
    },
    {
      label: 'Pending Payouts',
      value: analytics.pendingPayouts,
      icon: PiggyBank,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
      description: 'Processing',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Main Revenue Card */}
      <Card className="bg-gradient-to-br from-primary/20 via-card to-card border-primary/30">
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <p className="text-muted-foreground mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Total Lifetime Revenue
              </p>
              <h2 className="text-5xl font-bold text-foreground mb-4">
                ${analytics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              <div className="flex items-center gap-3">
                {analytics.monthlyGrowth >= 0 ? (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +{analytics.monthlyGrowth.toFixed(1)}%
                  </Badge>
                ) : (
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                    <TrendingDown className="w-3 h-3 mr-1" />
                    {analytics.monthlyGrowth.toFixed(1)}%
                  </Badge>
                )}
                <span className="text-sm text-muted-foreground">vs last month</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 lg:text-right">
              <div>
                <p className="text-muted-foreground text-sm">Avg Project Value</p>
                <p className="text-2xl font-bold text-foreground">
                  ${analytics.averageProjectValue.toFixed(0)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Top Stream</p>
                <p className="text-lg font-semibold text-primary truncate max-w-[150px]">
                  {analytics.topPerformingStream}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx} className="bg-card border-border hover:border-primary/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                {stat.trend !== undefined && (
                  <Badge variant="outline" className={stat.trend >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {stat.trend >= 0 ? '+' : ''}{stat.trend.toFixed(1)}%
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground">
                ${stat.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
