import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Music, Headphones, Users, Sparkles, 
  Zap, Radio, TrendingUp, ArrowRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AudioWaveformBg } from "@/components/brand/AudioWaveformBg";
import { ParticleBackground } from "@/components/home/2030/ParticleBackground";
import { HolographicPlatform } from "@/components/brand/HolographicPlatform";
import { HoverCard3D } from "@/components/interactive/HoverCard3D";

import { useState, useEffect } from "react";

// Live stats animation
const LiveStats = () => {
  const [stats, setStats] = useState({
    activeUsers: 523,
    projectsCompleted: 12847,
    earningsDistributed: 284920
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 3) - 1,
        projectsCompleted: prev.projectsCompleted + Math.floor(Math.random() * 2),
        earningsDistributed: prev.earningsDistributed + Math.floor(Math.random() * 100)
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      className="flex flex-wrap items-center justify-center gap-8 text-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <div className="glass-pill flex items-center gap-2 px-4 py-2 rounded-full border border-[hsl(var(--glass-border))]">
        <div className="w-2 h-2 rounded-full bg-[hsl(var(--accent-cyan))] animate-pulse" />
        <span className="text-muted-foreground">
          <span className="font-bold text-foreground">{stats.activeUsers}</span> online now
        </span>
      </div>
      <div className="glass-pill flex items-center gap-2 px-4 py-2 rounded-full border border-[hsl(var(--glass-border))]">
        <TrendingUp className="w-4 h-4 text-[hsl(var(--primary))]" />
        <span className="text-muted-foreground">
          <span className="font-bold text-foreground">{stats.projectsCompleted.toLocaleString()}</span> projects completed
        </span>
      </div>
      <div className="glass-pill flex items-center gap-2 px-4 py-2 rounded-full border border-[hsl(var(--glass-border))]">
        <Sparkles className="w-4 h-4 text-[hsl(var(--accent-cyan))]" />
        <span className="text-muted-foreground">
          <span className="font-bold text-foreground">${stats.earningsDistributed.toLocaleString()}</span> earned by engineers
        </span>
      </div>
    </motion.div>
  );
};

// Three main paths
const pathCards = [
  {
    id: 'artist',
    title: 'Create & Collaborate',
    subtitle: 'For Artists',
    description: 'Upload tracks, get AI-powered insights, collaborate with engineers',
    route: '/artist',
    icon: Music,
    gradient: 'from-[hsl(270_100%_70%)] to-[hsl(270_100%_60%)]',
    features: ['AI Mastering', 'Engineer Matching', 'Project Management']
  },
  {
    id: 'engineer',
    title: 'Build & Earn',
    subtitle: 'For Engineers',
    description: 'Accept projects, showcase work, earn from your expertise',
    route: '/engineer',
    icon: Headphones,
    gradient: 'from-[hsl(210_100%_60%)] to-[hsl(210_100%_50%)]',
    features: ['Job Board', 'Portfolio', 'Earnings Dashboard']
  },
  {
    id: 'community',
    title: 'Connect & Compete',
    subtitle: 'For Everyone',
    description: 'Join battles, share work, learn from the community',
    route: '/community',
    icon: Users,
    gradient: 'from-[hsl(185_100%_55%)] to-[hsl(185_100%_45%)]',
    features: ['Mix Battles', 'Live Feed', 'Forums']
  }
];

// Service showcase cards
const serviceCards = [
  {
    id: 'mixing',
    title: 'Professional Mixing',
    description: 'Studio-quality mixes from expert engineers',
    route: '/services/mixing',
    icon: Zap,
    color: 'hsl(270 100% 70%)'
  },
  {
    id: 'mastering',
    title: 'Audio Mastering',
    description: 'Polish your tracks to radio-ready perfection',
    route: '/services/mastering',
    icon: Sparkles,
    color: 'hsl(210 100% 55%)'
  },
  {
    id: 'studio',
    title: 'AI Studio',
    description: 'Intelligent mixing and mastering tools',
    route: '/studio',
    icon: Radio,
    color: 'hsl(185 100% 50%)'
  },
  {
    id: 'distribution',
    title: 'Distribution',
    description: 'Get your music on all major platforms',
    route: '/services/distribution',
    icon: TrendingUp,
    color: 'hsl(300 90% 65%)'
  }
];

