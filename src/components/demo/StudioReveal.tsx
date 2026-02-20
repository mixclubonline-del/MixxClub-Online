/**
 * StudioReveal - Phase 5: "Create Without Limits"
 * Animated DAW/Dream Engine showcase with floating channel strips,
 * AI brain pulse, and self-drawing waveform. Audio-reactive meters.
 */

import { motion } from 'framer-motion';
import { Cpu, Radio, Globe, Waves } from 'lucide-react';
import { AIBrainIcon } from '@/components/plugins/shared/AIBrainIcon';

interface StudioRevealProps {
  amplitude: number;
  bass: number;
  isPlaying: boolean;
}

const FEATURES = [
  { icon: Cpu, label: 'AI-Powered Mastering', color: 'from-indigo-500 to-blue-500' },
  { icon: Radio, label: 'Real-Time Collaboration', color: 'from-purple-500 to-indigo-500' },
  { icon: Globe, label: 'Browser-Native DAW', color: 'from-blue-500 to-cyan-500' },
];

const CHANNELS = [
  { name: 'VOX', color: 'bg-cyan-500', pan: -0.3 },
  { name: 'DRUMS', color: 'bg-primary', pan: 0 },
  { name: 'BASS', color: 'bg-purple-500', pan: 0.2 },
  { name: 'SYNTH', color: 'bg-indigo-500', pan: -0.1 },
  { name: 'FX', color: 'bg-blue-500', pan: 0.4 },
];

export const StudioReveal = ({ amplitude, bass, isPlaying }: StudioRevealProps) => {
  return (
    <motion.div
      className="relative w-full max-w-5xl mx-auto text-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      {/* Headline */}
      <motion.div
        className="mb-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div className="flex justify-center mb-6">
          <AIBrainIcon size={40} animated={isPlaying} />
        </motion.div>

        <motion.h1
          className="text-4xl md:text-6xl lg:text-7xl font-black mb-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400">
            Create Without Limits
          </span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          A studio that lives in your browser. AI mastering. Stem separation. Real-time collaboration. No downloads. No plugins. Just create.
        </motion.p>
      </motion.div>

      {/* Floating Channel Strips — stylized DAW mockup */}
      <motion.div
        className="rounded-2xl bg-background/60 backdrop-blur-md border border-border/20 p-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex items-end justify-center gap-3 md:gap-5 h-40">
          {CHANNELS.map((ch, i) => {
            const level = isPlaying
              ? 0.3 + (Math.sin(Date.now() / 300 + i * 1.5) * 0.2) + (bass / 255) * 0.4
              : 0.2;
            return (
              <motion.div
                key={ch.name}
                className="flex flex-col items-center gap-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + i * 0.1 }}
              >
                {/* Meter */}
                <div className="w-6 md:w-8 h-28 rounded-lg bg-muted/40 border border-border/30 relative overflow-hidden">
                  <motion.div
                    className={`absolute bottom-0 left-0 right-0 rounded-b-md ${ch.color}`}
                    animate={{ height: `${level * 100}%` }}
                    transition={{ duration: 0.1 }}
                    style={{ opacity: 0.8 }}
                  />
                  {/* Peak indicator */}
                  <motion.div
                    className={`absolute left-0 right-0 h-0.5 ${ch.color}`}
                    animate={{ bottom: `${Math.min(level * 100 + 5, 98)}%` }}
                    transition={{ duration: 0.15 }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground font-mono">{ch.name}</span>
              </motion.div>
            );
          })}
        </div>

        {/* Waveform timeline */}
        <motion.div
          className="mt-4 h-8 rounded-lg bg-muted/20 border border-border/20 overflow-hidden relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <svg width="100%" height="100%" viewBox="0 0 400 32" preserveAspectRatio="none">
            <defs>
              <linearGradient id="studio-wave-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
                <stop offset="50%" stopColor="rgb(129, 140, 248)" stopOpacity="0.6" />
                <stop offset="100%" stopColor="rgb(34, 211, 238)" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            <motion.path
              d={`M0,16 ${Array.from({ length: 80 }, (_, i) => {
                const x = (i / 80) * 400;
                const y = 16 + Math.sin(i * 0.5) * 10 + Math.sin(i * 1.3) * 4;
                return `L${x},${y}`;
              }).join(' ')}`}
              fill="none"
              stroke="url(#studio-wave-grad)"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: 'easeInOut', delay: 1.6 }}
            />
          </svg>
          {/* Playhead */}
          <motion.div
            className="absolute top-0 bottom-0 w-0.5 bg-primary"
            animate={{ left: isPlaying ? ['0%', '100%'] : '0%' }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      </motion.div>

      {/* Feature Pills */}
      <motion.div
        className="flex flex-wrap justify-center gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8 }}
      >
        {FEATURES.map((feat, i) => {
          const Icon = feat.icon;
          return (
            <motion.div
              key={feat.label}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2 + i * 0.15 }}
              whileHover={{ scale: 1.05 }}
            >
              <Icon className="w-4 h-4 text-indigo-400" />
              <span className="text-sm text-foreground/80">{feat.label}</span>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
};
