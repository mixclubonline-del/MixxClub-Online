/**
 * AURA Level System (ALS) — Thermal Mapping Engine
 * 
 * Replaces traditional VU/dBFS meters with a psychoacoustic visual language:
 * 
 *   TEMPERATURE  — Cyan→Red gradient mapped to LUFS/Peak loudness
 *   MOMENTUM     — Blue flow reflecting rhythmic energy & sub-bass movement  
 *   PRESSURE     — Purple pulse showing system health (CPU / buffer underruns)
 *   HARMONY      — Pink glow indicating musical consonance & spectral balance
 *
 * Each channel outputs a normalized 0→1 value PLUS a "heat" color string
 * that UI components can consume directly.
 *
 * The engine produces "MoodFrame" packets at ~60fps — compact snapshots
 * consumed by the Breathing Playhead, ALS meters, and telemetry.
 */

import { FourAnchorsAnalyzer, FourAnchorsResult } from '@/audio/analysis/FourAnchors';

// ─── Types ───────────────────────────────────────────────────────

/** A single thermal channel reading */
export interface ALSChannel {
    /** Normalized 0→1 intensity */
    value: number;
    /** CSS-ready color for this channel at current intensity */
    color: string;
    /** Display label */
    label: string;
}

/** Complete MoodFrame — one snapshot of all 4 channels */
export interface MoodFrame {
    temperature: ALSChannel;
    momentum: ALSChannel;
    pressure: ALSChannel;
    harmony: ALSChannel;
    /** Unix-ms timestamp */
    timestamp: number;
    /** Composite 0→1 "energy" (weighted average) */
    energy: number;
}

/** Configuration for the ALS Engine */
export interface ALSConfig {
    /** FFT size for LUFS analysis (default 2048) */
    fftSize: number;
    /** Smoothing constant for analyser nodes (default 0.8) */
    smoothing: number;
    /** Target framerate for MoodFrame emission (default 60) */
    targetFps: number;
    /** LUFS reference ceiling in dBFS (default -14) — industry streaming target */
    lufsCeiling: number;
}

const DEFAULT_CONFIG: ALSConfig = {
    fftSize: 2048,
    smoothing: 0.8,
    targetFps: 60,
    lufsCeiling: -14,
};

// ─── Color Maps ──────────────────────────────────────────────────

/** Temperature: Cyan (cold/quiet) → Yellow (warm) → Red (hot/clipping) */
function temperatureColor(v: number): string {
    if (v < 0.3) return `hsl(190, 100%, ${50 + v * 30}%)`;       // Cyan
    if (v < 0.6) return `hsl(${190 - (v - 0.3) * 400}, 100%, 55%)`; // Cyan→Yellow
    if (v < 0.85) return `hsl(${70 - (v - 0.6) * 200}, 100%, 50%)`;  // Yellow→Orange
    return `hsl(${20 - (v - 0.85) * 133}, 100%, ${55 - (v - 0.85) * 30}%)`; // Orange→Red
}

/** Momentum: Deep blue (still) → Electric blue (driving) */
function momentumColor(v: number): string {
    const lightness = 30 + v * 35;
    const saturation = 60 + v * 40;
    return `hsl(220, ${saturation}%, ${lightness}%)`;
}

/** Pressure: Dark purple (healthy) → Bright purple (strained) */
function pressureColor(v: number): string {
    const lightness = 25 + v * 40;
    const saturation = 50 + v * 50;
    return `hsl(280, ${saturation}%, ${lightness}%)`;
}

/** Harmony: Dim pink (dissonant) → Vibrant pink (consonant) */
function harmonyColor(v: number): string {
    const lightness = 35 + v * 30;
    const saturation = 40 + v * 60;
    return `hsl(330, ${saturation}%, ${lightness}%)`;
}

// ─── ALS Engine ──────────────────────────────────────────────────

export class ALSEngine {
    private ctx: AudioContext;
    private config: ALSConfig;

    // Audio analysis nodes
    private analyser: AnalyserNode;
    private timeDomainData: Float32Array;
    private frequencyData: Uint8Array;

    // FourAnchors integration for Harmony channel
    private fourAnchors: FourAnchorsAnalyzer | null = null;

    // Momentum tracking (sub-bass RMS history for rhythmic energy)
    private momentumHistory: number[] = [];
    private readonly MOMENTUM_WINDOW = 16; // frames of sub-bass RMS to track

