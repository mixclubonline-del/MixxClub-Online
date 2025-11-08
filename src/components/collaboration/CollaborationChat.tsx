import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Mic, MicOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: number;
}

interface CollaborationChatProps {
  sessionId: string;
  currentUserId: string;
  currentUserName: string;
  onSendMessage: (message: string) => void;
  messages?: Message[];
  isConnected: boolean;
}

export function CollaborationChat({
  sessionId,
  currentUserId,
  currentUserName,
  onSendMessage,
  messages = [],
  isConnected,
}: CollaborationChatProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputMessage.trim()) return;
    
    if (!isConnected) {
      toast({
        title: 'Not Connected',
        description: 'You are not connected to the session',
        variant: 'destructive',
      });
      return;
    }

    onSendMessage(inputMessage);
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleVoiceChat = () => {
    setIsRecording(!isRecording);
    toast({
      title: isRecording ? 'Voice Chat Disabled' : 'Voice Chat Enabled',
      description: isRecording ? 'Microphone turned off' : 'Microphone turned on',
    });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Chat</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={isRecording ? 'default' : 'outline'}
              size="sm"
              onClick={toggleVoiceChat}
              className="gap-2"
            >
              {isRecording ? (
                <>
                  <Mic className="h-4 w-4" />
                  On
                </>
              ) : (
                <>
                  <MicOff className="h-4 w-4" />
                  Off
                </>
              )}
            </Button>
            <div
              className={`h-2 w-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}
              title={isConnected ? 'Connected' : 'Disconnected'}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 flex flex-col">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((msg) => {
                const isCurrentUser = msg.userId === currentUserId;
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${
                      isCurrentUser ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {msg.userName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`flex flex-col gap-1 max-w-[70%] ${
                        isCurrentUser ? 'items-end' : 'items-start'
                      }`}
                    >
                      <span className="text-xs text-muted-foreground">
                        {msg.userName}
                      </span>
                      <div
                        className={`rounded-lg px-3 py-2 ${
                          isCurrentUser
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {msg.message}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              disabled={!isConnected}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={!inputMessage.trim() || !isConnected}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
