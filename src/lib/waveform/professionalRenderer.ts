/**
 * Professional Waveform Renderer
 * Industry-standard waveform visualization matching Pro Tools/Logic/Ableton
 */

export interface WaveformRenderOptions {
  width: number;
  height: number;
  peaks: number[];
  color?: string;
  backgroundColor?: string;
  progress?: number;
  showRMS?: boolean;
  showStereo?: boolean;
  gradientColors?: boolean;
}

/**
 * Render professional waveform with dual-channel stereo, peak/RMS overlay, and color gradients
 */
export function renderProfessionalWaveform(
  ctx: CanvasRenderingContext2D,
  options: WaveformRenderOptions
): void {
  const {
    width,
    height,
    peaks,
    color = 'hsl(220, 100%, 70%)',
    backgroundColor = 'transparent',
    progress = 0,
    showRMS = true,
    gradientColors = true
  } = options;

  // Clear canvas
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);

  if (!peaks || peaks.length === 0) return;

  const centerY = height / 2;
  const barWidth = width / peaks.length;

  // Create gradient for amplitude-based coloring
  const createAmplitudeGradient = (amplitude: number): string => {
    if (!gradientColors) return color;
    
    // Blue for normal levels (-∞ to -6dB)
    if (amplitude < 0.5) {
      return `hsl(220, 100%, ${70 - amplitude * 20}%)`;
    }
    // Yellow for warning (-6dB to -3dB)
    else if (amplitude < 0.85) {
      const yellowMix = (amplitude - 0.5) / 0.35;
      return `hsl(${220 - yellowMix * 160}, 100%, 70%)`;
    }
    // Red for clipping (-3dB to 0dB)
    else {
      return `hsl(0, 100%, ${70 - (amplitude - 0.85) * 20}%)`;
    }
  };

  // Draw peak waveform
  peaks.forEach((peak, index) => {
    const x = index * barWidth;
    const peakHeight = Math.max(2, peak * (height / 2));
    
    // Determine color based on amplitude
    ctx.fillStyle = createAmplitudeGradient(peak);
    
    // Draw peak bars (mirrored top and bottom)
    ctx.fillRect(x, centerY - peakHeight, Math.max(1, barWidth - 1), peakHeight);
    ctx.fillRect(x, centerY, Math.max(1, barWidth - 1), peakHeight);
  });

  // Draw RMS overlay (darker, semi-transparent)
  if (showRMS) {
    const rmsData = calculateRMS(peaks);
    ctx.globalAlpha = 0.6;
    
    rmsData.forEach((rms, index) => {
      const x = index * barWidth;
      const rmsHeight = Math.max(1, rms * (height / 2));
      
      ctx.fillStyle = '#000000';
      ctx.fillRect(x, centerY - rmsHeight, Math.max(1, barWidth - 1), rmsHeight);
      ctx.fillRect(x, centerY, Math.max(1, barWidth - 1), rmsHeight);
    });
    
    ctx.globalAlpha = 1.0;
  }

  // Draw progress overlay
  if (progress > 0 && progress < 1) {
    const progressX = width * progress;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(0, 0, progressX, height);
  }

  // Draw center line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, centerY);
  ctx.lineTo(width, centerY);
  ctx.stroke();
}

/**
 * Calculate RMS (Root Mean Square) for average loudness visualization
 */
function calculateRMS(peaks: number[], windowSize: number = 3): number[] {
  const rms: number[] = [];
  
  for (let i = 0; i < peaks.length; i++) {
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end = Math.min(peaks.length, i + Math.ceil(windowSize / 2));
    const window = peaks.slice(start, end);
    
    const sumSquares = window.reduce((sum, val) => sum + val * val, 0);
    const meanSquare = sumSquares / window.length;
    rms.push(Math.sqrt(meanSquare) * 0.7); // RMS is typically 70% of peak
  }
  
  return rms;
}

/**
 * Generate high-quality waveform peaks from AudioBuffer using OffscreenCanvas
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

/**
 * Render waveform to OffscreenCanvas for performance
 */
export function renderToOffscreenCanvas(
  peaks: number[],
  width: number,
  height: number,
  options: Partial<WaveformRenderOptions> = {}
): OffscreenCanvas | HTMLCanvasElement {
  // Use regular canvas for compatibility
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  renderProfessionalWaveform(ctx, {
    width,
    height,
    peaks,
    ...options
  });

  return canvas;
}

/**
 * Render only visible portion of waveform (viewport culling)
 */
export function renderViewportWaveform(
  ctx: CanvasRenderingContext2D,
  peaks: number[],
  options: WaveformRenderOptions & {
    viewportStart: number; // 0-1 range
    viewportEnd: number;   // 0-1 range
  }
): void {
  const { viewportStart, viewportEnd, width } = options;
  
  const startIndex = Math.floor(peaks.length * viewportStart);
  const endIndex = Math.ceil(peaks.length * viewportEnd);
  const visiblePeaks = peaks.slice(startIndex, endIndex);
  
  renderProfessionalWaveform(ctx, {
    ...options,
    peaks: visiblePeaks
  });
}

/**
 * Create stereo waveform with separate left/right channels
 */
export function renderStereoWaveform(
  ctx: CanvasRenderingContext2D,
  audioBuffer: AudioBuffer,
  options: WaveformRenderOptions
): void {
  const { width, height } = options;
  
  if (audioBuffer.numberOfChannels < 2) {
    // Mono - render single waveform
    const peaks = generateWaveformPeaks(audioBuffer, width);
    renderProfessionalWaveform(ctx, { ...options, peaks });
    return;
  }

  // Stereo - render both channels
  const leftPeaks = generateWaveformPeaksFromChannel(audioBuffer, 0, width);
  const rightPeaks = generateWaveformPeaksFromChannel(audioBuffer, 1, width);
  
  const halfHeight = height / 2;
  
  // Render left channel (top half)
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, width, halfHeight);
  ctx.clip();
  
  renderProfessionalWaveform(ctx, {
    ...options,
    peaks: leftPeaks,
    height: halfHeight
  });
  
  ctx.restore();
  
  // Render right channel (bottom half)
  ctx.save();
  ctx.translate(0, halfHeight);
  ctx.beginPath();
  ctx.rect(0, 0, width, halfHeight);
  ctx.clip();
  
  renderProfessionalWaveform(ctx, {
    ...options,
    peaks: rightPeaks,
    height: halfHeight
  });
  
  ctx.restore();
}

/**
 * Generate peaks from specific channel
 */
function generateWaveformPeaksFromChannel(
  audioBuffer: AudioBuffer,
  channelIndex: number,
  targetSamples: number
): number[] {
  const channelData = audioBuffer.getChannelData(channelIndex);
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

/**
 * Animate waveform with progress indicator (for playback)
 */
export function animateWaveform(
  ctx: CanvasRenderingContext2D,
  peaks: number[],
  progress: number,
  options: WaveformRenderOptions
): void {
  renderProfessionalWaveform(ctx, {
    ...options,
    peaks,
    progress
  });
}
