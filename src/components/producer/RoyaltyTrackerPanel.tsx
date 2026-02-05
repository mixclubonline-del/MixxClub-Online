import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, DollarSign, Music2, BarChart3 } from 'lucide-react';
import type { RoyaltySummary } from '@/types/producer-partnership';

interface RoyaltyTrackerPanelProps {
  summary: RoyaltySummary | null;
  loading: boolean;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

export const RoyaltyTrackerPanel = ({ summary, loading }: RoyaltyTrackerPanelProps) => {
  if (loading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="py-8 text-center">
          <Music2 className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No royalty data yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Royalties will appear here once tracks are released
          </p>
        </CardContent>
      </Card>
    );
  }

  const monthChange = summary.lastMonthRoyalties > 0
    ? ((summary.thisMonthRoyalties - summary.lastMonthRoyalties) / summary.lastMonthRoyalties) * 100
    : 0;

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Royalty Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <DollarSign className="h-3 w-3" />
              Total Royalties
            </div>
            <p className="text-xl font-bold text-primary">
              {formatCurrency(summary.totalRoyalties)}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <TrendingUp className="h-3 w-3" />
              This Month
            </div>
            <p className="text-xl font-bold">
              {formatCurrency(summary.thisMonthRoyalties)}
            </p>
            {monthChange !== 0 && (
              <Badge 
                variant="secondary" 
                className={`text-xs mt-1 ${monthChange > 0 ? 'text-green-500' : 'text-red-500'}`}
              >
                {monthChange > 0 ? '+' : ''}{monthChange.toFixed(1)}%
              </Badge>
            )}
          </div>

          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <Music2 className="h-3 w-3" />
              Total Streams
            </div>
            <p className="text-xl font-bold">
              {formatNumber(summary.totalStreams)}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <DollarSign className="h-3 w-3" />
              Pending
            </div>
            <p className="text-xl font-bold text-amber-500">
              {formatCurrency(summary.pendingPayouts)}
            </p>
          </div>
        </div>

        {/* Platform Breakdown */}
        {summary.royaltiesByPlatform.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3">By Platform</h4>
            <div className="space-y-2">
              {summary.royaltiesByPlatform.map((platform) => {
                const percentage = summary.totalRoyalties > 0
                  ? (platform.amount / summary.totalRoyalties) * 100
                  : 0;
                
                return (
                  <div key={platform.platform} className="flex items-center gap-3">
                    <span className="text-sm capitalize w-24 shrink-0">
                      {platform.platform.replace('_', ' ')}
                    </span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-20 text-right">
                      {formatCurrency(platform.amount)}
                    </span>
                    <span className="text-xs text-muted-foreground w-16 text-right">
                      {formatNumber(platform.streams)} plays
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Monthly Trend */}
        {summary.monthlyTrend.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3">6-Month Trend</h4>
            <div className="flex items-end gap-2 h-20">
              {summary.monthlyTrend.map((month, index) => {
                const maxRevenue = Math.max(...summary.monthlyTrend.map(m => m.revenue));
                const height = maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-1">
                    <div 
                      className="w-full bg-primary/20 rounded-t transition-all hover:bg-primary/40"
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                    <span className="text-xs text-muted-foreground">{month.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
