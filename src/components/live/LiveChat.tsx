import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLiveChat, ChatMessage } from '@/hooks/useLiveStream';
import { cn } from '@/lib/utils';

interface LiveChatProps {
  streamId: string;
  className?: string;
  onGiftClick?: () => void;
}

const ChatMessageItem: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const initials = message.user?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || '?';

  const isSystemMessage = message.message_type === 'system';
  const isGiftMessage = message.message_type === 'gift';

  if (isSystemMessage) {
    return (
      <div className="text-center text-xs text-muted-foreground py-1">
        {message.message}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex gap-2 py-1 px-2 rounded hover:bg-muted/50 transition-colors',
        isGiftMessage && 'bg-primary/10',
        message.is_highlighted && 'bg-yellow-500/20 border-l-2 border-yellow-500'
      )}
    >
      <Avatar className="h-6 w-6 flex-shrink-0">
        <AvatarImage src={message.user?.avatar_url || undefined} />
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <span className="font-medium text-sm text-primary">
          {message.user?.full_name || 'Anonymous'}
        </span>
        <span className="text-sm ml-2">{message.message}</span>
      </div>
    </div>
  );
};

const QUICK_REACTIONS = ['🔥', '❤️', '💯', '👏', '🤯', '🔊'];

export const LiveChat: React.FC<LiveChatProps> = ({ streamId, className, onGiftClick }) => {
  const { messages, sendMessage } = useLiveChat(streamId);
  const [inputValue, setInputValue] = useState('');
  const [showReactions, setShowReactions] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    sendMessage(inputValue.trim());
    setInputValue('');
  };

  const handleReaction = (emoji: string) => {
    sendMessage(emoji, 'reaction');
    setShowReactions(false);
  };

  return (
    <div className={cn('flex flex-col h-full bg-background border rounded-lg', className)}>
      {/* Header */}
      <div className="p-3 border-b flex items-center justify-between">
        <h3 className="font-medium">Live Chat</h3>
        <span className="text-xs text-muted-foreground">{messages.length} messages</span>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-2" ref={scrollRef}>
        <div className="space-y-1">
          {messages.map((message) => (
            <ChatMessageItem key={message.id} message={message} />
          ))}
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground text-sm py-8">
              Be the first to say something!
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Quick Reactions */}
      {showReactions && (
        <div className="px-3 py-2 border-t flex items-center gap-2">
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleReaction(emoji)}
              className="text-xl hover:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t flex items-center gap-2">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setShowReactions(!showReactions)}
          className="flex-shrink-0"
        >
          <Smile className="h-5 w-5" />
        </Button>
        <Input
          placeholder="Say something..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1"
        />
        {onGiftClick && (
          <Button
            size="icon"
            variant="ghost"
            onClick={onGiftClick}
            className="flex-shrink-0 text-primary"
          >
            <Gift className="h-5 w-5" />
          </Button>
        )}
        <Button size="icon" onClick={handleSend} disabled={!inputValue.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default LiveChat;
