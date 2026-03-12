import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, X, CornerDownRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { MessageReactions } from './MessageReactions';
import { cn } from '@/lib/utils';

interface ThreadedChatProps {
  parentMessage: {
    id: string;
    message_text: string;
    sender_id: string;
    created_at: string;
    sender?: { full_name?: string; avatar_url?: string };
  };
  onClose: () => void;
}

export const ThreadedChat: React.FC<ThreadedChatProps> = ({ parentMessage, onClose }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [replyText, setReplyText] = useState('');

  const { data: replies = [], isLoading } = useQuery({
    queryKey: ['thread-replies', parentMessage.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('direct_messages')
        .select('*, sender:profiles!direct_messages_sender_id_fkey(full_name, avatar_url)')
        .eq('thread_id', parentMessage.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const sendReply = useMutation({
    mutationFn: async (text: string) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('direct_messages').insert({
        sender_id: user.id,
        recipient_id: parentMessage.sender_id === user.id ? parentMessage.sender_id : parentMessage.sender_id,
        message_text: text,
        thread_id: parentMessage.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setReplyText('');
      queryClient.invalidateQueries({ queryKey: ['thread-replies', parentMessage.id] });
    },
    onError: () => toast.error('Failed to send reply'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyText.trim()) sendReply.mutate(replyText.trim());
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex flex-col h-full"
    >
      <div className="flex items-center justify-between p-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">Thread</span>
          <Badge variant="secondary" className="text-xs">{replies.length} replies</Badge>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-3">
        {/* Parent message */}
        <div className="mb-4 pb-4 border-b border-border/30">
          <div className="flex items-start gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={parentMessage.sender?.avatar_url} />
              <AvatarFallback>{(parentMessage.sender?.full_name || '?')[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium">{parentMessage.sender?.full_name || 'User'}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(parentMessage.created_at), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm">{parentMessage.message_text}</p>
              <MessageReactions messageId={parentMessage.id} />
            </div>
          </div>
        </div>

        {/* Replies */}
        <div className="space-y-3">
          {replies.map((reply: any) => (
            <motion.div
              key={reply.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2"
            >
              <CornerDownRight className="h-3 w-3 text-muted-foreground mt-2 shrink-0" />
              <Avatar className="h-7 w-7">
                <AvatarImage src={reply.sender?.avatar_url} />
                <AvatarFallback>{(reply.sender?.full_name || '?')[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-medium">{reply.sender?.full_name || 'User'}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm">{reply.message_text}</p>
                <MessageReactions messageId={reply.id} />
              </div>
            </motion.div>
          ))}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-3 border-t border-border/50 flex gap-2">
        <Input
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Reply in thread..."
          className="flex-1"
        />
        <Button size="icon" type="submit" disabled={!replyText.trim() || sendReply.isPending}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </motion.div>
  );
};
