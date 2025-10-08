import { useState, useEffect, useRef } from 'react';

interface FFTData {
  frequencyData: number[];
  timeDomainData: number[];
  bass: number;
  mid: number;
  treble: number;
  amplitude: number;
}

export const useAudioFFT = (isPlaying: boolean) => {
  const [fftData, setFFTData] = useState<FFTData>({
    frequencyData: new Array(32).fill(0),
    timeDomainData: new Array(32).fill(0),
    bass: 0,
    mid: 0,
    treble: 0,
    amplitude: 0
  });

  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const simulate = () => {
      // Simulate FFT data for visualization
      const time = Date.now() / 1000;
      
      const frequencyData = Array.from({ length: 32 }, (_, i) => {
        const freq = i / 32;
        return Math.max(0, Math.sin(time * 2 + freq * 10) * 0.5 + 0.5) * (Math.random() * 0.3 + 0.7);
      });

      const timeDomainData = Array.from({ length: 32 }, (_, i) => {
        return Math.sin(time * 10 + i * 0.5) * 0.5;
      });

      const bass = frequencyData.slice(0, 8).reduce((a, b) => a + b, 0) / 8;
      const mid = frequencyData.slice(8, 20).reduce((a, b) => a + b, 0) / 12;
      const treble = frequencyData.slice(20).reduce((a, b) => a + b, 0) / 12;
      const amplitude = frequencyData.reduce((a, b) => a + b, 0) / 32;

      setFFTData({
        frequencyData,
        timeDomainData,
        bass,
        mid,
        treble,
        amplitude
      });

      animationFrameRef.current = requestAnimationFrame(simulate);
    };

    animationFrameRef.current = requestAnimationFrame(simulate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  return fftData;
};
