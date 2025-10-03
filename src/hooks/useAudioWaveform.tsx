import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAudioWaveform = (audioFileId?: string) => {
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const audioBufferRef = useRef<AudioBuffer | null>(null);

  useEffect(() => {
    if (!audioFileId) return;

    const fetchWaveform = async () => {
      const { data, error } = await supabase
        .from('audio_files')
        .select('waveform_data, file_path')
        .eq('id', audioFileId)
        .single();

      if (data?.waveform_data) {
        setWaveformData(data.waveform_data as number[]);
      } else if (data?.file_path) {
        // Generate simple waveform if not available
        const simpleWaveform = Array.from({ length: 50 }, () => 
          Math.random() * 0.8 + 0.2
        );
        setWaveformData(simpleWaveform);
      }
    };

    fetchWaveform();
  }, [audioFileId]);

  const loadAudio = async (filePath: string) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    try {
      const { data } = await supabase.storage
        .from('audio-files')
        .download(filePath);

      if (data) {
        const arrayBuffer = await data.arrayBuffer();
        audioBufferRef.current = await audioContextRef.current.decodeAudioData(arrayBuffer);
      }
    } catch (error) {
      console.error('Error loading audio:', error);
    }
  };

  const play = async (filePath: string) => {
    if (!audioContextRef.current) return;
    
    if (!audioBufferRef.current) {
      await loadAudio(filePath);
    }

    if (!audioBufferRef.current) return;

    if (sourceRef.current) {
      sourceRef.current.stop();
    }

    sourceRef.current = audioContextRef.current.createBufferSource();
    sourceRef.current.buffer = audioBufferRef.current;
    sourceRef.current.connect(audioContextRef.current.destination);
    
    startTimeRef.current = audioContextRef.current.currentTime;
    sourceRef.current.start(0);
    setIsPlaying(true);

    sourceRef.current.onended = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    // Update progress
    const updateProgress = () => {
      if (isPlaying && audioBufferRef.current) {
        const elapsed = audioContextRef.current!.currentTime - startTimeRef.current;
        const duration = audioBufferRef.current.duration;
        setProgress((elapsed / duration) * 100);
        
        if (elapsed < duration) {
          requestAnimationFrame(updateProgress);
        }
      }
    };
    requestAnimationFrame(updateProgress);
  };

  const pause = () => {
    if (sourceRef.current) {
      sourceRef.current.stop();
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    return () => {
      if (sourceRef.current) {
        sourceRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return { waveformData, isPlaying, progress, play, pause };
};
