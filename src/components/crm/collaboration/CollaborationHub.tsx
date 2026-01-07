import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
  Users, 
  Plus, 
  Play, 
  Upload, 
  CheckCircle, 
  Video,
  Mic,
  Globe,
  Lock,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';

interface CollaborationSession {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
  visibility: string | null;
  session_type: string | null;
  max_participants: number | null;
  host_user_id: string;
  created_at: string;
  scheduled_start: string | null;
  participant_count?: number;
}

interface CollaborationHubProps {
  userRole?: string;
  onStartSession?: () => void;
  onUploadStems?: () => void;
  onJoinSession?: () => void;
  onReviewApprove?: () => void;
}

export const CollaborationHub = ({
  userRole = 'artist',
  onStartSession,
  onUploadStems,
  onJoinSession,
  onReviewApprove
}: CollaborationHubProps) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<CollaborationSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newSession, setNewSession] = useState({
    title: '',
    description: '',
    visibility: 'private',
    session_type: 'mixing',
    max_participants: 5
  });

  useEffect(() => {
    if (user) {
      fetchSessions();
      subscribeToSessions();
    }
  }, [user]);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('collaboration_sessions')
        .select('*')
        .or(`host_user_id.eq.${user?.id},visibility.eq.public`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to load collaboration sessions');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToSessions = () => {
    const channel = supabase
      .channel('collaboration_sessions_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'collaboration_sessions' },
        () => fetchSessions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const createSession = async () => {
    if (!user || !newSession.title.trim()) {
      toast.error('Please enter a session title');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('collaboration_sessions')
        .insert({
          title: newSession.title,
          description: newSession.description || null,
          visibility: newSession.visibility,
          session_type: newSession.session_type,
          max_participants: newSession.max_participants,
          host_user_id: user.id,
          status: 'waiting'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Session created successfully!');
      setIsCreateOpen(false);
      setNewSession({
        title: '',
        description: '',
        visibility: 'private',
        session_type: 'mixing',
        max_participants: 5
      });
      onStartSession?.();
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Failed to create session');
    }
  };

  const joinSession = async (sessionId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('session_participants')
        .insert({
          session_id: sessionId,
          user_id: user.id,
          role: 'participant',
          is_active: true
        });

      if (error) throw error;
      toast.success('Joined session!');
      onJoinSession?.();
    } catch (error) {
      console.error('Error joining session:', error);
      toast.error('Failed to join session');
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'waiting': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'ended': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getSessionTypeIcon = (type: string | null) => {
    switch (type) {
      case 'mixing': return <Mic className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Collaboration Hub</h2>
          <p className="text-muted-foreground">Real-time sessions with your team</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Session
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Collaboration Session</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Session Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Mix Review - Track 5"
                    value={newSession.title}
                    onChange={(e) => setNewSession(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Input
                    id="description"
                    placeholder="What will you be working on?"
                    value={newSession.description}
                    onChange={(e) => setNewSession(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Visibility</Label>
                    <Select 
                      value={newSession.visibility}
                      onValueChange={(value) => setNewSession(prev => ({ ...prev, visibility: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">
                          <div className="flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            Private
                          </div>
                        </SelectItem>
                        <SelectItem value="public">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            Public
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Session Type</Label>
                    <Select 
                      value={newSession.session_type}
                      onValueChange={(value) => setNewSession(prev => ({ ...prev, session_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mixing">Mixing</SelectItem>
                        <SelectItem value="mastering">Mastering</SelectItem>
                        <SelectItem value="review">Review</SelectItem>
                        <SelectItem value="video">Video Call</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={createSession} className="w-full">
                  Create Session
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {userRole === 'artist' && (
            <Button variant="outline" className="gap-2" onClick={onUploadStems}>
              <Upload className="h-4 w-4" />
              Upload Stems
            </Button>
          )}

          {userRole === 'engineer' && (
            <Button variant="outline" className="gap-2" onClick={onReviewApprove}>
              <CheckCircle className="h-4 w-4" />
              Review Queue
            </Button>
          )}
        </div>
      </div>

      {/* Sessions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Active Sessions
          </CardTitle>
          <CardDescription>
            Join an existing session or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No active sessions</p>
              <p className="text-sm">Create one to start collaborating!</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-full bg-primary/10">
                        {getSessionTypeIcon(session.session_type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{session.title}</h4>
                          <Badge variant="outline" className={getStatusColor(session.status)}>
                            {session.status || 'Unknown'}
                          </Badge>
                          {session.visibility === 'private' && (
                            <Lock className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(session.created_at), 'MMM d, h:mm a')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {session.participant_count || 0}/{session.max_participants || '∞'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {session.host_user_id === user?.id ? (
                        <Button size="sm" className="gap-1">
                          <Play className="h-3 w-3" />
                          Start
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => joinSession(session.id)}
                        >
                          Join
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
