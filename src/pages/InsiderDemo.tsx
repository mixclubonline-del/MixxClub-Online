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
import { useWelcomeAudio } from '@/hooks/useWelcomeAudio';
import { PrimeAvatar } from '@/components/prime/PrimeAvatar';
import PrimeGlow from '@/components/prime/PrimeGlow';
import { usePrime } from '@/contexts/PrimeContext';
import mixclubLogo from '@/assets/mixclub-3d-logo.png';

// Demo phases with Prime dialogue
const DEMO_PHASES = [
  {
    id: 'awakening',
    title: 'Prime Awakens',
    duration: 8000,
    primeMessage: "Welcome to the future of music production. I'm Prime 4.0, your AI guide through MixClub.",
  },
  {
    id: 'mission',
    title: 'The Mission',
    duration: 10000,
    primeMessage: "Our mission? Take you from bedroom producer to billboard artist. Let me show you how.",
  },
  {
    id: 'analysis',
    title: 'AI Analysis',
    duration: 12000,
    primeMessage: "Watch me analyze a track in real-time. Genre detection, key signature, BPM - I see it all.",
  },
  {
    id: 'studio',
    title: 'Studio Tour',
    duration: 15000,
    primeMessage: "24 professional plugins at your fingertips. Mastering, EQ, compression - studio quality, zero cost.",
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
    title: 'CRM Power',
    duration: 10000,
    primeMessage: "10 revenue streams. Career tracking. Growth analytics. Your entire music business, one dashboard.",
  },
  {
    id: 'cta',
    title: 'Join Us',
    duration: 999999,
    primeMessage: "Your music deserves this. Let's make magic together. Welcome to MixClub.",
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
  'Subscription Tiers', 'Referral Bonuses', 'Promo Shares', 'Gig Marketplace',
  'Track Sales', 'Pro Services', 'Course Sales', 'Partner Commissions',
  'White-Label', 'Enterprise'
];

export default function InsiderDemo() {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [activePlugin, setActivePlugin] = useState(0);
  
  const navigate = useNavigate();
  const { accentColor, networkAwareness } = usePrime();
  
  const {
    isAudioEnabled,
    isLoading,
    volume,
    isMuted,
    enableAudio,
    playSegment,
    getAudioData,
    setVolume,
    setIsMuted
  } = useWelcomeAudio(6);

  const [audioData, setAudioData] = useState({ amplitude: 0, frequency: 0, beats: Array(8).fill(0), isPlaying: false });

  // Audio data polling
  useEffect(() => {
    if (!isAudioEnabled) return;
    const interval = setInterval(() => {
      setAudioData(getAudioData());
    }, 50);
    return () => clearInterval(interval);
  }, [isAudioEnabled, getAudioData]);

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

  // Typewriter effect for Prime messages
  useEffect(() => {
    const message = DEMO_PHASES[currentPhase]?.primeMessage || '';
    setTypedText('');
    let index = 0;
    
    const typeInterval = setInterval(() => {
      if (index < message.length) {
        setTypedText(message.slice(0, index + 1));
        index++;
      } else {
        clearInterval(typeInterval);
      }
    }, 30);
    
    return () => clearInterval(typeInterval);
  }, [currentPhase]);

  // Analysis simulation
  useEffect(() => {
    if (DEMO_PHASES[currentPhase]?.id !== 'analysis') {
      setAnalysisProgress(0);
      return;
    }
    
    const interval = setInterval(() => {
      setAnalysisProgress(prev => Math.min(prev + 2, 100));
    }, 100);
    
    return () => clearInterval(interval);
  }, [currentPhase]);

  // Plugin cycling during studio phase
  useEffect(() => {
    if (DEMO_PHASES[currentPhase]?.id !== 'studio') return;
    
    const interval = setInterval(() => {
      setActivePlugin(prev => (prev + 1) % PLUGINS.length);
    }, 2500);
    
    return () => clearInterval(interval);
  }, [currentPhase]);

  // Audio segment switching
  useEffect(() => {
    if (isAudioEnabled && currentPhase < 6) {
      playSegment(Math.min(currentPhase, 5));
    }
  }, [currentPhase, isAudioEnabled, playSegment]);

  const handleStartAudio = useCallback(async () => {
    await enableAudio();
    playSegment(0);
  }, [enableAudio, playSegment]);

  const skipToPhase = (index: number) => {
    setCurrentPhase(index);
    setPhaseProgress(0);
    setIsAutoPlay(false);
  };

  const phase = DEMO_PHASES[currentPhase];
  const amplitude = audioData.amplitude || 0;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Audio-Reactive Background */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 30% 20%, hsl(var(--primary) / ${0.15 + amplitude * 0.003}) 0%, transparent 50%),
                        radial-gradient(circle at 70% 80%, hsl(280 100% 50% / ${0.12 + amplitude * 0.003}) 0%, transparent 50%),
                        radial-gradient(circle at 50% 50%, hsl(200 100% 50% / ${0.08 + amplitude * 0.002}) 0%, transparent 70%)`
          }}
        />
        
        {/* Animated Grid */}
        <motion.div 
          className="absolute inset-0 opacity-[0.04]"
          animate={{ 
            backgroundPosition: ['0px 0px', '80px 80px'],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          style={{
            backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
                             linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: '80px 80px'
          }}
        />

        {/* Audio Visualizer */}
        {isAudioEnabled && (
          <div className="absolute bottom-0 left-0 right-0 h-40 flex items-end justify-center gap-1 px-8 opacity-60">
            {audioData.beats.map((beat, i) => (
              <motion.div
                key={i}
                className="w-3 rounded-t"
                style={{
                  background: `linear-gradient(to top, hsl(var(--primary)), hsl(280 100% 60%))`,
                  boxShadow: `0 0 20px hsl(var(--primary) / 0.5)`
                }}
                animate={{ height: `${Math.max(beat * 1.5, 10)}%` }}
                transition={{ duration: 0.05 }}
              />
            ))}
          </div>
        )}

        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/40"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight 
            }}
            animate={{
              y: [null, -100],
              opacity: [0.4, 0]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      {/* Phase Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Progress value={phaseProgress} className="h-1 rounded-none" />
      </div>

      {/* Header */}
      <header className="fixed top-2 left-0 right-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <PrimeGlow intensity={amplitude / 100}>
              <img src={mixclubLogo} alt="MixClub" className="w-12 h-12" />
            </PrimeGlow>
            <div>
              <h2 className="font-bold text-lg">MIXCLUB</h2>
              <Badge variant="outline" className="text-xs border-primary/50 text-primary">
                <Rocket className="w-3 h-3 mr-1" /> INSIDER DEMO
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Audio Controls */}
            {!isAudioEnabled ? (
              <Button
                onClick={handleStartAudio}
                disabled={isLoading}
                className="gap-2 bg-gradient-to-r from-primary to-purple-600"
              >
                {isLoading ? (
                  <>Loading...</>
                ) : (
                  <>
                    <Play className="w-4 h-4" /> Enable Audio
                  </>
                )}
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-20 accent-primary"
                />
              </div>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className="gap-2"
            >
              {isAutoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isAutoPlay ? 'Pause' : 'Play'}
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
            className={`block w-2 h-8 rounded-full transition-all ${
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
      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-12">
        <AnimatePresence mode="wait">
          {/* Phase 0: Prime Awakens */}
          {phase.id === 'awakening' && (
            <motion.div
              key="awakening"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="text-center"
            >
              <PrimeGlow intensity={1 + amplitude / 50}>
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <PrimeAvatar size="xl" animate />
                </motion.div>
              </PrimeGlow>
              
              <motion.h1 
                className="text-6xl md:text-8xl font-black mt-8 mb-4"
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-cyan-500">
                  PRIME 4.0
                </span>
              </motion.h1>
              
              <p className="text-xl text-muted-foreground max-w-lg mx-auto">{typedText}</p>
              
              {/* Network Status */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2 }}
                className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground"
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {networkAwareness.onlineEngineers} Engineers Online
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                  {networkAwareness.activeUsers} Active Users
                </span>
              </motion.div>
            </motion.div>
          )}

          {/* Phase 1: The Mission */}
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
                initial={{ y: 50 }}
                animate={{ y: 0 }}
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-cyan-500">
                  From Bedroom
                </span>
                <br />
                <span className="text-foreground">to Billboard</span>
              </motion.h1>

              {/* 4-Step Workflow */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                {['Upload & Analyze', 'Pro Mixing', 'AI Mastering', 'Distribute'].map((step, i) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.3 }}
                  >
                    <Card className="p-4 bg-card/50 backdrop-blur border-primary/20">
                      <div className="text-3xl font-black text-primary mb-2">{i + 1}</div>
                      <p className="text-sm font-medium">{step}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-2">
                <PrimeAvatar size="sm" />
                <p className="text-lg text-muted-foreground">{typedText}</p>
              </div>
            </motion.div>
          )}

          {/* Phase 2: AI Analysis */}
          {phase.id === 'analysis' && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-4xl"
            >
              <div className="flex items-center gap-4 mb-8">
                <PrimeAvatar size="md" />
                <p className="text-lg text-muted-foreground">{typedText}</p>
              </div>

              <Card className="p-8 bg-card/50 backdrop-blur border-primary/20">
                <div className="flex items-center gap-4 mb-6">
                  <Brain className="w-8 h-8 text-primary" />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">AI Track Analysis</h3>
                    <Progress value={analysisProgress} className="h-2 mt-2" />
                  </div>
                  <Badge variant="outline">{analysisProgress}%</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Genre', value: 'Hip-Hop/Trap', confidence: 92 },
                    { label: 'Key', value: 'A Minor', confidence: 98 },
                    { label: 'BPM', value: '140', confidence: 99 },
                    { label: 'Energy', value: 'High', confidence: 87 },
                  ].map((item, i) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ 
                        opacity: analysisProgress > (i + 1) * 20 ? 1 : 0.3,
                        scale: analysisProgress > (i + 1) * 20 ? 1 : 0.9
                      }}
                    >
                      <Card className="p-4 bg-background/50">
                        <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                        <p className="text-xl font-bold">{item.value}</p>
                        <Badge variant="outline" className="text-xs mt-2">
                          {item.confidence}% confidence
                        </Badge>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {analysisProgress >= 80 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30"
                  >
                    <p className="text-emerald-400 font-medium">
                      ✨ Perfect match found: 3 engineers specialize in this sound
                    </p>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          )}

          {/* Phase 3: Studio Tour */}
          {phase.id === 'studio' && (
            <motion.div
              key="studio"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-5xl"
            >
              <div className="flex items-center gap-4 mb-8">
                <PrimeAvatar size="md" />
                <p className="text-lg text-muted-foreground">{typedText}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Active Plugin Showcase */}
                <motion.div
                  key={activePlugin}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Card className={`p-8 bg-gradient-to-br ${PLUGINS[activePlugin].color} border-0 h-full`}>
                    <div className="text-white">
                      {(() => {
                        const IconComponent = PLUGINS[activePlugin].icon;
                        return <IconComponent className="w-16 h-16 mb-4 opacity-90" />;
                      })()}
                      <h3 className="text-3xl font-bold mb-2">{PLUGINS[activePlugin].name}</h3>
                      <p className="text-white/80 text-lg mb-6">{PLUGINS[activePlugin].type}</p>
                      
                      {/* Fake Plugin UI */}
                      <div className="grid grid-cols-3 gap-4">
                        {['Input', 'Output', 'Mix'].map((knob) => (
                          <div key={knob} className="text-center">
                            <motion.div
                              className="w-12 h-12 mx-auto rounded-full bg-white/20 border-2 border-white/40"
                              animate={{ rotate: [0, 45, 0] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                            <p className="text-xs mt-2 text-white/70">{knob}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </motion.div>

                {/* Plugin Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {PLUGINS.map((plugin, i) => (
                    <motion.div
                      key={plugin.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ 
                        opacity: 1, 
                        y: 0,
                        scale: i === activePlugin ? 1.05 : 1
                      }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Card 
                        className={`p-4 cursor-pointer transition-all ${
                          i === activePlugin ? 'border-primary ring-2 ring-primary/50' : ''
                        }`}
                        onClick={() => setActivePlugin(i)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${plugin.color}`}>
                            <plugin.icon className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{plugin.name}</p>
                            <p className="text-xs text-muted-foreground">{plugin.type}</p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>

              <p className="text-center text-muted-foreground mt-6">
                + 18 more professional plugins included
              </p>
            </motion.div>
          )}

          {/* Phase 4: Collaboration */}
          {phase.id === 'collaboration' && (
            <motion.div
              key="collaboration"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-5xl"
            >
              <div className="flex items-center gap-4 mb-8">
                <PrimeAvatar size="md" />
                <p className="text-lg text-muted-foreground">{typedText}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Artist Side */}
                <Card className="p-6 bg-gradient-to-br from-pink-500/10 to-rose-500/10 border-pink-500/30">
                  <div className="flex items-center gap-3 mb-4">
                    <Mic2 className="w-6 h-6 text-pink-500" />
                    <h3 className="font-bold">Artist View</h3>
                  </div>
                  <div className="space-y-3">
                    {['Uploading stems...', 'Adding feedback: "More punch on the 808s"', 'Approving mix v3'].map((action, i) => (
                      <motion.div
                        key={action}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1 + i * 0.8 }}
                        className="p-3 rounded-lg bg-background/50 text-sm"
                      >
                        {action}
                      </motion.div>
                    ))}
                  </div>
                </Card>

                {/* Engineer Side */}
                <Card className="p-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
                  <div className="flex items-center gap-3 mb-4">
                    <Headphones className="w-6 h-6 text-cyan-500" />
                    <h3 className="font-bold">Engineer View</h3>
                  </div>
                  <div className="space-y-3">
                    {['Receiving files...', 'Applying EQ boost at 3kHz', 'Rendering final master'].map((action, i) => (
                      <motion.div
                        key={action}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.4 + i * 0.8 }}
                        className="p-3 rounded-lg bg-background/50 text-sm"
                      >
                        {action}
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Connection Line */}
              <div className="flex items-center justify-center my-6">
                <motion.div
                  className="h-1 bg-gradient-to-r from-pink-500 via-primary to-cyan-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2 }}
                />
              </div>

              <p className="text-center text-muted-foreground">
                Real-time collaboration • Version control • Instant messaging
              </p>
            </motion.div>
          )}

          {/* Phase 5: Results */}
          {phase.id === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-4xl text-center"
            >
              <div className="flex items-center justify-center gap-4 mb-8">
                <PrimeAvatar size="md" />
                <p className="text-lg text-muted-foreground">{typedText}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Avg Delivery', value: '24hrs', icon: Zap },
                  { label: 'DSP Platforms', value: '30+', icon: Globe },
                  { label: 'Satisfaction', value: '98%', icon: Award },
                  { label: 'Revenue Tracked', value: '$47K+', icon: DollarSign },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.2 }}
                  >
                    <Card className="p-6 bg-card/50 backdrop-blur">
                      <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                      <p className="text-3xl font-black">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Phase 6: CRM Power */}
          {phase.id === 'crm' && (
            <motion.div
              key="crm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-5xl"
            >
              <div className="flex items-center gap-4 mb-8">
                <PrimeAvatar size="md" />
                <p className="text-lg text-muted-foreground">{typedText}</p>
              </div>

              <h2 className="text-3xl font-bold text-center mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">
                  10 Revenue Streams
                </span>
              </h2>

              <div className="flex flex-wrap justify-center gap-3">
                {REVENUE_STREAMS.map((stream, i) => (
                  <motion.div
                    key={stream}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Badge 
                      variant="outline" 
                      className="text-sm py-2 px-4 bg-primary/10 border-primary/30"
                    >
                      {stream}
                    </Badge>
                  </motion.div>
                ))}
              </div>

              <div className="grid md:grid-cols-3 gap-4 mt-8">
                {[
                  { title: 'Dashboard Hub', desc: 'Career momentum tracking' },
                  { title: 'Marketplace', desc: 'Gigs, beats, services' },
                  { title: 'Growth Hub', desc: 'Analytics & milestones' },
                ].map((hub, i) => (
                  <motion.div
                    key={hub.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 + i * 0.2 }}
                  >
                    <Card className="p-4 bg-card/50">
                      <h4 className="font-bold">{hub.title}</h4>
                      <p className="text-sm text-muted-foreground">{hub.desc}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Phase 7: Call to Action */}
          {phase.id === 'cta' && (
            <motion.div
              key="cta"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <PrimeGlow intensity={1.5}>
                <PrimeAvatar size="xl" animate />
              </PrimeGlow>
              
              <h1 className="text-5xl md:text-7xl font-black mt-8 mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-cyan-500">
                  Your Turn
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-lg mx-auto mb-8">{typedText}</p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/auth?signup=true')}
                  className="gap-2 bg-gradient-to-r from-primary to-purple-600 text-lg px-8 py-6"
                >
                  <Rocket className="w-5 h-5" /> Start Free
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="gap-2 text-lg px-8 py-6"
                >
                  Explore More <ArrowRight className="w-5 h-5" />
                </Button>
              </div>

              <p className="text-sm text-muted-foreground mt-8">
                Built by MixClub • Powered by Prime 4.0
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Status */}
      <footer className="fixed bottom-4 left-0 right-0 z-40 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Phase {currentPhase + 1}/{DEMO_PHASES.length}: {phase.title}
          </div>
          <div className="flex items-center gap-4">
            <span>Press <kbd className="px-2 py-0.5 rounded bg-muted text-xs">→</kbd> to skip</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
