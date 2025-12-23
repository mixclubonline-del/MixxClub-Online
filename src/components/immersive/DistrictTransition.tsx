import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { 
  Building2, Music, Brain, BarChart3, Store, Radio, 
  Users, Home, Sparkles, Compass
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DistrictConfig {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgGradient: string;
}

const districtConfigs: Record<string, DistrictConfig> = {
  '/city/tower': { 
    name: 'MixxTech Tower', 
    icon: Building2, 
    color: 'text-primary',
    bgGradient: 'from-primary/20 via-transparent to-accent-blue/20'
  },
  '/hybrid-daw': { 
    name: 'RSD Chamber', 
    icon: Sparkles, 
    color: 'text-orange-500',
    bgGradient: 'from-orange-500/20 via-transparent to-red-500/20'
  },
  '/upload': { 
    name: 'Creator Hub', 
    icon: Music, 
    color: 'text-purple-500',
    bgGradient: 'from-purple-500/20 via-transparent to-pink-500/20'
  },
  '/prime-beat-forge': { 
    name: 'Neural Engine', 
    icon: Brain, 
    color: 'text-cyan-500',
    bgGradient: 'from-cyan-500/20 via-transparent to-blue-500/20'
  },
  '/community': { 
    name: 'The Arena', 
    icon: Users, 
    color: 'text-red-500',
    bgGradient: 'from-red-500/20 via-transparent to-pink-500/20'
  },
  '/marketplace': { 
    name: 'Commerce District', 
    icon: Store, 
    color: 'text-yellow-500',
    bgGradient: 'from-yellow-500/20 via-transparent to-orange-500/20'
  },
  '/dashboard': { 
    name: 'Data Realm', 
    icon: BarChart3, 
    color: 'text-green-500',
    bgGradient: 'from-green-500/20 via-transparent to-emerald-500/20'
  },
  '/settings': { 
    name: 'Your Space', 
    icon: Home, 
    color: 'text-teal-500',
    bgGradient: 'from-teal-500/20 via-transparent to-cyan-500/20'
  },
};

// Find matching district from path
const getDistrictConfig = (path: string): DistrictConfig | null => {
  // Exact match first
  if (districtConfigs[path]) return districtConfigs[path];
  
  // Check for partial matches
  for (const [key, config] of Object.entries(districtConfigs)) {
    if (path.startsWith(key)) return config;
  }
  
  return null;
};

export const DistrictTransition = () => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentDistrict, setCurrentDistrict] = useState<DistrictConfig | null>(null);
  const [prevPath, setPrevPath] = useState<string>('');

  useEffect(() => {
    const district = getDistrictConfig(location.pathname);
    
    // Only show transition for district-to-district navigation
    if (district && prevPath !== location.pathname && prevPath !== '') {
      setCurrentDistrict(district);
      setIsTransitioning(true);
      
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 800);
      
      return () => clearTimeout(timer);
    }
    
    setPrevPath(location.pathname);
  }, [location.pathname, prevPath]);

  return (
    <AnimatePresence>
      {isTransitioning && currentDistrict && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center"
        >
          {/* Background radial warp effect */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 3, opacity: [0, 1, 0] }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={cn(
              "absolute w-64 h-64 rounded-full bg-gradient-radial",
              currentDistrict.bgGradient
            )}
          />

          {/* Speed lines */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => {
              const angle = (i / 20) * 360;
              return (
                <motion.div
                  key={i}
                  initial={{ 
                    opacity: 0,
                    x: '50%',
                    y: '50%',
                    rotate: angle,
                    scaleX: 0
                  }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    scaleX: [0, 1, 0],
                  }}
                  transition={{ 
                    duration: 0.6,
                    delay: i * 0.02,
                    ease: "easeOut"
                  }}
                  className="absolute left-1/2 top-1/2 w-40 h-0.5 origin-left"
                  style={{
                    background: `linear-gradient(90deg, transparent, hsl(var(--primary)/0.6), transparent)`,
                    transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                  }}
                />
              );
            })}
          </div>

          {/* Center icon */}
          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: -180 }}
            animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 1], rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className={cn(
              "relative w-24 h-24 rounded-3xl flex items-center justify-center bg-background/80 backdrop-blur-sm border border-border/50",
            )}
          >
            <currentDistrict.icon className={cn("w-12 h-12", currentDistrict.color)} />
          </motion.div>

          {/* District name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="absolute bottom-1/3 text-center"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.8 }}
              className={cn("text-2xl font-bold", currentDistrict.color)}
            >
              {currentDistrict.name}
            </motion.p>
          </motion.div>

          {/* Particles flying outward */}
          {[...Array(12)].map((_, i) => {
            const angle = (i / 12) * 360;
            const distance = 200 + Math.random() * 100;
            const endX = Math.cos((angle * Math.PI) / 180) * distance;
            const endY = Math.sin((angle * Math.PI) / 180) * distance;
            
            return (
              <motion.div
                key={`particle-${i}`}
                initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                animate={{ 
                  x: endX, 
                  y: endY, 
                  scale: 0,
                  opacity: 0
                }}
                transition={{ 
                  duration: 0.6 + Math.random() * 0.2,
                  delay: 0.1,
                  ease: "easeOut"
                }}
                className={cn(
                  "absolute w-2 h-2 rounded-full",
                  i % 2 === 0 ? "bg-primary" : "bg-accent-blue"
                )}
              />
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
