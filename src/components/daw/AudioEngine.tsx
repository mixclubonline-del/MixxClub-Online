import { useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { useAIStudioStore } from '@/stores/aiStudioStore';

/**
 * Real-time audio engine using Tone.js
 * Handles actual audio processing, not just simulation
 */
export const AudioEngine = () => {
  const tracks = useAIStudioStore((state) => state.tracks);
  const isPlaying = useAIStudioStore((state) => state.isPlaying);
  const currentTime = useAIStudioStore((state) => state.currentTime);
  const setCurrentTime = useAIStudioStore((state) => state.setCurrentTime);
  
  const playersRef = useRef<Map<string, Tone.Player>>(new Map());
  const channelsRef = useRef<Map<string, Tone.Channel>>(new Map());
  const masterRef = useRef<Tone.Channel | null>(null);
  const analyzerRef = useRef<Tone.Analyser | null>(null);
  const meterRef = useRef<Tone.Meter | null>(null);

  // Initialize audio context and master channel
  useEffect(() => {
    const initAudio = async () => {
      await Tone.start();
      
      // Create master channel
      const master = new Tone.Channel({
        volume: 0,
        pan: 0,
      }).toDestination();
      
      masterRef.current = master;

      // Create analyzer and meter for master
      const analyzer = new Tone.Analyser('waveform', 1024);
      const meter = new Tone.Meter();
      
      master.connect(analyzer);
      master.connect(meter);
      
      analyzerRef.current = analyzer;
      meterRef.current = meter;
    };

    initAudio();

    return () => {
      // Cleanup
      playersRef.current.forEach(player => player.dispose());
      channelsRef.current.forEach(channel => channel.dispose());
      masterRef.current?.dispose();
      analyzerRef.current?.dispose();
      meterRef.current?.dispose();
    };
  }, []);

  // Update transport state
  useEffect(() => {
    if (isPlaying) {
      Tone.Transport.start();
    } else {
      Tone.Transport.pause();
    }
  }, [isPlaying]);

  // Sync time
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying) {
        setCurrentTime(Tone.Transport.seconds);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying, setCurrentTime]);

  // Update track channels when tracks change
  useEffect(() => {
    tracks.forEach(track => {
      let channel = channelsRef.current.get(track.id);
      
      if (!channel && masterRef.current) {
        // Create new channel for track
        channel = new Tone.Channel({
          volume: Tone.gainToDb(track.volume),
          pan: track.pan,
          mute: track.mute,
          solo: track.solo,
        }).connect(masterRef.current);
        
        channelsRef.current.set(track.id, channel);
      } else if (channel) {
        // Update existing channel
        channel.volume.value = Tone.gainToDb(track.volume);
        channel.pan.value = track.pan;
        channel.mute = track.mute;
        channel.solo = track.solo;
      }

      // Handle audio regions - create players when URLs are available
      track.regions.forEach(region => {
        const playerId = `${track.id}-${region.id}`;
        const player = playersRef.current.get(playerId);

        // Note: In production, regions would have audioUrl property from file uploads
        // This is a placeholder for future audio file implementation
        if (!player && channel) {
          // Placeholder for when audio URLs are available
          // const newPlayer = new Tone.Player({
          //   url: region.audioUrl,
          //   volume: Tone.gainToDb(region.gain || 1),
          //   fadeIn: region.fadeIn?.duration || 0,
          //   fadeOut: region.fadeOut?.duration || 0,
          // }).connect(channel);
          //
          // playersRef.current.set(playerId, newPlayer);
          // newPlayer.sync().start(region.startTime);
        }
      });
    });

    // Remove channels for deleted tracks
    const trackIds = new Set(tracks.map(t => t.id));
    channelsRef.current.forEach((channel, id) => {
      if (!trackIds.has(id)) {
        channel.dispose();
        channelsRef.current.delete(id);
      }
    });

  }, [tracks]);

  // Get real-time audio data for visualizations
  const getWaveformData = () => {
    return analyzerRef.current?.getValue() as Float32Array;
  };

  const getMeterLevel = () => {
    return meterRef.current?.getValue() as number;
  };

  // Expose methods for other components
  useEffect(() => {
    (window as any).audioEngine = {
      getWaveformData,
      getMeterLevel,
      getCurrentTime: () => Tone.Transport.seconds,
      setTempo: (bpm: number) => Tone.Transport.bpm.value = bpm,
      getTempo: () => Tone.Transport.bpm.value,
    };
  }, []);

  return null; // This is a headless component
};