    // Pressure tracking
    private lastFrameTime = 0;
    private frameDropCount = 0;
    private readonly PRESSURE_DECAY = 0.95;
    private currentPressure = 0;

    // Animation loop
    private rafId: number | null = null;
    private listeners: Set<(frame: MoodFrame) => void> = new Set();
    private lastFrame: MoodFrame | null = null;

    constructor(ctx: AudioContext, config: Partial<ALSConfig> = {}) {
        this.ctx = ctx;
        this.config = { ...DEFAULT_CONFIG, ...config };

        // Create analyser for LUFS / Peak
        this.analyser = ctx.createAnalyser();
        this.analyser.fftSize = this.config.fftSize;
        this.analyser.smoothingTimeConstant = this.config.smoothing;

        this.timeDomainData = new Float32Array(this.analyser.fftSize);
        this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);

        // FourAnchors for Harmony channel (shares the same AudioContext)
        this.fourAnchors = new FourAnchorsAnalyzer(ctx, {
            fftSize: this.config.fftSize,
            smoothingTimeConstant: this.config.smoothing,
        });
    }

    // ─── Connection ──────────────────────────────────────────

    /** Get the AnalyserNode input — connect your master output here */
    getInputNode(): AnalyserNode {
        return this.analyser;
    }

    /** Get the FourAnchors input — connect in parallel for harmony data */
    getFourAnchorsInput(): AudioNode | null {
        return this.fourAnchors?.getInputNode() ?? null;
    }

    /**
     * Connect a source node to ALS (connects to both analyser + FourAnchors)
     */
    connectSource(source: AudioNode): void {
        source.connect(this.analyser);
        if (this.fourAnchors) {
            source.connect(this.fourAnchors.getInputNode());
        }
    }

    // ─── Temperature (LUFS / Peak) ───────────────────────────

    private computeTemperature(): number {
        this.analyser.getFloatTimeDomainData(this.timeDomainData as Float32Array<ArrayBuffer>);

        // RMS (approximation of short-term LUFS)
        let sumOfSquares = 0;
        let peak = 0;
        for (let i = 0; i < this.timeDomainData.length; i++) {
            const sample = this.timeDomainData[i];
            sumOfSquares += sample * sample;
            const abs = Math.abs(sample);
            if (abs > peak) peak = abs;
        }
        const rms = Math.sqrt(sumOfSquares / this.timeDomainData.length);

        // Convert to dBFS
        const rmsDb = rms > 0 ? 20 * Math.log10(rms) : -100;
        const peakDb = peak > 0 ? 20 * Math.log10(peak) : -100;

        // Map to 0→1 relative to LUFS ceiling
        // -60 dBFS → 0.0, lufsCeiling → ~0.75, 0 dBFS → 1.0
        const dbRange = 60; // -60 to 0 dBFS
        const normalizedRms = Math.max(0, Math.min(1, (rmsDb + dbRange) / dbRange));
        const normalizedPeak = Math.max(0, Math.min(1, (peakDb + dbRange) / dbRange));

        // Blend RMS and peak (RMS-dominant for warmth, peak for transient heat)
        return normalizedRms * 0.7 + normalizedPeak * 0.3;
    }

    // ─── Momentum (Rhythmic Energy) ──────────────────────────

    private computeMomentum(): number {
        this.analyser.getByteFrequencyData(this.frequencyData as Uint8Array<ArrayBuffer>);

        // Sub-bass energy (20–120Hz bins)
        const binWidth = this.ctx.sampleRate / this.config.fftSize;
        const startBin = Math.round(20 / binWidth);
        const endBin = Math.round(120 / binWidth);

        let subBassSum = 0;
        for (let i = startBin; i <= endBin && i < this.frequencyData.length; i++) {
            subBassSum += this.frequencyData[i];
        }
        const subBassAvg = subBassSum / (endBin - startBin + 1) / 255;

        // Track history for delta detection (rhythmic pumping)
        this.momentumHistory.push(subBassAvg);
        if (this.momentumHistory.length > this.MOMENTUM_WINDOW) {
            this.momentumHistory.shift();
        }

        // Compute momentum as combination of current level + variance (pumping)
        const avg = this.momentumHistory.reduce((a, b) => a + b, 0) / this.momentumHistory.length;
        const variance = this.momentumHistory.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / this.momentumHistory.length;
        const pumping = Math.min(1, Math.sqrt(variance) * 6); // Amplify variance

        // Blend: 60% current sub-bass energy, 40% rhythmic pumping
        return Math.min(1, subBassAvg * 0.6 + pumping * 0.4);
    }

    // ─── Pressure (System Health) ────────────────────────────

    private computePressure(): number {
        const now = performance.now();

        if (this.lastFrameTime > 0) {
            const elapsed = now - this.lastFrameTime;
            const expectedInterval = 1000 / this.config.targetFps;

            // Detect frame drops (>2× expected interval = dropped frame)
            if (elapsed > expectedInterval * 2) {
                this.frameDropCount++;
            }
        }
        this.lastFrameTime = now;

        // Incorporate AudioContext base latency if available
        const baseLatency = this.ctx.baseLatency ?? 0;
        const latencyPressure = Math.min(1, baseLatency / 0.05); // 50ms = max pressure

        // Frame drop pressure (decays over time)
        const dropPressure = Math.min(1, this.frameDropCount * 0.1);
        this.frameDropCount = Math.max(0, this.frameDropCount - 0.02); // Slow decay

        // Combine: decay existing pressure toward new measurement
        const rawPressure = Math.max(latencyPressure, dropPressure);
        this.currentPressure = this.currentPressure * this.PRESSURE_DECAY + rawPressure * (1 - this.PRESSURE_DECAY);

        return Math.min(1, this.currentPressure);
    }

    // ─── Harmony (Spectral Balance / Consonance) ─────────────

    private computeHarmony(): number {
        if (!this.fourAnchors) return 0.5;

        const anchors: FourAnchorsResult = this.fourAnchors.analyze();

        // Harmony = spectral balance (how even the Four Anchors distribution is)
        // High balance → high harmony (everything sitting well together)
        // Plus a bonus for having musical content in the Soul band (vocals/melody)
        const soulBonus = anchors.soul > 0.3 ? 0.1 : 0;

        return Math.min(1, anchors.balance + soulBonus);
    }

    // ─── MoodFrame Production ────────────────────────────────

    private produceMoodFrame(): MoodFrame {
        const tempValue = this.computeTemperature();
        const momValue = this.computeMomentum();
        const presValue = this.computePressure();
        const harmValue = this.computeHarmony();

        // Composite energy: weighted blend (Temperature dominant)
        const energy = tempValue * 0.4 + momValue * 0.3 + harmValue * 0.2 + presValue * 0.1;

        const frame: MoodFrame = {
            temperature: { value: tempValue, color: temperatureColor(tempValue), label: 'Temperature' },
            momentum: { value: momValue, color: momentumColor(momValue), label: 'Momentum' },
            pressure: { value: presValue, color: pressureColor(presValue), label: 'Pressure' },
            harmony: { value: harmValue, color: harmonyColor(harmValue), label: 'Harmony' },
            timestamp: Date.now(),
            energy,
        };

        this.lastFrame = frame;
        return frame;
    }

    // ─── Animation Loop ──────────────────────────────────────

    /** Start emitting MoodFrames at target FPS */
    start(): void {
        if (this.rafId !== null) return;

        const loop = () => {
            const frame = this.produceMoodFrame();
            for (const listener of this.listeners) {
                listener(frame);
            }
            this.rafId = requestAnimationFrame(loop);
        };

        this.rafId = requestAnimationFrame(loop);
    }

    /** Stop the emission loop */
    stop(): void {
        if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }

    /** Subscribe to MoodFrame updates */
    subscribe(callback: (frame: MoodFrame) => void): () => void {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    /** Get the most recent MoodFrame (for polling) */
    getLastFrame(): MoodFrame | null {
        return this.lastFrame;
    }

    /** Get a single on-demand snapshot */
    snapshot(): MoodFrame {
        return this.produceMoodFrame();
    }

    // ─── Cleanup ─────────────────────────────────────────────

    destroy(): void {
        this.stop();
        this.analyser.disconnect();
        this.fourAnchors?.destroy();
        this.listeners.clear();
    }
}

// ─── Factory ─────────────────────────────────────────────────────

/**
 * Create an ALS Engine and wire it to an audio source.
 * Typical usage: wire to the master output of the AudioEngine.
 */
export function createALSEngine(
    ctx: AudioContext,
    masterOutput: AudioNode,
    config?: Partial<ALSConfig>
): ALSEngine {
    const engine = new ALSEngine(ctx, config);
    engine.connectSource(masterOutput);
    return engine;
}
