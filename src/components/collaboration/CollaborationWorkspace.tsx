import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
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
  PhoneOff
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
  
  // Audio/Video controls
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [masterVolume, setMasterVolume] = useState([80]);
  
  // Recording state
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingInterval = useRef<NodeJS.Timeout>();
  
  // WebRTC refs
  const localStreamRef = useRef<MediaStream>();
  const audioContextRef = useRef<AudioContext>();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sessionId && user) {
      loadSessionData();
      setupRealtimeSubscriptions();
    }
    
    return () => {
      cleanupSession();
    };
  }, [sessionId, user]);

  useEffect(() => {
    // Auto-scroll chat to bottom
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

  const toggleMicrophone = async () => {
    try {
      if (!isMicEnabled) {
        localStreamRef.current = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: 48000,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        
        // Create audio stream record
        await supabase
          .from('audio_streams')
          .insert({
            session_id: sessionId,
            user_id: user?.id,
            stream_name: `${user?.email}-mic`,
            stream_type: 'microphone',
            volume: 0.8,
            is_active: true
          });
      } else {
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach(track => track.stop());
          localStreamRef.current = undefined;
        }
        
        // Remove audio stream record
        await supabase
          .from('audio_streams')
          .delete()
          .eq('session_id', sessionId)
          .eq('user_id', user?.id)
          .eq('stream_type', 'microphone');
      }
      
      // Update participant state
      await supabase
        .from('session_participants')
        .update({ audio_input_enabled: !isMicEnabled })
        .eq('session_id', sessionId)
        .eq('user_id', user?.id);

      setIsMicEnabled(!isMicEnabled);
    } catch (error) {
      console.error('Error toggling microphone:', error);
      toast.error('Failed to toggle microphone');
    }
  };

  const toggleVideo = async () => {
    try {
      await supabase
        .from('session_participants')
        .update({ video_enabled: !isVideoEnabled })
        .eq('session_id', sessionId)
        .eq('user_id', user?.id);

      setIsVideoEnabled(!isVideoEnabled);
    } catch (error) {
      console.error('Error toggling video:', error);
      toast.error('Failed to toggle video');
    }
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
            shared_by: user?.id,
            screen_type: 'full',
            is_active: true
          });
        
        toast.success('Screen sharing started');
      } else {
        // End screen share
        await supabase
          .from('screen_shares')
          .update({ is_active: false, ended_at: new Date().toISOString() })
          .eq('session_id', sessionId)
          .eq('shared_by', user?.id)
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
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
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
    <div className="flex h-screen bg-background">
      {/* Main workspace */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">Live Collaboration Session</h2>
            <Badge className="bg-green-500 text-white">
              <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
              Live
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            {isRecording && (
              <div className="flex items-center gap-2 text-red-500">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-mono">{formatTime(recordingDuration)}</span>
              </div>
            )}
            
            <Button variant="outline" onClick={onLeaveSession}>
              <PhoneOff className="w-4 h-4 mr-2" />
              Leave Session
            </Button>
          </div>
        </div>

        {/* Video/Screen Share Area */}
        <div className="flex-1 bg-gray-900 flex items-center justify-center relative">
          {isScreenSharing ? (
            <div className="text-center text-white">
              <Monitor className="w-16 h-16 mx-auto mb-4" />
              <p>Screen sharing active</p>
            </div>
          ) : (
            <div className="text-center text-white">
              <Users className="w-16 h-16 mx-auto mb-4" />
              <p>Collaboration workspace</p>
              <p className="text-sm text-gray-400">Share your screen or enable video to start</p>
            </div>
          )}
        </div>

        {/* Control Bar */}
        <div className="border-t p-4 bg-card">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant={isMicEnabled ? "default" : "secondary"}
              size="lg"
              onClick={toggleMicrophone}
              className="rounded-full"
            >
              {isMicEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </Button>
            
            <Button
              variant={isVideoEnabled ? "default" : "secondary"}
              size="lg"
              onClick={toggleVideo}
              className="rounded-full"
            >
              {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </Button>
            
            <Button
              variant={isScreenSharing ? "default" : "secondary"}
              size="lg"
              onClick={toggleScreenShare}
              className="rounded-full"
            >
              {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
            </Button>
            
            <Separator orientation="vertical" className="h-8" />
            
            <Button
              variant={isRecording ? "destructive" : "secondary"}
              size="lg"
              onClick={isRecording ? stopRecording : startRecording}
              className="rounded-full"
            >
              {isRecording ? <Square className="w-5 h-5" /> : <div className="w-5 h-5 bg-red-500 rounded-full" />}
            </Button>
            
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              <Slider
                value={masterVolume}
                onValueChange={setMasterVolume}
                max={100}
                step={1}
                className="w-24"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-80 border-l flex flex-col">
        {/* Participants */}
        <Card className="border-0 border-b rounded-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4" />
              Participants ({participants.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {participants.map((participant) => (
                <div key={participant.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs">
                    {participant.profiles.full_name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {participant.profiles.full_name || 'Unknown'}
                    </div>
                    <div className="text-xs text-muted-foreground">{participant.role}</div>
                  </div>
                  <div className="flex gap-1">
                    {participant.audio_input_enabled ? (
                      <Mic className="w-3 h-3 text-green-500" />
                    ) : (
                      <MicOff className="w-3 h-3 text-muted-foreground" />
                    )}
                    {participant.video_enabled ? (
                      <Video className="w-3 h-3 text-green-500" />
                    ) : (
                      <VideoOff className="w-3 h-3 text-muted-foreground" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Audio Mixer */}
        <Card className="border-0 border-b rounded-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Audio Mixer</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="max-h-48">
              <div className="space-y-3">
                {audioStreams.map((stream) => (
                  <div key={stream.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium truncate">{stream.stream_name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStreamMute(stream.id)}
                        className="h-6 w-6 p-0"
                      >
                        {stream.is_muted ? (
                          <VolumeX className="w-3 h-3" />
                        ) : (
                          <Volume2 className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                    <Slider
                      value={[stream.volume * 100]}
                      onValueChange={([value]) => updateStreamVolume(stream.id, value)}
                      max={100}
                      step={1}
                      className="w-full"
                      disabled={stream.is_muted}
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat */}
        <Card className="flex-1 border-0 rounded-none flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Session Chat
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col pt-0">
            <ScrollArea className="flex-1 mb-3" ref={chatContainerRef}>
              <div className="space-y-2">
                {chatMessages.map((message) => (
                  <div key={message.id} className="text-xs">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="font-medium">{message.profiles.full_name}</span>
                      <span className="text-muted-foreground">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{message.comment_text}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
              />
              <Button size="sm" onClick={sendChatMessage}>
                Send
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CollaborationWorkspace;