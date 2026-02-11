/**
 * PrimeBrainInterface — AI Mixing Assistant Panel
 *
 * The Prime Brain is AURA's AI copilot. It slides in from the right,
 * overlaying the DAW with a neural-lattice-backed chat interface.
 *
 * Architecture:
 *   useAICopilotChat → streaming Gemini via prime-chat edge function
 *   useALS → injects Four Anchors + Velvet Score as conversation context
 *   Neural Lattice → canvas-based animated node network
 */

import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from 'react';
import { Brain, X, Send, Sparkles, Wand2, Zap, AudioWaveform, Lightbulb } from 'lucide-react';
import { useAICopilotChat } from '@/hooks/useAICopilotChat';
import { useALS } from '@/hooks/useALS';
import { trainingDataLogger, type ALSSnapshot } from '@/services/trainingDataLogger';
import './PrimeBrainInterface.css';

// ─── Types ───────────────────────────────────────────────────────

interface PrimeBrainInterfaceProps {
    isOpen: boolean;
    onClose: () => void;
}

interface LatticeNode {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    pulse: number;
}

// ─── Quick Actions ───────────────────────────────────────────────

const QUICK_ACTIONS = [
    { id: 'mix-analysis', label: 'Mix Analysis', icon: Wand2 },
    { id: 'vocal-polish', label: 'Vocal Polish', icon: Zap },
    { id: 'master-tips', label: 'Master Tips', icon: Sparkles },
    { id: 'arrangement', label: 'Arrangement', icon: AudioWaveform },
    { id: 'creative', label: 'Creative Ideas', icon: Lightbulb },
];

// ─── Neural Lattice Renderer ─────────────────────────────────────

