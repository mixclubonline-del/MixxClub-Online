import { useEffect, useState, useCallback } from 'react';

interface AudioReactivityState {
  isPlaying: boolean;
  amplitude: number;
  frequency: number;
  beats: number[];
}

interface UseAudioReactivityOptions {
  audioDataCallback?: () => AudioReactivityState;
  simulationMode?: boolean;
}

export const useAudioReactivity = (options?: UseAudioReactivityOptions) => {
  const [audioState, setAudioState] = useState<AudioReactivityState>({
    isPlaying: false,
    amplitude: 0,
    frequency: 0,
    beats: []
  });

  const updateAudioState = useCallback(() => {
    if (options?.audioDataCallback) {
      // Use real audio data from callback
      const realData = options.audioDataCallback();
      setAudioState(realData);
    } else if (options?.simulationMode !== false) {
      // Fallback to simulation mode
      setAudioState({
        isPlaying: Math.random() > 0.3,
        amplitude: Math.random() * 100,
        frequency: Math.random() * 20000,
        beats: Array.from({ length: 8 }, () => Math.random() * 100)
      });
    }
  }, [options]);

  useEffect(() => {
    const interval = setInterval(updateAudioState, 50); // 20 FPS for smooth visuals
    return () => clearInterval(interval);
  }, [updateAudioState]);

  return audioState;
};