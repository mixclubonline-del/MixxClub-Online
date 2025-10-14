import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Music, Headphones, Users, Sparkles, 
  Zap, Radio, TrendingUp, ArrowRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AudioWaveformBg } from "@/components/brand/AudioWaveformBg";
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
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[hsl(var(--accent-cyan))] animate-pulse" />
        <span className="text-muted-foreground">
          <span className="font-bold text-foreground">{stats.activeUsers}</span> online now
        </span>
      </div>
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-[hsl(var(--primary))]" />
        <span className="text-muted-foreground">
          <span className="font-bold text-foreground">{stats.projectsCompleted.toLocaleString()}</span> projects completed
        </span>
      </div>
      <div className="flex items-center gap-2">
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
    route: '/mixing',
    icon: Zap,
    color: 'hsl(270 100% 70%)'
  },
  {
    id: 'mastering',
    title: 'Audio Mastering',
    description: 'Polish your tracks to radio-ready perfection',
    route: '/mastering',
    icon: Sparkles,
    color: 'hsl(210 100% 55%)'
  },
  {
    id: 'studio',
    title: 'AI Studio',
    description: 'Intelligent mixing and mastering tools',
    route: '/artist-crm?tab=studio',
    icon: Radio,
    color: 'hsl(185 100% 50%)'
  },
  {
    id: 'distribution',
    title: 'Distribution',
    description: 'Get your music on all major platforms',
    route: '/distribution',
    icon: TrendingUp,
    color: 'hsl(300 90% 65%)'
  }
];

export default function PrimeLanding() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-foreground overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-6 py-20">
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
          {/* Animated logo badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-block mb-6"
          >
            <div className="px-6 py-2 rounded-full glass border border-[hsl(var(--primary)/0.3)]">
              <span className="text-sm font-mono text-[hsl(var(--primary))]">
                ⚡ PRIME 4.0 — GLASS ARCHITECTURE
              </span>
            </div>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--primary))] via-[hsl(var(--accent-blue))] to-[hsl(var(--accent-cyan))]">
              From Bedroom
            </span>
            <br />
            <span className="text-foreground">to Billboard</span>
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
              <Button size="lg" className="group relative overflow-hidden bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent-blue))] hover:shadow-[0_0_40px_hsl(var(--primary)/0.5)] transition-all">
                <span className="relative z-10 flex items-center gap-2">
                  Enter the Network
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>
            <Link to="/how-it-works">
              <Button size="lg" variant="outline" className="glass border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.1)]">
                How It Works
              </Button>
            </Link>
          </motion.div>

          {/* Live Stats */}
          <LiveStats />
        </div>
      </section>

      {/* Three Paths Section */}
      <section className="relative px-6 py-24">
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
                  <div className="group h-full glass rounded-2xl p-8 hover:shadow-[0_0_50px_hsl(var(--primary)/0.3)] transition-all duration-300 hover:scale-105 cursor-pointer">
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
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="relative px-6 py-24 bg-[hsl(var(--card)/0.3)]">
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
                  <div className="group glass rounded-xl p-6 hover:shadow-[0_0_40px_hsl(var(--primary)/0.2)] transition-all duration-300 hover:scale-105 cursor-pointer h-full">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                      style={{
                        background: `${service.color}20`,
                        border: `1px solid ${service.color}40`
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
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative px-6 py-24">
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
              <Button size="lg" className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent-cyan))] hover:shadow-[0_0_50px_hsl(var(--primary)/0.6)] transition-all">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
