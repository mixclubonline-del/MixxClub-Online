import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Play, CheckCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { DynamicLogo } from './hero/DynamicLogo';
import { SmartBudgetQualifier } from './home/SmartBudgetQualifier';
import { PricingTierCards } from './home/PricingTierCards';
import { LiveActivityTicker } from './home/LiveActivityTicker';
import { TrustBadges } from './TrustBadges';

const Hero = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showQualifier, setShowQualifier] = useState(false);

  const handleGetStarted = () => {
    if (!user) {
      setShowQualifier(true);
    } else {
      navigate('/artist-crm');
    }
  };

  return (
    <>
      <SmartBudgetQualifier open={showQualifier} onOpenChange={setShowQualifier} />
      
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden py-20">
        {/* Dynamic gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-background" />
        
        {/* Animated orbs */}
        <motion.div
          className="absolute top-20 left-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Grid overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />

        {/* Audio wave effect */}
        <div className="absolute bottom-0 left-0 right-0 h-32 opacity-10">
          <div className="flex items-end justify-around h-full gap-1">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="w-1 bg-gradient-to-t from-primary to-purple-600 rounded-t animate-audio-wave"
                style={{
                  height: `${Math.random() * 60 + 20}%`,
                  animationDelay: `${i * 0.05}s`
                }}
              />
            ))}
          </div>
        </div>

        <div className="container relative z-10 px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium">247 projects in progress right now</span>
            </motion.div>

            {/* Logo */}
            <DynamicLogo />

            {/* Main heading - Updated for $50M platform */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                Professional Mixing From
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-pink-500">
                  $29 to $149+
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
                Find Your Engineer. Match Your Budget. Perfect Your Sound.
              </p>
            </div>

            {/* Social proof with trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>2,500+ Artists</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>150+ Engineers</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span>4.8★ from 1,200+ reviews</span>
              </div>
            </div>

            {/* Pricing Tier Cards */}
            <PricingTierCards />

            {/* CTA buttons - Updated */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button
                size="lg"
                className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity"
                onClick={handleGetStarted}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Get Matched in 60 Seconds
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-2"
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Play className="mr-2 h-5 w-5" />
                See Pricing Breakdown
              </Button>
            </motion.div>

            {/* Live Activity Ticker */}
            <LiveActivityTicker />

            {/* Trust Badges */}
            <TrustBadges />
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Hero;
