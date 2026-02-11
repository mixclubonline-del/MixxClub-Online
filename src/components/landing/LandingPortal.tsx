import { ReactNode, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface LandingPortalProps {
  children: ReactNode;
  backgroundImage: string;
  variant: 'artist' | 'engineer' | 'producer' | 'fan';
}

const variantGradient: Record<string, string> = {
  artist: 'bg-gradient-to-r from-primary/20 via-transparent to-primary/20',
  engineer: 'bg-gradient-to-r from-secondary/20 via-transparent to-secondary/20',
  producer: 'bg-gradient-to-r from-amber-500/20 via-transparent to-amber-500/20',
  fan: 'bg-gradient-to-r from-rose-500/20 via-transparent to-rose-500/20',
};

const variantParticle: Record<string, string> = {
  artist: 'bg-primary/40',
  engineer: 'bg-secondary/40',
  producer: 'bg-amber-500/40',
  fan: 'bg-rose-500/40',
};

export const LandingPortal = ({ children, backgroundImage, variant }: LandingPortalProps) => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const parallaxOffset = scrollY * 0.3;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Fixed Background with Parallax */}
      <div className="fixed inset-0 z-0">
        <motion.div
          className="absolute inset-0"
          style={{ y: -parallaxOffset }}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        >
          <img
            src={backgroundImage}
            alt=""
            className="w-full h-full object-cover"
          />
          {/* Gradient overlays for content readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
          <div className={`absolute inset-0 ${variantGradient[variant] || variantGradient.artist}`} />
        </motion.div>

        {/* Ambient Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-1 h-1 rounded-full ${variantParticle[variant] || variantParticle.artist}`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-20, -100, -20],
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>

      {/* Content Layer */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
