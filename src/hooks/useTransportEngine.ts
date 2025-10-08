import { useEffect, useRef } from 'react';
import { useAIStudioStore } from '@/stores/aiStudioStore';

export const useTransportEngine = () => {
  const { 
    isPlaying, 
    currentTime, 
    duration,
    loopEnabled,
    loopStart,
    loopEnd,
    tempo,
    tracks,
    setCurrentTime,
    setPlaying,
    updateMasterLevels,
    updateTrack
  } = useAIStudioStore();

  const lastTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      lastTimeRef.current = 0;
      return;
    }

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
      }

      const deltaTime = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      // Calculate new time
      let newTime = currentTime + deltaTime;

      // Handle looping
      if (loopEnabled) {
        if (newTime >= loopEnd) {
          newTime = loopStart;
        }
      } else {
        // Stop at end of duration
        if (newTime >= duration) {
          newTime = duration;
          setPlaying(false);
          return;
        }
      }

      setCurrentTime(newTime);

      // Simulate meter levels during playback
      const basePeak = 0.6 + Math.sin(timestamp / 200) * 0.2 + Math.random() * 0.1;
      updateMasterLevels(Math.min(0.95, basePeak));

      // Update track levels
      tracks.forEach((track) => {
        if (!track.mute) {
          const trackPeak = 0.5 + Math.sin(timestamp / 300 + track.id.length) * 0.15 + Math.random() * 0.1;
          const trackRms = trackPeak * 0.7;
          updateTrack(track.id, { 
            peakLevel: Math.min(0.9, trackPeak), 
            rmsLevel: Math.min(0.8, trackRms) 
          });
        }
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, currentTime, duration, loopEnabled, loopStart, loopEnd, tracks, setCurrentTime, setPlaying, updateMasterLevels, updateTrack]);

  return null;
};
