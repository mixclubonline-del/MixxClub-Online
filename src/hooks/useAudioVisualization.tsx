import { useState, useEffect, useCallback } from 'react';

/**
 * Audio visualization hook - stable idle state when not playing
 * Follows Live Data First doctrine - no Math.random() for idle state
 */
export const useAudioVisualization = () => {
  // Stable idle state - flat bars at minimum height
  const idleBars = Array(16).fill(0.15);
  
  const [audioData, setAudioData] = useState<number[]>(idleBars);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) {
      // When not playing, show stable flat bars
      setAudioData(idleBars);
      return;
    }

    // Only animate when playing - using deterministic patterns
    const interval = setInterval(() => {
      const time = Date.now() / 1000;
      const newData = Array.from({ length: 16 }, (_, i) => {
        // Deterministic wave pattern based on time and index
        const wave = Math.sin(time * 3 + i * 0.5) * 0.3 + 0.5;
        return Math.max(0.15, Math.min(1, wave));
      });
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