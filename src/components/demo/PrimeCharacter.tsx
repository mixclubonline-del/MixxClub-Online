import { motion } from 'framer-motion';
import { useMemo } from 'react';
import primeLaunchHero from '@/assets/prime-launch-hero.png';

interface PrimeCharacterProps {
  bass: number;
  amplitude: number;
  isPlaying: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  imageUrl?: string; // Optional custom image URL for phase-specific images
}

const sizeMap = {
  sm: { container: 'w-24 h-24', glow: 20 },
  md: { container: 'w-40 h-40', glow: 30 },
  lg: { container: 'w-56 h-56', glow: 40 },
  xl: { container: 'w-80 h-80', glow: 60 }
};

export const PrimeCharacter = ({ 
  bass, 
  amplitude, 
  isPlaying,
  size = 'lg',
  className = '',
  imageUrl
}: PrimeCharacterProps) => {
  const imageSrc = imageUrl || primeLaunchHero;
  const { container, glow } = sizeMap[size];
  
  // Audio-reactive values
  const scale = useMemo(() => 1 + (bass / 255) * 0.15, [bass]);
  const glowIntensity = useMemo(() => glow + (amplitude / 255) * glow, [amplitude, glow]);
  const hueShift = useMemo(() => (amplitude / 255) * 30, [amplitude]);

  return (
    <motion.div
      className={`relative ${container} ${className}`}
      animate={{
        scale: isPlaying ? scale : 1,
        y: isPlaying ? [0, -5, 0] : 0
      }}
      transition={{
        scale: { duration: 0.1 },
        y: { duration: 0.5, repeat: Infinity, ease: 'easeInOut' }
      }}
    >
      {/* Outer Glow Ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, hsl(${280 + hueShift} 100% 60% / 0.4) 0%, transparent 70%)`,
          filter: `blur(${glowIntensity}px)`
        }}
        animate={{
          scale: isPlaying ? [1, 1.3, 1] : 1,
          opacity: isPlaying ? [0.5, 0.8, 0.5] : 0.3
        }}
        transition={{ duration: 0.3, repeat: Infinity }}
      />

      {/* Inner Glow */}
      <motion.div
        className="absolute inset-4 rounded-full"
        style={{
          background: `radial-gradient(circle, hsl(var(--primary) / 0.6) 0%, transparent 60%)`,
          filter: `blur(${glowIntensity / 2}px)`
        }}
      />

      {/* Bass Ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-4 border-primary/30"
        animate={{
          scale: isPlaying ? 1 + (bass / 255) * 0.3 : 1,
          opacity: isPlaying ? [0.5, 0.2, 0.5] : 0.2
        }}
        transition={{ duration: 0.15 }}
      />

      {/* Character Image */}
      <motion.div
        className="relative w-full h-full rounded-full overflow-hidden"
        style={{
          boxShadow: `
            0 0 ${glowIntensity}px hsl(var(--primary) / 0.5),
            0 0 ${glowIntensity * 2}px hsl(280 100% 60% / 0.3),
            inset 0 0 30px hsl(var(--primary) / 0.2)
          `
        }}
      >
        <img
          src={imageSrc}
          alt="Prime - MixClub Head Engineer"
          className="w-full h-full object-cover"
          style={{
            filter: isPlaying 
              ? `saturate(${1 + amplitude / 500}) brightness(${1 + amplitude / 1000}) hue-rotate(${hueShift}deg)`
              : 'none'
          }}
        />

        {/* Chromatic Aberration Effect on Beat */}
        {isPlaying && bass > 150 && (
          <>
            <motion.img
              src={imageSrc}
              alt=""
              className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-30"
              style={{ 
                filter: 'hue-rotate(90deg)',
                transform: `translateX(${(bass - 150) / 30}px)`
              }}
            />
            <motion.img
              src={imageSrc}
              alt=""
              className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-30"
              style={{ 
                filter: 'hue-rotate(-90deg)',
                transform: `translateX(-${(bass - 150) / 30}px)`
              }}
            />
          </>
        )}
      </motion.div>

      {/* Pulse Ring on Beat */}
      {isPlaying && bass > 180 && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-primary"
          initial={{ scale: 1, opacity: 1 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.5 }}
          key={Math.random()}
        />
      )}

      {/* Floating Particles around Prime */}
      {isPlaying && [...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-primary"
          style={{
            left: '50%',
            top: '50%',
            boxShadow: '0 0 10px hsl(var(--primary))'
          }}
          animate={{
            x: Math.cos((i / 6) * Math.PI * 2 + Date.now() / 1000) * (60 + amplitude / 4),
            y: Math.sin((i / 6) * Math.PI * 2 + Date.now() / 1000) * (60 + amplitude / 4),
            scale: [0.5, 1, 0.5],
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.2
          }}
        />
      ))}
    </motion.div>
  );
};
