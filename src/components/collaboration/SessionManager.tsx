import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Users, Video, Mic, MicOff, VideoOff, Share, Plus, Music, Clock, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Session {
  id: string;
  session_name: string;
  session_type: string;
  status: string;
  host_user_id: string;
  max_participants: number;
  started_at: string | null;
  project_id: string | null;
  audio_quality: string;
  participants?: Array<{
    id: string;
    user_id: string;
    role: string;
    is_active: boolean;
    audio_input_enabled: boolean;
    video_enabled: boolean;
    permissions: any;
    profiles: { full_name: string };
  }>;
  host?: { full_name: string };
}

interface SessionManagerProps {
  projectId?: string;
}

const SessionManager: React.FC<SessionManagerProps> = ({ projectId }) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessions, setActiveSessions] = useState<Session[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Create session form state
  const [sessionName, setSessionName] = useState('');
  const [sessionType, setSessionType] = useState('mixing');
  const [maxParticipants, setMaxParticipants] = useState(4);
  const [audioQuality, setAudioQuality] = useState('high');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (user) {
      loadSessions();
      loadActiveSessions();
    }
  }, [user, projectId]);

  // Real-time session updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('collaboration-sessions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'collaboration_sessions'
        },
        () => {
          loadSessions();
          loadActiveSessions();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'session_participants'
        },
        () => {
          loadActiveSessions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadSessions = async () => {
    try {
      // First get sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('collaboration_sessions')
        .select('*')
        .or(`host_user_id.eq.${user?.id}`)
        .order('created_at', { ascending: false });

      if (sessionsError) throw sessionsError;

      // Get host profiles
      const hostIds = [...new Set(sessionsData?.map(s => s.host_user_id) || [])];
      const { data: hostProfiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', hostIds);

      // Get participants for each session
      const sessionIds = sessionsData?.map(s => s.id) || [];
      const { data: participantsData } = await supabase
        .from('session_participants')
        .select(`
          id,
          user_id,
          session_id,
          role,
          is_active,
          audio_input_enabled,
          video_enabled,
          permissions,
          profiles:profiles(full_name)
        `)
        .in('session_id', sessionIds);

      // Get participant profiles
      const participantUserIds = [...new Set(participantsData?.map(p => p.user_id) || [])];
      const { data: participantProfiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', participantUserIds);

      const hostMap = new Map(hostProfiles?.map(p => [p.id, p]) || []);
      const participantProfileMap = new Map(participantProfiles?.map(p => [p.id, p]) || []);

      // Combine data
      const formattedSessions = sessionsData?.map(session => {
        const host = hostMap.get(session.host_user_id);
        const sessionParticipants = participantsData?.filter(p => p.session_id === session.id).map(p => ({
          ...p,
          profiles: participantProfileMap.get(p.user_id) || { full_name: 'Unknown' }
        })) || [];

        return {
          ...session,
          host: host || { full_name: 'Unknown' },
          participants: sessionParticipants
        };
      }) || [];

      setSessions(formattedSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast.error('Failed to load sessions');
    }
  };

  const loadActiveSessions = async () => {
    try {
      // First get active sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('collaboration_sessions')
        .select('*')
        .eq('status', 'active')
        .order('started_at', { ascending: false });

      if (sessionsError) throw sessionsError;

      // Get host profiles
      const hostIds = [...new Set(sessionsData?.map(s => s.host_user_id) || [])];
      const { data: hostProfiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', hostIds);

      // Get participants for each session
      const sessionIds = sessionsData?.map(s => s.id) || [];
      const { data: participantsData } = await supabase
        .from('session_participants')
        .select(`
          id,
          user_id,
          session_id,
          role,
          is_active,
          audio_input_enabled,
          video_enabled,
          permissions
        `)
        .in('session_id', sessionIds);

      // Get participant profiles
      const participantUserIds = [...new Set(participantsData?.map(p => p.user_id) || [])];
      const { data: participantProfiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', participantUserIds);

      const hostMap = new Map(hostProfiles?.map(p => [p.id, p]) || []);
      const participantProfileMap = new Map(participantProfiles?.map(p => [p.id, p]) || []);

      // Combine data
      const formattedSessions = sessionsData?.map(session => {
        const host = hostMap.get(session.host_user_id);
        const sessionParticipants = participantsData?.filter(p => p.session_id === session.id).map(p => ({
          ...p,
          profiles: participantProfileMap.get(p.user_id) || { full_name: 'Unknown' }
        })) || [];

        return {
          ...session,
          host: host || { full_name: 'Unknown' },
          participants: sessionParticipants
        };
      }) || [];

      setActiveSessions(formattedSessions);
    } catch (error) {
      console.error('Error loading active sessions:', error);
    }
  };

  const createSession = async () => {
    if (!user || !sessionName.trim()) return;

    setLoading(true);
    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from('collaboration_sessions')
        .insert({
          session_name: sessionName,
          session_type: sessionType,
          host_user_id: user.id,
          max_participants: maxParticipants,
          audio_quality: audioQuality,
          project_id: projectId || null,
          status: 'waiting'
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Add host as participant
      const { error: participantError } = await supabase
        .from('session_participants')
        .insert({
          session_id: sessionData.id,
          user_id: user.id,
          role: 'host',
          permissions: {
            chat: true,
            audio: true,
            video: true,
            screen: true,
            files: true,
            controls: true
          }
        });

      if (participantError) throw participantError;

      toast.success('Session created successfully');
      setIsCreateDialogOpen(false);
      resetForm();
      loadSessions();
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Failed to create session');
    } finally {
      setLoading(false);
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
          permissions: {
            chat: true,
            audio: true,
            video: false,
            screen: false,
            files: true,
            controls: false
          }
        });

      if (error) throw error;

      toast.success('Joined session successfully');
      loadSessions();
    } catch (error) {
      console.error('Error joining session:', error);
      toast.error('Failed to join session');
    }
  };

  const startSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('collaboration_sessions')
        .update({
          status: 'active',
          started_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) throw error;

      toast.success('Session started');
      loadSessions();
      loadActiveSessions();
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error('Failed to start session');
    }
  };

  const resetForm = () => {
    setSessionName('');
    setSessionType('mixing');
    setMaxParticipants(4);
    setAudioQuality('high');
    setDescription('');
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'mixing': return <Music className="w-4 h-4" />;
      case 'recording': return <Mic className="w-4 h-4" />;
      case 'mastering': return <Settings className="w-4 h-4" />;
      case 'feedback': return <Users className="w-4 h-4" />;
      default: return <Music className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'waiting': return 'bg-yellow-500';
      case 'ended': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Session */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">Collaboration Sessions</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Session
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Collaboration Session</DialogTitle>
              <DialogDescription>
                Start a new real-time collaboration session for your project
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Session Name</label>
                <Input
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  placeholder="Enter session name..."
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Session Type</label>
                <Select value={sessionType} onValueChange={setSessionType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mixing">Mixing Session</SelectItem>
                    <SelectItem value="recording">Recording Session</SelectItem>
                    <SelectItem value="mastering">Mastering Session</SelectItem>
                    <SelectItem value="feedback">Feedback Session</SelectItem>
                    <SelectItem value="general">General Collaboration</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Max Participants</label>
                  <Select value={maxParticipants.toString()} onValueChange={(v) => setMaxParticipants(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 People</SelectItem>
                      <SelectItem value="4">4 People</SelectItem>
                      <SelectItem value="6">6 People</SelectItem>
                      <SelectItem value="8">8 People</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Audio Quality</label>
                  <Select value={audioQuality} onValueChange={setAudioQuality}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="high">High Quality</SelectItem>
                      <SelectItem value="studio">Studio Quality</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Description (Optional)</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this session is for..."
                  rows={3}
                />
              </div>

              <Button 
                onClick={createSession} 
                disabled={loading || !sessionName.trim()}
                className="w-full"
              >
                {loading ? 'Creating...' : 'Create Session'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Live Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {activeSessions.map((session) => (
                <div 
                  key={session.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-green-50 dark:bg-green-950/20"
                >
                  <div className="flex items-center gap-3">
                    {getSessionTypeIcon(session.session_type)}
                    <div>
                      <h4 className="font-semibold">{session.session_name}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Host: {session.host?.full_name}</span>
                        <span>•</span>
                        <span>{session.participants?.filter(p => p.is_active).length || 0}/{session.max_participants} participants</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500 text-white">
                      <div className="w-2 h-2 bg-white rounded-full mr-1"></div>
                      Live
                    </Badge>
                    <Button 
                      size="sm"
                      onClick={() => joinSession(session.id)}
                      disabled={session.participants?.some(p => p.user_id === user?.id)}
                    >
                      {session.participants?.some(p => p.user_id === user?.id) ? 'Joined' : 'Join'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Your Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Your Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-96">
            {sessions.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No collaboration sessions yet</p>
                <p className="text-sm text-muted-foreground">Create or join a session to start collaborating</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div 
                    key={session.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {getSessionTypeIcon(session.session_type)}
                      <div>
                        <h4 className="font-semibold">{session.session_name}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Host: {session.host?.full_name}</span>
                          <span>•</span>
                          <span>{session.participants?.length || 0}/{session.max_participants} participants</span>
                          {session.started_at && (
                            <>
                              <span>•</span>
                              <Clock className="w-3 h-3" />
                              <span>{new Date(session.started_at).toLocaleTimeString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={`${getStatusColor(session.status)} text-white`}>
                        {session.status}
                      </Badge>
                      
                      {session.host_user_id === user?.id && session.status === 'waiting' && (
                        <Button 
                          size="sm"
                          onClick={() => startSession(session.id)}
                        >
                          Start Session
                        </Button>
                      )}
                      
                      {session.host_user_id !== user?.id && session.status === 'waiting' && (
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => joinSession(session.id)}
                          disabled={session.participants?.some(p => p.user_id === user?.id)}
                        >
                          {session.participants?.some(p => p.user_id === user?.id) ? 'Joined' : 'Join'}
                        </Button>
                      )}
                      
                      {session.status === 'active' && (
                        <Button size="sm" variant="default">
                          Enter Session
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionManager;