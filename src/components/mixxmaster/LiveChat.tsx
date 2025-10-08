import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
}

interface LiveChatProps {
  sessionId: string;
}

export function LiveChat({ sessionId }: LiveChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setupChat();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const setupChat = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setCurrentUserId(user.id);

    const newChannel = supabase.channel(`chat:${sessionId}`);

    newChannel
      .on('broadcast', { event: 'message' }, (payload) => {
        const message: ChatMessage = payload.payload;
        setMessages((prev) => [...prev, message]);
      })
      .subscribe();

    setChannel(newChannel);
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !channel) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const message: ChatMessage = {
        id: crypto.randomUUID(),
        userId: user.id,
        userName: user.email?.split('@')[0] || 'Anonymous',
        message: newMessage.trim(),
        timestamp: new Date().toISOString()
      };

      await channel.send({
        type: 'broadcast',
        event: 'message',
        payload: message
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="flex flex-col h-[500px]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageCircle className="h-4 w-4" />
          Live Chat
        </CardTitle>
        <CardDescription>
          Collaborate in real-time with your team
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-4" ref={scrollRef}>
          <div className="space-y-4 py-4">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${
                    msg.userId === currentUserId ? 'flex-row-reverse' : ''
                  }`}
                >
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="text-xs">
                      {getInitials(msg.userName)}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`flex-1 space-y-1 ${
                      msg.userId === currentUserId ? 'text-right' : ''
                    }`}
                  >
                    <div className="flex items-baseline gap-2">
                      {msg.userId !== currentUserId && (
                        <span className="text-sm font-medium">{msg.userName}</span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                    <div
                      className={`inline-block px-3 py-2 rounded-lg text-sm ${
                        msg.userId === currentUserId
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button onClick={sendMessage} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
