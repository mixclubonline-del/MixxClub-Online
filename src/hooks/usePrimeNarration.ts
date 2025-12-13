import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UsePrimeNarrationReturn {
  isPlaying: boolean;
  isLoading: boolean;
  speak: (text: string) => Promise<void>;
  stop: () => void;
  audioUrl: string | null;
}

export const usePrimeNarration = (): UsePrimeNarrationReturn => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  const speak = useCallback(async (text: string) => {
    if (!text.trim()) return;
    
    // Stop any current playback
    stop();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('prime-speak', {
        body: { text }
      });

      if (error) throw error;
      
      if (data?.audioUrl) {
        setAudioUrl(data.audioUrl);
        
        // Create and play audio
        const audio = new Audio(data.audioUrl);
        audioRef.current = audio;
        
        audio.onplay = () => setIsPlaying(true);
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => {
          console.error('Audio playback error');
          setIsPlaying(false);
        };
        
        await audio.play();
      }
    } catch (err) {
      console.error('Prime narration error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [stop]);

  return { isPlaying, isLoading, speak, stop, audioUrl };
};
