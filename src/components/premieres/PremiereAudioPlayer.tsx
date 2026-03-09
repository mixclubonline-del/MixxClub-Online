import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import WaveSurfer from 'wavesurfer.js';
import { supabase } from '@/integrations/supabase/client';

interface PremiereAudioPlayerProps {
  audioUrl: string;
  isPlaying: boolean;
  onPlayPause: () => void;
  playCount?: number;
}

export default function PremiereAudioPlayer({ 
  audioUrl, 
  isPlaying, 
  onPlayPause,
  playCount = 0 
}: PremiereAudioPlayerProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (!waveformRef.current) return;

    const initWaveSurfer = async () => {
      try {
        // Detect if audioUrl is already a full URL (no signing needed)
        let resolvedUrl: string;
        if (audioUrl.startsWith('http://') || audioUrl.startsWith('https://')) {
          resolvedUrl = audioUrl;
        } else {
          const { data } = await supabase.storage
            .from('audio-files')
            .createSignedUrl(audioUrl, 3600);

          if (!data?.signedUrl) {
            console.error('Failed to get signed URL for audio');
            return;
          }
          resolvedUrl = data.signedUrl;
        }

        wavesurferRef.current = WaveSurfer.create({
          container: waveformRef.current!,
          waveColor: 'hsl(var(--accent) / 0.3)',
          progressColor: 'hsl(var(--accent))',
          cursorColor: 'hsl(var(--accent-blue))',
          barWidth: 2,
          barRadius: 3,
          cursorWidth: 2,
          height: 80,
          barGap: 1,
          normalize: true,
          backend: 'WebAudio',
        });

        wavesurferRef.current.load(data.signedUrl);

        wavesurferRef.current.on('ready', () => {
          setIsLoading(false);
          const dur = wavesurferRef.current?.getDuration() || 0;
          setDuration(formatTime(dur));
        });

        wavesurferRef.current.on('audioprocess', () => {
          const time = wavesurferRef.current?.getCurrentTime() || 0;
          setCurrentTime(formatTime(time));
        });

        wavesurferRef.current.on('finish', () => {
          onPlayPause();
        });
      } catch (error) {
        console.error('Error loading audio:', error);
        setIsLoading(false);
      }
    };

    initWaveSurfer();

    return () => {
      wavesurferRef.current?.destroy();
    };
  }, [audioUrl]);

  useEffect(() => {
    if (!wavesurferRef.current) return;

    if (isPlaying) {
      wavesurferRef.current.play();
    } else {
      wavesurferRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.setVolume(isMuted ? 0 : volume);
    }
  }, [volume, isMuted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    if (value[0] > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="relative bg-gradient-to-r from-accent/5 to-accent-blue/5 rounded-lg border border-white/5 overflow-hidden">
      {/* Waveform Container */}
      <div 
        ref={waveformRef} 
        className={`w-full ${isLoading ? 'opacity-50 animate-pulse' : ''}`}
      />

      {/* Controls Overlay */}
      <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <Button
            variant="ghost"
            size="lg"
            onClick={onPlayPause}
            disabled={isLoading}
            className="h-12 w-12 rounded-full bg-accent/20 hover:bg-accent/40 backdrop-blur-sm"
          >
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6 ml-0.5" />
            )}
          </Button>

          <div className="text-xs font-mono text-foreground/70">
            {currentTime} / {duration}
          </div>
        </div>

        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-background/20 backdrop-blur-sm">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={toggleMute}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="w-20"
            />
          </div>

          <div className="text-xs text-muted-foreground px-3 py-2 rounded-full bg-background/20 backdrop-blur-sm">
            {playCount} plays
          </div>
        </div>
      </div>
    </div>
  );
}
