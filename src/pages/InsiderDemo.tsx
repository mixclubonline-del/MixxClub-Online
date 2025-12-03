import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Play, Pause, ChevronRight, Zap, Users, Music, 
  DollarSign, Headphones, Mic2, Shield, Rocket,
  TrendingUp, Award, Globe, Sparkles, ArrowRight
} from 'lucide-react';
import { useAudioReactivity } from '@/hooks/useAudioReactivity';

const DEMO_ZONES = [
  {
    id: 'artist',
    title: 'Artist Command Center',
    subtitle: 'Your Music Career HQ',
    icon: Mic2,
    color: 'from-pink-500 to-rose-600',
    features: ['AI-Powered Matching', 'Project Management', 'Career Analytics', 'Revenue Dashboard'],
    route: '/demo',
    stats: { projects: '2.4K+', artists: '890+', revenue: '$47K+' }
  },
  {
    id: 'engineer',
    title: 'Engineer Studio',
    subtitle: 'Your Audio Business HQ',
    icon: Headphones,
    color: 'from-cyan-500 to-blue-600',
    features: ['Job Marketplace', 'Portfolio Showcase', 'Earnings Tracker', 'Client Management'],
    route: '/demo',
    stats: { completed: '1.2K+', engineers: '340+', satisfaction: '98%' }
  },
  {
    id: 'marketplace',
    title: 'The Marketplace',
    subtitle: '10 Revenue Streams',
    icon: DollarSign,
    color: 'from-emerald-500 to-green-600',
    features: ['Gig Marketplace', 'Beat Store', 'Services', 'Label Partnerships'],
    route: '/marketplace',
    stats: { listings: '500+', sales: '$125K+', partners: '45+' }
  },
  {
    id: 'collab',
    title: 'Live Collaboration',
    subtitle: 'Real-Time Sessions',
    icon: Users,
    color: 'from-violet-500 to-purple-600',
    features: ['Real-Time Chat', 'File Sharing', 'Version Control', 'Video Calls'],
    route: '/session-workspace',
    stats: { sessions: '890+', files: '12K+', hours: '5.6K+' }
  },
  {
    id: 'ai',
    title: 'AI Audio Lab',
    subtitle: 'Next-Gen Intelligence',
    icon: Sparkles,
    color: 'from-amber-500 to-orange-600',
    features: ['AI Mastering', 'Smart Matching', 'Audio Analysis', 'Auto-Enhancement'],
    route: '/ai-mastering',
    stats: { tracks: '3.2K+', accuracy: '96%', saved: '240hrs' }
  },
  {
    id: 'admin',
    title: 'Admin Command',
    subtitle: 'Platform Control',
    icon: Shield,
    color: 'from-slate-500 to-zinc-600',
    features: ['User Management', 'Analytics Dashboard', 'Security Center', 'Revenue Reports'],
    route: '/demo',
    stats: { users: '1.5K+', uptime: '99.9%', security: 'A+' }
  }
];

const PLATFORM_STATS = [
  { label: 'Active Users', value: '1,523', icon: Users, trend: '+12%' },
  { label: 'Projects Completed', value: '2,847', icon: Music, trend: '+28%' },
  { label: 'Total Revenue', value: '$47,580', icon: DollarSign, trend: '+45%' },
  { label: 'Satisfaction', value: '98.5%', icon: Award, trend: '+2%' },
];

