import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WaveformGenerator, WaveformData } from '@/services/waveformGenerator';

export const useAudioWaveform = (audioFileId?: string) => {
  const [waveformData, setWaveformData] = useState<WaveformData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const audioBufferRef = useRef<AudioBuffer | null>(null);

  useEffect(() => {
    if (!audioFileId) return;

    const fetchAndGenerateWaveform = async () => {
      const { data, error } = await supabase
        .from('audio_files')
        .select('waveform_data, file_path')
        .eq('id', audioFileId)
        .single();

      if (error) {
        console.error('Error fetching audio file:', error);
        return;
      }

      // Check if we have cached waveform data
      if (data?.waveform_data && typeof data.waveform_data === 'object') {
        const cached = data.waveform_data as any;
        // Convert back to Float32Array format
        const waveform: WaveformData = {
          peaks: new Float32Array(cached.peaks || []),
          rms: new Float32Array(cached.rms || []),
          duration: cached.duration || 0,
          sampleRate: cached.sampleRate || 48000,
          channels: cached.channels || 1,
        };
        setWaveformData(waveform);
        return;
      }

      // Generate real waveform from audio file
      if (data?.file_path) {
        try {
          if (!audioContextRef.current) {
            audioContextRef.current = new AudioContext();
          }

          const { data: audioBlob } = await supabase.storage
            .from('audio-files')
            .download(data.file_path);

          if (audioBlob) {
            const arrayBuffer = await audioBlob.arrayBuffer();
            const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
            
            // Generate waveform with 500 bars for good detail
            const waveform = WaveformGenerator.generateFromBuffer(audioBuffer, {
              width: 500,
              normalize: true,
            });
            
            setWaveformData(waveform);
            audioBufferRef.current = audioBuffer;

            // Cache waveform data back to database (convert to serializable format)
            const serializableWaveform = {
              peaks: Array.from(waveform.peaks),
              rms: Array.from(waveform.rms),
              duration: waveform.duration,
              sampleRate: waveform.sampleRate,
              channels: waveform.channels,
            };
            
            await supabase
              .from('audio_files')
              .update({ waveform_data: serializableWaveform })
              .eq('id', audioFileId);
          }
        } catch (error) {
          console.error('Error generating waveform:', error);
        }
      }
    };

    fetchAndGenerateWaveform();
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

    // Update progress using sample-accurate timing
    const updateProgress = () => {
      if (isPlaying && audioBufferRef.current && audioContextRef.current) {
        const elapsed = audioContextRef.current.currentTime - startTimeRef.current;
        const duration = audioBufferRef.current.duration;
        const progressPercent = Math.min((elapsed / duration) * 100, 100);
        setProgress(progressPercent);
        
        if (elapsed < duration) {
          requestAnimationFrame(updateProgress);
        } else {
          setIsPlaying(false);
          setProgress(0);
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
