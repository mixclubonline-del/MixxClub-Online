/**
 * ALSFeedbackBar — Horizontal Spectral Analyzer
 *
 * The ALS (AURA Level System) Feedback Bar sits at the top of the DAW,
 * showing a real-time spectral heatmap of the master output.
 *
 * Visual design:
 *   [Left Glass Cap] ═══ SPECTRAL GRADIENT CORE ═══ [Right Glass Cap]
 *      ALS LABEL          ▼-25dB  ▼-15dB  ▼0dB        VELVET SCORE
 *
 * Data source: ALSEngine → getSpectralData() + getVelvetScore()
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import { useALS } from '@/hooks/useALS';
import './ALSFeedbackBar.css';

// ─── Spectral color map (frequency → color) ──────────────────────

/**
 * Maps a frequency bin position (0→1 across the spectrum) to a color.
 * Blue (sub) → Violet (low-mid) → Amber (mid) → Orange (hi-mid) → Red (highs)
 */
function frequencyToColor(position: number, intensity: number): [number, number, number] {
    // intensity 0→1 controls brightness
    const i = Math.max(0, Math.min(1, intensity));

    let r: number, g: number, b: number;

    if (position < 0.15) {
        // Sub-bass → Deep blue / indigo
        r = 30 + i * 40;
        g = 40 + i * 60;
        b = 160 + i * 95;
    } else if (position < 0.3) {
        // Bass → Blue → Violet
        const t = (position - 0.15) / 0.15;
        r = (30 + i * 40) + t * (100 + i * 80);
        g = (40 + i * 60) * (1 - t * 0.5);
        b = (160 + i * 95) * (1 - t * 0.2);
    } else if (position < 0.5) {
        // Low-mid → Violet → Magenta
        const t = (position - 0.3) / 0.2;
        r = 130 + i * 80 + t * 60;
        g = 20 + i * 30;
        b = 128 + i * 60 - t * (40 + i * 30);
    } else if (position < 0.7) {
        // Mid → Yellow → Amber
        const t = (position - 0.5) / 0.2;
        r = 200 + i * 55;
        g = 160 + i * 60 - t * (40 + i * 30);
        b = 20 + i * 20 - t * 15;
    } else if (position < 0.85) {
        // Hi-mid → Orange
        const t = (position - 0.7) / 0.15;
        r = 220 + i * 35;
        g = 120 + i * 30 - t * (40 + i * 20);
        b = 10 + i * 10;
    } else {
        // Highs → Red → Deep red
        const t = (position - 0.85) / 0.15;
        r = 220 + i * 35;
        g = 80 + i * 30 - t * (50 + i * 20);
        b = 10 + i * 20 + t * 10;
    }

    return [
        Math.round(Math.max(0, Math.min(255, r))),
        Math.round(Math.max(0, Math.min(255, g))),
        Math.round(Math.max(0, Math.min(255, b))),
    ];
}

// ─── Velvet Score helpers ─────────────────────────────────────────

interface VelvetTier {
    className: string;
    label: string;
}

function getVelvetTier(score: number): VelvetTier {
    if (score >= 85) return { className: 'als-bar__velvet--perfect', label: 'PERFECT' };
    if (score >= 70) return { className: 'als-bar__velvet--smooth', label: 'SMOOTH' };
    if (score >= 55) return { className: 'als-bar__velvet--warmth', label: 'WARMTH' };
    return { className: 'als-bar__velvet--work', label: 'WORK' };
}

// ─── dB Marker configuration ─────────────────────────────────────

const DB_MARKERS = [
    { db: -28, position: 15, color: '#60a5fa' },   // Blue (subs)
    { db: -25, position: 30, color: '#818cf8' },   // Indigo
    { db: -15, position: 55, color: '#fbbf24' },   // Amber (mids)
    { db: 0, position: 90, color: '#ef4444' },   // Red (peaks)
];

// ─── Component ───────────────────────────────────────────────────

