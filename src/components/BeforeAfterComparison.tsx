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
    <section className="relative overflow-hidden bg-gradient-to-b from-background via-primary/5 to-background py-24 md:py-32">
      {/* Dramatic Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/30 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[hsl(220_90%_60%)]/20 rounded-full blur-[120px] animate-raven-float" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[hsl(180_100%_50%)]/10 rounded-full blur-[100px]" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }} />

      <div className="container px-4 md:px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Eyecatching Header */}
          <div className="text-center mb-12 md:mb-20 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass-studio border-2 border-primary/50 shadow-glow-sm mb-8">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
              <span className="text-sm font-bold text-primary uppercase tracking-wider">Live Audio Demo</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter mb-6 leading-[1.05]">
              <span className="block mb-2">From</span>
              <span className="bg-gradient-to-r from-red-500 via-red-400 to-red-500 bg-clip-text text-transparent">
                Bedroom Demo
              </span>
              <span className="block my-2 text-2xl md:text-4xl text-muted-foreground">to</span>
              <span className="bg-gradient-to-r from-primary via-[hsl(220_90%_60%)] to-[hsl(180_100%_50%)] bg-clip-text text-transparent drop-shadow-[0_0_40px_hsl(262_83%_58%/0.5)]">
                Radio Ready
              </span>
            </h2>
            
            <p className="text-lg md:text-2xl text-foreground/80 max-w-3xl mx-auto font-light leading-relaxed">
              Press play and experience the{" "}
              <span className="text-primary font-semibold">dramatic transformation</span>
              {" "}professional mastering delivers
            </p>
          </div>

          {/* Audio Players - Split Screen Design */}
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-10 md:mb-16">
            {/* Before Card */}
            <Card className={`group relative overflow-hidden glass-studio border-2 transition-all duration-500 hover:scale-[1.02] ${
              activeTrack === 'before' 
                ? 'border-red-500/70 shadow-[0_0_40px_rgba(239,68,68,0.3)] scale-[1.02]' 
                : 'border-red-500/30 hover:border-red-500/60'
            }`}>
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative p-6 md:p-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl md:text-3xl font-black text-foreground">BEFORE</h3>
                  <div className="px-4 py-1.5 rounded-full bg-red-500/20 border-2 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                    <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Raw</span>
                  </div>
                </div>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-red-500/50 rounded-full" />
                    <span>Muddy low frequencies</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-red-500/50 rounded-full" />
                    <span>Harsh, unbalanced highs</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-red-500/50 rounded-full" />
                    <span>Limited dynamic range</span>
                  </div>
                </div>
                
                <div className="aspect-[4/3] bg-gradient-to-br from-red-500/10 to-red-900/5 rounded-2xl flex items-center justify-center border-2 border-red-500/20 relative overflow-hidden group-hover:border-red-500/40 transition-colors duration-500">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.1),transparent_70%)]" />
                  <div className="text-center relative z-10">
                    <VolumeX className="w-16 md:w-24 h-16 md:h-24 text-red-500/50 mx-auto mb-3 group-hover:scale-110 transition-transform duration-500" />
                    <p className="text-xs md:text-sm font-medium text-red-400/70 uppercase tracking-wider">Unmastered</p>
                  </div>
                </div>
              </div>

              <audio ref={beforeAudioRef} src={beforeUrl} />
            </Card>

            {/* After Card */}
            <Card className={`group relative overflow-hidden glass-studio border-2 transition-all duration-500 hover:scale-[1.02] ${
              activeTrack === 'after' 
                ? 'border-primary/70 shadow-glow scale-[1.02]' 
                : 'border-primary/30 hover:border-primary/60'
            }`}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative p-6 md:p-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl md:text-3xl font-black text-foreground">AFTER</h3>
                  <div className="px-4 py-1.5 rounded-full bg-primary/20 border-2 border-primary/50 shadow-glow-sm">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">Pro</span>
                  </div>
                </div>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary/70 rounded-full animate-pulse-glow" />
                    <span>Crystal clear clarity</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary/70 rounded-full animate-pulse-glow" />
                    <span>Perfect frequency balance</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary/70 rounded-full animate-pulse-glow" />
                    <span>Punchy, radio-ready loudness</span>
                  </div>
                </div>
                
                <div className="aspect-[4/3] bg-gradient-to-br from-primary/10 to-[hsl(220_90%_60%)]/5 rounded-2xl flex items-center justify-center border-2 border-primary/20 relative overflow-hidden group-hover:border-primary/50 transition-colors duration-500">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.15),transparent_70%)]" />
                  <div className="text-center relative z-10">
                    <Volume2 className="w-16 md:w-24 h-16 md:h-24 text-primary/70 mx-auto mb-3 animate-pulse-glow group-hover:scale-110 transition-transform duration-500" />
                    <p className="text-xs md:text-sm font-medium text-primary/90 uppercase tracking-wider">Mastered</p>
                  </div>
                </div>
              </div>

              <audio ref={afterAudioRef} src={afterUrl} />
            </Card>
          </div>

          {/* Enhanced Playback Controls */}
          <Card className="glass-studio border-2 border-primary/40 shadow-glow-sm overflow-hidden">
            <div className="p-6 md:p-10 space-y-6 md:space-y-8">
              {/* Progress Bar with Time */}
              <div className="space-y-3">
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={0.1}
                  onValueChange={handleSeek}
                  className="cursor-pointer"
                />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-mono text-muted-foreground">{formatTime(currentTime)}</span>
                  <div className="text-center px-4 py-1.5 rounded-full glass-studio border border-primary/30">
                    <p className="text-xs text-muted-foreground">
                      Now Playing:{" "}
                      <span className={`font-bold ${
                        activeTrack === 'before' ? 'text-red-400' : 'text-primary'
                      }`}>
                        {activeTrack === 'before' ? 'BEFORE' : 'AFTER'}
                      </span>
                    </p>
                  </div>
                  <span className="text-sm font-mono text-muted-foreground">{formatTime(duration)}</span>
                </div>
              </div>

              {/* Control Buttons - Responsive Layout */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
                {/* Play/Pause Button */}
                <Button
                  variant="outline"
                  size="lg"
                  onClick={togglePlay}
                  className="w-20 h-20 rounded-full border-2 border-primary/50 hover:border-primary hover:shadow-glow transition-all duration-300 hover:scale-110 group"
                >
                  {playing ? (
                    <Pause className="w-10 h-10 group-hover:scale-110 transition-transform" />
                  ) : (
                    <Play className="w-10 h-10 ml-1 group-hover:scale-110 transition-transform" />
                  )}
                </Button>

                {/* A/B Switch Button - Hero CTA */}
                <Button
                  size="lg"
                  onClick={toggleAB}
                  className="px-8 md:px-12 py-6 md:py-8 text-base md:text-lg shadow-glow hover:shadow-glow-lg transition-all duration-300 font-bold group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <ArrowLeftRight className="w-6 h-6 mr-3 group-hover:rotate-180 transition-transform duration-500" />
                  <span className="relative">
                    Switch to {activeTrack === 'before' ? 'AFTER' : 'BEFORE'}
                  </span>
                </Button>

                {/* Volume Controls */}
                <div className="flex items-center gap-4 px-6 py-3 rounded-full glass-studio border border-primary/20">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMuted(!muted)}
                    className="hover:scale-110 transition-transform"
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
                    className="w-24 md:w-32"
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
