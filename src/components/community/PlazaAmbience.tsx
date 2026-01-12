import { motion } from 'framer-motion';
import { useCommunityStats } from '@/hooks/useCommunityStats';

export const PlazaAmbience = () => {
  const { data: stats } = useCommunityStats();
  const activeNow = stats?.activeNow || 0;
  
  // More particles when more users are active
  const particleCount = Math.min(20, 5 + Math.floor(activeNow / 10));
  
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Floating particles */}
      {[...Array(particleCount)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            background: i % 2 === 0 ? 'hsl(var(--primary))' : 'hsl(var(--accent-cyan))',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 50 - 25, 0],
            opacity: [0, 0.8, 0],
            scale: [0.5, 1.5, 0.5],
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            delay: i * 0.5,
            ease: 'easeInOut',
          }}
        />
      ))}
      
      {/* Activity pulse in center */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
        style={{
          background: 'radial-gradient(circle, hsl(var(--primary) / 0.1) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
};

export default PlazaAmbience;
