/**
 * StudioReveal - Phase 5: "Create Without Limits"
 * Full DAW mockup with animated channel strips, master bus,
 * self-drawing waveform timeline, and AI brain pulse.
 * Designed for presence — this phase should land, not fly by.
 */

import { motion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { Cpu, Radio, Globe, Mic, Piano, Drum, Guitar, Waves } from 'lucide-react';
import { AIBrainIcon } from '@/components/plugins/shared/AIBrainIcon';

interface StudioRevealProps {
  amplitude: number;
  bass: number;
  isPlaying: boolean;
}

const FEATURES = [
  { icon: Cpu, label: 'AI Mastering' },
  { icon: Radio, label: 'Real-Time Collab' },
  { icon: Globe, label: 'Browser-Native' },
];

const CHANNELS = [
  { name: 'VOX', icon: Mic, hue: 180 },
  { name: 'KEYS', icon: Piano, hue: 260 },
  { name: 'DRUMS', icon: Drum, hue: 300 },
  { name: 'BASS', icon: Guitar, hue: 220 },
  { name: 'SYNTH', icon: Waves, hue: 200 },
  { name: 'FX', icon: Cpu, hue: 280 },
];

export const StudioReveal = ({ amplitude, bass, isPlaying }: StudioRevealProps) => {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => setTick(t => t + 1), 60);
    return () => clearInterval(id);
  }, [isPlaying]);

  // Channel levels — each channel has a unique rhythm
  const channelLevels = useMemo(() =>
    CHANNELS.map((_, i) => {
      if (!isPlaying) return 0.15;
      const base = 0.3 + Math.sin(tick * 0.05 + i * 1.2) * 0.2;
      const bassBoost = i === 3 ? (bass / 255) * 0.3 : 0;
      const ampBoost = (amplitude / 255) * 0.25;
      return Math.min(0.95, Math.max(0.1, base + bassBoost + ampBoost));
    }),
    [tick, isPlaying, amplitude, bass]
  );

  // Master bus level
  const masterLevel = useMemo(() => {
    if (!isPlaying) return 0.1;
    return Math.min(0.92, 0.4 + (amplitude / 255) * 0.35 + (bass / 255) * 0.15);
  }, [isPlaying, amplitude, bass]);

  // Waveform path for the timeline
  const waveformPath = useMemo(() => {
    const points = Array.from({ length: 100 }, (_, i) => {
      const x = (i / 100) * 500;
      const y = 20 + Math.sin(i * 0.3 + tick * 0.04) * 12 + Math.sin(i * 0.7) * 5;
      return `${x},${y}`;
    });
    return `M0,20 L${points.join(' L')}`;
  }, [tick]);

  return (
    <motion.div
      className="relative w-full max-w-5xl mx-auto text-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      {/* ── Headline ── */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="flex justify-center mb-5"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          <div className="relative">
            <AIBrainIcon size={44} animated={isPlaying} />
            {isPlaying && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  boxShadow: '0 0 30px 8px hsl(var(--primary) / 0.3)',
                }}
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </div>
        </motion.div>

        <motion.h1
          className="text-4xl md:text-6xl lg:text-7xl font-black mb-3"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400">
            Create Without Limits
          </span>
        </motion.h1>

        <motion.p
          className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          A studio that lives in your browser. No downloads. No plugins. Just flow.
        </motion.p>
      </motion.div>

      {/* ── DAW Mockup ── */}
      <motion.div
        className="rounded-2xl bg-background/70 backdrop-blur-md border border-border/30 overflow-hidden mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        {/* Transport Bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/20 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">F.L.O.W. Studio</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
            <span>120 BPM</span>
            <span>4/4</span>
            <span>C Minor</span>
          </div>
        </div>

        {/* Channel Strips + Master */}
        <div className="p-4">
          <div className="flex gap-2 md:gap-3">
            {/* Individual Channels */}
            {CHANNELS.map((ch, i) => {
              const Icon = ch.icon;
              const level = channelLevels[i];
              const isHot = level > 0.8;

              return (
                <motion.div
                  key={ch.name}
                  className="flex-1 flex flex-col items-center"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + i * 0.08 }}
                >
                  {/* Channel label */}
                  <div className="flex items-center gap-1 mb-2">
                    <Icon className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[9px] font-mono text-muted-foreground">{ch.name}</span>
                  </div>

                  {/* Fader/Meter */}
                  <div className="w-full h-28 md:h-32 rounded-lg bg-muted/30 border border-border/20 relative overflow-hidden">
                    {/* Level fill */}
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 rounded-b-md"
                      style={{
                        background: `linear-gradient(to top, hsl(${ch.hue} 70% 45%), hsl(${ch.hue} 60% 60% / 0.6))`,
                      }}
                      animate={{ height: `${level * 100}%` }}
                      transition={{ duration: 0.06 }}
                    />
                    {/* Peak line */}
                    <motion.div
                      className="absolute left-0 right-0 h-px"
                      style={{ background: `hsl(${ch.hue} 70% 65%)` }}
                      animate={{ bottom: `${Math.min(level * 100 + 3, 98)}%` }}
                      transition={{ duration: 0.1 }}
                    />
                    {/* Clip indicator */}
                    {isHot && (
                      <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                    )}
                  </div>

                  {/* dB readout */}
                  <span className="text-[8px] font-mono text-muted-foreground/60 mt-1">
                    {(level * -6 - 6).toFixed(0)}dB
                  </span>
                </motion.div>
              );
            })}

            {/* Master Bus — wider, accented */}
            <motion.div
              className="flex flex-col items-center ml-2 md:ml-3"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
            >
              <div className="flex items-center gap-1 mb-2">
                <span className="text-[9px] font-mono font-bold text-primary">MST</span>
              </div>
              <div className="w-8 md:w-10 h-28 md:h-32 rounded-lg bg-primary/10 border border-primary/30 relative overflow-hidden">
                {/* Stereo L */}
                <motion.div
                  className="absolute bottom-0 left-0 w-[45%] rounded-bl-md bg-gradient-to-t from-primary to-primary/50"
                  animate={{ height: `${masterLevel * 100}%` }}
                  transition={{ duration: 0.06 }}
                />
                {/* Stereo R */}
                <motion.div
                  className="absolute bottom-0 right-0 w-[45%] rounded-br-md bg-gradient-to-t from-primary to-primary/50"
                  animate={{ height: `${(masterLevel * 0.95 + Math.sin(tick * 0.03) * 0.03) * 100}%` }}
                  transition={{ duration: 0.06 }}
                />
              </div>
              <span className="text-[8px] font-mono text-primary/70 mt-1">
                {(-14 + masterLevel * 4).toFixed(1)}
              </span>
            </motion.div>
          </div>
        </div>

        {/* Waveform Timeline */}
        <motion.div
          className="mx-4 mb-4 h-10 rounded-lg bg-muted/15 border border-border/15 overflow-hidden relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <svg width="100%" height="100%" viewBox="0 0 500 40" preserveAspectRatio="none">
            <defs>
              <linearGradient id="studio-wave-grad-v2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.7" />
                <stop offset="50%" stopColor="rgb(129, 140, 248)" stopOpacity="0.5" />
                <stop offset="100%" stopColor="rgb(34, 211, 238)" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            <motion.path
              d={waveformPath}
              fill="none"
              stroke="url(#studio-wave-grad-v2)"
              strokeWidth="1.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2.5, ease: 'easeInOut', delay: 1.6 }}
            />
          </svg>
          {/* Playhead */}
          <motion.div
            className="absolute top-0 bottom-0 w-px bg-primary shadow-sm shadow-primary/50"
            animate={{ left: isPlaying ? ['0%', '100%'] : '0%' }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      </motion.div>

      {/* Feature Pills */}
      <motion.div
        className="flex flex-wrap justify-center gap-2"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2 }}
      >
        {FEATURES.map((feat, i) => {
          const Icon = feat.icon;
          return (
            <motion.div
              key={feat.label}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/8 border border-indigo-500/20 backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.1 + i * 0.12 }}
              whileHover={{ scale: 1.05 }}
            >
              <Icon className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs text-foreground/70">{feat.label}</span>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
};
