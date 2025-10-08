import { useEffect, useRef, useState } from 'react';
import { Track } from '@/stores/aiStudioStore';

export const useAudioEngine = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const trackNodesRef = useRef<Map<string, { gain: GainNode; pan: StereoPannerNode }>>(new Map());
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize Audio Context
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      masterGainRef.current = audioContextRef.current.createGain();
      masterGainRef.current.connect(audioContextRef.current.destination);
      setIsInitialized(true);
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const createTrackNodes = (trackId: string) => {
    if (!audioContextRef.current || !masterGainRef.current) return null;

    const gainNode = audioContextRef.current.createGain();
    const panNode = audioContextRef.current.createStereoPanner();

    gainNode.connect(panNode);
    panNode.connect(masterGainRef.current);

    const nodes = { gain: gainNode, pan: panNode };
    trackNodesRef.current.set(trackId, nodes);

    return nodes;
  };

  const updateTrackVolume = (trackId: string, volume: number) => {
    const nodes = trackNodesRef.current.get(trackId);
    if (nodes) {
      nodes.gain.gain.setValueAtTime(volume, audioContextRef.current!.currentTime);
    }
  };

  const updateTrackPan = (trackId: string, pan: number) => {
    const nodes = trackNodesRef.current.get(trackId);
    if (nodes) {
      nodes.pan.pan.setValueAtTime(pan, audioContextRef.current!.currentTime);
    }
  };

  const updateMasterVolume = (volume: number) => {
    if (masterGainRef.current && audioContextRef.current) {
      masterGainRef.current.gain.setValueAtTime(volume, audioContextRef.current.currentTime);
    }
  };

  const playTrack = async (track: Track) => {
    if (!audioContextRef.current || !track.audioBuffer) return;

    const nodes = trackNodesRef.current.get(track.id) || createTrackNodes(track.id);
    if (!nodes) return;

    const source = audioContextRef.current.createBufferSource();
    source.buffer = track.audioBuffer;
    source.connect(nodes.gain);

    // Apply current track settings
    nodes.gain.gain.value = track.volume;
    nodes.pan.pan.value = track.pan;

    source.start();
    return source;
  };

  const stopAllTracks = () => {
    // Stop all active sources (would need to track them in a separate ref)
  };

  return {
    audioContext: audioContextRef.current,
    isInitialized,
    createTrackNodes,
    updateTrackVolume,
    updateTrackPan,
    updateMasterVolume,
    playTrack,
    stopAllTracks
  };
};
