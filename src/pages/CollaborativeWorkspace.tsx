import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCollaboration } from '@/hooks/useCollaboration';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { CollaborationChat } from '@/components/collaboration/CollaborationChat';
import { ActiveParticipants, Participant } from '@/components/collaboration/ActiveParticipants';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, 
  Disc3, Settings, Share2, LogOut 
} from 'lucide-react';

interface TrackControl {
  id: string;
  name: string;
  volume: number;
  pan: number;
  muted: boolean;
  solo: boolean;
  color: string;
}

export default function CollaborativeWorkspace() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [session, setSession] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [tracks, setTracks] = useState<TrackControl[]>([
    { id: '1', name: 'Vocals', volume: 80, pan: 0, muted: false, solo: false, color: '#3b82f6' },
    { id: '2', name: 'Drums', volume: 75, pan: -10, muted: false, solo: false, color: '#ef4444' },
    { id: '3', name: 'Bass', volume: 85, pan: 0, muted: false, solo: false, color: '#10b981' },
    { id: '4', name: 'Guitar', volume: 70, pan: 15, muted: false, solo: false, color: '#f59e0b' },
  ]);
  
  const [messages, setMessages] = useState<any[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [sharedCursor, setSharedCursor] = useState<{ userId: string; position: number } | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  const {
    isConnected,
    connectionStatus,
    participants: liveParticipants,
    connect,
    disconnect,
    sendMessage,
    sendChatMessage,
  } = useCollaboration({
    sessionId: sessionId || '',
    userId: user?.id || '',
    userName: user?.email?.split('@')[0] || 'Anonymous',
    onMessage: handleCollaborationMessage,
    onUserJoin: (newUser) => {
      setParticipants((prev) => [...prev.filter(p => p.id !== newUser.id), {
        ...newUser,
        status: 'online',
      }]);
    },
    onUserLeave: (userId) => {
      setParticipants((prev) => prev.filter(p => p.id !== userId));
    },
    onCursorMove: (userId, position) => {
      setSharedCursor({ userId, position: position.x });
    },
  });

  function handleCollaborationMessage(message: any) {
    console.debug('Collaboration message:', message);

    switch (message.type) {
      case 'playback_state':
        setIsPlaying(message.data.isPlaying);
        setCurrentTime(message.data.currentTime);
        if (audioRef.current) {
          audioRef.current.currentTime = message.data.currentTime;
          if (message.data.isPlaying) {
            audioRef.current.play();
          } else {
            audioRef.current.pause();
          }
        }
        break;
      
      case 'track_update':
        setTracks((prevTracks) =>
          prevTracks.map((track) =>
            track.id === message.data.trackId
              ? { ...track, ...message.data.updates }
              : track
          )
        );
        break;

      case 'timeline_seek':
        setCurrentTime(message.data.time);
        if (audioRef.current) {
          audioRef.current.currentTime = message.data.time;
        }
        break;

      case 'chat_message':
        setMessages((prev) => [
          ...prev,
          {
            id: `${message.userId}-${message.timestamp}`,
            userId: message.userId,
            userName: message.userName,
            message: message.data.message,
            timestamp: message.timestamp,
          },
        ]);
        break;
    }
  }

  useEffect(() => {
    if (!sessionId || !user) return;

    // Fetch session details
    const fetchSession = async () => {
      const { data, error } = await supabase
        .from('collaboration_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error || !data) {
        toast({
          title: 'Session not found',
          description: 'Unable to load collaboration session',
          variant: 'destructive',
        });
        navigate('/hybrid-daw');
        return;
      }

      setSession(data);
      setDuration(180); // Mock duration - 3 minutes
    };

    fetchSession();
    connect();

    return () => {
      disconnect();
    };
  }, [sessionId, user]);

  const togglePlayPause = () => {
    const newState = !isPlaying;
    setIsPlaying(newState);

    sendMessage({
      type: 'playback_state',
      sessionId: sessionId || '',
      data: {
        isPlaying: newState,
        currentTime,
      },
    });

    if (audioRef.current) {
      if (newState) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    
    sendMessage({
      type: 'timeline_seek',
      sessionId: sessionId || '',
      data: { time },
    });

    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleTrackUpdate = (trackId: string, updates: Partial<TrackControl>) => {
    setTracks((prevTracks) =>
      prevTracks.map((track) =>
        track.id === trackId ? { ...track, ...updates } : track
      )
    );

    sendMessage({
      type: 'track_update',
      sessionId: sessionId || '',
      data: {
        trackId,
        updates,
      },
    });
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;

    handleSeek(newTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendChat = (message: string) => {
    sendChatMessage(message);
  };

  const handleLeaveSession = () => {
    disconnect();
    navigate('/hybrid-daw');
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Disc3 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-[1800px] mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{session.session_name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={isConnected ? 'default' : 'destructive'}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {participants.length + 1} participants
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Invite
            </Button>
            <Button variant="outline" size="sm" onClick={handleLeaveSession}>
              <LogOut className="h-4 w-4 mr-2" />
              Leave
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_350px] gap-4">
          {/* Main Workspace */}
          <div className="space-y-4">
            {/* Transport Controls */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center gap-4">
                  <Button variant="outline" size="icon">
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button size="icon" onClick={togglePlayPause}>
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <Button variant="outline" size="icon">
                    <SkipForward className="h-4 w-4" />
                  </Button>
                  <div className="text-sm font-mono">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>

                {/* Timeline */}
                <div className="mt-4 relative">
                  <div
                    ref={timelineRef}
                    onClick={handleTimelineClick}
                    className="h-12 bg-muted rounded-lg cursor-pointer relative overflow-hidden"
                  >
                    {/* Progress Bar */}
                    <div
                      className="absolute top-0 left-0 h-full bg-primary/20 transition-all"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                    
                    {/* Playhead */}
                    <div
                      className="absolute top-0 w-0.5 h-full bg-primary"
                      style={{ left: `${(currentTime / duration) * 100}%` }}
                    />

                    {/* Shared Cursor */}
                    {sharedCursor && sharedCursor.userId !== user?.id && (
                      <div
                        className="absolute top-0 w-0.5 h-full bg-yellow-500"
                        style={{ left: `${(sharedCursor.position / duration) * 100}%` }}
                      >
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs bg-yellow-500 text-white px-2 py-1 rounded whitespace-nowrap">
                          Collaborator
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mixer Tracks */}
            <Card>
              <CardHeader>
                <CardTitle>Mixer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {tracks.map((track) => (
                    <Card
                      key={track.id}
                      className="border-2"
                      style={{ borderColor: track.color }}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">{track.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Volume */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <Volume2 className="h-3 w-3" />
                            <span>{track.volume}%</span>
                          </div>
                          <Slider
                            value={[track.volume]}
                            onValueChange={([value]) =>
                              handleTrackUpdate(track.id, { volume: value })
                            }
                            max={100}
                            step={1}
                            className="w-full"
                          />
                        </div>

                        {/* Pan */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span>Pan</span>
                            <span>{track.pan > 0 ? 'R' : track.pan < 0 ? 'L' : 'C'} {Math.abs(track.pan)}</span>
                          </div>
                          <Slider
                            value={[track.pan + 50]}
                            onValueChange={([value]) =>
                              handleTrackUpdate(track.id, { pan: value - 50 })
                            }
                            max={100}
                            step={1}
                            className="w-full"
                          />
                        </div>

                        {/* Controls */}
                        <div className="flex gap-2">
                          <Button
                            variant={track.muted ? 'default' : 'outline'}
                            size="sm"
                            className="flex-1"
                            onClick={() =>
                              handleTrackUpdate(track.id, { muted: !track.muted })
                            }
                          >
                            M
                          </Button>
                          <Button
                            variant={track.solo ? 'default' : 'outline'}
                            size="sm"
                            className="flex-1"
                            onClick={() =>
                              handleTrackUpdate(track.id, { solo: !track.solo })
                            }
                          >
                            S
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <ActiveParticipants
              participants={[
                {
                  id: user?.id || '',
                  name: user?.email?.split('@')[0] || 'You',
                  status: 'online',
                  isHost: session.host_user_id === user?.id,
                },
                ...participants,
              ]}
              maxParticipants={session.max_participants}
            />

            <CollaborationChat
              sessionId={sessionId || ''}
              currentUserId={user?.id || ''}
              currentUserName={user?.email?.split('@')[0] || 'Anonymous'}
              onSendMessage={handleSendChat}
              messages={messages}
              isConnected={isConnected}
            />
          </div>
        </div>
      </div>

      {/* Hidden audio element for demo */}
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      />
    </div>
  );
}
