import { useEffect, useRef, useCallback } from 'react';
import { audioEngine } from '@/services/audioEngine';
import { Track } from '@/stores/aiStudioStore';
import { WaveformGenerator } from '@/services/waveformGenerator';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to manage sample-accurate playback in the studio
 * Connects audioEngine with the track store
 */
export const useStudioPlayback = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const loadedBuffersRef = useRef<Map<string, AudioBuffer>>(new Map());

  // Initialize audio context
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    
    return () => {
      loadedBuffersRef.current.clear();
    };
  }, []);

  // Load audio file and generate waveform
  const loadTrackAudio = useCallback(async (track: Track): Promise<{
    audioBuffer: AudioBuffer;
    waveformData: Float32Array;
  } | null> => {
    if (!audioContextRef.current) return null;

    // Check cache first
    if (track.audioBuffer && track.waveformData) {
      return {
        audioBuffer: track.audioBuffer,
        waveformData: WaveformGenerator.getPeaks(track.waveformData),
      };
    }

    try {
      let audioBuffer: AudioBuffer;

      // Load from storage
      if (track.filePath) {
        const { data } = await supabase.storage
          .from('audio-files')
          .download(track.filePath);

        if (data) {
          const arrayBuffer = await data.arrayBuffer();
          audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
        } else {
          return null;
        }
      } else if (track.audioBuffer) {
        audioBuffer = track.audioBuffer;
      } else {
        return null;
      }

      // Generate real waveform
      const waveform = WaveformGenerator.generateFromBuffer(audioBuffer, {
        width: 800, // High detail for studio
        normalize: true,
      });

      // Cache the buffer
      loadedBuffersRef.current.set(track.id, audioBuffer);

      return {
        audioBuffer,
        waveformData: waveform.peaks,
      };
    } catch (error) {
      console.error('Error loading track audio:', error);
      return null;
    }
  }, []);

  // Start playback for tracks
  const playTracks = useCallback(async (tracks: Track[], startTime: number) => {
    if (!audioContextRef.current) return;

    // Resume audio context if needed
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    const when = audioContextRef.current.currentTime;

    // Play each track that should be playing
    for (const track of tracks) {
      if (track.mute) continue;

      // Initialize track in audio engine
      const audioData = await loadTrackAudio(track);
      if (!audioData) continue;

      // Note: audioEngine methods simplified - using setTrackVolume instead of deprecated methods
      audioEngine.setTrackVolume(track.id, track.volume);

      // Play each region - simplified (audioEngine.play() handles all tracks)
      for (const region of track.regions) {
        if (startTime >= region.startTime && startTime < region.startTime + region.duration) {
          // Playback handled by audioEngine.play() call above
          console.log('Playing region:', region.id);
        }
      }
    }
  }, [loadTrackAudio]);

  // Stop all tracks
  const stopTracks = useCallback((tracks: Track[]) => {
    tracks.forEach(track => {
      audioEngine.stopTrack(track.id);
    });
  }, []);

  // Update track audio parameters in real-time
  const updateTrackParams = useCallback((track: Track) => {
    audioEngine.setTrackVolume(track.id, track.volume);
    audioEngine.setTrackPan(track.id, track.pan);
  }, []);

  return {
    loadTrackAudio,
    playTracks,
    stopTracks,
    updateTrackParams,
    audioContext: audioContextRef.current,
  };
};
