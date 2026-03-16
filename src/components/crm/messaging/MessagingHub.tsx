import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Send,
  Paperclip,
  MessageCircle,
  Users,
  Star,
  Archive,
  MoreVertical,
  Check,
  CheckCheck,
  Clock,
  Zap,
  X,
  Filter,
  PlayCircle,
} from 'lucide-react';
import { useDirectMessaging, Conversation, DirectMessage } from '@/hooks/useDirectMessaging';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface MessagingHubProps {
  userType: 'artist' | 'engineer' | 'producer';
}

const QUICK_REPLIES = [
  "Thanks for reaching out! 🎵",
  "Let's schedule a session!",
  "I'll review and get back to you soon",
  "Sounds great, I'm interested!",
  "What's your budget/timeline?",
  "Can you share more details?",
];

export const MessagingHub = ({ userType }: MessagingHubProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const recipientParam = searchParams.get('recipient');

  const {
    conversations,
    loading,
    fetchConversationMessages,
    sendMessage,
    markAsRead,
    appendMessage,
    setMessages,
    PAGE_SIZE,
  } = useDirectMessaging();

  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [conversationMessages, setConversationMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [fetchingMessages, setFetchingMessages] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred'>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-select conversation from URL param
  useEffect(() => {
    if (recipientParam && conversations.length > 0 && !selectedConversation) {
      const conv = conversations.find(c => c.other_user?.id === recipientParam);
      if (conv) {
        setSelectedConversation(conv);
      } else {
        // Create a placeholder conversation for new recipient
        fetchRecipientProfile(recipientParam);
      }
    }
  }, [recipientParam, conversations, selectedConversation]);

  const fetchRecipientProfile = async (recipientId: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, role')
      .eq('id', recipientId)
      .single();

    if (profile) {
      const newConv: Conversation = {
        id: `new_${recipientId}`,
        artist_id: user?.id || '',
        engineer_id: recipientId,
        other_user: {
          id: profile.id,
          display_name: profile.full_name || 'Unknown',
          avatar_url: profile.avatar_url,
          user_type: profile.role || undefined,
        },
        last_message_text: undefined,
        last_message_time: undefined,
        unread_count: 0,
      };
      setSelectedConversation(newConv);
    }
  };

  // Load messages when conversation selected
  useEffect(() => {
    if (selectedConversation?.other_user?.id) {
      loadConversationMessages(selectedConversation.other_user.id);
    }
  }, [selectedConversation]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages]);

  // Mark messages as read
  useEffect(() => {
    if (selectedConversation && conversationMessages.length > 0) {
      const unreadMessages = conversationMessages.filter(
        (msg) =>
          msg.recipient_id === user?.id &&
          !msg.read_at &&
          msg.sender_id === selectedConversation.other_user?.id
      );
      if (unreadMessages.length > 0) {
        markAsRead(unreadMessages.map((msg) => msg.id));
      }
    }
  }, [conversationMessages, selectedConversation]);

  // Real-time typing indicator
  useEffect(() => {
    if (!selectedConversation?.other_user?.id || !user) return;

    const channel = supabase.channel(`typing_${selectedConversation.other_user.id}_${user.id}`);

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const typing = new Set<string>();
        Object.values(state).forEach((users: any) => {
          users.forEach((u: any) => {
            if (u.isTyping && u.userId !== user.id) {
              typing.add(u.userId);
            }
          });
        });
        setTypingUsers(typing);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation, user]);

  // Real-time message updates
  useEffect(() => {
    if (!selectedConversation?.other_user?.id || !user) return;

    const channel = supabase
      .channel(`messages_hub_${selectedConversation.other_user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
        },
        (payload) => {
          const message = payload.new as any;
          if (
            (message.sender_id === user.id && message.recipient_id === selectedConversation.other_user?.id) ||
            (message.sender_id === selectedConversation.other_user?.id && message.recipient_id === user.id)
          ) {
            loadConversationMessages(selectedConversation.other_user.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation, user]);

  const loadConversationMessages = async (recipientId: string) => {
    setFetchingMessages(true);
    const messages = await fetchConversationMessages(recipientId);
    setConversationMessages(messages);
    setFetchingMessages(false);
  };

  const handleSendMessage = async (text?: string) => {
    if (!selectedConversation?.other_user?.id) return;
    const msgText = text || messageText;
    if (!msgText.trim()) return;

    setSendingMessage(true);
    const success = await sendMessage({
      recipientId: selectedConversation.other_user.id,
      messageText: msgText,
    });

    if (success) {
      setMessageText('');
      setShowQuickReplies(false);
      await loadConversationMessages(selectedConversation.other_user.id);
    }
    setSendingMessage(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery && filter === 'all') return true;

    const matchesSearch = !searchQuery ||
      (conv.other_user?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilter = filter === 'all' ||
      (filter === 'unread' && conv.unread_count > 0);

    return matchesSearch && matchesFilter;
  });

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0);

  const getInitials = (name?: string) => {
    return name?.split(' ').map((n) => n[0]).join('').toUpperCase() || '?';
  };

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-primary" />
            Messages
            {totalUnread > 0 && (
              <Badge variant="destructive" className="ml-2">{totalUnread}</Badge>
            )}
          </h2>
          <p className="text-muted-foreground">
            Connect with {userType === 'artist' ? 'engineers' : userType === 'engineer' ? 'artists' : 'artists & engineers'}
          </p>
        </div>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Conversations Sidebar */}
        <Card className="w-80 flex flex-col">
          <CardHeader className="py-3 px-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-1 mt-2">
              {(['all', 'unread'] as const).map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter(f)}
                  className="text-xs capitalize"
                >
                  {f}
                  {f === 'unread' && totalUnread > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">{totalUnread}</Badge>
                  )}
                </Button>
              ))}
            </div>
          </CardHeader>

          <ScrollArea className="flex-1">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">Loading...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No conversations yet</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredConversations.map((conv) => (
                  <motion.button
                    key={conv.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setSelectedConversation(conv)}
                    className={cn(
                      'w-full text-left p-3 rounded-lg transition-all',
                      selectedConversation?.id === conv.id
                        ? 'bg-primary/10 border border-primary/30'
                        : 'hover:bg-muted/50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={conv.other_user?.avatar_url} />
                          <AvatarFallback className="bg-primary/20 text-primary">
                            {getInitials(conv.other_user?.display_name)}
                          </AvatarFallback>
                        </Avatar>
                        {conv.unread_count > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-medium truncate">
                            {conv.other_user?.display_name || 'Unknown'}
                          </h3>
                          <span className="text-xs text-muted-foreground">
                            {conv.last_message_time
                              ? formatDistanceToNow(new Date(conv.last_message_time), { addSuffix: false })
                              : ''}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {conv.last_message_text || 'No messages yet'}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </ScrollArea>
        </Card>

        {/* Messages View */}
        <Card className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Conversation Header */}
              <CardHeader className="py-3 px-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={selectedConversation.other_user?.avatar_url} />
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {getInitials(selectedConversation.other_user?.display_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">
                        {selectedConversation.other_user?.display_name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {selectedConversation.other_user?.user_type === 'artist' ? 'Artist' : 'Engineer'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs gap-1.5 bg-primary/10 border-primary/30 hover:bg-primary/20 text-primary"
                      onClick={() => navigate(`/create-session?with=${selectedConversation.other_user?.id}`)}
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      Start Session
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Messages Container */}
              <ScrollArea className="flex-1 p-4">
                {fetchingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Loading messages...</p>
                  </div>
                ) : conversationMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                      <p className="text-muted-foreground">Start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {conversationMessages.map((msg, idx) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn(
                            'flex gap-2',
                            msg.sender_id === user?.id ? 'justify-end' : ''
                          )}
                        >
                          {msg.sender_id !== user?.id && (
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={msg.sender?.avatar_url} />
                              <AvatarFallback className="text-xs">
                                {getInitials(msg.sender?.display_name)}
                              </AvatarFallback>
                            </Avatar>
                          )}

                          <div className={cn('max-w-[70%]', msg.sender_id === user?.id ? 'order-1' : '')}>
                            <div
                              className={cn(
                                'rounded-2xl px-4 py-2',
                                msg.sender_id === user?.id
                                  ? 'bg-primary text-primary-foreground rounded-br-md'
                                  : 'bg-muted rounded-bl-md'
                              )}
                            >
                              <p className="text-sm whitespace-pre-wrap break-words">
                                {msg.message_text}
                              </p>
                            </div>
                            <div className={cn(
                              'flex items-center gap-1 mt-1 px-1',
                              msg.sender_id === user?.id ? 'justify-end' : ''
                            )}>
                              <span className="text-[10px] text-muted-foreground">
                                {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                              </span>
                              {msg.sender_id === user?.id && (
                                msg.read_at ? (
                                  <CheckCheck className="w-3 h-3 text-primary" />
                                ) : (
                                  <Check className="w-3 h-3 text-muted-foreground" />
                                )
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                  </div>
                )}

                {/* Typing Indicator */}
                {typingUsers.size > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-muted-foreground text-sm mt-2"
                  >
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span>typing...</span>
                  </motion.div>
                )}
              </ScrollArea>

              {/* Quick Replies */}
              <AnimatePresence>
                {showQuickReplies && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-4 py-2 border-t bg-muted/30"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground">Quick Replies</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowQuickReplies(false)}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {QUICK_REPLIES.map((reply, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          className="text-xs h-7"
                          onClick={() => handleSendMessage(reply)}
                          disabled={sendingMessage}
                        >
                          {reply}
                        </Button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input Area */}
              <div className="p-4 border-t">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowQuickReplies(!showQuickReplies)}
                    className={cn(showQuickReplies && 'bg-primary/10 text-primary')}
                  >
                    <Zap className="w-4 h-4" />
                  </Button>
                  <Input
                    ref={inputRef}
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={sendingMessage}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => handleSendMessage()}
                    disabled={sendingMessage || !messageText.trim()}
                    size="icon"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 mx-auto text-muted-foreground/20 mb-4" />
                <h3 className="font-semibold mb-1">Select a conversation</h3>
                <p className="text-sm text-muted-foreground">
                  Choose a conversation to start messaging
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
