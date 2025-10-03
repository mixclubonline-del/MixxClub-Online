import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Play, Pause, RotateCcw, Split } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AudioComparisonProps {
  audioFileA: string;
  audioFileB: string;
  titleA?: string;
  titleB?: string;
}

export const AudioComparison = ({ 
  audioFileA, 
  audioFileB,
  titleA = 'Version A',
  titleB = 'Version B' 
}: AudioComparisonProps) => {
  const audioRefA = useRef<HTMLAudioElement>(null);
  const audioRefB = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [balance, setBalance] = useState(0.5); // 0 = A only, 1 = B only, 0.5 = both equal
  const [comparisonMode, setComparisonMode] = useState<'ab' | 'sync'>('sync');

  useEffect(() => {
    const audioA = audioRefA.current;
    const audioB = audioRefB.current;

    if (!audioA || !audioB) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audioA.currentTime);
      if (comparisonMode === 'sync' && audioB) {
        const timeDiff = Math.abs(audioA.currentTime - audioB.currentTime);
        if (timeDiff > 0.1) {
          audioB.currentTime = audioA.currentTime;
        }
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audioA.duration);
      if (audioB) {
        audioB.currentTime = audioA.currentTime;
      }
    };

    audioA.addEventListener('timeupdate', handleTimeUpdate);
    audioA.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audioA.removeEventListener('timeupdate', handleTimeUpdate);
      audioA.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [comparisonMode]);

  useEffect(() => {
    const audioA = audioRefA.current;
    const audioB = audioRefB.current;

    if (!audioA || !audioB) return;

    // Set volumes based on balance
    audioA.volume = 1 - balance;
    audioB.volume = balance;
  }, [balance]);

  const togglePlayPause = async () => {
    const audioA = audioRefA.current;
    const audioB = audioRefB.current;

    if (!audioA || !audioB) return;

    if (isPlaying) {
      audioA.pause();
      audioB.pause();
    } else {
      if (comparisonMode === 'sync') {
        audioB.currentTime = audioA.currentTime;
        await Promise.all([audioA.play(), audioB.play()]);
      } else {
        await audioA.play();
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const audioA = audioRefA.current;
    const audioB = audioRefB.current;

    if (!audioA) return;

    const newTime = value[0];
    audioA.currentTime = newTime;
    if (audioB && comparisonMode === 'sync') {
      audioB.currentTime = newTime;
    }
    setCurrentTime(newTime);
  };

  const reset = () => {
    const audioA = audioRefA.current;
    const audioB = audioRefB.current;

    if (!audioA) return;

    audioA.currentTime = 0;
    if (audioB) audioB.currentTime = 0;
    setCurrentTime(0);
    setIsPlaying(false);
    audioA.pause();
    audioB?.pause();
  };

  const switchToAB = () => {
    setComparisonMode(comparisonMode === 'ab' ? 'sync' : 'ab');
    if (comparisonMode === 'sync') {
      // In A/B mode, pause B
      audioRefB.current?.pause();
      setBalance(0);
    } else {
      setBalance(0.5);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Audio Comparison</h3>
        <Badge variant={comparisonMode === 'sync' ? 'default' : 'secondary'}>
          {comparisonMode === 'sync' ? 'Sync Mode' : 'A/B Mode'}
        </Badge>
      </div>

      {/* Hidden audio elements */}
      <audio ref={audioRefA} src={audioFileA} preload="auto" />
      <audio ref={audioRefB} src={audioFileB} preload="auto" />

      {/* Waveform placeholder / Timeline */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <Slider
          value={[currentTime]}
          onValueChange={handleSeek}
          max={duration || 100}
          step={0.1}
          className="cursor-pointer"
        />
      </div>

      {/* Balance/Crossfade Control */}
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className={balance < 0.5 ? 'font-semibold text-primary' : 'text-muted-foreground'}>
            {titleA}
          </span>
          <span className={balance > 0.5 ? 'font-semibold text-primary' : 'text-muted-foreground'}>
            {titleB}
          </span>
        </div>
        <Slider
          value={[balance]}
          onValueChange={([v]) => setBalance(v)}
          min={0}
          max={1}
          step={0.01}
          disabled={comparisonMode === 'ab'}
        />
        <div className="flex justify-center">
          <Badge variant="outline" className="text-xs">
            {balance === 0 ? '100% A' : balance === 1 ? '100% B' : `${Math.round((1 - balance) * 100)}% A / ${Math.round(balance * 100)}% B`}
          </Badge>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        <Button onClick={reset} variant="outline" size="sm">
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button onClick={togglePlayPause} size="lg" className="px-8">
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
        </Button>
        <Button onClick={switchToAB} variant="outline" size="sm">
          <Split className="w-4 h-4" />
        </Button>
      </div>

      {/* Quick presets */}
      <div className="flex gap-2 justify-center">
        <Button 
          variant="secondary" 
          size="sm"
          onClick={() => setBalance(0)}
        >
          Only A
        </Button>
        <Button 
          variant="secondary" 
          size="sm"
          onClick={() => setBalance(0.5)}
        >
          50/50
        </Button>
        <Button 
          variant="secondary" 
          size="sm"
          onClick={() => setBalance(1)}
        >
          Only B
        </Button>
      </div>
    </Card>
  );
};
