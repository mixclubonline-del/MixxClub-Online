import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Heart, Share2, Zap, TrendingUp, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCommunityStats } from '@/hooks/useCommunityStats';

interface CommunityStatsProps {
  userType: 'artist' | 'engineer' | 'producer';
}

export const CommunityStats: React.FC<CommunityStatsProps> = ({ userType }) => {
  const { data: stats, isLoading } = useCommunityStats();

  const computedStats = [
    {
      label: 'Connections',
      value: stats?.totalUsers || 0,
      change: '+12%',
      progress: Math.min(100, ((stats?.totalUsers || 0) / 1000) * 100),
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Total Artists',
      value: stats?.totalArtists || 0,
      change: '+18%',
      progress: Math.min(100, ((stats?.totalArtists || 0) / 500) * 100),
      icon: Heart,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
    },
    {
      label: 'Engineers',
      value: stats?.totalEngineers || 0,
      change: '+15%',
      progress: Math.min(100, ((stats?.totalEngineers || 0) / 200) * 100),
      icon: Share2,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Active Sessions',
      value: stats?.activeSessions || 0,
      change: `${stats?.activeSessions || 0} live`,
      progress: Math.min(100, ((stats?.activeSessions || 0) / 50) * 100),
      icon: MessageCircle,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: 'Projects Done',
      value: stats?.projectsCompleted || 0,
      change: '+8',
      progress: Math.min(100, ((stats?.projectsCompleted || 0) / 500) * 100),
      icon: Zap,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
    },
    {
      label: 'Total Earnings',
      value: `$${((stats?.totalEarnings || 0) / 100).toLocaleString()}`,
      change: 'Paid out',
      progress: Math.min(100, ((stats?.totalEarnings || 0) / 100000) * 100),
      icon: TrendingUp,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {computedStats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="bg-card/50 border-border/50 p-4 hover:border-primary/50 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <span className="text-xs text-green-400 font-medium">{stat.change}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            <Progress value={stat.progress} className="mt-3 h-1" />
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
