import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic2, Drum, Music2, Waves, BrainCircuit, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Stem {
  id: string;
  name: string;
  icon: any;
  color: string;
  active: boolean;
  waveData: number[]; // Simple array for fake visualization
}

export function StemDrillDown() {
  const [stems, setStems] = useState<Stem[]>([
    { id: 'vocals', name: 'Vocals', icon: Mic2, color: '#ec4899', active: true, waveData: [0.2, 0.8, 0.5, 0.9, 0.3, 0.7, 0.4] },
    { id: 'drums', name: 'Drums', icon: Drum, color: '#ef4444', active: true, waveData: [0.9, 0.2, 0.8, 0.2, 0.9, 0.2, 0.8] },
    { id: 'bass', name: 'Bass', icon: Music2, color: '#f97316', active: true, waveData: [0.6, 0.6, 0.7, 0.6, 0.5, 0.6, 0.7] },
    { id: 'other', name: 'Other', icon: Waves, color: '#8b5cf6', active: true, waveData: [0.3, 0.4, 0.3, 0.5, 0.4, 0.3, 0.5] }
  ]);

  const toggleStem = (id: string) => {
    setStems(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row gap-8 items-center justify-center p-8">
      
      {/* Central Neural Core Visualization */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Core pulsing brain */}
        <motion.div 
          className="relative z-10 w-32 h-32 bg-cyan-500/20 rounded-full flex items-center justify-center border border-cyan-500/50 backdrop-blur-md shadow-[0_0_50px_rgba(6,182,212,0.3)]"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <BrainCircuit className="w-16 h-16 text-cyan-400" />
        </motion.div>

        {/* Orbiting Stem Nodes */}
        {stems.map((stem, i) => {
          const angle = (i / stems.length) * 360;
          const radius = 120; // Distance from center
          return (
            <motion.div
              key={stem.id}
              className={cn(
                "absolute w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-500",
                stem.active 
                  ? "bg-black/60 border-white/30 text-white shadow-[0_0_20px_rgba(255,255,255,0.2)]" 
                  : "bg-black/20 border-white/5 text-white/20 grayscale"
              )}
              style={{
                top: `calc(50% + ${Math.sin(angle * Math.PI / 180) * radius}px - 24px)`,
                left: `calc(50% + ${Math.cos(angle * Math.PI / 180) * radius}px - 24px)`,
                boxShadow: stem.active ? `0 0 20px ${stem.color}60` : 'none',
                borderColor: stem.active ? stem.color : 'rgba(255,255,255,0.1)'
              }}
              animate={{
                scale: stem.active ? 1 : 0.8,
              }}
            >
              <stem.icon className="w-6 h-6" style={{ color: stem.active ? stem.color : 'inherit' }} />
              
              {/* Connecting Line to Center */}
              <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] pointer-events-none -z-10 overflow-visible" style={{ transform: `rotate(${-angle - 90}deg)` }}>
                <line 
                  x1="120" y1="120" 
                  x2="120" y2="40" 
                  stroke={stem.active ? stem.color : "rgba(255,255,255,0.05)"} 
                  strokeWidth="2" 
                  strokeDasharray="4 4"
                  opacity={stem.active ? 0.6 : 0.1}
                />
              </svg>
            </motion.div>
          );
        })}
      </div>

      {/* Control Panel */}
      <div className="flex-1 w-full max-w-sm bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Stem Separation
          </h3>
          <div className="text-xs font-mono text-cyan-400/70 bg-cyan-900/20 px-2 py-1 rounded">
            AI ENGINE ACTIVE
          </div>
        </div>

        <div className="space-y-3">
          {stems.map((stem) => (
            <div key={stem.id} className="flex items-center gap-3">
              <Button
                variant="outline"
                className={cn(
                  "w-12 h-12 p-0 rounded-xl border-white/10 transition-all",
                  stem.active ? "bg-white/10 text-white" : "bg-transparent text-white/30 hover:bg-white/5"
                )}
                onClick={() => toggleStem(stem.id)}
                style={{ borderColor: stem.active ? stem.color : '' }}
              >
                <stem.icon className="w-5 h-5" />
              </Button>
              
              <div className="flex-1 h-10 bg-black/40 rounded-lg border border-white/5 relative overflow-hidden flex items-center px-2 gap-1">
                {/* Fake waveform bars */}
                {Array.from({ length: 15 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 rounded-full"
                    style={{ backgroundColor: stem.active ? stem.color : '#333' }}
                    animate={{
                      height: stem.active 
                        ? [
                            `${20 + Math.random() * 60}%`, 
                            `${30 + Math.random() * 50}%`, 
                            `${20 + Math.random() * 60}%`
                          ] 
                        : '10%',
                      opacity: stem.active ? 0.8 : 0.2
                    }}
                    transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.05 }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <p className="mt-6 text-xs text-center text-muted-foreground">
          Click icons to isolate or mute individual stems in real-time.
        </p>
      </div>
    </div>
  );
}
