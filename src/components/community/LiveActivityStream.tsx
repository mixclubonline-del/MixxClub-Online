import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Music, Headphones, Trophy, TrendingUp, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface ActivityItem {
  id: string;
  type: string;
  user: string;
  message: string;
  timestamp: string;
}

interface LiveActivityStreamProps {
  activities: ActivityItem[];
}

export const LiveActivityStream = ({ activities }: LiveActivityStreamProps) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'upload':
        return Music;
      case 'mix':
        return Headphones;
      case 'achievement':
        return Trophy;
      default:
        return TrendingUp;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'upload':
        return 'text-primary';
      case 'mix':
        return 'text-accent-blue';
      case 'achievement':
        return 'text-yellow-500';
      default:
        return 'text-green-500';
    }
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="w-6 h-6 text-primary animate-pulse" />
          Live Community Pulse
        </h2>
        <Badge variant="secondary" className="animate-pulse">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-ping" />
          Live
        </Badge>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {activities.slice(0, 10).map((activity, index) => {
          const Icon = getActivityIcon(activity.type);
          const colorClass = getActivityColor(activity.type);
          
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${colorClass}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-semibold">{activity.user}</span>{' '}
                  <span className="text-muted-foreground">{activity.message}</span>
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Clock className="w-3 h-3" />
                  {new Date(activity.timestamp).toLocaleString()}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
};
