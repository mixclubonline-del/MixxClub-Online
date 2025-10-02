import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

interface AudioSegment {
  intensity: number;
  audio: HTMLAudioElement;
  analyser: AnalyserNode;
  source: MediaElementAudioSourceNode;
}

export const useWelcomeAudio = (segmentCount: number) => {
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [currentSegment, setCurrentSegment] = useState(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSegmentsRef = useRef<AudioSegment[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);
  const audioDataRef = useRef<Uint8Array>(new Uint8Array(128));
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio context
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
    }
  }, []);

  // Load audio file and create analyzer
  const loadAudioFile = useCallback(async (intensity: number): Promise<AudioSegment> => {
    const ctx = audioContextRef.current!;
    
    // Create audio element
    const audio = new Audio(`/audio/trap-beat-${intensity}.mp3`);
    audio.loop = true;
    audio.crossOrigin = 'anonymous';
    
    // Create analyser
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    
    // Create source from audio element
    const source = ctx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(gainNodeRef.current!);
    
    // Preload audio
    await new Promise<void>((resolve, reject) => {
      audio.addEventListener('canplaythrough', () => resolve(), { once: true });
      audio.addEventListener('error', reject, { once: true });
      audio.load();
    });

    return {
      intensity,
      audio,
      analyser,
      source
    };
  }, []);

  // Crossfade between audio segments
  const crossfadeToSegment = useCallback((fromAudio: HTMLAudioElement | null, toAudio: HTMLAudioElement, duration: number = 500) => {
    const steps = 20;
    const stepDuration = duration / steps;
    let step = 0;

    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }

    // Start new audio at 0 volume
    toAudio.volume = 0;
    toAudio.play().catch(console.error);

    fadeIntervalRef.current = setInterval(() => {
      step++;
      const progress = step / steps;

      // Fade out old audio
      if (fromAudio) {
        fromAudio.volume = Math.max(0, 1 - progress) * (isMuted ? 0 : volume);
      }

      // Fade in new audio
      toAudio.volume = progress * (isMuted ? 0 : volume);

      if (step >= steps) {
        if (fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current);
        }
        if (fromAudio) {
          fromAudio.pause();
          fromAudio.currentTime = 0;
        }
      }
    }, stepDuration);
  }, [volume, isMuted]);

  // Request audio permission and load audio files
  const enableAudio = useCallback(async () => {
    setIsLoading(true);
    
    try {
      initAudioContext();
      
      toast.loading('Loading trap beats...', { id: 'beats' });
      
      // Load audio files for each intensity level
      const segments: AudioSegment[] = [];
      for (let i = 1; i <= segmentCount; i++) {
        try {
          const segment = await loadAudioFile(i);
          segments.push(segment);
        } catch (error) {
          console.error(`Failed to load trap-beat-${i}.mp3:`, error);
          toast.error(`Missing audio file: trap-beat-${i}.mp3. Please add audio files to /public/audio/`);
          throw error;
        }
      }

      audioSegmentsRef.current = segments;
      setIsAudioEnabled(true);
      
      toast.success('🔥 Trap beats loaded!', { id: 'beats' });
      
    } catch (error) {
      console.error('Error loading audio:', error);
      toast.error('Failed to load audio files');
    } finally {
      setIsLoading(false);
    }
  }, [segmentCount, initAudioContext, loadAudioFile]);

  // Play segment with crossfade
  const playSegment = useCallback(async (segmentIndex: number) => {
    if (!audioContextRef.current || !isAudioEnabled) return;

    const segment = audioSegmentsRef.current[segmentIndex];
    if (!segment) return;

    // Crossfade from current audio to new segment
    crossfadeToSegment(currentAudioRef.current, segment.audio);
    currentAudioRef.current = segment.audio;
    setCurrentSegment(segmentIndex);
  }, [isAudioEnabled, crossfadeToSegment]);

  // Get audio reactive data
  const getAudioData = useCallback(() => {
    if (!isAudioEnabled || currentSegment >= audioSegmentsRef.current.length) {
      return {
        amplitude: 0,
        frequency: 0,
        beats: Array(8).fill(0),
        isPlaying: false
      };
    }

    const segment = audioSegmentsRef.current[currentSegment];
    if (!segment?.analyser) {
      return {
        amplitude: 0,
        frequency: 0,
        beats: Array(8).fill(0),
        isPlaying: false
      };
    }

    segment.analyser.getByteFrequencyData(audioDataRef.current);
    
    // Calculate metrics
    const amplitude = audioDataRef.current.reduce((sum, val) => sum + val, 0) / audioDataRef.current.length;
    const lowFreq = audioDataRef.current.slice(0, 32).reduce((sum, val) => sum + val, 0) / 32;
    const beats = Array.from({ length: 8 }, (_, i) => {
      const start = i * 16;
      const slice = audioDataRef.current.slice(start, start + 16);
      return slice.reduce((sum, val) => sum + val, 0) / 16;
    });

    return {
      amplitude,
      frequency: lowFreq * 100,
      beats,
      isPlaying: true
    };
  }, [isAudioEnabled, currentSegment]);

  // Update volume for current audio
  useEffect(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
      // Stop all audio segments
      audioSegmentsRef.current.forEach(segment => {
        segment.audio.pause();
        segment.audio.currentTime = 0;
      });
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    isAudioEnabled,
    isLoading,
    volume,
    isMuted,
    enableAudio,
    playSegment,
    getAudioData,
    setVolume,
    setIsMuted: (muted: boolean) => setIsMuted(muted),
  };
};
