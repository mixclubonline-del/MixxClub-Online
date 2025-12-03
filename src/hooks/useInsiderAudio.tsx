import { useState, useRef, useCallback, useEffect } from 'react';

interface AudioAnalysis {
  amplitude: number;
  bass: number;
  mid: number;
  high: number;
  beats: number[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}

const AUDIO_URL = 'https://kbbrehnyqpulbxyesril.supabase.co/storage/v1/object/public/audio-files/uploads/1764786509897-m8ucjp.mp3';

export const useInsiderAudio = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [analysis, setAnalysis] = useState<AudioAnalysis>({
    amplitude: 0,
    bass: 0,
    mid: 0,
    high: 0,
    beats: Array(32).fill(0),
    isPlaying: false,
    currentTime: 0,
    duration: 0
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);

  const initAudio = useCallback(async () => {
    if (audioContextRef.current) return;
    
    setIsLoading(true);
    
    try {
      // Create audio context
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create audio element
      const audio = new Audio();
      audio.crossOrigin = 'anonymous';
      audio.src = AUDIO_URL;
      audio.loop = true;
      audioElementRef.current = audio;

      // Wait for audio to load
      await new Promise<void>((resolve, reject) => {
        audio.oncanplaythrough = () => resolve();
        audio.onerror = () => reject(new Error('Failed to load audio'));
        audio.load();
      });

      // Create analyser
      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      // Connect audio element to analyser
      const source = audioContextRef.current.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(audioContextRef.current.destination);
      sourceRef.current = source;

      // Create data array for frequency analysis
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

      setIsReady(true);
    } catch (error) {
      console.error('Error initializing audio:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const analyzeAudio = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current || !audioElementRef.current) return;

    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    const data = dataArrayRef.current;

    // Calculate frequency bands
    const bassEnd = 8;
    const midEnd = 32;
    
    let bassSum = 0;
    let midSum = 0;
    let highSum = 0;
    
    for (let i = 0; i < bassEnd; i++) {
      bassSum += data[i];
    }
    for (let i = bassEnd; i < midEnd; i++) {
      midSum += data[i];
    }
    for (let i = midEnd; i < data.length; i++) {
      highSum += data[i];
    }

    const bass = bassSum / bassEnd;
    const mid = midSum / (midEnd - bassEnd);
    const high = highSum / (data.length - midEnd);
    const amplitude = (bass * 0.5 + mid * 0.3 + high * 0.2);

    // Get 32 frequency bands for visualization
    const beats: number[] = [];
    const bandSize = Math.floor(data.length / 32);
    for (let i = 0; i < 32; i++) {
      let sum = 0;
      for (let j = 0; j < bandSize; j++) {
        sum += data[i * bandSize + j];
      }
      beats.push(sum / bandSize);
    }

    setAnalysis({
      amplitude,
      bass,
      mid,
      high,
      beats,
      isPlaying: !audioElementRef.current.paused,
      currentTime: audioElementRef.current.currentTime,
      duration: audioElementRef.current.duration || 0
    });

    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
  }, []);

  const play = useCallback(async () => {
    if (!audioContextRef.current || !audioElementRef.current) {
      await initAudio();
    }

    if (audioContextRef.current?.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    if (audioElementRef.current) {
      await audioElementRef.current.play();
      setIsPlaying(true);
      analyzeAudio();
    }
  }, [initAudio, analyzeAudio]);

  const pause = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const setVolume = useCallback((volume: number) => {
    if (audioElementRef.current) {
      audioElementRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (audioElementRef.current) {
      audioElementRef.current.currentTime = time;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.src = '';
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    isLoading,
    isReady,
    isPlaying,
    analysis,
    play,
    pause,
    toggle,
    setVolume,
    seek,
    initAudio
  };
};