export default function InsiderDemo() {
  const [currentZone, setCurrentZone] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const [isAudioActive, setIsAudioActive] = useState(false);
  const audioState = useAudioReactivity({ simulationMode: isAudioActive });
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showIntro) {
      const interval = setInterval(() => {
        setCurrentZone(prev => (prev + 1) % DEMO_ZONES.length);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [showIntro]);

  const activeZone = DEMO_ZONES[currentZone];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Audio-Reactive Background */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 30% 20%, hsl(var(--primary) / ${0.1 + audioState.amplitude * 0.002}) 0%, transparent 50%),
                        radial-gradient(circle at 70% 80%, hsl(280 100% 50% / ${0.08 + audioState.amplitude * 0.002}) 0%, transparent 50%),
                        radial-gradient(circle at 50% 50%, hsl(200 100% 50% / ${0.05 + audioState.amplitude * 0.001}) 0%, transparent 70%)`
          }}
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        
        {/* Animated Grid */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
                             linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: '80px 80px'
          }}
        />

        {/* Audio Visualizer Bars */}
        {isAudioActive && (
          <div className="absolute bottom-0 left-0 right-0 h-32 flex items-end justify-center gap-1 px-8">
            {audioState.beats.map((beat, i) => (
              <motion.div
                key={i}
                className="w-2 rounded-t bg-gradient-to-t from-primary to-primary/50"
                animate={{ height: `${beat * 1.2}%` }}
                transition={{ duration: 0.1 }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Intro Animation */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-background"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-primary via-purple-500 to-cyan-500 flex items-center justify-center"
              >
                <Zap className="w-16 h-16 text-white" />
              </motion.div>
              <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-cyan-500">
                MIXCLUB
              </h1>
              <p className="text-xl text-muted-foreground mt-2">Insider Beta Demo</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg">MIXCLUB</h2>
              <Badge variant="outline" className="text-xs border-primary/50 text-primary">
                <Rocket className="w-3 h-3 mr-1" /> INSIDER BETA
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAudioActive(!isAudioActive)}
              className="gap-2"
            >
              {isAudioActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isAudioActive ? 'Pause Vibe' : 'Start Vibe'}
            </Button>
            <Button onClick={() => navigate('/demo')} className="gap-2">
              Launch Full Demo <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-7xl font-black mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-cyan-500">
                From Bedroom
              </span>
              <br />
              <span className="text-foreground">to Billboard</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The AI-powered platform where artists and engineers grow careers together. 
              10 revenue streams. Infinite possibilities.
            </p>
          </motion.div>

          {/* Stats Bar */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 w-full max-w-4xl"
          >
            {PLATFORM_STATS.map((stat, i) => (
              <Card key={i} className="p-4 bg-card/50 backdrop-blur border-border/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30">
                        <TrendingUp className="w-2 h-2 mr-0.5" />
                        {stat.trend}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </motion.div>

          {/* Demo Zones Carousel */}
          <div className="w-full max-w-6xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Explore Demo Zones</h2>
              <div className="flex gap-2">
                {DEMO_ZONES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentZone(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === currentZone ? 'w-8 bg-primary' : 'bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Featured Zone (Large) */}
              <motion.div
                key={activeZone.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="md:col-span-2"
              >
                <Card 
                  className={`relative overflow-hidden p-8 h-full cursor-pointer group bg-gradient-to-br ${activeZone.color} border-0`}
                  onClick={() => navigate(activeZone.route)}
                >
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="relative z-10 text-white">
                    <activeZone.icon className="w-16 h-16 mb-6 opacity-90" />
                    <h3 className="text-3xl font-bold mb-2">{activeZone.title}</h3>
                    <p className="text-white/80 text-lg mb-6">{activeZone.subtitle}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-8">
                      {activeZone.features.map((feature, i) => (
                        <Badge key={i} variant="secondary" className="bg-white/20 text-white border-0">
                          {feature}
                        </Badge>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      {Object.entries(activeZone.stats).map(([key, value]) => (
                        <div key={key}>
                          <p className="text-2xl font-bold">{value}</p>
                          <p className="text-sm text-white/70 capitalize">{key}</p>
                        </div>
                      ))}
                    </div>

                    <Button variant="secondary" className="gap-2 group-hover:gap-3 transition-all">
                      Explore Zone <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>

              {/* Other Zones (Small) */}
              <div className="space-y-4">
                {DEMO_ZONES.filter((_, i) => i !== currentZone).slice(0, 3).map((zone, i) => (
                  <motion.div
                    key={zone.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card 
                      className="p-4 cursor-pointer hover:border-primary/50 transition-all group"
                      onClick={() => setCurrentZone(DEMO_ZONES.findIndex(z => z.id === zone.id))}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${zone.color}`}>
                          <zone.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{zone.title}</h4>
                          <p className="text-sm text-muted-foreground">{zone.subtitle}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions Footer */}
        <footer className="p-6 border-t border-border/50 bg-card/30 backdrop-blur">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="w-4 h-4" />
              <span>Platform Status: <span className="text-emerald-500">All Systems Operational</span></span>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={() => navigate('/pricing')}>
                View Pricing
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/services/mixing')}>
                Mixing Showcase
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/services/mastering')}>
                Mastering Showcase
              </Button>
              <Button size="sm" onClick={() => navigate('/auth')} className="gap-2">
                <Rocket className="w-4 h-4" /> Get Started
              </Button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
