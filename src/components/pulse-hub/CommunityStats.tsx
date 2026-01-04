import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Radio, CheckCircle, DollarSign } from 'lucide-react';
import { useDemoData } from '@/hooks/useDemoData';
import { motion } from 'framer-motion';

export default function CommunityStats() {
  const { data, isLoading } = useDemoData('stats');

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-card/30 backdrop-blur-sm border-white/5">
            <CardContent className="p-4">
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = data?.stats || {
    totalEngineers: 0,
    activeSession: 0,
    projectsCompleted: 0,
    totalEarnings: 0
  };

  const statCards = [
    {
      label: 'Engineers',
      value: stats.totalEngineers.toLocaleString(),
      icon: Users,
      color: 'text-primary'
    },
    {
      label: 'Active Sessions',
      value: stats.activeSession.toLocaleString(),
      icon: Radio,
      color: 'text-green-500'
    },
    {
      label: 'Projects Completed',
      value: stats.projectsCompleted.toLocaleString(),
      icon: CheckCircle,
      color: 'text-accent-cyan'
    },
    {
      label: 'Total Earnings',
      value: `$${(stats.totalEarnings / 1000).toFixed(0)}K`,
      icon: DollarSign,
      color: 'text-yellow-500'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((stat, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <Card className="bg-card/30 backdrop-blur-sm border-white/5 hover:border-primary/20 transition-all group">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="relative">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  {stat.label === 'Active Sessions' && (
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                    </span>
                  )}
                </div>
                <span className="text-2xl font-bold group-hover:text-primary transition-colors">{stat.value}</span>
              </div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
