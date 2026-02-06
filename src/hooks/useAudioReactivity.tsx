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

/**
 * Audio reactivity hook - stable idle state when not playing
 * Follows Live Data First doctrine - no Math.random() for data values
 */
export const useAudioReactivity = (options?: UseAudioReactivityOptions) => {
  // Stable idle state - no random fluctuation
  const idleState: AudioReactivityState = {
    isPlaying: false,
    amplitude: 0,
    frequency: 440, // Standard A4 pitch
    beats: Array(8).fill(20), // Flat idle bars
  };

  const [audioState, setAudioState] = useState<AudioReactivityState>(idleState);

  const updateAudioState = useCallback(() => {
    if (options?.audioDataCallback) {
      // Use real audio data from callback
      const realData = options.audioDataCallback();
      setAudioState(realData);
    } else if (options?.simulationMode === true) {
      // Only simulate if explicitly enabled - using deterministic patterns
      const time = Date.now() / 1000;
      const bass = Math.sin(time * 2) * 50 + 50;
      const mid = Math.sin(time * 3.5) * 40 + 50;
      const high = Math.sin(time * 5) * 30 + 40;
      
      setAudioState({
        isPlaying: true,
        amplitude: (bass + mid + high) / 3,
        frequency: 440 + Math.sin(time) * 200,
        beats: Array.from({ length: 8 }, (_, i) => {
          const bandFreq = (i + 1) * 0.5;
          return Math.abs(Math.sin(time * bandFreq)) * 100;
        })
      });
    } else {
      // Default: stable idle state, no simulation
      setAudioState(idleState);
    }
  }, [options]);

  useEffect(() => {
    // Only run interval if there's a callback or simulation is enabled
    if (options?.audioDataCallback || options?.simulationMode === true) {
      const interval = setInterval(updateAudioState, 50); // 20 FPS for smooth visuals
      return () => clearInterval(interval);
    }
    // Otherwise just set idle state once
    setAudioState(idleState);
  }, [updateAudioState, options?.audioDataCallback, options?.simulationMode]);

  return audioState;
};