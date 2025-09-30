import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pause } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface Track {
  title: string;
  beforeUrl?: string;
  afterUrl?: string;
}

const tracks: Track[] = [
  { 
    title: "Hip-Hop Vocal Transform",
    beforeUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    afterUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  { 
    title: "R&B Studio Polish",
    beforeUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    afterUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
  },
  { 
    title: "Electronic Mix Magic",
    beforeUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    afterUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3"
  },
];

const trackDetails = [
  {
    genre: "Hip-Hop",
    artist: "Independent Artist",
    improvement: "Vocal clarity +40%, Mix balance +35%",
    color: "hsl(262 90% 60%)"
  },
  {
    genre: "R&B",
    artist: "Emerging Artist",
    improvement: "Studio quality +60%, Dynamics +45%",
    color: "hsl(280 80% 70%)"
  },
  {
    genre: "Electronic",
    artist: "Bedroom Producer",
    improvement: "Commercial ready +80%, AI stem separation",
    color: "hsl(210 90% 60%)"
  }
];

const AudioPreview = () => {
  const [playingTrack, setPlayingTrack] = useState<{ index: number; type: 'before' | 'after' } | null>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const canvasRefs = useRef<{ [key: string]: HTMLCanvasElement }>({});
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const waveformAnimationRef = useRef<number>();
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    radius: number;
    speedX: number;
    speedY: number;
  }>>([]);
  const [waveformPhase, setWaveformPhase] = useState(0);

  const togglePlay = (index: number, type: 'before' | 'after') => {
    const key = `${index}-${type}`;
    const audio = audioRefs.current[key];
    
    if (!audio) return;

    if (playingTrack?.index === index && playingTrack?.type === type) {
      audio.pause();
      setPlayingTrack(null);
    } else {
      // Pause all other audio
      Object.values(audioRefs.current).forEach(a => a.pause());
      audio.play();
      setPlayingTrack({ index, type });
    }
  };

  // Initialize background animation
  useEffect(() => {
    const bgCanvas = bgCanvasRef.current;
    if (!bgCanvas) return;

    const bgCtx = bgCanvas.getContext('2d');
    if (!bgCtx) return;

    // Set canvas size
    const resizeCanvas = () => {
      bgCanvas.width = bgCanvas.offsetWidth;
      bgCanvas.height = bgCanvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles
    const numParticles = 80;
    particlesRef.current = [];
    for (let i = 0; i < numParticles; i++) {
      particlesRef.current.push({
        x: Math.random() * bgCanvas.width,
        y: Math.random() * bgCanvas.height,
        radius: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
      });
    }

    // Animation function
    const animateBackground = () => {
      bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);

      particlesRef.current.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around edges
        if (p.x > bgCanvas.width) p.x = 0;
        if (p.x < 0) p.x = bgCanvas.width;
        if (p.y > bgCanvas.height) p.y = 0;
        if (p.y < 0) p.y = bgCanvas.height;

        // Draw particle
        bgCtx.beginPath();
        bgCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        bgCtx.fillStyle = 'hsl(var(--primary) / 0.3)';
        bgCtx.fill();
      });

      animationFrameRef.current = requestAnimationFrame(animateBackground);
    };

    animateBackground();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Animated waveform visualization
  useEffect(() => {
    const animateWaveforms = () => {
      setWaveformPhase(prev => (prev + 0.05) % (Math.PI * 2));
      
      Object.entries(canvasRefs.current).forEach(([key, canvas]) => {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const [indexStr, type] = key.split('-');
        const index = parseInt(indexStr);
        const isPlaying = playingTrack?.index === index && playingTrack?.type === type;
        const width = canvas.width;
        const height = canvas.height;
        const trackColor = trackDetails[index]?.color || 'hsl(var(--primary))';
        
        ctx.clearRect(0, 0, width, height);
        
        // Background gradient
        const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
        bgGradient.addColorStop(0, `${trackColor.replace(')', ' / 0.1)')}`);
        bgGradient.addColorStop(1, `${trackColor.replace(')', ' / 0.05)')}`);
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, width, height);

        // Draw waveform bars
        const bars = 60;
        const barWidth = width / bars;
        const intensity = isPlaying ? 1 : 0.4;
        
        for (let i = 0; i < bars; i++) {
          const x = i * barWidth;
          const normalizedHeight = Math.abs(
            Math.sin(waveformPhase + (i / bars) * Math.PI * 4) * 
            Math.cos(waveformPhase * 0.5 + (i / bars) * Math.PI * 2)
          );
          const barHeight = (normalizedHeight * height * 0.6 + height * 0.1) * intensity;
          const y = (height - barHeight) / 2;
          
          // Create gradient for each bar
          const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
          gradient.addColorStop(0, trackColor);
          gradient.addColorStop(1, `${trackColor.replace(')', ` / ${intensity * 0.3})`)}`);
          
          ctx.fillStyle = gradient;
          ctx.fillRect(x, y, barWidth - 2, barHeight);
          
          // Add glow effect when playing
          if (isPlaying) {
            ctx.shadowColor = trackColor;
            ctx.shadowBlur = 15;
            ctx.fillRect(x, y, barWidth - 2, barHeight);
            ctx.shadowBlur = 0;
          }
        }
      });

      waveformAnimationRef.current = requestAnimationFrame(animateWaveforms);
    };

    animateWaveforms();

    return () => {
      if (waveformAnimationRef.current) {
        cancelAnimationFrame(waveformAnimationRef.current);
      }
    };
  }, [waveformPhase, playingTrack]);

  return (
    <div className="relative overflow-hidden py-24 bg-card">
      <canvas
        ref={bgCanvasRef}
        className="absolute top-0 left-0 w-full h-full z-0"
      />
      <section id="preview" className="relative z-10">
        <div className="container px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Before & After: Track Transformations
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Hear the Transformation
            </p>
            <p className="text-muted-foreground mt-4">
              Listen to real examples of tracks we've transformed from bedroom recordings to professional, radio-ready quality using our AI-enhanced mixing process.
            </p>
          </div>

        <div className="grid md:grid-cols-3 gap-6">
          {tracks.map((track, index) => (
            <Card 
              key={index} 
              className="border-border bg-card overflow-hidden transition-all duration-300 hover:shadow-glass hover:border-primary/30 hover:scale-105"
              style={{
                animation: playingTrack?.index === index ? 'glow-pulse 2s ease-in-out infinite' : 'none'
              }}
            >
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <span 
                    className="px-2 py-1 text-xs rounded-full font-medium"
                    style={{
                      backgroundColor: `${trackDetails[index].color.replace(')', ' / 0.2)')}`,
                      color: trackDetails[index].color
                    }}
                  >
                    {trackDetails[index].genre}
                  </span>
                  <span className="text-xs text-muted-foreground">{trackDetails[index].artist}</span>
                </div>
                <CardTitle className="text-lg">{track.title}</CardTitle>
                <p className="text-xs text-muted-foreground mt-2">{trackDetails[index].improvement}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Before */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Before</span>
                    <button
                      onClick={() => togglePlay(index, 'before')}
                      className="w-8 h-8 rounded-full bg-muted hover:bg-primary/20 flex items-center justify-center transition-all duration-300 hover:scale-110"
                      style={{
                        boxShadow: playingTrack?.index === index && playingTrack?.type === 'before' 
                          ? `0 0 20px ${trackDetails[index].color}` 
                          : 'none'
                      }}
                    >
                      {playingTrack?.index === index && playingTrack?.type === 'before' ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <canvas
                    ref={(el) => {
                      if (el) canvasRefs.current[`${index}-before`] = el;
                    }}
                    className="w-full h-16 rounded-lg"
                    width="300"
                    height="64"
                  />
                  <audio
                    ref={(el) => {
                      if (el) audioRefs.current[`${index}-before`] = el;
                    }}
                    onEnded={() => setPlayingTrack(null)}
                  >
                    <source src={track.beforeUrl} type="audio/mpeg" />
                  </audio>
                </div>

                {/* After */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-primary uppercase tracking-wider">After</span>
                    <button
                      onClick={() => togglePlay(index, 'after')}
                      className="w-8 h-8 rounded-full bg-primary/20 hover:bg-primary/30 flex items-center justify-center transition-all duration-300 hover:scale-110"
                      style={{
                        boxShadow: playingTrack?.index === index && playingTrack?.type === 'after' 
                          ? `0 0 20px ${trackDetails[index].color}` 
                          : 'none'
                      }}
                    >
                      {playingTrack?.index === index && playingTrack?.type === 'after' ? (
                        <Pause className="w-4 h-4 text-primary" />
                      ) : (
                        <Play className="w-4 h-4 text-primary" />
                      )}
                    </button>
                  </div>
                  <canvas
                    ref={(el) => {
                      if (el) canvasRefs.current[`${index}-after`] = el;
                    }}
                    className="w-full h-16 rounded-lg"
                    width="300"
                    height="64"
                  />
                  <audio
                    ref={(el) => {
                      if (el) audioRefs.current[`${index}-after`] = el;
                    }}
                    onEnded={() => setPlayingTrack(null)}
                  >
                    <source src={track.afterUrl} type="audio/mpeg" />
                  </audio>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        </div>
      </section>
    </div>
  );
};

export default AudioPreview;
