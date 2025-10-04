import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Flame, TrendingUp, Zap, Users, Sparkles, 
  Play, Upload, CheckCircle, Target, Award,
  Activity, Globe, Headphones, MessageSquare
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ActiveWorkHubProps {
  userRole: "client" | "engineer" | "admin";
  onStartSession?: () => void;
  onUploadStems?: () => void;
  onJoinSession?: () => void;
  onReviewApprove?: () => void;
}

export const ActiveWorkHub = ({ userRole, onStartSession, onUploadStems, onJoinSession, onReviewApprove }: ActiveWorkHubProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    level: 0,
    xp: 0,
    xpToNext: 1000,
    streak: 0,
    weeklyProgress: 0
  });
  const [liveActivities, setLiveActivities] = useState<any[]>([]);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [activeSessionCount, setActiveSessionCount] = useState(0);
  const [pendingReviewsCount, setPendingReviewsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserStats();
      fetchLiveActivities();
      fetchActiveSessions();
      fetchPendingReviews();
      generateAiSuggestion();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('points, level')
        .eq('id', user?.id)
        .single();

      if (profile) {
        setStats(prev => ({
          ...prev,
          level: profile.level || 1,
          xp: profile.points || 0,
          xpToNext: (profile.level || 1) * 1000,
        }));
      }

      // Fetch streak from engineer_streaks or create similar for artists
      const { data: streakData } = await supabase
        .from('engineer_streaks')
        .select('current_streak')
        .eq('engineer_id', user?.id)
        .single();

      if (streakData) {
        setStats(prev => ({
          ...prev,
          streak: streakData.current_streak || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const fetchLiveActivities = async () => {
    try {
      // Fetch recent collaboration sessions
      const { data: sessions } = await supabase
        .from('collaboration_sessions')
        .select(`
          id,
          session_name,
          status,
          started_at,
          host_user_id
        `)
        .eq('status', 'active')
        .order('started_at', { ascending: false })
        .limit(3);

      // Fetch recent audio uploads
      const { data: uploads } = await supabase
        .from('audio_files')
        .select(`
          id,
          file_name,
          created_at,
          uploaded_by
        `)
        .order('created_at', { ascending: false })
        .limit(2);

      // Get user profiles
      const userIds = [
        ...(sessions?.map(s => s.host_user_id) || []),
        ...(uploads?.map(u => u.uploaded_by) || [])
      ];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      const activities: any[] = [];

      sessions?.forEach(session => {
        const host = profileMap.get(session.host_user_id);
        activities.push({
          user: host?.full_name || 'Unknown',
          action: 'started a live session',
          time: getTimeAgo(session.started_at),
          icon: 'Activity'
        });
      });

      uploads?.forEach(upload => {
        const uploader = profileMap.get(upload.uploaded_by);
        activities.push({
          user: uploader?.full_name || 'Unknown',
          action: 'uploaded stems',
          time: getTimeAgo(upload.created_at),
          icon: 'Upload'
        });
      });

      setLiveActivities(activities.slice(0, 3));
    } catch (error) {
      console.error('Error fetching live activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveSessions = async () => {
    try {
      const { count } = await supabase
        .from('collaboration_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      setActiveSessionCount(count || 0);
    } catch (error) {
      console.error('Error fetching active sessions:', error);
    }
  };

  const fetchPendingReviews = async () => {
    try {
      if (userRole === 'client') {
        // Artists see pending reviews they need to give
        const { count } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', user?.id)
          .eq('status', 'completed')
          .is('review_submitted', false);

        setPendingReviewsCount(count || 0);
      } else {
        // Engineers don't have pending reviews to give
        setPendingReviewsCount(0);
      }
    } catch (error) {
      console.error('Error fetching pending reviews:', error);
    }
  };

  const generateAiSuggestion = async () => {
    try {
      // Fetch user's recent projects for personalized suggestions
      const { data: projects } = await supabase
        .from('projects')
        .select('title, status')
        .eq(userRole === 'client' ? 'client_id' : 'engineer_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (projects && projects.length > 0) {
        const inProgress = projects.filter(p => p.status === 'in_progress').length;
        if (inProgress > 0) {
          setAiSuggestion(`You have ${inProgress} project${inProgress > 1 ? 's' : ''} in progress. Keep the momentum going! 🎵`);
          return;
        }

        const completed = projects.filter(p => p.status === 'completed').length;
        if (completed > 0) {
          setAiSuggestion(`Great work on completing ${completed} project${completed > 1 ? 's' : ''}! Ready to start a new one? 🚀`);
          return;
        }
      }

      const suggestions = [
        "Ready to start your next session? Connect with top collaborators now!",
        "Your creative journey is just beginning. Let's make some music! 🎵",
        "Pro tip: Regular collaboration sessions boost your skills by 40%",
        "New opportunities await! Check out the latest projects."
      ];
      setAiSuggestion(suggestions[Math.floor(Math.random() * suggestions.length)]);
    } catch (error) {
      console.error('Error generating AI suggestion:', error);
      setAiSuggestion("Welcome to your creative hub! Let's make some music together.");
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const progressPercentage = (stats.xp / stats.xpToNext) * 100;

  return (
    <div className="space-y-8">
      {/* Compact Status Bar */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-xl border border-primary/20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Level {stats.level}
            </span>
            {stats.streak >= 7 && (
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 animate-pulse-glow">
                <Flame className="w-3 h-3 mr-1" />
                {stats.streak} Day
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {stats.xp} / {stats.xpToNext} XP
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Weekly Progress</div>
          <div className="text-xl font-bold text-primary">{stats.weeklyProgress}%</div>
        </div>
      </div>

      {/* Smart Quick Actions Panel - Horizontal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card 
          className="group relative overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border-purple-500/30"
          onClick={onStartSession}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative p-8">
            <Play className="w-10 h-10 mb-4 text-purple-400" />
            <h3 className="font-semibold text-lg mb-2">Start New Session</h3>
            <p className="text-sm text-muted-foreground">Go live with collaborators</p>
          </div>
        </Card>

        <Card 
          className="group relative overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30"
          onClick={onJoinSession}
        >
          {activeSessionCount > 0 && (
            <div className="absolute top-2 right-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </div>
          )}
          <div className="relative p-8">
            <Users className="w-10 h-10 mb-4 text-orange-400" />
            <h3 className="font-semibold text-lg mb-2">Join Live Session</h3>
            <p className="text-sm text-muted-foreground">
              {activeSessionCount} active session{activeSessionCount !== 1 ? 's' : ''} now
            </p>
          </div>
        </Card>

        <Card 
          className="group relative overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 bg-gradient-to-br from-blue-500/20 to-green-500/20 border-blue-500/30"
          onClick={onUploadStems}
        >
          <div className="relative p-8">
            <Upload className="w-10 h-10 mb-4 text-blue-400" />
            <h3 className="font-semibold text-lg mb-2">Upload Stems</h3>
            <p className="text-sm text-muted-foreground">Add new audio files</p>
          </div>
        </Card>

        <Card 
          className="group relative overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-pink-500/30"
          onClick={onReviewApprove}
        >
          <div className="relative p-8">
            <CheckCircle className="w-10 h-10 mb-4 text-pink-400" />
            <h3 className="font-semibold text-lg mb-2">Review & Approve</h3>
            <p className="text-sm text-muted-foreground">
              {pendingReviewsCount} pending review{pendingReviewsCount !== 1 ? 's' : ''}
            </p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Live Activity Feed */}
        <Card className="lg:col-span-2 p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Activity className="w-6 h-6 text-primary" />
              <h3 className="font-bold text-2xl">Live Activity</h3>
            </div>
            <Badge variant="outline" className="animate-pulse">
              <Globe className="w-3 h-3 mr-1" />
              Global
            </Badge>
          </div>

          <div className="space-y-4">
            {liveActivities.map((activity, index) => (
              <div 
                key={index}
                className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors animate-slide-up-fade"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  {activity.icon === "CheckCircle" && <CheckCircle className="w-5 h-5 text-white" />}
                  {activity.icon === "Activity" && <Activity className="w-5 h-5 text-white animate-pulse" />}
                  {activity.icon === "Upload" && <Upload className="w-5 h-5 text-white" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user}</span> {activity.action}
                  </p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>

          <Button variant="ghost" className="w-full mt-4">
            View More Activity
          </Button>
        </Card>

        {/* AI Copilot Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border-blue-500/30">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl" />
          <div className="relative p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              <h3 className="font-semibold">AI Copilot</h3>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-background/50 backdrop-blur-sm">
                <p className="text-sm mb-3">{aiSuggestion}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    Learn More
                  </Button>
                  <Button size="sm" className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500">
                    Apply Now
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Project Health</span>
                  <span className="font-medium text-green-500">Excellent</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-4/5 bg-gradient-to-r from-green-500 to-emerald-500" />
                </div>
              </div>

              <Button variant="ghost" className="w-full" onClick={generateAiSuggestion}>
                <Zap className="w-4 h-4 mr-2" />
                Get New Suggestion
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
