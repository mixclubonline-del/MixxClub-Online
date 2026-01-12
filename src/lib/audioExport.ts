/**
 * Audio Export Utilities
 * 
 * Provides functions to encode AudioBuffers to various formats
 * and trigger downloads for the DAW export pipeline.
 */

/**
 * Encode an AudioBuffer to WAV format
 */
export function audioBufferToWav(buffer: AudioBuffer, options: {
  bitDepth?: 16 | 24 | 32;
  normalize?: boolean;
} = {}): Blob {
  const { bitDepth = 24, normalize = true } = options;
  
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length;
  
  // Get channel data
  const channels: Float32Array[] = [];
  for (let i = 0; i < numChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }
  
  // Find peak for normalization
  let peak = 0;
  if (normalize) {
    for (const channel of channels) {
      for (let i = 0; i < channel.length; i++) {
        const abs = Math.abs(channel[i]);
        if (abs > peak) peak = abs;
      }
    }
  }
  const normalizeScale = normalize && peak > 0 ? 0.99 / peak : 1;
  
  // Calculate sizes
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = length * blockAlign;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;
  
  // Create buffer
  const arrayBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(arrayBuffer);
  
  // WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, totalSize - 8, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, bitDepth === 32 ? 3 : 1, true); // format: 1 = PCM, 3 = IEEE float
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);
  
  // Write interleaved samples
  let offset = 44;
  for (let i = 0; i < length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = channels[ch][i] * normalizeScale;
      
      if (bitDepth === 16) {
        const s = Math.max(-1, Math.min(1, sample));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      } else if (bitDepth === 24) {
        const s = Math.max(-1, Math.min(1, sample));
        const int = s < 0 ? s * 0x800000 : s * 0x7FFFFF;
        view.setUint8(offset, int & 0xFF);
        view.setUint8(offset + 1, (int >> 8) & 0xFF);
        view.setUint8(offset + 2, (int >> 16) & 0xFF);
      } else if (bitDepth === 32) {
        view.setFloat32(offset, sample, true);
      }
      
      offset += bytesPerSample;
    }
  }
  
  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

/**
 * Download an AudioBuffer as a WAV file
 */
export function downloadAudioAsWav(
  buffer: AudioBuffer, 
  filename: string,
  options?: { bitDepth?: 16 | 24 | 32; normalize?: boolean }
): void {
  const blob = audioBufferToWav(buffer, options);
  downloadBlob(blob, filename);
}

/**
 * Download a Blob as a file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Estimate export file size in bytes
 */
export function estimateFileSize(
  durationSec: number,
  sampleRate: number,
  numChannels: number,
  bitDepth: 16 | 24 | 32
): number {
  const bytesPerSample = bitDepth / 8;
  const dataSize = Math.ceil(durationSec * sampleRate * numChannels * bytesPerSample);
  return dataSize + 44; // WAV header
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Format duration for display
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
