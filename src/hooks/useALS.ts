/**
 * useALS — React hook for the AURA Level System
 *
 * Provides real-time MoodFrame data to any component.
 * Lazily creates a singleton ALSEngine on first use and wires it
 * to the global audioEngine's master output.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { ALSEngine, MoodFrame, ALSConfig, createALSEngine } from '@/audio/als/ALSEngine';
import { audioEngine } from '@/services/audioEngine';

// ─── Singleton management ────────────────────────────────────────

let sharedEngine: ALSEngine | null = null;
let refCount = 0;

function getOrCreateEngine(config?: Partial<ALSConfig>): ALSEngine {
    if (!sharedEngine) {
        const ctx = audioEngine.ctx;
        // Connect to master output (the last node before ctx.destination)
        const masterOut = audioEngine.master?.output ?? audioEngine.master?.limiter;
        if (!masterOut) {
            throw new Error('[ALS] AudioEngine master chain not initialized');
        }
        sharedEngine = createALSEngine(ctx, masterOut, config);
        sharedEngine.start();
    }
    refCount++;
    return sharedEngine;
}

function releaseEngine(): void {
    refCount--;
    if (refCount <= 0 && sharedEngine) {
        sharedEngine.destroy();
        sharedEngine = null;
        refCount = 0;
    }
}

// ─── Hook ────────────────────────────────────────────────────────

export interface UseALSOptions {
    /** Only update state at this interval (ms). Default 32 (~30fps for UI) */
    throttleMs?: number;
    /** Custom ALS configuration (only used on first mount) */
    config?: Partial<ALSConfig>;
    /** Skip connecting (e.g. when audio isn't initialized yet) */
    enabled?: boolean;
}

export interface UseALSReturn {
    /** Latest MoodFrame, null until first frame arrives */
    frame: MoodFrame | null;
    /** Shorthand: temperature value 0→1 */
    temperature: number;
    /** Shorthand: momentum value 0→1 */
    momentum: number;
    /** Shorthand: pressure value 0→1 */
    pressure: number;
    /** Shorthand: harmony value 0→1 */
    harmony: number;
    /** Composite energy 0→1 */
    energy: number;
    /** CSS color strings for each channel */
    colors: {
        temperature: string;
        momentum: string;
        pressure: string;
        harmony: string;
    };
    /** Is the ALS engine running? */
    active: boolean;
}

const EMPTY_COLORS = {
    temperature: 'hsl(190, 100%, 50%)',
    momentum: 'hsl(220, 60%, 30%)',
    pressure: 'hsl(280, 50%, 25%)',
    harmony: 'hsl(330, 40%, 35%)',
};

export function useALS(options: UseALSOptions = {}): UseALSReturn {
    const { throttleMs = 32, config, enabled = true } = options;

    const [frame, setFrame] = useState<MoodFrame | null>(null);
    const [active, setActive] = useState(false);
    const lastUpdateRef = useRef(0);
    const engineRef = useRef<ALSEngine | null>(null);

    useEffect(() => {
        if (!enabled) return;

        try {
            const engine = getOrCreateEngine(config);
            engineRef.current = engine;
            setActive(true);

            const unsubscribe = engine.subscribe((newFrame) => {
                const now = performance.now();
                if (now - lastUpdateRef.current >= throttleMs) {
                    lastUpdateRef.current = now;
                    setFrame(newFrame);
                }
            });

            return () => {
                unsubscribe();
                releaseEngine();
                engineRef.current = null;
                setActive(false);
            };
        } catch {
            // AudioEngine not ready yet — silently wait
            setActive(false);
        }
    }, [enabled, throttleMs, config]);

    // Memoized return values
    const temperature = frame?.temperature.value ?? 0;
    const momentum = frame?.momentum.value ?? 0;
    const pressure = frame?.pressure.value ?? 0;
    const harmony = frame?.harmony.value ?? 0;
    const energy = frame?.energy ?? 0;

    const colors = frame
        ? {
            temperature: frame.temperature.color,
            momentum: frame.momentum.color,
            pressure: frame.pressure.color,
            harmony: frame.harmony.color,
        }
        : EMPTY_COLORS;

    return {
        frame,
        temperature,
        momentum,
        pressure,
        harmony,
        energy,
        colors,
        active,
    };
}

/**
 * useALSChannel — subscribe to a single ALS channel for focused components
 */
export function useALSChannel(
    channel: 'temperature' | 'momentum' | 'pressure' | 'harmony',
    options?: UseALSOptions
) {
    const als = useALS(options);
    return {
        value: als[channel],
        color: als.colors[channel],
        frame: als.frame,
        active: als.active,
    };
}
