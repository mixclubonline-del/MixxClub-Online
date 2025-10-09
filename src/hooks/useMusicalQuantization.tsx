import { useCallback } from 'react';
import { useAIStudioStore } from '@/stores/aiStudioStore';

/**
 * Hook for musical quantization with bars/beats/subdivisions
 */
export const useMusicalQuantization = () => {
  const bpm = useAIStudioStore((state) => state.bpm);
  const snapMode = useAIStudioStore((state) => state.snapMode);
  const snapEnabled = useAIStudioStore((state) => state.snapEnabled);

  const quantizeTime = useCallback(
    (time: number): number => {
      if (!snapEnabled) return time;

      const secondsPerBeat = 60 / bpm;
      
      let quantizeDivision: number;
      switch (snapMode) {
        case 'bars':
          quantizeDivision = secondsPerBeat * 4; // 4 beats per bar
          break;
        case 'beats':
          quantizeDivision = secondsPerBeat;
          break;
        case 'quarter':
          quantizeDivision = secondsPerBeat; // Quarter note = 1 beat
          break;
        case 'eighth':
          quantizeDivision = secondsPerBeat / 2;
          break;
        case 'sixteenth':
          quantizeDivision = secondsPerBeat / 4;
          break;
        default:
          quantizeDivision = secondsPerBeat;
      }

      return Math.round(time / quantizeDivision) * quantizeDivision;
    },
    [bpm, snapMode, snapEnabled]
  );

  const getSnapLabel = useCallback((): string => {
    if (!snapEnabled) return 'Off';
    
    switch (snapMode) {
      case 'bars':
        return 'Bars';
      case 'beats':
        return 'Beats';
      case 'quarter':
        return '1/4';
      case 'eighth':
        return '1/8';
      case 'sixteenth':
        return '1/16';
      default:
        return 'Beats';
    }
  }, [snapMode, snapEnabled]);

  const getQuantizeInterval = useCallback((): number => {
    const secondsPerBeat = 60 / bpm;
    
    switch (snapMode) {
      case 'bars':
        return secondsPerBeat * 4;
      case 'beats':
        return secondsPerBeat;
      case 'quarter':
        return secondsPerBeat;
      case 'eighth':
        return secondsPerBeat / 2;
      case 'sixteenth':
        return secondsPerBeat / 4;
      default:
        return secondsPerBeat;
    }
  }, [bpm, snapMode]);

  return {
    quantizeTime,
    getSnapLabel,
    getQuantizeInterval,
  };
};
