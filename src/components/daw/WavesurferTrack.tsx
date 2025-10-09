import { useEffect, useRef, memo } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Track } from '@/stores/aiStudioStore';

interface WavesurferTrackProps {
  track: Track;
  currentTime: number;
  isPlaying: boolean;
  zoom: number;
  height?: number;
  onReady?: () => void;
}

/**
 * Professional Wavesurfer-based track renderer
 * Uses industry-standard multi-resolution waveform rendering
 */
export const WavesurferTrack = memo(({
  track,
  currentTime,
  isPlaying,
  zoom,
  height = 100,
  onReady
}: WavesurferTrackProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Initialize Wavesurfer instance
  useEffect(() => {
    if (!containerRef.current || !track.audioBuffer) return;

    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      height,
      waveColor: 'hsl(var(--muted-foreground) / 0.5)',
      progressColor: 'hsl(var(--accent))',
      cursorColor: 'transparent',
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      normalize: true,
      interact: false, // Timeline handles interaction
      hideScrollbar: true,
      minPxPerSec: zoom * 50, // Convert zoom to pixels per second
    });

    // Load waveform from cached data or audio buffer
    if (track.waveformData) {
      const data = track.waveformData;
      
      // Check if it's the new multi-resolution format
      if ('peaks' in data && 'multiResolution' in data) {
        // Use appropriate resolution based on zoom level
        let peaks: Float32Array;
        if (zoom < 0.5) {
          peaks = data.multiResolution?.low || data.peaks;
        } else if (zoom > 2) {
          peaks = data.multiResolution?.high || data.peaks;
        } else {
          peaks = data.multiResolution?.medium || data.peaks;
        }
        wavesurfer.load('', [peaks], track.audioBuffer!.duration);
      } else {
        // Legacy Float32Array format
        wavesurfer.load('', [data as Float32Array], track.audioBuffer!.duration);
      }
    } else if (track.audioBuffer) {
      // Fallback: generate from AudioBuffer on the fly
      const channelData = track.audioBuffer.getChannelData(0);
      wavesurfer.load('', [channelData], track.audioBuffer.duration);
    }

    wavesurfer.on('ready', () => {
      onReady?.();
    });

    wavesurferRef.current = wavesurfer;

    return () => {
      wavesurfer.destroy();
      wavesurferRef.current = null;
    };
  }, [track.id, track.audioBuffer, height, onReady]);

  // Update zoom
  useEffect(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.zoom(zoom * 50);
    }
  }, [zoom]);

  // Sync playback position
  useEffect(() => {
    if (!wavesurferRef.current || !track.audioBuffer) return;
    
    const trackTime = Math.max(0, currentTime);
    
    // Only update if time changed significantly (avoid micro-updates)
    if (Math.abs(trackTime - lastTimeRef.current) > 0.01) {
      wavesurferRef.current.seekTo(trackTime / track.audioBuffer.duration);
      lastTimeRef.current = trackTime;
    }
  }, [currentTime, track.audioBuffer]);

  return (
    <div 
      ref={containerRef} 
      className="w-full"
      style={{ 
        opacity: track.mute ? 0.5 : 1,
        filter: track.solo ? 'brightness(1.2)' : 'none'
      }}
    />
  );
});

WavesurferTrack.displayName = 'WavesurferTrack';
