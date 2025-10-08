import { Play, Pause, Square, SkipBack, Circle, Repeat, Shuffle, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAIStudioStore } from '@/stores/aiStudioStore';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

export const TransportControls = () => {
  const { 
    isPlaying, 
    isRecording,
    loopEnabled,
    setPlaying, 
    setRecording,
    setLoopEnabled,
    currentTime, 
    setCurrentTime, 
    tempo, 
    setTempo
  } = useAIStudioStore();

  const [isEditingTempo, setIsEditingTempo] = useState(false);
  const [tempoInput, setTempoInput] = useState(tempo.toString());

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const handleTempoSubmit = () => {
    const newTempo = parseInt(tempoInput);
    if (newTempo >= 40 && newTempo <= 240) {
      setTempo(newTempo);
    } else {
      setTempoInput(tempo.toString());
    }
    setIsEditingTempo(false);
  };

  return (
    <div className="flex items-center gap-1 justify-center">
      {/* Return to Zero */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setCurrentTime(0)}
        className="h-8 w-8 p-0"
        title="Return to Zero"
      >
        <SkipBack className="h-4 w-4" />
      </Button>
      
      {/* Record */}
      <Button
        variant={isRecording ? "destructive" : "ghost"}
        size="sm"
        onClick={() => setRecording(!isRecording)}
        className={cn(
          "h-8 w-8 p-0",
          isRecording && "animate-pulse"
        )}
        title="Record"
      >
        <Circle className={cn("h-4 w-4", isRecording && "fill-current")} />
      </Button>
      
      {/* Play/Pause */}
      <Button
        variant={isPlaying ? "default" : "ghost"}
        size="sm"
        onClick={() => setPlaying(!isPlaying)}
        className="h-9 w-9 p-0"
        title={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
      </Button>
      
      {/* Stop */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setPlaying(false);
          setRecording(false);
        }}
        className="h-8 w-8 p-0"
        title="Stop"
      >
        <Square className="h-4 w-4" />
      </Button>
      
      {/* Loop */}
      <Button
        variant={loopEnabled ? "default" : "ghost"}
        size="sm"
        onClick={() => setLoopEnabled(!loopEnabled)}
        className="h-8 w-8 p-0"
        title="Loop"
      >
        <Repeat className="h-4 w-4" />
      </Button>
      
      {/* Time Display */}
      <div 
        className="flex items-center gap-2 px-3 h-8 rounded bg-[hsl(var(--studio-black))] border border-[hsl(var(--studio-border))]"
      >
        <Music className="h-3 w-3 text-[hsl(var(--studio-text-dim))]" />
        <span className="text-xs font-mono text-[hsl(var(--studio-text))] tabular-nums">
          {formatTime(currentTime)}
        </span>
      </div>
      
      {/* Tempo */}
      <div className="flex items-center gap-1">
        {isEditingTempo ? (
          <Input
            type="number"
            value={tempoInput}
            onChange={(e) => setTempoInput(e.target.value)}
            onBlur={handleTempoSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTempoSubmit();
              if (e.key === 'Escape') {
                setTempoInput(tempo.toString());
                setIsEditingTempo(false);
              }
            }}
            className="w-16 h-8 text-xs text-center"
            autoFocus
            min={40}
            max={240}
          />
        ) : (
          <button
            onClick={() => setIsEditingTempo(true)}
            className="px-3 h-8 rounded bg-[hsl(var(--studio-black))] border border-[hsl(var(--studio-border))] hover:border-[hsl(var(--studio-accent))] transition"
          >
            <span className="text-xs font-mono text-[hsl(var(--studio-text))] tabular-nums">
              {tempo}
            </span>
            <span className="text-[10px] text-[hsl(var(--studio-text-dim))] ml-1">
              BPM
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
