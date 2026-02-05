import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, TrendingUp, TrendingDown, Wallet, PiggyBank, Disc3, Users, BarChart3 } from 'lucide-react';
import type { ProducerRevenueAnalytics } from '@/hooks/useProducerRevenueStreams';

interface ProducerRevenueOverviewProps {
  analytics: ProducerRevenueAnalytics | null;
  loading: boolean;
}

export const ProducerRevenueOverview = ({ analytics, loading }: ProducerRevenueOverviewProps) => {
  if (loading) {
    return (
      <div className="space-y-4">
        <Card className="bg-card border-border">
          <CardContent className="p-8">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-12 w-48 mb-4" />
            <Skeleton className="h-6 w-24" />
          </CardContent>
        </Card>
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
      </div>
    );
  }

  if (!analytics) return null;

  const formatCurrency = (value: number) =>
    value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

  const stats = [
    {
      label: 'This Month',
      value: analytics.thisMonth,
      icon: TrendingUp,
      color: 'text-primary',
      bgColor: 'bg-primary/20',
      trend: analytics.monthlyGrowth,
      description: 'Current period earnings',
    },
    {
      label: 'Available Balance',
      value: analytics.availableBalance,
      icon: Wallet,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      description: 'Ready for payout',
    },
    {
      label: 'Pending Earnings',
      value: analytics.pendingEarnings,
      icon: PiggyBank,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/20',
      description: 'Processing royalties',
    },
    {
      label: 'Avg Sale Value',
      value: analytics.averageSaleValue,
      icon: BarChart3,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      description: 'Per transaction',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Hero Revenue Card */}
      <Card className="bg-gradient-to-br from-primary/20 via-card to-card border-primary/30">
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <p className="text-muted-foreground mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Total Lifetime Revenue
              </p>
              <h2 className="text-5xl font-bold text-foreground mb-4">
                {formatCurrency(analytics.totalRevenue)}
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
            <div className="grid grid-cols-3 gap-6 lg:text-right">
              <div>
                <p className="text-muted-foreground text-sm flex items-center gap-1 lg:justify-end">
                  <Disc3 className="w-3 h-3" />
                  Beats Sold
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {analytics.totalBeatsSold}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm flex items-center gap-1 lg:justify-end">
                  <Users className="w-3 h-3" />
                  Active Collabs
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {analytics.activeCollabCount}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Streams</p>
                <p className="text-2xl font-bold text-primary">
                  {analytics.totalStreamCount.toLocaleString()}
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
                {formatCurrency(stat.value)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
