/**
 * Insider Demo Experience
 * 
 * Embeddable version of the InsiderDemo for use in the SceneFlow.
 * Can be used standalone or embedded within other scenes.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFlowNavigation } from '@/core/fabric/useFlow';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, Pause, ChevronLeft, Users, SkipForward, ArrowRight, BookOpen
} from 'lucide-react';
import { useInsiderAudio } from '@/hooks/useInsiderAudio';
import { useDynamicLandingAssets } from '@/hooks/useDynamicLandingAssets';
import { useCommunityShowcase } from '@/hooks/useCommunityShowcase';
import { PrimeCharacter } from '@/components/demo/PrimeCharacter';
import { AudioVisualizer } from '@/components/demo/AudioVisualizer';
import { ParticleStorm } from '@/components/demo/ParticleStorm';
import { CommunityShowcase } from '@/components/demo/CommunityShowcase';
import { CollaborationJourney } from '@/components/demo/CollaborationJourney';
import { RolePortals } from '@/components/demo/RolePortals';
import mixclubLogo from '@/assets/mixclub-3d-logo.png';
import primeLaunchHero from '@/assets/prime-launch-hero.png';

interface InsiderDemoExperienceProps {
  embedded?: boolean;
  onLearnMore?: () => void;
  onBack?: () => void;
}

const DEMO_PHASES = [
  { id: 'drop', title: 'THE DROP', duration: 5000, primeMessage: '' },
  { id: 'spark', title: 'THE SPARK', duration: 10000, primeMessage: "What if your sound had no limits? What if the perfect collaborator was always one click away?" },
  { id: 'community', title: 'YOUR PEOPLE', duration: 12000, primeMessage: "These aren't just users. They're artists who get it. Engineers who live for the craft. Your people." },
  { id: 'collaboration', title: 'THE COLLABORATION', duration: 15000, primeMessage: "Watch what happens when human creativity meets AI intelligence. Not replacement. Amplification." },
  { id: 'network', title: 'THE NETWORK', duration: 12000, primeMessage: "10,000+ creators. 500+ engineers. One ecosystem. All connected through sound." },
  { id: 'place', title: 'YOUR PLACE', duration: 10000, primeMessage: "Whether you're crafting beats in your bedroom or mixing hits for labels — there's a seat saved for you." },
  { id: 'invitation', title: 'THE INVITATION', duration: 999999, primeMessage: "Your music deserves to be heard. Your skills deserve recognition. Your tribe is waiting." },
];

export function InsiderDemoExperience({ embedded, onLearnMore, onBack }: InsiderDemoExperienceProps) {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [showTitle, setShowTitle] = useState(false);
  const [volume, setVolumeState] = useState(0.7);
  
  const { navigateTo } = useFlowNavigation();
  
  const { isLoading, isPlaying, analysis, play, pause, toggle, setVolume } = useInsiderAudio();
  const { amplitude, bass, mid, high, beats } = analysis;
  const { primePhaseImages } = useDynamicLandingAssets();
  const { activities } = useCommunityShowcase(6);
  
  const currentPhaseId = DEMO_PHASES[currentPhase]?.id || 'drop';
  const currentPrimeImage = primePhaseImages[currentPhaseId];

  const startExperience = useCallback(async () => {
    await play();
    setIsAutoPlay(true);
    setShowTitle(true);
    setTimeout(() => setShowTitle(false), 3000);
  }, [play]);

  // Phase auto-progression
  useEffect(() => {
    if (!isAutoPlay || currentPhase >= DEMO_PHASES.length - 1) return;
    
    const phase = DEMO_PHASES[currentPhase];
    const startTime = Date.now();
    
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / phase.duration) * 100, 100);
      setPhaseProgress(progress);
      
      if (progress >= 100) {
        clearInterval(progressInterval);
        setCurrentPhase(prev => prev + 1);
        setPhaseProgress(0);
      }
    }, 50);
    
    return () => clearInterval(progressInterval);
  }, [currentPhase, isAutoPlay]);

  // Typewriter effect
  useEffect(() => {
    const message = DEMO_PHASES[currentPhase]?.primeMessage || '';
    setTypedText('');
    if (!message) return;
    
    let index = 0;
    const typeInterval = setInterval(() => {
      if (index < message.length) {
        setTypedText(message.slice(0, index + 1));
        index++;
      } else {
        clearInterval(typeInterval);
      }
    }, 40);
    
    return () => clearInterval(typeInterval);
  }, [currentPhase]);

  const skipToPhase = (index: number) => {
    setCurrentPhase(index);
    setPhaseProgress(0);
  };

  const handleVolumeChange = (value: number) => {
    setVolumeState(value);
    setVolume(value);
  };

  const phase = DEMO_PHASES[currentPhase];

  // Pre-experience screen
  if (!isPlaying && !isAutoPlay) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-purple-950/20" />

        {/* Back button for embedded mode */}
        {embedded && onBack && (
          <motion.button
            onClick={onBack}
            className="absolute top-6 left-6 z-50 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm">Back</span>
          </motion.button>
        )}

        <motion.div 
          className="relative z-10 text-center px-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <img src={primeLaunchHero} alt="Prime" className="w-auto h-80 md:h-96 max-w-full mx-auto rounded-2xl shadow-2xl shadow-primary/30 object-contain" />
          </motion.div>

          <motion.h1 
            className="text-5xl md:text-7xl font-black mt-8 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-cyan-500">
              MIXXCLUB
            </span>
          </motion.h1>

          <motion.p 
            className="text-xl text-muted-foreground mb-8 max-w-md mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            You've Found Your People
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
          >
            <Button
              size="lg"
              onClick={startExperience}
              disabled={isLoading}
              className="text-xl px-12 py-6 bg-gradient-to-r from-primary via-purple-600 to-cyan-600 hover:opacity-90 shadow-lg shadow-primary/30"
            >
              {isLoading ? (
                <span className="flex items-center gap-3">
                  <motion.div
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  Loading Beat...
                </span>
              ) : (
                <span className="flex items-center gap-3">
                  <Play className="w-6 h-6" />
                  DROP THE BEAT
                </span>
              )}
            </Button>
          </motion.div>

          <motion.p
            className="text-sm text-muted-foreground mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            🔊 Turn up your volume for the full experience
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Audio-Reactive Background */}
      <motion.div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 30% 20%, hsl(var(--primary) / ${0.1 + (bass / 255) * 0.2}) 0%, transparent 50%),
                      radial-gradient(circle at 70% 80%, hsl(280 100% 50% / ${0.08 + (mid / 255) * 0.15}) 0%, transparent 50%),
                      radial-gradient(circle at 50% 50%, hsl(200 100% 50% / ${0.05 + (high / 255) * 0.1}) 0%, transparent 70%)`
        }}
      />

      <ParticleStorm amplitude={amplitude} bass={bass} isPlaying={isPlaying} particleCount={40} />

      <div className="fixed bottom-0 left-0 right-0 h-32 z-20 pointer-events-none">
        <AudioVisualizer beats={beats} amplitude={amplitude} bass={bass} variant="bars" className="h-full opacity-70" />
      </div>

      {/* Phase Progress */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Progress value={phaseProgress} className="h-1 rounded-none bg-background/50" />
      </div>

      {/* Header */}
      <header className="fixed top-2 left-0 right-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {embedded && onBack && (
              <button onClick={onBack} className="p-2 hover:bg-muted/50 rounded-lg transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <motion.div animate={{ scale: 1 + (bass / 255) * 0.1 }} transition={{ duration: 0.1 }}>
              <img src={mixclubLogo} alt="MixClub" className="w-10 h-10" />
            </motion.div>
            <div>
              <h2 className="font-bold text-lg">MIXXCLUB</h2>
              <Badge variant="outline" className="text-xs border-primary/50 text-primary">
                <Users className="w-3 h-3 mr-1" /> Find Your People
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={toggle}>
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-20 accent-primary"
              />
            </div>
            
            <Button variant="outline" size="sm" onClick={() => setIsAutoPlay(!isAutoPlay)} className="gap-2">
              {isAutoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isAutoPlay ? 'Pause' : 'Auto'}
            </Button>
            
            <Button variant="outline" size="icon" onClick={() => skipToPhase(Math.min(currentPhase + 1, DEMO_PHASES.length - 1))}>
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Phase Navigation */}
      <div className="fixed left-6 top-1/2 -translate-y-1/2 z-40 space-y-2">
        {DEMO_PHASES.map((p, i) => (
          <button
            key={p.id}
            onClick={() => skipToPhase(i)}
            className={`block w-2 h-6 rounded-full transition-all ${
              i === currentPhase ? 'bg-primary w-3' : i < currentPhase ? 'bg-primary/50' : 'bg-muted-foreground/30'
            }`}
            title={p.title}
          />
        ))}
      </div>

      {/* Main Content */}
      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-40">
        <AnimatePresence mode="wait">
          {phase.id === 'drop' && (
            <motion.div key="drop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.5 }} className="text-center">
              <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: [0.5, 1.2, 1], opacity: 1 }} transition={{ duration: 1 }}>
                <PrimeCharacter bass={bass} amplitude={amplitude} isPlaying={isPlaying} size="xl" imageUrl={currentPrimeImage} />
              </motion.div>
            </motion.div>
          )}

          {phase.id === 'spark' && (
            <motion.div key="spark" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -100 }} className="text-center max-w-4xl">
              <PrimeCharacter bass={bass} amplitude={amplitude} isPlaying={isPlaying} size="lg" imageUrl={currentPrimeImage} />
              <motion.h1 className="text-5xl md:text-7xl font-black mt-8 mb-6" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-cyan-500">What If?</span>
              </motion.h1>
              <motion.p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto min-h-[4rem]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                {typedText}<span className="animate-pulse">|</span>
              </motion.p>
              <motion.div className="grid grid-cols-2 gap-8 mt-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}>
                <div className="p-6 rounded-2xl bg-muted/30 border border-muted-foreground/20">
                  <p className="text-muted-foreground mb-4">Before</p>
                  <div className="text-4xl mb-2">😔</div>
                  <p className="text-sm text-muted-foreground">Alone in your bedroom</p>
                </div>
                <div className="p-6 rounded-2xl bg-primary/10 border border-primary/30">
                  <p className="text-primary mb-4">After</p>
                  <div className="text-4xl mb-2">🎵</div>
                  <p className="text-sm text-foreground">Connected to your tribe</p>
                </div>
              </motion.div>
            </motion.div>
          )}

          {phase.id === 'community' && (
            <motion.div key="community" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-6xl">
              <div className="text-center mb-8">
                <motion.h1 className="text-4xl md:text-6xl font-black mb-4" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-primary to-purple-500">Your People</span>
                </motion.h1>
                <motion.p className="text-lg text-muted-foreground max-w-xl mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                  {typedText}<span className="animate-pulse">|</span>
                </motion.p>
              </div>
              <CommunityShowcase amplitude={amplitude} bass={bass} isPlaying={isPlaying} />
              <motion.div className="mt-8 flex justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                <div className="flex items-center gap-4 px-6 py-3 rounded-full bg-primary/10 border border-primary/30">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm text-muted-foreground">{activities[0]?.message || 'Community is active now'}</span>
                </div>
              </motion.div>
            </motion.div>
          )}

          {phase.id === 'collaboration' && (
            <motion.div key="collaboration" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-6xl">
              <div className="text-center mb-8">
                <motion.h1 className="text-4xl md:text-6xl font-black mb-4" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-primary to-cyan-500">Human + AI</span>
                </motion.h1>
                <motion.p className="text-lg text-muted-foreground max-w-xl mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                  {typedText}<span className="animate-pulse">|</span>
                </motion.p>
              </div>
              <CollaborationJourney amplitude={amplitude} bass={bass} isPlaying={isPlaying} />
            </motion.div>
          )}

          {phase.id === 'network' && (
            <motion.div key="network" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-5xl text-center">
              <motion.h1 className="text-4xl md:text-6xl font-black mb-4" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-purple-500 to-primary">The Network</span>
              </motion.h1>
              <motion.p className="text-lg text-muted-foreground max-w-xl mx-auto mb-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                {typedText}<span className="animate-pulse">|</span>
              </motion.p>
              <motion.div className="grid grid-cols-3 gap-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                {[{ label: 'Artists', value: '10,000+', color: 'from-primary to-purple-500' }, { label: 'Engineers', value: '500+', color: 'from-purple-500 to-cyan-500' }, { label: 'Tracks Enhanced', value: '50,000+', color: 'from-cyan-500 to-primary' }].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    className="p-6 rounded-2xl bg-muted/30 border border-muted-foreground/20"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 + i * 0.2 }}
                  >
                    <div className={`text-4xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>{stat.value}</div>
                    <p className="text-muted-foreground mt-2">{stat.label}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {phase.id === 'place' && (
            <motion.div key="place" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-4xl text-center">
              <PrimeCharacter bass={bass} amplitude={amplitude} isPlaying={isPlaying} size="lg" imageUrl={currentPrimeImage} />
              <motion.h1 className="text-4xl md:text-6xl font-black mt-8 mb-4" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-cyan-500 to-purple-500">Your Place</span>
              </motion.h1>
              <motion.p className="text-lg text-muted-foreground max-w-xl mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                {typedText}<span className="animate-pulse">|</span>
              </motion.p>
            </motion.div>
          )}

          {phase.id === 'invitation' && (
            <motion.div key="invitation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-5xl">
              <div className="text-center mb-12">
                <motion.h1 className="text-4xl md:text-6xl font-black mb-6" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-cyan-500">The Invitation</span>
                </motion.h1>
                <motion.p className="text-lg text-muted-foreground max-w-xl mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                  {typedText}<span className="animate-pulse">|</span>
                </motion.p>
              </div>
              <RolePortals amplitude={amplitude} bass={bass} isPlaying={isPlaying} />
              
              {/* Embedded mode: Learn More option */}
              {embedded && onLearnMore && (
                <motion.div 
                  className="flex justify-center mt-12 gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                >
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={onLearnMore}
                    className="gap-2"
                  >
                    <BookOpen className="w-5 h-5" />
                    Learn More
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => navigateTo('/auth')}
                    className="gap-2 bg-gradient-to-r from-primary to-purple-600"
                  >
                    Join Now
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
