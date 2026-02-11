/**
 * BreathingPlayhead — ALS-driven transport playhead
 * 
 * A vertical line that lives in the timeline and does more than
 * just mark position. It BREATHES with the music:
 * 
 *  • Color shifts with Temperature (cyan→red as loudness rises)
 *  • Width pulses with Momentum (bass hits make it "thump")  
 *  • Glow radius maps to composite Energy
 *  • Top dot shows Harmony (pink glow when mix is balanced)
 */

import { motion, useSpring, useTransform } from 'framer-motion';
import { useALS } from '@/hooks/useALS';
import { cn } from '@/lib/utils';

interface BreathingPlayheadProps {
    /** Current position as percentage (0→100) of timeline width */
    position?: number;
    /** Current position in pixels (alternative to percentage) */
    positionPx?: number;
    /** Height of the playhead line */
    height: number | string;
    /** Whether playback is active (breathes only when playing) */
    isPlaying?: boolean;
    /** Additional className */
    className?: string;
}

export function BreathingPlayhead({
    position,
    positionPx,
    height,
    isPlaying = false,
    className,
}: BreathingPlayheadProps) {
    const { temperature, momentum, energy, harmony, colors, active } = useALS({
        enabled: isPlaying,
        throttleMs: 16, // 60fps for playhead smoothness
    });

    // Spring-smoothed values for fluid animation
    const tempSpring = useSpring(temperature, { stiffness: 400, damping: 25 });
    const momSpring = useSpring(momentum, { stiffness: 300, damping: 20 });
    const energySpring = useSpring(energy, { stiffness: 250, damping: 30 });

    // Derived visual properties
    const lineWidth = useTransform(momSpring, [0, 1], [1.5, 4]);
    const glowRadius = useTransform(energySpring, [0, 1], [0, 20]);
    const glowOpacity = useTransform(energySpring, [0, 0.3, 1], [0.1, 0.3, 0.8]);

    // Fallback color when ALS isn't active
    const lineColor = active ? colors.temperature : 'hsl(190, 100%, 60%)';
    const harmonyGlow = active ? colors.harmony : 'hsl(330, 50%, 40%)';

    // Determine positioning mode (px takes precedence)
    const leftStyle = positionPx !== undefined ? `${positionPx}px` : `${position ?? 0}%`;

    return (
        <motion.div
            className={cn('absolute top-0 z-20 pointer-events-none', className)}
            style={{
                left: leftStyle,
                height,
                transform: 'translateX(-50%)',
            }}
        >
            {/* Main playhead line */}
            <motion.div
                className="h-full relative"
                style={{
                    width: lineWidth,
                    backgroundColor: lineColor,
                    transition: 'background-color 0.1s ease',
                    boxShadow: useTransform(
                        glowRadius,
                        (r) => `0 0 ${r}px ${r * 0.4}px ${lineColor}`
                    ),
                    opacity: useTransform(glowOpacity, (o) => 0.6 + o * 0.4),
                }}
            />

            {/* Top indicator — Harmony dot */}
            <motion.div
                className="absolute -top-1 left-1/2 -translate-x-1/2 rounded-full"
                style={{
                    width: 8,
                    height: 8,
                    backgroundColor: harmonyGlow,
                    boxShadow: `0 0 ${harmony * 12}px ${harmony * 6}px ${harmonyGlow}`,
                    opacity: 0.5 + harmony * 0.5,
                }}
            />

            {/* Bottom triangle marker */}
            <div
                className="absolute -bottom-2 left-1/2 -translate-x-1/2"
                style={{
                    width: 0,
                    height: 0,
                    borderLeft: '5px solid transparent',
                    borderRight: '5px solid transparent',
                    borderTop: `6px solid ${lineColor}`,
                }}
            />

            {/* Momentum pulse ring (on bass hits) */}
            {isPlaying && momentum > 0.4 && (
                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                    animate={{
                        scale: [1, 2.5],
                        opacity: [0.4, 0],
                    }}
                    transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        ease: 'easeOut',
                    }}
                    style={{
                        width: 6,
                        height: 6,
                        border: `1px solid ${colors.momentum}`,
                    }}
                />
            )}
        </motion.div>
    );
}
