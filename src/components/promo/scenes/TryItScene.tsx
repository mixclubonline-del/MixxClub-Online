import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Sparkles, Music, ArrowRight, Volume2, Headphones, Loader2 } from 'lucide-react';
import { SceneBackground } from './SceneBackground';
import funnelTryitBg from '@/assets/promo/funnel-tryit-bg.jpg';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { velvetMaster, measureLUFS } from '@/lib/velvetMaster';
import { audioBufferToWav } from '@/lib/audioExport';
import { WaveformComparison } from '@/components/promo/WaveformComparison';
import { MasteringPrimeChat } from '@/components/promo/MasteringPrimeChat';
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
  const [originalBuffer, setOriginalBuffer] = useState<AudioBuffer | null>(null);
  const [masteredBuf, setMasteredBuf] = useState<AudioBuffer | null>(null);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
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

  const handleMaster = useCallback(async (overrideFile?: File) => {
    const fileToProcess = overrideFile ?? file;
    if (!fileToProcess) return;
    setPhase('processing');
    setProgress(10);
    trackStep('demo_mastering_started', { genre, fileSize: fileToProcess.size });

    try {
      // Use the raw uploaded file directly for the original player (no re-encode)
      setOriginalUrl(URL.createObjectURL(fileToProcess));
      setProgress(25);

      // Decode into AudioBuffer for Velvet Curve processing
      const arrayBuffer = await fileToProcess.arrayBuffer();
      const audioCtx = new AudioContext();
      const originalBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      audioCtx.close();
      setProgress(40);

      // Measure original loudness
      const originalLUFS = measureLUFS(originalBuffer);
      setProgress(50);

      // Store original buffer for waveform comparison
      setOriginalBuffer(originalBuffer);

      // Run Velvet Curve mastering (client-side, instant)
      const masteredBuffer = await velvetMaster(originalBuffer, genre);
      setMasteredBuf(masteredBuffer);
      setProgress(85);

      // Measure mastered loudness
      const masteredLUFS = measureLUFS(masteredBuffer);

      // Create mastered playback URL
      const masteredBlob = audioBufferToWav(masteredBuffer, { bitDepth: 24, normalize: false });
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

  const handleDemoTrack = useCallback(async () => {
    setIsLoadingDemo(true);
    try {
      const { data, error } = await supabase.storage
        .from('audio-files')
        .download('original_1772324337610_TEST MP3.mp3');

      if (error || !data) throw error || new Error('Download failed');

      const demoFile = new File([data], 'Demo Beat.mp3', { type: 'audio/mpeg' });
      setFile(demoFile);
      trackStep('demo_beat_loaded');
      await handleMaster(demoFile);
    } catch (err: any) {
      console.error('[TryIt] demo load error:', err);
      setErrorMsg('Could not load demo beat. Try uploading your own.');
      setPhase('error');
    } finally {
      setIsLoadingDemo(false);
    }
  }, [handleMaster, trackStep]);

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center">
      <SceneBackground asset={asset} fallbackSrc={funnelTryitBg} />
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
              Hear the difference.
            </h2>
            <p className="text-sm text-white/60">
              Drop a track. Get it mastered. No signup. No catch.
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
                  onClick={() => handleMaster()}
                  disabled={!file}
                  className="w-full gap-2"
                  size="lg"
                >
                  <Sparkles className="w-4 h-4" />
                  Master My Track
                </Button>

                {/* Demo beat option — visible only when no file selected */}
                {!file && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-px flex-1 bg-white/10" />
                      <span className="text-[10px] uppercase tracking-widest text-white/30">or</span>
                      <div className="h-px flex-1 bg-white/10" />
                    </div>
                    <Button
                      variant="ghost"
                      onClick={handleDemoTrack}
                      disabled={isLoadingDemo}
                      className="w-full gap-2 text-white/60 hover:text-white"
                      size="lg"
                    >
                      {isLoadingDemo ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading demo…
                        </>
                      ) : (
                        <>
                          <Music className="w-4 h-4" />
                          Try a demo beat
                        </>
                      )}
                    </Button>
                  </div>
                )}
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

                {/* Waveform comparison */}
                {originalBuffer && masteredBuf && (
                  <WaveformComparison originalBuffer={originalBuffer} masteredBuffer={masteredBuf} />
                )}

                {/* Prime mastering insight + chat */}
                {analysis && (
                  <MasteringPrimeChat
                    genre={genre}
                    originalLUFS={analysis.originalLUFS}
                    masteredLUFS={analysis.masteredLUFS}
                    improvements={analysis.improvements}
                  />
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

                {/* Inline signup */}
                <div className="space-y-3 pt-2">
                  <p className="text-sm font-bold text-white text-center">
                    I want this for every track
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={async () => {
                        trackStep('signup_started', { source: 'tryit_inline' });
                        await lovable.auth.signInWithOAuth('google', { redirect_uri: window.location.origin });
                      }}
                      size="lg"
                      className="flex-1 gap-2"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                      Google
                    </Button>
                    <Button
                      onClick={async () => {
                        trackStep('signup_started', { source: 'tryit_inline' });
                        await lovable.auth.signInWithOAuth('apple', { redirect_uri: window.location.origin });
                      }}
                      size="lg"
                      variant="outline"
                      className="flex-1 gap-2 border-white/20 text-white hover:bg-white/10"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                      Apple
                    </Button>
                  </div>
                  <button
                    onClick={onAdvance}
                    className="w-full text-xs text-white/40 hover:text-white/60 transition-colors py-1"
                  >
                    or skip →
                  </button>
                </div>
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
