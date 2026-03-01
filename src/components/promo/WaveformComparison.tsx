import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface WaveformComparisonProps {
  originalBuffer: AudioBuffer;
  masteredBuffer: AudioBuffer;
  bars?: number;
}

function downsamplePeaks(buffer: AudioBuffer, barCount: number): number[] {
  const data = buffer.getChannelData(0);
  const step = Math.ceil(data.length / barCount);
  const peaks: number[] = [];
  for (let i = 0; i < barCount; i++) {
    let max = 0;
    const end = Math.min((i + 1) * step, data.length);
    for (let j = i * step; j < end; j++) {
      const abs = Math.abs(data[j]);
      if (abs > max) max = abs;
    }
    peaks.push(max);
  }
  return peaks;
}

function drawWaveform(
  canvas: HTMLCanvasElement,
  peaks: number[],
  globalMax: number,
  gradient: [string, string, string] | null // null = grayscale
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  const barW = w / peaks.length;
  const mid = h / 2;
  const maxAmp = mid - 2;

  if (gradient) {
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, gradient[0]);
    grad.addColorStop(0.5, gradient[1]);
    grad.addColorStop(1, gradient[2]);
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
  }

  for (let i = 0; i < peaks.length; i++) {
    const norm = globalMax > 0 ? peaks[i] / globalMax : 0;
    const barH = norm * maxAmp;
    const x = i * barW;
    ctx.fillRect(x, mid - barH, Math.max(1, barW - 1), barH * 2);
  }
}

export function WaveformComparison({
  originalBuffer,
  masteredBuffer,
  bars = 200,
}: WaveformComparisonProps) {
  const origRef = useRef<HTMLCanvasElement>(null);
  const masterRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const origPeaks = downsamplePeaks(originalBuffer, bars);
    const masterPeaks = downsamplePeaks(masteredBuffer, bars);
    const globalMax = Math.max(...origPeaks, ...masterPeaks, 0.001);

    if (origRef.current) {
      drawWaveform(origRef.current, origPeaks, globalMax, null);
    }
    if (masterRef.current) {
      drawWaveform(masterRef.current, masterPeaks, globalMax, [
        '#FF70D0', '#C5A3FF', '#70E0FF',
      ]);
    }
  }, [originalBuffer, masteredBuffer, bars]);

  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{ transformOrigin: 'left' }}
      className="space-y-1"
    >
      {/* Original */}
      <div>
        <p className="text-[10px] font-medium text-white/40 mb-0.5">Before</p>
        <canvas
          ref={origRef}
          className="w-full rounded-md bg-white/5"
          style={{ height: 48 }}
        />
      </div>
      {/* Mastered */}
      <div>
        <p className="text-[10px] font-medium text-primary mb-0.5">
          After — Velvet Curve
        </p>
        <canvas
          ref={masterRef}
          className="w-full rounded-md bg-white/5"
          style={{ height: 48 }}
        />
      </div>
    </motion.div>
  );
}