function useNeuralLattice(
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    energy: number,
    isOpen: boolean
) {
    const nodesRef = useRef<LatticeNode[]>([]);
    const rafRef = useRef<number | null>(null);

    const initNodes = useCallback((width: number, height: number) => {
        const count = 30;
        const nodes: LatticeNode[] = [];
        for (let i = 0; i < count; i++) {
            nodes.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                radius: 1.5 + Math.random() * 2,
                pulse: Math.random() * Math.PI * 2,
            });
        }
        nodesRef.current = nodes;
    }, []);

    const render = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
            initNodes(rect.width, rect.height);
        }

        const w = rect.width;
        const h = rect.height;
        const nodes = nodesRef.current;
        const time = performance.now() * 0.001;

        // Clear
        ctx.clearRect(0, 0, w, h);

        // Update node positions
        for (const node of nodes) {
            node.x += node.vx + Math.sin(time + node.pulse) * 0.15;
            node.y += node.vy + Math.cos(time * 0.7 + node.pulse) * 0.15;

            // Bounce off edges
            if (node.x < 0 || node.x > w) node.vx *= -1;
            if (node.y < 0 || node.y > h) node.vy *= -1;
            node.x = Math.max(0, Math.min(w, node.x));
            node.y = Math.max(0, Math.min(h, node.y));
        }

        // Draw connections
        const connectionDist = 120 + energy * 40;
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < connectionDist) {
                    const alpha = (1 - dist / connectionDist) * (0.12 + energy * 0.1);
                    ctx.strokeStyle = `rgba(168, 139, 250, ${alpha})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.stroke();
                }
            }
        }

        // Draw nodes
        for (const node of nodes) {
            const pulse = Math.sin(time * 2 + node.pulse) * 0.3 + 0.7;
            const r = node.radius * (1 + energy * 0.5) * pulse;

            // Glow
            const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r * 4);
            gradient.addColorStop(0, `rgba(168, 139, 250, ${0.2 + energy * 0.15})`);
            gradient.addColorStop(1, 'rgba(168, 139, 250, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(node.x, node.y, r * 4, 0, Math.PI * 2);
            ctx.fill();

            // Core
            ctx.fillStyle = `rgba(196, 181, 253, ${0.5 + energy * 0.3})`;
            ctx.beginPath();
            ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
            ctx.fill();
        }

        rafRef.current = requestAnimationFrame(render);
    }, [canvasRef, energy, initNodes]);

    useEffect(() => {
        if (!isOpen) {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            return;
        }

        rafRef.current = requestAnimationFrame(render);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [isOpen, render]);
}

// ─── Main Component ──────────────────────────────────────────────

export function PrimeBrainInterface({ isOpen, onClose }: PrimeBrainInterfaceProps) {
    const latticeCanvasRef = useRef<HTMLCanvasElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const [inputValue, setInputValue] = useState('');
    const [deepThink, setDeepThink] = useState(false);
    const [closing, setClosing] = useState(false);
    const prevStreamingRef = useRef(false);
    const lastInstructionRef = useRef<string>('');

    // ALS context for AI messages
    const { engine, energy, active: alsActive } = useALS({ throttleMs: 500 });

    // Chat hook
    const chatContext = {
        currentPage: 'aura-daw',
        userRole: 'engineer' as const,
    };
    const { messages, sendMessage, isStreaming, clearChat } = useAICopilotChat(chatContext);

    // Neural lattice background
    useNeuralLattice(latticeCanvasRef, energy, isOpen);

    // New session when panel opens
    useEffect(() => {
        if (isOpen) trainingDataLogger.newSession();
    }, [isOpen]);

    // Capture ALS snapshot
    const captureALSSnapshot = useCallback((): ALSSnapshot | null => {
        if (!engine || !alsActive) return null;
        const anchors = engine.getFourAnchorsVisual();
        const velvet = engine.getVelvetScore();
        if (!anchors) return null;
        return {
            body: anchors.body,
            soul: anchors.soul,
            silk: anchors.silk,
            air: anchors.air,
            velvet,
            energy,
        };
    }, [engine, alsActive, energy]);

    // Log training data when streaming completes
    useEffect(() => {
        const wasStreaming = prevStreamingRef.current;
        prevStreamingRef.current = isStreaming;

        // Detect transition: streaming → not streaming
        if (wasStreaming && !isStreaming && messages.length >= 2) {
            const lastMsg = messages[messages.length - 1];
            const secondLastMsg = messages[messages.length - 2];

            if (secondLastMsg.role === 'user' && lastMsg.role === 'assistant' && lastMsg.content) {
                trainingDataLogger.log({
                    instruction: lastInstructionRef.current || secondLastMsg.content,
                    output: lastMsg.content,
                    alsSnapshot: captureALSSnapshot(),
                });
            }
        }
    }, [isStreaming, messages, captureALSSnapshot]);

    // Auto-scroll on new messages
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isStreaming]);

    // Focus input when panel opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 400);
        }
    }, [isOpen]);

    // Handle close with animation
    const handleClose = useCallback(() => {
        setClosing(true);
        setTimeout(() => {
            setClosing(false);
            onClose();
        }, 300);
    }, [onClose]);

    // Global keyboard: Escape and Cmd+Shift+P close the panel
    useEffect(() => {
        if (!isOpen) return;

        const handleGlobalKey = (e: globalThis.KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                handleClose();
            }
            if (e.code === 'KeyP' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
                e.preventDefault();
                e.stopPropagation();
                handleClose();
            }
        };

        // Use capture phase so we intercept before AuraDAW's listener can re-toggle
        window.addEventListener('keydown', handleGlobalKey, true);
        return () => window.removeEventListener('keydown', handleGlobalKey, true);
    }, [isOpen, handleClose]);

    // Build context string with ALS data
    const buildContextMessage = useCallback((userMsg: string): string => {
        if (!engine || !alsActive) return userMsg;

        const anchors = engine.getFourAnchorsVisual();
        const velvet = engine.getVelvetScore();

        if (!anchors) return userMsg;

        return `${userMsg}\n\n[Audio Context — Body: ${anchors.body}, Soul: ${anchors.soul}, Silk: ${anchors.silk}, Air: ${anchors.air}, Velvet Score: ${velvet}]`;
    }, [engine, alsActive]);

    // Send message
    const handleSend = useCallback(async () => {
        if (!inputValue.trim() || isStreaming) return;

        const msgWithContext = buildContextMessage(inputValue.trim());
        lastInstructionRef.current = msgWithContext;
        setInputValue('');
        await sendMessage(msgWithContext, deepThink);
    }, [inputValue, isStreaming, buildContextMessage, sendMessage, deepThink]);

    // Quick action
    const handleQuickAction = useCallback(async (type: string) => {
        if (isStreaming) return;

        const prompts: Record<string, string> = {
            'mix-analysis': 'Analyze my current mix. What needs improvement? Be specific about EQ, compression, and levels.',
            'vocal-polish': 'My vocals need polishing. Suggest specific processing chain, EQ settings, and compression ratios.',
            'master-tips': 'Give me mastering tips for this mix. Focus on limiting, EQ balance, and stereo width.',
            'arrangement': 'Analyze and suggest improvements for the arrangement. What sections could be stronger?',
            'creative': 'Give me creative production ideas to make this track more unique and exciting.',
        };

        const prompt = prompts[type] || 'Help me with my mix.';
        const msgWithContext = buildContextMessage(prompt);
        lastInstructionRef.current = msgWithContext;
        await sendMessage(msgWithContext, false);
    }, [isStreaming, buildContextMessage, sendMessage]);

    // Keyboard handling
    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Check if an AI message is actionable (contains specific suggestions)
    const isActionable = (content: string): boolean => {
        const keywords = ['suggest', 'try', 'recommend', 'set', 'boost', 'cut', 'add', 'apply', 'increase', 'decrease', 'adjust'];
        return keywords.some(k => content.toLowerCase().includes(k));
    };

    if (!isOpen && !closing) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="prime-brain-backdrop"
                onClick={handleClose}
            />

            {/* Panel */}
            <div className={`prime-brain ${closing ? 'prime-brain--closing' : ''}`}>
                {/* Neural Lattice Background */}
                <div className="prime-brain__lattice">
                    <canvas ref={latticeCanvasRef} />
                </div>

                {/* ── Header ── */}
                <div className="prime-brain__header">
                    <div className="prime-brain__header-left">
                        <div className="prime-brain__icon">
                            <Brain />
                        </div>
                        <div>
                            <div className="prime-brain__title">PRIME BRAIN</div>
                            <div className="prime-brain__subtitle">AI Assistant</div>
                        </div>
                    </div>
                    <button className="prime-brain__close" onClick={handleClose}>
                        <X size={16} />
                    </button>
                </div>

                {/* ── Quick Actions ── */}
                <div className="prime-brain__actions">
                    {QUICK_ACTIONS.map(action => (
                        <button
                            key={action.id}
                            className="prime-brain__action-btn"
                            onClick={() => handleQuickAction(action.id)}
                            disabled={isStreaming}
                        >
                            <action.icon />
                            {action.label}
                        </button>
                    ))}
                </div>

                {/* ── Messages ── */}
                <div className="prime-brain__messages">
                    {messages.length === 0 && !isStreaming && (
                        <div className="prime-brain__empty">
                            <div className="prime-brain__empty-icon">
                                <Brain />
                            </div>
                            <div className="prime-brain__empty-title">
                                Prime Brain Ready
                            </div>
                            <div className="prime-brain__empty-subtitle">
                                Ask about your mix, get AI-powered suggestions, or use a quick action above.
                            </div>
                        </div>
                    )}

                    {messages.map((msg, i) => (
                        msg.role === 'user' ? (
                            <div key={i} className="prime-brain__msg--user">
                                {/* Strip context from display */}
                                {msg.content.replace(/\n\n\[Audio Context —.*\]$/, '')}
                            </div>
                        ) : (
                            <div key={i} className="prime-brain__msg--ai">
                                <div className="prime-brain__msg-avatar">
                                    <Brain />
                                </div>
                                <div className="prime-brain__msg-body">
                                    <div className="prime-brain__msg-label">
                                        AI: {isStreaming && i === messages.length - 1 ? 'Analyzing...' : 'Response'}
                                    </div>
                                    <div className="prime-brain__msg-content">
                                        {msg.content || '...'}
                                    </div>

                                    {/* Apply AI Preset button for actionable messages */}
                                    {msg.content && isActionable(msg.content) && !(isStreaming && i === messages.length - 1) && (
                                        <button
                                            className="prime-brain__apply-btn"
                                            onClick={() => {
                                                // For now, show a toast — in future, parse and apply actual settings
                                                const event = new CustomEvent('prime-brain:apply', {
                                                    detail: { suggestion: msg.content }
                                                });
                                                window.dispatchEvent(event);
                                            }}
                                        >
                                            <Sparkles size={14} />
                                            Apply AI Preset
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    ))}

                    {isStreaming && messages.length > 0 && messages[messages.length - 1].role !== 'assistant' && (
                        <div className="prime-brain__streaming">
                            <div className="prime-brain__streaming-dots">
                                <div className="prime-brain__streaming-dot" />
                                <div className="prime-brain__streaming-dot" />
                                <div className="prime-brain__streaming-dot" />
                            </div>
                            <span className="prime-brain__streaming-text">
                                Prime Brain is thinking...
                            </span>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* ── Input Area ── */}
                <div className="prime-brain__input-area">
                    <div className="prime-brain__input-row">
                        <textarea
                            ref={inputRef}
                            className="prime-brain__input"
                            placeholder="Ask Prime Brain about your mix..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isStreaming}
                            rows={1}
                        />
                        <button
                            className="prime-brain__send-btn"
                            onClick={handleSend}
                            disabled={isStreaming || !inputValue.trim()}
                        >
                            <Send />
                        </button>
                    </div>
                    <div className="prime-brain__input-hint">
                        <span>Enter to send · Shift+Enter for new line</span>
                        <div
                            className={`prime-brain__deep-think ${deepThink ? 'prime-brain__deep-think--active' : ''}`}
                            onClick={() => setDeepThink(!deepThink)}
                        >
                            <Brain size={10} />
                            <span>Deep Think {deepThink ? 'ON' : 'OFF'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
