import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
    Search,
    Send,
    Paperclip,
    X,
    Clock,
    User,
    MessageCircle,
    FileText,
    Download,
} from 'lucide-react';
import { useDirectMessaging, Conversation } from '@/hooks/useDirectMessaging';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface DirectMessagingProps {
    userType: 'artist' | 'engineer';
    preselectedUserId?: string;
}

export const DirectMessaging: React.FC<DirectMessagingProps> = ({
    userType,
    preselectedUserId,
}) => {
    const { user } = useAuth();
    const {
        conversations,
        loading,
        fetchConversationMessages,
        sendMessage,
        markAsRead,
    } = useDirectMessaging();

    const [selectedConversation, setSelectedConversation] =
        useState<Conversation | null>(null);
    const [conversationMessages, setConversationMessages] = useState<any[]>([]);
    const [messageText, setMessageText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [attachedFile, setAttachedFile] = useState<
        { name: string; url: string } | null
    >(null);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [fetchingMessages, setFetchingMessages] = useState(false);

    // Load messages when conversation is selected
    useEffect(() => {
        if (selectedConversation && selectedConversation.other_user?.id) {
            loadConversationMessages(selectedConversation.other_user.id);
        }
    }, [selectedConversation]);

    // Mark messages as read when viewing conversation
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

    // Real-time message updates for current conversation
    useEffect(() => {
        if (!selectedConversation?.other_user?.id || !user) return;

        const channel = supabase
            .channel(`messages_${selectedConversation.other_user.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'direct_messages',
                },
                (payload) => {
                    const message = payload.new as any;
                    
                    // Only refresh if message involves this conversation
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

        // Scroll to bottom
        setTimeout(() => {
            const messagesContainer = document.getElementById('messages-container');
            if (messagesContainer) {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        }, 100);
    };

    const handleSendMessage = async () => {
        if (!selectedConversation?.other_user?.id) return;

        if (!messageText.trim() && !attachedFile) return;

        setSendingMessage(true);

        const success = await sendMessage({
            recipientId: selectedConversation.other_user.id,
            messageText,
            fileUrl: attachedFile?.url,
            fileName: attachedFile?.name,
        });

        if (success) {
            setMessageText('');
            setAttachedFile(null);
            await loadConversationMessages(selectedConversation.other_user.id);
        }

        setSendingMessage(false);
    };

    const filteredConversations = conversations.filter((conv) => {
        if (!searchQuery) return true;
        const name = conv.other_user?.display_name || '';
        return name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const getInitials = (name?: string) => {
        return name
            ?.split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase() || '?';
    };

    return (
        <div className="h-screen flex flex-col gap-4 p-6">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold">Direct Messages</h2>
                <p className="text-slate-400 mt-1">
                    Connect and collaborate with{' '}
                    {userType === 'artist' ? 'engineers' : 'artists'}
                </p>
            </div>

            <div className="flex gap-4 flex-1 min-h-0">
                {/* Conversations List */}
                <Card className="bg-slate-800 border-slate-700 w-80 flex flex-col">
                    {/* Search */}
                    <div className="p-4 border-b border-slate-700">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                            <Input
                                placeholder="Search conversations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-slate-900 border-slate-600"
                            />
                        </div>
                    </div>

                    {/* Conversations */}
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="p-4 text-center text-slate-400">
                                Loading conversations...
                            </div>
                        ) : filteredConversations.length === 0 ? (
                            <div className="p-4 text-center text-slate-400">
                                No conversations yet. Start by finding a{' '}
                                {userType === 'artist' ? 'engineer' : 'artist'}!
                            </div>
                        ) : (
                            <div className="space-y-1 p-2">
                                {filteredConversations.map((conv) => (
                                    <button
                                        key={conv.id}
                                        onClick={() => setSelectedConversation(conv)}
                                        className={`w-full text-left p-3 rounded-lg transition ${selectedConversation?.id === conv.id
                                                ? 'bg-blue-900 border-blue-600 border'
                                                : 'hover:bg-slate-700'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-10 h-10">
                                                <AvatarImage
                                                    src={conv.other_user?.avatar_url}
                                                    alt={conv.other_user?.display_name}
                                                />
                                                <AvatarFallback>
                                                    {getInitials(conv.other_user?.display_name)}
                                                </AvatarFallback>
                                            </Avatar>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <h3 className="font-semibold text-white truncate">
                                                        {conv.other_user?.display_name || 'Unknown'}
                                                    </h3>
                                                    {conv.unread_count > 0 && (
                                                        <Badge className="bg-red-600">{conv.unread_count}</Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-400 truncate">
                                                    {conv.last_message_text || 'No messages yet'}
                                                </p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {conv.last_message_time
                                                        ? formatDistanceToNow(
                                                            new Date(conv.last_message_time),
                                                            { addSuffix: true }
                                                        )
                                                        : 'Never'}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </Card>

                {/* Messages View */}
                <div className="flex-1 flex flex-col">
                    {selectedConversation ? (
                        <>
                            {/* Conversation Header */}
                            <Card className="bg-slate-800 border-slate-700 p-4 mb-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="w-12 h-12">
                                            <AvatarImage
                                                src={selectedConversation.other_user?.avatar_url}
                                                alt={selectedConversation.other_user?.display_name}
                                            />
                                            <AvatarFallback>
                                                {getInitials(selectedConversation.other_user?.display_name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="font-semibold text-white">
                                                {selectedConversation.other_user?.display_name}
                                            </h3>
                                            <p className="text-xs text-slate-400">
                                                {selectedConversation.other_user?.user_type === 'artist'
                                                    ? 'Artist'
                                                    : 'Engineer'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Messages Container */}
                            <Card
                                id="messages-container"
                                className="bg-slate-800 border-slate-700 flex-1 p-4 overflow-y-auto mb-4"
                            >
                                {fetchingMessages ? (
                                    <div className="flex items-center justify-center h-full">
                                        <p className="text-slate-400">Loading messages...</p>
                                    </div>
                                ) : conversationMessages.length === 0 ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-center">
                                            <MessageCircle className="w-12 h-12 mx-auto text-slate-600 mb-2" />
                                            <p className="text-slate-400">
                                                No messages yet. Start the conversation!
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {conversationMessages.map((msg) => (
                                            <div
                                                key={msg.id}
                                                className={`flex gap-3 ${msg.sender_id === user?.id ? 'justify-end' : ''
                                                    }`}
                                            >
                                                {msg.sender_id !== user?.id && (
                                                    <Avatar className="w-8 h-8">
                                                        <AvatarImage
                                                            src={msg.sender?.avatar_url}
                                                            alt={msg.sender?.display_name}
                                                        />
                                                        <AvatarFallback>
                                                            {getInitials(msg.sender?.display_name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                )}

                                                <div
                                                    className={`max-w-xs ${msg.sender_id === user?.id ? 'order-2' : ''
                                                        }`}
                                                >
                                                    <div
                                                        className={`rounded-lg p-3 ${msg.sender_id === user?.id
                                                                ? 'bg-blue-600'
                                                                : 'bg-slate-700'
                                                            }`}
                                                    >
                                                        {msg.message_text && (
                                                            <p className="text-white text-sm break-words">
                                                                {msg.message_text}
                                                            </p>
                                                        )}

                                                        {msg.file_url && (
                                                            <div className="mt-2 p-2 bg-slate-900 rounded flex items-center gap-2">
                                                                <FileText className="w-4 h-4 text-slate-400" />
                                                                <a
                                                                    href={msg.file_url}
                                                                    download={msg.file_name}
                                                                    className="text-blue-400 hover:text-blue-300 text-xs flex-1 truncate"
                                                                >
                                                                    {msg.file_name || 'Download file'}
                                                                </a>
                                                                <Download className="w-4 h-4 text-slate-400" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-2 mt-1 px-1">
                                                        <p className="text-xs text-slate-500">
                                                            {formatDistanceToNow(new Date(msg.created_at), {
                                                                addSuffix: true,
                                                            })}
                                                        </p>
                                                        {msg.sender_id === user?.id && msg.read_at && (
                                                            <span className="text-xs text-green-400">✓✓</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card>

                            {/* Message Input */}
                            <Card className="bg-slate-800 border-slate-700 p-4">
                                {attachedFile && (
                                    <div className="mb-3 p-3 bg-slate-900 rounded flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-slate-400" />
                                            <span className="text-sm text-slate-300">
                                                {attachedFile.name}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => setAttachedFile(null)}
                                            className="text-slate-400 hover:text-red-400"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="text-slate-400"
                                    >
                                        <Paperclip className="w-4 h-4" />
                                    </Button>

                                    <Input
                                        placeholder="Type your message..."
                                        value={messageText}
                                        onChange={(e) => setMessageText(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                        className="bg-slate-900 border-slate-600"
                                    />

                                    <Button
                                        onClick={handleSendMessage}
                                        disabled={
                                            sendingMessage ||
                                            (!messageText.trim() && !attachedFile)
                                        }
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </div>
                            </Card>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <Card className="bg-slate-800 border-slate-700 p-8 text-center">
                                <MessageCircle className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                                <h3 className="text-xl font-semibold text-white mb-2">
                                    Select a Conversation
                                </h3>
                                <p className="text-slate-400">
                                    Choose someone to start messaging or create a new conversation
                                </p>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DirectMessaging;
