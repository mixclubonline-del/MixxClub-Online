import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, Pause, ChevronRight, Zap, Users, Music, Volume2, VolumeX,
  DollarSign, Headphones, Mic2, Shield, Rocket, SkipForward,
  TrendingUp, Award, Globe, Sparkles, ArrowRight, Brain,
  Sliders, Waves, Radio, Activity, Target, Gauge
} from 'lucide-react';
import { useInsiderAudio } from '@/hooks/useInsiderAudio';
import { PrimeCharacter } from '@/components/demo/PrimeCharacter';
import { AudioVisualizer } from '@/components/demo/AudioVisualizer';
import { ParticleStorm } from '@/components/demo/ParticleStorm';
import { WaitlistSignupForm } from '@/components/waitlist/WaitlistSignupForm';
import { SocialProofCounter } from '@/components/waitlist/SocialProofCounter';
import mixclubLogo from '@/assets/mixclub-3d-logo.png';

// Demo phases - THE DROP to CALL TO ACTION
const DEMO_PHASES = [
  {
    id: 'drop',
    title: 'THE DROP',
    duration: 5000,
    primeMessage: '',
  },
  {
    id: 'awakening',
    title: 'Prime Awakens',
    duration: 10000,
    primeMessage: "Welcome to the future of music. I'm Prime 4.0, and this... is MixClub.",
  },
  {
    id: 'mission',
    title: 'From Bedroom to Billboard',
    duration: 12000,
    primeMessage: "Our mission? Take you from bedroom producer to billboard artist. Let me show you how.",
  },
  {
    id: 'analysis',
    title: 'AI Analysis',
    duration: 15000,
    primeMessage: "Watch me work. Genre detection. BPM analysis. Key signature. I see everything in your track.",
  },
  {
    id: 'studio',
    title: 'Studio Power',
    duration: 15000,
    primeMessage: "24 professional plugins. Mastering, EQ, compression - studio quality, zero cost.",
  },
  {
    id: 'collaboration',
    title: 'Collaboration',
    duration: 12000,
    primeMessage: "Artists and engineers, working together in real-time. I match you with the perfect partner.",
  },
  {
    id: 'results',
    title: 'The Results',
    duration: 10000,
    primeMessage: "Tracks mastered in hours, not days. Distributed to 30+ platforms. Revenue flowing in.",
  },
  {
    id: 'crm',
    title: '10 Revenue Streams',
    duration: 10000,
    primeMessage: "10 ways to make money. Your entire music business, one dashboard.",
  },
  {
    id: 'cta',
    title: 'Join the Movement',
    duration: 999999,
    primeMessage: "Your music deserves this. Welcome to MixClub.",
  },
];

const PLUGINS = [
  { name: 'MixxMaster', type: 'Mastering Suite', icon: Gauge, color: 'from-amber-500 to-orange-600' },
  { name: 'MixxEQ', type: '6-Band EQ', icon: Sliders, color: 'from-cyan-500 to-blue-600' },
  { name: 'MixxComp', type: 'Dynamics', icon: Activity, color: 'from-purple-500 to-pink-600' },
  { name: 'MixxReverb', type: 'Spatial FX', icon: Waves, color: 'from-emerald-500 to-teal-600' },
  { name: 'MixxStereo', type: 'Stereo Imager', icon: Radio, color: 'from-rose-500 to-red-600' },
  { name: 'MixxLimiter', type: 'Peak Control', icon: Target, color: 'from-indigo-500 to-violet-600' },
];

const REVENUE_STREAMS = [
  { name: 'Subscription Tiers', icon: DollarSign },
  { name: 'Referral Bonuses', icon: Users },
  { name: 'Promo Shares', icon: TrendingUp },
  { name: 'Gig Marketplace', icon: Mic2 },
  { name: 'Track Sales', icon: Music },
  { name: 'Pro Services', icon: Headphones },
  { name: 'Course Sales', icon: Award },
  { name: 'Partner Commissions', icon: Shield },
  { name: 'White-Label', icon: Globe },
  { name: 'Enterprise', icon: Rocket },
];

