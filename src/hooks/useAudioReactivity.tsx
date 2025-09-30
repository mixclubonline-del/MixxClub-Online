import { useEffect, useState } from 'react';

interface AudioReactivityState {
  isPlaying: boolean;
  amplitude: number;
  frequency: number;
  beats: number[];
}

export const useAudioReactivity = () => {
  const [audioState, setAudioState] = useState<AudioReactivityState>({
    isPlaying: false,
    amplitude: 0,
    frequency: 0,
    beats: []
  });

  useEffect(() => {
    // Simulate audio reactivity - in a real app this would connect to actual audio analysis
    const interval = setInterval(() => {
      setAudioState(prev => ({
        isPlaying: Math.random() > 0.3, // 70% chance of "audio playing"
        amplitude: Math.random() * 100,
        frequency: Math.random() * 20000,
        beats: Array.from({ length: 8 }, () => Math.random() * 100)
      }));
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return audioState;
};