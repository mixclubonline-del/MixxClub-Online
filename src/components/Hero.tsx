import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Play, Zap, Music, Users, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { SmartBudgetQualifier } from './home/SmartBudgetQualifier';
import { useSceneSystem } from '@/hooks/useSceneSystem';
import { useFlowNavigation } from '@/core/fabric/useFlow';

const Hero = () => {
  const { user } = useAuth();
  const { openArtistCRM, browseSection } = useFlowNavigation();
  const [showQualifier, setShowQualifier] = useState(false);
  const [activeTab, setActiveTab] = useState<'creators' | 'engineers'>('creators');
  const { communityPulse } = useSceneSystem();

  const handleGetStarted = () => {
    if (!user) {
      setShowQualifier(true);
    } else {
      openArtistCRM();
    }
  };

  const features = [
    {
      icon: Zap,
      title: 'Instant Matching',
      description: 'AI pairs you with perfect collaborators',
      color: 'text-yellow-400',
    },
    {
      icon: Music,
      title: 'Real-Time Collab',
      description: 'Work together from anywhere on Earth',
      color: 'text-pink-400',
    },
    {
      icon: Users,
      title: 'Global Network',
      description: 'Access thousands of verified creators',
      color: 'text-cyan-400',
    },
    {
      icon: TrendingUp,
      title: 'Fair Pricing',
      description: '$0 platform fee. You keep 100%.',
      color: 'text-emerald-400',
    },
  ];

  // Real stats from scene system
  const nextUnlockProgress = communityPulse.nextUnlock 
    ? Math.round((communityPulse.nextUnlock.currentValue / communityPulse.nextUnlock.thresholdValue) * 100)
    : 0;
    
  const stats = [
    { number: communityPulse.totalUsers.toString(), label: 'Creators' },
    { number: communityPulse.totalSessions.toString(), label: 'Sessions' },
    { number: communityPulse.activeUsersNow.toString(), label: 'Active Now' },
    { number: `${nextUnlockProgress}%`, label: 'To Next Unlock' },
  ];

  return (
    <>
      <SmartBudgetQualifier open={showQualifier} onOpenChange={setShowQualifier} />

      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden py-20 bg-gradient-to-b from-background via-background/95 to-background">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Gradient orbs */}
          <motion.div
            className="absolute -top-40 -left-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl opacity-50"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute -bottom-40 -right-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl opacity-50"
            animate={{
              scale: [1.1, 1, 1.1],
              opacity: [0.4, 0.6, 0.4],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 w-96 h-96 bg-secondary/10 rounded-full blur-3xl opacity-30"
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Grid pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 w-full">
          {/* Badge */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              🚀 Revolutionizing Music Collaboration
            </div>
          </motion.div>

          {/* Main headline */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              From Bedroom
              <br />
              to Billboard
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Transform your sound with AI-powered tools, professional engineers, and a collaborative network built for the future.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Button
              onClick={handleGetStarted}
              className="px-8 py-6 text-lg bg-gradient-to-r from-primary to-accent hover:opacity-90 rounded-lg font-bold"
            >
              Enter the Network
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/how-it-works')}
              className="px-8 py-6 text-lg border-border text-foreground hover:bg-muted rounded-lg"
            >
              <Play className="mr-2 w-5 h-5" />
              How It Works
            </Button>
          </motion.div>

          {/* Stats grid - Now showing REAL data */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {stats.map((stat, i) => (
              <div key={i} className="text-center p-4 rounded-lg bg-card/50 border border-border hover:border-primary/50 transition-all">
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Features grid */}
          <motion.div
            className="grid md:grid-cols-4 gap-4 mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            {features.map((feature, i) => {
              const IconComponent = feature.icon;
              return (
                <div key={i} className="p-4 rounded-lg bg-card/50 border border-border hover:border-primary/50 transition-all hover:bg-card">
                  <IconComponent className={`w-8 h-8 mb-3 ${feature.color}`} />
                  <h3 className="font-bold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </motion.div>

          {/* Tabs for creators vs engineers */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={() => setActiveTab('creators')}
                className={`px-6 py-3 rounded-lg font-bold transition-all ${activeTab === 'creators'
                    ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground'
                    : 'bg-card/50 text-muted-foreground hover:bg-card'
                  }`}
              >
                👩‍🎤 For Artists
              </button>
              <button
                onClick={() => setActiveTab('engineers')}
                className={`px-6 py-3 rounded-lg font-bold transition-all ${activeTab === 'engineers'
                    ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground'
                    : 'bg-card/50 text-muted-foreground hover:bg-card'
                  }`}
              >
                👨‍💻 For Engineers
              </button>
            </div>

            {activeTab === 'creators' ? (
              <div className="text-center">
                <h3 className="text-2xl font-bold text-foreground mb-4">Pro Mixes. Instantly.</h3>
                <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
                  Connect with verified engineers who'll mix your track professionally. 48-hour average turnaround. $0 platform fee.
                </p>
                <Button onClick={handleGetStarted} className="px-6 py-3 bg-gradient-to-r from-primary to-accent">
                  Find Engineers Now
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <h3 className="text-2xl font-bold text-foreground mb-4">Get Hired. Get Paid.</h3>
                <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
                  Build your portfolio, showcase your work, and earn from home. Set your own rates. 100% keep what you earn.
                </p>
                <Button onClick={handleGetStarted} className="px-6 py-3 bg-gradient-to-r from-primary to-accent">
                  Apply as Engineer
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Hero;
