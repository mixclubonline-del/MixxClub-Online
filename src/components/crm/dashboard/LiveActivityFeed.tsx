import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Radio, Music, Upload, Award, Users, Zap, Clock, CheckCircle, MessageSquare, TrendingUp, Sparkles } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'upload': return <Upload className="w-4 h-4" />;
    case 'file_upload': return <Upload className="w-4 h-4" />;
    case 'mix': return <Music className="w-4 h-4" />;
    case 'project_update': return <Music className="w-4 h-4" />;
    case 'achievement': return <Award className="w-4 h-4" />;
    case 'badge_earned': return <Award className="w-4 h-4" />;
    case 'collaboration': return <Users className="w-4 h-4" />;
    case 'session': return <Radio className="w-4 h-4" />;
    case 'comment': return <MessageSquare className="w-4 h-4" />;
    case 'project_complete': return <CheckCircle className="w-4 h-4" />;
    case 'payment_received': return <TrendingUp className="w-4 h-4" />;
    default: return <Sparkles className="w-4 h-4" />;
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


export const LiveActivityFeed = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadActivities();
      const channel = subscribeToActivities();
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const loadActivities = async () => {
    try {
      const { data } = await (supabase as any)
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(20);

      setActivities(data || []);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToActivities = () => {
    const channel = supabase
      .channel('activity-feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user?.id}`
        },
        (payload) => {
          setActivities(prev => [payload.new, ...prev.slice(0, 19)]);
        }
      )
      .subscribe();
    return channel;
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now.getTime() - time.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return time.toLocaleDateString();
  };

  if (loading) {
    return (
      <Card className="h-full bg-background/50 backdrop-blur-sm border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-primary" />
            Live Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-10 h-10 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full bg-background/50 backdrop-blur-sm border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-primary" />
            Live Activity
          </CardTitle>
          <Badge variant="default" className="gap-1 animate-pulse">
            <div className="w-2 h-2 bg-white rounded-full" />
            LIVE
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          <div className="px-6 pb-6 space-y-2">
            <AnimatePresence mode="popLayout">
              {activities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No recent activity</p>
                </div>
              ) : (
                activities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                  >
                    <Badge variant="outline" className="h-10 w-10 p-2 rounded-full">
                      <div className={getActivityColor(activity.type)}>
                        {getActivityIcon(activity.type)}
                      </div>
                    </Badge>

                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="font-medium text-sm truncate">{activity.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {activity.message}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(activity.created_at)}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};