/**
 * BloomMenu — Aura DAW's Radial Predictive UI
 *
 * A radial 8-petal context menu that blooms from the cursor/center
 * when triggered. Each petal represents a contextual action, and
 * the menu is beat-locked (petals pulse with the BPM when audio
 * is playing).
 *
 * Design from mockup: Dark circle center with "AURA" logo,
 * 8 petals radiating outward with icons and labels, glassmorphism
 * background, purple/cyan accent glow.
 *
 * Trigger: Right-click or keyboard shortcut (Ctrl+Space)
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Music,
    Sliders,
    Wand2,
    Volume2,
    Mic,
    Settings,
    FolderOpen,
    Share2,
    Waves,
    Sparkles,
    Palette,
    Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────

export interface BloomPetal {
    id: string;
    label: string;
    icon: React.ReactNode;
    /** Accent color for the petal glow */
    color: string;
    /** Action when petal is selected */
    action: () => void;
    /** Optional: sub-petals for nested menus */
    children?: BloomPetal[];
    /** Optional: disabled state */
    disabled?: boolean;
}

interface BloomMenuProps {
    /** Whether the menu is open */
    isOpen: boolean;
    /** Close handler */
    onClose: () => void;
    /** Position (defaults to center of viewport) */
    position?: { x: number; y: number };
    /** Custom petals (overrides defaults) */
    petals?: BloomPetal[];
    /** Current BPM for beat-locked pulse */
    bpm?: number;
    /** Whether audio is playing (enables pulse) */
    isPlaying?: boolean;
    /** Additional class names */
    className?: string;
}

// ─── Default Petals ──────────────────────────────────────────────

const DEFAULT_PETALS: BloomPetal[] = [
    {
        id: 'eq',
        label: 'EQ',
        icon: <Waves className="w-5 h-5" />,
        color: '#22d3ee',
        action: () => { },
    },
    {
        id: 'ai-assist',
        label: 'AI Assist',
        icon: <Sparkles className="w-5 h-5" />,
        color: '#a855f7',
        action: () => { },
    },
    {
        id: 'effects',
        label: 'Effects',
        icon: <Wand2 className="w-5 h-5" />,
        color: '#ec4899',
        action: () => { },
    },
    {
        id: 'mixer',
        label: 'Mixer',
        icon: <Sliders className="w-5 h-5" />,
        color: '#3b82f6',
        action: () => { },
    },
    {
        id: 'instruments',
        label: 'Instruments',
        icon: <Music className="w-5 h-5" />,
        color: '#f97316',
        action: () => { },
    },
    {
        id: 'record',
        label: 'Record',
        icon: <Mic className="w-5 h-5" />,
        color: '#ef4444',
        action: () => { },
    },
    {
        id: 'files',
        label: 'Files',
        icon: <FolderOpen className="w-5 h-5" />,
        color: '#10b981',
        action: () => { },
    },
    {
        id: 'export',
        label: 'Export',
        icon: <Share2 className="w-5 h-5" />,
        color: '#f59e0b',
        action: () => { },
    },
];

// ─── Bloom Menu Component ────────────────────────────────────────

