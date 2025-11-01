import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  timestamp: number;
}

export const CursorTrail = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isDesktop, setIsDesktop] = useState(true);
  const particleIdRef = useRef(0);
  const lastSpawnTime = useRef(0);
  
  useEffect(() => {
    // Check if desktop
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    
    if (!isDesktop) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      // Throttle to 60fps
      if (now - lastSpawnTime.current < 16) return;
      lastSpawnTime.current = now;
      
      const newParticle: Particle = {
        id: particleIdRef.current++,
        x: e.clientX,
        y: e.clientY,
        timestamp: now
      };
      
      setParticles(prev => [...prev.slice(-20), newParticle]);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    // Clean up old particles
    const interval = setInterval(() => {
      const now = Date.now();
      setParticles(prev => prev.filter(p => now - p.timestamp < 500));
    }, 100);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', checkDesktop);
      clearInterval(interval);
    };
  }, [isDesktop]);
  
  if (!isDesktop) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ 
              opacity: 0.8,
              scale: 1,
              x: particle.x - 4,
              y: particle.y - 4
            }}
            animate={{ 
              opacity: 0,
              scale: 0.5,
              x: particle.x - 4,
              y: particle.y - 4
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: 'linear-gradient(135deg, hsl(15 95% 58%), hsl(185 90% 52%))',
              boxShadow: '0 0 8px hsl(15 95% 58% / 0.8)'
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
