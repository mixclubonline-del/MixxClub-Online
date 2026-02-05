import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Music, TrendingUp, Play, DollarSign } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { ProducerRevenueAnalytics } from '@/hooks/useProducerRevenueStreams';

interface RoyaltyEarningsPanelProps {
  analytics: ProducerRevenueAnalytics | null;
  loading: boolean;
}

const platformColors: Record<string, string> = {
  spotify: '#1DB954',
  apple_music: '#FA243C',
  youtube: '#FF0000',
  tidal: '#00FFFF',
  amazon: '#FF9900',
  other: 'hsl(var(--muted-foreground))',
};

const platformLabels: Record<string, string> = {
  spotify: 'Spotify',
  apple_music: 'Apple Music',
  youtube: 'YouTube Music',
  tidal: 'Tidal',
  amazon: 'Amazon Music',
  other: 'Other Platforms',
};

export const RoyaltyEarningsPanel = ({ analytics, loading }: RoyaltyEarningsPanelProps) => {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="bg-card border-border">
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="bg-card border-border">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analytics) return null;

  // Build royalty trend data from revenueByMonth
  const trendData = analytics.revenueByMonth.map(m => ({
    month: m.month,
    royalties: m.royalties,
  }));

  // Mock platform breakdown (would come from beat_royalties in real implementation)
  const platformBreakdown = [
    { platform: 'spotify', amount: analytics.royaltyEarnings * 0.45, streams: analytics.totalStreamCount * 0.45 },
    { platform: 'apple_music', amount: analytics.royaltyEarnings * 0.25, streams: analytics.totalStreamCount * 0.25 },
    { platform: 'youtube', amount: analytics.royaltyEarnings * 0.20, streams: analytics.totalStreamCount * 0.20 },
    { platform: 'other', amount: analytics.royaltyEarnings * 0.10, streams: analytics.totalStreamCount * 0.10 },
  ].filter(p => p.amount > 0);

  const totalRoyalties = platformBreakdown.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Total Royalties</p>
                <p className="text-2xl font-bold text-foreground">
                  ${analytics.royaltyEarnings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Play className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Total Streams</p>
                <p className="text-2xl font-bold text-foreground">
                  {analytics.totalStreamCount.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Music className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Pending Payouts</p>
                <p className="text-2xl font-bold text-foreground">
                  ${analytics.pendingEarnings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Royalty Trend Chart */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Royalty Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trendData.some(d => d.royalties > 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="royaltyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(150, 80%, 50%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(150, 80%, 50%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Royalties']}
                  />
                  <Area
                    type="monotone"
                    dataKey="royalties"
                    stroke="hsl(150, 80%, 50%)"
                    fill="url(#royaltyGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No royalty data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Platform Breakdown */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Platform Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {platformBreakdown.length > 0 ? (
              <div className="space-y-4">
                {platformBreakdown.map((platform) => {
                  const percentage = totalRoyalties > 0 ? (platform.amount / totalRoyalties) * 100 : 0;
                  const color = platformColors[platform.platform] || platformColors.other;
                  
                  return (
                    <div key={platform.platform} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-sm font-medium text-foreground">
                            {platformLabels[platform.platform] || platform.platform}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="text-xs">
                            {platform.streams.toLocaleString()} streams
                          </Badge>
                          <span className="text-sm font-bold text-foreground">
                            ${platform.amount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <Progress 
                        value={percentage}
                        className="h-2"
                        style={{ 
                          '--progress-background': color 
                        } as React.CSSProperties}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                No platform data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
