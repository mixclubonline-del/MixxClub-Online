 /**
  * Insider Demo Experience - "Find Your People"
  * 
  * A cinematic 6-phase welcome experience focused on human connection.
  * Phase 1: The Problem (87% stat, frustration)
  * Phase 2: The Discovery (MixClub as solution)
  * Phase 3: The Connection (real human stories)
  * Phase 4: The Transformation (before/after waveform)
  * Phase 5: The Tribe (scale + belonging)
  * Phase 6: The Invitation (single CTA)
  */
 
 import { useState, useEffect, useCallback } from 'react';
 import { motion, AnimatePresence } from 'framer-motion';
 import { useNavigate } from 'react-router-dom';
 import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
 import { Progress } from '@/components/ui/progress';
 import { 
   Play, Pause, ChevronLeft, Users, SkipForward, ArrowRight, BookOpen, Volume2
 } from 'lucide-react';
 import { useInsiderAudio } from '@/hooks/useInsiderAudio';
 import { useCommunityShowcase } from '@/hooks/useCommunityShowcase';
 import { AudioVisualizer } from '@/components/demo/AudioVisualizer';
 import { ParticleStorm } from '@/components/demo/ParticleStorm';
 import { CommunityShowcase } from '@/components/demo/CommunityShowcase';
 import { ProblemReveal } from '@/components/demo/ProblemReveal';
 import { TransformationVisual } from '@/components/demo/TransformationVisual';
 import mixclubLogo from '@/assets/mixclub-3d-logo.png';

interface InsiderDemoExperienceProps {
  embedded?: boolean;
  onLearnMore?: () => void;
  onBack?: () => void;
  onJoinNow?: () => void;
}

 // New 6-phase narrative structure focused on human connection
 const DEMO_PHASES = [
   { 
     id: 'problem', 
     title: 'THE PROBLEM', 
     duration: 8000, 
     message: "" // No typewriter, just impact text
   },
   { 
     id: 'discovery', 
     title: 'THE DISCOVERY', 
     duration: 10000, 
     message: "There's a global network of professional engineers who want to work with artists like you. Not for $1,500. For collaboration."
   },
   { 
     id: 'connection', 
     title: 'THE CONNECTION', 
     duration: 12000, 
     message: "Marcus in Brooklyn needed a master for his EP. Amara in Lagos had 10 years of experience and an empty calendar. MixClub connected them in 3 minutes."
   },
   { 
     id: 'transformation', 
     title: 'THE TRANSFORMATION', 
     duration: 14000, 
     message: "Real engineers. Real transformation. From bedroom demo to streaming-ready in 24 hours."
   },
   { 
     id: 'tribe', 
     title: 'THE TRIBE', 
     duration: 10000, 
     message: "Whether you're crafting beats in your bedroom or running sessions for labels — there's a seat saved for you."
   },
   { 
     id: 'invitation', 
     title: 'THE INVITATION', 
     duration: 999999, 
     message: "Your music deserves to be heard. Your skills deserve recognition. Your tribe is waiting."
   },
 ];

