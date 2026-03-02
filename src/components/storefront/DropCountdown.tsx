/**
 * DropCountdown — Animated countdown timer for upcoming drops.
 * 
 * Shows days:hours:minutes:seconds with fire gradient.
 * Used on profile pages, storefronts, and the drop page itself.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Flame } from 'lucide-react';

interface DropCountdownProps {
    launchDate: string;
    dropName?: string;
    variant?: 'full' | 'compact' | 'minimal';
    onLive?: () => void;
    className?: string;
}

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
}

function calcTimeLeft(target: string): TimeLeft {
    const diff = new Date(target).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        total: diff,
    };
}

function Segment({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex flex-col items-center">
            <div className="bg-white/5 border border-white/8 rounded-lg px-3 py-2 min-w-[52px]">
                <motion.span
                    key={value}
                    initial={{ y: -8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="block text-2xl font-mono font-bold text-center bg-gradient-to-b from-orange-300 to-red-400 bg-clip-text text-transparent"
                >
                    {String(value).padStart(2, '0')}
                </motion.span>
            </div>
            <span className="text-[9px] text-muted-foreground mt-1 uppercase tracking-wide">{label}</span>
        </div>
    );
}

export function DropCountdown({ launchDate, dropName, variant = 'full', onLive, className }: DropCountdownProps) {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>(calcTimeLeft(launchDate));

    useEffect(() => {
        const timer = setInterval(() => {
            const tl = calcTimeLeft(launchDate);
            setTimeLeft(tl);
            if (tl.total <= 0) {
                clearInterval(timer);
                onLive?.();
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [launchDate, onLive]);

    if (timeLeft.total <= 0) {
        return (
            <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
                className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-xl',
                    'bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30',
                    className
                )}
            >
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm font-bold text-red-400">DROP IS LIVE 🔥</span>
            </motion.div>
        );
    }

    if (variant === 'minimal') {
        return (
            <div className={cn('flex items-center gap-1.5', className)}>
                <Flame className="h-3.5 w-3.5 text-orange-400" />
                <span className="text-xs font-mono text-orange-300">
                    {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}
                    {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                </span>
            </div>
        );
    }

    if (variant === 'compact') {
        return (
            <div className={cn('flex items-center gap-3 p-2 rounded-lg bg-white/[0.03] border border-white/8', className)}>
                <Flame className="h-4 w-4 text-orange-400" />
                <div className="flex gap-1.5 font-mono text-sm">
                    {timeLeft.days > 0 && <span className="text-orange-300">{timeLeft.days}d</span>}
                    <span className="text-orange-300">{String(timeLeft.hours).padStart(2, '0')}h</span>
                    <span className="text-orange-300">{String(timeLeft.minutes).padStart(2, '0')}m</span>
                    <span className="text-orange-400">{String(timeLeft.seconds).padStart(2, '0')}s</span>
                </div>
                {dropName && <span className="text-xs text-muted-foreground truncate">{dropName}</span>}
            </div>
        );
    }

    return (
        <div className={cn('space-y-2', className)}>
            {dropName && (
                <div className="flex items-center gap-2 justify-center">
                    <Flame className="h-4 w-4 text-orange-400" />
                    <span className="text-sm font-semibold text-foreground">{dropName}</span>
                </div>
            )}
            <div className="flex items-center justify-center gap-2">
                {timeLeft.days > 0 && <Segment value={timeLeft.days} label="Days" />}
                <span className="text-xl text-muted-foreground font-mono mt-[-12px]">:</span>
                <Segment value={timeLeft.hours} label="Hours" />
                <span className="text-xl text-muted-foreground font-mono mt-[-12px]">:</span>
                <Segment value={timeLeft.minutes} label="Min" />
                <span className="text-xl text-muted-foreground font-mono mt-[-12px]">:</span>
                <Segment value={timeLeft.seconds} label="Sec" />
            </div>
            <p className="text-[10px] text-muted-foreground text-center">⚡ Be ready. Limited quantities.</p>
        </div>
    );
}
