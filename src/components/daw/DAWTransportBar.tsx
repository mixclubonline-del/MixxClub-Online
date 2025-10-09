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
    <div className="h-16 bg-card border-b border-border flex items-center px-4 gap-6">
      {/* Transport Controls */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={handleRewind}>
          <SkipBack className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handlePlay}>
          {isPlaying ? (
            <Pause className="w-6 h-6 text-primary" />
          ) : (
            <Play className="w-6 h-6 text-primary" />
          )}
        </Button>
        <Button variant="ghost" size="icon" onClick={handleStop}>
          <Square className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleForward}>
          <SkipForward className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="ml-2">
          <Circle className="w-5 h-5 text-destructive" />
        </Button>
      </div>

      {/* Time Display */}
      <div className="flex items-center gap-4">
        <div className="bg-background border border-border px-4 py-2 rounded-md font-mono text-2xl font-bold min-w-[180px] text-center">
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
