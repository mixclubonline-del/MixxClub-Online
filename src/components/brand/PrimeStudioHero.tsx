import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface PrimeStudioHeroProps {
  variant?: 'full' | 'compact';
  showOverlay?: boolean;
  className?: string;
}

export const PrimeStudioHero = ({ 
  variant = 'full', 
  showOverlay = true,
  className = '' 
}: PrimeStudioHeroProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  
  const primeImages = [
    '/assets/prime-pointing.jpg',
    '/assets/studio-landscape.png',
    '/assets/studio-landscape-alt.jpg',
  ];

  useEffect(() => {
    if (variant === 'full') {
      const interval = setInterval(() => {
        setCurrentImage((prev) => (prev + 1) % primeImages.length);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [variant, primeImages.length]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Background Image with Ken Burns Effect */}
      <motion.div
        className="absolute inset-0"
        key={currentImage}
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      >
        <img
          src={primeImages[currentImage]}
          alt="Prime's Studio"
          className="w-full h-full object-cover"
          onLoad={() => setImageLoaded(true)}
          style={{
            filter: 'brightness(0.7) saturate(1.2)',
          }}
        />
      </motion.div>

      {/* Animated Gradient Overlay */}
      {showOverlay && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80" />
          
          {/* Animated Glow Effects */}
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                'radial-gradient(circle at 30% 50%, hsl(var(--primary) / 0.2) 0%, transparent 50%)',
                'radial-gradient(circle at 70% 50%, hsl(var(--primary) / 0.2) 0%, transparent 50%)',
                'radial-gradient(circle at 30% 50%, hsl(var(--primary) / 0.2) 0%, transparent 50%)',
              ],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      )}

      {/* Scanlines Effect */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
        }}
      />

      {/* Vignette */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
        }}
      />

      {/* Loading State */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-background animate-pulse" />
      )}
    </div>
  );
};

export default PrimeStudioHero;