export function ALSFeedbackBar() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number | null>(null);
    const { engine, active, energy } = useALS({ throttleMs: 16 });
    const [velvetScore, setVelvetScore] = useState(0);
    const [anchors, setAnchors] = useState<{ body: number; soul: number; silk: number; air: number } | null>(null);

    // ── Canvas spectral renderer ──
    const renderSpectrum = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx || !engine) {
            rafRef.current = requestAnimationFrame(renderSpectrum);
            return;
        }

        // Resize canvas to match container
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
        }

        const w = rect.width;
        const h = rect.height;

        // Get spectral data
        const data = engine.getSpectralData();
        const binCount = data.length;

        // Clear
        ctx.clearRect(0, 0, w, h);

        // Background base — very dark with a hint of color
        const bgGrad = ctx.createLinearGradient(0, 0, w, 0);
        bgGrad.addColorStop(0, 'rgba(10, 15, 40, 0.9)');
        bgGrad.addColorStop(0.3, 'rgba(15, 10, 25, 0.9)');
        bgGrad.addColorStop(0.5, 'rgba(20, 15, 10, 0.9)');
        bgGrad.addColorStop(0.7, 'rgba(25, 12, 8, 0.9)');
        bgGrad.addColorStop(1, 'rgba(30, 8, 8, 0.9)');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // Use logarithmic frequency mapping for more natural spread
        // (more pixels for low frequencies, fewer for highs)
        const logBase = Math.log(binCount);

        // Draw spectral bars as vertical slices
        const sliceWidth = w / 256; // Fixed visual resolution
        for (let i = 0; i < 256; i++) {
            const position = i / 256;

            // Log-scale mapping: spread low frequencies wider
            const logIndex = Math.pow(position, 0.7) * binCount;
            const binIndex = Math.min(binCount - 1, Math.floor(logIndex));

            // Interpolate between bins for smoothness
            const nextBin = Math.min(binCount - 1, binIndex + 1);
            const frac = logIndex - binIndex;
            const value = (data[binIndex] * (1 - frac) + data[nextBin] * frac) / 255;

            // Get color for this frequency position
            const [r, g, b] = frequencyToColor(position, value);

            // Draw a vertical bar with height proportional to intensity
            const barHeight = value * h;
            const x = i * sliceWidth;

            // Main bar (center-expanded for symmetry)
            const yTop = (h - barHeight) / 2;
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fillRect(x, yTop, sliceWidth + 0.5, barHeight);

            // Glow layer (slightly wider, more transparent)
            if (value > 0.3) {
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${value * 0.25})`;
                ctx.fillRect(x - 1, yTop - 2, sliceWidth + 2.5, barHeight + 4);
            }
        }

        // Center line (dim guide)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.stroke();

        // Update Velvet Score and anchors (less frequently — every ~5 frames)
        if (Math.random() < 0.2) {
            setVelvetScore(engine.getVelvetScore());
            setAnchors(engine.getFourAnchorsVisual());
        }

        rafRef.current = requestAnimationFrame(renderSpectrum);
    }, [engine]);

    useEffect(() => {
        rafRef.current = requestAnimationFrame(renderSpectrum);
        return () => {
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, [renderSpectrum]);

    const tier = getVelvetTier(velvetScore);

    return (
        <div className="als-bar" ref={containerRef}>
            {/* ── Left Glass Cap ── */}
            <div className="als-bar__cap als-bar__cap--left">
                <div className="als-bar__cap-title als-bar__cap-title--left">
                    ALS
                </div>
                <div className="als-bar__cap-subtitle">
                    AUDIO LEVEL SYSTEM
                </div>
                {anchors && (
                    <div className="als-bar__anchors">
                        <div className="als-bar__anchor">
                            <div className="als-bar__anchor-dot" style={{ background: '#ef4444' }} />
                            <span className="als-bar__anchor-value">{anchors.body}</span>
                        </div>
                        <div className="als-bar__anchor">
                            <div className="als-bar__anchor-dot" style={{ background: '#d946ef' }} />
                            <span className="als-bar__anchor-value">{anchors.soul}</span>
                        </div>
                        <div className="als-bar__anchor">
                            <div className="als-bar__anchor-dot" style={{ background: '#a78bfa' }} />
                            <span className="als-bar__anchor-value">{anchors.silk}</span>
                        </div>
                        <div className="als-bar__anchor">
                            <div className="als-bar__anchor-dot" style={{ background: '#22d3ee' }} />
                            <span className="als-bar__anchor-value">{anchors.air}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Spectral Core ── */}
            <div className="als-bar__core">
                <canvas
                    ref={canvasRef}
                    className="als-bar__canvas"
                />

                {/* dB Threshold Markers */}
                <div className="als-bar__db-markers">
                    {DB_MARKERS.map((marker) => (
                        <div key={marker.db}>
                            {/* Top arrow */}
                            <div
                                className="als-bar__db-marker als-bar__db-marker--top"
                                style={{ left: `${marker.position}%` }}
                            >
                                <div
                                    className="als-bar__db-arrow als-bar__db-arrow--down"
                                    style={{ borderTopColor: marker.color }}
                                />
                                <span
                                    className="als-bar__db-label"
                                    style={{ color: marker.color }}
                                >
                                    {marker.db} dB
                                </span>
                            </div>
                            {/* Bottom arrow */}
                            <div
                                className="als-bar__db-marker als-bar__db-marker--bottom"
                                style={{ left: `${marker.position}%` }}
                            >
                                <span
                                    className="als-bar__db-label"
                                    style={{ color: marker.color }}
                                >
                                    {marker.db} dB
                                </span>
                                <div
                                    className="als-bar__db-arrow als-bar__db-arrow--up"
                                    style={{ borderBottomColor: marker.color }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Right Glass Cap ── */}
            <div className="als-bar__cap als-bar__cap--right">
                <div className="als-bar__cap-title als-bar__cap-title--right">
                    AURA
                </div>
                <div className={`als-bar__velvet ${tier.className}`}>
                    <div>
                        <div className="als-bar__velvet-label">VELVET</div>
                        <div className="als-bar__velvet-tier">{tier.label}</div>
                    </div>
                    <div className="als-bar__velvet-score">
                        {velvetScore}
                    </div>
                </div>
            </div>
        </div>
    );
}
