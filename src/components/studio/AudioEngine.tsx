import { useEffect, useRef } from 'react';
import { useAIStudioStore, AudioAnalysis } from '@/stores/aiStudioStore';

export const AudioEngine = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const { tracks, isPlaying, updateTrack, updateMasterLevels } = useAIStudioStore();

  useEffect(() => {
    // Initialize audio context
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      analyserRef.current.connect(audioContextRef.current.destination);
    }

    return () => {
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close();
      }
    };
  }, []);

  useEffect(() => {
    if (!isPlaying || !analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateLevels = () => {
      if (!analyserRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArray);

      // Calculate RMS and peak
      let sum = 0;
      let peak = 0;
      for (let i = 0; i < bufferLength; i++) {
        const value = dataArray[i] / 255;
        sum += value * value;
        peak = Math.max(peak, value);
      }
      const rms = Math.sqrt(sum / bufferLength);

      // Calculate spectral centroid
      const spectral = Array.from({ length: 8 }, (_, i) => {
        const start = Math.floor((i / 8) * bufferLength);
        const end = Math.floor(((i + 1) / 8) * bufferLength);
        const slice = dataArray.slice(start, end);
        return slice.reduce((a, b) => a + b, 0) / slice.length / 255;
      });

      // Approximate LUFS (simplified)
      const lufs = -23 + (rms * 23);

      const analysis: AudioAnalysis = {
        rms,
        peak,
        spectral,
        lufs
      };

      // Update master levels
      updateMasterLevels(peak);

      // Update track analysis
      tracks.forEach((track) => {
        if (!track.mute) {
          updateTrack(track.id, { 
            analysis,
            peakLevel: peak * track.volume,
            rmsLevel: rms * track.volume
          });
        }
      });
    };

    const intervalId = setInterval(updateLevels, 50);
    return () => clearInterval(intervalId);
  }, [isPlaying, tracks, updateTrack, updateMasterLevels]);

  return null; // This is a background service component
};
