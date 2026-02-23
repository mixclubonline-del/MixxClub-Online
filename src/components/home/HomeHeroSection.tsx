/**
 * Home Hero Section
 * 
 * Immersive above-the-fold hero with cinematic background,
 * real-time stats, and primary CTAs.
 */

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, Play, Users, Radio, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCommunityStats } from '@/hooks/useCommunityStats';
import loreVideo from '@/assets/videos/mixxclub-lore.mp4';

export function HomeHeroSection() {
  const { data: stats } = useCommunityStats();

  const statItems = [
    {
      label: 'Members',
      value: stats?.totalUsers?.toLocaleString() || '10,000+',
      icon: Users
    },
    {
      label: 'Active Now',
      value: stats?.activeNow?.toLocaleString() || '50+',
      icon: Radio
    },
    {
      label: 'Projects',
      value: stats?.projectsCompleted?.toLocaleString() || '5,000+',
      icon: Music
    },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 pb-8">
      {/* Ambient Background */}
      <div className="absolute inset-0 bg-background">
        {/* Cinematic background video */}
        <div className="absolute inset-0">
          <video
            src={loreVideo}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover opacity-30"
          />
        </div>

        {/* Gradient mesh overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(var(--secondary)/0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--accent)/0.08),transparent_40%)]" />

        {/* Animated particles - CSS only for performance */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-primary/40 animate-float-particle"
              style={{
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
                animationDelay: `${i * 0.8}s`,
                animationDuration: `${4 + i * 0.5}s`,
              }}
            />
          ))}
        </div>

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
                              linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full 
                     bg-primary/10 border border-primary/20 mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          <span className="text-sm font-medium text-primary">
            The Hip-Hop Network
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-4 md:mb-6"
        >
          <span className="block text-foreground">From Bedroom</span>
          <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            to Billboard
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
        >
          Connect with professional engineers. Transform your rough recordings
          into radio-ready tracks. Join the community building the future of hip-hop.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link to="/choose-path">
            <Button
              size="lg"
              className="group relative px-8 py-6 text-lg font-semibold
                         bg-primary hover:bg-primary/90 text-primary-foreground
                         shadow-[0_0_30px_hsl(var(--primary)/0.4)]
                         hover:shadow-[0_0_40px_hsl(var(--primary)/0.6)]
                         transition-all duration-300"
            >
              <Sparkles className="w-5 h-5 mr-2 group-hover:animate-pulse" />
              Start Your Journey
            </Button>
          </Link>

          <Link to="/how-it-works">
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-6 text-lg font-medium border-border/50
                         hover:bg-muted/50 hover:border-primary/30
                         transition-all duration-300"
            >
              <Play className="w-5 h-5 mr-2" />
              See How It Works
            </Button>
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 sm:gap-8 md:gap-12"
        >
          {statItems.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="p-2 rounded-lg bg-muted/50">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 
                     flex items-start justify-center p-2"
        >
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3], y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-1 h-2 rounded-full bg-primary"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
