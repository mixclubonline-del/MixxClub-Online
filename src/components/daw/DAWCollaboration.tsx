import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Users, 
  Wifi,
  WifiOff,
  MessageCircle,
  Send,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Share,
  Crown,
  UserPlus,
  Settings
} from "lucide-react";
import { useCollaboration } from "@/hooks/useCollaboration";
import type { CollaborationUser } from "@/pages/HybridDAW";

interface DAWCollaborationProps {
  sessionId: string;
  userId: string;
  userName: string;
  onTrackUpdate?: (trackData: any) => void;
  onEffectChange?: (trackId: string, effectData: any) => void;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'system';
}

const DAWCollaboration: React.FC<DAWCollaborationProps> = ({
  sessionId,
  userId,
  userName,
  onTrackUpdate,
  onEffectChange
}) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      userId: 'system',
      userName: 'System',
      message: 'Collaboration session started',
      timestamp: new Date(),
      type: 'system'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);

  // Placeholder for collaboration hook (would use Supabase Realtime)
  const isConnected = false;
  const participants: CollaborationUser[] = [];
  
  const connect = () => {
    console.log('[Collab] Connect requested - implement Supabase Realtime');
  };
  
  const disconnect = () => {
    console.log('[Collab] Disconnect requested');
  };
  
  const sendChatMessage = (message: string) => {
    const chatMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: 'current-user',
      userName: userName,
      message,
      timestamp: new Date(),
      type: 'text'
    };
    setChatMessages(prev => [...prev, chatMessage]);
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    sendChatMessage(newMessage);
    setNewMessage('');
  };

  const handleInviteUser = () => {
    navigator.clipboard.writeText(window.location.href + '?invite=session123');
  };

  return (
    <div className="h-full flex flex-col bg-card/10">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Users className="w-4 h-4" />
            Live Collaboration
          </h3>
          <Badge 
            variant={isConnected ? "default" : "secondary"}
            className={isConnected ? "bg-green-500" : ""}
          >
            {isConnected ? (
              <><Wifi className="w-3 h-3 mr-1" /> Connected</>
            ) : (
              <><WifiOff className="w-3 h-3 mr-1" /> Offline</>
            )}
          </Badge>
        </div>

        {!isConnected ? (
          <Button onClick={connect} className="w-full gap-2">
            <Wifi className="w-4 h-4" />
            Join Live Session
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleInviteUser} className="flex-1 gap-1">
              <UserPlus className="w-3 h-3" />
              Invite
            </Button>
            <Button variant="outline" size="sm" onClick={disconnect} className="flex-1 gap-1">
              <WifiOff className="w-3 h-3" />
              Leave
            </Button>
          </div>
        )}
      </div>

      {isConnected && (
        <>
          {/* Participants */}
          <div className="p-4 border-b border-border">
            <h4 className="text-sm font-medium mb-3">
              Participants ({participants.length + 1})
            </h4>
            
            <div className="space-y-2">
              {/* Current User */}
              <div className="flex items-center gap-3 p-2 bg-primary/10 rounded-lg">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs">You</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">You</span>
                    <Crown className="w-3 h-3 text-yellow-500" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="text-xs">Host</Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant={audioEnabled ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setAudioEnabled(!audioEnabled)}
                    className="h-6 w-6 p-0"
                  >
                    {audioEnabled ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
                  </Button>
                  <Button
                    variant={videoEnabled ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setVideoEnabled(!videoEnabled)}
                    className="h-6 w-6 p-0"
                  >
                    {videoEnabled ? <Video className="w-3 h-3" /> : <VideoOff className="w-3 h-3" />}
                  </Button>
                </div>
              </div>

              {/* Other Participants */}
              {participants.map((collaborator) => (
                <div key={collaborator.id} className="flex items-center gap-3 p-2 rounded-lg">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={collaborator.avatar} />
                    <AvatarFallback className="text-xs">
                      {collaborator.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{collaborator.name}</span>
                      <div className={`w-2 h-2 rounded-full ${
                        collaborator.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <MicOff className="w-3 h-3 text-muted-foreground" />
                    <VideoOff className="w-3 h-3 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Cursors Info */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2 mb-2">
              <Share className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Live Cursors Active</span>
            </div>
            <div className="text-xs text-muted-foreground">
              See where others are working in real-time
            </div>
          </div>

          {/* Chat */}
          <div className="flex-1 flex flex-col">
            <div className="p-3 border-b border-border">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Session Chat
              </h4>
            </div>

            <ScrollArea className="flex-1 p-3">
              <div className="space-y-3">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`${
                      message.type === 'system' 
                        ? 'text-center text-xs text-muted-foreground'
                        : message.userId === 'current-user'
                        ? 'text-right'
                        : 'text-left'
                    }`}
                  >
                    {message.type === 'system' ? (
                      <div className="italic">{message.message}</div>
                    ) : (
                      <div className={`inline-block max-w-[80%] ${
                        message.userId === 'current-user'
                          ? 'bg-primary text-primary-foreground'
                          : message.userId === 'ai-assistant'
                          ? 'bg-accent text-accent-foreground'
                          : 'bg-muted'
                      } rounded-lg p-2`}>
                        <div className="text-xs opacity-70 mb-1">
                          {message.userName}
                        </div>
                        <div className="text-sm">{message.message}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-3 border-t border-border">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <Button size="sm" onClick={sendMessage} disabled={!newMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {!isConnected && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h4 className="text-sm font-medium mb-2">Collaboration Offline</h4>
            <p className="text-xs">
              Connect to start collaborating in real-time with other artists and engineers.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DAWCollaboration;
