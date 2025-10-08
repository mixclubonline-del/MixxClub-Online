import { useEffect, useRef } from 'react';
import { useAIStudioStore } from '@/stores/aiStudioStore';

interface AudioBufferMap {
  [trackId: string]: {
    buffer: AudioBuffer;
    source?: AudioBufferSourceNode;
    gainNode?: GainNode;
    panNode?: StereoPannerNode;
  };
}

export const useAudioPlaybackSync = (audioContext: AudioContext | null) => {
  const audioBuffersRef = useRef<AudioBufferMap>({});
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);

  const {
    isPlaying,
    currentTime,
    duration,
    loopEnabled,
    loopStart,
    loopEnd,
    tracks,
    setCurrentTime,
    setPlaying,
    updateTrack,
    updateMasterLevels,
  } = useAIStudioStore();

  // Store audio buffers for tracks
  const setTrackBuffer = (trackId: string, buffer: AudioBuffer) => {
    audioBuffersRef.current[trackId] = {
      ...audioBuffersRef.current[trackId],
      buffer,
    };
  };

  // Stop all playing audio
  const stopAllAudio = () => {
    Object.values(audioBuffersRef.current).forEach((track) => {
      if (track.source) {
        try {
          track.source.stop();
          track.source.disconnect();
        } catch (e) {
          // Already stopped
        }
        track.source = undefined;
      }
    });
  };

  // Start playback from current time
  const startPlayback = () => {
    if (!audioContext) return;

    stopAllAudio();
    startTimeRef.current = audioContext.currentTime - pauseTimeRef.current;

    tracks.forEach((track) => {
      if (track.mute || !audioBuffersRef.current[track.id]?.buffer) return;

      const trackData = audioBuffersRef.current[track.id];
      const source = audioContext.createBufferSource();
      source.buffer = trackData.buffer;

      // Create or reuse gain and pan nodes
      if (!trackData.gainNode) {
        trackData.gainNode = audioContext.createGain();
      }
      if (!trackData.panNode) {
        trackData.panNode = audioContext.createStereoPanner();
      }

      // Set levels
      trackData.gainNode.gain.value = track.volume * (track.solo ? 1 : 1);
      trackData.panNode.pan.value = track.pan;

      // Connect nodes
      source.connect(trackData.gainNode);
      trackData.gainNode.connect(trackData.panNode);
      trackData.panNode.connect(audioContext.destination);

      // Start playback from current position
      const offset = pauseTimeRef.current;
      source.start(0, offset);
      trackData.source = source;

      // Handle end of buffer
      source.onended = () => {
        if (loopEnabled && isPlaying) {
          pauseTimeRef.current = loopStart;
          startPlayback();
        } else if (!loopEnabled) {
          setPlaying(false);
        }
      };
    });
  };

  // Update track levels in real-time
  const updateTrackLevels = () => {
    tracks.forEach((track) => {
      const trackData = audioBuffersRef.current[track.id];
      if (!trackData || !trackData.buffer) return;

      // Simulate RMS and peak levels based on volume and playback
      const baseLevel = track.volume * 0.7;
      const variance = Math.random() * 0.2;
      const rmsLevel = Math.min(0.95, baseLevel + variance);
      const peakLevel = Math.min(1.0, rmsLevel + 0.1);

      updateTrack(track.id, {
        rmsLevel: track.mute ? 0 : rmsLevel,
        peakLevel: track.mute ? 0 : peakLevel,
      });
    });

    // Update master levels (average of all unmuted tracks)
    const unmutedTracks = tracks.filter((t) => !t.mute);
    if (unmutedTracks.length > 0) {
      const avgPeak =
        unmutedTracks.reduce((sum, t) => sum + (t.peakLevel || 0), 0) /
        unmutedTracks.length;
      updateMasterLevels(avgPeak);
    }
  };

  // Playback loop - sync currentTime with audio
  useEffect(() => {
    if (!isPlaying || !audioContext) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const animate = () => {
      const elapsed = audioContext.currentTime - startTimeRef.current;
      let newTime = elapsed;

      // Handle looping
      if (loopEnabled) {
        if (newTime >= loopEnd) {
          pauseTimeRef.current = loopStart;
          startPlayback();
          return;
        }
      } else if (newTime >= duration) {
        setPlaying(false);
        setCurrentTime(duration);
        return;
      }

      setCurrentTime(newTime);
      updateTrackLevels();

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, audioContext, duration, loopEnabled, loopStart, loopEnd]);

  // Handle play/pause
  useEffect(() => {
    if (!audioContext) return;

    if (isPlaying) {
      pauseTimeRef.current = currentTime;
      startPlayback();
    } else {
      stopAllAudio();
      pauseTimeRef.current = currentTime;
    }

    return () => {
      stopAllAudio();
    };
  }, [isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  return {
    setTrackBuffer,
    stopAllAudio,
  };
};
