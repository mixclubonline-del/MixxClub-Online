import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface AudioLensProps {
  audioSrc: string;
  className?: string;
}

export function AudioLens({ audioSrc, className }: AudioLensProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Audio State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [lensPosition, setLensPosition] = useState({ x: 50, y: 50 }); // Percentage
  const [isHovering, setIsHovering] = useState(false);
  
  // Refs for Web Audio API
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const rawFilterRef = useRef<BiquadFilterNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize Audio
  useEffect(() => {
    const initAudio = async () => {
      if (!audioSrc) return;

      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioContextRef.current = ctx;

        const audio = new Audio();
        audio.crossOrigin = 'anonymous';
        audio.src = audioSrc;
        audio.loop = true;
        audioElementRef.current = audio;

        // Wait for connection (on user interaction usually, but we prepare)
        audio.addEventListener('canplay', () => setIsLoaded(true));

        // Create Nodes
        // 1. Source
        const source = ctx.createMediaElementSource(audio);
        sourceRef.current = source;

        // 2. "Raw" Simulation Filter (Lowpass to sound muffled outside lens)
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowshelf';
        filter.frequency.value = 800;
        filter.gain.value = -10; // Start muffled
        rawFilterRef.current = filter;

        // 3. Master Gain
        const gain = ctx.createGain();
        gain.gain.value = 0.8;
        masterGainRef.current = gain;

        // Connect Graph
        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

      } catch (err) {
        console.error("AudioLens init failed", err);
      }
    };

    initAudio();

    return () => {
      audioContextRef.current?.close();
      cancelAnimationFrame(animationFrameRef.current!);
    };
  }, [audioSrc]);

  // Handle Mouse Move - The "Magic Lens" Effect
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !rawFilterRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    setLensPosition({ x, y });

    // Calculate "Clarity" based on lens nearness to center (or just inside lens)
    // For this demo: Lens X represents "Mastering Intensity" scan
    // But let's make it radial: Inside the lens = Mastered. Outside = Raw.
    
    // Actually, distinct A/B wipe is often clearer. 
    // Let's do: Lens reveals the "Mastered" waveform and audio.
    // Audio logic: We can't easily spatialise the filter per-pixel.
    // Compromise: X-axis controls the mix. Mouse Left = Raw, Mouse Right = Mastered.
    // AND Lens Visual shows the "After" state locally.
    
    const mix = x / 100; // 0 = Raw, 1 = Mastered
    
    // Update Filter
    // Raw (Left) = Muffled (-20dB lowshelf)
    // Mastered (Right) = Crisp (0dB or slight boost)
    
    // Interpolate gain: -15 -> 0
    const filterGain = -15 + (mix * 15);
    // Interpolate freq: 400 -> 20000 (opening up)
    // Actually simpler: just modulate the 'quality' or 'lowshelf gain'
    
    rawFilterRef.current.gain.setTargetAtTime(filterGain, audioContextRef.current!.currentTime, 0.1);
    
    // Add "Air" boost for extra shine at max
    // (Simulated by just opening the filter more)
    
  }, []);

  const togglePlay = async () => {
    if (!audioContextRef.current || !audioElementRef.current) return;

    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    if (isPlaying) {
      audioElementRef.current.pause();
    } else {
      audioElementRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div 
      className={cn(
        "relative w-full h-[400px] rounded-xl overflow-hidden bg-black/40 border border-white/10 backdrop-blur-md select-none group", 
        className
      )}
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Loading State */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      )}

      {/* Play Button Overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {!isPlaying && isLoaded && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 rounded-full bg-primary/20 backdrop-blur-md flex items-center justify-center border border-primary/50 shadow-[0_0_40px_rgba(var(--primary),0.3)] pointer-events-auto cursor-pointer hover:scale-110 transition-transform"
            onClick={togglePlay}
          >
            <Play className="w-8 h-8 text-primary fill-current ml-1" />
          </motion.div>
        )}
      </div>

      {/* The Lens - Tracks Mouse */}
      <motion.div
        className="absolute w-64 h-64 rounded-full pointer-events-none mix-blend-overlay"
        style={{
          left: `${lensPosition.x}%`,
          top: `${lensPosition.y}%`,
          x: '-50%',
          y: '-50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)',
          boxShadow: '0 0 50px 20px rgba(120, 119, 255, 0.3) inset, 0 0 20px rgba(255, 255, 255, 0.5)',
          opacity: isHovering ? 1 : 0
        }}
        animate={{ scale: isPlaying ? [1, 1.05, 1] : 1 }}
        transition={{ repeat: Infinity, duration: 2 }}
      />

      {/* Lens Border/UI */}
      <motion.div
        className="absolute w-64 h-64 rounded-full border border-white/30 pointer-events-none flex items-center justify-center"
        style={{
          left: `${lensPosition.x}%`,
          top: `${lensPosition.y}%`,
          x: '-50%',
          y: '-50%',
          opacity: isHovering ? 1 : 0
        }}
      >
        <div className="absolute top-4 text-[10px] font-mono tracking-widest text-white/70 uppercase">
          AI Analysis
        </div>
        <Sparkles className="w-6 h-6 text-white/50 animate-pulse" />
      </motion.div>

      {/* Info Label */}
      <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end pointer-events-none">
        <div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
            The Sonic Lens
          </h3>
          <p className="text-sm text-gray-400 max-w-sm mt-1">
            Drag to compare the raw mix versus our AI-enhanced master.
            Hear the difference clarity and depth make.
          </p>
        </div>
        
        <div className="text-right">
          <div className="text-4xl font-mono font-black text-white/10">
            {Math.round(lensPosition.x)}%
          </div>
          <div className="text-xs text-primary font-bold uppercase tracking-wider">
            {lensPosition.x < 30 ? 'Raw Mix' : lensPosition.x > 70 ? 'Mastered' : 'Processing...'}
          </div>
        </div>
      </div>
    </div>
  );
}
