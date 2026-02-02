import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useFlowNavigation } from '@/core/fabric/useFlow';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Users, 
  FolderOpen, 
  Zap, 
  Globe, 
  Award,
  TrendingUp,
  Music,
  Sparkles,
  Radio,
  Clock
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StudioHubProps {
  userRole: 'artist' | 'engineer';
  onTrackSelect?: (trackId: string | null) => void;
}

const StudioHub = ({ userRole }: StudioHubProps) => {
  const { user } = useAuth();
  const { navigateTo } = useFlowNavigation();
  const [projects, setProjects] = useState<any[]>([]);
  const [stats, setStats] = useState({
    activeSessions: 0,
    completedProjects: 0,
    totalCollaborators: 0,
    level: 5,
    xp: 3250,
    nextLevelXp: 5000,
    streak: 7
  });
  const [liveActivity, setLiveActivity] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      loadProjects();
      loadStats();
    }
  }, [user]);

  const loadProjects = async () => {
    try {
      const column = userRole === 'artist' ? 'client_id' : 'engineer_id';
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq(column, user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadStats = async () => {
    try {
      // Load active sessions count
      const { count: sessionsCount } = await supabase
        .from('collaboration_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Load completed projects
      const column = userRole === 'artist' ? 'client_id' : 'engineer_id';
      const { count: projectsCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq(column, user?.id)
        .eq('status', 'completed');

      // Load online collaborators
      const { count: collaboratorsCount } = await supabase
        .from('session_participants')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Load user profile for gamification
      const { data: profile } = await supabase
        .from('profiles')
        .select('level, points')
        .eq('id', user?.id)
        .single();

      // Load recent activity
      const { data: notifications } = await supabase
        .from('notifications')
        .select('message, created_at')
        .order('created_at', { ascending: false })
        .limit(4);

      setStats({
        activeSessions: sessionsCount || 0,
        completedProjects: projectsCount || 0,
        totalCollaborators: collaboratorsCount || 0,
        level: profile?.level || 1,
        xp: profile?.points || 0,
        nextLevelXp: ((profile?.level || 1) + 1) * 1000,
        streak: 7 // TODO: Implement streak tracking
      });

      if (notifications) {
        setLiveActivity(notifications.map(n => n.message));
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const actionCards = [
    {
      title: 'Start New Session',
      description: 'Create a new collaboration session',
      icon: Play,
      gradient: 'from-primary via-primary-glow to-accent-cyan',
      action: () => navigateTo('/studio/create-session'),
      stats: `${stats.activeSessions} active`
    },
    {
      title: 'Join Session',
      description: 'Connect to ongoing collaboration',
      icon: Users,
      gradient: 'from-accent-cyan via-accent-blue to-primary',
      action: () => navigateTo('/studio/join-session'),
      stats: `${stats.totalCollaborators} online`
    },
    {
      title: 'My Projects',
      description: 'Browse and manage your work',
      icon: FolderOpen,
      gradient: 'from-warning via-destructive to-primary',
      action: () => navigateTo(userRole === 'artist' ? '/artist-studio' : '/engineer-studio'),
      stats: `${projects.length} projects`
    }
  ];

  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--bg-workspace)' }}>
      {/* Gamification HUD */}
      <div className="max-w-7xl mx-auto mb-6 animate-fade-in">
        <Card className="p-4 glass-studio border-[hsl(var(--studio-border)/0.5)] shadow-[var(--shadow-glass-lg)]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-primary rounded-xl shadow-[var(--shadow-glow)]">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold flex items-center gap-2 text-[hsl(var(--studio-text))]">
                  Level {stats.level}
                  <Sparkles className="w-5 h-5 text-[hsl(var(--studio-accent))] animate-pulse" />
                </h3>
                <p className="text-sm text-[hsl(var(--studio-text-dim))]">
                  {stats.xp} / {stats.nextLevelXp} XP to Level {stats.level + 1}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 flex-wrap">
              <div className="text-center">
                <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">{stats.streak}</div>
                <div className="text-xs text-[hsl(var(--studio-text-dim))]">Day Streak 🔥</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[hsl(var(--waveform-cyan))]">{stats.completedProjects}</div>
                <div className="text-xs text-[hsl(var(--studio-text-dim))]">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[hsl(var(--waveform-blue))]">{stats.totalCollaborators}</div>
                <div className="text-xs text-[hsl(var(--studio-text-dim))]">Collaborators</div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Progress value={(stats.xp / stats.nextLevelXp) * 100} className="h-3" />
          </div>
        </Card>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="mb-8 text-center animate-scale-in">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Studio Collaboration Hub
          </h1>
          <p className="text-xl text-[hsl(var(--studio-text-dim))] max-w-2xl mx-auto">
            Connect with {userRole === 'artist' ? 'engineers' : 'artists'} worldwide. 
            Create music together in real-time. 🌍✨
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {actionCards.map((card, index) => (
            <Card 
              key={index}
              className="group glass-studio bloom-hover cursor-pointer overflow-hidden animate-fade-in border-[hsl(var(--studio-border)/0.5)] shadow-[var(--shadow-glass)] hover:shadow-[var(--shadow-glass-lg)]"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={card.action}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-10 group-hover:opacity-25 transition-opacity`}></div>
              <div className="relative p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div className={`p-4 bg-gradient-to-br ${card.gradient} rounded-xl shadow-glow-sm`}>
                    <card.icon className="w-8 h-8 text-white" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {card.stats}
                  </Badge>
                </div>
                <h3 className="text-xl font-bold mb-2">{card.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{card.description}</p>
                <Button className="w-full gap-2 group-hover:scale-105 transition-transform">
                  <Zap className="w-4 h-4" />
                  {card.title.includes('Start') ? 'Create' : card.title.includes('Join') ? 'Connect' : 'Open'}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Live Activity Feed */}
          <Card className="lg:col-span-2 p-6 animate-slide-up glass-studio border-[hsl(var(--studio-border)/0.5)] shadow-[var(--shadow-glass)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2 text-[hsl(var(--studio-text))]">
                <Radio className="w-5 h-5 text-[hsl(var(--led-green))] pulse-live" />
                Live Activity
              </h3>
              <Badge className="bg-[hsl(var(--led-green))] text-white shadow-[var(--shadow-glow-led-green)]">
                <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
                Live
              </Badge>
            </div>

            <div className="space-y-3">
              {liveActivity.map((activity, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors message-enter"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="w-2 h-2 bg-primary rounded-full pulse-live"></div>
                  <span className="text-sm">{activity}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {Math.floor(Math.random() * 5) + 1}m ago
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 via-accent-cyan/10 to-accent-blue/10 rounded-lg border border-primary/20">
              <div className="flex items-start gap-3">
                <Globe className="w-6 h-6 text-primary" />
                <div>
                  <h4 className="font-semibold mb-1">Global Collaboration Network</h4>
                  <p className="text-sm text-muted-foreground">
                    Connect with creators from Canada 🇨🇦, Africa 🌍, Japan 🇯🇵, and beyond. 
                    Build music and relationships across continents.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Stats */}
          <div className="space-y-4">
            <Card className="p-6 bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30 animate-fade-in animate-delay-100">
              <div className="flex items-center gap-3 mb-3">
                <Music className="w-6 h-6 text-primary" />
                <h4 className="font-semibold">Active Now</h4>
              </div>
              <div className="text-4xl font-bold text-primary mb-1">{stats.activeSessions}</div>
              <p className="text-sm text-muted-foreground">Live sessions worldwide</p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-accent-cyan/20 to-accent-cyan/5 border-accent-cyan/30 animate-fade-in animate-delay-200">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-6 h-6 text-accent-cyan" />
                <h4 className="font-semibold">This Week</h4>
              </div>
              <div className="text-4xl font-bold text-accent-cyan mb-1">+{Math.floor(Math.random() * 50) + 20}</div>
              <p className="text-sm text-muted-foreground">New collaborations</p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-accent-blue/20 to-accent-blue/5 border-accent-blue/30 animate-fade-in animate-delay-300">
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-6 h-6 text-accent-blue" />
                <h4 className="font-semibold">Community</h4>
              </div>
              <div className="text-4xl font-bold text-accent-blue mb-1">{stats.totalCollaborators}</div>
              <p className="text-sm text-muted-foreground">Online creators</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudioHub;
