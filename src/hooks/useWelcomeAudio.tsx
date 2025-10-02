import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AudioSegment {
  intensity: number;
  audioUrl: string | null;
  analyser: AnalyserNode | null;
}

export const useWelcomeAudio = (segmentCount: number) => {
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [currentSegment, setCurrentSegment] = useState(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSegmentsRef = useRef<AudioSegment[]>([]);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const audioDataRef = useRef<Uint8Array>(new Uint8Array(128));

  // Initialize audio context
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
    }
  }, []);

  // Request audio permission and load beats
  const enableAudio = useCallback(async () => {
    setIsLoading(true);
    
    try {
      initAudioContext();
      
      // Generate beats for each intensity level
      const segments: AudioSegment[] = [];
      
      for (let i = 1; i <= segmentCount; i++) {
        toast.loading(`Generating trap beat ${i}/${segmentCount}...`, { id: `beat-${i}` });
        
        const { data, error } = await supabase.functions.invoke('generate-trap-beat', {
          body: { intensity: i }
        });

        if (error || !data?.audioUrl) {
          console.error(`Failed to generate beat ${i}:`, error);
          toast.error(`Failed to generate beat ${i}`, { id: `beat-${i}` });
          segments.push({ intensity: i, audioUrl: null, analyser: null });
          continue;
        }

        // Create analyser for this segment
        const analyser = audioContextRef.current!.createAnalyser();
        analyser.fftSize = 256;
        analyser.connect(gainNodeRef.current!);

        segments.push({ 
          intensity: i, 
          audioUrl: data.audioUrl,
          analyser 
        });
        
        toast.success(`Beat ${i} ready!`, { id: `beat-${i}` });
      }

      audioSegmentsRef.current = segments;
      setIsAudioEnabled(true);
      toast.success('🔥 Trap beats loaded!');
      
    } catch (error) {
      console.error('Error enabling audio:', error);
      toast.error('Failed to load audio');
    } finally {
      setIsLoading(false);
    }
  }, [segmentCount, initAudioContext]);

  // Play segment
  const playSegment = useCallback(async (segmentIndex: number) => {
    if (!audioContextRef.current || !isAudioEnabled) return;

    // Stop current audio
    if (currentSourceRef.current) {
      currentSourceRef.current.stop();
      currentSourceRef.current = null;
    }

    const segment = audioSegmentsRef.current[segmentIndex];
    if (!segment?.audioUrl) return;

    try {
      // Fetch and decode audio
      const response = await fetch(segment.audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);

      // Create source and connect
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(segment.analyser!);
      
      // Apply volume
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.value = isMuted ? 0 : volume;
      }

      source.start(0);
      currentSourceRef.current = source;
      setCurrentSegment(segmentIndex);

    } catch (error) {
      console.error('Error playing segment:', error);
    }
  }, [isAudioEnabled, volume, isMuted]);

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
      if (currentSourceRef.current) {
        currentSourceRef.current.stop();
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
