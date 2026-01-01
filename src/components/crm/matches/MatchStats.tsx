import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, UserCheck, MessageSquare, Star } from 'lucide-react';

interface MatchStatsProps {
  userType: 'artist' | 'engineer';
}

export const MatchStats: React.FC<MatchStatsProps> = ({ userType }) => {
  const stats = [
    {
      label: 'AI Match Score',
      value: '94%',
      icon: Sparkles,
      trend: '+5% this week',
      color: 'text-primary',
    },
    {
      label: 'Active Matches',
      value: '12',
      icon: UserCheck,
      trend: '3 new today',
      color: 'text-green-500',
    },
    {
      label: 'Conversations',
      value: '8',
      icon: MessageSquare,
      trend: '2 unread',
      color: 'text-blue-500',
    },
    {
      label: 'Avg. Rating',
      value: '4.9',
      icon: Star,
      trend: 'Top 5%',
      color: 'text-yellow-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
              <span className="text-xs text-muted-foreground">{stat.trend}</span>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
