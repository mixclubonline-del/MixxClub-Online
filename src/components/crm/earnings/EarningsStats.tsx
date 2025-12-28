import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Clock, Users, TrendingUp } from 'lucide-react';
import type { EarningsSummary } from '@/hooks/usePartnershipEarnings';

interface EarningsStatsProps {
  summary: EarningsSummary | null;
}

export const EarningsStats = ({ summary }: EarningsStatsProps) => {
  const stats = [
    {
      label: 'Total Earnings',
      value: `$${(summary?.totalEarnings || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Pending Payments',
      value: `$${(summary?.pendingPayments || 0).toLocaleString()}`,
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      label: 'Active Partnerships',
      value: summary?.activePartnerships || 0,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Top Partner Earnings',
      value: `$${(summary?.topPartners?.[0]?.totalEarnings || 0).toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-bold text-foreground">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
