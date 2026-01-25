import { motion } from 'framer-motion';
import { Volume2, Mic, Settings, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface GhostTrack {
  id: string;
  name: string;
  color: string;
  regions: Array<{ id: string; start: number; duration: number }>;
}

interface GhostTimelineProps {
  tracks: GhostTrack[];
  currentTime: number;
  isPlaying: boolean;
  className?: string;
}

export function GhostTimeline({ tracks, currentTime, isPlaying, className }: GhostTimelineProps) {
  // Constants for visual scaling
  const TRACK_HEIGHT = 60;
  const PIXELS_PER_SECOND = 40;
  
  return (
    <div className={cn("rounded-xl border border-white/10 bg-black/40 backdrop-blur-md overflow-hidden flex flex-col shadow-2xl", className)}>
      {/* Header / Transport Bar */}
      <div className="h-12 border-b border-white/10 bg-white/5 flex items-center px-4 justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500/20" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
            <div className="w-3 h-3 rounded-full bg-green-500/20" />
          </div>
          <span className="text-xs font-mono text-white/40 ml-2">PRIME_GHOST_SESSION_v1</span>
        </div>
        <div className="font-mono text-xs text-primary">
          {Math.floor(currentTime / 60).toString().padStart(2, '0')}:
          {(currentTime % 60).toFixed(2).padStart(5, '0')}
        </div>
      </div>

      <div className="flex flex-1 min-h-[300px]">
        {/* Track Headers */}
        <div className="w-48 border-r border-white/10 bg-white/5 flex flex-col">
          {tracks.map((track) => (
            <motion.div 
              key={track.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="border-b border-white/5 p-3 flex flex-col justify-center relative overflow-hidden"
              style={{ height: TRACK_HEIGHT, borderLeft: `3px solid ${track.color}` }}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-white/90 truncate">{track.name}</span>
                <MoreHorizontal className="w-3 h-3 text-white/30" />
              </div>
              <div className="flex items-center gap-2">
                <Volume2 className="w-3 h-3 text-white/40" />
                <div className="h-1 bg-white/10 rounded-full flex-1 overflow-hidden">
                  <motion.div 
                    className="h-full bg-white/40"
                    animate={{ width: isPlaying ? ['40%', '70%', '50%'] : '60%' }}
                    transition={{ repeat: Infinity, duration: 0.5, ease: "linear" }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
          {/* Empty slot placeholder */}
          <div className="flex-1 bg-gradient-to-b from-transparent to-black/20" />
        </div>

        {/* Timeline Area */}
        <div className="flex-1 relative bg-[linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_100%]">
          {/* Playhead */}
          <motion.div 
            className="absolute top-0 bottom-0 w-0.5 bg-primary z-20 shadow-[0_0_10px_rgba(var(--primary),0.5)]"
            style={{ left: currentTime * PIXELS_PER_SECOND }}
          />

          {/* Tracks */}
          <div className="absolute inset-0">
            {tracks.map((track, i) => (
              <div 
                key={track.id} 
                className="relative border-b border-white/5"
                style={{ height: TRACK_HEIGHT, top: 0 }}
              >
                {track.regions.map((region) => (
                  <motion.div
                    key={region.id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute top-1 bottom-1 rounded-md border border-white/20 overflow-hidden"
                    style={{
                      left: region.start * PIXELS_PER_SECOND,
                      width: region.duration * PIXELS_PER_SECOND,
                      background: `linear-gradient(135deg, ${track.color}40, ${track.color}10)`
                    }}
                  >
                    {/* Fake Waveform */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-50">
                      <div className="w-full h-1/2 flex items-center gap-0.5 px-1">
                        {Array.from({ length: 20 }).map((_, idx) => (
                          <div 
                            key={idx} 
                            className="flex-1 bg-white/40 rounded-full"
                            style={{ height: `${30 + Math.random() * 60}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
