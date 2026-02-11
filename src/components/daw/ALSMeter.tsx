/**
 * ALSMeter — Aura DAW Thermal Channel Meter (V2)
 *
 * Inspired by the Aura DAW mixer mockups: fat, smooth thermal
 * gradient bars that feel like real console strips. Each channel
 * has its own multi-stop gradient that's always visible as a
 * "track" — the fill level reveals the gradient from the bottom up.
 *
 * Design language: Blue (cold/silent) → Orange (warm) → Red (hot)
 * with per-channel accent tints layered on top.
 */

import { motion, useSpring, useTransform } from 'framer-motion';
import { useALS, useALSChannel } from '@/hooks/useALS';
import { cn } from '@/lib/utils';

// ─── Gradient Definitions (matching Aura mixer mockup) ───────────

/** Each channel gets a unique multi-stop thermal gradient */
const CHANNEL_GRADIENTS: Record<string, string> = {
    // Temperature: Blue → Cyan → Yellow → Orange → Red
    temperature: 'linear-gradient(to top, #1a3a5c, #0ea5e9, #22d3ee, #facc15, #f97316, #ef4444)',
    // Momentum: Deep Navy → Electric Blue → Bright Cyan
    momentum: 'linear-gradient(to top, #0f172a, #1e40af, #3b82f6, #60a5fa, #38bdf8, #22d3ee)',
    // Pressure: Dark Indigo → Purple → Violet → Magenta
    pressure: 'linear-gradient(to top, #1e1b4b, #4c1d95, #7c3aed, #a855f7, #c084fc, #e879f9)',
    // Harmony: Dark Rose → Pink → Hot Pink → Fuchsia
    harmony: 'linear-gradient(to top, #2d1a2e, #831843, #be185d, #ec4899, #f472b6, #f9a8d4)',
};

/** Dim versions for the "track" behind the fill */
const CHANNEL_TRACK_GRADIENTS: Record<string, string> = {
    temperature: 'linear-gradient(to top, #0d1d2e, #0a3550, #0d4a5c, #4a3a0a, #3a2508, #3a1010)',
    momentum: 'linear-gradient(to top, #080c17, #0f2050, #1a3570, #253a60, #1a3050, #0d2535)',
    pressure: 'linear-gradient(to top, #0f0d26, #260e4a, #351a65, #42227a, #503090, #5a3098)',
    harmony: 'linear-gradient(to top, #170d17, #3a0c20, #500e2d, #6a1845, #702858, #7a3868)',
};

const CHANNEL_LABELS: Record<string, string> = {
    temperature: 'TEMP',
    momentum: 'MOM',
    pressure: 'PRES',
    harmony: 'HARM',
};

const CHANNEL_GLOW_COLORS: Record<string, string> = {
    temperature: '#f97316',
    momentum: '#3b82f6',
    pressure: '#a855f7',
    harmony: '#ec4899',
};

// ─── dB Scale marks ──────────────────────────────────────────────

const DB_MARKS = [
    { label: '0', position: 100 },
    { label: '-6', position: 75 },
    { label: '-12', position: 55 },
    { label: '-24', position: 35 },
    { label: '-48', position: 12 },
];

// ─── ALSMeter (V2 — console-strip style) ─────────────────────────

interface ALSMeterProps {
    channel: 'temperature' | 'momentum' | 'pressure' | 'harmony';
    height?: number | string;
    /** Width in pixels (default 24 — wider for console feel) */
    width?: number;
    showLabel?: boolean;
    showValue?: boolean;
    showDbScale?: boolean;
    orientation?: 'vertical' | 'horizontal';
    className?: string;
}

