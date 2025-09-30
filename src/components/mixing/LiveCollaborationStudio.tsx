import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Share, 
  MessageSquare, 
  Settings,
  Volume2,
  Headphones,
  Monitor,
  Wifi,
  Clock
} from 'lucide-react';

interface Collaborator {
  id: string;
  name: string;
  role: string;
  isOnline: boolean;
  isMicOn: boolean;
  isVideoOn: boolean;
  isScreenSharing: boolean;
  avatar: string;
  lastSeen?: string;
}

interface ChatMessage {
  id: string;
  userId: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'audio_comment' | 'system';
}

export const LiveCollaborationStudio = () => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    {
      id: '1',
      name: 'Sarah Chen',
      role: 'Mix Engineer',
      isOnline: true,
      isMicOn: true,
      isVideoOn: false,
      isScreenSharing: false,
      avatar: 'SC'
    },
    {
      id: '2',
      name: 'Mike Rodriguez',
      role: 'Producer',
      isOnline: true,
      isMicOn: false,
      isVideoOn: true,
      isScreenSharing: true,
      avatar: 'MR'
    },
    {
      id: '3',
      name: 'Alex Kim',
      role: 'Artist',
      isOnline: false,
      isMicOn: false,
      isVideoOn: false,
      isScreenSharing: false,
      avatar: 'AK',
      lastSeen: '2 minutes ago'
    },
    {
      id: '4',
      name: 'Jordan Taylor',
      role: 'Sound Designer',
      isOnline: true,
      isMicOn: true,
      isVideoOn: false,
      isScreenSharing: false,
      avatar: 'JT'
    }
  ]);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      userId: '1',
      message: 'The vocal EQ sounds much better now! 🎤',
      timestamp: new Date(Date.now() - 5 * 60000),
      type: 'text'
    },
    {
      id: '2',
      userId: '2',
      message: 'Agreed! Let me share my screen to show the compressor settings',
      timestamp: new Date(Date.now() - 3 * 60000),
      type: 'text'
    },
    {
      id: '3',
      userId: 'system',
      message: 'Mike Rodriguez started screen sharing',
      timestamp: new Date(Date.now() - 2 * 60000),
      type: 'system'
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(2547); // seconds

  useEffect(() => {
    const interval = setInterval(() => {
      setSessionDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: 'current-user',
      message: newMessage,
      timestamp: new Date(),
      type: 'text'
    };

    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const toggleCollaboratorMic = (id: string) => {
    setCollaborators(prev => prev.map(collab => 
      collab.id === id ? { ...collab, isMicOn: !collab.isMicOn } : collab
    ));
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Main Collaboration Area */}
      <div className="lg:col-span-2 space-y-4">
        {/* Session Info */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Live Mixing Session
              </CardTitle>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-mono">{formatTime(sessionDuration)}</span>
                </div>
                <Badge variant="outline" className="gap-1">
                  <Wifi className="w-3 h-3" />
                  Excellent
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Button size="sm" className="gap-1">
                <Mic className="w-3 h-3" />
                Mute All
              </Button>
              <Button size="sm" variant="outline" className="gap-1">
                <Headphones className="w-3 h-3" />
                Private Listen
              </Button>
              <Button size="sm" variant="outline" className="gap-1">
                <Monitor className="w-3 h-3" />
                Share Screen
              </Button>
              <Button size="sm" variant="outline" className="gap-1">
                <Settings className="w-3 h-3" />
                Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Collaborators Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Session Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {collaborators.map((collaborator) => (
                <div 
                  key={collaborator.id} 
                  className={`p-4 rounded-lg border-2 transition-all ${
                    collaborator.isOnline 
                      ? 'border-green-200 bg-green-50/50' 
                      : 'border-muted bg-muted/20'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className={
                            collaborator.isOnline ? 'bg-primary text-primary-foreground' : 'bg-muted'
                          }>
                            {collaborator.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${
                          collaborator.isOnline ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{collaborator.name}</p>
                        <p className="text-xs text-muted-foreground">{collaborator.role}</p>
                      </div>
                    </div>
                    
                    {collaborator.isScreenSharing && (
                      <Badge variant="secondary" className="text-xs">
                        <Share className="w-3 h-3 mr-1" />
                        Sharing
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={collaborator.isMicOn ? "default" : "outline"}
                      onClick={() => toggleCollaboratorMic(collaborator.id)}
                      disabled={!collaborator.isOnline}
                      className="flex-1"
                    >
                      {collaborator.isMicOn ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
                    </Button>
                    <Button
                      size="sm"
                      variant={collaborator.isVideoOn ? "default" : "outline"}
                      disabled={!collaborator.isOnline}
                      className="flex-1"
                    >
                      {collaborator.isVideoOn ? <Video className="w-3 h-3" /> : <VideoOff className="w-3 h-3" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!collaborator.isOnline}
                      className="flex-1"
                    >
                      <Volume2 className="w-3 h-3" />
                    </Button>
                  </div>

                  {!collaborator.isOnline && collaborator.lastSeen && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Last seen: {collaborator.lastSeen}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat Panel */}
      <div className="space-y-4">
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="w-5 h-5" />
              Session Chat
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 space-y-3 overflow-y-auto mb-4 max-h-96">
              {chatMessages.map((message) => (
                <div key={message.id} className={`${
                  message.type === 'system' ? 'text-center' : ''
                }`}>
                  {message.type === 'system' ? (
                    <div className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1 inline-block">
                      {message.message}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">
                          {collaborators.find(c => c.id === message.userId)?.name || 'You'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatMessageTime(message.timestamp)}
                        </span>
                      </div>
                      <div className="text-sm bg-background rounded p-2 border">
                        {message.message}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button 
                  size="sm" 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                >
                  Send
                </Button>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={() => setIsRecording(!isRecording)}
              >
                <Mic className={`w-3 h-3 ${isRecording ? 'text-red-500' : ''}`} />
                {isRecording ? 'Stop Recording' : 'Voice Message'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};