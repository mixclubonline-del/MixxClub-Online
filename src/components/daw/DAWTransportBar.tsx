import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Circle,
} from 'lucide-react';
import { useAIStudioStore } from '@/stores/aiStudioStore';
import { useState, useEffect } from 'react';

export const DAWTransportBar = () => {
  const isPlaying = useAIStudioStore((state) => state.isPlaying);
  const setPlaying = useAIStudioStore((state) => state.setPlaying);
  const currentTime = useAIStudioStore((state) => state.currentTime);
  const setCurrentTime = useAIStudioStore((state) => state.setCurrentTime);
  const bpm = useAIStudioStore((state) => state.bpm);
  const setBpm = useAIStudioStore((state) => state.setBpm);

  const [timeDisplay, setTimeDisplay] = useState('00:00:000');

  // Format time display
  useEffect(() => {
    const minutes = Math.floor(currentTime / 60);
    const seconds = Math.floor(currentTime % 60);
    const milliseconds = Math.floor((currentTime % 1) * 1000);
    setTimeDisplay(
      `${minutes.toString().padStart(2, '0')}:${seconds
        .toString()
        .padStart(2, '0')}:${milliseconds.toString().padStart(3, '0')}`
    );
  }, [currentTime]);

  const handlePlay = () => {
    setPlaying(!isPlaying);
  };

  const handleStop = () => {
    setPlaying(false);
    setCurrentTime(0);
  };

  const handleRewind = () => {
    setCurrentTime(Math.max(0, currentTime - 5));
  };

  const handleForward = () => {
    setCurrentTime(currentTime + 5);
  };

  return (
    <div className="h-16 bg-gradient-to-r from-[hsl(230,35%,10%)] via-[hsl(230,30%,12%)] to-[hsl(230,35%,10%)] border-b border-[hsl(var(--primary)/0.2)] flex items-center px-4 gap-6 shadow-lg relative">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[hsl(var(--primary)/0.05)] to-transparent pointer-events-none" />
      {/* Transport Controls */}
      <div className="flex items-center gap-1 relative z-10">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleRewind}
          className="hover:bg-[hsl(var(--primary)/0.1)] transition-all"
        >
          <SkipBack className="w-5 h-5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handlePlay}
          className="relative hover:bg-[hsl(var(--primary)/0.1)] transition-all"
        >
          {isPlaying ? (
            <Pause className="w-7 h-7 text-primary drop-shadow-[0_0_8px_hsl(var(--primary))]" />
          ) : (
            <Play className="w-7 h-7 text-primary drop-shadow-[0_0_8px_hsl(var(--primary))]" />
          )}
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleStop}
          className="hover:bg-[hsl(var(--primary)/0.1)] transition-all"
        >
          <Square className="w-5 h-5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleForward}
          className="hover:bg-[hsl(var(--primary)/0.1)] transition-all"
        >
          <SkipForward className="w-5 h-5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="ml-2 hover:bg-destructive/10 transition-all"
        >
          <Circle className="w-5 h-5 text-destructive drop-shadow-[0_0_6px_hsl(var(--destructive))]" />
        </Button>
      </div>

      {/* Time Display */}
      <div className="flex items-center gap-4 relative z-10">
        <div className="bg-black/50 border border-[hsl(var(--primary)/0.3)] px-6 py-2 rounded-lg font-display text-3xl font-bold min-w-[200px] text-center text-primary shadow-[0_0_20px_hsl(var(--primary)/0.3)] backdrop-blur-sm">
          {timeDisplay}
        </div>
        
        {/* BPM */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">BPM</span>
          <Input
            type="number"
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="w-20 h-9 text-center"
            min={20}
            max={300}
          />
        </div>

        {/* Time Signature */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Time</span>
          <div className="px-3 py-1 bg-background border border-border rounded-md text-sm">
            4/4
          </div>
        </div>

        {/* Key */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Key</span>
          <div className="px-3 py-1 bg-background border border-border rounded-md text-sm">
            C Major
          </div>
        </div>
      </div>

      <div className="flex-1" />

      {/* CPU/Activity Indicator */}
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span>CPU: 12%</span>
        </div>
        <div>48kHz</div>
      </div>
    </div>
  );
};
