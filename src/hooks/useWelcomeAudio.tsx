import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

interface AudioSegment {
  intensity: number;
  oscillators: OscillatorNode[];
  analyser: AnalyserNode;
}

export const useWelcomeAudio = (segmentCount: number) => {
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [currentSegment, setCurrentSegment] = useState(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSegmentsRef = useRef<AudioSegment[]>([]);
  const currentOscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);
  const audioDataRef = useRef<Uint8Array>(new Uint8Array(128));
  const beatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio context
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
    }
  }, []);

  // Generate trap beat using Web Audio API
  const generateTrapBeat = useCallback((intensity: number): AudioSegment => {
    const ctx = audioContextRef.current!;
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.connect(gainNodeRef.current!);

    return {
      intensity,
      oscillators: [],
      analyser
    };
  }, []);

  // Play a kick drum sound
  const playKick = useCallback((intensity: number) => {
    const ctx = audioContextRef.current!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    gain.gain.setValueAtTime(1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    const segment = audioSegmentsRef.current[currentSegment];
    if (segment) {
      osc.connect(gain);
      gain.connect(segment.analyser);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    }
  }, [currentSegment]);

  // Play a hi-hat sound
  const playHiHat = useCallback(() => {
    const ctx = audioContextRef.current!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.frequency.setValueAtTime(8000 + Math.random() * 2000, ctx.currentTime);
    osc.type = 'square';
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    
    const segment = audioSegmentsRef.current[currentSegment];
    if (segment) {
      osc.connect(gain);
      gain.connect(segment.analyser);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    }
  }, [currentSegment]);

  // Play a snare sound
  const playSnare = useCallback(() => {
    const ctx = audioContextRef.current!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.type = 'triangle';
    
    gain.gain.setValueAtTime(0.8, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    
    const segment = audioSegmentsRef.current[currentSegment];
    if (segment) {
      osc.connect(gain);
      gain.connect(segment.analyser);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    }
  }, [currentSegment]);

  // Play beat pattern based on intensity
  const playBeatPattern = useCallback((intensity: number) => {
    if (!audioContextRef.current || !isAudioEnabled) return;

    const bpm = 80 + (intensity * 10);
    const beatDuration = 60000 / bpm;

    let beatCount = 0;
    
    if (beatIntervalRef.current) {
      clearInterval(beatIntervalRef.current);
    }

    beatIntervalRef.current = setInterval(() => {
      // Kick on 1 and 3
      if (beatCount % 4 === 0 || beatCount % 4 === 2) {
        playKick(intensity);
      }
      
      // Snare on 2 and 4
      if (beatCount % 4 === 1 || beatCount % 4 === 3) {
        playSnare();
      }
      
      // Hi-hats based on intensity
      if (intensity >= 2) {
        playHiHat();
        if (intensity >= 3 && beatCount % 2 === 1) {
          setTimeout(() => playHiHat(), beatDuration / 4);
        }
        if (intensity >= 4 && beatCount % 2 === 0) {
          setTimeout(() => playHiHat(), beatDuration / 2);
        }
        if (intensity === 5) {
          setTimeout(() => playHiHat(), (beatDuration * 3) / 4);
        }
      }
      
      beatCount++;
    }, beatDuration);
  }, [isAudioEnabled, playKick, playSnare, playHiHat]);

  // Request audio permission and generate beats
  const enableAudio = useCallback(async () => {
    setIsLoading(true);
    
    try {
      initAudioContext();
      
      toast.loading('Generating trap beats...', { id: 'beats' });
      
      // Generate beat analyzers for each intensity level
      const segments: AudioSegment[] = [];
      for (let i = 1; i <= segmentCount; i++) {
        segments.push(generateTrapBeat(i));
      }

      audioSegmentsRef.current = segments;
      setIsAudioEnabled(true);
      
      toast.success('🔥 Trap beats ready!', { id: 'beats' });
      
    } catch (error) {
      console.error('Error enabling audio:', error);
      toast.error('Failed to load audio');
    } finally {
      setIsLoading(false);
    }
  }, [segmentCount, initAudioContext, generateTrapBeat]);

  // Play segment
  const playSegment = useCallback(async (segmentIndex: number) => {
    if (!audioContextRef.current || !isAudioEnabled) return;

    setCurrentSegment(segmentIndex);
    
    const segment = audioSegmentsRef.current[segmentIndex];
    if (!segment) return;

    // Apply volume
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isMuted ? 0 : volume;
    }

    // Start beat pattern for this intensity
    playBeatPattern(segment.intensity);
  }, [isAudioEnabled, volume, isMuted, playBeatPattern]);

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

  // Update volume
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (beatIntervalRef.current) {
        clearInterval(beatIntervalRef.current);
      }
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