export default function InsiderDemo() {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [activePlugin, setActivePlugin] = useState(0);
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

  // Analysis simulation
  useEffect(() => {
    if (DEMO_PHASES[currentPhase]?.id !== 'analysis') {
      setAnalysisProgress(0);
      return;
    }
    const interval = setInterval(() => {
      setAnalysisProgress(prev => Math.min(prev + 1.5, 100));
    }, 100);
    return () => clearInterval(interval);
  }, [currentPhase]);

  // Plugin cycling
  useEffect(() => {
    if (DEMO_PHASES[currentPhase]?.id !== 'studio') return;
    const interval = setInterval(() => {
      setActivePlugin(prev => (prev + 1) % PLUGINS.length);
    }, 2500);
    return () => clearInterval(interval);
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
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
                             linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />

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
            <img src="/prime-avatar.png" alt="Prime" className="w-48 h-48 mx-auto rounded-full shadow-2xl shadow-primary/30" />
          </motion.div>

          <motion.h1 
            className="text-5xl md:text-7xl font-black mt-8 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-cyan-500">
              PRIME'S WORLD
            </span>
          </motion.h1>

          <motion.p 
            className="text-xl text-muted-foreground mb-8 max-w-md mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            The Full MixClub Experience
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

      {/* Grid Overlay */}
      <motion.div 
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        animate={{ 
          backgroundPosition: isPlaying ? ['0px 0px', '60px 60px'] : '0px 0px',
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
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
              <h2 className="font-bold text-lg">MIXCLUB</h2>
              <Badge variant="outline" className="text-xs border-primary/50 text-primary">
                <Rocket className="w-3 h-3 mr-1" /> PRIME'S WORLD
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
                />
              </motion.div>
            </motion.div>
          )}

          {/* Phase 1: Prime Awakens */}
          {phase.id === 'awakening' && (
            <motion.div
              key="awakening"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -100 }}
              className="text-center"
            >
              <PrimeCharacter 
                bass={bass} 
                amplitude={amplitude} 
                isPlaying={isPlaying}
                size="lg"
              />
              
              <motion.h1 
                className="text-6xl md:text-8xl font-black mt-8 mb-6"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-cyan-500">
                  PRIME 4.0
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
            </motion.div>
          )}

          {/* Phase 2: Mission */}
          {phase.id === 'mission' && (
            <motion.div
              key="mission"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center max-w-5xl"
            >
              <motion.h1 
                className="text-5xl md:text-7xl font-black mb-8"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                <motion.span 
                  className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-cyan-500"
                  animate={{ scale: 1 + (bass / 255) * 0.05 }}
                >
                  From Bedroom
                </motion.span>
                <motion.span 
                  className="block text-foreground mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  to Billboard
                </motion.span>
              </motion.h1>

              <div className="grid grid-cols-4 gap-4 mb-8">
                {['Upload', 'Mix', 'Master', 'Distribute'].map((step, i) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + i * 0.2 }}
                  >
                    <Card className="p-4 bg-card/50 backdrop-blur border-primary/20 hover:border-primary/50 transition-colors">
                      <motion.div 
                        className="text-4xl font-black text-primary mb-2"
                        animate={{ scale: i === Math.floor((Date.now() / 1000) % 4) ? 1.2 : 1 }}
                      >
                        {i + 1}
                      </motion.div>
                      <p className="text-sm font-medium">{step}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-4">
                <PrimeCharacter bass={bass} amplitude={amplitude} isPlaying={isPlaying} size="sm" />
                <p className="text-lg text-muted-foreground max-w-lg">{typedText}</p>
              </div>
            </motion.div>
          )}

          {/* Phase 3: AI Analysis */}
          {phase.id === 'analysis' && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-4xl"
            >
              <div className="flex items-center gap-4 mb-8">
                <PrimeCharacter bass={bass} amplitude={amplitude} isPlaying={isPlaying} size="sm" />
                <p className="text-lg text-muted-foreground">{typedText}</p>
              </div>

              <Card className="p-8 bg-card/50 backdrop-blur border-primary/20">
                <div className="flex items-center gap-4 mb-6">
                  <motion.div animate={{ rotate: analysisProgress < 100 ? 360 : 0 }} transition={{ duration: 2, repeat: analysisProgress < 100 ? Infinity : 0 }}>
                    <Brain className="w-8 h-8 text-primary" />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">AI Track Analysis</h3>
                    <Progress value={analysisProgress} className="h-2 mt-2" />
                  </div>
                  <Badge className={analysisProgress >= 100 ? 'bg-emerald-500' : 'bg-primary'}>
                    {analysisProgress >= 100 ? 'Complete' : `${Math.round(analysisProgress)}%`}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Genre', value: 'Hip-Hop', icon: Music, delay: 0 },
                    { label: 'BPM', value: '140', icon: Activity, delay: 0.2 },
                    { label: 'Key', value: 'A Minor', icon: Sparkles, delay: 0.4 },
                    { label: 'Energy', value: 'High', icon: Zap, delay: 0.6 },
                  ].map((item, i) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: analysisProgress > (i + 1) * 20 ? 1 : 0.3, scale: 1 }}
                      transition={{ delay: item.delay }}
                    >
                      <Card className="p-4 bg-background/50 border-primary/10">
                        <item.icon className="w-5 h-5 text-primary mb-2" />
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <p className="text-lg font-bold">{item.value}</p>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Live Waveform */}
                <div className="mt-6 h-20">
                  <AudioVisualizer beats={beats} amplitude={amplitude} bass={bass} variant="wave" className="h-full" />
                </div>
              </Card>
            </motion.div>
          )}

          {/* Phase 4: Studio Power */}
          {phase.id === 'studio' && (
            <motion.div
              key="studio"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-5xl"
            >
              <div className="flex items-center gap-4 mb-8 justify-center">
                <PrimeCharacter bass={bass} amplitude={amplitude} isPlaying={isPlaying} size="sm" />
                <p className="text-lg text-muted-foreground">{typedText}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {PLUGINS.map((plugin, i) => {
                  const isActive = i === activePlugin;
                  const Icon = plugin.icon;
                  return (
                    <motion.div
                      key={plugin.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ 
                        opacity: 1, 
                        y: 0,
                        scale: isActive ? 1.05 : 1
                      }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Card className={`p-6 bg-card/50 backdrop-blur border transition-all ${
                        isActive ? 'border-primary shadow-lg shadow-primary/20' : 'border-primary/20'
                      }`}>
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plugin.color} flex items-center justify-center mb-4`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <h4 className="font-bold text-lg">{plugin.name}</h4>
                        <p className="text-sm text-muted-foreground">{plugin.type}</p>
                        
                        {/* Animated meter */}
                        {isActive && (
                          <div className="mt-4 flex gap-1">
                            {[...Array(8)].map((_, j) => (
                              <motion.div
                                key={j}
                                className={`flex-1 h-8 rounded bg-gradient-to-t ${plugin.color}`}
                                animate={{ 
                                  scaleY: 0.2 + (beats[j * 4] || 0) / 255 * 0.8
                                }}
                                style={{ originY: 1 }}
                              />
                            ))}
                          </div>
                        )}
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Phase 5: Collaboration */}
          {phase.id === 'collaboration' && (
            <motion.div
              key="collaboration"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-5xl"
            >
              <div className="flex items-center gap-4 mb-8 justify-center">
                <PrimeCharacter bass={bass} amplitude={amplitude} isPlaying={isPlaying} size="sm" />
                <p className="text-lg text-muted-foreground">{typedText}</p>
              </div>

              <div className="grid grid-cols-3 gap-8 items-center">
                {/* Artist Side */}
                <Card className="p-6 bg-card/50 backdrop-blur border-cyan-500/30">
                  <Mic2 className="w-10 h-10 text-cyan-500 mb-4" />
                  <h3 className="font-bold text-xl mb-2">Artist</h3>
                  <p className="text-sm text-muted-foreground">Upload your tracks, get matched with pros</p>
                  <div className="mt-4 h-16">
                    <AudioVisualizer beats={beats.slice(0, 16)} amplitude={amplitude} bass={bass} variant="bars" className="h-full opacity-60" />
                  </div>
                </Card>

                {/* Prime in center */}
                <div className="flex flex-col items-center">
                  <PrimeCharacter bass={bass} amplitude={amplitude} isPlaying={isPlaying} size="md" />
                  <motion.div 
                    className="mt-4 flex gap-2"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-6 h-6 text-cyan-500 rotate-180" />
                    <Zap className="w-6 h-6 text-primary" />
                    <ArrowRight className="w-6 h-6 text-purple-500" />
                  </motion.div>
                  <p className="text-sm text-muted-foreground mt-2">AI Matching</p>
                </div>

                {/* Engineer Side */}
                <Card className="p-6 bg-card/50 backdrop-blur border-purple-500/30">
                  <Headphones className="w-10 h-10 text-purple-500 mb-4" />
                  <h3 className="font-bold text-xl mb-2">Engineer</h3>
                  <p className="text-sm text-muted-foreground">Find projects, grow your business</p>
                  <div className="mt-4 h-16">
                    <AudioVisualizer beats={beats.slice(16, 32)} amplitude={amplitude} bass={bass} variant="bars" className="h-full opacity-60" />
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {/* Phase 6: Results */}
          {phase.id === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-5xl text-center"
            >
              <div className="flex items-center gap-4 mb-8 justify-center">
                <PrimeCharacter bass={bass} amplitude={amplitude} isPlaying={isPlaying} size="sm" />
                <p className="text-lg text-muted-foreground">{typedText}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { value: '24hr', label: 'Delivery', color: 'text-cyan-500' },
                  { value: '30+', label: 'Platforms', color: 'text-purple-500' },
                  { value: '98%', label: 'Satisfaction', color: 'text-emerald-500' },
                  { value: '$47K+', label: 'Revenue', color: 'text-amber-500' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.15 }}
                  >
                    <Card className="p-6 bg-card/50 backdrop-blur border-primary/20">
                      <motion.p 
                        className={`text-4xl md:text-5xl font-black ${stat.color}`}
                        animate={{ scale: 1 + (bass / 255) * 0.1 }}
                      >
                        {stat.value}
                      </motion.p>
                      <p className="text-muted-foreground mt-2">{stat.label}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Phase 7: CRM / Revenue Streams */}
          {phase.id === 'crm' && (
            <motion.div
              key="crm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-5xl"
            >
              <div className="flex items-center gap-4 mb-8 justify-center">
                <PrimeCharacter bass={bass} amplitude={amplitude} isPlaying={isPlaying} size="sm" />
                <p className="text-lg text-muted-foreground">{typedText}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {REVENUE_STREAMS.map((stream, i) => {
                  const Icon = stream.icon;
                  return (
                    <motion.div
                      key={stream.name}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1, type: 'spring' }}
                    >
                      <Card className="p-4 bg-card/50 backdrop-blur border-primary/20 hover:border-primary/50 transition-all group">
                        <motion.div
                          animate={{ 
                            scale: 1 + (beats[i * 3] || 0) / 255 * 0.3,
                            rotate: (beats[i * 3] || 0) > 150 ? [0, 5, -5, 0] : 0
                          }}
                        >
                          <Icon className="w-8 h-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                        </motion.div>
                        <p className="text-xs font-medium text-center">{stream.name}</p>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Phase 8: CTA */}
          {phase.id === 'cta' && (
            <motion.div
              key="cta"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center w-full max-w-xl mx-auto"
            >
              <PrimeCharacter bass={bass} amplitude={amplitude} isPlaying={isPlaying} size="lg" />
              
              <motion.h1 
                className="text-4xl md:text-6xl font-black mt-6 mb-2"
                animate={{ scale: 1 + (bass / 255) * 0.05 }}
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-cyan-500">
                  Ready to Join?
                </span>
              </motion.h1>

              <motion.p 
                className="text-lg text-muted-foreground max-w-lg mx-auto mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {typedText}
              </motion.p>

              {/* Waitlist Signup Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-6"
              >
                <WaitlistSignupForm />
              </motion.div>

              {/* Social Proof */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <SocialProofCounter />
              </motion.div>

              {/* Secondary CTA */}
              <motion.div 
                className="flex gap-4 justify-center mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigate('/')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ChevronRight className="w-4 h-4 mr-1" />
                  Explore More
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
