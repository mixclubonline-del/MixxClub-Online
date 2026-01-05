import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, Pause, ChevronRight, Zap, Users, Music, Volume2, VolumeX,
  Headphones, Mic2, Rocket, SkipForward, Sparkles, Eye
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
import { WaitlistSignupForm } from '@/components/waitlist/WaitlistSignupForm';
import { SocialProofCounter } from '@/components/waitlist/SocialProofCounter';
import mixclubLogo from '@/assets/mixclub-3d-logo.png';
import primeLaunchHero from '@/assets/prime-launch-hero.png';

// NEW 7-Phase Journey: Community Belonging + AI Collaboration
const DEMO_PHASES = [
  {
    id: 'drop',
    title: 'THE DROP',
    duration: 5000,
    primeMessage: '',
  },
  {
    id: 'spark',
    title: 'THE SPARK',
    duration: 10000,
    primeMessage: "What if your sound had no limits? What if the perfect collaborator was always one click away?",
  },
  {
    id: 'community',
    title: 'YOUR PEOPLE',
    duration: 12000,
    primeMessage: "These aren't just users. They're artists who get it. Engineers who live for the craft. Your people.",
  },
  {
    id: 'collaboration',
    title: 'THE COLLABORATION',
    duration: 15000,
    primeMessage: "Watch what happens when human creativity meets AI intelligence. Not replacement. Amplification.",
  },
  {
    id: 'network',
    title: 'THE NETWORK',
    duration: 12000,
    primeMessage: "10,000+ creators. 500+ engineers. One ecosystem. All connected through sound.",
  },
  {
    id: 'place',
    title: 'YOUR PLACE',
    duration: 10000,
    primeMessage: "Whether you're crafting beats in your bedroom or mixing hits for labels — there's a seat saved for you.",
  },
  {
    id: 'invitation',
    title: 'THE INVITATION',
    duration: 999999,
    primeMessage: "Your music deserves to be heard. Your skills deserve recognition. Your tribe is waiting.",
  },
];

