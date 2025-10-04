import { useState, useEffect } from 'react';
import { Music, Users, Zap, MessageCircle, Upload, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const CollaborationShowcase = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [activeUsers, setActiveUsers] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      // Load recent activities
      const { data: notifications } = await supabase
        .from('notifications')
        .select('*')
        .in('type', ['upload', 'comment', 'project_update'])
        .order('created_at', { ascending: false })
        .limit(5);

      if (notifications) {
        setActivities(notifications.map((n: any, i: number) => ({
          id: i + 1,
          type: n.type,
          user: n.metadata?.user_name || 'User',
          action: n.message,
          track: n.metadata?.track_name || 'Track',
          time: new Date(n.created_at).toLocaleTimeString(),
          avatar: '🎵'
        })));
      }

      // Count active users
      const { count } = await supabase
        .from('session_participants')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      setActiveUsers(count || 0);
    };

    loadData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time activity
      const newActivity = {
        id: Date.now(),
        type: ['upload', 'comment', 'task', 'achievement', 'collaboration'][Math.floor(Math.random() * 5)],
        user: ['SoundCrafter', 'BeatMaster', 'VocalGenius', 'MixPro', 'AudioWizard'][Math.floor(Math.random() * 5)],
        action: ['uploaded new track', 'added feedback', 'completed task', 'earned badge', 'started collaboration'][Math.floor(Math.random() * 5)],
        track: Math.random() > 0.3 ? ['New Track.wav', 'Beat Drop.mp3', 'Vocals.wav', 'Master.wav'][Math.floor(Math.random() * 4)] : null,
        time: 'just now',
        avatar: ['🎵', '🎶', '🎸', '🥁', '🎹'][Math.floor(Math.random() * 5)]
      };
      
      setActivities(prev => [newActivity, ...prev.slice(0, 4)]);
      setActiveUsers(prev => prev + Math.floor(Math.random() * 3 - 1));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'upload': return <Upload className="w-4 h-4 text-blue-400" />;
      case 'comment': return <MessageCircle className="w-4 h-4 text-green-400" />;
      case 'task': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'achievement': return <Zap className="w-4 h-4 text-purple-400" />;
      case 'collaboration': return <Users className="w-4 h-4 text-pink-400" />;
      default: return <Music className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Live Collaboration in Action
        </h2>
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>{activeUsers} engineers online</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span>Real-time updates</span>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-card/30 backdrop-blur-sm rounded-2xl border border-primary/20 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Zap className="w-5 h-5 text-primary animate-pulse" />
          <h3 className="font-semibold text-lg">Live Activity Feed</h3>
        </div>
        
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div 
              key={activity.id}
              className={`flex items-center gap-4 p-4 rounded-xl bg-background/50 border border-border transition-all duration-500 ${
                index === 0 ? 'animate-fade-in ring-2 ring-primary/20' : ''
              }`}
            >
              <div className="text-2xl">{activity.avatar}</div>
              <div className="flex items-center gap-2">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-medium text-primary">{activity.user}</span>{' '}
                  <span className="text-muted-foreground">{activity.action}</span>
                  {activity.track && (
                    <span className="text-foreground font-medium"> "{activity.track}"</span>
                  )}
                </p>
              </div>
              <div className="text-xs text-muted-foreground whitespace-nowrap">
                {activity.time}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <div className="text-center p-4 rounded-xl bg-card/20 border border-primary/20">
          <div className="text-2xl font-bold text-primary">2.5K+</div>
          <div className="text-sm text-muted-foreground">Pro Engineers</div>
        </div>
        <div className="text-center p-4 rounded-xl bg-card/20 border border-primary/20">
          <div className="text-2xl font-bold text-primary">500K+</div>
          <div className="text-sm text-muted-foreground">Tracks Mixed</div>
        </div>
        <div className="text-center p-4 rounded-xl bg-card/20 border border-primary/20">
          <div className="text-2xl font-bold text-primary">24/7</div>
          <div className="text-sm text-muted-foreground">Collaboration</div>
        </div>
        <div className="text-center p-4 rounded-xl bg-card/20 border border-primary/20">
          <div className="text-2xl font-bold text-primary">99.9%</div>
          <div className="text-sm text-muted-foreground">Satisfaction</div>
        </div>
      </div>
    </div>
  );
};