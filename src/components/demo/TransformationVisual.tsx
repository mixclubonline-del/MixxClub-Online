import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Sparkles, ArrowRight } from 'lucide-react';
import beforeAfterImg from '@/assets/promo/before-after-master.jpg';
import mixingFeedbackImg from '@/assets/promo/mixing-realtime-feedback.jpg';

interface TransformationVisualProps {
  amplitude: number;
  bass: number;
  isPlaying: boolean;
}

const BEFORE_LABELS = ['Muddy', 'Quiet', 'Unbalanced'];
const AFTER_LABELS = ['Clear', 'Loud', 'Professional'];

export const TransformationVisual = ({ amplitude, bass, isPlaying }: TransformationVisualProps) => {
  const [showAfter, setShowAfter] = useState(false);
  const [lufs, setLufs] = useState(-24);

  // Auto-toggle between before/after
  useEffect(() => {
    if (!isPlaying) return;

    const toggleInterval = setInterval(() => {
      setShowAfter(prev => !prev);
    }, 4000);

    return () => clearInterval(toggleInterval);
  }, [isPlaying]);

  // Animate LUFS meter when showing "after"
  useEffect(() => {
    if (showAfter) {
      const targetLufs = -14;
      const startLufs = -24;
      const duration = 2000;
      const startTime = Date.now();

      const animateLufs = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setLufs(startLufs + (targetLufs - startLufs) * eased);

        if (progress < 1) {
          requestAnimationFrame(animateLufs);
        }
      };

      animateLufs();
    } else {
      setLufs(-24);
    }
  }, [showAfter]);

  // Generate waveform bars
  const generateWaveform = (isAfter: boolean) => {
    return [...Array(32)].map((_, i) => {
      const baseHeight = isAfter ? 50 : 20;
      const variance = isAfter ? 40 : 60;
      const audioBoost = isPlaying ? (amplitude / 255) * 20 : 0;
      const height = baseHeight + Math.sin(Date.now() / 200 + i * 0.3) * variance * (isAfter ? 0.3 : 1) + audioBoost;
      return Math.max(10, Math.min(100, height));
    });
  };

  return (
    <motion.div
      className="w-full max-w-5xl mx-auto px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h2 className="text-4xl md:text-5xl font-black mb-3">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-amber-500">
            This Is What Happens
          </span>
        </h2>
        <p className="text-lg text-muted-foreground">
          When vision meets craft.
        </p>
      </motion.div>

      {/* Transformation Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Before */}
        <motion.div
          className={`relative p-6 rounded-2xl border-2 transition-all duration-500 overflow-hidden ${
            !showAfter
              ? 'border-destructive/50 bg-destructive/5 backdrop-blur-sm'
              : 'border-muted-foreground/20 bg-muted/30 opacity-60 backdrop-blur-sm'
          }`}
          animate={{ scale: !showAfter ? 1 : 0.98 }}
        >
          {/* Subtle background image */}
          <img
            src={beforeAfterImg}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: 0.1 }}
          />
          <div className="absolute inset-0 bg-background/70" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <VolumeX className="w-5 h-5 text-destructive/70" />
                <span className="font-bold text-destructive">Before</span>
              </div>
              <div className="flex gap-2">
                {BEFORE_LABELS.map((label, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-1 rounded-full bg-destructive/20 text-destructive/80"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Waveform - Messy */}
            <div className="h-24 flex items-center gap-0.5 rounded-lg bg-background/50 backdrop-blur-sm p-2">
              {generateWaveform(false).map((height, i) => (
                <motion.div
                  key={i}
                  className="flex-1 rounded-full bg-destructive/40"
                  style={{ height: `${height}%` }}
                  animate={{
                    height: `${height}%`,
                    opacity: 0.4 + Math.random() * 0.3,
                  }}
                  transition={{ duration: 0.15 }}
                />
              ))}
            </div>

            {/* LUFS Meter - Low */}
            <div className="mt-4 flex items-center gap-3">
              <span className="text-xs text-muted-foreground">LUFS</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-destructive/60 rounded-full"
                  style={{ width: `${((lufs + 30) / 30) * 100}%` }}
                />
              </div>
              <span className="text-xs font-mono text-destructive">-24</span>
            </div>
          </div>
        </motion.div>

        {/* After */}
        <motion.div
          className={`relative p-6 rounded-2xl border-2 transition-all duration-500 overflow-hidden ${
            showAfter
              ? 'border-emerald-500/50 bg-emerald-500/5 backdrop-blur-sm'
              : 'border-muted-foreground/20 bg-muted/30 opacity-60 backdrop-blur-sm'
          }`}
          animate={{ scale: showAfter ? 1 : 0.98 }}
        >
          {/* Subtle background image */}
          <img
            src={mixingFeedbackImg}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: 0.1 }}
          />
          <div className="absolute inset-0 bg-background/70" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-emerald-500" />
                <span className="font-bold text-emerald-500">After</span>
              </div>
              <div className="flex gap-2">
                {AFTER_LABELS.map((label, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Waveform - Clean */}
            <div className="h-24 flex items-center gap-0.5 rounded-lg bg-background/50 backdrop-blur-sm p-2">
              {generateWaveform(true).map((height, i) => (
                <motion.div
                  key={i}
                  className="flex-1 rounded-full bg-gradient-to-t from-emerald-500 to-emerald-400"
                  style={{ height: `${showAfter ? height : 20}%` }}
                  animate={{
                    height: `${showAfter ? height : 20}%`,
                  }}
                  transition={{ duration: 0.15 }}
                />
              ))}
            </div>

            {/* LUFS Meter - Professional */}
            <div className="mt-4 flex items-center gap-3">
              <span className="text-xs text-muted-foreground">LUFS</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-emerald-500 rounded-full"
                  animate={{ width: `${((lufs + 30) / 30) * 100}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <span className="text-xs font-mono text-emerald-500">
                {lufs.toFixed(0)}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Arrow transition indicator */}
      <motion.div
        className="flex justify-center mb-8"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-primary/10 border border-primary/30 backdrop-blur-sm">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">Real engineers. Real transformation.</span>
          <ArrowRight className="w-4 h-4 text-primary" />
        </div>
      </motion.div>

      {/* Toggle buttons */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setShowAfter(false)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            !showAfter
              ? 'bg-destructive/20 text-destructive border border-destructive/40'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Before
        </button>
        <button
          onClick={() => setShowAfter(true)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            showAfter
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          After
        </button>
      </div>
    </motion.div>
  );
};
