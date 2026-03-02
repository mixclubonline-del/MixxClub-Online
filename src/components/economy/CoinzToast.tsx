/**
 * CoinzToast — Ambient micro-animation when coinz are earned.
 * 
 * Floats up from the trigger point with a coin emoji and amount.
 * Lightweight — doesn't use the toast system, renders inline.
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CoinzFloat {
    id: number;
    amount: number;
    x: number;
    y: number;
}

let floatId = 0;

/**
 * useCoinzToast — Returns a trigger function and the Toast renderer.
 * 
 * Usage:
 * ```tsx
 * const { triggerFloat, CoinzFloats } = useCoinzToast();
 * // When earning:
 * triggerFloat(15, event); // 15 coinz at click position
 * // In JSX:
 * <CoinzFloats />
 * ```
 */
export function useCoinzToast() {
    const [floats, setFloats] = useState<CoinzFloat[]>([]);

    const triggerFloat = useCallback((amount: number, event?: React.MouseEvent | { clientX: number; clientY: number }) => {
        if (amount <= 0) return;

        const x = event?.clientX ?? window.innerWidth / 2;
        const y = event?.clientY ?? window.innerHeight - 100;
        const id = ++floatId;

        setFloats(prev => [...prev, { id, amount, x, y }]);

        // Auto-remove after animation
        setTimeout(() => {
            setFloats(prev => prev.filter(f => f.id !== id));
        }, 1500);
    }, []);

    const CoinzFloats: React.FC = () => (
        <div className="fixed inset-0 pointer-events-none z-[9999]">
            <AnimatePresence>
                {floats.map(float => (
                    <motion.div
                        key={float.id}
                        initial={{
                            opacity: 1,
                            y: float.y,
                            x: float.x - 30,
                            scale: 0.5
                        }}
                        animate={{
                            opacity: 0,
                            y: float.y - 80,
                            scale: 1
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                        className="absolute text-sm font-bold text-amber-400 whitespace-nowrap"
                        style={{ textShadow: '0 0 8px rgba(245,158,11,0.5)' }}
                    >
                        +{float.amount} 🪙
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );

    return { triggerFloat, CoinzFloats };
}

/**
 * CoinzPulse — Persistent mini-indicator showing today's earnings.
 * Attach near the wallet indicator in the nav.
 */
export const CoinzPulse: React.FC<{ todayTotal: number; className?: string }> = ({
    todayTotal,
    className
}) => {
    if (todayTotal <= 0) return null;

    return (
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={cn(
                'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full',
                'bg-amber-500/15 text-amber-400 text-[10px] font-bold border border-amber-500/20',
                className
            )}
        >
            <span>+{todayTotal}</span>
            <span>🪙</span>
        </motion.div>
    );
};
