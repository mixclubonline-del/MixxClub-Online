import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DirectMessage {
    id: string;
    sender_id: string;
    recipient_id: string;
    message_text: string;
    file_url?: string;
    file_name?: string;
    created_at: string;
    read_at?: string;
    sender?: {
        id: string;
        display_name: string;
        avatar_url?: string;
    };
    recipient?: {
        id: string;
        display_name: string;
        avatar_url?: string;
    };
}

export interface Conversation {
    id: string;
    artist_id: string;
    engineer_id: string;
    last_message_text?: string;
    last_message_time?: string;
    unread_count: number;
    is_artist?: boolean;
    other_user?: {
        id: string;
        display_name: string;
        avatar_url?: string;
        user_type?: string;
    };
}

interface SendMessageParams {
    recipientId: string;
    messageText: string;
    fileUrl?: string;
    fileName?: string;
}

const PAGE_SIZE = 50;

export const useDirectMessaging = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<DirectMessage[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const profileCacheRef = useRef<Map<string, { id: string; display_name: string; avatar_url?: string }>>(new Map());

    const getProfiles = useCallback(async (userIds: string[]) => {
        const cache = profileCacheRef.current;
        const missing = userIds.filter(id => !cache.has(id));
        if (missing.length > 0) {
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url')
                .in('id', missing);
            profiles?.forEach(p => cache.set(p.id, { id: p.id, display_name: p.full_name || 'Unknown', avatar_url: p.avatar_url }));
        }
        return cache;
    }, []);

    // Fetch conversations — lightweight: only recent messages to build list
    const fetchConversations = useCallback(async () => {
        if (!user) return;

        try {
            setLoading(true);

            // Get recent messages to build conversation list (limit 200 instead of 1000)
            const { data: userMessages, error: messagesError } = await supabase
                .from('direct_messages' as any)
                .select('*')
                .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
                .order('created_at', { ascending: false })
                .limit(200);

            if (messagesError) throw messagesError;

            const userIds = new Set<string>();
            userMessages?.forEach((msg: any) => {
                userIds.add(msg.sender_id);
                userIds.add(msg.recipient_id);
            });

            const profileMap = await getProfiles(Array.from(userIds));

            const conversationMap = new Map<string, Conversation>();
            userMessages?.forEach((msg: any) => {
                const otherUserId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
                const otherUser = profileMap.get(otherUserId);
                const key = [user.id, otherUserId].sort().join('-');

                if (!conversationMap.has(key)) {
                    conversationMap.set(key, {
                        id: key,
                        artist_id: msg.artist_id || user.id,
                        engineer_id: msg.engineer_id || otherUserId,
                        last_message_text: msg.message_text,
                        last_message_time: msg.created_at,
                        unread_count: (!msg.read_at && msg.recipient_id === user.id) ? 1 : 0,
                        other_user: otherUser ? {
                            id: otherUser.id,
                            display_name: otherUser.display_name,
                            avatar_url: otherUser.avatar_url,
                        } : { id: otherUserId, display_name: 'Unknown' },
                    });
                }
            });

            setConversations(Array.from(conversationMap.values()));
            setError(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch conversations';
            setError(errorMessage);
            console.error('Error fetching conversations:', err);
        } finally {
            setLoading(false);
        }
    }, [user, getProfiles]);

    // Fetch messages for a specific conversation with pagination
    const fetchConversationMessages = useCallback(async (
        recipientId: string,
        offset: number = 0
    ): Promise<DirectMessage[]> => {
        if (!user) return [];

        try {
            const { data: messagesData, error: messagesError } = await supabase
                .from('direct_messages')
                .select('*')
                .or(
                    `and(sender_id.eq.${user.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${user.id})`
                )
                .order('created_at', { ascending: false })
                .range(offset, offset + PAGE_SIZE - 1);

            if (messagesError) throw messagesError;
            if (!messagesData || messagesData.length === 0) return [];

            const userIds = new Set<string>();
            messagesData.forEach((msg: any) => {
                userIds.add(msg.sender_id);
                userIds.add(msg.recipient_id);
            });

            const profileMap = await getProfiles(Array.from(userIds));

            // Reverse to chronological order for display
            return messagesData.reverse().map((msg: any) => ({
                ...msg,
                sender: profileMap.get(msg.sender_id) || { id: msg.sender_id, display_name: 'Unknown' },
                recipient: profileMap.get(msg.recipient_id) || { id: msg.recipient_id, display_name: 'Unknown' },
            }));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch messages';
            setError(errorMessage);
            console.error('Error fetching messages:', err);
            return [];
        }
    }, [user, getProfiles]);

    // Append a single realtime message to local state
    const appendMessage = useCallback(async (rawMsg: any) => {
        if (!user) return;
        const profileMap = await getProfiles([rawMsg.sender_id, rawMsg.recipient_id]);
        const enriched: DirectMessage = {
            ...rawMsg,
            sender: profileMap.get(rawMsg.sender_id) || { id: rawMsg.sender_id, display_name: 'Unknown' },
            recipient: profileMap.get(rawMsg.recipient_id) || { id: rawMsg.recipient_id, display_name: 'Unknown' },
        };
        setMessages(prev => [...prev, enriched]);
    }, [user, getProfiles]);

    // Send a message
    const sendMessage = useCallback(async ({
        recipientId, messageText, fileUrl, fileName,
    }: SendMessageParams): Promise<boolean> => {
        if (!user) {
            toast.error('You must be logged in to send messages');
            return false;
        }
        if (!messageText.trim() && !fileUrl) {
            toast.error('Message cannot be empty');
            return false;
        }

        try {
            const { error: err } = await supabase
                .from('direct_messages')
                .insert({
                    sender_id: user.id,
                    recipient_id: recipientId,
                    message_text: messageText || '',
                    file_url: fileUrl,
                    file_name: fileName,
                    created_at: new Date().toISOString(),
                })
                .select();

            if (err) throw err;
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
            toast.error(errorMessage);
            console.error('Error sending message:', err);
            return false;
        }
    }, [user]);

    // Mark messages as read
    const markAsRead = useCallback(async (messageIds: string[]): Promise<boolean> => {
        if (!user || messageIds.length === 0) return false;

        try {
            const { error: err } = await supabase
                .from('direct_messages')
                .update({ read_at: new Date().toISOString() })
                .in('id', messageIds)
                .eq('recipient_id', user.id);

            if (err) throw err;
            return true;
        } catch (err) {
            console.error('Error marking messages as read:', err);
            return false;
        }
    }, [user]);

    // Subscribe to real-time updates — append instead of re-fetch
    useEffect(() => {
        if (!user) return;

        fetchConversations();

        const channel = supabase
            .channel('direct_messages_realtime')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'direct_messages',
                },
                (payload) => {
                    const msg = payload.new as any;
                    // Only process messages relevant to this user
                    if (msg.sender_id === user.id || msg.recipient_id === user.id) {
                        // Update conversation list with new last message
                        setConversations(prev => {
                            const otherUserId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
                            const key = [user.id, otherUserId].sort().join('-');
                            const existing = prev.find(c => c.id === key);
                            if (existing) {
                                return prev.map(c => c.id === key ? {
                                    ...c,
                                    last_message_text: msg.message_text,
                                    last_message_time: msg.created_at,
                                    unread_count: msg.recipient_id === user.id ? c.unread_count + 1 : c.unread_count,
                                } : c);
                            }
                            // New conversation — trigger full refresh
                            fetchConversations();
                            return prev;
                        });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, fetchConversations]);

    return {
        messages,
        setMessages,
        conversations,
        loading,
        error,
        fetchConversations,
        fetchConversationMessages,
        appendMessage,
        sendMessage,
        markAsRead,
        PAGE_SIZE,
    };
};
