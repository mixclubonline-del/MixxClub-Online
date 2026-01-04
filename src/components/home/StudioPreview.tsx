import { motion } from "framer-motion";
import { Play, Pause, SkipBack, Square, Volume2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const tracks = [
  { name: "Vocals", color: "bg-primary", muted: false },
  { name: "808s", color: "bg-secondary", muted: false },
  { name: "Hi-Hats", color: "bg-accent", muted: false },
  { name: "Melody", color: "bg-green-500", muted: true },
];

const plugins = [
  { name: "MixxEQ", active: true },
  { name: "MixxComp", active: true },
  { name: "MixxMaster", active: false },
];

export function StudioPreview() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [playheadPosition, setPlayheadPosition] = useState(20);
  const [levels, setLevels] = useState([0.8, 0.6, 0.7, 0.4]);

  // Animate playhead
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setPlayheadPosition((prev) => (prev >= 85 ? 20 : prev + 0.5));
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Animate levels
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setLevels([
        0.5 + Math.random() * 0.5,
        0.3 + Math.random() * 0.7,
        0.4 + Math.random() * 0.6,
        0.2 + Math.random() * 0.5,
      ]);
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <section className="py-20 relative overflow-hidden bg-muted/20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.05),transparent_70%)]" />
      
      <div className="container px-6 relative z-10">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <Volume2 className="w-3 h-3 mr-1" />
            Browser-Based DAW
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            This is{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Your Studio
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A professional DAW in your browser. No downloads. No subscriptions. Just create.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <Card className="p-6 glass-mid border-border/50 overflow-hidden">
            {/* Transport Bar */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={() => setPlayheadPosition(20)}
                >
                  <SkipBack className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant={isPlaying ? "default" : "outline"}
                  className="h-8 w-8 p-0"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <Square className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <span className="font-mono text-muted-foreground">
                  {Math.floor((playheadPosition - 20) / 10)}:{String(Math.floor(((playheadPosition - 20) * 6) % 60)).padStart(2, '0')}
                </span>
                <Badge variant="outline">120 BPM</Badge>
                <Badge variant="outline">4/4</Badge>
              </div>

              <div className="flex items-center gap-2">
                {plugins.map((plugin) => (
                  <Badge
                    key={plugin.name}
                    variant={plugin.active ? "default" : "secondary"}
                    className={plugin.active ? "bg-primary/20 text-primary border-primary/30" : ""}
                  >
                    {plugin.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="relative mb-4">
              {/* Time markers */}
              <div className="flex justify-between text-xs text-muted-foreground mb-2 px-24">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((bar) => (
                  <span key={bar}>{bar}</span>
                ))}
              </div>

              {/* Tracks */}
              <div className="space-y-2">
                {tracks.map((track, index) => (
                  <div key={track.name} className="flex items-center gap-3">
                    {/* Track Info */}
                    <div className="w-20 flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${track.color}`} />
                      <span className="text-xs font-medium truncate">{track.name}</span>
                    </div>

                    {/* Waveform */}
                    <div className="flex-1 h-10 bg-muted/30 rounded relative overflow-hidden">
                      {/* Simulated waveform */}
                      <div className="absolute inset-0 flex items-center justify-around px-1">
                        {Array.from({ length: 40 }).map((_, i) => (
                          <motion.div
                            key={i}
                            className={`w-1 rounded-full ${track.muted ? 'bg-muted-foreground/30' : track.color}`}
                            animate={{
                              height: isPlaying && !track.muted
                                ? `${20 + Math.sin(i * 0.5 + playheadPosition * 0.1) * 15 + Math.random() * 10}%`
                                : `${20 + Math.sin(i * 0.5) * 15}%`
                            }}
                            transition={{ duration: 0.1 }}
                          />
                        ))}
                      </div>

                      {/* Playhead */}
                      <motion.div
                        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg shadow-white/50"
                        style={{ left: `${playheadPosition}%` }}
                      />
                    </div>

                    {/* Level Meter */}
                    <div className="w-16 h-3 bg-muted/50 rounded overflow-hidden">
                      <motion.div
                        className={`h-full ${track.muted ? 'bg-muted-foreground/30' : track.color}`}
                        animate={{ width: `${levels[index] * 100}%` }}
                        transition={{ duration: 0.1 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Master Output */}
            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Master</span>
                <div className="flex items-center gap-1">
                  {/* Stereo meters */}
                  <div className="w-24 h-2 bg-muted/50 rounded overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                      animate={{ width: `${(levels[0] + levels[1]) * 50}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                  <div className="w-24 h-2 bg-muted/50 rounded overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                      animate={{ width: `${(levels[2] + levels[3]) * 50}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  -14 LUFS
                </Badge>
                <Badge variant="outline">
                  True Peak: -1.0 dB
                </Badge>
              </div>
            </div>
          </Card>
        </div>

        <p className="text-center mt-8 text-lg text-muted-foreground">
          Professional tools.{" "}
          <span className="text-primary font-semibold">Zero downloads.</span>{" "}
          <span className="text-secondary font-semibold">Infinite possibilities.</span>
        </p>
      </div>
    </section>
  );
}
