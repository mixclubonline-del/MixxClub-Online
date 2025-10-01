import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, Volume2, VolumeX, ArrowLeftRight } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

export function BeforeAfterComparison() {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeTrack, setActiveTrack] = useState<'before' | 'after'>('before');
  const [volume, setVolume] = useState(0.7);
  const [muted, setMuted] = useState(false);
  
  const beforeAudioRef = useRef<HTMLAudioElement>(null);
  const afterAudioRef = useRef<HTMLAudioElement>(null);

  // Demo audio URLs (replace with actual files)
  const beforeUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
  const afterUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3";

  useEffect(() => {
    const beforeAudio = beforeAudioRef.current;
    const afterAudio = afterAudioRef.current;
    
    if (!beforeAudio || !afterAudio) return;

    const updateTime = () => {
      const activeAudio = activeTrack === 'before' ? beforeAudio : afterAudio;
      setCurrentTime(activeAudio.currentTime);
      setDuration(activeAudio.duration);
    };

    beforeAudio.addEventListener('timeupdate', updateTime);
    afterAudio.addEventListener('timeupdate', updateTime);
    beforeAudio.addEventListener('loadedmetadata', updateTime);
    afterAudio.addEventListener('loadedmetadata', updateTime);

    return () => {
      beforeAudio.removeEventListener('timeupdate', updateTime);
      afterAudio.removeEventListener('timeupdate', updateTime);
      beforeAudio.removeEventListener('loadedmetadata', updateTime);
      afterAudio.removeEventListener('loadedmetadata', updateTime);
    };
  }, [activeTrack]);

  useEffect(() => {
    if (beforeAudioRef.current) beforeAudioRef.current.volume = muted ? 0 : volume;
    if (afterAudioRef.current) afterAudioRef.current.volume = muted ? 0 : volume;
  }, [volume, muted]);

  const togglePlay = () => {
    const beforeAudio = beforeAudioRef.current;
    const afterAudio = afterAudioRef.current;
    
    if (!beforeAudio || !afterAudio) return;

    if (playing) {
      beforeAudio.pause();
      afterAudio.pause();
    } else {
      if (activeTrack === 'before') {
        beforeAudio.play();
      } else {
        afterAudio.play();
      }
    }
    setPlaying(!playing);
  };

  const toggleAB = () => {
    const beforeAudio = beforeAudioRef.current;
    const afterAudio = afterAudioRef.current;
    
    if (!beforeAudio || !afterAudio) return;

    const currentPlayingTime = activeTrack === 'before' ? beforeAudio.currentTime : afterAudio.currentTime;
    const wasPlaying = playing;

    beforeAudio.pause();
    afterAudio.pause();

    if (activeTrack === 'before') {
      afterAudio.currentTime = currentPlayingTime;
      setActiveTrack('after');
      if (wasPlaying) afterAudio.play();
    } else {
      beforeAudio.currentTime = currentPlayingTime;
      setActiveTrack('before');
      if (wasPlaying) beforeAudio.play();
    }
  };

  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    if (beforeAudioRef.current) beforeAudioRef.current.currentTime = newTime;
    if (afterAudioRef.current) afterAudioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <section className="py-32 bg-gradient-to-b from-background via-[hsl(262_30%_8%)] to-background relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-raven-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[hsl(220_90%_60%)]/15 rounded-full blur-3xl animate-pulse-glow" />
      </div>

      <div className="container px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-[1.1]">
              <span className="bg-gradient-to-r from-primary via-[hsl(220_90%_60%)] to-[hsl(180_100%_50%)] bg-clip-text text-transparent drop-shadow-[0_0_40px_hsl(262_83%_58%/0.5)]">
                Hear the Difference
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-foreground/70 max-w-3xl mx-auto font-light">
              Experience the dramatic transformation from a raw, compressed track to a{" "}
              <span className="text-primary font-medium">radio-ready masterpiece</span>
            </p>
          </div>

          {/* Audio Players */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Before Card */}
            <Card className={`glass-studio p-8 border-2 transition-all duration-500 ${
              activeTrack === 'before' 
                ? 'border-red-500/60 shadow-glow scale-[1.02]' 
                : 'border-red-500/30 hover:border-red-500/50'
            }`}>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-bold text-foreground">Before</h3>
                  <div className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40">
                    <span className="text-xs font-semibold text-red-500">Raw Mix</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Compressed dynamics, muddy low-end, harsh highs
                </p>
              </div>
              
              <div className="aspect-square bg-gradient-to-br from-red-500/20 to-red-500/5 rounded-xl flex items-center justify-center border border-red-500/20 mb-6">
                <div className="text-center">
                  <VolumeX className="w-20 h-20 text-red-500/60 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">Unpolished Audio</p>
                </div>
              </div>

              <audio ref={beforeAudioRef} src={beforeUrl} />
            </Card>

            {/* After Card */}
            <Card className={`glass-studio p-8 border-2 transition-all duration-500 ${
              activeTrack === 'after' 
                ? 'border-primary/60 shadow-glow scale-[1.02]' 
                : 'border-primary/30 hover:border-primary/50'
            }`}>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-bold text-foreground">After</h3>
                  <div className="px-3 py-1 rounded-full bg-primary/20 border border-primary/40">
                    <span className="text-xs font-semibold text-primary">MixClub Polish</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Crystal clear, punchy, radio-ready sound
                </p>
              </div>
              
              <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center border border-primary/20 mb-6">
                <div className="text-center">
                  <Volume2 className="w-20 h-20 text-primary/60 mx-auto mb-4 animate-pulse-glow" />
                  <p className="text-sm text-muted-foreground">Professional Master</p>
                </div>
              </div>

              <audio ref={afterAudioRef} src={afterUrl} />
            </Card>
          </div>

          {/* Playback Controls */}
          <Card className="glass-studio p-8 border-2 border-primary/30">
            <div className="space-y-6">
              {/* Progress Bar */}
              <div className="space-y-2">
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={0.1}
                  onValueChange={handleSeek}
                  className="cursor-pointer"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-center gap-6">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={togglePlay}
                  className="w-20 h-20 rounded-full border-2 border-primary/40 hover:border-primary hover:shadow-glow transition-all duration-300"
                >
                  {playing ? (
                    <Pause className="w-8 h-8" />
                  ) : (
                    <Play className="w-8 h-8 ml-1" />
                  )}
                </Button>

                <Button
                  size="lg"
                  onClick={toggleAB}
                  className="px-8 shadow-glow-sm hover:shadow-glow transition-all duration-300 font-bold group"
                >
                  <ArrowLeftRight className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-300" />
                  Switch to {activeTrack === 'before' ? 'After' : 'Before'}
                </Button>

                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMuted(!muted)}
                  >
                    {muted ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </Button>
                  <Slider
                    value={[muted ? 0 : volume * 100]}
                    max={100}
                    step={1}
                    onValueChange={(v) => {
                      setVolume(v[0] / 100);
                      setMuted(false);
                    }}
                    className="w-24"
                  />
                </div>
              </div>

              {/* Active Track Indicator */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Currently Playing:{" "}
                  <span className={`font-bold ${
                    activeTrack === 'before' ? 'text-red-500' : 'text-primary'
                  }`}>
                    {activeTrack === 'before' ? 'Before (Raw Mix)' : 'After (MixClub Polish)'}
                  </span>
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
