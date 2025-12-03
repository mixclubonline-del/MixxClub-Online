import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface ParticleStormProps {
  amplitude: number;
  bass: number;
  isPlaying: boolean;
  particleCount?: number;
  className?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  hue: number;
  delay: number;
}

export const ParticleStorm = ({ 
  amplitude, 
  bass,
  isPlaying,
  particleCount = 50,
  className = ''
}: ParticleStormProps) => {
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }, (_, i): Particle => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      speed: Math.random() * 3 + 2,
      hue: Math.random() * 60 + 260, // Purple to cyan range
      delay: Math.random() * 2
    }));
  }, [particleCount]);

  const speedMultiplier = isPlaying ? 1 + (amplitude / 255) * 2 : 0.5;

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            width: particle.size + (bass / 255) * 3,
            height: particle.size + (bass / 255) * 3,
            background: `radial-gradient(circle, hsl(${particle.hue} 100% 70%) 0%, transparent 70%)`,
            boxShadow: isPlaying ? `0 0 ${10 + amplitude / 20}px hsl(${particle.hue} 100% 60% / 0.5)` : 'none'
          }}
          initial={{ 
            y: `${particle.y}vh`,
            opacity: 0.3
          }}
          animate={{
            y: [null, '-10vh'],
            opacity: [0.3, isPlaying ? 0.8 : 0.4, 0],
            scale: isPlaying ? [1, 1 + (bass / 255) * 0.5, 1] : 1
          }}
          transition={{
            y: {
              duration: particle.speed / speedMultiplier,
              repeat: Infinity,
              ease: 'linear',
              delay: particle.delay
            },
            opacity: {
              duration: particle.speed / speedMultiplier,
              repeat: Infinity,
              ease: 'easeOut',
              delay: particle.delay
            },
            scale: {
              duration: 0.2,
              repeat: Infinity,
              repeatType: 'reverse'
            }
          }}
        />
      ))}

      {/* Extra burst particles on heavy bass */}
      {isPlaying && bass > 200 && [...Array(5)].map((_, i) => (
        <motion.div
          key={`burst-${i}-${Date.now()}`}
          className="absolute w-3 h-3 rounded-full bg-primary"
          style={{
            left: `${40 + Math.random() * 20}%`,
            top: '50%',
            boxShadow: '0 0 20px hsl(var(--primary))'
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{
            scale: [0, 2],
            opacity: [1, 0],
            x: (Math.random() - 0.5) * 200,
            y: (Math.random() - 0.5) * 200
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
};
