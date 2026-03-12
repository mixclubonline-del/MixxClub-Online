import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SmilePlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

const EMOJI_OPTIONS = ['🔥', '❤️', '👏', '😂', '🎵', '💯'];

const fromAny = (table: string) => (supabase.from as any)(table);

interface MessageReactionsProps {
  messageId: string;
  compact?: boolean;
}

interface Reaction {
  id: string;
  emoji: string;
  user_id: string;
}

export const MessageReactions: React.FC<MessageReactionsProps> = ({ messageId, compact = false }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: reactions = [] } = useQuery({
    queryKey: ['message-reactions', messageId],
    queryFn: async () => {
      const { data, error } = await fromAny('message_reactions')
        .select('id, emoji, user_id')
        .eq('message_id', messageId);
      if (error) throw error;
      return (data || []) as Reaction[];
    },
    staleTime: 30_000,
  });

  const toggleReaction = useMutation({
    mutationFn: async (emoji: string) => {
      if (!user) throw new Error('Not authenticated');
      const existing = reactions.find((r) => r.emoji === emoji && r.user_id === user.id);
      if (existing) {
        await fromAny('message_reactions').delete().eq('id', existing.id);
      } else {
        await fromAny('message_reactions').insert({
          message_id: messageId,
          user_id: user.id,
          emoji,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-reactions', messageId] });
    },
  });

  // Group reactions by emoji
  const grouped = reactions.reduce<Record<string, { count: number; hasOwn: boolean }>>((acc, r) => {
    if (!acc[r.emoji]) acc[r.emoji] = { count: 0, hasOwn: false };
    acc[r.emoji].count++;
    if (r.user_id === user?.id) acc[r.emoji].hasOwn = true;
    return acc;
  }, {});

  return (
    <div className="flex items-center gap-1 mt-1 flex-wrap">
      {Object.entries(grouped).map(([emoji, { count, hasOwn }]) => (
        <button
          key={emoji}
          onClick={() => toggleReaction.mutate(emoji)}
          className={cn(
            'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs transition-colors',
            'border hover:bg-accent/50',
            hasOwn ? 'border-primary/40 bg-primary/10' : 'border-border/50 bg-muted/30'
          )}
        >
          <span>{emoji}</span>
          <span className="text-muted-foreground">{count}</span>
        </button>
      ))}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
            <SmilePlus className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-1.5" align="start">
          <div className="flex gap-1">
            {EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => { toggleReaction.mutate(emoji); setOpen(false); }}
                className="text-lg hover:scale-125 transition-transform p-1 rounded hover:bg-accent/50"
              >
                {emoji}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
