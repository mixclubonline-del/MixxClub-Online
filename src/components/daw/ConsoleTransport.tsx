import { 
  Play, 
  Pause, 
  Square, 
  SkipBack, 
  Mic,
  Circle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConsoleTransportProps {
  isPlaying: boolean;
  isRecording: boolean;
  currentTime: number;
  bpm: number;
  hasAudioAccess: boolean;
  onPlayPause: () => void;
  onStop: () => void;
  onRewind: () => void;
  onRecord: () => void;
  onRequestMic: () => void;
}

export const ConsoleTransport = ({
  isPlaying,
  isRecording,
  currentTime,
  bpm,
  hasAudioAccess,
  onPlayPause,
  onStop,
  onRewind,
  onRecord,
  onRequestMic,
}: ConsoleTransportProps) => {
  // Format time as MM:SS.ms
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 100);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-border/30 bg-background/40">
      {/* Left - Transport Controls */}
      <div className="flex items-center gap-3">
        {/* Console-style transport buttons */}
        <div className="flex items-center gap-1 bg-background/60 rounded-xl p-1.5 border border-border/30">
          {/* Rewind */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onRewind}
            className="w-10 h-10 rounded-lg hover:bg-muted/50 transition-all"
          >
            <SkipBack className="w-4 h-4" />
          </Button>
          
          {/* Play/Pause - Main button */}
          <Button
            variant={isPlaying ? "default" : "ghost"}
            size="icon"
            onClick={onPlayPause}
            className={`
              w-12 h-12 rounded-xl transition-all duration-300
              ${isPlaying 
                ? 'bg-primary shadow-[0_0_20px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.5)]' 
                : 'hover:bg-muted/50'
              }
            `}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </Button>
          
          {/* Stop */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onStop}
            className="w-10 h-10 rounded-lg hover:bg-muted/50 transition-all"
          >
            <Square className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Divider */}
        <div className="w-px h-8 bg-border/50" />
        
        {/* Record button */}
        <Button
          variant={isRecording ? "destructive" : "ghost"}
          size="icon"
          onClick={hasAudioAccess ? onRecord : onRequestMic}
          className={`
            w-10 h-10 rounded-full transition-all duration-300
            ${isRecording 
              ? 'animate-pulse shadow-[0_0_20px_hsl(0,70%,50%/0.5)]' 
              : 'hover:bg-destructive/20'
            }
          `}
        >
          {hasAudioAccess ? (
            <Circle className={`w-5 h-5 ${isRecording ? 'fill-current' : ''}`} />
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </Button>
        
        {/* Status LED */}
        <div className="flex items-center gap-2 ml-2">
          <div 
            className={`
              w-2 h-2 rounded-full transition-all duration-300
              ${isRecording 
                ? 'bg-destructive animate-pulse shadow-[0_0_8px_hsl(0,70%,50%)]' 
                : isPlaying 
                  ? 'bg-primary shadow-[0_0_8px_hsl(var(--primary))]' 
                  : 'bg-muted-foreground/30'
              }
            `}
          />
          <span className="text-xs font-mono text-muted-foreground">
            {isRecording ? 'REC' : isPlaying ? 'PLAY' : 'STOP'}
          </span>
        </div>
      </div>
      
      {/* Center - Time Display */}
      <div className="flex items-center gap-6">
        {/* Time */}
        <div className="bg-background/80 rounded-xl px-6 py-3 border border-border/30 shadow-inner">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Time</div>
              <div className="text-2xl font-mono font-bold text-primary tracking-tight">
                {formatTime(currentTime)}
              </div>
            </div>
            
            <div className="w-px h-10 bg-border/50" />
            
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">BPM</div>
              <div className="text-2xl font-mono font-bold text-accent tracking-tight">
                {bpm}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right - Status */}
      <div className="flex items-center gap-3">
        <div className="text-xs text-muted-foreground font-mono">
          48kHz / 24bit
        </div>
        <div className="flex gap-1">
          {[...Array(4)].map((_, i) => (
            <div 
              key={i}
              className={`
                w-1 h-4 rounded-sm transition-all duration-100
                ${i < 2 ? 'bg-green-500' : i < 3 ? 'bg-yellow-500' : 'bg-muted/30'}
              `}
              style={{
                transform: isPlaying ? `scaleY(${0.5 + Math.random() * 0.5})` : 'scaleY(0.3)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
