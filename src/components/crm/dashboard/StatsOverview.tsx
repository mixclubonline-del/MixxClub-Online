import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, Users, TrendingUp, DollarSign } from 'lucide-react';

interface StatsOverviewProps {
  stats: {
    totalProjects: number;
    totalMatches: number;
    totalRevenue: number;
    activeProjects: number;
  };
}

export const StatsOverview = ({ stats }: StatsOverviewProps) => {
  const cards = [
    {
      title: 'Active Projects',
      value: stats.activeProjects,
      icon: Music,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Total Matches',
      value: stats.totalMatches,
      icon: Users,
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Completed',
      value: stats.totalProjects - stats.activeProjects,
      icon: TrendingUp,
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Total Earnings',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      gradient: 'from-amber-500 to-orange-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ title, value, icon: Icon, gradient }) => (
        <Card key={title} variant="glass-near" hover="lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <div className={`p-2 rounded-lg bg-gradient-to-r ${gradient}`}>
              <Icon className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
