import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSessionCleanup } from '@/hooks/useSessionCleanup';
import { useRealTimePresence } from '@/hooks/useRealTimePresence';
import { useWebRTC } from '@/hooks/useWebRTC';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor, 
  MonitorOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  Users,
  MessageSquare,
  Settings,
  Share,
  Download,
  Upload,
  Phone,
  PhoneOff,
  Music,
  Camera
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface CollaborationWorkspaceProps {
  sessionId: string;
  onLeaveSession: () => void;
}

interface Participant {
  id: string;
  user_id: string;
  role: string;
  is_active: boolean;
  audio_input_enabled: boolean;
  video_enabled: boolean;
  permissions: any;
  profiles: { full_name: string };
}

interface AudioStream {
  id: string;
  user_id: string;
  stream_name: string;
  stream_type: string;
  volume: number;
  is_muted: boolean;
  is_solo: boolean;
  is_active: boolean;
}

interface ChatMessage {
  id: string;
  user_id: string;
  comment_text: string;
  timestamp_seconds: number;
  created_at: string;
  profiles: { full_name: string };
}

const CollaborationWorkspace: React.FC<CollaborationWorkspaceProps> = ({ 
  sessionId, 
  onLeaveSession 
}) => {
  const { user } = useAuth();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [audioStreams, setAudioStreams] = useState<AudioStream[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'workspace' | 'video'>('workspace');
  
  // Audio/Video controls
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [masterVolume, setMasterVolume] = useState([80]);
  const [isInCall, setIsInCall] = useState(false);
  
  // Remote video streams
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  
  // Recording state
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingInterval = useRef<NodeJS.Timeout>();
  
  // WebRTC refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext>();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Session cleanup hook
  useSessionCleanup(sessionId);

  // Real-time presence
  const { onlineUsers, isConnected: presenceConnected } = useRealTimePresence(`session-${sessionId}`);

  // WebRTC hook for video/audio calls
  const {
    localStream,
    screenStream,
    isAudioEnabled: webrtcAudioEnabled,
    isVideoEnabled: webrtcVideoEnabled,
    isScreenSharing: webrtcScreenSharing,
    connectedPeers,
    startLocalStream,
    stopLocalStream,
    toggleAudio,
    toggleVideo,
    startScreenShare: webrtcStartScreenShare,
    stopScreenShare: webrtcStopScreenShare,
    connectToPeers,
  } = useWebRTC({
    sessionId,
    userId: user?.id || '',
    onRemoteStream: (stream, peerId) => {
      console.log('[Workspace] Received remote stream from:', peerId);
      setRemoteStreams(prev => new Map(prev).set(peerId, stream));
    },
  });

  // Sync local video to video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Memoize active participants count
  const activeParticipantsCount = useMemo(
    () => participants.filter(p => p.is_active).length,
    [participants]
  );

  // Load session data and setup subscriptions
  useEffect(() => {
    if (sessionId && user) {
      loadSessionData();
      setupRealtimeSubscriptions();
    }
    
    return () => {
      cleanupSession();
    };
  }, [sessionId, user]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const loadSessionData = async () => {
    try {
      // Load participants
      const { data: participantsData, error: participantsError } = await supabase
        .from('session_participants')
        .select(`
          *,
          profiles:profiles(full_name)
        `)
        .eq('session_id', sessionId);

      if (participantsError) throw participantsError;

      // Get participant profiles separately
      const participantUserIds = participantsData?.map(p => p.user_id) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', participantUserIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      const formattedParticipants = participantsData?.map(p => ({
        ...p,
        profiles: profileMap.get(p.user_id) || { full_name: 'Unknown' }
      })) || [];

      setParticipants(formattedParticipants);

      // Load audio streams
      const { data: streamsData, error: streamsError } = await supabase
        .from('audio_streams')
        .select('*')
        .eq('session_id', sessionId);

      if (streamsError) throw streamsError;
      setAudioStreams(streamsData || []);

      // Load chat messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('session_comments')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      // Get message sender profiles
      const senderIds = [...new Set(messagesData?.map(m => m.user_id) || [])];
      const { data: senderProfiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', senderIds);

      const senderProfileMap = new Map(senderProfiles?.map(p => [p.id, p]) || []);

      const formattedMessages = messagesData?.map(m => ({
        ...m,
        profiles: senderProfileMap.get(m.user_id) || { full_name: 'Unknown' }
      })) || [];

      setChatMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading session data:', error);
      toast.error('Failed to load session data');
    }
  };

  const setupRealtimeSubscriptions = () => {
    const channel = supabase
      .channel(`session-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'session_participants',
          filter: `session_id=eq.${sessionId}`
        },
        () => loadSessionData()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'audio_streams',
          filter: `session_id=eq.${sessionId}`
        },
        () => loadSessionData()
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'session_comments',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          // Add new message in real-time
          loadSessionData();
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  };

  // Start/join video call
  const handleStartCall = async () => {
    try {
      await startLocalStream({ audio: true, video: true });
      setIsInCall(true);
      setIsMicEnabled(true);
      setIsVideoEnabled(true);
      
      // Connect to existing participants
      const otherParticipants = participants
        .filter(p => p.user_id !== user?.id)
        .map(p => p.user_id);
      
      if (otherParticipants.length > 0) {
        await connectToPeers(otherParticipants);
      }
      
      // Create audio stream record
      await supabase
        .from('audio_streams')
        .insert({
          session_id: sessionId,
          user_id: user?.id,
          stream_name: `${user?.email}-video-call`,
          stream_type: 'video_call',
          volume: 0.8,
          is_active: true
        });
        
      toast.success('Joined video call');
    } catch (error) {
      console.error('Error starting call:', error);
      toast.error('Failed to start video call');
    }
  };

  const handleEndCall = async () => {
    stopLocalStream();
    setRemoteStreams(new Map());
    setIsInCall(false);
    setIsMicEnabled(false);
    setIsVideoEnabled(false);
    
    // Remove audio stream record
    await supabase
      .from('audio_streams')
      .delete()
      .eq('session_id', sessionId)
      .eq('user_id', user?.id)
      .eq('stream_type', 'video_call');
      
    toast.success('Left video call');
  };

  const handleToggleMic = () => {
    toggleAudio();
    setIsMicEnabled(!isMicEnabled);
  };

  const handleToggleVideo = () => {
    toggleVideo();
    setIsVideoEnabled(!isVideoEnabled);
  };

  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      await webrtcStopScreenShare();
    } else {
      await webrtcStartScreenShare();
    }
    setIsScreenSharing(!isScreenSharing);
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        });
        
        // Create screen share record
        await supabase
          .from('screen_shares')
          .insert({
            session_id: sessionId,
            user_id: user?.id,
            is_active: true
          });
        
        toast.success('Screen sharing started');
      } else {
        // End screen share
        await supabase
          .from('screen_shares')
          .update({ is_active: false })
          .eq('session_id', sessionId)
          .eq('user_id', user?.id)
          .eq('is_active', true);
        
        toast.success('Screen sharing stopped');
      }
      
      setIsScreenSharing(!isScreenSharing);
    } catch (error) {
      console.error('Error toggling screen share:', error);
      toast.error('Failed to toggle screen sharing');
    }
  };

  const startRecording = async () => {
    try {
      const { data, error } = await supabase
        .from('session_recordings')
        .insert({
          session_id: sessionId,
          recorded_by: user?.id,
          recording_name: `Session Recording ${new Date().toISOString()}`,
          file_path: `recordings/session-${sessionId}-${Date.now()}.wav`,
          audio_format: 'wav'
        })
        .select()
        .single();

      if (error) throw error;

      setIsRecording(true);
      setRecordingDuration(0);
      
      recordingInterval.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      toast.success('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording');
    }
  };

  const stopRecording = () => {
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
    }
    
    setIsRecording(false);
    setRecordingDuration(0);
    toast.success('Recording stopped');
  };

  const sendChatMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      await supabase
        .from('session_comments')
        .insert({
          session_id: sessionId,
          user_id: user.id,
          comment_text: newMessage,
          timestamp_seconds: 0,
          comment_type: 'general'
        });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const updateStreamVolume = async (streamId: string, volume: number) => {
    try {
      await supabase
        .from('audio_streams')
        .update({ volume: volume / 100 })
        .eq('id', streamId);
      
      setAudioStreams(prev => 
        prev.map(stream => 
          stream.id === streamId ? { ...stream, volume: volume / 100 } : stream
        )
      );
    } catch (error) {
      console.error('Error updating volume:', error);
    }
  };

  const toggleStreamMute = async (streamId: string) => {
    try {
      const stream = audioStreams.find(s => s.id === streamId);
      if (!stream) return;

      await supabase
        .from('audio_streams')
        .update({ is_muted: !stream.is_muted })
        .eq('id', streamId);
      
      setAudioStreams(prev => 
        prev.map(s => 
          s.id === streamId ? { ...s, is_muted: !s.is_muted } : s
        )
      );
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  };

  const cleanupSession = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-[calc(100vh-8rem)] bg-gradient-to-br from-background via-muted/20 to-background">
      <ResizablePanelGroup direction="horizontal">
        {/* Left Sidebar - Resizable */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <div className="h-full border-r bg-card/50 backdrop-blur-sm flex flex-col animate-slide-in-right">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Settings className="w-4 h-4 text-primary" />
            Workspace Tools
          </h3>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            <Card className="p-3 bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-primary/10 rounded">
                  <Music className="w-4 h-4 text-primary" />
                </div>
                <span className="font-medium text-sm">Tracks</span>
              </div>
              <p className="text-xs text-muted-foreground">Manage audio files</p>
            </Card>

            <Card className="p-3 bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-accent-cyan/10 rounded">
                  <Volume2 className="w-4 h-4 text-accent-cyan" />
                </div>
                <span className="font-medium text-sm">Mixer</span>
              </div>
              <p className="text-xs text-muted-foreground">Audio levels</p>
            </Card>
          </div>
        </ScrollArea>
      </div>

      {/* Center - Main Workspace (60% width) */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="border-b p-4 bg-card/80 backdrop-blur-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-accent-cyan to-accent-blue bg-clip-text text-transparent">
              Live Collaboration
            </h2>
            <Badge className="bg-green-500 text-white pulse-live">
              <div className="w-2 h-2 bg-white rounded-full mr-1"></div>
              Live
            </Badge>
            {presenceConnected && (
              <Badge variant="outline" className="gap-1">
                <Users className="w-3 h-3" />
                {onlineUsers.length} online
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {isRecording && (
              <div className="flex items-center gap-2 text-red-500 pulse-live">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm font-mono">{formatTime(recordingDuration)}</span>
              </div>
            )}
            
            <Button variant="outline" onClick={onLeaveSession} className="gap-2">
              <PhoneOff className="w-4 h-4" />
              Leave
            </Button>
          </div>
        </div>

        {/* Main Content Area - Video/Workspace */}
        <div className="flex-1 bg-gradient-to-br from-muted/30 to-background flex flex-col relative">
          {isInCall ? (
            // Video Call View
            <div className="flex-1 p-4 overflow-auto">
              <div className="grid gap-4 h-full" style={{
                gridTemplateColumns: remoteStreams.size === 0 ? '1fr' : 
                  remoteStreams.size === 1 ? 'repeat(2, 1fr)' : 
                  remoteStreams.size <= 3 ? 'repeat(2, 1fr)' : 
                  'repeat(3, 1fr)',
              }}>
                {/* Local Video */}
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-glow">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/60 px-3 py-1 rounded-full text-white text-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full pulse-live" />
                    You {isScreenSharing && '(Screen)'}
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1">
                    {!isMicEnabled && (
                      <div className="bg-red-500/80 p-1 rounded">
                        <MicOff className="w-4 h-4 text-white" />
                      </div>
                    )}
                    {!isVideoEnabled && (
                      <div className="bg-red-500/80 p-1 rounded">
                        <VideoOff className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Remote Videos */}
                {Array.from(remoteStreams.entries()).map(([peerId, stream]) => (
                  <RemoteVideoFeed key={peerId} stream={stream} peerId={peerId} />
                ))}
              </div>
              
              {/* Connected peers indicator */}
              {connectedPeers.length > 0 && (
                <div className="absolute top-4 right-4 bg-green-500/20 border border-green-500/50 rounded-full px-3 py-1 text-sm text-green-500">
                  {connectedPeers.length} peer(s) connected
                </div>
              )}
            </div>
          ) : isScreenSharing ? (
            <div className="flex-1 flex items-center justify-center animate-fade-in">
              <div className="text-center">
                <div className="p-6 bg-primary/10 rounded-full w-fit mx-auto mb-4 bloom-hover">
                  <Monitor className="w-20 h-20 text-primary" />
                </div>
                <p className="text-xl font-semibold mb-2">Screen Sharing Active</p>
                <p className="text-muted-foreground">Collaborators can see your screen</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-2xl animate-scale-in">
                <div className="p-8 bg-gradient-to-br from-primary/20 to-accent-cyan/20 rounded-2xl w-fit mx-auto mb-6 shadow-glow-lg bloom-hover">
                  <Camera className="w-24 h-24 text-primary" />
                </div>
                <h3 className="text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-accent-cyan bg-clip-text text-transparent">
                  Global Collaboration Studio
                </h3>
                <p className="text-muted-foreground mb-6">
                  Create music with artists and engineers from anywhere in the world 🌍
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Click "Join Video Call" below to start collaborating in real-time
                </p>
                <div className="flex items-center justify-center gap-4">
                  <Card className="p-4 bg-muted/50">
                    <div className="text-2xl font-bold text-primary">{activeParticipantsCount}</div>
                    <div className="text-xs text-muted-foreground">Active Users</div>
                  </Card>
                  <Card className="p-4 bg-muted/50">
                    <div className="text-2xl font-bold text-accent-cyan">{connectedPeers.length}</div>
                    <div className="text-xs text-muted-foreground">Peers Connected</div>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* Floating status indicator */}
          <div className="absolute top-4 left-4 text-xs text-muted-foreground flex items-center gap-2">
            {presenceConnected ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Real-time connected
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                Connecting...
              </>
            )}
          </div>
        </div>

        {/* Control Bar - More Prominent */}
        <div className="border-t p-6 bg-card/90 backdrop-blur-md">
          <div className="flex items-center justify-center gap-6">
            {!isInCall ? (
              <Button
                variant="default"
                size="lg"
                onClick={handleStartCall}
                className="rounded-full px-6 h-14 bloom-hover gap-2"
              >
                <Phone className="w-6 h-6" />
                Join Video Call
              </Button>
            ) : (
              <>
                <Button
                  variant={isMicEnabled ? "default" : "secondary"}
                  size="lg"
                  onClick={handleToggleMic}
                  className="rounded-full w-14 h-14 bloom-hover"
                >
                  {isMicEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                </Button>
                
                <Button
                  variant={isVideoEnabled ? "default" : "secondary"}
                  size="lg"
                  onClick={handleToggleVideo}
                  className="rounded-full w-14 h-14 bloom-hover"
                >
                  {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                </Button>
                
                <Button
                  variant={isScreenSharing ? "default" : "secondary"}
                  size="lg"
                  onClick={handleToggleScreenShare}
                  className="rounded-full w-14 h-14 bloom-hover"
                >
                  {isScreenSharing ? <MonitorOff className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
                </Button>
                
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={handleEndCall}
                  className="rounded-full w-14 h-14 bloom-hover"
                >
                  <PhoneOff className="w-6 h-6" />
                </Button>
              </>
            )}
            
            <Separator orientation="vertical" className="h-10" />
            
            <Button
              variant={isRecording ? "destructive" : "secondary"}
              size="lg"
              onClick={isRecording ? stopRecording : startRecording}
              className="rounded-full w-14 h-14 bloom-hover"
            >
              {isRecording ? <Square className="w-6 h-6" /> : <div className="w-6 h-6 bg-red-500 rounded-full pulse-live" />}
            </Button>
            
            <div className="flex items-center gap-3 px-4 py-2 bg-muted rounded-full">
              <Volume2 className="w-5 h-5 text-primary" />
              <Slider
                value={masterVolume}
                onValueChange={setMasterVolume}
                max={100}
                step={1}
                className="w-32"
              />
              <span className="text-sm font-medium w-12 text-right">{masterVolume[0]}%</span>
            </div>
          </div>
        </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Main Workspace - Resizable */}
        <ResizablePanel defaultSize={50} minSize={40}>
          <div className="h-full flex flex-col">
            {/* Content placeholder - main workspace */}
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Sidebar - Resizable */}
        <ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
          <div className="h-full border-l bg-card/50 backdrop-blur-sm flex flex-col animate-slide-in-right">
        {/* Participants Section */}
        <div className="p-4 border-b">
          <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-primary" />
            Collaborators ({participants.length})
          </h3>
          <ScrollArea className="max-h-64">
            <div className="space-y-2 pr-4">
              {participants.map((participant, index) => (
                <Card 
                  key={participant.id} 
                  className="p-3 bloom-hover animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent-cyan flex items-center justify-center text-white font-bold">
                      {participant.profiles.full_name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">
                        {participant.profiles.full_name || 'Unknown'}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span>{participant.role}</span>
                        {participant.is_active && (
                          <div className="w-2 h-2 bg-green-500 rounded-full pulse-live"></div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {participant.audio_input_enabled ? (
                        <div className="p-1 bg-green-500/20 rounded">
                          <Mic className="w-3 h-3 text-green-500" />
                        </div>
                      ) : (
                        <div className="p-1 bg-muted rounded">
                          <MicOff className="w-3 h-3 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Audio Mixer Section */}
        <div className="p-4 border-b">
          <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
            <Volume2 className="w-4 h-4 text-accent-cyan" />
            Audio Mixer
          </h3>
          <ScrollArea className="max-h-48">
            <div className="space-y-3 pr-4">
              {audioStreams.map((stream, index) => (
                <Card 
                  key={stream.id} 
                  className="p-3 bg-muted/50 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium truncate flex-1">{stream.stream_name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleStreamMute(stream.id)}
                      className="h-7 w-7 p-0 hover:bg-primary/10"
                    >
                      {stream.is_muted ? (
                        <VolumeX className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-primary" />
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[stream.volume * 100]}
                      onValueChange={([value]) => updateStreamVolume(stream.id, value)}
                      max={100}
                      step={1}
                      className="flex-1"
                      disabled={stream.is_muted}
                    />
                    <span className="text-xs text-muted-foreground w-10 text-right">
                      {Math.round(stream.volume * 100)}%
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Session Chat */}
        <div className="flex-1 flex flex-col p-4 min-h-0">
          <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-accent-blue" />
            Live Chat
          </h3>
          <ScrollArea className="flex-1 mb-3 pr-4">
            <div className="space-y-3">
              {chatMessages.map((message, index) => (
                <div 
                  key={message.id} 
                  className="message-enter"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <Card className="p-3 bg-muted/50">
                    <div className="flex items-start gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent-cyan flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {message.profiles.full_name?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-xs">{message.profiles.full_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm">{message.comment_text}</p>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Send a message..."
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
            />
            <Button size="sm" onClick={sendChatMessage} className="px-4">
              <MessageSquare className="w-4 h-4" />
            </Button>
          </div>
        </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

// Remote video feed component
function RemoteVideoFeed({ stream, peerId }: { stream: MediaStream; peerId: string }) {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-glow">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-2 left-2 bg-black/60 px-3 py-1 rounded-full text-white text-sm">
        Participant {peerId.slice(-4)}
      </div>
    </div>
  );
}

export default CollaborationWorkspace;