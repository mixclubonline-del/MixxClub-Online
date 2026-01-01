import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Target, TrendingUp, Award, Zap, Calendar, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface GrowthStatsProps {
  userType: 'artist' | 'engineer';
}

export const GrowthStats: React.FC<GrowthStatsProps> = ({ userType }) => {
  const stats = userType === 'artist' ? [
    { label: 'Active Goals', value: '5', icon: Target, color: 'text-blue-500', change: '+2 this month' },
    { label: 'Skills Mastered', value: '12', icon: Award, color: 'text-purple-500', change: '+3 this quarter' },
    { label: 'Career Score', value: '78', icon: TrendingUp, color: 'text-emerald-500', change: '+8% growth' },
    { label: 'Weekly Streak', value: '14', icon: Zap, color: 'text-orange-500', change: 'days active' },
    { label: 'Milestones Hit', value: '8', icon: CheckCircle, color: 'text-green-500', change: '3 pending' },
    { label: 'Next Review', value: '3d', icon: Calendar, color: 'text-cyan-500', change: 'AI coaching' },
  ] : [
    { label: 'Active Goals', value: '7', icon: Target, color: 'text-blue-500', change: '+1 this week' },
    { label: 'Certifications', value: '4', icon: Award, color: 'text-purple-500', change: '2 in progress' },
    { label: 'Skill Level', value: 'Pro', icon: TrendingUp, color: 'text-emerald-500', change: 'Top 15%' },
    { label: 'Learning Streak', value: '21', icon: Zap, color: 'text-orange-500', change: 'days active' },
    { label: 'Projects Done', value: '34', icon: CheckCircle, color: 'text-green-500', change: '+5 this month' },
    { label: 'Next Goal', value: '2d', icon: Calendar, color: 'text-cyan-500', change: 'deadline' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-all">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-xs text-muted-foreground truncate">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{stat.change}</div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
