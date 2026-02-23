/**
 * useAdminChat — Admin AI Chat Interface
 *
 * Manages conversation state and calls the admin-chat-enhanced
 * edge function with proper auth, context injection, and
 * conversation history management.
 */

import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
    isPending?: boolean;
}

interface AdminChatOptions {
    context?: Record<string, unknown>;
}

const QUICK_PROMPTS = [
    { id: 'briefing', label: '📋 Daily Briefing', prompt: 'Give me a comprehensive daily briefing. Cover user growth, active sessions, revenue trends, any security alerts, and top priorities for today.' },
    { id: 'revenue', label: '💰 Revenue Report', prompt: 'Analyze our revenue performance over the last 30 days. Break down by service type, highlight trends, and suggest optimization opportunities.' },
    { id: 'growth', label: '📈 Growth Analysis', prompt: 'Analyze our user growth trajectory. What\'s our signup rate, user retention, and the most active user segments? Where should we focus acquisition efforts?' },
    { id: 'security', label: '🔒 Security Audit', prompt: 'Review the current security posture. Any injection attempts, unauthorized access, rate limit violations, or other security events I should know about?' },
    { id: 'waitlist', label: '🎫 Waitlist Status', prompt: 'Give me a summary of the waitlist. How many total signups, today\'s signups, role distribution, invite code redemption rate, and recommendations for the next batch of invites.' },
    { id: 'engineers', label: '🎧 Engineer Performance', prompt: 'Who are our top-performing engineers? Break down by completed projects, earnings, ratings, and availability. Any engineers that need attention or support?' },
    { id: 'strategy', label: '🚀 Launch Strategy', prompt: 'Based on our current metrics and waitlist data, what\'s your recommended launch strategy? When should we flip from pre-launch to live, and what milestones should we hit first?' },
    { id: 'content', label: '📝 Content Ideas', prompt: 'Suggest content marketing ideas to grow our platform. Consider our target audience of artists, engineers, and producers. What would drive signups and engagement?' },
];

export function useAdminChat(options: AdminChatOptions = {}) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const abortRef = useRef<AbortController | null>(null);

    const sendMessage = useCallback(async (content: string) => {
        if (!user || !content.trim() || isStreaming) return;

        // Add user message
        const userMessage: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'user',
            content: content.trim(),
            timestamp: Date.now(),
        };

        // Add pending assistant message
        const pendingId = crypto.randomUUID();
        const pendingMessage: ChatMessage = {
            id: pendingId,
            role: 'assistant',
            content: '',
            timestamp: Date.now(),
            isPending: true,
        };

        setMessages(prev => [...prev, userMessage, pendingMessage]);
        setIsStreaming(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) throw new Error('No active session');

            // Build conversation history for context (last 20 messages)
            const history = [...messages, userMessage]
                .filter(m => !m.isPending)
                .slice(-20)
                .map(m => ({ role: m.role, content: m.content }));

            const response = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL || 'https://lmkawcieqljuvdqxtkfp.supabase.co'}/functions/v1/admin-chat-enhanced`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${session.access_token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: content.trim(),
                        conversationHistory: history,
                        context: {
                            page: window.location.pathname,
                            isMobile: window.innerWidth < 768,
                            ...options.context,
                        },
                    }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                const errorMsg = errorData?.error || `Request failed (${response.status})`;
                throw new Error(errorMsg);
            }

            const data = await response.json();

            // Replace pending with actual response
            setMessages(prev =>
                prev.map(m =>
                    m.id === pendingId
                        ? { ...m, content: data.response, isPending: false, timestamp: Date.now() }
                        : m
                )
            );
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Connection failed';

            // Replace pending with error
            setMessages(prev =>
                prev.map(m =>
                    m.id === pendingId
                        ? { ...m, content: `⚠️ ${errorMessage}`, isPending: false }
                        : m
                )
            );

            toast.error(errorMessage);
        } finally {
            setIsStreaming(false);
        }
    }, [user, messages, isStreaming, options.context]);

    const clearMessages = useCallback(() => {
        setMessages([]);
    }, []);

    const cancelStream = useCallback(() => {
        abortRef.current?.abort();
        setIsStreaming(false);
    }, []);

    return {
        messages,
        isStreaming,
        sendMessage,
        clearMessages,
        cancelStream,
        quickPrompts: QUICK_PROMPTS,
    };
}
