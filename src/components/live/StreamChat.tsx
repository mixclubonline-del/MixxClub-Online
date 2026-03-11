import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, Pin } from 'lucide-react';
import { useLiveChat, type ChatMessage } from '@/hooks/useLiveStream';

interface StreamChatProps {
  streamId: string;
}

export function StreamChat({ streamId }: StreamChatProps) {
  const { messages, sendMessage } = useLiveChat(streamId);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput('');
  };

  const pinnedMessages = messages.filter(m => m.message_type === 'pinned');
  const chatMessages = messages.filter(m => m.message_type !== 'pinned');

  return (
    <div className="flex flex-col h-full">
      {/* Pinned messages */}
      {pinnedMessages.length > 0 && (
        <div className="border-b border-border/30 p-3 space-y-1">
          {pinnedMessages.slice(-1).map(msg => (
            <div key={msg.id} className="flex items-start gap-2 text-sm">
              <Pin className="h-3 w-3 text-primary shrink-0 mt-0.5" />
              <span className="text-muted-foreground">{msg.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {chatMessages.map(msg => (
          <ChatBubble key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border/30 p-3">
        <form
          onSubmit={e => { e.preventDefault(); handleSend(); }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Say something…"
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const initials = message.user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

  if (message.message_type === 'system') {
    return (
      <div className="text-center">
        <Badge variant="secondary" className="text-xs">{message.message}</Badge>
      </div>
    );
  }

  if (message.message_type === 'gift') {
    return (
      <div className="flex items-center gap-2 text-sm bg-yellow-500/10 rounded-lg px-3 py-1.5">
        <span className="font-medium text-yellow-500">{message.user?.full_name || 'Someone'}</span>
        <span className="text-muted-foreground">{message.message}</span>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2">
      <Avatar className="h-6 w-6 shrink-0">
        <AvatarImage src={message.user?.avatar_url || undefined} />
        <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <span className="text-xs font-medium text-primary mr-2">
          {message.user?.full_name || 'Anonymous'}
        </span>
        <span className="text-sm text-foreground break-words">{message.message}</span>
      </div>
    </div>
  );
}
