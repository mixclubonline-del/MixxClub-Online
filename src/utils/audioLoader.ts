import { supabase } from '@/integrations/supabase/client';

export interface AudioBufferData {
  buffer: AudioBuffer;
  waveformPeaks: number[];
  duration: number;
}

/**
 * Load and decode audio file from Supabase storage
 */
export async function loadAudioFromSupabase(
  bucket: string,
  path: string,
  audioContext: AudioContext
): Promise<AudioBufferData> {
  // Download the file
  const { data, error } = await supabase.storage
    .from(bucket)
    .download(path);

  if (error) {
    throw new Error(`Failed to download audio: ${error.message}`);
  }

  // Convert blob to array buffer
  const arrayBuffer = await data.arrayBuffer();

  // Decode audio data
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  // Generate waveform peaks for visualization
  const waveformPeaks = buildWaveformPeaks(audioBuffer, 200);

  return {
    buffer: audioBuffer,
    waveformPeaks,
    duration: audioBuffer.duration,
  };
}

/**
 * Build waveform peaks from audio buffer for visualization
 */
export function buildWaveformPeaks(
  audioBuffer: AudioBuffer,
  numPeaks: number = 200
): number[] {
  const channelData = audioBuffer.getChannelData(0);
  const samplesPerPeak = Math.floor(channelData.length / numPeaks);
  const peaks: number[] = [];

  for (let i = 0; i < numPeaks; i++) {
    const start = i * samplesPerPeak;
    const end = start + samplesPerPeak;
    let max = 0;

    for (let j = start; j < end && j < channelData.length; j++) {
      const abs = Math.abs(channelData[j]);
      if (abs > max) max = abs;
    }

    peaks.push(max);
  }

  return peaks;
}

/**
 * Get audio file URL from Supabase storage (for direct playback with Audio element)
 */
export async function getAudioUrl(bucket: string, path: string): Promise<string> {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return data.publicUrl;
}
