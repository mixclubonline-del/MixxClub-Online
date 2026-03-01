/**
 * Velvet Curve Offline Mastering
 * 
 * Standalone client-side mastering using MixxClub's proprietary
 * VelvetCurveProcessor + safety limiter via OfflineAudioContext.
 * No backend dependency, instant results.
 */

import { VelvetCurveProcessor } from '@/audio/effects/VelvetCurveProcessor';
import { GenrePreset, GENRE_PRESETS } from '@/audio/context/GenreContext';

/**
 * Master an AudioBuffer using the Velvet Curve engine.
 * 
 * Signal chain:
 *   Source → VelvetCurveProcessor (genre-aware) → Safety Limiter → Destination
 * 
 * @param buffer - Input AudioBuffer (decoded from user's upload)
 * @param genre - Genre preset key for Velvet Curve tuning
 * @returns Mastered AudioBuffer
 */
export async function velvetMaster(
  buffer: AudioBuffer,
  genre: GenrePreset = 'default'
): Promise<AudioBuffer> {
  const { numberOfChannels, length, sampleRate } = buffer;

  // Create offline context matching the input dimensions
  const offlineCtx = new OfflineAudioContext(numberOfChannels, length, sampleRate);

  // ── Source ──
  const source = offlineCtx.createBufferSource();
  source.buffer = buffer;

  // ── Velvet Curve Processor (genre-aware) ──
  // VelvetCurveProcessor accepts any BaseAudioContext (AudioContext | OfflineAudioContext)
  const velvet = new VelvetCurveProcessor(offlineCtx as unknown as AudioContext);
  velvet.applyGenrePreset(genre);
  velvet.stopBreathing(); // Ensure breathing modulation is OFF for offline render

  // ── Wire the chain (no external limiter — internal power compressor handles dynamics) ──
  source.connect(velvet.getInputNode());
  velvet.getOutputNode().connect(offlineCtx.destination);

  // ── Render ──
  source.start(0);
  const mastered = await offlineCtx.startRendering();

  // ── Loudness normalization (target -14 LUFS ≈ -14 dBFS RMS for short-term) ──
  normalizeLoudness(mastered, -14);

  // Cleanup processor nodes
  velvet.destroy();

  return mastered;
}

/**
 * Simple RMS-based loudness normalization.
 * Adjusts gain so the overall RMS matches the target LUFS (approximated as dBFS RMS).
 */
function normalizeLoudness(buffer: AudioBuffer, targetLUFS: number): void {
  // Measure current RMS across all channels
  let sumSquares = 0;
  let totalSamples = 0;

  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < data.length; i++) {
      sumSquares += data[i] * data[i];
    }
    totalSamples += data.length;
  }

  const rms = Math.sqrt(sumSquares / totalSamples);
  if (rms === 0) return; // silence — nothing to normalize

  const currentLUFS = 20 * Math.log10(rms);
  const gainDB = targetLUFS - currentLUFS;
  const gainLinear = Math.pow(10, gainDB / 20);

  // Clamp gain to prevent boosting silence or over-amplifying
  const clampedGain = Math.min(gainLinear, 6); // max +15.5 dB boost

  // Apply gain in-place with soft saturation (no hard clipping)
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < data.length; i++) {
      data[i] *= clampedGain;
      // Soft saturation instead of hard clip — tanh curve prevents discontinuities
      if (data[i] > 0.95 || data[i] < -0.95) {
        data[i] = Math.tanh(data[i]);
      }
    }
  }
}

/**
 * Measure approximate LUFS (RMS-based approximation) of an AudioBuffer.
 */
export function measureLUFS(buffer: AudioBuffer): number {
  let sumSquares = 0;
  let totalSamples = 0;

  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < data.length; i++) {
      sumSquares += data[i] * data[i];
    }
    totalSamples += data.length;
  }

  const rms = Math.sqrt(sumSquares / totalSamples);
  if (rms === 0) return -Infinity;
  return 20 * Math.log10(rms);
}
