import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Music, Headphones, ArrowRight, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function CityGates() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'intro' | 'role' | 'enter'>('intro');
  const [selectedRole, setSelectedRole] = useState<'artist' | 'engineer' | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (phase === 'intro') setPhase('role');
    }, 3000);
    return () => clearTimeout(timer);
  }, [phase]);

  const handleEnterCity = () => {
    setPhase('enter');
    setTimeout(() => {
      navigate('/city/tower');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-accent-blue/5" />
        
        {/* City Skyline Silhouette */}
        <div className="absolute bottom-0 left-0 right-0 h-64">
          <svg viewBox="0 0 1200 200" className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="cityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <path 
              d="M0,200 L0,150 L50,150 L50,100 L80,100 L80,80 L100,80 L100,120 L150,120 L150,60 L180,60 L180,90 L220,90 L220,40 L250,40 L250,100 L300,100 L300,70 L350,70 L350,110 L400,110 L400,50 L420,50 L420,30 L450,30 L450,80 L500,80 L500,120 L550,120 L550,60 L600,60 L600,100 L650,100 L650,40 L700,40 L700,90 L750,90 L750,70 L800,70 L800,110 L850,110 L850,50 L900,50 L900,100 L950,100 L950,80 L1000,80 L1000,120 L1050,120 L1050,60 L1100,60 L1100,100 L1150,100 L1150,130 L1200,130 L1200,200 Z" 
              fill="url(#cityGradient)"
            />
          </svg>
        </div>

        {/* Floating Particles */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/40"
            initial={{ 
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200), 
              y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 10 
            }}
            animate={{ 
              y: -10,
              opacity: [0.2, 0.6, 0.2]
            }}
            transition={{ 
              duration: 8 + Math.random() * 8,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5
            }}
          />
        ))}

        {/* Glowing Orbs */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/10 blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div 
          className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full bg-accent-blue/10 blur-3xl"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <AnimatePresence mode="wait">
          {phase === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="text-center"
            >
              <motion.div
                animate={{ 
                  boxShadow: ['0 0 20px hsl(var(--primary)/0.3)', '0 0 60px hsl(var(--primary)/0.5)', '0 0 20px hsl(var(--primary)/0.3)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-primary to-accent-blue flex items-center justify-center"
              >
                <Sparkles className="w-12 h-12 text-white" />
              </motion.div>
              <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-accent-blue to-primary bg-clip-text text-transparent">
                MIXCLUB CITY
              </h1>
              <p className="text-muted-foreground text-lg">Entering the future of music...</p>
            </motion.div>
          )}

          {phase === 'role' && (
            <motion.div
              key="role"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center max-w-2xl mx-auto"
            >
              <h2 className="text-2xl md:text-4xl font-bold mb-2">
                Welcome to <span className="bg-gradient-to-r from-primary to-accent-blue bg-clip-text text-transparent">MixClub City</span>
              </h2>
              <p className="text-muted-foreground mb-8">Choose your path through the city</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedRole('artist')}
                  className={cn(
                    "p-6 rounded-2xl border-2 transition-all text-left",
                    selectedRole === 'artist'
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50 bg-card/50"
                  )}
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                    <Music className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-1">Artist</h3>
                  <p className="text-sm text-muted-foreground">Create, collaborate, and grow your music career</p>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedRole('engineer')}
                  className={cn(
                    "p-6 rounded-2xl border-2 transition-all text-left",
                    selectedRole === 'engineer'
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50 bg-card/50"
                  )}
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mb-4">
                    <Headphones className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-1">Engineer</h3>
                  <p className="text-sm text-muted-foreground">Mix, master, and build your audio business</p>
                </motion.button>
              </div>

              <Button
                size="lg"
                onClick={handleEnterCity}
                disabled={!selectedRole}
                className="gap-2 px-8"
              >
                Enter the City
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}

          {phase === 'enter' && (
            <motion.div
              key="enter"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <motion.div
                animate={{ scale: [1, 50] }}
                transition={{ duration: 1.5, ease: "easeIn" }}
                className="w-4 h-4 mx-auto rounded-full bg-primary"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Audio Toggle */}
      <button
        onClick={() => setAudioPlaying(!audioPlaying)}
        className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-card/80 border border-primary/30 flex items-center justify-center hover:bg-primary/10 transition-colors"
      >
        <Volume2 className={cn("w-5 h-5", audioPlaying ? "text-primary" : "text-muted-foreground")} />
      </button>
    </div>
  );
}
