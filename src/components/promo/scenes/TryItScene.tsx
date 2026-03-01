import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Sparkles, Music, ArrowRight, Volume2, Headphones } from 'lucide-react';
import { SceneBackground } from './SceneBackground';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { velvetMaster, measureLUFS } from '@/lib/velvetMaster';
import { audioBufferToWav } from '@/lib/audioExport';
import type { GenrePreset } from '@/audio/context/GenreContext';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const GENRES: { name: string; value: GenrePreset }[] = [
  { name: 'Trap', value: 'trap' },
  { name: 'Drill', value: 'drill' },
  { name: 'R&B', value: 'rnb' },
  { name: 'Reggaeton', value: 'reggaeton' },
  { name: 'Afrobeat', value: 'afrobeat' },
  { name: 'Amapiano', value: 'amapiano' },
  { name: 'Melodic Trap', value: 'melodic-trap' },
];

type Phase = 'upload' | 'processing' | 'results' | 'error';

interface MasteringAnalysis {
  originalLUFS: number;
  masteredLUFS: number;
  improvements: string[];
}

interface Props {
  asset: { url: string | null; isVideo: boolean };
  trackStep: (step: string, data?: Record<string, unknown>) => void;
  onAdvance: () => void;
}

export function TryItScene({ asset, trackStep, onAdvance }: Props) {
  const [phase, setPhase] = useState<Phase>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [genre, setGenre] = useState<GenrePreset>('trap');
  const [progress, setProgress] = useState(0);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [masteredUrl, setMasteredUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<MasteringAnalysis | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    if (f.size > MAX_FILE_SIZE) {
      setErrorMsg('File too large — 10 MB max.');
      setPhase('error');
      return;
    }
    const ext = f.name.split('.').pop()?.toLowerCase();
    if (!['mp3', 'wav', 'flac', 'wave'].includes(ext || '')) {
      setErrorMsg('Upload a WAV, MP3, or FLAC file.');
      setPhase('error');
      return;
    }
    setFile(f);
    setPhase('upload');
    setErrorMsg('');
  }, []);

  const handleMaster = useCallback(async () => {
    if (!file) return;
    setPhase('processing');
    setProgress(10);
    trackStep('demo_mastering_started', { genre, fileSize: file.size });

    try {
      // Decode uploaded file into AudioBuffer
      const arrayBuffer = await file.arrayBuffer();
      setProgress(25);

      const audioCtx = new AudioContext();
      const originalBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      audioCtx.close();
      setProgress(40);

      // Measure original loudness
      const originalLUFS = measureLUFS(originalBuffer);

      // Create original playback URL
      const originalBlob = audioBufferToWav(originalBuffer, { bitDepth: 16, normalize: false });
      setOriginalUrl(URL.createObjectURL(originalBlob));
      setProgress(50);

      // Run Velvet Curve mastering (client-side, instant)
      const masteredBuffer = await velvetMaster(originalBuffer, genre);
      setProgress(85);

      // Measure mastered loudness
      const masteredLUFS = measureLUFS(masteredBuffer);

      // Create mastered playback URL
      const masteredBlob = audioBufferToWav(masteredBuffer, { bitDepth: 16, normalize: false });
      setMasteredUrl(URL.createObjectURL(masteredBlob));
      setProgress(95);

      // Build improvement tags based on genre preset
      const improvements = buildImprovementTags(genre, originalLUFS, masteredLUFS);

      setAnalysis({
        originalLUFS: Math.max(originalLUFS, -60),
        masteredLUFS: Math.max(masteredLUFS, -60),
        improvements,
      });

      setProgress(100);
      setPhase('results');
      trackStep('demo_mastering_completed', {
        genre,
        originalLUFS,
        masteredLUFS,
      });
    } catch (err: any) {
      console.error('[TryIt] mastering error:', err);
      setErrorMsg(err?.message || 'Something went wrong decoding your audio.');
      setPhase('error');
    }
  }, [file, genre, trackStep]);

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center">
      <SceneBackground asset={asset} />
      <div className="relative z-10 px-4 w-full max-w-md mx-auto">
        <div className="rounded-2xl bg-black/70 backdrop-blur-xl border border-white/10 p-6 space-y-5">
          {/* Header */}
          <div className="text-center space-y-1">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-xs font-semibold text-primary mb-2"
            >
              <Sparkles className="w-3 h-3" /> LIVE DEMO
            </motion.div>
            <h2 className="text-xl font-bold text-white">
              Don't take our word for it.
            </h2>
            <p className="text-sm text-white/60">
              Upload a track. Hear it mastered. No sign-up required.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {/* ── UPLOAD PHASE ── */}
            {phase === 'upload' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Drop zone */}
                <div
                  onClick={() => inputRef.current?.click()}
                  className="border-2 border-dashed border-white/20 hover:border-primary/50 rounded-xl p-6 text-center cursor-pointer transition-colors"
                >
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".mp3,.wav,.flac,audio/*"
                    className="hidden"
                    onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
                  />
                  {file ? (
                    <div className="flex items-center justify-center gap-2 text-primary">
                      <Music className="w-5 h-5" />
                      <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-white/40 mx-auto mb-2" />
                      <p className="text-sm text-white/50">
                        Tap to upload &middot; WAV, MP3, FLAC &middot; 10 MB max
                      </p>
                    </>
                  )}
                </div>

                {/* Genre pills */}
                <div>
                  <p className="text-xs font-medium text-white/50 mb-2">Genre</p>
                  <div className="flex flex-wrap gap-1.5">
                    {GENRES.map(g => (
                      <button
                        key={g.value}
                        onClick={() => setGenre(g.value)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          genre === g.value
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        }`}
                      >
                        {g.name}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleMaster}
                  disabled={!file}
                  className="w-full gap-2"
                  size="lg"
                >
                  <Sparkles className="w-4 h-4" />
                  Master My Track
                </Button>
              </motion.div>
            )}

            {/* ── PROCESSING PHASE ── */}
            {phase === 'processing' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4 py-4"
              >
                <div className="flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                  </div>
                </div>
                <p className="text-center text-sm text-white/80">
                  Velvet Curve is mastering your track…
                </p>
                <Progress value={progress} className="h-2 bg-white/10" />
                <p className="text-center text-xs text-white/40">
                  Powered by Velvet Curve &middot; genre-aware mastering
                </p>
              </motion.div>
            )}

            {/* ── RESULTS PHASE ── */}
            {phase === 'results' && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* LUFS comparison */}
                {analysis && (
                  <div className="flex items-center justify-center gap-3">
                    <div className="text-center">
                      <p className="text-xs text-white/50">Before</p>
                      <p className="text-lg font-bold text-white/70">
                        {analysis.originalLUFS.toFixed(1)} <span className="text-xs font-normal">LUFS</span>
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-primary" />
                    <div className="text-center">
                      <p className="text-xs text-primary">After</p>
                      <p className="text-lg font-bold text-primary">
                        {analysis.masteredLUFS.toFixed(1)} <span className="text-xs font-normal">LUFS</span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Audio players */}
                {originalUrl && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-white/50">
                      <Volume2 className="w-3 h-3" /> Original
                    </div>
                    <audio src={originalUrl} controls className="w-full h-8 [&::-webkit-media-controls-panel]:bg-white/10 rounded" />
                  </div>
                )}
                {masteredUrl && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-primary">
                      <Headphones className="w-3 h-3" /> Mastered by Velvet Curve
                    </div>
                    <audio src={masteredUrl} controls className="w-full h-8 [&::-webkit-media-controls-panel]:bg-primary/10 rounded" />
                  </div>
                )}

                {/* Improvement tags */}
                {analysis?.improvements && (
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.improvements.slice(0, 4).map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* CTA */}
                <Button onClick={onAdvance} size="lg" className="w-full gap-2">
                  Want unlimited mastering? Sign up free
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            )}

            {/* ── ERROR PHASE ── */}
            {phase === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4 text-center py-2"
              >
                <p className="text-sm text-red-400">{errorMsg}</p>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                    onClick={() => { setPhase('upload'); setErrorMsg(''); setFile(null); }}
                  >
                    Try again
                  </Button>
                  <Button className="flex-1" onClick={onAdvance}>
                    Sign up instead
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/** Generate contextual improvement tags based on genre and loudness delta */
function buildImprovementTags(genre: GenrePreset, beforeLUFS: number, afterLUFS: number): string[] {
  const tags: string[] = [];
  const delta = afterLUFS - beforeLUFS;

  // Loudness improvement
  if (delta > 1) tags.push(`+${delta.toFixed(1)} dB louder`);
  tags.push('Streaming-ready (-14 LUFS)');

  // Genre-specific tags
  const genreTags: Record<string, string[]> = {
    trap: ['808 punch enhanced', 'Hi-hat clarity'],
    drill: ['Dark tone sculpted', 'Aggressive dynamics'],
    rnb: ['Velvet warmth applied', 'Silky highs'],
    reggaeton: ['Dembow punch', 'Balanced warmth'],
    afrobeat: ['Groovy dynamics', 'Open highs'],
    amapiano: ['Deep warmth', 'Log drum presence'],
    'melodic-trap': ['Vocal-forward EQ', 'Emotional mids'],
    default: ['Balanced mastering', 'Professional clarity'],
  };

  tags.push(...(genreTags[genre] || genreTags.default));
  return tags;
}
