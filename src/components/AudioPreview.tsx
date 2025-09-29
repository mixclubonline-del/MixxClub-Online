import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pause } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface Track {
  title: string;
  beforeUrl?: string;
  afterUrl?: string;
}

const tracks: Track[] = [
  { title: "Hip-Hop Track" },
  { title: "Pop Ballad" },
  { title: "Rock Anthem" },
];

const AudioPreview = () => {
  const [playingTrack, setPlayingTrack] = useState<{ index: number; type: 'before' | 'after' } | null>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const canvasRefs = useRef<{ [key: string]: HTMLCanvasElement }>({});

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

  useEffect(() => {
    // Simple waveform visualization
    Object.entries(canvasRefs.current).forEach(([key, canvas]) => {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      
      ctx.fillStyle = 'hsl(263 70% 63% / 0.1)';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = 'hsl(263 70% 63%)';
      ctx.lineWidth = 2;
      ctx.beginPath();

      // Generate a simple waveform
      for (let x = 0; x < width; x++) {
        const y = height / 2 + Math.sin((x / width) * Math.PI * 8) * (height / 4) * Math.random();
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    });
  }, []);

  return (
    <section id="preview" className="py-24 bg-background">
      <div className="container px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Before & After</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Hear the difference our professional mixing and AI enhancement makes
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {tracks.map((track, index) => (
            <Card key={index} className="border-border bg-card overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg">{track.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Before */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Before</span>
                    <button
                      onClick={() => togglePlay(index, 'before')}
                      className="w-8 h-8 rounded-full bg-muted hover:bg-primary/20 flex items-center justify-center transition-colors"
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
                    <span className="text-sm text-primary font-medium">After</span>
                    <button
                      onClick={() => togglePlay(index, 'after')}
                      className="w-8 h-8 rounded-full bg-primary/20 hover:bg-primary/30 flex items-center justify-center transition-colors"
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
  );
};

export default AudioPreview;
