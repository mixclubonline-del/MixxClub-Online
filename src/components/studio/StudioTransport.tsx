import { useEffect, useRef } from 'react';
import { Play, Pause, Square, SkipBack } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAIStudioStore } from '@/stores/aiStudioStore';
import { useStudioPlayback } from '@/hooks/useStudioPlayback';
import { audioEngine } from '@/services/audioEngine';

/**
 * Professional transport controls with sample-accurate timing
 */
export const StudioTransport = () => {
  const tracks = useAIStudioStore((state) => state.tracks);
  const isPlaying = useAIStudioStore((state) => state.isPlaying);
  const currentTime = useAIStudioStore((state) => state.currentTime);
  const setPlaying = useAIStudioStore((state) => state.setPlaying);
  const setCurrentTime = useAIStudioStore((state) => state.setCurrentTime);
  
  const { playTracks, stopTracks } = useStudioPlayback();
  const animationFrameRef = useRef<number>();

  // Update playback position using sample-accurate timing at 60fps
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    let lastUpdateTime = performance.now();
    const targetFPS = 60;
    const frameInterval = 1000 / targetFPS;

    const updatePosition = (currentFrameTime: number) => {
      // Throttle to 60fps for smooth animation
      const elapsed = currentFrameTime - lastUpdateTime;
      
      if (elapsed >= frameInterval) {
        // Get precise position from audioEngine
        const position = audioEngine.getPlaybackPosition();
        setCurrentTime(position);
        
        lastUpdateTime = currentFrameTime - (elapsed % frameInterval);
      }
      
      animationFrameRef.current = requestAnimationFrame(updatePosition);
    };

    animationFrameRef.current = requestAnimationFrame(updatePosition);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, setCurrentTime]);

  const handlePlay = async () => {
    if (isPlaying) {
      // Pause
      stopTracks(tracks);
      audioEngine.stopAllTracks();
      setPlaying(false);
    } else {
      // Play from current position
      await audioEngine.resume();
      await playTracks(tracks, currentTime);
      setPlaying(true);
    }
  };

  const handleStop = () => {
    stopTracks(tracks);
    audioEngine.stopAllTracks();
    setPlaying(false);
    setCurrentTime(0);
  };

  const handleRewind = () => {
    const wasPlaying = isPlaying;
    if (wasPlaying) {
      stopTracks(tracks);
      audioEngine.stopAllTracks();
    }
    setCurrentTime(0);
    if (wasPlaying) {
      playTracks(tracks, 0);
    }
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleRewind}
        className="h-10 w-10"
      >
        <SkipBack className="w-5 h-5" />
      </Button>

      <Button
        variant="default"
        size="icon"
        onClick={handlePlay}
        className="h-12 w-12"
      >
        {isPlaying ? (
          <Pause className="w-6 h-6" />
        ) : (
          <Play className="w-6 h-6" />
        )}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleStop}
        className="h-10 w-10"
      >
        <Square className="w-5 h-5" />
      </Button>

      <div className="ml-4 font-mono text-sm bg-muted px-3 py-1 rounded">
        {formatTime(currentTime)}
      </div>
    </div>
  );
};
