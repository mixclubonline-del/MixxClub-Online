import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Volume2, VolumeX, Sparkles, TrendingUp, BarChart3 } from 'lucide-react';

interface TransformationVisualProps {
  amplitude: number;
  bass: number;
  isPlaying: boolean;
}

const QUALITY_TAGS_BEFORE = [
  { label: 'Muddy', desc: '-6 dB sub buildup' },
  { label: 'Quiet', desc: '-24 LUFS integrated' },
  { label: 'Unbalanced', desc: 'L/R phase issues' },
];

const QUALITY_TAGS_AFTER = [
  { label: 'Clear', desc: 'Surgical EQ applied' },
  { label: 'Loud', desc: '-14 LUFS streaming-ready' },
  { label: 'Professional', desc: 'Mastered to spec' },
];

const METER_BANDS = ['Sub', '80', '250', '800', '2k', '5k', '10k', '16k'];

export const TransformationVisual = ({ amplitude, bass, isPlaying }: TransformationVisualProps) => {
  const [showAfter, setShowAfter] = useState(false);
  const [lufs, setLufs] = useState(-24);
  const [tick, setTick] = useState(0);

  // Tick for waveform animation
  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => setTick(t => t + 1), 80);
    return () => clearInterval(id);
  }, [isPlaying]);

  // Auto-toggle before/after
  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => setShowAfter(prev => !prev), 4500);
    return () => clearInterval(id);
  }, [isPlaying]);

  // Animate LUFS
  useEffect(() => {
    if (showAfter) {
      const target = -14;
      const start = -24;
      const dur = 1800;
      const t0 = Date.now();
      const run = () => {
        const p = Math.min((Date.now() - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setLufs(start + (target - start) * eased);
        if (p < 1) requestAnimationFrame(run);
      };
      run();
    } else {
      setLufs(-24);
    }
  }, [showAfter]);

  // Waveform generator — stable between ticks
  const generateWaveform = useCallback((isAfter: boolean) => {
    return [...Array(40)].map((_, i) => {
      if (isAfter) {
        // Clean, consistent, professional waveform
        const base = 55;
        const sine = Math.sin(tick * 0.08 + i * 0.4) * 15;
        const audio = isPlaying ? (amplitude / 255) * 12 : 0;
        return Math.max(25, Math.min(90, base + sine + audio));
      } else {
        // Erratic, muddy, uncontrolled waveform
        const base = 25;
        const chaos = Math.sin(tick * 0.12 + i * 1.7) * 30 + Math.cos(tick * 0.07 + i * 0.9) * 20;
        const audio = isPlaying ? (amplitude / 255) * 8 : 0;
        return Math.max(5, Math.min(95, base + chaos + audio));
      }
    });
  }, [tick, isPlaying, amplitude]);

  const beforeWave = useMemo(() => generateWaveform(false), [generateWaveform]);
  const afterWave = useMemo(() => generateWaveform(true), [generateWaveform]);

  // Spectrum bands
  const spectrumBefore = useMemo(() =>
    METER_BANDS.map((_, i) => 15 + Math.sin(tick * 0.1 + i * 2) * 25 + Math.random() * 15),
    [tick]
  );
  const spectrumAfter = useMemo(() =>
    METER_BANDS.map((_, i) => {
      // Professional curve: controlled sub, strong mids, tamed highs
      const curve = [35, 50, 65, 70, 68, 55, 40, 30];
      return curve[i] + Math.sin(tick * 0.06 + i) * 5 + (isPlaying ? (amplitude / 255) * 8 : 0);
    }),
    [tick, isPlaying, amplitude]
  );

  const lufsPercent = ((lufs + 30) / 30) * 100;
  const beforeLufsPercent = ((-24 + 30) / 30) * 100;

  return (
    <motion.div
      className="w-full max-w-5xl mx-auto px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <motion.div
        className="text-center mb-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h2 className="text-4xl md:text-6xl font-black mb-3">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-amber-500">
            Hear the Difference
          </span>
        </h2>
        <p className="text-base text-muted-foreground">
          Raw session → mastered release. Same track, engineered to compete.
        </p>
      </motion.div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">

        {/* ──── BEFORE PANEL ──── */}
        <motion.div
          className={`relative rounded-2xl border-2 transition-all duration-700 overflow-hidden ${
            !showAfter
              ? 'border-destructive/40 bg-destructive/5'
              : 'border-border/20 bg-muted/20 opacity-50'
          }`}
          animate={{ scale: !showAfter ? 1 : 0.97 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <div className="p-5 space-y-4">
            {/* Header Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-destructive/20 flex items-center justify-center">
                  <VolumeX className="w-4 h-4 text-destructive" />
                </div>
                <div>
                  <span className="font-bold text-sm text-destructive">Before</span>
                  <p className="text-[10px] text-muted-foreground">Raw session</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-mono font-bold text-destructive">-24</span>
                <p className="text-[10px] text-muted-foreground">LUFS</p>
              </div>
            </div>

            {/* Quality Tags */}
            <div className="flex flex-wrap gap-1.5">
              {QUALITY_TAGS_BEFORE.map((tag, i) => (
                <motion.div
                  key={i}
                  className="group relative"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <span className="inline-flex items-center text-[11px] px-2.5 py-1 rounded-md bg-destructive/10 text-destructive/80 border border-destructive/20 font-medium">
                    {tag.label}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Waveform */}
            <div className="h-20 flex items-center gap-px rounded-xl bg-background/60 p-2 border border-border/10">
              {beforeWave.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-full bg-destructive/30"
                  style={{ height: `${h}%`, transition: 'height 80ms ease-out' }}
                />
              ))}
            </div>

            {/* LUFS Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Integrated Loudness</span>
                <span className="font-mono">-24 LUFS</span>
              </div>
              <div className="h-2.5 bg-muted/40 rounded-full overflow-hidden border border-border/10">
                <div
                  className="h-full bg-destructive/50 rounded-full"
                  style={{ width: `${beforeLufsPercent}%`, transition: 'width 300ms ease' }}
                />
              </div>
            </div>

            {/* Spectrum Mini */}
            <div className="flex items-end gap-1 h-10">
              {METER_BANDS.map((band, i) => (
                <div key={band} className="flex-1 flex flex-col items-center gap-0.5">
                  <div
                    className="w-full rounded-t-sm bg-destructive/25"
                    style={{
                      height: `${Math.max(4, spectrumBefore[i])}%`,
                      transition: 'height 80ms ease-out',
                    }}
                  />
                  <span className="text-[7px] text-muted-foreground/50">{band}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ──── AFTER PANEL ──── */}
        <motion.div
          className={`relative rounded-2xl border-2 transition-all duration-700 overflow-hidden ${
            showAfter
              ? 'border-emerald-500/40 bg-emerald-500/5'
              : 'border-border/20 bg-muted/20 opacity-50'
          }`}
          animate={{ scale: showAfter ? 1 : 0.97 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <div className="p-5 space-y-4">
            {/* Header Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Volume2 className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <span className="font-bold text-sm text-emerald-500">After</span>
                  <p className="text-[10px] text-muted-foreground">Mastered</p>
                </div>
              </div>
              <div className="text-right">
                <motion.span
                  className="text-lg font-mono font-bold text-emerald-500"
                  key={showAfter ? 'after' : 'before-val'}
                >
                  {showAfter ? lufs.toFixed(0) : '-14'}
                </motion.span>
                <p className="text-[10px] text-muted-foreground">LUFS</p>
              </div>
            </div>

            {/* Quality Tags */}
            <div className="flex flex-wrap gap-1.5">
              {QUALITY_TAGS_AFTER.map((tag, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <span className="inline-flex items-center text-[11px] px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                    {tag.label}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Waveform */}
            <div className="h-20 flex items-center gap-px rounded-xl bg-background/60 p-2 border border-border/10">
              {afterWave.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-full"
                  style={{
                    height: `${showAfter ? h : 15}%`,
                    transition: 'height 80ms ease-out',
                    background: 'linear-gradient(to top, hsl(var(--primary) / 0.6), rgb(52 211 153))',
                  }}
                />
              ))}
            </div>

            {/* LUFS Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Integrated Loudness</span>
                <span className="font-mono text-emerald-500">{showAfter ? `${lufs.toFixed(0)} LUFS` : '-14 LUFS'}</span>
              </div>
              <div className="h-2.5 bg-muted/40 rounded-full overflow-hidden border border-border/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                  animate={{ width: `${lufsPercent}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            </div>

            {/* Spectrum Mini */}
            <div className="flex items-end gap-1 h-10">
              {METER_BANDS.map((band, i) => (
                <div key={band} className="flex-1 flex flex-col items-center gap-0.5">
                  <div
                    className="w-full rounded-t-sm"
                    style={{
                      height: `${Math.max(4, showAfter ? spectrumAfter[i] : 10)}%`,
                      transition: 'height 80ms ease-out',
                      background: 'linear-gradient(to top, hsl(var(--primary) / 0.4), rgb(52 211 153 / 0.6))',
                    }}
                  />
                  <span className="text-[7px] text-muted-foreground/50">{band}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Comparison Insight Bar */}
      <motion.div
        className="flex justify-center mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="inline-flex items-center gap-4 px-5 py-2.5 rounded-xl bg-background/60 backdrop-blur-sm border border-border/20">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs text-muted-foreground">+10 dB LUFS</span>
          </div>
          <div className="w-px h-4 bg-border/30" />
          <div className="flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs text-muted-foreground">Balanced spectrum</span>
          </div>
          <div className="w-px h-4 bg-border/30" />
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs text-muted-foreground">Streaming-ready</span>
          </div>
        </div>
      </motion.div>

      {/* Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-xl bg-muted/30 border border-border/20 p-1 gap-1">
          <button
            onClick={() => setShowAfter(false)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              !showAfter
                ? 'bg-destructive/20 text-destructive shadow-sm shadow-destructive/10'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Before
          </button>
          <button
            onClick={() => setShowAfter(true)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              showAfter
                ? 'bg-emerald-500/20 text-emerald-400 shadow-sm shadow-emerald-500/10'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            After
          </button>
        </div>
      </div>
    </motion.div>
  );
};
