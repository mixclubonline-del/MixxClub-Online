export interface WaveformRenderOptions {
  width: number;
  height: number;
  color: string;
  backgroundColor: string;
  progressColor?: string;
  progress?: number; // 0-1
  showStereo?: boolean;
  showRMS?: boolean;
}

/**
 * Professional waveform rendering with optimization
 */
export function renderWaveform(
  ctx: CanvasRenderingContext2D,
  peaks: number[],
  options: WaveformRenderOptions
): void {
  const {
    width,
    height,
    color,
    backgroundColor,
    progressColor,
    progress = 0,
    showStereo = false,
    showRMS = false,
  } = options;

  // Clear background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);

  if (!peaks || peaks.length === 0) {
    drawPlaceholder(ctx, width, height);
    return;
  }

  const centerY = height / 2;
  const samplesPerPixel = Math.max(1, Math.floor(peaks.length / width));
  
  // Create gradient for waveform
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  const baseColor = parseHSL(color);
  gradient.addColorStop(0, `hsla(${baseColor.h}, ${baseColor.s}%, ${Math.min(baseColor.l + 10, 100)}%, 0.9)`);
  gradient.addColorStop(0.5, color);
  gradient.addColorStop(1, `hsla(${baseColor.h}, ${baseColor.s}%, ${Math.max(baseColor.l - 10, 0)}%, 0.9)`);

  // Draw waveform
  ctx.beginPath();
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 1.5;
  ctx.lineJoin = 'round';

  for (let x = 0; x < width; x++) {
    const startIdx = x * samplesPerPixel;
    const endIdx = Math.min(startIdx + samplesPerPixel, peaks.length);
    
    // Find peak in this range
    let maxPeak = 0;
    for (let i = startIdx; i < endIdx; i++) {
      maxPeak = Math.max(maxPeak, Math.abs(peaks[i]));
    }

    const amplitude = maxPeak * (height / 2) * 0.9; // Scale to 90% of half-height
    const y1 = centerY - amplitude;
    const y2 = centerY + amplitude;

    // Draw vertical line for this pixel
    if (x === 0) {
      ctx.moveTo(x, y1);
    }
    ctx.lineTo(x, y1);
    ctx.lineTo(x, y2);
  }

  ctx.stroke();

  // Fill area under waveform
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.globalAlpha = 1;

  // Draw progress overlay
  if (progress > 0 && progressColor) {
    const progressWidth = width * progress;
    
    const progressGradient = ctx.createLinearGradient(0, 0, 0, height);
    const progColor = parseHSL(progressColor);
    progressGradient.addColorStop(0, `hsla(${progColor.h}, ${progColor.s}%, ${Math.min(progColor.l + 10, 100)}%, 0.9)`);
    progressGradient.addColorStop(0.5, progressColor);
    progressGradient.addColorStop(1, `hsla(${progColor.h}, ${progColor.s}%, ${Math.max(progColor.l - 10, 0)}%, 0.9)`);

    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = progressGradient;
    ctx.fillRect(0, 0, progressWidth, height);
    ctx.restore();
  }

  // Draw center line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, centerY);
  ctx.lineTo(width, centerY);
  ctx.stroke();
}

function drawPlaceholder(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const centerY = height / 2;
  
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(0, centerY);
  ctx.lineTo(width, centerY);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('No audio loaded', width / 2, centerY + 4);
}

function parseHSL(hslString: string): { h: number; s: number; l: number } {
  const match = hslString.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return { h: 180, s: 70, l: 50 };
  
  return {
    h: parseInt(match[1]),
    s: parseInt(match[2]),
    l: parseInt(match[3]),
  };
}

/**
 * Generate waveform peaks from AudioBuffer
 */
export function generateWaveformPeaks(
  audioBuffer: AudioBuffer,
  targetSamples: number = 2000
): number[] {
  const channelData = audioBuffer.getChannelData(0);
  const samplesPerPeak = Math.floor(channelData.length / targetSamples);
  const peaks: number[] = [];

  for (let i = 0; i < targetSamples; i++) {
    const start = i * samplesPerPeak;
    const end = Math.min(start + samplesPerPeak, channelData.length);
    
    let max = 0;
    for (let j = start; j < end; j++) {
      const abs = Math.abs(channelData[j]);
      if (abs > max) max = abs;
    }
    
    peaks.push(max);
  }

  return peaks;
}
