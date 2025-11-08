import { useEffect, useState } from 'react';
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

export const useDirectMessaging = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<DirectMessage[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch all conversations for current user
    const fetchConversations = async () => {
        if (!user) return;

        try {
            setLoading(true);

            // Get all messages where user is sender or recipient
            const { data: userMessages, error: messagesError } = await supabase
                .from('direct_messages')
                .select(
                    `
          *,
          sender:sender_id(id, display_name, avatar_url),
          recipient:recipient_id(id, display_name, avatar_url)
          `
                )
                .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
                .order('created_at', { ascending: false })
                .limit(1000);

            if (messagesError) throw messagesError;

            // Build conversation map
            const conversationMap = new Map<string, Conversation>();

            userMessages?.forEach((msg) => {
                const otherUserId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
                const otherUser =
                    msg.sender_id === user.id ? msg.recipient : msg.sender;
                const key = [user.id, otherUserId].sort().join('-');

                if (!conversationMap.has(key)) {
                    conversationMap.set(key, {
                        id: key,
                        artist_id: msg.artist_id || user.id,
                        engineer_id: msg.engineer_id || otherUserId,
                        last_message_text: msg.message_text,
                        last_message_time: msg.created_at,
                        unread_count: msg.read_at && msg.recipient_id === user.id ? 0 : 1,
                        other_user: {
                            id: otherUser?.id,
                            display_name: otherUser?.display_name,
                            avatar_url: otherUser?.avatar_url,
                        },
                    });
                }
            });

            setConversations(Array.from(conversationMap.values()));
            setError(null);
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Failed to fetch conversations';
            setError(errorMessage);
            console.error('Error fetching conversations:', err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch messages for a specific conversation
    const fetchConversationMessages = async (
        recipientId: string
    ): Promise<DirectMessage[]> => {
        if (!user) return [];

        try {
            const { data, error: err } = await supabase
                .from('direct_messages')
                .select(
                    `
          *,
          sender:sender_id(id, display_name, avatar_url),
          recipient:recipient_id(id, display_name, avatar_url)
          `
                )
                .or(
                    `and(sender_id.eq.${user.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${user.id})`
                )
                .order('created_at', { ascending: true });

            if (err) throw err;

            return data || [];
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Failed to fetch messages';
            setError(errorMessage);
            console.error('Error fetching messages:', err);
            return [];
        }
    };

    // Send a message
    const sendMessage = async ({
        recipientId,
        messageText,
        fileUrl,
        fileName,
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
            const { data, error: err } = await supabase
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

            // Refresh conversations
            await fetchConversations();

            return true;
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Failed to send message';
            toast.error(errorMessage);
            console.error('Error sending message:', err);
            return false;
        }
    };

    // Mark messages as read
    const markAsRead = async (messageIds: string[]): Promise<boolean> => {
        if (!user || messageIds.length === 0) return false;

        try {
            const { error: err } = await supabase
                .from('direct_messages')
                .update({ read_at: new Date().toISOString() })
                .in('id', messageIds)
                .eq('recipient_id', user.id);

            if (err) throw err;

            await fetchConversations();
            return true;
        } catch (err) {
            console.error('Error marking messages as read:', err);
            return false;
        }
    };

    // Subscribe to real-time message updates
    useEffect(() => {
        if (!user) return;

        fetchConversations();

        // Subscribe to new messages
        const subscription = supabase
            .channel('direct_messages')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'direct_messages',
                    filter: `or(sender_id.eq.${user.id},recipient_id.eq.${user.id})`,
                },
                (payload) => {
                    // Refresh conversations on new message
                    fetchConversations();
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [user]);

    return {
        messages,
        conversations,
        loading,
        error,
        fetchConversations,
        fetchConversationMessages,
        sendMessage,
        markAsRead,
    };
};
