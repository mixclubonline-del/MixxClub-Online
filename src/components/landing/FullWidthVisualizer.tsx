import { motion } from 'framer-motion';
import { useState } from 'react';
import { AudioVisualizer } from '@/components/demo/AudioVisualizer';
import { Play, Pause, Volume2, Waves, Circle, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInsiderAudio } from '@/hooks/useInsiderAudio';

type VisualizerMode = 'bars' | 'wave' | 'circle';

export const FullWidthVisualizer = () => {
  const { isPlaying, analysis, toggle, isReady, initAudio } = useInsiderAudio();
  const [mode, setMode] = useState<VisualizerMode>('bars');

  const handleStart = async () => {
    await initAudio();
    toggle();
  };

  const modes: { value: VisualizerMode; icon: typeof BarChart3; label: string }[] = [
    { value: 'bars', icon: BarChart3, label: 'Bars' },
    { value: 'wave', icon: Waves, label: 'Wave' },
    { value: 'circle', icon: Circle, label: 'Circle' },
  ];

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background gradient */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: isPlaying
            ? `linear-gradient(180deg, 
                hsl(var(--background)) 0%, 
                hsl(${270 + (analysis.amplitude / 255) * 20} 40% 8%) 50%, 
                hsl(var(--background)) 100%)`
            : 'linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--card)) 50%, hsl(var(--background)) 100%)'
        }}
        transition={{ duration: 0.5 }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent-cyan))]">
              Live Audio Technology
            </span>
          </h2>
          <p className="text-muted-foreground">Click different modes to see our audio engine in action</p>
        </motion.div>

        {/* Mode Selector */}
        <div className="flex justify-center gap-2 mb-8">
          {modes.map(({ value, icon: Icon, label }) => (
            <Button
              key={value}
              size="sm"
              variant={mode === value ? 'default' : 'outline'}
              onClick={() => setMode(value)}
              className={`transition-all ${
                mode === value
                  ? 'bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent-blue))] shadow-[0_0_20px_hsl(var(--primary)/0.5)]'
                  : 'glass border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </Button>
          ))}
        </div>

        {/* Visualizer Container */}
        <motion.div
          className="relative h-48 md:h-64 rounded-2xl overflow-hidden glass-near border border-[hsl(var(--glass-border))]"
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.3 }}
        >
          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 opacity-30 pointer-events-none"
            animate={{
              boxShadow: isPlaying
                ? `inset 0 0 ${50 + analysis.amplitude / 3}px hsl(var(--primary) / 0.3)`
                : 'none'
            }}
          />

          {/* Play overlay when not playing */}
          {!isPlaying && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center z-10 bg-[hsl(var(--background)/0.5)]"
            >
              <Button
                size="lg"
                onClick={handleStart}
                className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent-cyan))] hover:shadow-[0_0_40px_hsl(var(--primary)/0.8)] transition-all"
              >
                <Play className="w-6 h-6 mr-2" />
                Activate Visualizer
              </Button>
            </motion.div>
          )}

          {/* The Visualizer */}
          <AudioVisualizer
            beats={analysis.beats}
            amplitude={analysis.amplitude}
            bass={analysis.bass}
            variant={mode}
            className="w-full h-full"
          />

          {/* Floating controls when playing */}
          {isPlaying && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3"
            >
              <Button
                size="sm"
                variant="ghost"
                onClick={toggle}
                className="glass-pill hover:bg-[hsl(var(--primary)/0.2)]"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <div className="glass-pill px-3 py-1.5 text-xs font-mono">
                <span className="text-[hsl(var(--primary))]">{Math.round(analysis.amplitude)}</span>
                <span className="text-muted-foreground"> amplitude</span>
              </div>
              <div className="glass-pill px-3 py-1.5 text-xs font-mono">
                <span className="text-[hsl(var(--accent-cyan))]">{Math.round(analysis.bass)}</span>
                <span className="text-muted-foreground"> bass</span>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex justify-center gap-8 mt-8"
        >
          {[
            { label: 'Real-time Analysis', value: '< 1ms' },
            { label: 'Frequency Bands', value: '32' },
            { label: 'Sample Rate', value: '48kHz' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent-cyan))]">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
