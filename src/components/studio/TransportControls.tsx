import { Play, Pause, Square, Circle, SkipBack, SkipForward, Repeat, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransportControlsProps {
  isPlaying: boolean;
  isRecording: boolean;
  currentTime: number;
  duration: number;
  tempo: number;
  onPlay: () => void;
  onStop: () => void;
  onRecord: () => void;
  onTempoChange: (tempo: number) => void;
}

export const TransportControls = ({
  isPlaying,
  isRecording,
  currentTime,
  duration,
  tempo,
  onPlay,
  onStop,
  onRecord,
  onTempoChange,
}: TransportControlsProps) => {
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className="w-full h-16 border-b flex items-center px-6 gap-8 glass-studio"
      style={{
        borderColor: 'hsl(var(--studio-border) / 0.4)',
      }}
    >
      {/* Left Section - Playback Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {}}
          className="p-2 rounded transition-all hover:scale-105"
          style={{
            background: 'var(--button-gradient)',
            boxShadow: 'var(--shadow-raised)',
          }}
          aria-label="Skip back"
        >
          <SkipBack className="w-5 h-5 text-[hsl(var(--studio-text-dim))]" />
        </button>
        
        <button
          onClick={onStop}
          className="p-2 rounded transition-all hover:scale-105"
          style={{
            background: 'var(--button-gradient)',
            boxShadow: 'var(--shadow-raised)',
          }}
          aria-label="Stop"
        >
          <Square className="w-5 h-5 text-[hsl(var(--studio-text-dim))]" />
        </button>
        
        <button
          onClick={onPlay}
          className={cn(
            "p-3 rounded-full transition-all hover:scale-110",
            isPlaying && "animate-pulse"
          )}
          style={{
            background: isPlaying 
              ? 'linear-gradient(135deg, hsl(var(--studio-accent)), hsl(var(--studio-accent-glow)))'
              : 'var(--button-gradient)',
            boxShadow: isPlaying 
              ? '0 0 30px hsl(var(--studio-accent) / 0.6), var(--shadow-raised-lg)'
              : 'var(--shadow-raised)',
            color: 'white',
            border: isPlaying ? '2px solid hsl(var(--studio-accent-glow))' : '1px solid hsl(var(--studio-border))',
          }}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </button>

        <button
          onClick={() => {}}
          className="p-2 rounded transition-all hover:scale-105"
          style={{
            background: 'var(--button-gradient)',
            boxShadow: 'var(--shadow-raised)',
          }}
          aria-label="Skip forward"
        >
          <SkipForward className="w-5 h-5 text-[hsl(var(--studio-text-dim))]" />
        </button>

        <button
          onClick={onRecord}
          className={cn(
            "p-3 rounded-full transition-all hover:scale-110",
            isRecording && "animate-pulse"
          )}
          style={{
            background: isRecording
              ? 'linear-gradient(135deg, hsl(0 100% 60%), hsl(0 100% 50%))'
              : 'var(--button-gradient)',
            boxShadow: isRecording
              ? '0 0 30px hsl(0 100% 50% / 0.6), var(--shadow-raised-lg)'
              : 'var(--shadow-raised)',
            color: isRecording ? 'white' : 'hsl(var(--studio-text-dim))',
            border: isRecording ? '2px solid hsl(0 100% 70%)' : '1px solid hsl(var(--studio-border))',
          }}
          aria-label={isRecording ? "Stop recording" : "Record"}
        >
          <Circle className="w-5 h-5" fill={isRecording ? "currentColor" : "none"} />
        </button>

        <button
          className="p-2 rounded transition-all ml-2 hover:scale-105"
          style={{
            background: 'var(--button-gradient)',
            boxShadow: 'var(--shadow-raised)',
          }}
          aria-label="Loop"
        >
          <Repeat className="w-5 h-5 text-[hsl(var(--studio-text-dim))]" />
        </button>
      </div>

      {/* Center Section - Time Display */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div 
          className="font-mono text-3xl tabular-nums tracking-wider"
          style={{
            color: 'hsl(var(--led-green))',
            textShadow: '0 0 12px hsl(var(--led-green) / 0.6)',
          }}
        >
          {formatTime(currentTime)}
        </div>
        <div className="font-mono text-xs text-[hsl(var(--studio-text-dim))] tabular-nums">
          {formatTime(duration)}
        </div>
      </div>

      {/* Right Section - Session Info */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[hsl(var(--studio-text-dim))] uppercase">BPM</span>
          <input
            type="number"
            value={tempo}
            onChange={(e) => onTempoChange(Number(e.target.value))}
            className="w-14 px-2 py-1 rounded text-sm font-mono text-[hsl(var(--studio-text))] focus:outline-none"
            style={{
              background: 'hsl(220, 20%, 12%)',
              border: '1px solid hsl(220, 14%, 28%)',
              boxShadow: 'var(--shadow-recessed)',
            }}
            min={40}
            max={240}
          />
        </div>

        <div className="text-xs font-mono text-[hsl(var(--studio-text-dim))]">
          <span className="uppercase">Key</span>
          <span className="ml-2 text-[hsl(var(--studio-text))]">C Major</span>
        </div>

        <div className="text-xs font-mono text-[hsl(var(--studio-text-dim))]">
          <span className="uppercase">SR</span>
          <span className="ml-2 text-[hsl(var(--studio-text))]">48kHz</span>
        </div>

        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[hsl(var(--studio-text-dim))]" />
          <div 
            className="w-20 h-2 rounded-full overflow-hidden"
            style={{
              background: 'hsl(220, 20%, 12%)',
              boxShadow: 'var(--shadow-recessed)',
            }}
          >
            <div 
              className="h-full transition-all"
              style={{ 
                width: '35%',
                background: 'linear-gradient(90deg, hsl(142 100% 50%), hsl(60 100% 50%))',
              }}
            />
          </div>
          <span className="text-xs font-mono text-[hsl(var(--studio-text-dim))]">35%</span>
        </div>
      </div>
    </div>
  );
};
