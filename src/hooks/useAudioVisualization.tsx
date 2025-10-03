import { useState, useEffect, useCallback } from 'react';

export const useAudioVisualization = () => {
  const [audioData, setAudioData] = useState<number[]>(Array(16).fill(0));
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;

    // Simulate audio data for visualization
    const interval = setInterval(() => {
      const newData = Array.from({ length: 16 }, () => Math.random() * 0.8 + 0.2);
      setAudioData(newData);
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  return {
    audioData,
    isPlaying,
    togglePlay
  };
};