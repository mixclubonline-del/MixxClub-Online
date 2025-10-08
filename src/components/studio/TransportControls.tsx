import { useAIStudioStore } from '@/stores/aiStudioStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Play, 
  Pause, 
  Square, 
  SkipBack,
  Circle,
  Repeat,
  Volume2
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';

export const TransportControls = () => {
  const {
    isPlaying,
    isRecording,
    currentTime,
    tempo,
    masterVolume,
    setPlaying,
    setRecording,
    setCurrentTime,
    setTempo,
    setMasterVolume,
  } = useAIStudioStore();

  const handlePlayPause = () => {
    setPlaying(!isPlaying);
  };

  const handleStop = () => {
    setPlaying(false);
    setCurrentTime(0);
  };

  const handleRecord = () => {
    setRecording(!isRecording);
    if (!isRecording) {
      setPlaying(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center justify-between gap-6 w-full">
      {/* Transport Buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentTime(0)}
          title="Skip to Start"
        >
          <SkipBack className="h-4 w-4" />
        </Button>

        <Button
          variant={isPlaying ? "secondary" : "default"}
          size="icon"
          onClick={handlePlayPause}
          className="h-10 w-10"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleStop}
          title="Stop"
        >
          <Square className="h-4 w-4" />
        </Button>

        <Button
          variant={isRecording ? "destructive" : "ghost"}
          size="icon"
          onClick={handleRecord}
          className={isRecording ? "animate-pulse" : ""}
          title={isRecording ? "Stop Recording" : "Record"}
        >
          <Circle className="h-4 w-4" fill={isRecording ? "currentColor" : "none"} />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          disabled
          title="Loop (Coming Soon)"
        >
          <Repeat className="h-4 w-4 opacity-50" />
        </Button>
      </div>

      {/* Time Display */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-mono text-foreground tabular-nums min-w-[100px]">
          {formatTime(currentTime)}
        </span>
      </div>

      {/* Tempo */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">BPM</Label>
          <Input
            type="number"
            value={tempo}
            onChange={(e) => setTempo(Number(e.target.value))}
            className="w-16 h-8 text-center"
            min={40}
            max={240}
          />
        </div>
      </div>

      {/* Master Volume */}
      <div className="flex items-center gap-2 min-w-[150px]">
        <Volume2 className="h-4 w-4 text-muted-foreground" />
        <Slider
          value={[masterVolume * 100]}
          onValueChange={([value]) => setMasterVolume(value / 100)}
          max={100}
          step={1}
          className="flex-1"
        />
        <span className="text-xs text-muted-foreground w-8 text-right">
          {Math.round(masterVolume * 100)}
        </span>
      </div>
    </div>
  );
};
