import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Users, Heart, Share2, Zap, TrendingUp, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface CommunityStatsProps {
  userType: 'artist' | 'engineer';
}

export const CommunityStats: React.FC<CommunityStatsProps> = ({ userType }) => {
  const stats = [
    {
      label: 'Connections',
      value: 2156,
      change: '+12%',
      progress: 65,
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Total Likes',
      value: 3421,
      change: '+28%',
      progress: 85,
      icon: Heart,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
    },
    {
      label: 'Shares',
      value: 847,
      change: '+15%',
      progress: 72,
      icon: Share2,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Engagement',
      value: '34.2%',
      change: '+5%',
      progress: 78,
      icon: MessageCircle,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: 'Viral Score',
      value: 78,
      change: '+8',
      progress: 78,
      icon: Zap,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
    },
    {
      label: 'Growth Rate',
      value: '+8.5%',
      change: 'Monthly',
      progress: 85,
      icon: TrendingUp,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat, index) => (
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
