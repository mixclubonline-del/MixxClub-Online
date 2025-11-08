import React, { useState, useEffect } from 'react';
import { MessageCircle, TrendingUp, Zap, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { partnershipStore } from '@/stores/partnershipStore';
import { MessageRevenueLink } from '@/types/partnership';

interface MessageRevenueIndicatorProps {
    messageId: string;
    partnershipId?: string;
    conversationId?: string;
    isLoading?: boolean;
}

/**
 * MessageRevenueIndicator Component
 * 
 * Displays revenue generated from individual messages and conversations:
 * - Shows revenue linked to specific messages
 * - Indicates which conversations are revenue-generating
 * - Real-time badge updates
 * - Visual revenue metrics
 */
export const MessageRevenueIndicator: React.FC<MessageRevenueIndicatorProps> = ({
    messageId,
    partnershipId,
    conversationId,
    isLoading = false,
}) => {
    const [revenueLink, setRevenueLink] = useState<MessageRevenueLink | null>(null);
    const [revenueAmount, setRevenueAmount] = useState<number | null>(null);

    useEffect(() => {
        // In a real implementation, this would fetch from the messageRevenueLInks table
        // For now, we simulate checking if this message generated revenue
        if (messageId && partnershipId) {
            const revenueSplits = partnershipStore.getState().revenue_splits || [];
            const linkedRevenue = revenueSplits.find(
                (split) =>
                    split.partnership_id === partnershipId &&
                    // In real impl, would check message_revenue_links junction table
                    split.created_at === messageId
            );

            if (linkedRevenue) {
                setRevenueAmount(linkedRevenue.total_amount);
            }
        }
    }, [messageId, partnershipId]);

    if (!revenueAmount && !isLoading) {
        return null;
    }

    return (
        <div className="flex items-center gap-1">
            {isLoading ? (
                <div className="h-5 w-12 bg-gray-200 rounded animate-pulse" />
            ) : revenueAmount ? (
                <Badge variant="secondary" className="gap-1 bg-green-100 text-green-800 border-green-300">
                    <Zap className="w-3 h-3" />
                    +${revenueAmount.toFixed(2)}
                </Badge>
            ) : null}
        </div>
    );
};

interface ConversationRevenueHeaderProps {
    conversationId: string;
    partnershipId?: string;
    recipientName?: string;
    onViewRevenue?: () => void;
    isLoading?: boolean;
}

/**
 * ConversationRevenueHeader Component
 * 
 * Shows aggregate revenue for an entire conversation:
 * - Total revenue generated in conversation
 * - Revenue status indicators
 * - Quick links to revenue details
 * - Project associations
 */
export const ConversationRevenueHeader: React.FC<ConversationRevenueHeaderProps> = ({
    conversationId,
    partnershipId,
    recipientName = 'Partner',
    onViewRevenue,
    isLoading = false,
}) => {
    const [totalRevenue, setTotalRevenue] = useState<number>(0);
    const [messageCount, setMessageCount] = useState<number>(0);
    const [projectCount, setProjectCount] = useState<number>(0);

    useEffect(() => {
        if (partnershipId) {
            // Fetch conversation revenue metrics
            const partnership = partnershipStore.getState().selected_partnership;
            if (partnership) {
                // In real impl, would sum revenue_splits where message_revenue_links.conversation_id = conversationId
                setTotalRevenue(partnership.total_earnings || 0);
                setMessageCount(partnership.total_earnings > 0 ? 5 : 0); // Simulated
                setProjectCount(1); // Simulated
            }
        }
    }, [conversationId, partnershipId]);

    if (!totalRevenue && !isLoading) {
        return null;
    }

    return (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
            <TrendingUp className="w-5 h-5 text-amber-600 flex-shrink-0" />

            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">
                    ${totalRevenue.toFixed(2)} generated with {recipientName}
                </p>
                <p className="text-xs text-gray-600">
                    {messageCount} revenue-linked messages · {projectCount} project{projectCount !== 1 ? 's' : ''}
                </p>
            </div>

            <button
                onClick={onViewRevenue}
                disabled={isLoading}
                className="flex-shrink-0 px-3 py-1 text-xs font-medium text-amber-700 bg-white border border-amber-300 rounded-md hover:bg-amber-50 disabled:opacity-50"
            >
                View Details
            </button>
        </div>
    );
};

interface DirectMessagingEnhancementProps {
    messages: Array<{
        id: string;
        content: string;
        created_at: string;
        related_revenue?: number;
        related_project?: string;
    }>;
    conversationId: string;
    partnershipId?: string;
    recipientName?: string;
    onRevenueClick?: () => void;
}

/**
 * DirectMessagingEnhancement Component
 * 
 * Integrates into DirectMessaging to show revenue context:
 * - Revenue badges on messages
 * - Conversation revenue summary
 * - Project associations
 * - Revenue-generating opportunities
 */
export const DirectMessagingEnhancement: React.FC<DirectMessagingEnhancementProps> = ({
    messages = [],
    conversationId,
    partnershipId,
    recipientName,
    onRevenueClick,
}) => {
    const [conversationRevenue, setConversationRevenue] = useState<number>(0);

    useEffect(() => {
        if (partnershipId && messages.length > 0) {
            // Calculate total revenue from messages in this conversation
            // In real impl, would query message_revenue_links table
            const revenue = messages.filter((msg) => msg.related_revenue).length * 150; // Simulated
            setConversationRevenue(revenue);
        }
    }, [messages, partnershipId]);

    return (
        <div className="space-y-4">
            {/* Conversation Revenue Header */}
            {conversationRevenue > 0 && (
                <ConversationRevenueHeader
                    conversationId={conversationId}
                    partnershipId={partnershipId}
                    recipientName={recipientName}
                    onViewRevenue={onRevenueClick}
                />
            )}

            {/* Enhanced Message List */}
            <div className="space-y-2">
                {messages.map((message) => (
                    <div key={message.id} className="space-y-1">
                        {/* Message Content */}
                        <div className="flex items-end gap-2">
                            <div className="flex-1 p-3 rounded-lg bg-gray-100">
                                <p className="text-sm text-gray-900">{message.content}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {new Date(message.created_at).toLocaleString()}
                                </p>
                            </div>

                            {/* Revenue Indicator Badge */}
                            {message.related_revenue && (
                                <div className="flex-shrink-0">
                                    <Badge
                                        variant="secondary"
                                        className="gap-1 bg-green-100 text-green-800 border-green-300"
                                    >
                                        <CheckCircle2 className="w-3 h-3" />
                                        Revenue
                                    </Badge>
                                </div>
                            )}
                        </div>

                        {/* Revenue Details if applicable */}
                        {message.related_revenue && message.related_project && (
                            <div className="ml-0 text-xs text-green-700 flex items-center gap-1 p-2 rounded bg-green-50">
                                <Zap className="w-3 h-3" />
                                <span>
                                    Generated ${message.related_revenue.toFixed(2)} for project:{' '}
                                    <strong>{message.related_project}</strong>
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {messages.length === 0 && (
                <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">No messages yet. Start a conversation!</p>
                </div>
            )}
        </div>
    );
};

export default {
    MessageRevenueIndicator,
    ConversationRevenueHeader,
    DirectMessagingEnhancement,
};
