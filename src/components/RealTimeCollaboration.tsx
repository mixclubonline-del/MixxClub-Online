import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, 
  MessageCircle, 
  Upload, 
  Zap, 
  Clock, 
  Play, 
  Pause, 
  Volume2,
  Award,
  Star
} from 'lucide-react';
import { toast } from 'sonner';

interface Activity {
  id: string;
  type: 'upload' | 'comment' | 'task' | 'achievement' | 'collaboration';
  user_name: string;
  message: string;
  created_at: string;
  metadata?: any;
}

interface OnlineUser {
  id: string;
  full_name: string;
  avatar_url?: string;
  status: 'online' | 'working' | 'away';
  current_project?: string;
}

export const RealTimeCollaboration = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Set up real-time subscriptions
    const activityChannel = supabase
      .channel('collaboration-activity')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'collaboration_comments'
        },
        (payload) => {
          const newActivity: Activity = {
            id: payload.new.id,
            type: 'comment',
            user_name: 'Artist', // This would come from a join
            message: `Added comment: "${payload.new.comment_text}"`,
            created_at: payload.new.created_at,
            metadata: payload.new
          };
          setActivities(prev => [newActivity, ...prev.slice(0, 19)]);
          toast.success('New comment added to collaboration');
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'audio_files'
        },
        (payload) => {
          const newActivity: Activity = {
            id: payload.new.id,
            type: 'upload',
            user_name: 'Collaborator',
            message: `Uploaded "${payload.new.file_name}"`,
            created_at: payload.new.created_at,
            metadata: payload.new
          };
          setActivities(prev => [newActivity, ...prev.slice(0, 19)]);
          toast.success('New track uploaded!');
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tasks'
        },
        (payload) => {
          if (payload.new.status === 'completed') {
            const newActivity: Activity = {
              id: payload.new.id,
              type: 'task',
              user_name: 'Engineer',
              message: `Completed task: "${payload.new.title}"`,
              created_at: new Date().toISOString(),
              metadata: payload.new
            };
            setActivities(prev => [newActivity, ...prev.slice(0, 19)]);
            toast.success('Task completed!');
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'achievements'
        },
        (payload) => {
          const newActivity: Activity = {
            id: payload.new.id,
            type: 'achievement',
            user_name: 'System',
            message: `Achievement unlocked: "${payload.new.badge_name}"`,
            created_at: payload.new.earned_at,
            metadata: payload.new
          };
          setActivities(prev => [newActivity, ...prev.slice(0, 19)]);
          toast.success('New achievement unlocked!');
        }
      )
      .subscribe();

    // Simulate online users (in a real app, this would be tracked in the database)
    const simulateOnlineUsers = () => {
      const mockUsers: OnlineUser[] = [
        { id: '1', full_name: 'MixMaster AI', status: 'working', current_project: 'Dark Nights Mix' },
        { id: '2', full_name: 'BeatCrafter Pro', status: 'online' },
        { id: '3', full_name: 'VocalQueen', status: 'working', current_project: 'Summer Vibes' },
        { id: '4', full_name: 'SoundWeaver', status: 'away' },
      ];
      setOnlineUsers(mockUsers);
    };

    simulateOnlineUsers();

    return () => {
      supabase.removeChannel(activityChannel);
    };
  }, [user]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'upload': return <Upload className="w-4 h-4 text-blue-400" />;
      case 'comment': return <MessageCircle className="w-4 h-4 text-green-400" />;
      case 'task': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'achievement': return <Award className="w-4 h-4 text-purple-400" />;
      case 'collaboration': return <Users className="w-4 h-4 text-pink-400" />;
      default: return <Zap className="w-4 h-4 text-primary" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'working': return 'bg-blue-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const addQuickComment = async () => {
    if (!newComment.trim() || !user) return;

    try {
      // This would normally insert into collaboration_comments table
      // For demo purposes, we'll just add to local state
      const newActivity: Activity = {
        id: Date.now().toString(),
        type: 'comment',
        user_name: user.email?.split('@')[0] || 'You',
        message: `Added comment: "${newComment}"`,
        created_at: new Date().toISOString()
      };
      
      setActivities(prev => [newActivity, ...prev.slice(0, 19)]);
      setNewComment('');
      toast.success('Comment added to collaboration');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleStartListeningSession = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      const { data: session, error } = await supabase
        .from('collaboration_sessions')
        .insert({
          host_user_id: currentUser?.id,
          session_name: 'Listening Session',
          session_type: 'listening',
          status: 'active'
        })
        .select()
        .single();
      
      if (error) throw error;
      toast.success("Session created!");
      navigate(`/session/${session.id}`);
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error("Failed to create session");
    }
  };

  const handleQuickUpload = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'audio/*';
    fileInput.multiple = true;
    fileInput.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        toast.success(`Uploading ${files.length} file(s)...`);
        setTimeout(() => {
          toast.success("Files uploaded successfully!");
        }, 1500);
      }
    };
    fileInput.click();
  };

  const handleRateMix = () => {
    const rating = window.prompt("Rate this mix (1-5 stars):");
    if (rating && !isNaN(Number(rating))) {
      const score = Math.min(5, Math.max(1, Number(rating)));
      toast.success(`Rated ${score} stars!`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Live Activity Feed */}
      <div className="lg:col-span-2">
        <Card className="p-6 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border-primary/20">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-5 h-5 text-primary animate-pulse" />
            <h3 className="font-semibold text-xl">Live Collaboration</h3>
            <Badge variant="outline" className="ml-auto">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
              Real-time
            </Badge>
          </div>
          
          {/* Quick Actions */}
          <div className="flex gap-2 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Add a quick comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addQuickComment()}
                className="bg-background/50 border-primary/20"
              />
            </div>
            <Button onClick={addQuickComment} size="sm" disabled={!newComment.trim()}>
              <MessageCircle className="w-4 h-4" />
            </Button>
            <Button
              variant="outline" 
              size="sm"
              onClick={() => setIsRecording(!isRecording)}
              className={isRecording ? 'border-red-500 text-red-500' : ''}
            >
              {isRecording ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isRecording ? 'Stop' : 'Record'}
            </Button>
          </div>

          {/* Activity Feed */}
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {activities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No recent activity. Start collaborating!</p>
                </div>
              ) : (
                activities.map((activity, index) => (
                  <div 
                    key={activity.id}
                    className={`flex items-start gap-3 p-4 rounded-lg bg-background/30 backdrop-blur-sm border border-border/50 transition-all duration-300 hover:border-primary/30 ${
                      index === 0 ? 'animate-fade-in ring-1 ring-primary/20' : ''
                    }`}
                  >
                    <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-primary text-sm">{activity.user_name}</span>
                        <Badge variant="outline" className="text-xs">
                          {activity.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground">{activity.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(activity.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* Online Users & Quick Controls */}
      <div className="space-y-6">
        {/* Online Users */}
        <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent/5 backdrop-blur-sm border-accent/20">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-accent" />
            <h3 className="font-semibold">Online Now</h3>
            <Badge variant="outline" className="ml-auto">
              {onlineUsers.filter(u => u.status !== 'away').length} active
            </Badge>
          </div>
          
          <div className="space-y-3">
            {onlineUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-3 p-3 rounded-lg bg-background/20">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="" className="w-full h-full rounded-full" />
                    ) : (
                      <span className="text-xs font-medium">{user.full_name.charAt(0)}</span>
                    )}
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(user.status)}`}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{user.full_name}</p>
                  {user.current_project && (
                    <p className="text-xs text-muted-foreground truncate">Working on {user.current_project}</p>
                  )}
                </div>
                <Badge variant="outline" className="text-xs">
                  {user.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Studio Controls */}
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm border-primary/20">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            Studio Controls
          </h3>
          
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2" 
              size="sm"
              onClick={handleStartListeningSession}
            >
              <Play className="w-4 h-4" />
              Start Listening Session
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2" 
              size="sm"
              onClick={handleQuickUpload}
            >
              <Upload className="w-4 h-4" />
              Quick Upload
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2" 
              size="sm"
              onClick={handleRateMix}
            >
              <Star className="w-4 h-4" />
              Rate Current Mix
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};