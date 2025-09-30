import { useState, useRef, useEffect } from 'react';
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
  const [waveformData, setWaveformData] = useState<number[]>([]);
  
  const beforeRef = useRef<HTMLAudioElement>(null);
  const afterRef = useRef<HTMLAudioElement>(null);
  const beforeCanvasRef = useRef<HTMLCanvasElement>(null);
  const afterCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  // Generate waveform visualization
  useEffect(() => {
    const generateWaveform = () => {
      const bars = 32;
      const data = Array.from({ length: bars }, () => Math.random() * 0.8 + 0.2);
      setWaveformData(data);
    };
    
    generateWaveform();
    const interval = setInterval(generateWaveform, 100);
    return () => clearInterval(interval);
  }, [activePlayer]);

  // Canvas waveform drawing
  useEffect(() => {
    const drawWaveform = (canvas: HTMLCanvasElement | null, isActive: boolean, isAfter = false) => {
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);
      
      const barWidth = width / waveformData.length;
      const intensity = isActive ? 1 : 0.3;
      
      waveformData.forEach((value, index) => {
        const barHeight = value * height * intensity;
        const x = index * barWidth;
        const y = (height - barHeight) / 2;
        
        // Create gradient based on player type
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        if (isAfter) {
          gradient.addColorStop(0, `hsla(280, 80%, 70%, ${intensity})`);
          gradient.addColorStop(1, `hsla(280, 80%, 70%, ${intensity * 0.5})`);
        } else {
          gradient.addColorStop(0, `hsla(262, 90%, 60%, ${intensity})`);
          gradient.addColorStop(1, `hsla(262, 90%, 60%, ${intensity * 0.5})`);
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth - 1, barHeight);
        
        // Add glow effect when active
        if (isActive) {
          ctx.shadowColor = isAfter ? 'hsl(280, 80%, 70%)' : 'hsl(262, 90%, 60%)';
          ctx.shadowBlur = 10;
          ctx.fillRect(x, y, barWidth - 1, barHeight);
          ctx.shadowBlur = 0;
        }
      });
    };

    const animate = () => {
      drawWaveform(beforeCanvasRef.current, activePlayer === 'before');
      drawWaveform(afterCanvasRef.current, activePlayer === 'after', true);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [waveformData, activePlayer]);

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
            <div className={`relative p-3 rounded-lg border transition-all duration-300 ${
              activePlayer === 'before' 
                ? 'bg-primary/10 border-primary/50 shadow-lg shadow-primary/20' 
                : 'bg-muted/30 border-muted'
            }`}>
              <Button
                variant={activePlayer === 'before' ? 'default' : 'outline'}
                size="sm"
                className="w-full gap-2 mb-2"
                onClick={() => togglePlay('before')}
              >
                {activePlayer === 'before' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                Before
              </Button>
              <canvas 
                ref={beforeCanvasRef}
                width={200}
                height={40}
                className="w-full h-10 rounded border border-primary/20"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground">Processed</span>
            <div className={`relative p-3 rounded-lg border transition-all duration-300 ${
              activePlayer === 'after' 
                ? 'bg-secondary/10 border-secondary/50 shadow-lg shadow-secondary/20' 
                : 'bg-muted/30 border-muted'
            }`}>
              <Button
                variant={activePlayer === 'after' ? 'default' : 'outline'}
                size="sm"
                className="w-full gap-2 mb-2"
                onClick={() => togglePlay('after')}
              >
                {activePlayer === 'after' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                After
              </Button>
              <canvas 
                ref={afterCanvasRef}
                width={200}
                height={40}
                className="w-full h-10 rounded border border-secondary/20"
              />
            </div>
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