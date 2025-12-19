import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SmilePlus, Reply, MoreHorizontal, Pin, Copy, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const REACTIONS = ['👍', '❤️', '😂', '🎵', '🔥', '👏', '🎧', '✨'];

interface Reaction {
  emoji: string;
  userId: string;
  userName: string;
}

interface Message {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  message: string;
  timestamp: number;
  reactions?: Reaction[];
  replyTo?: {
    id: string;
    userName: string;
    preview: string;
  };
  isPinned?: boolean;
}

interface ChatMessageProps {
  message: Message;
  currentUserId: string;
  onReact: (messageId: string, emoji: string) => void;
  onReply: (message: Message) => void;
  onPin?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
  participants?: { id: string; name: string }[];
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  currentUserId,
  onReact,
  onReply,
  onPin,
  onDelete,
}) => {
  const [showActions, setShowActions] = useState(false);
  const isCurrentUser = message.userId === currentUserId;
  
  // Group reactions by emoji
  const reactionCounts = message.reactions?.reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const userReactions = new Set(
    message.reactions?.filter(r => r.userId === currentUserId).map(r => r.emoji) || []
  );

  // Parse mentions in message text
  const renderMessage = (text: string) => {
    const mentionRegex = /@(\w+)/g;
    const parts = text.split(mentionRegex);
    
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return (
          <span key={index} className="text-primary font-medium">
            @{part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div
      className={cn(
        "group relative flex gap-3",
        isCurrentUser ? "flex-row-reverse" : "flex-row"
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={message.userAvatar} />
        <AvatarFallback className="text-xs bg-primary/10 text-primary">
          {message.userName.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className={cn(
        "flex flex-col gap-1 max-w-[70%]",
        isCurrentUser ? "items-end" : "items-start"
      )}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            {message.userName}
          </span>
          <span className="text-xs text-muted-foreground/60">
            {format(new Date(message.timestamp), 'HH:mm')}
          </span>
          {message.isPinned && (
            <Pin className="h-3 w-3 text-primary" />
          )}
        </div>

        {/* Reply Preview */}
        {message.replyTo && (
          <div className={cn(
            "text-xs text-muted-foreground border-l-2 border-primary/50 pl-2 py-1 mb-1 rounded-r bg-muted/50",
            isCurrentUser ? "mr-2" : "ml-2"
          )}>
            <span className="font-medium">@{message.replyTo.userName}</span>
            <p className="truncate max-w-[200px]">{message.replyTo.preview}</p>
          </div>
        )}

        {/* Message Bubble */}
        <div className={cn(
          "rounded-2xl px-4 py-2 relative",
          isCurrentUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-muted rounded-bl-md"
        )}>
          <p className="text-sm whitespace-pre-wrap break-words">
            {renderMessage(message.message)}
          </p>
        </div>

        {/* Reactions */}
        {Object.keys(reactionCounts).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {Object.entries(reactionCounts).map(([emoji, count]) => (
              <button
                key={emoji}
                onClick={() => onReact(message.id, emoji)}
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs",
                  "bg-muted hover:bg-muted/80 transition-colors",
                  userReactions.has(emoji) && "ring-1 ring-primary"
                )}
              >
                <span>{emoji}</span>
                <span className="text-muted-foreground">{count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className={cn(
          "absolute flex items-center gap-1 -top-3",
          isCurrentUser ? "left-0" : "right-0",
          "bg-background border rounded-lg shadow-sm p-1 z-10"
        )}>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <SmilePlus className="h-3.5 w-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2" side="top">
              <div className="flex gap-1">
                {REACTIONS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => onReact(message.id, emoji)}
                    className="text-lg hover:scale-125 transition-transform p-1"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6"
            onClick={() => onReply(message)}
          >
            <Reply className="h-3.5 w-3.5" />
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-32 p-1" side="top">
              <div className="flex flex-col">
                {onPin && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="justify-start gap-2 h-8"
                    onClick={() => onPin(message.id)}
                  >
                    <Pin className="h-3.5 w-3.5" />
                    Pin
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="justify-start gap-2 h-8"
                  onClick={() => navigator.clipboard.writeText(message.message)}
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </Button>
                {isCurrentUser && onDelete && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="justify-start gap-2 h-8 text-destructive hover:text-destructive"
                    onClick={() => onDelete(message.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
};
