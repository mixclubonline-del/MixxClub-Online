import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Flame, 
  Headphones, 
  TrendingUp, 
  Radio, 
  Users, 
  Music2,
  Zap,
  Star,
  Play,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ActivityItem {
  id: string;
  type: 'session' | 'project' | 'collab' | 'drop';
  title: string;
  description: string;
  timestamp: Date;
  user?: { name: string; avatar?: string };
  metadata?: any;
}

interface TrendingEngineer {
  id: string;
  name: string;
  avatar?: string;
  specialty: string;
  rating: number;
  activeNow: boolean;
  trendingScore: number;
}

const GENRE_FILTERS = [
  { id: 'all', label: 'All', icon: Music2 },
  { id: 'trap', label: 'Trap', icon: Flame },
  { id: 'drill', label: 'Drill', icon: Zap },
  { id: 'rnb', label: 'R&B', icon: Headphones },
  { id: 'boombap', label: 'Boom Bap', icon: Radio },
  { id: 'alternative', label: 'Alternative', icon: Star },
];

export const HipHopPulse = () => {
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [trendingEngineers, setTrendingEngineers] = useState<TrendingEngineer[]>([]);
  const [activeSessions, setActiveSessions] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPulseData();
    
    // Subscribe to realtime activity
    const channel = supabase
      .channel('activity-feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'activity_feed' },
        (payload) => {
          if (payload.new) {
            const newActivity: ActivityItem = {
              id: payload.new.id,
              type: payload.new.activity_type as any,
              title: payload.new.title,
              description: payload.new.description || '',
              timestamp: new Date(payload.new.created_at),
              metadata: payload.new.metadata,
            };
            setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedGenre]);

  const fetchPulseData = async () => {
    try {
      setLoading(true);

      // Fetch recent activity
      const { data: activityData } = await supabase
        .from('activity_feed')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (activityData) {
        setActivities(activityData.map(a => ({
          id: a.id,
          type: a.activity_type as any,
          title: a.title,
          description: a.description || '',
          timestamp: new Date(a.created_at),
          metadata: a.metadata,
        })));
      }

      // Fetch trending engineers
      const { data: engineers } = await supabase
        .from('engineer_profiles')
        .select(`
          user_id,
          specialties,
          rating,
          availability_status,
          trending_score
        `)
        .eq('availability_status', 'available')
        .order('rating', { ascending: false })
        .limit(5);

      // Get profile info for engineers
      if (engineers && engineers.length > 0) {
        const userIds = engineers.map(e => e.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

        setTrendingEngineers(engineers.map(e => {
          const profile = profileMap.get(e.user_id);
          return {
            id: e.user_id,
            name: profile?.full_name || 'Engineer',
            avatar: profile?.avatar_url,
            specialty: Array.isArray(e.specialties) ? e.specialties[0] || 'Mixing' : 'Mixing',
            rating: e.rating || 4.5,
            activeNow: e.availability_status === 'available',
            trendingScore: e.trending_score || 0,
          };
        }));
      }

      // Count active sessions
      const { count } = await supabase
        .from('collaboration_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active');

      setActiveSessions(count || 0);

    } catch (error) {
      console.error('Error fetching pulse data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'session': return <Radio className="w-4 h-4" />;
      case 'project': return <Music2 className="w-4 h-4" />;
      case 'collab': return <Users className="w-4 h-4" />;
      case 'drop': return <Flame className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'session': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'project': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'collab': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'drop': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-primary/20 text-primary border-primary/30';
    }
  };

  const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-card animate-pulse" />
            </div>
            <div>
              <CardTitle className="text-xl">Hip-Hop Pulse</CardTitle>
              <p className="text-sm text-muted-foreground">What's happening right now</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-500/10 border-green-500/30 text-green-400">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
              {activeSessions} Live Sessions
            </Badge>
          </div>
        </div>

        {/* Genre Filters */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
          {GENRE_FILTERS.map((genre) => {
            const Icon = genre.icon;
            return (
              <Button
                key={genre.id}
                variant={selectedGenre === genre.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedGenre(genre.id)}
                className={cn(
                  "flex-shrink-0 gap-2",
                  selectedGenre === genre.id && "bg-gradient-to-r from-primary to-purple-600"
                )}
              >
                <Icon className="w-4 h-4" />
                {genre.label}
              </Button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Trending Engineers */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Trending Engineers
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {trendingEngineers.length > 0 ? (
              trendingEngineers.map((engineer, idx) => (
                <motion.div
                  key={engineer.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex-shrink-0 p-3 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 transition-all cursor-pointer min-w-[140px]"
                >
                  <div className="relative mb-2">
                    <Avatar className="w-12 h-12 mx-auto">
                      <AvatarImage src={engineer.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white">
                        {engineer.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {engineer.activeNow && (
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-card" />
                    )}
                  </div>
                  <p className="font-medium text-center text-sm truncate">{engineer.name}</p>
                  <p className="text-xs text-muted-foreground text-center truncate">{engineer.specialty}</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-medium">{engineer.rating.toFixed(1)}</span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground py-4 w-full text-center">
                No trending engineers right now
              </div>
            )}
          </div>
        </div>

        {/* Live Activity Feed */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <Radio className="w-4 h-4" />
            Live Activity
          </h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {activities.length > 0 ? (
                activities.map((activity, idx) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-card/30 border border-border/30 hover:border-primary/20 transition-colors"
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border",
                      getActivityColor(activity.type)
                    )}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                      <Clock className="w-3 h-3" />
                      {timeAgo(activity.timestamp)}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Radio className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No activity yet today</p>
                  <p className="text-xs">Be the first to make some noise!</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 text-center">
            <p className="text-2xl font-bold text-blue-400">{activeSessions}</p>
            <p className="text-xs text-muted-foreground">Live Now</p>
          </div>
          <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 text-center">
            <p className="text-2xl font-bold text-purple-400">{trendingEngineers.length}</p>
            <p className="text-xs text-muted-foreground">Hot Engineers</p>
          </div>
          <div className="p-3 rounded-lg bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20 text-center">
            <p className="text-2xl font-bold text-orange-400">{activities.length}</p>
            <p className="text-xs text-muted-foreground">Today's Drops</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
