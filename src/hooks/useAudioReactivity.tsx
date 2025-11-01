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
      // Enhanced simulation with more natural patterns
      const time = Date.now() / 1000;
      const bass = Math.sin(time * 2) * 50 + 50;
      const mid = Math.sin(time * 3.5) * 40 + 50;
      const high = Math.sin(time * 5) * 30 + 40;
      
      setAudioState({
        isPlaying: Math.random() > 0.2,
        amplitude: (bass + mid + high) / 3,
        frequency: 440 + Math.sin(time) * 200,
        beats: Array.from({ length: 8 }, (_, i) => {
          const bandFreq = (i + 1) * 0.5;
          return Math.abs(Math.sin(time * bandFreq)) * 100;
        })
      });
    }
  }, [options]);

  useEffect(() => {
    const interval = setInterval(updateAudioState, 50); // 20 FPS for smooth visuals
    return () => clearInterval(interval);
  }, [updateAudioState]);

  return audioState;
};