export default function PrimeLanding() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-foreground overflow-hidden relative">
      {/* Prime Studio Background */}
      <div className="fixed inset-0 z-0">
        <img 
          src="/assets/prime-pointing.jpg" 
          alt="Prime's Studio"
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(0.35) saturate(1.3)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-background/70" />
      </div>
      
      
      {/* 2030 Particle Network Background */}
      <ParticleBackground />
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-6 py-20 z-10">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Radial gradients */}
          <motion.div
            className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-20"
            style={{
              background: 'radial-gradient(circle, hsl(270 100% 70%), transparent 70%)',
              filter: 'blur(80px)'
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.3, 0.2]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full opacity-20"
            style={{
              background: 'radial-gradient(circle, hsl(185 100% 50%), transparent 70%)',
              filter: 'blur(80px)'
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.25, 0.2]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
          
          {/* Floating particles */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-[hsl(var(--primary))]"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 text-center max-w-5xl mx-auto">
          {/* Holographic Platform behind content */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none -z-10">
            <HolographicPlatform size={600} rings={12} />
          </div>
          
          {/* AI-Powered Feature Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl glass-floating border border-[hsl(var(--glass-border-glow))] shadow-glass-glow animate-glass-glow-pulse">
              <Sparkles className="w-5 h-5 text-[hsl(var(--accent-cyan))] animate-pulse" />
              <span className="text-lg md:text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--primary))] via-[hsl(var(--accent-blue))] to-[hsl(var(--accent-cyan))]">
                AI-Powered Collaboration
              </span>
              <Zap className="w-5 h-5 text-[hsl(var(--primary))] animate-pulse" />
            </div>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--primary))] via-[hsl(var(--accent-blue))] to-[hsl(var(--accent-cyan))] drop-shadow-[0_0_30px_hsl(var(--primary)/0.5)]">
              From Bedroom
            </span>
            <br />
            <span className="text-foreground drop-shadow-[0_0_20px_hsl(var(--foreground)/0.3)]">to Billboard</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto"
          >
            Transform your sound with AI-powered tools, professional engineers, and a collaborative network built for the future.
          </motion.p>

          {/* Audio waveform visualization */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-10"
          >
            <AudioWaveformBg bars={60} height={80} className="opacity-60" />
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-4 mb-12"
          >
            <Link to="/auth?mode=signup">
              <Button size="lg" className="group relative overflow-hidden bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent-blue))] hover:shadow-[0_0_60px_hsl(var(--primary)/0.8)] transition-all border border-[hsl(var(--primary)/0.3)]">
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
              <Button size="lg" variant="outline" className="glass border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.1)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)] transition-all">
                How It Works
              </Button>
            </Link>
            <Link to="/brand-forge">
              <Button size="lg" variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-primary/10">
                Brand Forge →
              </Button>
            </Link>
          </motion.div>

          {/* Live Stats */}
          <LiveStats />
        </div>
      </section>

      {/* Three Paths Section */}
      <section className="relative px-6 py-24 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Choose Your Path</h2>
            <p className="text-xl text-muted-foreground">Three ways to elevate your music</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {pathCards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={card.route}>
                  <HoverCard3D intensity="high" className="h-full">
                    <div className="group h-full glass-near rounded-2xl p-8 transition-all duration-300 cursor-pointer border border-[hsl(var(--glass-border))] hover:border-[hsl(var(--glass-border-glow))] hover:shadow-glass-glow glass-reflect">
                    {/* Icon with gradient background */}
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <card.icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Subtitle */}
                    <div className={`text-sm font-mono text-transparent bg-clip-text bg-gradient-to-r ${card.gradient} mb-2`}>
                      {card.subtitle}
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold mb-3">{card.title}</h3>

                    {/* Description */}
                    <p className="text-muted-foreground mb-6">{card.description}</p>

                    {/* Features */}
                    <ul className="space-y-2 mb-6">
                      {card.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${card.gradient}`} />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Arrow */}
                    <div className="flex items-center gap-2 text-[hsl(var(--primary))] group-hover:gap-4 transition-all">
                      <span className="font-medium">Get Started</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                  </HoverCard3D>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="relative px-6 py-24 bg-[hsl(var(--card)/0.3)] backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Services</h2>
            <p className="text-xl text-muted-foreground">Professional audio solutions at your fingertips</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {serviceCards.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={service.route}>
                  <HoverCard3D intensity="medium" glowColor={service.color} className="h-full">
                    <div className="group glass-mid rounded-xl p-6 transition-all duration-300 cursor-pointer h-full border border-[hsl(var(--glass-border))] hover:border-[hsl(var(--glass-border-strong))] hover:shadow-glass glass-reflect">
                    <div 
                      className="glass-pill w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                      style={{
                        background: `${service.color}15`,
                        border: `1px solid ${service.color}40`,
                        backdropFilter: 'blur(16px)'
                      }}
                    >
                      <service.icon 
                        className="w-6 h-6" 
                        style={{ color: service.color }}
                      />
                    </div>
                    <h3 className="text-lg font-bold mb-2">{service.title}</h3>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                  </div>
                  </HoverCard3D>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative px-6 py-24 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Sound?
            </h2>
            <p className="text-xl text-muted-foreground mb-10">
              Join thousands of artists and engineers creating the future of music
            </p>
            <Link to="/auth?mode=signup">
              <Button size="lg" className="group bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent-cyan))] hover:shadow-[0_0_80px_hsl(var(--primary)/0.8)] transition-all border border-[hsl(var(--primary)/0.3)]">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
