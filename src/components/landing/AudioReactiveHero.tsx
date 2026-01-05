import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Sparkles, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PrimeCharacter } from '@/components/demo/PrimeCharacter';
import { AudioVisualizer } from '@/components/demo/AudioVisualizer';
import { useInsiderAudio } from '@/hooks/useInsiderAudio';
import { useDynamicLandingAssets } from '@/hooks/useDynamicLandingAssets';

export const AudioReactiveHero = () => {
  const { 
    isPlaying, 
    isLoading, 
    analysis, 
    toggle, 
    setVolume,
    isReady,
    initAudio
  } = useInsiderAudio();
  
  const { heroBackgrounds, getImageUrl, isLoading: assetsLoading } = useDynamicLandingAssets();
  
  const [isMuted, setIsMuted] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  
  // Typewriter effect for tagline
  const [displayText, setDisplayText] = useState('');
  const fullText = 'Transform your sound with AI-powered tools and professional engineers.';
  
  // Rotate background images when playing
  useEffect(() => {
    if (!isPlaying || heroBackgrounds.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentBgIndex(prev => (prev + 1) % heroBackgrounds.length);
    }, 8000); // Change every 8 seconds
    
    return () => clearInterval(interval);
  }, [isPlaying, heroBackgrounds.length]);
  
  const currentBackground = heroBackgrounds[currentBgIndex];
  const primeHeroImage = getImageUrl('hero_prime');
  
  useEffect(() => {
    if (isPlaying && displayText.length < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayText(fullText.slice(0, displayText.length + 1));
      }, 30);
      return () => clearTimeout(timeout);
    }
  }, [isPlaying, displayText]);

  const handleStart = async () => {
    setShowPrompt(false);
    await initAudio();
    toggle();
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    setVolume(isMuted ? 0.5 : 0);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Dynamic Background Image Layer */}
      <AnimatePresence mode="wait">
        {currentBackground && (
          <motion.div
            key={currentBgIndex}
            className="absolute inset-0 z-0"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0.4, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1.5 }}
            style={{
              backgroundImage: `url(${currentBackground})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        )}
      </AnimatePresence>
      
      {/* Audio-Reactive Background Overlay */}
      <motion.div 
        className="absolute inset-0 z-1"
        animate={{
          background: isPlaying 
            ? `radial-gradient(ellipse at center, 
                hsl(${280 + (analysis.amplitude / 255) * 30} 60% 10% / 0.8) 0%, 
                hsl(var(--background) / 0.95) 70%)`
            : 'hsl(var(--background) / 0.7)'
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Pulsing Glow Orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full opacity-30 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, hsl(270 100% 60%), transparent 60%)',
          filter: 'blur(100px)'
        }}
        animate={{
          scale: isPlaying ? [1, 1.2 + (analysis.bass / 500), 1] : 1,
          opacity: isPlaying ? [0.2, 0.4, 0.2] : 0.15
        }}
        transition={{ duration: 0.5, repeat: Infinity }}
      />
      
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full opacity-30 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, hsl(200 100% 60%), transparent 60%)',
          filter: 'blur(100px)'
        }}
        animate={{
          scale: isPlaying ? [1, 1.3 + (analysis.mid / 500), 1] : 1,
          opacity: isPlaying ? [0.2, 0.35, 0.2] : 0.15
        }}
        transition={{ duration: 0.7, repeat: Infinity, delay: 0.2 }}
      />

      {/* Floating Frequency Particles */}
      {isPlaying && analysis.beats.map((beat, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
          style={{
            left: `${10 + (i / analysis.beats.length) * 80}%`,
            background: `hsl(${260 + (i * 3)} 100% 60%)`,
            boxShadow: `0 0 10px hsl(${260 + (i * 3)} 100% 60%)`
          }}
          animate={{
            y: [0, -(beat / 255) * 200 - 50, 0],
            opacity: [0, 0.8, 0],
            scale: [0.5, 1 + (beat / 255), 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.05
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 text-center max-w-6xl mx-auto px-6">
        {/* Prime Character - Audio Reactive */}
        <motion.div 
          className="flex justify-center mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <PrimeCharacter
            bass={analysis.bass}
            amplitude={analysis.amplitude}
            isPlaying={isPlaying}
            size="xl"
            imageUrl={primeHeroImage}
          />
        </motion.div>

        {/* Click to Experience Prompt */}
        {showPrompt && !isPlaying && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Button
              size="lg"
              onClick={handleStart}
              disabled={isLoading}
              className="group relative overflow-hidden bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent-cyan))] hover:shadow-[0_0_60px_hsl(var(--primary)/0.8)] transition-all px-12 py-6 text-lg"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--accent-cyan))] to-[hsl(var(--primary))]"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
              <span className="relative z-10 flex items-center gap-3">
                {isLoading ? (
                  <>Loading Experience...</>
                ) : (
                  <>
                    <Play className="w-6 h-6" />
                    Experience MixClub
                  </>
                )}
              </span>
            </Button>
            <p className="text-muted-foreground mt-3 text-sm">Click to start the audio experience</p>
          </motion.div>
        )}

        {/* Audio Controls (when playing) */}
        {isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-4 mb-6"
          >
            <Button
              size="sm"
              variant="ghost"
              onClick={toggle}
              className="glass-pill"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleMuteToggle}
              className="glass-pill"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
          </motion.div>
        )}

        {/* AI Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass-floating border border-[hsl(var(--glass-border-glow))]">
            <Sparkles className="w-5 h-5 text-[hsl(var(--accent-cyan))] animate-pulse" />
            <span className="text-lg font-semibold bg-gradient-to-r from-[hsl(var(--primary))] via-[hsl(var(--accent-blue))] to-[hsl(var(--accent-cyan))] bg-clip-text text-transparent">
              AI-Powered Collaboration
            </span>
            <Zap className="w-5 h-5 text-[hsl(var(--primary))] animate-pulse" />
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6"
        >
          <motion.span 
            className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--primary))] via-[hsl(var(--accent-blue))] to-[hsl(var(--accent-cyan))]"
            animate={{
              filter: isPlaying 
                ? `drop-shadow(0 0 ${30 + analysis.amplitude / 4}px hsl(var(--primary) / 0.6))`
                : 'none'
            }}
          >
            From Bedroom
          </motion.span>
          <br />
          <span className="text-foreground">to Billboard</span>
        </motion.h1>

        {/* Typewriter Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xl md:text-2xl text-muted-foreground mb-8 h-8 max-w-3xl mx-auto"
        >
          {isPlaying ? displayText : fullText}
          {isPlaying && displayText.length < fullText.length && (
            <span className="animate-pulse">|</span>
          )}
        </motion.p>

        {/* Live Audio Visualizer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-10 h-24"
        >
          <AudioVisualizer
            beats={analysis.beats}
            amplitude={analysis.amplitude}
            bass={analysis.bass}
            variant="bars"
            className="h-full"
          />
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <Link to="/auth?mode=signup">
            <Button 
              size="lg" 
              className="group relative overflow-hidden bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent-blue))] hover:shadow-[0_0_60px_hsl(var(--primary)/0.8)] transition-all border border-[hsl(var(--primary)/0.3)]"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--accent-cyan))] to-[hsl(var(--primary))]"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
              <span className="relative z-10 flex items-center gap-2 font-semibold">
                Enter the Network
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </Link>
          <Link to="/how-it-works">
            <Button 
              size="lg" 
              variant="outline" 
              className="glass border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.1)]"
            >
              How It Works
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
