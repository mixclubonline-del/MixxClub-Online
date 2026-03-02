/**
 * AdminPrimeBrainHub — Platform Intelligence Command Center
 *
 * The admin's AI-powered command center. Features:
 * - Platform Pulse: live metrics bar
 * - Chat Console: full conversation with admin-chat-enhanced (Gemini 3.1)
 * - Quick Intelligence: one-tap prompts, action log, suggested follow-ups
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Brain, Send, Sparkles, Users, Headphones, DollarSign,
    Shield, Zap, Trash2, ChevronRight, Bot, User,
    Ticket, Activity, X,
} from 'lucide-react';
import { useAdminChat, type ChatMessage } from '@/hooks/useAdminChat';
import { useWaitlistStats } from '@/hooks/useWaitlist';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import mixclubLogo from '@/assets/mixxclub-3d-logo.png';
import DOMPurify from 'dompurify';

// ── Markdown-lite renderer for AI responses (sanitized) ──
function renderMarkdown(text: string) {
    // Bold
    let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-muted/50 text-xs font-mono">$1</code>');
    // Links - sanitize href to prevent javascript: protocol
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, url) => {
        const safeUrl = url.startsWith('http://') || url.startsWith('https://') ? url : '#';
        return `<a href="${safeUrl}" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">${label}</a>`;
    });
    // Line breaks
    html = html.replace(/\n/g, '<br/>');
    // Heading lines (## etc)
    html = html.replace(/<br\/>#{1,3}\s+(.*?)(<br\/>|$)/g, '<br/><strong class="text-base text-foreground">$1</strong><br/>');
    // Bullet points
    html = html.replace(/<br\/>-\s+(.*?)(?=<br\/>|$)/g, '<br/><span class="inline-flex items-start gap-1.5 ml-2"><span class="text-primary mt-1">•</span><span>$1</span></span>');
    // Emojis at start of line get a bit more space
    html = html.replace(/<br\/>([\u{1F300}-\u{1F9FF}])/gu, '<br/><span class="mr-1">$1</span>');

    // Sanitize: strip any script tags or event handlers
    html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    html = html.replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, '');
    html = html.replace(/<iframe\b[^>]*>.*?<\/iframe>/gi, '');

    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['strong', 'code', 'a', 'br', 'span', 'em'],
        ALLOWED_ATTR: ['href', 'class', 'target', 'rel'],
    });
}

// ── Chat Bubble ──
function ChatBubble({ message }: { message: ChatMessage }) {
    const isUser = message.role === 'user';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
        >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-1
        ${isUser
                    ? 'bg-primary/20 text-primary'
                    : 'bg-gradient-to-br from-purple-500/20 to-cyan-500/20 text-purple-400'
                }`}
            >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className={`max-w-[80%] ${isUser ? 'text-right' : ''}`}>
                <div className={`inline-block px-4 py-3 rounded-2xl text-sm leading-relaxed
          ${isUser
                        ? 'bg-primary/15 text-foreground rounded-tr-md'
                        : 'bg-muted/30 border border-border/30 text-foreground rounded-tl-md'
                    }`}
                >
                    {message.isPending ? (
                        <div className="flex items-center gap-2">
                            <motion.div className="flex gap-1">
                                {[0, 1, 2].map(i => (
                                    <motion.div
                                        key={i}
                                        className="w-1.5 h-1.5 rounded-full bg-primary/60"
                                        animate={{ y: [0, -4, 0] }}
                                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                                    />
                                ))}
                            </motion.div>
                            <span className="text-xs text-muted-foreground">Prime is thinking...</span>
                        </div>
                    ) : isUser ? (
                        <p>{message.content}</p>
                    ) : (
                        <div
                            className="prose-invert prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
                        />
                    )}
                </div>
            </div>
        </motion.div>
    );
}

// ── Main Hub Component ──
export const AdminPrimeBrainHub = () => {
    const isMobile = useIsMobile();
    const [inputValue, setInputValue] = useState('');
    const [showQuickPanel, setShowQuickPanel] = useState(!isMobile);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const { messages, isStreaming, sendMessage, clearMessages, quickPrompts } = useAdminChat();
    const { data: waitlistStats } = useWaitlistStats();

    // Platform pulse metrics
    const [pulse, setPulse] = useState({
        totalUsers: 0,
        activeSessions: 0,
        revenue30d: 0,
        securityAlerts: 0,
    });

    useEffect(() => {
        const fetchPulse = async () => {
            const [
                { count: users },
                { count: sessions },
                { data: rev },
                { count: alerts },
            ] = await Promise.all([
                supabase.from('profiles').select('*', { count: 'exact', head: true }),
                supabase.from('collaboration_sessions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
                supabase.from('payments').select('amount').eq('status', 'completed')
                    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
                supabase.from('admin_security_events').select('*', { count: 'exact', head: true }).eq('is_resolved', false),
            ]);
            setPulse({
                totalUsers: users || 0,
                activeSessions: sessions || 0,
                revenue30d: rev?.reduce((s, p) => s + (p.amount || 0), 0) || 0,
                securityAlerts: alerts || 0,
            });
        };
        fetchPulse();
    }, []);

    // Auto-scroll on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (!inputValue.trim() || isStreaming) return;
        sendMessage(inputValue);
        setInputValue('');
    };

    const handleQuickPrompt = (prompt: string) => {
        sendMessage(prompt);
        if (isMobile) setShowQuickPanel(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const pulseMetrics = [
        { icon: Users, label: 'Users', value: pulse.totalUsers, color: 'text-blue-500' },
        { icon: Headphones, label: 'Sessions', value: pulse.activeSessions, color: 'text-green-500' },
        { icon: DollarSign, label: 'Revenue', value: `$${pulse.revenue30d.toLocaleString()}`, color: 'text-yellow-500' },
        { icon: Ticket, label: 'Waitlist', value: waitlistStats?.totalSignups || 0, color: 'text-purple-500' },
        { icon: Shield, label: 'Alerts', value: pulse.securityAlerts, color: pulse.securityAlerts > 0 ? 'text-red-500' : 'text-green-500' },
    ];

    return (
        <div className="space-y-4">
            {/* ═══ Platform Pulse ═══ */}
            <Card className="bg-background/50 backdrop-blur-sm border-border/50 overflow-hidden">
                <div className="relative">
                    {/* Subtle gradient accent */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-cyan-500/5 to-primary/5" />
                    <CardContent className="relative p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <motion.img
                                    src={mixclubLogo}
                                    alt="Prime"
                                    className="w-8 h-8"
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                />
                                <div>
                                    <h3 className="font-bold text-sm flex items-center gap-2">
                                        Prime Brain
                                        <Badge className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/30 text-[10px]">
                                            Gemini 3.1
                                        </Badge>
                                    </h3>
                                    <p className="text-[10px] text-muted-foreground">Platform Intelligence Center</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[10px] text-green-500 font-medium">ONLINE</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-5 gap-2">
                            {pulseMetrics.map(m => (
                                <div key={m.label} className="text-center px-2 py-1.5 rounded-lg bg-muted/20 border border-border/20">
                                    <m.icon className={`w-3.5 h-3.5 mx-auto mb-0.5 ${m.color}`} />
                                    <p className={`text-sm font-bold ${m.color}`}>{m.value}</p>
                                    <p className="text-[9px] text-muted-foreground">{m.label}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </div>
            </Card>

            {/* ═══ Chat + Intelligence Panel ═══ */}
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-[1fr_320px]'}`}>
                {/* Chat Console */}
                <Card className="bg-background/50 backdrop-blur-sm border-border/50 flex flex-col" style={{ height: isMobile ? '60vh' : '65vh' }}>
                    <CardHeader className="py-3 px-4 border-b border-border/30 flex-row items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Brain className="w-4 h-4 text-purple-500" />
                            Chat Console
                        </CardTitle>
                        <div className="flex items-center gap-1.5">
                            {isMobile && (
                                <Button variant="ghost" size="sm" onClick={() => setShowQuickPanel(!showQuickPanel)} className="h-7 text-xs gap-1">
                                    <Zap className="w-3 h-3" /> Quick
                                </Button>
                            )}
                            {messages.length > 0 && (
                                <Button variant="ghost" size="sm" onClick={clearMessages} className="h-7 text-xs gap-1 text-muted-foreground">
                                    <Trash2 className="w-3 h-3" /> Clear
                                </Button>
                            )}
                        </div>
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                        {/* Messages */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="mb-6"
                                    >
                                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                                            <Brain className="w-10 h-10 text-purple-400" />
                                        </div>
                                        <h3 className="text-lg font-bold mb-2">
                                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                                                Prime Brain Ready
                                            </span>
                                        </h3>
                                        <p className="text-sm text-muted-foreground max-w-sm">
                                            Your AI command center for platform intelligence. Ask anything about users, revenue, sessions, security, or strategy.
                                        </p>
                                    </motion.div>

                                    {/* Inline quick prompts for empty state */}
                                    <div className="grid grid-cols-2 gap-2 max-w-md">
                                        {quickPrompts.slice(0, 4).map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => handleQuickPrompt(p.prompt)}
                                                className="text-left px-3 py-2.5 rounded-xl bg-muted/20 border border-border/30 hover:border-primary/30 hover:bg-primary/5 transition-all text-xs"
                                            >
                                                <span className="font-medium">{p.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                messages.map(msg => <ChatBubble key={msg.id} message={msg} />)
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-3 border-t border-border/30 bg-muted/5">
                            <div className="flex items-center gap-2">
                                <Input
                                    ref={inputRef}
                                    placeholder="Ask Prime anything about the platform..."
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={isStreaming}
                                    className="bg-muted/20 border-border/30 h-10 text-sm"
                                />
                                <Button
                                    size="icon"
                                    onClick={handleSend}
                                    disabled={!inputValue.trim() || isStreaming}
                                    className="h-10 w-10 shrink-0 bg-gradient-to-r from-purple-600 to-cyan-600"
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Intelligence Panel */}
                <AnimatePresence>
                    {showQuickPanel && (
                        <motion.div
                            initial={isMobile ? { y: '100%' } : { opacity: 0, x: 20 }}
                            animate={isMobile ? { y: 0 } : { opacity: 1, x: 0 }}
                            exit={isMobile ? { y: '100%' } : { opacity: 0, x: 20 }}
                            className={isMobile
                                ? 'fixed inset-x-0 bottom-0 z-50 max-h-[70vh]'
                                : 'flex flex-col'
                            }
                            style={!isMobile ? { height: '65vh' } : {}}
                        >
                            <Card className={`bg-background/80 backdrop-blur-xl border-border/50 flex flex-col h-full
                ${isMobile ? 'rounded-t-2xl rounded-b-none border-b-0' : ''}`}>
                                <CardHeader className="py-3 px-4 border-b border-border/30 flex-row items-center justify-between">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-yellow-500" />
                                        Quick Intelligence
                                    </CardTitle>
                                    {isMobile && (
                                        <Button variant="ghost" size="icon" onClick={() => setShowQuickPanel(false)} className="h-7 w-7">
                                            <X className="w-4 h-4" />
                                        </Button>
                                    )}
                                </CardHeader>

                                <ScrollArea className="flex-1">
                                    <div className="p-3 space-y-2">
                                        {quickPrompts.map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => handleQuickPrompt(p.prompt)}
                                                disabled={isStreaming}
                                                className="w-full text-left px-3 py-2.5 rounded-xl bg-muted/20 border border-border/30
                          hover:border-primary/30 hover:bg-primary/5 transition-all group flex items-center justify-between
                          disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <span className="text-xs font-medium">{p.label}</span>
                                                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                                            </button>
                                        ))}
                                    </div>
                                </ScrollArea>

                                {/* Active conversation stats */}
                                {messages.length > 0 && (
                                    <div className="p-3 border-t border-border/30">
                                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Activity className="w-3 h-3" />
                                                {messages.filter(m => m.role === 'user').length} messages sent
                                            </span>
                                            <span>
                                                {messages.filter(m => m.role === 'assistant' && !m.isPending).length} responses
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
