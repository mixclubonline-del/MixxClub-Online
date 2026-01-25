import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GhostTimeline, GhostTrack } from './GhostTimeline';
import { Bot, Sparkles, Loader2, CheckCircle2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PrimeSimSession() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [tracks, setTracks] = useState<GhostTrack[]>([]);
  const [status, setStatus] = useState<'idle' | 'generating' | 'mixing' | 'mastering' | 'ready'>('idle');
  const [promptText, setPromptText] = useState("");
  
  const simulationRef = useRef<NodeJS.Timeout | null>(null);
  
  // Animation Loop for Playhead
  useEffect(() => {
    let animationFrame: number;
    const animate = () => {
      if (isPlaying) {
        setCurrentTime(prev => (prev + 0.05) % 8); // Loop every 8 seconds
      }
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying]);

  // Simulation Script
  const startSimulation = () => {
    // Reset
    setTracks([]);
    setStatus('generating');
    setPromptText("");
    
    let step = 0;
    
    // Typing Effect Helper
    const typePrompt = (text: string, cb: () => void) => {
      let i = 0;
      const interval = setInterval(() => {
        setPromptText(text.slice(0, i + 1));
        i++;
        if (i >= text.length) {
          clearInterval(interval);
          setTimeout(cb, 500);
        }
      }, 30);
    };

    // The Script
    typePrompt("Generate a dark cinematic trap beat, 140BPM", () => {
      
      // Step 1: Drums
      setTimeout(() => {
        setTracks(prev => [...prev, {
          id: 'drums',
          name: 'Prime Drums II',
          color: '#ef4444', // Red
          regions: [{ id: 'r1', start: 0, duration: 4 }, { id: 'r2', start: 4, duration: 4 }]
        }]);
      }, 500);

      // Step 2: Bass (808)
      setTimeout(() => {
        setTracks(prev => [...prev, {
          id: 'bass',
          name: '808 Mafia Sub',
          color: '#f97316', // Orange
          regions: [{ id: 'r3', start: 0, duration: 8 }]
        }]);
      }, 1500);

      // Step 3: Melody
      setTimeout(() => {
        setTracks(prev => [...prev, {
          id: 'melody',
          name: 'Dark Piano',
          color: '#8b5cf6', // Violet
          regions: [{ id: 'r4', start: 0, duration: 8 }]
        }]);
      }, 2500);

      // Step 4: Mixing State
      setTimeout(() => {
        setStatus('mixing');
      }, 3500);

      // Step 5: Mastering State
      setTimeout(() => {
        setStatus('mastering');
      }, 5000);

      // Finish
      setTimeout(() => {
        setStatus('ready');
      }, 6500);
    });
  };

  // Start on mount (or viewport enter)
  useEffect(() => {
    const timer = setTimeout(startSimulation, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full max-w-5xl mx-auto p-4 md:p-8">
      
      {/* AI HUD Overlay */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
        <motion.div 
          className="bg-black/80 backdrop-blur-xl border border-primary/50 text-primary px-6 py-2 rounded-full shadow-[0_0_30px_rgba(var(--primary),0.3)] flex items-center gap-3"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          {status === 'ready' ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <Bot className="w-5 h-5 animate-pulse" />
          )}
          
          <span className="font-mono text-sm font-bold min-w-[120px]">
            {status === 'idle' && "WAITING..."}
            {status === 'generating' && "GENERATING..."}
            {status === 'mixing' && "AI MIXING..."}
            {status === 'mastering' && "MASTERING..."}
            {status === 'ready' && "SESSION READY"}
          </span>
        </motion.div>

        {/* Floating Prompt Bubble */}
        <AnimatePresence>
          {promptText && status === 'generating' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 text-xs font-mono text-white/80"
            >
              &gt; {promptText}<span className="animate-pulse">_</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* The Timeline */}
      <GhostTimeline 
        tracks={tracks}
        currentTime={currentTime}
        isPlaying={isPlaying}
        className="relative z-10"
      />

      {/* Background Glow Effects from the 'action' */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {status === 'mixing' && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 0.5 }} 
            exit={{ opacity: 0 }}
            className="absolute top-1/4 right-1/4 w-64 h-64 bg-purple-500/30 rounded-full blur-[100px]" 
          />
        )}
        {status === 'mastering' && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 0.6 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-blue-500/10 mix-blend-overlay" 
          />
        )}
      </div>

      {/* Restart/Interact Button */}
      {status === 'ready' && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-[2px] rounded-xl"
        >
          <Button 
            size="lg" 
            className="gap-2 text-lg shadow-[0_0_40px_rgba(var(--primary),0.5)] border border-white/20"
            onClick={startSimulation}
          >
            <Play className="w-5 h-5 fill-current" />
            Watch Again
          </Button>
        </motion.div>
      )}
    </div>
  );
}