export function ALSMeter({
    channel,
    height = 160,
    width = 24,
    showLabel = false,
    showValue = false,
    showDbScale = false,
    orientation = 'vertical',
    className,
}: ALSMeterProps) {
    const { value, color, active } = useALSChannel(channel);

    // Smooth spring for fluid fill animation
    const spring = useSpring(value, { stiffness: 280, damping: 28 });
    const fillPercent = useTransform(spring, [0, 1], ['0%', '100%']);
    const glowIntensity = useTransform(spring, [0, 0.5, 1], [0, 0.4, 1]);

    const isVertical = orientation === 'vertical';
    const glowColor = CHANNEL_GLOW_COLORS[channel];

    return (
        <div
            className={cn(
                'flex gap-1',
                isVertical ? 'flex-col items-center' : 'flex-row items-center',
                className
            )}
        >
            <div className="flex items-stretch gap-0.5">
                {/* dB scale (optional — shown on first meter in a strip) */}
                {showDbScale && isVertical && (
                    <div
                        className="relative flex-shrink-0"
                        style={{
                            width: 20,
                            height: typeof height === 'number' ? height : undefined,
                        }}
                    >
                        {DB_MARKS.map((mark) => (
                            <span
                                key={mark.label}
                                className="absolute right-1 text-[8px] font-mono text-white/30 leading-none"
                                style={{
                                    bottom: `${mark.position}%`,
                                    transform: 'translateY(50%)',
                                }}
                            >
                                {mark.label}
                            </span>
                        ))}
                    </div>
                )}

                {/* Main meter bar */}
                <div
                    className="relative overflow-hidden"
                    style={{
                        width: isVertical ? width : typeof height === 'number' ? height : undefined,
                        height: isVertical ? (typeof height === 'number' ? height : undefined) : width,
                        borderRadius: width * 0.15,
                        // Dim gradient as the track background
                        background: CHANNEL_TRACK_GRADIENTS[channel],
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)',
                    }}
                >
                    {/* Segment marks (like real console meters) */}
                    {isVertical && (
                        <div className="absolute inset-0 pointer-events-none z-10">
                            {Array.from({ length: 20 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute w-full"
                                    style={{
                                        bottom: `${(i + 1) * 5}%`,
                                        height: '1px',
                                        backgroundColor:
                                            i === 14 // -6dB mark
                                                ? 'rgba(255, 255, 255, 0.12)'
                                                : 'rgba(0, 0, 0, 0.25)',
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    {/* Thermal gradient fill — this is the "living" part */}
                    <motion.div
                        className="absolute"
                        style={{
                            ...(isVertical
                                ? {
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    height: fillPercent,
                                }
                                : {
                                    top: 0,
                                    left: 0,
                                    bottom: 0,
                                    width: fillPercent,
                                }),
                            background: CHANNEL_GRADIENTS[channel],
                            borderRadius: width * 0.15,
                        }}
                    />

                    {/* Level cap line (bright line at the peak of the fill) */}
                    <motion.div
                        className="absolute z-10"
                        style={{
                            ...(isVertical
                                ? {
                                    left: 0,
                                    right: 0,
                                    height: 2,
                                    bottom: fillPercent,
                                    transform: 'translateY(1px)',
                                }
                                : {
                                    top: 0,
                                    bottom: 0,
                                    width: 2,
                                    left: fillPercent,
                                    transform: 'translateX(-1px)',
                                }),
                            backgroundColor: 'rgba(255, 255, 255, 0.7)',
                            boxShadow: `0 0 6px 1px ${glowColor}`,
                            opacity: glowIntensity,
                        }}
                    />

                    {/* Outer glow when hot */}
                    <motion.div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            borderRadius: width * 0.15,
                            opacity: glowIntensity,
                            boxShadow: `inset 0 0 ${width}px rgba(255, 255, 255, 0.1), 0 0 ${width * 0.8}px ${glowColor}40`,
                        }}
                    />

                    {/* Clip warning (red flash at top when > 95%) */}
                    {value > 0.95 && (
                        <motion.div
                            className="absolute top-0 left-0 right-0 z-20"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 0.3, repeat: Infinity }}
                            style={{
                                height: 3,
                                borderRadius: `${width * 0.15}px ${width * 0.15}px 0 0`,
                                backgroundColor: '#ff2222',
                                boxShadow: '0 0 8px #ff2222',
                            }}
                        />
                    )}
                </div>
            </div>

            {/* Label */}
            {showLabel && (
                <span
                    className="text-[9px] font-mono uppercase tracking-widest mt-1"
                    style={{
                        color: active ? glowColor : 'rgba(255,255,255,0.25)',
                        textShadow: active ? `0 0 8px ${glowColor}40` : 'none',
                    }}
                >
                    {CHANNEL_LABELS[channel]}
                </span>
            )}

            {/* Value readout */}
            {showValue && (
                <span
                    className="text-[10px] font-mono tabular-nums"
                    style={{ color: glowColor }}
                >
                    {Math.round(value * 100)}
                </span>
            )}
        </div>
    );
}

// ─── ALSMasterStrip (V2 — matched to mockup mixer) ──────────────

interface ALSMasterStripProps {
    meterHeight?: number;
    showLabels?: boolean;
    showValues?: boolean;
    /** Show dB scale on the left side */
    showDbScale?: boolean;
    className?: string;
}

/**
 * ALSMasterStrip — All 4 ALS channels as fat console meters.
 * This is the Aura DAW's signature visual — replacing standard
 * green/yellow/red VU with living thermal gradients.
 */
export function ALSMasterStrip({
    meterHeight = 160,
    showLabels = true,
    showValues = false,
    showDbScale = true,
    className,
}: ALSMasterStripProps) {
    return (
        <div className={cn('flex items-end gap-1.5', className)}>
            <ALSMeter
                channel="temperature"
                height={meterHeight}
                width={22}
                showLabel={showLabels}
                showValue={showValues}
                showDbScale={showDbScale}
            />
            <ALSMeter
                channel="momentum"
                height={meterHeight}
                width={22}
                showLabel={showLabels}
                showValue={showValues}
            />
            <ALSMeter
                channel="pressure"
                height={meterHeight}
                width={22}
                showLabel={showLabels}
                showValue={showValues}
            />
            <ALSMeter
                channel="harmony"
                height={meterHeight}
                width={22}
                showLabel={showLabels}
                showValue={showValues}
            />
        </div>
    );
}

// ─── ALSChannelMeter — For individual mixer channels ─────────────

interface ALSChannelMeterProps {
    /** Height of the meter (default 120) */
    height?: number;
    /** Width (default 18) */
    width?: number;
    className?: string;
}

/**
 * Per-track/channel thermal meter — shows Temperature as a
 * smooth gradient bar matching the mockup's channel strip style.
 * Wider than the old ALSTrackStrip.
 */
export function ALSChannelMeter({ height = 120, width = 18, className }: ALSChannelMeterProps) {
    return (
        <ALSMeter
            channel="temperature"
            height={height}
            width={width}
            showLabel={false}
            showValue={false}
            className={className}
        />
    );
}

// ─── ALSTrackStrip — Compact per-track (backwards compatible) ────

interface ALSTrackStripProps {
    height?: number;
    className?: string;
}

/**
 * Compact strip for tight spaces (e.g. MiniMixerBar).
 * Backwards compatible with existing integrations.
 */
export function ALSTrackStrip({ height = 80, className }: ALSTrackStripProps) {
    return (
        <ALSMeter
            channel="temperature"
            height={height}
            width={12}
            showLabel={false}
            showValue={false}
            className={className}
        />
    );
}

// ─── ALSEnergyOrb — Composite energy visualization ──────────────

/**
 * A breathing circle that pulses with the composite ALS energy.
 * Used in the transport bar and Breathing Playhead.
 */
export function ALSEnergyOrb({ size = 24, className }: { size?: number; className?: string }) {
    const { value: temp, color: tempColor } = useALSChannel('temperature');
    const { value: mom } = useALSChannel('momentum');

    const spring = useSpring(temp, { stiffness: 200, damping: 20 });
    const scale = useTransform(spring, [0, 1], [0.7, 1.3]);
    const glowRadius = useTransform(spring, [0, 1], [0, size]);

    return (
        <motion.div
            className={cn('rounded-full relative', className)}
            style={{
                width: size,
                height: size,
                background: `radial-gradient(circle, ${tempColor}, ${tempColor}80)`,
                scale,
                boxShadow: useTransform(
                    glowRadius,
                    (r) => `0 0 ${r}px ${r * 0.4}px ${tempColor}60`
                ),
                opacity: 0.5 + temp * 0.5,
            }}
        >
            {mom > 0.3 && (
                <motion.div
                    className="absolute inset-0 rounded-full"
                    animate={{
                        scale: [1, 1.6, 1],
                        opacity: [0.4, 0, 0.4],
                    }}
                    transition={{
                        duration: 0.7,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                    style={{
                        border: `1px solid ${tempColor}`,
                    }}
                />
            )}
        </motion.div>
    );
}

// ─── ALSStereoMeter — Dual L/R thermal meter ────────────────────

/**
 * Stereo pair of thermal meters — used in the master bus
 * to show left and right channel temperature simultaneously.
 * Matches the dual-fader look from the mockup.
 */
export function ALSStereoMeter({
    height = 160,
    className,
}: {
    height?: number;
    className?: string;
}) {
    return (
        <div className={cn('flex items-end gap-0.5', className)}>
            <ALSMeter
                channel="temperature"
                height={height}
                width={16}
                showLabel={false}
                showValue={false}
                showDbScale={true}
            />
            <ALSMeter
                channel="temperature"
                height={height}
                width={16}
                showLabel={false}
                showValue={false}
            />
        </div>
    );
}
