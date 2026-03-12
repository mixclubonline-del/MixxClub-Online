/**
 * useAdminChat — Agentic Admin AI Chat with SSE Streaming + Tool Status + Persistent Conversations
 *
 * Manages conversation state, streams responses from admin-chat-enhanced,
 * handles tool execution status events, manages persistent memory,
 * and persists all conversations to the database across sessions.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { uuid } from '@/lib/uuid';

export interface ToolAction {
  tool: string;
  result: string;
  action?: string;
  parsedResult?: Record<string, unknown>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isPending?: boolean;
  isTooling?: boolean;
  toolActions?: ToolAction[];
}

export interface ConversationSummary {
  id: string;
  title: string;
  updated_at: string;
  created_at: string;
}

interface AdminChatOptions {
  context?: Record<string, unknown>;
}

const QUICK_PROMPTS = [
  { id: 'briefing', label: '📋 Daily Briefing', prompt: 'Give me a comprehensive daily briefing. Pull the latest metrics on users, revenue, sessions, and security alerts. What are the top priorities today?' },
  { id: 'revenue', label: '💰 Revenue Report', prompt: 'Query our revenue metrics and give me a detailed 30-day analysis with trends and optimization suggestions.' },
  { id: 'growth', label: '📈 Growth Analysis', prompt: 'Pull user metrics and analyze our growth trajectory. Break down by role, signup rate, and active segments.' },
  { id: 'security', label: '🔒 Security Audit', prompt: 'Query security metrics and give me a full security posture review. Any threats I should know about?' },
  { id: 'waitlist', label: '🎫 Waitlist Status', prompt: 'Pull the latest waitlist numbers and give me a summary with recommendations for the next invite batch.' },
  { id: 'engineers', label: '🎧 Engineer Performance', prompt: 'Query engineer metrics and rank our top performers. Who needs attention or support?' },
  { id: 'dream', label: '🎨 Dream Engine Status', prompt: 'Check the Dream Engine status. What capabilities are active and show me the recent generation history.' },
  { id: 'promo', label: '📢 Campaign Status', prompt: 'Check the promo campaign status. Show me active campaigns and their generated assets.' },
  { id: 'generate-hero', label: '🖼️ Generate Hero Art', prompt: 'Generate a new hero image for Mixxclub. Make it bold, futuristic, with studio vibes — neon accents, mixing console, and the energy of a late-night session.' },
  { id: 'launch-campaign', label: '🚀 Launch Campaign', prompt: 'Launch a character-launch campaign featuring Prime. Use a hip-hop aesthetic.' },
  { id: 'memory', label: '🧠 Recall Memory', prompt: 'Recall all your memories about my preferences and past learnings. What do you remember about me?' },
  { id: 'strategy', label: '🎯 Launch Strategy', prompt: 'Based on real metrics, what\'s your recommended launch strategy? Pull the data first, then advise.' },
];

export function useAdminChat(options: AdminChatOptions = {}) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeTools, setActiveTools] = useState<string[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [conversationTitle, setConversationTitle] = useState('New Conversation');
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const abortRef = useRef<AbortController | null>(null);
  const initRef = useRef(false);

  // ── Load conversation list ──
  const fetchConversations = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('admin_conversations')
      .select('id, title, updated_at, created_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(20);
    if (data) setConversations(data);
  }, [user]);

  // ── Load messages for a conversation ──
  const loadConversation = useCallback(async (convId: string) => {
    const { data } = await supabase
      .from('admin_chat_messages')
      .select('id, role, content, tool_actions, created_at')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });

    if (data) {
      const loaded: ChatMessage[] = data.map(m => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        timestamp: new Date(m.created_at).getTime(),
        toolActions: m.tool_actions as ToolAction[] | undefined,
      }));
      setMessages(loaded);
    }

    // Get title
    const conv = conversations.find(c => c.id === convId);
    setConversationTitle(conv?.title || 'New Conversation');
    setConversationId(convId);
  }, [conversations]);

  // ── Create new conversation ──
  const newConversation = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('admin_conversations')
      .insert({ user_id: user.id, title: 'New Conversation' })
      .select('id, title, updated_at, created_at')
      .single();
    if (data) {
      setConversationId(data.id);
      setConversationTitle('New Conversation');
      setMessages([]);
      setConversations(prev => [data, ...prev]);
    }
  }, [user]);

  // ── Persist a message to DB ──
  const persistMessage = useCallback(async (
    convId: string,
    role: 'user' | 'assistant',
    content: string,
    toolActions?: ToolAction[]
  ) => {
    await supabase.from('admin_chat_messages').insert({
      conversation_id: convId,
      role,
      content,
      tool_actions: toolActions && toolActions.length > 0 ? toolActions as unknown as Record<string, unknown>[] : null,
    });
  }, []);

  // ── Auto-generate title from first user message ──
  const maybeSetTitle = useCallback(async (convId: string, firstMessage: string) => {
    const title = firstMessage.slice(0, 60) + (firstMessage.length > 60 ? '...' : '');
    await supabase
      .from('admin_conversations')
      .update({ title })
      .eq('id', convId);
    setConversationTitle(title);
    setConversations(prev =>
      prev.map(c => c.id === convId ? { ...c, title } : c)
    );
  }, []);

  // ── Init: load most recent conversation or create one ──
  useEffect(() => {
    if (!user || initRef.current) return;
    initRef.current = true;

    const init = async () => {
      setIsLoadingConversations(true);
      const { data } = await supabase
        .from('admin_conversations')
        .select('id, title, updated_at, created_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(20);

      if (data && data.length > 0) {
        setConversations(data);
        // Load the most recent conversation
        const latest = data[0];
        setConversationId(latest.id);
        setConversationTitle(latest.title);

        const { data: msgs } = await supabase
          .from('admin_chat_messages')
          .select('id, role, content, tool_actions, created_at')
          .eq('conversation_id', latest.id)
          .order('created_at', { ascending: true });

        if (msgs) {
          setMessages(msgs.map(m => ({
            id: m.id,
            role: m.role as 'user' | 'assistant',
            content: m.content,
            timestamp: new Date(m.created_at).getTime(),
            toolActions: m.tool_actions as ToolAction[] | undefined,
          })));
        }
      } else {
        // Create first conversation
        const { data: newConv } = await supabase
          .from('admin_conversations')
          .insert({ user_id: user.id, title: 'New Conversation' })
          .select('id, title, updated_at, created_at')
          .single();
        if (newConv) {
          setConversationId(newConv.id);
          setConversationTitle('New Conversation');
          setConversations([newConv]);
        }
      }
      setIsLoadingConversations(false);
    };
    init();
  }, [user]);

  const sendMessage = useCallback(async (content: string) => {
    if (!user || !content.trim() || isStreaming || !conversationId) return;

    const userMessage: ChatMessage = {
      id: uuid(),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    };

    const pendingId = uuid();
    const pendingMessage: ChatMessage = {
      id: pendingId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isPending: true,
      toolActions: [],
    };

    setMessages(prev => [...prev, userMessage, pendingMessage]);
    setIsStreaming(true);
    setActiveTools([]);

    // Persist user message
    persistMessage(conversationId, 'user', content.trim());

    // Auto-title on first message
    const isFirstMessage = messages.filter(m => m.role === 'user').length === 0;
    if (isFirstMessage) {
      maybeSetTitle(conversationId, content.trim());
    }

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('No active session');

      const history = [...messages, userMessage]
        .filter(m => !m.isPending)
        .slice(-20)
        .map(m => ({ role: m.role, content: m.content }));

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-chat-enhanced`,
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
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMsg = errorData?.error || `Request failed (${response.status})`;
        throw new Error(errorMsg);
      }

      if (!response.body) throw new Error('No response body');

      // ── SSE Streaming Parser ──
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let assistantContent = '';
      const collectedTools: ToolAction[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);

            // Tool status event
            if (parsed.type === 'tool_status') {
              let parsedResult: Record<string, unknown> | undefined;
              try { parsedResult = JSON.parse(parsed.result); } catch (_) { /* ok */ }

              const toolAction: ToolAction = {
                tool: parsed.tool,
                result: parsed.result,
                action: parsed.action,
                parsedResult,
              };
              collectedTools.push(toolAction);

              setActiveTools(prev => [...prev, parsed.tool]);
              setMessages(prev =>
                prev.map(m =>
                  m.id === pendingId
                    ? { ...m, isTooling: true, toolActions: [...collectedTools] }
                    : m
                )
              );
              continue;
            }

            // Text delta
            const delta = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (delta) {
              assistantContent += delta;
              setMessages(prev =>
                prev.map(m =>
                  m.id === pendingId
                    ? { ...m, content: assistantContent, isPending: false, isTooling: false }
                    : m
                )
              );
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split('\n')) {
          if (!raw) continue;
          if (raw.endsWith('\r')) raw = raw.slice(0, -1);
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (delta) assistantContent += delta;
          } catch { /* ignore */ }
        }
      }

      const finalContent = assistantContent || '(No response)';
      const finalTools = collectedTools.length > 0 ? collectedTools : undefined;

      // Finalize message
      setMessages(prev =>
        prev.map(m =>
          m.id === pendingId
            ? {
              ...m,
              content: finalContent,
              isPending: false,
              isTooling: false,
              toolActions: finalTools,
              timestamp: Date.now(),
            }
            : m
        )
      );

      // Persist assistant message
      persistMessage(conversationId, 'assistant', finalContent, finalTools);
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;

      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      setMessages(prev =>
        prev.map(m =>
          m.id === pendingId
            ? { ...m, content: `⚠️ ${errorMessage}`, isPending: false, isTooling: false }
            : m
        )
      );
      toast.error(errorMessage);
    } finally {
      setIsStreaming(false);
      setActiveTools([]);
      abortRef.current = null;
    }
  }, [user, messages, isStreaming, options.context, conversationId, persistMessage, maybeSetTitle]);

  const clearMessages = useCallback(() => {
    newConversation();
  }, [newConversation]);

  const cancelStream = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
    setActiveTools([]);
  }, []);

  return {
    messages,
    isStreaming,
    activeTools,
    sendMessage,
    clearMessages,
    cancelStream,
    quickPrompts: QUICK_PROMPTS,
    // Conversation management
    conversationId,
    conversationTitle,
    conversations,
    isLoadingConversations,
    loadConversation,
    newConversation,
    refreshConversations: fetchConversations,
  };
}
