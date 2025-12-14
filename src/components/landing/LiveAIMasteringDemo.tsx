import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Upload, Wand2, Check, Music, Activity, Gauge, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AnalysisResult {
  genre: string;
  bpm: number;
  key: string;
  energy: number;
  clarity: number;
  loudness: number;
}

const DEMO_TRACKS = [
  { name: 'Summer Vibes.wav', genre: 'Hip-Hop', bpm: 95, key: 'Am', energy: 78, clarity: 82, loudness: -8 },
  { name: 'Midnight Session.mp3', genre: 'R&B', bpm: 72, key: 'Dm', energy: 65, clarity: 88, loudness: -10 },
  { name: 'Club Banger.wav', genre: 'Trap', bpm: 140, key: 'Gm', energy: 95, clarity: 75, loudness: -6 },
];

export const LiveAIMasteringDemo = () => {
  const [stage, setStage] = useState<'idle' | 'uploading' | 'analyzing' | 'complete'>('idle');
  const [progress, setProgress] = useState(0);
  const [currentTrack, setCurrentTrack] = useState(DEMO_TRACKS[0]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const runDemo = () => {
    // Pick random track
    const track = DEMO_TRACKS[Math.floor(Math.random() * DEMO_TRACKS.length)];
    setCurrentTrack(track);
    setStage('uploading');
    setProgress(0);

    // Simulate upload
    const uploadInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(uploadInterval);
          setStage('analyzing');
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 100);
  };

  useEffect(() => {
    if (stage === 'analyzing') {
      // Simulate analysis
      const timer = setTimeout(() => {
        setAnalysis({
          genre: currentTrack.genre,
          bpm: currentTrack.bpm,
          key: currentTrack.key,
          energy: currentTrack.energy,
          clarity: currentTrack.clarity,
          loudness: currentTrack.loudness,
        });
        setStage('complete');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [stage, currentTrack]);

  const resetDemo = () => {
    setStage('idle');
    setProgress(0);
    setAnalysis(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-near rounded-2xl p-6 border border-[hsl(var(--glass-border))] hover:border-[hsl(var(--glass-border-glow))] transition-all overflow-hidden relative"
    >
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0 opacity-20 pointer-events-none"
        animate={{
          background: stage === 'analyzing' 
            ? [
                'radial-gradient(circle at 30% 50%, hsl(270 100% 60%) 0%, transparent 50%)',
                'radial-gradient(circle at 70% 50%, hsl(200 100% 60%) 0%, transparent 50%)',
                'radial-gradient(circle at 30% 50%, hsl(270 100% 60%) 0%, transparent 50%)',
              ]
            : 'transparent'
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6 relative">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent-cyan))] flex items-center justify-center">
          <Wand2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold">AI Mastering Demo</h3>
          <p className="text-sm text-muted-foreground">See our AI analyze a track in seconds</p>
        </div>
      </div>

      {/* Content based on stage */}
      <div className="relative min-h-[200px]">
        {stage === 'idle' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full py-8"
          >
            <motion.div
              className="w-24 h-24 rounded-2xl border-2 border-dashed border-[hsl(var(--primary)/0.5)] flex items-center justify-center mb-4 cursor-pointer hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.1)] transition-all"
              whileHover={{ scale: 1.05 }}
              onClick={runDemo}
            >
              <Upload className="w-10 h-10 text-[hsl(var(--primary))]" />
            </motion.div>
            <Button onClick={runDemo} variant="outline" className="glass-pill">
              <Music className="w-4 h-4 mr-2" />
              Try Demo Track
            </Button>
          </motion.div>
        )}

        {stage === 'uploading' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-8"
          >
            <div className="text-center mb-4">
              <p className="text-sm text-muted-foreground">Uploading {currentTrack.name}</p>
            </div>
            <div className="h-2 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent-cyan))]"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <p className="text-center text-sm text-muted-foreground mt-2">
              {Math.round(Math.min(progress, 100))}%
            </p>
          </motion.div>
        )}

        {stage === 'analyzing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-8 text-center"
          >
            <motion.div
              className="w-20 h-20 mx-auto mb-4 rounded-full border-4 border-[hsl(var(--primary))] border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <p className="font-semibold">AI Analyzing...</p>
            <p className="text-sm text-muted-foreground">Detecting genre, BPM, key signature</p>
          </motion.div>
        )}

        {stage === 'complete' && analysis && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Success indicator */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2 text-green-500 mb-4"
            >
              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">Analysis Complete</span>
            </motion.div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 gap-3">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-pill rounded-xl p-3"
              >
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <Music className="w-3 h-3" />
                  Genre
                </div>
                <div className="font-bold text-[hsl(var(--primary))]">{analysis.genre}</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-pill rounded-xl p-3"
              >
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <Activity className="w-3 h-3" />
                  BPM
                </div>
                <div className="font-bold">{analysis.bpm}</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-pill rounded-xl p-3"
              >
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <Key className="w-3 h-3" />
                  Key
                </div>
                <div className="font-bold">{analysis.key}</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-pill rounded-xl p-3"
              >
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <Gauge className="w-3 h-3" />
                  Energy
                </div>
                <div className="font-bold">{analysis.energy}%</div>
              </motion.div>
            </div>

            {/* Energy Bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Track Energy</span>
                <span>{analysis.energy}%</span>
              </div>
              <div className="h-2 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${analysis.energy}%` }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                />
              </div>
            </motion.div>

            <Button onClick={resetDemo} variant="outline" className="w-full glass-pill mt-4">
              Try Another Track
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
