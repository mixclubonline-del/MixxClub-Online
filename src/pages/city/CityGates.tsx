import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GateCharacter, PathPreviewCard, GateActivityIndicator } from '@/components/city';
import cityGatesImage from '@/assets/city-gates.jpg';

export default function CityGates() {
  const navigate = useNavigate();
  const [entering, setEntering] = useState(false);
  const [selectedPath, setSelectedPath] = useState<'artist' | 'engineer' | null>(null);
  const [hoveredPath, setHoveredPath] = useState<'artist' | 'engineer' | null>(null);

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
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-background/40" />
      </motion.div>

      {/* Floating ambient particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(30)].map((_, i) => (
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

      {/* Title - positioned at top */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: entering ? 0 : 1, y: entering ? -40 : 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="absolute top-12 md:top-16 left-0 right-0 text-center z-10"
      >
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-wider text-white drop-shadow-lg">
          MIXCLUB CITY
        </h1>
        <p className="text-sm md:text-base text-white/70 mt-2">Choose your path</p>
      </motion.div>

      {/* Character Path Selection - Desktop: Side by side, Mobile: Stacked */}
      <AnimatePresence>
        {!entering && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 lg:gap-24 px-4">
              {/* Artist Path - Jax */}
              <div 
                className="relative"
                onMouseEnter={() => setHoveredPath('artist')}
                onMouseLeave={() => setHoveredPath(null)}
              >
                <GateCharacter
                  characterId="jax"
                  role="artist"
                  position="left"
                  onClick={() => handlePathSelect('artist')}
                  isEntering={entering}
                />
                
                {/* Path Preview Card - Desktop only */}
                <AnimatePresence>
                  {hoveredPath === 'artist' && (
                    <PathPreviewCard
                      role="artist"
                      isVisible={true}
                      className="hidden md:block left-full ml-8 top-1/2 -translate-y-1/2"
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* Engineer Path - Rell */}
              <div 
                className="relative"
                onMouseEnter={() => setHoveredPath('engineer')}
                onMouseLeave={() => setHoveredPath(null)}
              >
                <GateCharacter
                  characterId="rell"
                  role="engineer"
                  position="right"
                  onClick={() => handlePathSelect('engineer')}
                  isEntering={entering}
                />
                
                {/* Path Preview Card - Desktop only */}
                <AnimatePresence>
                  {hoveredPath === 'engineer' && (
                    <PathPreviewCard
                      role="engineer"
                      isVisible={true}
                      className="hidden md:block right-full mr-8 top-1/2 -translate-y-1/2"
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Activity Indicator - bottom center */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: entering ? 0 : 1 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="absolute bottom-8 md:bottom-12 left-0 right-0 flex justify-center z-10"
      >
        <GateActivityIndicator />
      </motion.div>

      {/* Entry zoom effect - role-colored flash */}
      <AnimatePresence>
        {entering && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="absolute inset-0 z-20"
            style={{
              background: selectedPath === 'artist'
                ? 'radial-gradient(circle at center, hsl(280 65% 60% / 0.3), transparent 70%)'
                : 'radial-gradient(circle at center, hsl(190 95% 50% / 0.3), transparent 70%)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Selected path indicator - expanding ring */}
      <AnimatePresence>
        {selectedPath && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
          >
            {/* Expanding rings */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
                style={{
                  borderColor: selectedPath === 'artist' 
                    ? 'hsl(280 65% 60%)' 
                    : 'hsl(190 95% 50%)',
                }}
                initial={{ width: 20, height: 20, opacity: 0.8 }}
                animate={{ 
                  width: 200 + i * 100, 
                  height: 200 + i * 100, 
                  opacity: 0 
                }}
                transition={{ 
                  duration: 1 + i * 0.2, 
                  delay: i * 0.15,
                  ease: 'easeOut' 
                }}
              />
            ))}
            
            {/* Central glow */}
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
