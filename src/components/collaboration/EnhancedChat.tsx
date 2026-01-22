import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Send, AtSign, X, Pin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CharacterEmptyState } from '@/components/characters/CharacterEmptyState';

interface Participant {
  id: string;
  name: string;
  avatar?: string;
}

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

interface EnhancedChatProps {
  sessionId: string;
  currentUserId: string;
  currentUserName: string;
  participants: Participant[];
  isConnected: boolean;
  className?: string;
}

export const EnhancedChat: React.FC<EnhancedChatProps> = ({
  sessionId,
  currentUserId,
  currentUserName,
  participants,
  isConnected,
  className,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [pinnedMessages, setPinnedMessages] = useState<Message[]>([]);
  const [showPinned, setShowPinned] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { typingUsers, sendTyping, stopTyping } = useTypingIndicator(
    sessionId,
    currentUserId,
    currentUserName
  );

  // Load messages
  useEffect(() => {
    loadMessages();
    setupRealtimeSubscription();
  }, [sessionId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('session_comments')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Get sender profiles
      const senderIds = [...new Set(data?.map(m => m.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', senderIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      const formattedMessages: Message[] = (data || []).map((m: any) => {
        const profile = profileMap.get(m.user_id);
        // Parse metadata for reactions and reply info
        const metadata = m.metadata as any || {};
        
        return {
          id: m.id,
          userId: m.user_id,
          userName: profile?.full_name || 'Unknown',
          userAvatar: profile?.avatar_url,
          message: m.comment_text,
          timestamp: new Date(m.created_at).getTime(),
          reactions: metadata.reactions || [],
          replyTo: metadata.replyTo,
          isPinned: metadata.isPinned || false,
        };
      });

      setMessages(formattedMessages);
      setPinnedMessages(formattedMessages.filter(m => m.isPinned));
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`chat-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'session_comments',
          filter: `session_id=eq.${sessionId}`
        },
        () => loadMessages()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputMessage(value);
    sendTyping();

    // Check for @ mentions
    const lastAtIndex = value.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const afterAt = value.slice(lastAtIndex + 1);
      if (!afterAt.includes(' ')) {
        setShowMentions(true);
        setMentionFilter(afterAt.toLowerCase());
        return;
      }
    }
    setShowMentions(false);
  };

  const insertMention = (participant: Participant) => {
    const lastAtIndex = inputMessage.lastIndexOf('@');
    const newMessage = inputMessage.slice(0, lastAtIndex) + `@${participant.name} `;
    setInputMessage(newMessage);
    setShowMentions(false);
    inputRef.current?.focus();
  };

  const handleSend = async () => {
    if (!inputMessage.trim() || !isConnected) return;

    stopTyping();

    try {
      const msgMetadata: Record<string, any> = {};
      
      if (replyingTo) {
        msgMetadata.replyTo = {
          id: replyingTo.id,
          userName: replyingTo.userName,
          preview: replyingTo.message.slice(0, 50),
        };
      }

      // Use type assertion to allow metadata field
      const insertData: any = {
        session_id: sessionId,
        user_id: currentUserId,
        comment_text: inputMessage.trim(),
        metadata: msgMetadata,
      };

      const { error } = await supabase
        .from('session_comments')
        .insert(insertData);

      if (error) throw error;

      setInputMessage('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleReact = async (messageId: string, emoji: string) => {
    try {
      // Find the message
      const message = messages.find(m => m.id === messageId);
      if (!message) return;

      // Toggle reaction
      const existingReaction = message.reactions?.find(
        r => r.userId === currentUserId && r.emoji === emoji
      );

      let newReactions = [...(message.reactions || [])];
      
      if (existingReaction) {
        newReactions = newReactions.filter(
          r => !(r.userId === currentUserId && r.emoji === emoji)
        );
      } else {
        newReactions.push({
          emoji,
          userId: currentUserId,
          userName: currentUserName,
        });
      }

      // Update in database - use type assertion for metadata field
      const updateData: any = {
        metadata: {
          ...((message as any).metadata || {}),
          reactions: newReactions,
        }
      };
      
      const { error } = await supabase
        .from('session_comments')
        .update(updateData)
        .eq('id', messageId);

      if (error) throw error;

      // Optimistic update
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, reactions: newReactions } : m
      ));
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const handleReply = (message: Message) => {
    setReplyingTo(message);
    inputRef.current?.focus();
  };

  const handlePin = async (messageId: string) => {
    try {
      const message = messages.find(m => m.id === messageId);
      if (!message) return;

      const newPinnedState = !message.isPinned;

      // Use type assertion for metadata field
      const updateData: any = {
        metadata: {
          ...((message as any).metadata || {}),
          isPinned: newPinnedState,
        },
        is_pinned: newPinnedState,
      };

      const { error } = await supabase
        .from('session_comments')
        .update(updateData)
        .eq('id', messageId);

      if (error) throw error;

      toast.success(newPinnedState ? 'Message pinned' : 'Message unpinned');
      loadMessages();
    } catch (error) {
      console.error('Error pinning message:', error);
    }
  };

  const handleDelete = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('session_comments')
        .delete()
        .eq('id', messageId)
        .eq('user_id', currentUserId);

      if (error) throw error;

      setMessages(prev => prev.filter(m => m.id !== messageId));
      toast.success('Message deleted');
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const filteredParticipants = participants.filter(
    p => p.id !== currentUserId && 
    p.name.toLowerCase().includes(mentionFilter)
  );

  return (
    <Card className={cn("h-full flex flex-col", className)}>
      <CardHeader className="border-b py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Chat</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {messages.length}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {pinnedMessages.length > 0 && (
              <Button
                variant={showPinned ? "default" : "outline"}
                size="sm"
                onClick={() => setShowPinned(!showPinned)}
                className="gap-1"
              >
                <Pin className="h-3.5 w-3.5" />
                {pinnedMessages.length}
              </Button>
            )}
            <div
              className={cn(
                "h-2 w-2 rounded-full",
                isConnected ? "bg-green-500" : "bg-destructive"
              )}
            />
          </div>
        </div>

        {/* Pinned Messages */}
        {showPinned && pinnedMessages.length > 0 && (
          <div className="mt-2 p-2 bg-muted/50 rounded-lg space-y-2">
            <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Pin className="h-3 w-3" /> Pinned Messages
            </div>
            {pinnedMessages.slice(0, 3).map(msg => (
              <div key={msg.id} className="text-xs truncate">
                <span className="font-medium">{msg.userName}:</span> {msg.message}
              </div>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 p-0 flex flex-col min-h-0">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <CharacterEmptyState
                type="messages"
                title="No messages yet"
                className="py-6"
              />
            ) : (
              messages.map(msg => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  currentUserId={currentUserId}
                  onReact={handleReact}
                  onReply={handleReply}
                  onPin={handlePin}
                  onDelete={handleDelete}
                  participants={participants}
                />
              ))
            )}
          </div>
        </ScrollArea>

        {/* Typing Indicator */}
        <TypingIndicator typingUsers={typingUsers} />

        {/* Reply Preview */}
        {replyingTo && (
          <div className="px-4 py-2 border-t bg-muted/50 flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground">
                Replying to <span className="font-medium">{replyingTo.userName}</span>
              </div>
              <p className="text-sm truncate">{replyingTo.message}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setReplyingTo(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t relative">
          {/* Mention Dropdown */}
          {showMentions && filteredParticipants.length > 0 && (
            <div className="absolute bottom-full left-4 right-4 mb-1 bg-popover border rounded-lg shadow-lg p-1 max-h-40 overflow-y-auto">
              {filteredParticipants.map(p => (
                <button
                  key={p.id}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-accent rounded flex items-center gap-2"
                  onClick={() => insertMention(p)}
                >
                  <AtSign className="h-3.5 w-3.5 text-muted-foreground" />
                  {p.name}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              onBlur={() => setTimeout(() => setShowMentions(false), 200)}
              placeholder="Type a message... Use @ to mention"
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
};
