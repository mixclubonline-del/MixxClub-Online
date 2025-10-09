import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, Volume2, VolumeX, ArrowLeftRight, Users, Check, X, Frown } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useShowcaseAudio } from '@/hooks/useShowcaseAudio';

export function BeforeAfterComparison() {
  const { samples, loading: audioLoading } = useShowcaseAudio('mixing');
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeTrack, setActiveTrack] = useState<'before' | 'after'>('before');
  const [volume, setVolume] = useState(0.7);
  const [muted, setMuted] = useState(false);
  
  const beforeAudioRef = useRef<HTMLAudioElement>(null);
  const afterAudioRef = useRef<HTMLAudioElement>(null);

  // Use first uploaded sample or fallback to demo
  const firstSample = samples[0];
  const beforeUrl = firstSample?.beforeUrl || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
  const afterUrl = firstSample?.afterUrl || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3";

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
              <span className="text-sm font-bold text-primary uppercase tracking-wider">Your Journey</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter mb-6 leading-[1.05]">
              <span className="block mb-2 text-muted-foreground">Before</span>
              <span className="bg-gradient-to-r from-muted-foreground via-muted to-muted-foreground bg-clip-text text-transparent">
                MIXXCLUB
              </span>
              <span className="block my-3 text-2xl md:text-3xl text-muted-foreground/60">vs</span>
              <span className="bg-gradient-to-r from-primary via-[hsl(220_90%_60%)] to-[hsl(180_100%_50%)] bg-clip-text text-transparent drop-shadow-[0_0_40px_hsl(262_83%_58%/0.5)]">
                After MIXXCLUB
              </span>
            </h2>
            
            <p className="text-lg md:text-2xl text-foreground/80 max-w-4xl mx-auto font-light leading-relaxed mb-3">
              From isolated bedroom struggle to{" "}
              <span className="text-primary font-semibold">thriving in a professional community</span>
            </p>
            <p className="text-base md:text-lg text-muted-foreground/70 max-w-2xl mx-auto">
              Same artist. Same track. Different world.
            </p>
          </div>

          {/* Audio Players - Split Screen Design */}
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-10 md:mb-16">
            {/* Before Mix Club Card */}
            <Card className={`group relative overflow-hidden glass-studio border-2 transition-all duration-500 hover:scale-[1.02] ${
              activeTrack === 'before' 
                ? 'border-muted-foreground/50 shadow-[0_0_30px_rgba(100,100,100,0.3)] scale-[1.02]' 
                : 'border-muted/30 hover:border-muted-foreground/30'
            }`}>
              <div className="absolute inset-0 bg-gradient-to-br from-muted-foreground/5 via-muted/10 to-background opacity-50" />
              
              <div className="relative p-6 md:p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-3">
                    <div className="inline-block px-4 py-2 rounded-full bg-muted border border-muted-foreground/20">
                      <span className="text-xs md:text-sm font-bold text-muted-foreground uppercase tracking-wider">Before MIXXCLUB</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black text-muted-foreground">Struggling Alone</h3>
                  </div>
                  <Frown className="w-10 h-10 md:w-12 md:h-12 text-muted-foreground/60" />
                </div>
                
                <p className="text-sm md:text-base text-muted-foreground/80 leading-relaxed mb-6">
                  DIY bedroom producer working in isolation with limited resources
                </p>

                <div className="space-y-3 mb-6">
                  {[
                    "Working in isolation",
                    "No professional feedback",
                    "Limited industry connections",
                    "Stuck with bedroom sound",
                    "Hours of frustration"
                  ].map((painPoint, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-muted-foreground/70">
                      <X className="w-4 h-4 md:w-5 md:h-5 mt-0.5 flex-shrink-0 text-muted-foreground/50" />
                      <span className="text-xs md:text-sm">{painPoint}</span>
                    </div>
                  ))}
                </div>
                
                <div className="aspect-[4/3] bg-gradient-to-br from-muted/20 to-muted/5 rounded-2xl flex items-center justify-center border-2 border-muted/30 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(100,100,100,0.1),transparent_70%)]" />
                  <div className="text-center relative z-10">
                    <Frown className="w-16 md:w-24 h-16 md:h-24 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-xs md:text-sm font-medium text-muted-foreground/60 uppercase tracking-wider">Isolated</p>
                  </div>
                </div>
              </div>

              <audio ref={beforeAudioRef} src={beforeUrl} />
            </Card>

            {/* After Mix Club Card */}
            <Card className={`group relative overflow-hidden glass-studio border-2 transition-all duration-500 hover:scale-[1.02] ${
              activeTrack === 'after' 
                ? 'border-primary/70 shadow-glow scale-[1.02]' 
                : 'border-primary/30 hover:border-primary/60'
            }`}>
              <div className="absolute inset-0 bg-gradient-raven opacity-20" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.15),transparent)]" />
              
              <div className="relative p-6 md:p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-3">
                    <div className="inline-block px-4 py-2 rounded-full bg-primary/20 border border-primary/40 shadow-glow-sm">
                      <span className="text-xs md:text-sm font-bold text-primary uppercase tracking-wider">After MIXXCLUB</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-primary via-[hsl(220_90%_60%)] to-[hsl(180_100%_50%)] bg-clip-text text-transparent">
                      Thriving Together
                    </h3>
                  </div>
                  <Users className="w-10 h-10 md:w-12 md:h-12 text-primary animate-pulse-glow" />
                </div>
                
                <p className="text-sm md:text-base text-foreground/90 leading-relaxed mb-6 font-medium">
                  Professional network of engineers ready to bring your vision to life
                </p>

                <div className="space-y-3 mb-6">
                  {[
                    "Connected to pro engineers",
                    "Real-time collaboration",
                    "Industry-standard results",
                    "Growing fanbase",
                    "Career breakthrough"
                  ].map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-foreground/80">
                      <Check className="w-4 h-4 md:w-5 md:h-5 mt-0.5 flex-shrink-0 text-primary" />
                      <span className="text-xs md:text-sm font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>
                
                <div className="aspect-[4/3] bg-gradient-to-br from-primary/10 to-[hsl(220_90%_60%)]/5 rounded-2xl flex items-center justify-center border-2 border-primary/20 relative overflow-hidden group-hover:border-primary/50 transition-colors duration-500">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.15),transparent_70%)]" />
                  <div className="text-center relative z-10">
                    <Users className="w-16 md:w-24 h-16 md:h-24 text-primary/70 mx-auto mb-3 animate-pulse-glow group-hover:scale-110 transition-transform duration-500" />
                    <p className="text-xs md:text-sm font-medium text-primary/90 uppercase tracking-wider">Connected</p>
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
                        activeTrack === 'before' ? 'text-muted-foreground' : 'text-primary'
                      }`}>
                        {activeTrack === 'before' ? 'BEFORE MIXXCLUB' : 'AFTER MIXXCLUB'}
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
                    Switch to {activeTrack === 'before' ? 'AFTER MIXXCLUB' : 'BEFORE MIXXCLUB'}
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
