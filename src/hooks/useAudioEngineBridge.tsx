import { useEffect, useRef } from 'react';
import { useAIStudioStore } from '@/stores/aiStudioStore';
import { audioEngine } from '@/services/audioEngine';

/**
 * Bridge between React state and audioEngine singleton
 * Syncs zustand store with the real Web Audio API engine
 */
export const useAudioEngineBridge = () => {
  const trackedEngineTracksRef = useRef<Set<string>>(new Set());
  const animationFrameRef = useRef<number | null>(null);
  const lastPausedTimeRef = useRef(0);
  
  const { 
    tracks, 
    isPlaying, 
    currentTime, 
    masterVolume,
    setCurrentTime 
  } = useAIStudioStore();

  // Initialize engine
  useEffect(() => {
    audioEngine.resume();
  }, []);

  // Sync master volume
  useEffect(() => {
    audioEngine.setMasterGain(masterVolume);
  }, [masterVolume]);

  // Sync tracks (create/remove)
  useEffect(() => {
    const storeTrackIds = new Set(tracks.map(t => t.id));
    const engineTrackIds = new Set(audioEngine.tracks.keys());

    // Remove deleted tracks from engine
    for (const id of engineTrackIds) {
      if (!storeTrackIds.has(id)) {
        audioEngine.removeTrack(id);
        trackedEngineTracksRef.current.delete(id);
      }
    }

    // Add new tracks to engine
    for (const track of tracks) {
      if (!trackedEngineTracksRef.current.has(track.id)) {
        audioEngine.createTrack({
          id: track.id,
          name: track.name,
          buffer: track.audioBuffer ?? null,
          groupId: track.busGroupId
        });
        trackedEngineTracksRef.current.add(track.id);
      }
    }
  }, [tracks]);

  // Sync track parameters (volume, pan, mute, solo, sends, effects)
  useEffect(() => {
    tracks.forEach(track => {
      const engineTrack = audioEngine.tracks.get(track.id);
      if (!engineTrack) return;

      // Volume
      audioEngine.setTrackGain(track.id, track.volume);
      
      // Pan
      audioEngine.setTrackPan(track.id, track.pan);
      
      // Mute (via gain)
      if (track.mute) {
        audioEngine.setTrackGain(track.id, 0);
      }
      
      // Solo (mute all others)
      const hasSolo = tracks.some(t => t.solo);
      if (hasSolo && !track.solo) {
        audioEngine.setTrackGain(track.id, 0);
      }

      // Sends
      if (track.sends) {
        Object.entries(track.sends).forEach(([busId, send]) => {
          audioEngine.setSendLevel(track.id, busId, send.amount);
        });
      }

      // Effects (sync plugin chain)
      const currentPlugins = engineTrack.plugins.map(p => p.type);
      const desiredEffects = (track.effects || []).map(e => 
        e.type.toUpperCase() as any
      );
      
      // Remove plugins not in store
      engineTrack.plugins.forEach(p => {
        if (!desiredEffects.includes(p.type)) {
          audioEngine.removePlugin(track.id, p.id);
        }
      });
      
      // Add missing plugins
      desiredEffects.forEach(type => {
        if (!currentPlugins.includes(type)) {
          audioEngine.addPlugin(track.id, { type });
        }
      });
    });
  }, [tracks]);

  // Handle playback state
  useEffect(() => {
    if (isPlaying) {
      audioEngine.play(currentTime);
    } else {
      audioEngine.pause();
    }
  }, [isPlaying, currentTime]);

  // Sync currentTime (read from engine during playback)
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const updateTime = () => {
      const pos = audioEngine.getPlaybackPosition();
      setCurrentTime(pos);
      animationFrameRef.current = requestAnimationFrame(updateTime);
    };
    
    animationFrameRef.current = requestAnimationFrame(updateTime);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, setCurrentTime]);

  // Detect seeks while paused
  useEffect(() => {
    if (!isPlaying && currentTime !== lastPausedTimeRef.current) {
      audioEngine.pausedAt = currentTime;
      lastPausedTimeRef.current = currentTime;
    }
  }, [currentTime, isPlaying]);

  // Audio metering loop
  useEffect(() => {
    const meteringLoop = () => {
      // Update track levels
      tracks.forEach(track => {
        const analyser = audioEngine.getTrackPostAnalyser(track.id);
        if (!analyser) return;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteTimeDomainData(dataArray);
        
        let sum = 0;
        let peak = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const normalized = (dataArray[i] - 128) / 128;
          const abs = Math.abs(normalized);
          sum += abs * abs;
          peak = Math.max(peak, abs);
        }
        
        const rms = Math.sqrt(sum / dataArray.length);
        const peakDb = peak > 0 ? 20 * Math.log10(peak) : -Infinity;
        const rmsDb = rms > 0 ? 20 * Math.log10(rms) : -Infinity;
        
        // Update store
        useAIStudioStore.getState().updateTrack(track.id, {
          peakLevel: peakDb,
          rmsLevel: rmsDb
        });
      });

      // Update master levels
      const masterAnalyser = audioEngine.getMasterAnalyser();
      const masterData = new Uint8Array(masterAnalyser.frequencyBinCount);
      masterAnalyser.getByteTimeDomainData(masterData);
      
      let masterPeak = 0;
      for (let i = 0; i < masterData.length; i++) {
        const normalized = Math.abs((masterData[i] - 128) / 128);
        masterPeak = Math.max(masterPeak, normalized);
      }
      
      const masterPeakDb = masterPeak > 0 ? 20 * Math.log10(masterPeak) : -Infinity;
      useAIStudioStore.getState().updateMasterLevels(masterPeakDb);
      
      animationFrameRef.current = requestAnimationFrame(meteringLoop);
    };
    
    animationFrameRef.current = requestAnimationFrame(meteringLoop);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [tracks]);

  return {
    audioContext: audioEngine.ctx,
    isReady: audioEngine.ctx.state === 'running',
  };
};