export function InsiderDemoExperience({ embedded, onLearnMore, onBack, onJoinNow }: InsiderDemoExperienceProps) {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [showTitle, setShowTitle] = useState(false);
  const [volume, setVolumeState] = useState(0.7);
  
  const navigate = useNavigate();
  
  const { isLoading, isPlaying, analysis, play, pause, toggle, setVolume } = useInsiderAudio();
  const { amplitude, bass, mid, high, beats } = analysis;
  const { activities } = useCommunityShowcase(6);

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
     const message = DEMO_PHASES[currentPhase]?.message || '';
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
    setIsAutoPlay(false);
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
      <div className="h-[100svh] w-full bg-background flex items-center justify-center relative overflow-hidden">
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
             animate={{ scale: [1, 1.05, 1] }}
             transition={{ duration: 3, repeat: Infinity }}
          >
             <img src={mixclubLogo} alt="MixClub" className="w-48 h-48 md:w-64 md:h-64 mx-auto" />
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
             Find Your People. Find Your Sound.
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
                   START THE JOURNEY
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
             <Volume2 className="w-4 h-4 inline mr-2" />
             Turn up your volume for the full experience
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-[100svh] w-full bg-background relative overflow-hidden">
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
      <main className="relative z-10 h-[100svh] w-full flex flex-col items-center justify-center px-6 pt-24 pb-40 overflow-hidden">
        <AnimatePresence mode="wait">
           {/* Phase 1: THE PROBLEM */}
           {phase.id === 'problem' && (
             <ProblemReveal 
               key="problem" 
               amplitude={amplitude} 
               bass={bass} 
               isPlaying={isPlaying} 
             />
          )}

           {/* Phase 2: THE DISCOVERY */}
           {phase.id === 'discovery' && (
             <motion.div 
               key="discovery" 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0, x: -100 }} 
               className="text-center max-w-4xl"
             >
               <motion.div
                 initial={{ scale: 0.5, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 transition={{ duration: 0.8 }}
               >
                 <motion.img 
                   src={mixclubLogo} 
                   alt="MixClub" 
                   className="w-32 h-32 md:w-40 md:h-40 mx-auto mb-6"
                   animate={{ 
                     scale: isPlaying ? [1, 1.05, 1] : 1,
                     filter: isPlaying ? `drop-shadow(0 0 ${20 + (bass / 255) * 30}px hsl(var(--primary)))` : 'none'
                   }}
                   transition={{ duration: 2, repeat: Infinity }}
                 />
               </motion.div>
 
               <motion.h1 
                 className="text-4xl md:text-6xl font-black mb-6" 
                 initial={{ y: 50, opacity: 0 }} 
                 animate={{ y: 0, opacity: 1 }} 
                 transition={{ delay: 0.3 }}
               >
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-cyan-500">
                   What if pro sound wasn't about money?
                 </span>
              </motion.h1>
 
               <motion.p 
                 className="text-xl md:text-2xl text-muted-foreground mb-8"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ delay: 0.5 }}
               >
                 What if it was about <span className="text-primary font-semibold">connection</span>?
              </motion.p>
 
               <motion.p 
                 className="text-lg text-muted-foreground max-w-2xl mx-auto min-h-[4rem]" 
                 initial={{ opacity: 0 }} 
                 animate={{ opacity: 1 }} 
                 transition={{ delay: 0.7 }}
               >
                 {typedText}<span className="animate-pulse">|</span>
               </motion.p>
            </motion.div>
          )}

           {/* Phase 3: THE CONNECTION */}
           {phase.id === 'connection' && (
             <motion.div 
               key="connection" 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }} 
               className="w-full max-w-6xl"
             >
              <div className="text-center mb-8">
                 <motion.h1 
                   className="text-4xl md:text-6xl font-black mb-4" 
                   initial={{ y: 30, opacity: 0 }} 
                   animate={{ y: 0, opacity: 1 }}
                 >
                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-primary to-purple-500">
                     Your People Are Already Here
                   </span>
                </motion.h1>
                 <motion.p 
                   className="text-lg text-muted-foreground max-w-xl mx-auto" 
                   initial={{ opacity: 0 }} 
                   animate={{ opacity: 1 }} 
                   transition={{ delay: 0.3 }}
                 >
                  {typedText}<span className="animate-pulse">|</span>
                </motion.p>
              </div>
               
              <CommunityShowcase amplitude={amplitude} bass={bass} isPlaying={isPlaying} />
               
               <motion.div 
                 className="mt-8 flex justify-center" 
                 initial={{ opacity: 0 }} 
                 animate={{ opacity: 1 }} 
                 transition={{ delay: 0.5 }}
               >
                <div className="flex items-center gap-4 px-6 py-3 rounded-full bg-primary/10 border border-primary/30">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-sm text-muted-foreground">
                     {activities[0]?.message || 'Community is active now'}
                   </span>
                </div>
              </motion.div>
            </motion.div>
          )}

           {/* Phase 4: THE TRANSFORMATION */}
           {phase.id === 'transformation' && (
             <motion.div 
               key="transformation" 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }} 
               className="w-full"
             >
               <TransformationVisual 
                 amplitude={amplitude} 
                 bass={bass} 
                 isPlaying={isPlaying} 
               />
               
               <motion.p 
                 className="text-center text-lg text-muted-foreground max-w-xl mx-auto mt-6" 
                 initial={{ opacity: 0 }} 
                 animate={{ opacity: 1 }} 
                 transition={{ delay: 0.5 }}
               >
                 {typedText}<span className="animate-pulse">|</span>
               </motion.p>
            </motion.div>
          )}

           {/* Phase 5: THE TRIBE */}
           {phase.id === 'tribe' && (
             <motion.div 
               key="tribe" 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }} 
               className="w-full max-w-5xl text-center"
             >
               <motion.h1 
                 className="text-4xl md:text-6xl font-black mb-4" 
                 initial={{ y: 30, opacity: 0 }} 
                 animate={{ y: 0, opacity: 1 }}
               >
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-purple-500 to-primary">
                   The Network
                 </span>
              </motion.h1>
               
               <motion.p 
                 className="text-lg text-muted-foreground max-w-xl mx-auto mb-4" 
                 initial={{ opacity: 0 }} 
                 animate={{ opacity: 1 }} 
                 transition={{ delay: 0.2 }}
               >
                 10,000+ creators. One ecosystem. All connected through sound.
               </motion.p>
 
               <motion.p 
                 className="text-base text-muted-foreground max-w-xl mx-auto mb-12" 
                 initial={{ opacity: 0 }} 
                 animate={{ opacity: 1 }} 
                 transition={{ delay: 0.4 }}
               >
                {typedText}<span className="animate-pulse">|</span>
              </motion.p>
 
               <motion.div 
                 className="grid grid-cols-3 gap-8" 
                 initial={{ opacity: 0 }} 
                 animate={{ opacity: 1 }} 
                 transition={{ delay: 0.5 }}
               >
                 {[
                   { label: 'Artists', value: '10,000+', color: 'from-primary to-purple-500' }, 
                   { label: 'Engineers', value: '500+', color: 'from-purple-500 to-cyan-500' }, 
                   { label: 'Tracks Enhanced', value: '50,000+', color: 'from-cyan-500 to-primary' }
                 ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    className="p-6 rounded-2xl bg-muted/30 border border-muted-foreground/20"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 + i * 0.2 }}
                     whileHover={{ scale: 1.02 }}
                  >
                     <motion.div 
                       className={`text-4xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                       animate={{
                         scale: isPlaying ? [1, 1.05, 1] : 1
                       }}
                       transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                     >
                       {stat.value}
                     </motion.div>
                    <p className="text-muted-foreground mt-2">{stat.label}</p>
                  </motion.div>
                ))}
              </motion.div>
               
               {/* Activity ticker */}
               <motion.div 
                 className="mt-8 flex justify-center"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ delay: 1.2 }}
               >
                 <div className="flex items-center gap-4 px-6 py-3 rounded-full bg-primary/10 border border-primary/30">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-sm text-muted-foreground">
                     {activities[0]?.message || 'New connections happening now'}
                   </span>
                 </div>
               </motion.div>
            </motion.div>
          )}

           {/* Phase 6: THE INVITATION */}
          {phase.id === 'invitation' && (
             <motion.div 
               key="invitation" 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }} 
               className="w-full max-w-3xl text-center"
             >
               {/* Logo */}
               <motion.div
                 initial={{ scale: 0.8, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 transition={{ duration: 0.6 }}
               >
                 <motion.img 
                   src={mixclubLogo} 
                   alt="MixClub" 
                   className="w-24 h-24 mx-auto mb-8"
                   animate={{ 
                     scale: isPlaying ? [1, 1.05, 1] : 1,
                     filter: isPlaying ? `drop-shadow(0 0 ${15 + (bass / 255) * 25}px hsl(var(--primary)))` : 'none'
                   }}
                   transition={{ duration: 2, repeat: Infinity }}
                 />
               </motion.div>
 
               {/* Main headline */}
               <motion.h1 
                 className="text-4xl md:text-6xl font-black mb-4" 
                 initial={{ y: 30, opacity: 0 }} 
                 animate={{ y: 0, opacity: 1 }}
                 transition={{ delay: 0.2 }}
               >
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-cyan-500">
                   Your Music Deserves to Be Heard
                 </span>
               </motion.h1>
 
               {/* Subtext */}
               <motion.p 
                 className="text-xl text-muted-foreground mb-8" 
                 initial={{ opacity: 0 }} 
                 animate={{ opacity: 1 }} 
                 transition={{ delay: 0.4 }}
               >
                 Your tribe is waiting.
               </motion.p>
 
               {/* Typewriter message */}
               <motion.p 
                 className="text-lg text-muted-foreground max-w-xl mx-auto mb-12 min-h-[3rem]" 
                 initial={{ opacity: 0 }} 
                 animate={{ opacity: 1 }} 
                 transition={{ delay: 0.6 }}
               >
                 {typedText}<span className="animate-pulse">|</span>
               </motion.p>
 
               {/* Single CTA */}
               <motion.div 
                 className="flex flex-col items-center gap-4"
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.8 }}
               >
                 <Button
                   size="lg"
                   onClick={() => {
                     if (embedded && onJoinNow) {
                       onJoinNow();
                       return;
                     }
                     navigate('/auth');
                   }}
                   className="text-xl px-12 py-6 bg-gradient-to-r from-primary via-purple-600 to-cyan-600 hover:opacity-90 shadow-lg shadow-primary/30"
                 >
                   <span className="flex items-center gap-3">
                     Join Now
                     <ArrowRight className="w-5 h-5" />
                   </span>
                 </Button>
 
                 {embedded && onLearnMore && (
                   <Button
                     variant="ghost"
                     size="lg"
                     onClick={onLearnMore}
                     className="gap-2 text-muted-foreground hover:text-foreground"
                   >
                     <BookOpen className="w-5 h-5" />
                     Learn More First
                   </Button>
                 )}
               </motion.div>
 
               {/* Trust indicator */}
               <motion.div 
                 className="mt-12 flex justify-center"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ delay: 1.2 }}
               >
                 <motion.div 
                   className="flex items-center gap-3 px-6 py-3 rounded-full bg-muted/30 border border-muted-foreground/20"
                   animate={{ opacity: [0.6, 1, 0.6] }}
                   transition={{ duration: 3, repeat: Infinity }}
                 >
                   <Users className="w-4 h-4 text-primary" />
                   <span className="text-sm text-muted-foreground">
                     Join 10,000+ artists and engineers
                   </span>
                 </motion.div>
               </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
