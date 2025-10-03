import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Radio, Music, Upload, Award, Users, Zap } from 'lucide-react';
import { useLiveActivity } from '@/hooks/useLiveActivity';
import { ScrollArea } from '@/components/ui/scroll-area';

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'upload': return <Upload className="w-4 h-4" />;
    case 'mix': return <Music className="w-4 h-4" />;
    case 'achievement': return <Award className="w-4 h-4" />;
    case 'collaboration': return <Users className="w-4 h-4" />;
    case 'session': return <Radio className="w-4 h-4" />;
    default: return <Zap className="w-4 h-4" />;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case 'upload': return 'text-blue-500';
    case 'mix': return 'text-purple-500';
    case 'achievement': return 'text-yellow-500';
    case 'collaboration': return 'text-green-500';
    case 'session': return 'text-pink-500';
    default: return 'text-primary';
  }
};

interface ActivityItemProps {
  activity: any;
  index: number;
}

const ActivityItem = ({ activity, index }: ActivityItemProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
    >
      {/* Avatar */}
      <Avatar className="w-10 h-10 border-2 border-border group-hover:border-primary transition-colors">
        <AvatarImage src={activity.avatar} alt={activity.user} />
        <AvatarFallback>{activity.user[0]}</AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{activity.user}</span>
          <Badge variant="outline" className="h-5 px-1.5 gap-1">
            <motion.div
              className={getActivityColor(activity.type)}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {getActivityIcon(activity.type)}
            </motion.div>
          </Badge>
        </div>
        
        <p className="text-xs text-muted-foreground line-clamp-2">
          {activity.action}
        </p>

        {activity.projectName && (
          <p className="text-xs text-primary truncate">
            {activity.projectName}
          </p>
        )}

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {activity.time}
          </span>
          {activity.isLive && (
            <Badge variant="default" className="h-4 px-1.5 text-xs gap-1">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              LIVE
            </Badge>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const LiveActivityFeed = () => {
  const { activities, isLive, filter, setFilter } = useLiveActivity();

  return (
    <Card className="h-full bg-background/50 backdrop-blur-sm border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-primary" />
            Live Activity
          </CardTitle>
          {isLive && (
            <Badge variant="default" className="gap-1 animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full" />
              LIVE
            </Badge>
          )}
        </div>
        
        {/* Filters */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {['all', 'global', 'network', 'genre'].map((f) => (
            <Badge
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              className="cursor-pointer capitalize"
              onClick={() => setFilter(f)}
            >
              {f}
            </Badge>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          <div className="px-6 pb-6 space-y-2">
            <AnimatePresence mode="popLayout">
              {activities.map((activity, index) => (
                <ActivityItem 
                  key={activity.id} 
                  activity={activity} 
                  index={index}
                />
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};