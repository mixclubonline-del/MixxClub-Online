import { motion } from 'framer-motion';
import { CharacterEmptyState } from '@/components/characters/CharacterEmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Disc3, TrendingUp, DollarSign, Users } from 'lucide-react';
import { useProducerRevenueStreams } from '@/hooks/useProducerRevenueStreams';
import { usePersonalUnlockables } from '@/hooks/useUnlockables';
import { PersonalUnlocksWidget } from '@/components/unlock/PersonalUnlocksWidget';

export const ProducerDashboardHub = () => {
  const { analytics, loading } = useProducerRevenueStreams();
  const { data: personalUnlockables, isLoading: unlockablesLoading } = usePersonalUnlockables('producer');
  
  const hasData = !loading && analytics && (analytics.totalBeatsSold > 0 || analytics.totalRevenue > 0);

  if (!loading && !hasData) {
    return (
      <CharacterEmptyState
        type="beats"
        characterId="tempo"
        title="Your Command Center Awaits"
        actionLabel="Upload Your First Beat"
        onAction={() => {}}
      />
    );
  }

  const formatCurrency = (value: number) =>
    value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
 
  const stats = [
    {
      icon: Disc3,
      label: 'Beats Sold',
      value: analytics?.totalBeatsSold || 0,
      displayValue: (analytics?.totalBeatsSold || 0).toString(),
      color: 'text-primary',
      bgColor: 'bg-primary/20',
    },
    {
      icon: TrendingUp,
      label: 'Total Streams',
      value: analytics?.totalStreamCount || 0,
      displayValue: (analytics?.totalStreamCount || 0).toLocaleString(),
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
    },
    {
      icon: DollarSign,
      label: 'Total Revenue',
      value: analytics?.totalRevenue || 0,
      displayValue: formatCurrency(analytics?.totalRevenue || 0),
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      trend: analytics?.monthlyGrowth,
    },
    {
      icon: Users,
      label: 'Active Collabs',
      value: analytics?.activeCollabCount || 0,
      displayValue: (analytics?.activeCollabCount || 0).toString(),
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/20',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * (idx + 1) }}
          >
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  {stat.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-foreground">{stat.displayValue}</p>
                  {stat.trend !== undefined && (
                    <Badge 
                      variant="outline" 
                      className={stat.trend >= 0 ? 'text-green-400 border-green-500/30' : 'text-red-400 border-red-500/30'}
                    >
                      {stat.trend >= 0 ? '+' : ''}{stat.trend.toFixed(1)}%
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Beat Empire Progress */}
      <PersonalUnlocksWidget
        unlockables={personalUnlockables?.unlockables || []}
        title="Beat Empire Progress"
        description="Your journey to producer greatness"
        isLoading={unlockablesLoading}
      />
    </div>
  );
};