export default function InsiderDemo() {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [showTitle, setShowTitle] = useState(false);
  const [volume, setVolumeState] = useState(0.7);
  
  const navigate = useNavigate();
  
  const { 
    isLoading, 
    isReady, 
    isPlaying, 
    analysis, 
    play, 
    pause, 
    toggle, 
    setVolume 
  } = useInsiderAudio();

  const { amplitude, bass, mid, high, beats } = analysis;
  const { primePhaseImages, getImageUrl } = useDynamicLandingAssets();
  const { activities, totalCount } = useCommunityShowcase(6);
  
  // Get current phase image from dynamic assets
  const currentPhaseId = DEMO_PHASES[currentPhase]?.id || 'drop';
  const currentPrimeImage = primePhaseImages[currentPhaseId];

  // Start experience
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
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-purple-950/20" />

        <motion.div 
          className="relative z-10 text-center px-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 2, -2, 0]
            }}
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

      {/* Particle Storm */}
      <ParticleStorm 
        amplitude={amplitude} 
        bass={bass} 
        isPlaying={isPlaying} 
        particleCount={40}
      />

      {/* Bottom Visualizer */}
      <div className="fixed bottom-0 left-0 right-0 h-32 z-20 pointer-events-none">
        <AudioVisualizer 
          beats={beats} 
          amplitude={amplitude} 
          bass={bass} 
          variant="bars"
          className="h-full opacity-70"
        />
      </div>

      {/* Phase Progress */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Progress value={phaseProgress} className="h-1 rounded-none bg-background/50" />
      </div>

      {/* Header */}
      <header className="fixed top-2 left-0 right-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ scale: 1 + (bass / 255) * 0.1 }}
              transition={{ duration: 0.1 }}
            >
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
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className="gap-2"
            >
              {isAutoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isAutoPlay ? 'Pause' : 'Auto'}
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => skipToPhase(Math.min(currentPhase + 1, DEMO_PHASES.length - 1))}
            >
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
              i === currentPhase 
                ? 'bg-primary w-3' 
                : i < currentPhase 
                  ? 'bg-primary/50' 
                  : 'bg-muted-foreground/30'
            }`}
            title={p.title}
          />
        ))}
      </div>

      {/* Main Content */}
      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-40">
        <AnimatePresence mode="wait">
          
          {/* Phase 0: THE DROP */}
          {phase.id === 'drop' && (
            <motion.div
              key="drop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: [0.5, 1.2, 1], opacity: 1 }}
                transition={{ duration: 1 }}
              >
                <PrimeCharacter 
                  bass={bass} 
                  amplitude={amplitude} 
                  isPlaying={isPlaying}
                  size="xl"
                  imageUrl={currentPrimeImage}
                />
              </motion.div>
            </motion.div>
          )}

          {/* Phase 1: THE SPARK - Possibility */}
          {phase.id === 'spark' && (
            <motion.div
              key="spark"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -100 }}
              className="text-center max-w-4xl"
            >
              <PrimeCharacter 
                bass={bass} 
                amplitude={amplitude} 
                isPlaying={isPlaying}
                size="lg"
                imageUrl={currentPrimeImage}
              />
              
              <motion.h1 
                className="text-5xl md:text-7xl font-black mt-8 mb-6"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-cyan-500">
                  What If?
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto min-h-[4rem]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {typedText}
                <span className="animate-pulse">|</span>
              </motion.p>

              {/* Split visualization */}
              <motion.div
                className="grid grid-cols-2 gap-8 mt-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
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

          {/* Phase 2: YOUR PEOPLE - Community Showcase */}
          {phase.id === 'community' && (
            <motion.div
              key="community"
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
                    Your People
                  </span>
                </motion.h1>
                <motion.p 
                  className="text-lg text-muted-foreground max-w-xl mx-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {typedText}
                  <span className="animate-pulse">|</span>
                </motion.p>
              </div>

              <CommunityShowcase 
                amplitude={amplitude} 
                bass={bass} 
                isPlaying={isPlaying} 
              />

              {/* Activity ticker */}
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

          {/* Phase 3: THE COLLABORATION - Journey */}
          {phase.id === 'collaboration' && (
            <motion.div
              key="collaboration"
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
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-amber-500">
                    The Collaboration
                  </span>
                </motion.h1>
                <motion.p 
                  className="text-lg text-muted-foreground max-w-xl mx-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {typedText}
                  <span className="animate-pulse">|</span>
                </motion.p>
              </div>

              <CollaborationJourney
                amplitude={amplitude}
                bass={bass}
                isPlaying={isPlaying}
                primeImage={currentPrimeImage}
              />
            </motion.div>
          )}

          {/* Phase 4: THE NETWORK - Stats & Activity */}
          {phase.id === 'network' && (
            <motion.div
              key="network"
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
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-primary to-cyan-500">
                  The Network
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-lg text-muted-foreground max-w-xl mx-auto mb-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {typedText}
                <span className="animate-pulse">|</span>
              </motion.p>

              {/* Big stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                {[
                  { value: '10K+', label: 'Creators', color: 'text-cyan-500' },
                  { value: '500+', label: 'Engineers', color: 'text-purple-500' },
                  { value: '50K+', label: 'Tracks', color: 'text-amber-500' },
                  { value: '98%', label: 'Satisfaction', color: 'text-emerald-500' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="p-6 rounded-2xl bg-card/50 backdrop-blur border border-primary/20"
                  >
                    <motion.p 
                      className={`text-4xl md:text-5xl font-black ${stat.color}`}
                      animate={{ scale: 1 + (bass / 255) * 0.1 }}
                    >
                      {stat.value}
                    </motion.p>
                    <p className="text-muted-foreground mt-2">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Live activity feed */}
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                {activities.slice(0, 3).map((activity, i) => (
                  <motion.div
                    key={activity.id}
                    className="flex items-center justify-center gap-4 text-sm"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 + i * 0.2 }}
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'connection' ? 'bg-cyan-500' :
                      activity.type === 'project' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} />
                    <span className="text-muted-foreground">{activity.message}</span>
                    <span className="text-xs text-muted-foreground/60">{activity.timestamp}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* Phase 5: YOUR PLACE - Role Portals */}
          {phase.id === 'place' && (
            <motion.div
              key="place"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-5xl"
            >
              <div className="text-center mb-12">
                <motion.h1 
                  className="text-4xl md:text-6xl font-black mb-4"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                >
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-primary to-purple-500">
                    Your Place
                  </span>
                </motion.h1>
                <motion.p 
                  className="text-lg text-muted-foreground max-w-xl mx-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {typedText}
                  <span className="animate-pulse">|</span>
                </motion.p>
              </div>

              <RolePortals
                amplitude={amplitude}
                bass={bass}
                isPlaying={isPlaying}
              />
            </motion.div>
          )}

          {/* Phase 6: THE INVITATION - CTA */}
          {phase.id === 'invitation' && (
            <motion.div
              key="invitation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center w-full max-w-2xl mx-auto"
            >
              <PrimeCharacter bass={bass} amplitude={amplitude} isPlaying={isPlaying} size="lg" imageUrl={currentPrimeImage} />
              
              <motion.h1 
                className="text-4xl md:text-6xl font-black mt-6 mb-2"
                animate={{ scale: 1 + (bass / 255) * 0.05 }}
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-cyan-500">
                  Your Tribe Awaits
                </span>
              </motion.h1>

              <motion.p 
                className="text-lg text-muted-foreground max-w-lg mx-auto mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {typedText}
              </motion.p>

              {/* Three CTA buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  size="lg"
                  onClick={() => navigate('/for-artists')}
                  className="text-lg px-8 py-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 shadow-lg shadow-cyan-500/30"
                >
                  <Mic2 className="w-5 h-5 mr-2" />
                  I Make Music
                </Button>
                <Button
                  size="lg"
                  onClick={() => navigate('/for-engineers')}
                  className="text-lg px-8 py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 shadow-lg shadow-purple-500/30"
                >
                  <Headphones className="w-5 h-5 mr-2" />
                  I Shape Sound
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/showcase')}
                  className="text-lg px-8 py-6 border-primary/50 hover:bg-primary/10"
                >
                  <Eye className="w-5 h-5 mr-2" />
                  Show Me More
                </Button>
              </motion.div>

              {/* Waitlist Signup Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mb-6"
              >
                <p className="text-sm text-muted-foreground mb-4">Or join the waitlist for early access:</p>
                <WaitlistSignupForm />
              </motion.div>

              {/* Social Proof */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <SocialProofCounter />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
