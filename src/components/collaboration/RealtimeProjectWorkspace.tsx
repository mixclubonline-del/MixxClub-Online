import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Play, Pause, MessageSquare, Users, Video, 
  Mic, MicOff, Send, X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCollaboration } from '@/hooks/useCollaboration';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  cursor?: { x: number; y: number };
  isHost: boolean;
}

interface RealtimeProjectWorkspaceProps {
  sessionId: string;
  projectId: string;
  audioFileUrl?: string;
  onClose?: () => void;
}

export const RealtimeProjectWorkspace = ({
  sessionId,
  projectId,
  audioFileUrl,
  onClose
}: RealtimeProjectWorkspaceProps) => {
  const { user } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const {
    isConnected,
    participants,
    connect,
    disconnect,
    sendCursorMove,
    sendTrackUpdate,
    sendMessage
  } = useCollaboration({
    sessionId,
    userId: user?.id || '',
    userName: user?.user_metadata?.full_name || 'Anonymous',
    onMessage: (message) => {
      if (message.type === 'chat_message') {
        setChatMessages(prev => [...prev, {
          id: Date.now(),
          userId: message.userId,
          userName: message.userName || 'Unknown',
          text: message.data?.text || '',
          timestamp: new Date()
        }]);
      } else if (message.type === 'track_update' && message.data?.type === 'playback') {
        setIsPlaying(message.data?.isPlaying || false);
        setPlaybackPosition(message.data?.position || 0);
      }
    },
    onUserJoin: (user) => {
      toast.success(`${user.name || 'Someone'} joined the session`);
    },
    onUserLeave: (userId) => {
      toast.info('A user left the session');
    },
    onCursorMove: (userId, cursor) => {
      // Cursor positions are handled automatically in the hook's participants state
    }
  });

  useEffect(() => {
    connect();
    return () => disconnect();
  }, []);

  // Track mouse movement for cursor sharing
  useEffect(() => {
    if (!workspaceRef.current || !isConnected) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = workspaceRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      sendCursorMove({ x, y });
    };

    const element = workspaceRef.current;
    element.addEventListener('mousemove', handleMouseMove);

    return () => element.removeEventListener('mousemove', handleMouseMove);
  }, [isConnected, sendCursorMove]);

  // Sync audio playback
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.currentTime = playbackPosition;
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, playbackPosition]);

  const handlePlayPause = () => {
    const newIsPlaying = !isPlaying;
    const newPosition = audioRef.current?.currentTime || 0;
    
    setIsPlaying(newIsPlaying);
    sendTrackUpdate({
      type: 'playback',
      isPlaying: newIsPlaying,
      position: newPosition
    });
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;

    sendMessage({
      type: 'chat_message',
      sessionId,
      data: { text: chatInput }
    });
    
    setChatInput('');
  };

  return (
    <div 
      ref={workspaceRef}
      className="fixed inset-0 z-50 bg-background flex flex-col"
    >
      {/* Header */}
      <div className="h-16 border-b flex items-center justify-between px-6 bg-card">
        <div className="flex items-center gap-4">
          <Badge variant={isConnected ? "default" : "secondary"} className="gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
            {isConnected ? 'Connected' : 'Connecting...'}
          </Badge>

          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">{participants.length + 1} participants</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowChat(!showChat)}
            className="gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Chat
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Workspace */}
        <div className="flex-1 relative bg-gradient-to-br from-background to-muted/20">
          {/* Collaborative Cursors */}
          <AnimatePresence>
            {participants.map((participant) => (
              participant.cursor && (
                <motion.div
                  key={participant.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  style={{
                    position: 'absolute',
                    left: `${participant.cursor.x}%`,
                    top: `${participant.cursor.y}%`,
                    pointerEvents: 'none',
                    zIndex: 100
                  }}
                  className="flex items-center gap-2"
                >
                  <div className="w-4 h-4 bg-primary rounded-full" />
                  <Badge className="text-xs whitespace-nowrap">
                    {participant.name}
                  </Badge>
                </motion.div>
              )
            ))}
          </AnimatePresence>

          {/* Waveform Visualization Area */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Card className="w-full max-w-4xl mx-8 p-8">
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">Audio Playback</h3>
                  <p className="text-muted-foreground">
                    Synced playback with all participants
                  </p>
                </div>

                {/* Playback Controls */}
                <div className="flex items-center justify-center gap-4">
                  <Button
                    size="lg"
                    onClick={handlePlayPause}
                    className="w-16 h-16 rounded-full"
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                  </Button>
                </div>

                {/* Timeline */}
                <div className="space-y-2">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${playbackPosition}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0:00</span>
                    <span>3:45</span>
                  </div>
                </div>

                {/* Participants List */}
                <div className="flex items-center justify-center gap-2 pt-4">
                  {participants.map((participant) => (
                    <Avatar key={participant.id} className="w-8 h-8 border-2 border-primary">
                      <AvatarImage src={participant.avatar} />
                      <AvatarFallback>{participant.name[0]}</AvatarFallback>
                    </Avatar>
                  ))}
                  <Avatar className="w-8 h-8 border-2 border-primary">
                    <AvatarFallback>
                      {user?.user_metadata?.full_name?.[0] || 'Y'}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </Card>
          </div>

          {/* Hidden Audio Element */}
          {audioFileUrl && (
            <audio ref={audioRef} src={audioFileUrl} preload="auto" />
          )}
        </div>

        {/* Chat Sidebar */}
        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="w-80 border-l bg-card flex flex-col"
            >
              <div className="p-4 border-b">
                <h3 className="font-semibold flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Live Chat
                </h3>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">{msg.userName}</span>
                        <span className="text-xs text-muted-foreground">
                          {msg.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      <p className="text-sm bg-muted p-2 rounded-lg">{msg.text}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                    placeholder="Type a message..."
                    className="flex-1"
                  />
                  <Button size="icon" onClick={handleSendChat}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
