import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface LiveStream {
  id: string;
  host_id: string;
  title: string;
  description?: string;
  stream_type: 'broadcast' | 'session' | 'battle' | 'premiere' | 'collab';
  category: string;
  thumbnail_url?: string;
  is_live: boolean;
  started_at?: string;
  ended_at?: string;
  viewer_count: number;
  peak_viewers: number;
  total_gifts_value: number;
  recording_url?: string;
  is_recorded: boolean;
  visibility: 'public' | 'followers' | 'subscribers' | 'private';
  co_hosts: string[];
  stream_key: string;
  playback_url?: string;
  created_at: string;
  host?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface LiveGift {
  id: string;
  name: string;
  emoji: string;
  animation_type: 'float' | 'burst' | 'rain' | 'special';
  coin_cost: number;
  creator_value: number;
  sort_order: number;
}

export interface StreamGift {
  id: string;
  stream_id: string;
  sender_id: string;
  gift_id: string;
  quantity: number;
  message?: string;
  created_at: string;
  gift?: LiveGift;
  sender?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface ChatMessage {
  id: string;
  stream_id: string;
  user_id: string;
  message: string;
  message_type: 'chat' | 'system' | 'gift' | 'reaction' | 'pinned';
  is_highlighted: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  user?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
  };
}

// Fetch live streams
export const useLiveStreams = (options?: { category?: string; hostId?: string; isLive?: boolean }) => {
  return useQuery({
    queryKey: ['live-streams', options],
    queryFn: async () => {
      let query = supabase
        .from('live_streams')
        .select(`
          *,
          host:profiles!live_streams_host_id_fkey(id, full_name, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (options?.category) {
        query = query.eq('category', options.category);
      }
      if (options?.hostId) {
        query = query.eq('host_id', options.hostId);
      }
      if (options?.isLive !== undefined) {
        query = query.eq('is_live', options.isLive);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as LiveStream[];
    },
  });
};

// Fetch single stream
export const useStream = (streamId: string | undefined) => {
  return useQuery({
    queryKey: ['live-stream', streamId],
    queryFn: async () => {
      if (!streamId) return null;
      const { data, error } = await supabase
        .from('live_streams')
        .select(`
          *,
          host:profiles!live_streams_host_id_fkey(id, full_name, avatar_url)
        `)
        .eq('id', streamId)
        .single();
      if (error) throw error;
      return data as LiveStream;
    },
    enabled: !!streamId,
  });
};

// Stream management hook
export const useLiveStreamManager = () => {
  const queryClient = useQueryClient();

  const createStream = useMutation({
    mutationFn: async (stream: {
      title: string;
      description?: string;
      stream_type?: string;
      category?: string;
      visibility?: string;
      is_recorded?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('live_streams')
        .insert({
          ...stream,
          host_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as LiveStream;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-streams'] });
    },
  });

  const startStream = useMutation({
    mutationFn: async (streamId: string) => {
      const { data, error } = await supabase
        .from('live_streams')
        .update({
          is_live: true,
          started_at: new Date().toISOString(),
        })
        .eq('id', streamId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-streams'] });
      toast.success("You're now live!");
    },
  });

  const endStream = useMutation({
    mutationFn: async (streamId: string) => {
      const { data, error } = await supabase
        .from('live_streams')
        .update({
          is_live: false,
          ended_at: new Date().toISOString(),
        })
        .eq('id', streamId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-streams'] });
      toast.success('Stream ended');
    },
  });

  const updateStream = useMutation({
    mutationFn: async ({ streamId, updates }: { streamId: string; updates: Partial<LiveStream> }) => {
      const { data, error } = await supabase
        .from('live_streams')
        .update(updates)
        .eq('id', streamId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-streams'] });
    },
  });

  return {
    createStream,
    startStream,
    endStream,
    updateStream,
  };
};

// Live gifts
export const useLiveGifts = () => {
  return useQuery({
    queryKey: ['live-gifts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('live_gifts')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as LiveGift[];
    },
  });
};

// User coins
export const useUserCoins = () => {
  const queryClient = useQueryClient();

  const { data: coins, isLoading } = useQuery({
    queryKey: ['user-coins'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_coins')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      // Create record if doesn't exist
      if (!data) {
        const { data: newData, error: insertError } = await supabase
          .from('user_coins')
          .insert({ user_id: user.id, balance: 0 })
          .select()
          .single();
        if (insertError) throw insertError;
        return newData;
      }
      
      return data;
    },
  });

  const sendGift = useMutation({
    mutationFn: async ({
      streamId,
      giftId,
      quantity = 1,
      message,
    }: {
      streamId: string;
      giftId: string;
      quantity?: number;
      message?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('process_stream_gift', {
        p_stream_id: streamId,
        p_sender_id: user.id,
        p_gift_id: giftId,
        p_quantity: quantity,
        p_message: message || null,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-coins'] });
      toast.success('Gift sent!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send gift');
    },
  });

  return {
    coins,
    isLoading,
    balance: coins?.balance ?? 0,
    sendGift,
  };
};

// Live chat
export const useLiveChat = (streamId: string | undefined) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const queryClient = useQueryClient();

  // Fetch initial messages
  useEffect(() => {
    if (!streamId) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('live_chat_messages')
        .select(`
          *,
          user:profiles!live_chat_messages_user_id_fkey(id, full_name, avatar_url)
        `)
        .eq('stream_id', streamId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (!error && data) {
        setMessages(data as ChatMessage[]);
      }
    };

    fetchMessages();
  }, [streamId]);

  // Subscribe to new messages
  useEffect(() => {
    if (!streamId) return;

    const channel = supabase
      .channel(`chat-${streamId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'live_chat_messages',
          filter: `stream_id=eq.${streamId}`,
        },
        async (payload) => {
          // Fetch user info for new message
          const { data: user } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .eq('id', payload.new.user_id)
            .single();

          setMessages((prev) => [
            ...prev,
            { ...payload.new, user } as ChatMessage,
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [streamId]);

  const sendMessage = useCallback(
    async (message: string, type: 'chat' | 'reaction' = 'chat') => {
      if (!streamId) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to chat');
        return;
      }

      const { error } = await supabase.from('live_chat_messages').insert({
        stream_id: streamId,
        user_id: user.id,
        message,
        message_type: type,
      });

      if (error) {
        toast.error('Failed to send message');
      }
    },
    [streamId]
  );

  return {
    messages,
    sendMessage,
  };
};

// Stream gifts realtime
export const useStreamGifts = (streamId: string | undefined) => {
  const [gifts, setGifts] = useState<StreamGift[]>([]);

  useEffect(() => {
    if (!streamId) return;

    const channel = supabase
      .channel(`gifts-${streamId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'stream_gifts',
          filter: `stream_id=eq.${streamId}`,
        },
        async (payload) => {
          // Fetch gift and sender info
          const [giftRes, senderRes] = await Promise.all([
            supabase.from('live_gifts').select('*').eq('id', payload.new.gift_id).single(),
            supabase.from('profiles').select('id, full_name, avatar_url').eq('id', payload.new.sender_id).single(),
          ]);

          const newGift: StreamGift = {
            id: payload.new.id as string,
            stream_id: payload.new.stream_id as string,
            sender_id: payload.new.sender_id as string,
            gift_id: payload.new.gift_id as string,
            quantity: payload.new.quantity as number,
            message: payload.new.message as string | undefined,
            created_at: payload.new.created_at as string,
            gift: giftRes.data as LiveGift | undefined,
            sender: senderRes.data as { id: string; full_name?: string; avatar_url?: string } | undefined,
          };

          setGifts((prev) => [...prev, newGift]);

          // Auto-remove after animation
          setTimeout(() => {
            setGifts((prev) => prev.filter((g) => g.id !== newGift.id));
          }, 5000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [streamId]);

  return gifts;
};

// Follow creator
export const useStreamFollow = (creatorId: string | undefined) => {
  const queryClient = useQueryClient();

  const { data: isFollowing } = useQuery({
    queryKey: ['stream-follow', creatorId],
    queryFn: async () => {
      if (!creatorId) return false;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data } = await supabase
        .from('stream_followers')
        .select('id')
        .eq('follower_id', user.id)
        .eq('creator_id', creatorId)
        .maybeSingle();

      return !!data;
    },
    enabled: !!creatorId,
  });

  const toggleFollow = useMutation({
    mutationFn: async () => {
      if (!creatorId) throw new Error('No creator');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (isFollowing) {
        const { error } = await supabase
          .from('stream_followers')
          .delete()
          .eq('follower_id', user.id)
          .eq('creator_id', creatorId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('stream_followers')
          .insert({ follower_id: user.id, creator_id: creatorId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stream-follow', creatorId] });
      toast.success(isFollowing ? 'Unfollowed' : 'Following! You\'ll be notified when they go live.');
    },
  });

  return {
    isFollowing: isFollowing ?? false,
    toggleFollow,
  };
};
