import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { PrimeAvatar } from '@/components/prime/PrimeAvatar';
import { ArrowRight, Play, Sparkles, Mic2, Headphones, Share2, Clock, DollarSign } from 'lucide-react';
import { useFlowNavigation } from '@/core/fabric/useFlow';

export const PrimeHero = () => {
  const { goToAuth, openPricing } = useFlowNavigation();
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-background via-primary/5 to-background">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container relative z-10 px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* MIXXCLUB Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center gap-3"
            >
              <PrimeAvatar size="md" />
              <Badge variant="secondary" className="gap-2 py-1.5 px-4">
                <Sparkles className="w-3 h-3" />
                AI-Powered Audio Engineering
              </Badge>
              <Badge variant="destructive" className="gap-2 animate-pulse py-1.5 px-4">
                <Clock className="w-3 h-3" />
                Only 5 slots left this week
              </Badge>
            </motion.div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight">
                From Bedroom to
                <span className="block bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                  Billboard
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-xl">
                AI-powered session prep, professional mixing, instant mastering, and seamless distribution—all in one platform.
              </p>
            </div>

            {/* Social Proof */}
            <div className="flex flex-wrap items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-primary/20 border-2 border-background" />
                  ))}
                </div>
                <div className="text-sm">
                  <div className="font-bold">12,000+ Artists</div>
                  <div className="text-muted-foreground">Trust Mixclub</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-yellow-500 text-2xl">★★★★★</div>
                <div className="text-sm">
                  <div className="font-bold">4.9/5</div>
                  <div className="text-muted-foreground">2,400+ Reviews</div>
                </div>
              </div>
            </div>

            {/* CTAs and Pricing */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={() => goToAuth('signup')} className="gap-2 text-lg px-8 shadow-glow">
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => setIsVideoPlaying(true)} className="gap-2 text-lg px-8">
                  <Play className="w-5 h-5" />
                  Watch Demo
                </Button>
              </div>

              {/* Pricing Preview Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="p-6 bg-card/50 backdrop-blur border-primary/20 min-w-[280px]">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Starting at</h3>
                    <Badge variant="secondary" className="gap-1">
                      <DollarSign className="w-3 h-3" />
                      Limited Slots
                    </Badge>
                  </div>
                  <div className="text-4xl font-bold text-primary mb-2">
                    $29<span className="text-lg text-muted-foreground">/track</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Professional mixing + AI session prep
                  </p>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => openPricing()}
                  >
                    View All Plans →
                  </Button>
                </Card>
              </motion.div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6 pt-4">
              <div>
                <div className="text-3xl font-bold text-primary">60s</div>
                <div className="text-sm text-muted-foreground">AI Session Prep</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">24h</div>
                <div className="text-sm text-muted-foreground">Mix Delivery</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">30+</div>
                <div className="text-sm text-muted-foreground">DSPs Covered</div>
              </div>
            </div>
          </motion.div>

          {/* Right: Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            {/* Platform Preview Card */}
            <div className="relative bg-card border border-primary/20 rounded-2xl p-8 shadow-elegant">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl" />
              
              <div className="relative space-y-6">
                {/* Workflow Steps */}
                <div className="space-y-4">
                  {[
                    { icon: Mic2, label: 'Upload & Analyze', color: 'text-blue-500' },
                    { icon: Headphones, label: 'Pro Mixing', color: 'text-purple-500' },
                    { icon: Sparkles, label: 'AI Mastering', color: 'text-yellow-500' },
                    { icon: Share2, label: 'Distribute', color: 'text-green-500' },
                  ].map((step, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className="flex items-center gap-4 p-4 bg-background/80 backdrop-blur rounded-lg border border-border"
                    >
                      <div className={`w-12 h-12 rounded-full bg-background flex items-center justify-center ${step.color}`}>
                        <step.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{step.label}</div>
                        <div className="text-sm text-muted-foreground">Step {i + 1}</div>
                      </div>
                      <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                    </motion.div>
                  ))}
                </div>

                {/* Live Activity Indicator */}
                <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping" />
                    </div>
                    <span className="text-sm font-medium">87 engineers online now</span>
                  </div>
                  <Badge variant="secondary">Live</Badge>
                </div>
              </div>
            </div>

            {/* Floating MIXXCLUB Assistant */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-6 -left-6 bg-card border border-primary/20 rounded-2xl p-4 shadow-elegant"
            >
              <div className="flex items-center gap-3">
                <PrimeAvatar size="sm" />
                <div className="text-sm">
                  <div className="font-semibold">MIXXCLUB is ready</div>
                  <div className="text-muted-foreground">Let's make magic ✨</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
