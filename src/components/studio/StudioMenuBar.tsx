import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StudioMenuBarProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export const StudioMenuBar = ({ isPlaying, onTogglePlay }: StudioMenuBarProps) => {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 bg-background/80 backdrop-blur-sm px-6 py-2 rounded-full border border-border/50">
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <SkipBack className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-10 w-10 bg-primary/20 hover:bg-primary/30"
        onClick={onTogglePlay}
      >
        {isPlaying ? (
          <Pause className="h-5 w-5 text-primary" />
        ) : (
          <Play className="h-5 w-5 text-primary" />
        )}
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <SkipForward className="h-4 w-4" />
      </Button>
      <div className="flex items-center gap-4 ml-4 pl-4 border-l border-border/50">
        <div className="text-sm">
          <span className="text-muted-foreground">BPM:</span>
          <span className="ml-2 font-medium">128</span>
        </div>
        <div className="text-sm">
          <span className="text-muted-foreground">4/4</span>
        </div>
      </div>
    </div>
  );
};
