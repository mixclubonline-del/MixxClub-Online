import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

interface BeforeAfterPlayerProps {
  title: string;
  beforeSrc: string;
  afterSrc: string;
}

export const BeforeAfterPlayer = ({ title, beforeSrc, afterSrc }: BeforeAfterPlayerProps) => {
  const [activePlayer, setActivePlayer] = useState<'before' | 'after' | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const beforeRef = useRef<HTMLAudioElement>(null);
  const afterRef = useRef<HTMLAudioElement>(null);

  const togglePlay = (player: 'before' | 'after') => {
    const currentRef = player === 'before' ? beforeRef.current : afterRef.current;
    const otherRef = player === 'before' ? afterRef.current : beforeRef.current;

    if (!currentRef) return;

    // Pause the other player
    if (otherRef && !otherRef.paused) {
      otherRef.pause();
    }

    if (activePlayer === player && !currentRef.paused) {
      currentRef.pause();
      setActivePlayer(null);
    } else {
      currentRef.play();
      setActivePlayer(player);
    }
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    const audio = e.currentTarget;
    setCurrentTime(audio.currentTime);
    setDuration(audio.duration || 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    
    if (beforeRef.current) beforeRef.current.currentTime = time;
    if (afterRef.current) afterRef.current.currentTime = time;
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20">
      <div className="space-y-3">
        <h4 className="font-medium text-sm">{title}</h4>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground">Original</span>
            <Button
              variant={activePlayer === 'before' ? 'default' : 'outline'}
              size="sm"
              className="w-full gap-2"
              onClick={() => togglePlay('before')}
            >
              {activePlayer === 'before' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              Before
            </Button>
          </div>
          
          <div className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground">Processed</span>
            <Button
              variant={activePlayer === 'after' ? 'default' : 'outline'}
              size="sm"
              className="w-full gap-2"
              onClick={() => togglePlay('after')}
            >
              {activePlayer === 'after' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              After
            </Button>
          </div>
        </div>

        {duration > 0 && (
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        )}
      </div>

      <audio
        ref={beforeRef}
        src={beforeSrc}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={() => setActivePlayer(null)}
      />
      <audio
        ref={afterRef}
        src={afterSrc}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={() => setActivePlayer(null)}
      />
    </Card>
  );
};