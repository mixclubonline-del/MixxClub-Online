export const useAudioWaveform = (audioFileId?: string) => {
  return {
    waveformData: null,
    isPlaying: false,
    progress: 0,
    play: async () => {},
    pause: () => {},
  };
};
