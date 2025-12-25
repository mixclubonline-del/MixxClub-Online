import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface AudioReactiveParticlesProps {
  amplitude: number;
  bass: number;
  high: number;
  isPlaying: boolean;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

export function AudioReactiveParticles({ 
  amplitude, 
  bass, 
  high, 
  isPlaying 
}: AudioReactiveParticlesProps) {
  const particles = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 4,
      delay: Math.random() * 5,
      duration: 5 + Math.random() * 5,
    }));
  }, []);

  // Audio-reactive modifiers
  const speedMultiplier = isPlaying ? 0.5 + (amplitude / 255) * 0.5 : 1;
  const sizeMultiplier = isPlaying ? 1 + (bass / 255) * 0.8 : 1;
  const opacityBoost = isPlaying ? (high / 255) * 0.3 : 0;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size * sizeMultiplier,
            height: particle.size * sizeMultiplier,
            background: isPlaying 
              ? `hsl(${280 + (particle.id / particles.length) * 60} 80% 60% / ${0.3 + opacityBoost})`
              : 'hsl(var(--primary) / 0.3)',
            boxShadow: isPlaying && bass > 150 
              ? `0 0 ${10 + (bass / 255) * 10}px hsl(var(--primary) / 0.5)` 
              : 'none',
          }}
          animate={{
            y: [0, -30 - (amplitude / 255) * 20, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.2 + opacityBoost, 0.5 + opacityBoost, 0.2 + opacityBoost],
            scale: isPlaying && bass > 180 ? [1, 1.3, 1] : [1, 1, 1],
          }}
          transition={{
            duration: particle.duration * speedMultiplier,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
      
      {/* Bass burst particles */}
      {isPlaying && bass > 200 && (
        <>
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={`burst-${i}`}
              className="absolute w-2 h-2 rounded-full bg-primary/60"
              style={{
                left: '50%',
                top: '50%',
              }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{
                scale: [0, 3],
                opacity: [1, 0],
                x: Math.cos((i / 5) * Math.PI * 2) * 200,
                y: Math.sin((i / 5) * Math.PI * 2) * 200,
              }}
              transition={{
                duration: 0.8,
                ease: "easeOut",
              }}
            />
          ))}
        </>
      )}
    </div>
  );
}
