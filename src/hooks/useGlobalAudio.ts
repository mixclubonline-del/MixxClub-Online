import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AudioData {
  amplitude: number;
  frequency: number[];
  beat: boolean;
}

interface GlobalAudioState {
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  isLoading: boolean;
  duration: number;
  currentTime: number;
  audioData: AudioData | null;
}

const STORAGE_KEY = 'mixxclub_audio_prefs';
const THEME_SONG_PATH = 'audio-files/uploads/1764786509897-m8ucjp.mp3';

export function useGlobalAudio() {
  const [state, setState] = useState<GlobalAudioState>({
    isPlaying: false,
    volume: 0.5,
    isMuted: false,
    isLoading: true,
    duration: 0,
    currentTime: 0,
    audioData: null,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationRef = useRef<number | null>(null);

  // Load saved preferences
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const prefs = JSON.parse(saved);
        setState(prev => ({
          ...prev,
          volume: prefs.volume ?? 0.5,
          isMuted: prefs.isMuted ?? false,
        }));
      }
    } catch (e) {
      console.warn('Failed to load audio preferences:', e);
    }
  }, []);

  // Save preferences
  const savePreferences = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        volume: state.volume,
        isMuted: state.isMuted,
      }));
    } catch (e) {
      console.warn('Failed to save audio preferences:', e);
    }
  }, [state.volume, state.isMuted]);

  useEffect(() => {
    savePreferences();
  }, [state.volume, state.isMuted, savePreferences]);

  // Initialize audio
  useEffect(() => {
    const initAudio = async () => {
      try {
        const { data } = supabase.storage.from('audio-files').getPublicUrl(THEME_SONG_PATH.replace('audio-files/', ''));
        
        if (!data?.publicUrl) {
          console.error('Failed to get theme song URL');
          setState(prev => ({ ...prev, isLoading: false }));
          return;
        }

        const audio = new Audio(data.publicUrl);
        audio.loop = true;
        audio.preload = 'auto';
        audio.crossOrigin = 'anonymous';
        
        audio.addEventListener('loadedmetadata', () => {
          setState(prev => ({ ...prev, duration: audio.duration, isLoading: false }));
        });

        audio.addEventListener('timeupdate', () => {
          setState(prev => ({ ...prev, currentTime: audio.currentTime }));
        });

        audio.addEventListener('ended', () => {
          // Loop is enabled, but just in case
          audio.currentTime = 0;
          audio.play();
        });

        audio.addEventListener('error', (e) => {
          console.error('Audio error:', e);
          setState(prev => ({ ...prev, isLoading: false }));
        });

        audioRef.current = audio;
      } catch (error) {
        console.error('Failed to initialize audio:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initAudio();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Setup audio analyser for visualizations
  const setupAnalyser = useCallback(() => {
    if (!audioRef.current || analyserRef.current) return;

    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = ctx.createMediaElementSource(audioRef.current);
      sourceRef.current = source;
      
      source.connect(analyser);
      analyser.connect(ctx.destination);
    } catch (e) {
      console.warn('Failed to setup audio analyser:', e);
    }
  }, []);

  // Get audio data for visualizations
  const getAudioData = useCallback((): AudioData | null => {
    if (!analyserRef.current) return null;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    const amplitude = dataArray.reduce((a, b) => a + b, 0) / bufferLength / 255;
    const frequency = Array.from(dataArray.slice(0, 32)).map(v => v / 255);
    
    // Simple beat detection
    const bassAvg = dataArray.slice(0, 4).reduce((a, b) => a + b, 0) / 4;
    const beat = bassAvg > 180;

    return { amplitude, frequency, beat };
  }, []);

  // Animation loop for audio data
  const startAudioDataLoop = useCallback(() => {
    const update = () => {
      const data = getAudioData();
      if (data) {
        setState(prev => ({ ...prev, audioData: data }));
      }
      animationRef.current = requestAnimationFrame(update);
    };
    update();
  }, [getAudioData]);

  const stopAudioDataLoop = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  // Play/Pause controls
  const play = useCallback(async () => {
    if (!audioRef.current) return;

    try {
      // Resume audio context if suspended
      if (audioContextRef.current?.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      // Setup analyser on first play (requires user interaction)
      if (!analyserRef.current) {
        setupAnalyser();
      }

      await audioRef.current.play();
      setState(prev => ({ ...prev, isPlaying: true }));
      startAudioDataLoop();
    } catch (error) {
      console.error('Failed to play audio:', error);
    }
  }, [setupAnalyser, startAudioDataLoop]);

  const pause = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setState(prev => ({ ...prev, isPlaying: false }));
    stopAudioDataLoop();
  }, [stopAudioDataLoop]);

  const toggle = useCallback(() => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [state.isPlaying, play, pause]);

  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
    setState(prev => ({ ...prev, volume: clampedVolume, isMuted: clampedVolume === 0 }));
  }, []);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      const newMuted = !state.isMuted;
      audioRef.current.muted = newMuted;
      setState(prev => ({ ...prev, isMuted: newMuted }));
    }
  }, [state.isMuted]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(time, state.duration));
    }
  }, [state.duration]);

  // Apply volume/mute changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = state.volume;
      audioRef.current.muted = state.isMuted;
    }
  }, [state.volume, state.isMuted]);

  return {
    ...state,
    play,
    pause,
    toggle,
    setVolume,
    toggleMute,
    seek,
    getAudioData,
  };
}
