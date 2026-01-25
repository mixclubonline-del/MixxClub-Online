import { motion } from 'framer-motion';
import { Volume2, VolumeX, Mic2, Music2, Drum, Settings } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MixerTrack {
  id: string;
  name: string;
  icon: any;
  color: string;
  volume: number;
}

interface StudioMiniMixerProps {
  onUpdateVolume: (id: string, volume: number) => void;
  tracks: MixerTrack[];
  className?: string;
}

export function StudioMiniMixer({ tracks, onUpdateVolume, className }: StudioMiniMixerProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className={cn(
        "p-6 rounded-2xl border border-white/20 bg-black/60 backdrop-blur-xl shadow-2xl flex flex-col gap-6 w-80 pointer-events-auto",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <h4 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Interactive Mixer
        </h4>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-green-500" />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {tracks.map((track) => (
          <div key={track.id} className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-white/60">
              <div className="flex items-center gap-2">
                <track.icon className="w-3 h-3" style={{ color: track.color }} />
                <span>{track.name}</span>
              </div>
              <span>{Math.round(track.volume * 100)}%</span>
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-white/40 hover:text-white"
                onClick={() => onUpdateVolume(track.id, track.volume === 0 ? 0.8 : 0)}
              >
                {track.volume === 0 ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              <Slider
                value={[track.volume * 100]}
                onValueChange={(val) => onUpdateVolume(track.id, val[0] / 100)}
                max={100}
                step={1}
                className="flex-1"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-[10px] font-mono text-white/30 tracking-tighter">
          <span>VELVET_ENGINE_ENABLED</span>
          <span>LATENCY: 1.2ms</span>
        </div>
      </div>
    </motion.div>
  );
}