export function BloomMenu({
    isOpen,
    onClose,
    position,
    petals = DEFAULT_PETALS,
    bpm = 120,
    isPlaying = false,
    className,
}: BloomMenuProps) {
    const [hoveredPetal, setHoveredPetal] = useState<string | null>(null);
    const [selectedPetal, setSelectedPetal] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Beat-locked pulse timing
    const beatDuration = 60 / bpm; // seconds per beat

    // Close on Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, onClose]);

    // Handle petal click
    const handlePetalClick = useCallback(
        (petal: BloomPetal) => {
            if (petal.disabled) return;
            setSelectedPetal(petal.id);
            petal.action();
            // Brief flash before closing
            setTimeout(() => {
                onClose();
                setSelectedPetal(null);
            }, 200);
        },
        [onClose]
    );

    // Calculate the center position
    const centerX = position?.x ?? (typeof window !== 'undefined' ? window.innerWidth / 2 : 500);
    const centerY = position?.y ?? (typeof window !== 'undefined' ? window.innerHeight / 2 : 400);

    // Petal layout constants
    const INNER_RADIUS = 60;   // Center circle radius
    const PETAL_DISTANCE = 130; // Distance from center to petal center
    const PETAL_SIZE = 56;      // Size of each petal circle

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 z-[100]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            backdropFilter: 'blur(4px)',
                        }}
                        onClick={onClose}
                    />

                    {/* Bloom Container */}
                    <motion.div
                        ref={menuRef}
                        className={cn('fixed z-[101]', className)}
                        style={{
                            left: centerX,
                            top: centerY,
                            transform: 'translate(-50%, -50%)',
                        }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        transition={{
                            type: 'spring',
                            stiffness: 400,
                            damping: 25,
                            mass: 0.8,
                        }}
                    >
                        {/* Orbital ring (subtle circle connecting petals) */}
                        <motion.div
                            className="absolute rounded-full pointer-events-none"
                            style={{
                                width: PETAL_DISTANCE * 2 + PETAL_SIZE,
                                height: PETAL_DISTANCE * 2 + PETAL_SIZE,
                                left: -(PETAL_DISTANCE + PETAL_SIZE / 2),
                                top: -(PETAL_DISTANCE + PETAL_SIZE / 2),
                                border: '1px solid rgba(255, 255, 255, 0.06)',
                                background: 'radial-gradient(circle, transparent 50%, rgba(0,0,0,0.2) 100%)',
                            }}
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.05, duration: 0.3 }}
                        />

                        {/* Connection lines (center to each petal) */}
                        {petals.map((petal, i) => {
                            const angle = (i / petals.length) * Math.PI * 2 - Math.PI / 2;
                            const endX = Math.cos(angle) * PETAL_DISTANCE;
                            const endY = Math.sin(angle) * PETAL_DISTANCE;
                            const isHovered = hoveredPetal === petal.id;

                            return (
                                <motion.div
                                    key={`line-${petal.id}`}
                                    className="absolute pointer-events-none"
                                    style={{
                                        width: PETAL_DISTANCE,
                                        height: 1,
                                        left: 0,
                                        top: 0,
                                        transformOrigin: '0% 50%',
                                        transform: `rotate(${(angle * 180) / Math.PI}deg)`,
                                        background: isHovered
                                            ? `linear-gradient(to right, ${petal.color}40, ${petal.color}80)`
                                            : 'linear-gradient(to right, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
                                        transition: 'background 0.2s ease',
                                    }}
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ delay: 0.05 + i * 0.03, duration: 0.2 }}
                                />
                            );
                        })}

                        {/* Petals */}
                        {petals.map((petal, i) => {
                            const angle = (i / petals.length) * Math.PI * 2 - Math.PI / 2;
                            const x = Math.cos(angle) * PETAL_DISTANCE;
                            const y = Math.sin(angle) * PETAL_DISTANCE;
                            const isHovered = hoveredPetal === petal.id;
                            const isSelected = selectedPetal === petal.id;

                            return (
                                <motion.button
                                    key={petal.id}
                                    className={cn(
                                        'absolute flex flex-col items-center justify-center rounded-full cursor-pointer',
                                        'transition-colors duration-150',
                                        petal.disabled && 'opacity-40 cursor-not-allowed'
                                    )}
                                    style={{
                                        width: PETAL_SIZE,
                                        height: PETAL_SIZE,
                                        left: x - PETAL_SIZE / 2,
                                        top: y - PETAL_SIZE / 2,
                                        background: isHovered || isSelected
                                            ? `radial-gradient(circle, ${petal.color}30, ${petal.color}10)`
                                            : 'rgba(15, 15, 25, 0.8)',
                                        border: `1.5px solid ${isHovered || isSelected ? petal.color + '80' : 'rgba(255,255,255,0.1)'}`,
                                        boxShadow: isHovered
                                            ? `0 0 20px ${petal.color}30, inset 0 0 15px ${petal.color}10`
                                            : isSelected
                                                ? `0 0 30px ${petal.color}50`
                                                : '0 4px 12px rgba(0,0,0,0.3)',
                                        backdropFilter: 'blur(12px)',
                                    }}
                                    initial={{
                                        scale: 0,
                                        x: 0,
                                        y: 0,
                                        opacity: 0,
                                    }}
                                    animate={{
                                        scale: isPlaying
                                            ? [1, 1.04, 1] // Subtle beat-locked pulse
                                            : 1,
                                        x: 0,
                                        y: 0,
                                        opacity: 1,
                                    }}
                                    exit={{
                                        scale: 0,
                                        opacity: 0,
                                    }}
                                    transition={{
                                        // Entry stagger
                                        delay: 0.04 + i * 0.04,
                                        type: 'spring',
                                        stiffness: 500,
                                        damping: 22,
                                        // Beat pulse
                                        ...(isPlaying
                                            ? {
                                                scale: {
                                                    duration: beatDuration,
                                                    repeat: Infinity,
                                                    ease: 'easeInOut',
                                                },
                                            }
                                            : {}),
                                    }}
                                    onMouseEnter={() => setHoveredPetal(petal.id)}
                                    onMouseLeave={() => setHoveredPetal(null)}
                                    onClick={() => handlePetalClick(petal)}
                                >
                                    {/* Icon */}
                                    <div
                                        style={{
                                            color: isHovered || isSelected ? petal.color : 'rgba(255,255,255,0.7)',
                                            transition: 'color 0.15s ease',
                                            filter: isHovered ? `drop-shadow(0 0 4px ${petal.color})` : 'none',
                                        }}
                                    >
                                        {petal.icon}
                                    </div>
                                </motion.button>
                            );
                        })}

                        {/* Petal labels (outside the circles) */}
                        {petals.map((petal, i) => {
                            const angle = (i / petals.length) * Math.PI * 2 - Math.PI / 2;
                            const labelDist = PETAL_DISTANCE + PETAL_SIZE / 2 + 14;
                            const lx = Math.cos(angle) * labelDist;
                            const ly = Math.sin(angle) * labelDist;
                            const isHovered = hoveredPetal === petal.id;

                            return (
                                <motion.span
                                    key={`label-${petal.id}`}
                                    className="absolute text-[10px] font-mono uppercase tracking-wider pointer-events-none whitespace-nowrap"
                                    style={{
                                        left: lx,
                                        top: ly,
                                        transform: 'translate(-50%, -50%)',
                                        color: isHovered ? petal.color : 'rgba(255,255,255,0.35)',
                                        textShadow: isHovered ? `0 0 8px ${petal.color}60` : 'none',
                                        transition: 'color 0.15s, text-shadow 0.15s',
                                    }}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.15 + i * 0.03 }}
                                >
                                    {petal.label}
                                </motion.span>
                            );
                        })}

                        {/* Center Hub */}
                        <motion.div
                            className="absolute flex flex-col items-center justify-center rounded-full"
                            style={{
                                width: INNER_RADIUS * 2,
                                height: INNER_RADIUS * 2,
                                left: -INNER_RADIUS,
                                top: -INNER_RADIUS,
                                background:
                                    'radial-gradient(circle at 30% 30%, rgba(30, 25, 50, 0.95), rgba(10, 8, 20, 0.98))',
                                border: '1.5px solid rgba(168, 85, 247, 0.3)',
                                boxShadow:
                                    '0 0 40px rgba(168, 85, 247, 0.15), inset 0 0 30px rgba(168, 85, 247, 0.05), 0 8px 32px rgba(0,0,0,0.5)',
                                backdropFilter: 'blur(20px)',
                            }}
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{
                                scale: 1,
                                rotate: 0,
                            }}
                            transition={{
                                type: 'spring',
                                stiffness: 300,
                                damping: 20,
                            }}
                        >
                            {/* AURA logo text */}
                            <span
                                className="text-lg font-bold tracking-[0.25em]"
                                style={{
                                    background: 'linear-gradient(135deg, #a855f7, #22d3ee)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    filter: 'drop-shadow(0 0 6px rgba(168, 85, 247, 0.4))',
                                }}
                            >
                                AURA
                            </span>

                            {/* Subtle rotating ring inside the hub */}
                            <motion.div
                                className="absolute inset-2 rounded-full pointer-events-none"
                                style={{
                                    border: '1px solid rgba(168, 85, 247, 0.15)',
                                }}
                                animate={{ rotate: 360 }}
                                transition={{
                                    duration: isPlaying ? beatDuration * 8 : 20,
                                    repeat: Infinity,
                                    ease: 'linear',
                                }}
                            >
                                {/* Notch on the ring */}
                                <div
                                    className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                                    style={{ backgroundColor: 'rgba(168, 85, 247, 0.5)' }}
                                />
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// ─── Hook for Bloom Menu state ───────────────────────────────────

export function useBloomMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState<{ x: number; y: number } | undefined>();

    const open = useCallback((pos?: { x: number; y: number }) => {
        setPosition(pos);
        setIsOpen(true);
    }, []);

    const close = useCallback(() => {
        setIsOpen(false);
    }, []);

    const toggle = useCallback(
        (pos?: { x: number; y: number }) => {
            if (isOpen) {
                close();
            } else {
                open(pos);
            }
        },
        [isOpen, open, close]
    );

    return { isOpen, position, open, close, toggle };
}
