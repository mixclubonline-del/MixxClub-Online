import { useEffect, useRef } from 'react';
import { useAIStudioStore } from '@/stores/aiStudioStore';

/**
 * Bridge between React state and Web Audio API for real-time audio playback
 * Handles audio buffer playback, scheduling, and synchronization
 */
export const useAudioEngineBridge = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodesRef = useRef<Map<string, AudioBufferSourceNode>>(new Map());
  const gainNodesRef = useRef<Map<string, GainNode>>(new Map());
  const masterGainRef = useRef<GainNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  const { 
    tracks, 
    isPlaying, 
    currentTime, 
    masterVolume,
    setCurrentTime 
  } = useAIStudioStore();

  // Initialize Audio Context
  useEffect(() => {
    const initAudio = async () => {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Create master gain node
        masterGainRef.current = audioContextRef.current.createGain();
        masterGainRef.current.connect(audioContextRef.current.destination);
        masterGainRef.current.gain.value = masterVolume;
        
        console.log('[AudioEngine] Initialized successfully');
      } catch (error) {
        console.error('[AudioEngine] Failed to initialize:', error);
      }
    };
    
    initAudio();
    
    return () => {
      // Cleanup
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Update master volume
  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = masterVolume;
    }
  }, [masterVolume]);

  // Update track volumes
  useEffect(() => {
    tracks.forEach(track => {
      const gainNode = gainNodesRef.current.get(track.id);
      if (gainNode) {
        const effectiveVolume = track.mute ? 0 : track.volume;
        gainNode.gain.value = effectiveVolume;
      }
    });
  }, [tracks]);

  // Stop all audio sources
  const stopAllSources = () => {
    sourceNodesRef.current.forEach((source, trackId) => {
      try {
        source.stop();
        source.disconnect();
      } catch (e) {
        // Source might already be stopped
      }
    });
    sourceNodesRef.current.clear();
    gainNodesRef.current.clear();
  };

  // Start playback from current time
  const startPlayback = (startTime: number) => {
    if (!audioContextRef.current || !masterGainRef.current) {
      console.warn('[AudioEngine] Audio context not initialized');
      return;
    }

    const audioContext = audioContextRef.current;
    const now = audioContext.currentTime;

    // Stop any existing sources
    stopAllSources();

    console.log('[AudioEngine] Starting playback from', startTime, 'seconds');

    // Create source nodes for each track with audio
    tracks.forEach(track => {
      // Skip if muted or no audio buffer
      if (!track.audioBuffer || track.mute) return;

      // Check if any regions exist and have audio
      const hasAudioRegions = track.regions && track.regions.length > 0;
      if (!hasAudioRegions && !track.audioBuffer) return;

      try {
        // Create gain node for this track
        const gainNode = audioContext.createGain();
        gainNode.gain.value = track.volume;
        gainNode.connect(masterGainRef.current!);
        gainNodesRef.current.set(track.id, gainNode);

        // Play all regions in this track
        if (hasAudioRegions) {
          track.regions.forEach((region, regionIndex) => {
            const regionBuffer = region.audioBuffer || track.audioBuffer;
            if (!regionBuffer) return;

            // Skip if region ends before current time
            if (region.start + region.duration < startTime) return;

            // Create source node
            const source = audioContext.createBufferSource();
            source.buffer = regionBuffer;
            source.connect(gainNode);

            // Calculate when to start this region
            const regionStartTime = region.start;
            const offsetIntoRegion = Math.max(0, startTime - regionStartTime);
            const whenToStart = now + Math.max(0, regionStartTime - startTime);

            // Schedule playback
            if (offsetIntoRegion < region.duration) {
              source.start(whenToStart, offsetIntoRegion, region.duration - offsetIntoRegion);
              sourceNodesRef.current.set(`${track.id}-region-${regionIndex}`, source);
            }
          });
        } else if (track.audioBuffer) {
          // Play the entire track buffer if no regions
          const source = audioContext.createBufferSource();
          source.buffer = track.audioBuffer;
          source.connect(gainNode);
          source.start(now, startTime);
          sourceNodesRef.current.set(track.id, source);
        }
      } catch (error) {
        console.error(`[AudioEngine] Error playing track ${track.name}:`, error);
      }
    });

    // Store when we started
    startTimeRef.current = now - startTime;

    // Update current time via animation frame
    const updateTime = () => {
      if (audioContextRef.current && isPlaying) {
        const elapsed = audioContextRef.current.currentTime - startTimeRef.current;
        setCurrentTime(elapsed);
        animationFrameRef.current = requestAnimationFrame(updateTime);
      }
    };
    animationFrameRef.current = requestAnimationFrame(updateTime);
  };

  // Handle playback state changes
  useEffect(() => {
    if (isPlaying) {
      pauseTimeRef.current = currentTime;
      startPlayback(currentTime);
    } else {
      // Pause playback
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      stopAllSources();
    }
  }, [isPlaying]);

  // Handle seek/time changes when not playing
  useEffect(() => {
    if (!isPlaying) {
      pauseTimeRef.current = currentTime;
    }
  }, [currentTime, isPlaying]);

  return {
    audioContext: audioContextRef.current,
    isReady: !!audioContextRef.current,
  };
};
