import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { VisualHotspot } from '@/components/ui/VisualHotspot';
import { useCityAssets } from '@/hooks/useCityAssets';
import cityGatesStatic from '@/assets/city-gates.jpg';

export default function CityGates() {
  const navigate = useNavigate();
  const [entering, setEntering] = useState(false);
  const [selectedPath, setSelectedPath] = useState<'artist' | 'engineer' | null>(null);
  
  // Dynamic asset with static fallback
  const { gates: dynamicGates, isLoading } = useCityAssets();
  const cityGatesImage = dynamicGates || cityGatesStatic;

  const handlePathSelect = (role: 'artist' | 'engineer') => {
    setSelectedPath(role);
    setEntering(true);
    
    // Store role preference
    localStorage.setItem('mixclub_role', role);
    
    // Navigate after zoom animation
    setTimeout(() => {
      navigate('/city/tower');
    }, 1200);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Full-screen gate portal background */}
      <motion.div 
        className="absolute inset-0"
        animate={entering ? { scale: 2.5, opacity: 0 } : { scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: 'easeIn' }}
      >
        <img 
          src={cityGatesImage} 
          alt="City Gates"
          className="w-full h-full object-cover"
        />
        
        {/* Ambient overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-background/30" />
      </motion.div>

      {/* Floating ambient particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              background: i % 2 === 0 
                ? 'hsl(280 65% 60% / 0.6)' // Purple-pink
                : 'hsl(190 95% 50% / 0.6)', // Cyan
            }}
            initial={{ y: '100vh', opacity: 0 }}
            animate={{ 
              y: '-10vh',
              opacity: [0, 0.8, 0],
            }}
            transition={{ 
              duration: 8 + Math.random() * 6,
              repeat: Infinity,
              ease: 'linear',
              delay: Math.random() * 8,
            }}
          />
        ))}
      </div>

      {/* Path Hotspots - positioned on the diverging paths */}
      <AnimatePresence>
        {!entering && (
          <>
            {/* Artist Path - Left side, purple-pink glow */}
            <VisualHotspot
              position={{ x: 35, y: 65 }}
              state="active"
              size="lg"
              glowColor="280 65% 60%"
              label="Artist Path"
              description="Create, collaborate, and grow your music career"
              onClick={() => handlePathSelect('artist')}
            />

            {/* Engineer Path - Right side, cyan-blue glow */}
            <VisualHotspot
              position={{ x: 65, y: 65 }}
              state="active"
              size="lg"
              glowColor="190 95% 50%"
              label="Engineer Path"
              description="Mix, master, and build your audio business"
              onClick={() => handlePathSelect('engineer')}
            />
          </>
        )}
      </AnimatePresence>

      {/* Entry zoom effect - white flash */}
      <AnimatePresence>
        {entering && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="absolute inset-0 bg-white/20 backdrop-blur-sm z-20"
          />
        )}
      </AnimatePresence>

      {/* Subtle title - fades in after a moment */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: entering ? 0 : 1, y: entering ? -20 : 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="absolute bottom-12 left-0 right-0 text-center z-10"
      >
        <h1 className="text-2xl md:text-3xl font-bold tracking-wider text-white/90 drop-shadow-lg">
          MIXCLUB CITY
        </h1>
        <p className="text-sm text-white/60 mt-1">Choose your path</p>
      </motion.div>

      {/* Selected path indicator */}
      <AnimatePresence>
        {selectedPath && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30"
          >
            <motion.div
              animate={{ scale: [1, 1.5, 2.5], opacity: [1, 0.8, 0] }}
              transition={{ duration: 1 }}
              className="w-16 h-16 rounded-full"
              style={{
                background: selectedPath === 'artist' 
                  ? 'hsl(280 65% 60%)' 
                  : 'hsl(190 95% 50%)',
                boxShadow: selectedPath === 'artist'
                  ? '0 0 60px 20px hsl(280 65% 60% / 0.6)'
                  : '0 0 60px 20px hsl(190 95% 50% / 0.6)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
