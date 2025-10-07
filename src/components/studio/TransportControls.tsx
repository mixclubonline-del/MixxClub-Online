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
    <div className="w-full h-16 bg-[hsl(var(--studio-panel))] border-b border-[hsl(var(--studio-border))] flex items-center px-6 gap-8">
      {/* Left Section - Playback Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {}}
          className="p-2 hover:bg-[hsl(var(--studio-panel-raised))] rounded transition"
          aria-label="Skip back"
        >
          <SkipBack className="w-5 h-5 text-[hsl(var(--studio-text-dim))] hover:text-[hsl(var(--studio-text))]" />
        </button>
        
        <button
          onClick={onStop}
          className="p-2 hover:bg-[hsl(var(--studio-panel-raised))] rounded transition"
          aria-label="Stop"
        >
          <Square className="w-5 h-5 text-[hsl(var(--studio-text-dim))] hover:text-[hsl(var(--studio-text))]" />
        </button>
        
        <button
          onClick={onPlay}
          className={cn(
            "p-3 rounded-lg transition-all",
            isPlaying
              ? "bg-[hsl(var(--studio-accent))] text-black shadow-[0_0_20px_hsl(var(--studio-accent-glow)/0.4)]"
              : "bg-[hsl(var(--studio-panel-raised))] text-[hsl(var(--studio-text))] hover:bg-[hsl(var(--studio-border))]"
          )}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </button>

        <button
          onClick={() => {}}
          className="p-2 hover:bg-[hsl(var(--studio-panel-raised))] rounded transition"
          aria-label="Skip forward"
        >
          <SkipForward className="w-5 h-5 text-[hsl(var(--studio-text-dim))] hover:text-[hsl(var(--studio-text))]" />
        </button>

        <button
          onClick={onRecord}
          className={cn(
            "p-3 rounded-full transition-all",
            isRecording
              ? "bg-[hsl(var(--led-red))] text-white shadow-[0_0_20px_hsl(var(--led-red)/0.6)] animate-pulse"
              : "bg-[hsl(var(--studio-panel-raised))] text-[hsl(var(--studio-text-dim))] hover:bg-[hsl(var(--studio-border))] hover:text-[hsl(var(--led-red))]"
          )}
          aria-label={isRecording ? "Stop recording" : "Record"}
        >
          <Circle className="w-5 h-5" fill={isRecording ? "currentColor" : "none"} />
        </button>

        <button
          className="p-2 hover:bg-[hsl(var(--studio-panel-raised))] rounded transition ml-2"
          aria-label="Loop"
        >
          <Repeat className="w-5 h-5 text-[hsl(var(--studio-text-dim))] hover:text-[hsl(var(--studio-text))]" />
        </button>
      </div>

      {/* Center Section - Time Display */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="font-mono text-3xl tabular-nums text-[hsl(var(--studio-text))] tracking-wider">
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
            className="w-14 px-2 py-1 bg-[hsl(var(--studio-black))] border border-[hsl(var(--studio-border))] rounded text-sm font-mono text-[hsl(var(--studio-text))] focus:outline-none focus:border-[hsl(var(--studio-accent))]"
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
          <div className="w-20 h-2 bg-[hsl(var(--studio-black))] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[hsl(var(--led-green))] to-[hsl(var(--led-yellow))] transition-all"
              style={{ width: '35%' }}
            />
          </div>
          <span className="text-xs font-mono text-[hsl(var(--studio-text-dim))]">35%</span>
        </div>
      </div>
    </div>
  );
};
