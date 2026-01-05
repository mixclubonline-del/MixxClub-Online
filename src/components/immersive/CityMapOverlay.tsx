import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Music, Brain, BarChart3, Store, Radio, 
  Users, Home, Sparkles, Map, X, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface District {
  id: string;
  name: string;
  description: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  position: { x: number; y: number };
  size: 'sm' | 'md' | 'lg';
  highlight?: boolean;
}

const districts: District[] = [
  { 
    id: 'tower', 
    name: 'MixxTech Tower', 
    description: 'Central hub - Your command center',
    path: '/city/tower', 
    icon: Building2, 
    color: 'from-primary to-accent-blue',
    position: { x: 50, y: 40 },
    size: 'lg'
  },
  { 
    id: 'studio', 
    name: 'RSD Chamber', 
    description: 'AI beat generation & mixing tools',
    path: '/hybrid-daw', 
    icon: Sparkles, 
    color: 'from-orange-500 to-red-500',
    position: { x: 25, y: 30 },
    size: 'md',
    highlight: true
  },
  { 
    id: 'creator', 
    name: 'Creator Hub', 
    description: 'Upload & manage your music',
    path: '/upload', 
    icon: Music, 
    color: 'from-purple-500 to-pink-500',
    position: { x: 75, y: 25 },
    size: 'md'
  },
  { 
    id: 'neural', 
    name: 'Neural Engine', 
    description: 'Prime 4.0 AI assistant',
    path: '/prime-beat-forge', 
    icon: Brain, 
    color: 'from-cyan-500 to-blue-500',
    position: { x: 20, y: 55 },
    size: 'md'
  },
  { 
    id: 'arena', 
    name: 'The Arena', 
    description: 'Battles, competitions & glory',
    path: '/community?tab=arena', 
    icon: Users, 
    color: 'from-red-500 to-pink-500',
    position: { x: 80, y: 50 },
    size: 'md'
  },
  { 
    id: 'commerce', 
    name: 'Commerce District', 
    description: 'Marketplace & revenue streams',
    path: '/marketplace', 
    icon: Store, 
    color: 'from-yellow-500 to-orange-500',
    position: { x: 35, y: 70 },
    size: 'md'
  },
  { 
    id: 'data', 
    name: 'Data Realm', 
    description: 'Analytics & insights',
    path: '/dashboard', 
    icon: BarChart3, 
    color: 'from-green-500 to-emerald-500',
    position: { x: 65, y: 65 },
    size: 'md'
  },
  { 
    id: 'broadcast', 
    name: 'Broadcast Tower', 
    description: 'Distribution & releases',
    path: '/services/distribution', 
    icon: Radio, 
    color: 'from-indigo-500 to-purple-500',
    position: { x: 50, y: 80 },
    size: 'sm'
  },
];

interface CityMapOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CityMapOverlay = ({ isOpen, onClose }: CityMapOverlayProps) => {
  const navigate = useNavigate();
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleNavigate = (path: string) => {
    onClose();
    navigate(path);
  };

  const getSizeClasses = (size: 'sm' | 'md' | 'lg') => {
    switch (size) {
      case 'lg': return 'w-20 h-20';
      case 'md': return 'w-14 h-14';
      case 'sm': return 'w-10 h-10';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[75] flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="MixClub City Map"
        >
          {/* Backdrop */}
          <motion.div 
            className="absolute inset-0 bg-background/90 backdrop-blur-xl"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Grid pattern */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
                               linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
              backgroundSize: '50px 50px'
            }}
          />

          {/* Map container */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="relative w-full h-full max-w-5xl max-h-[80vh] mx-4"
          >
            {/* Header */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
              <Map className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent-blue bg-clip-text text-transparent">
                MixClub City
              </h2>
            </div>

            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-4 right-4 z-20"
            >
              <X className="w-5 h-5" />
            </Button>

            {/* Connection lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
                  <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              {/* Lines connecting tower to other districts */}
              {districts.filter(d => d.id !== 'tower').map(district => (
                <motion.line
                  key={`line-${district.id}`}
                  x1="50%"
                  y1="40%"
                  x2={`${district.position.x}%`}
                  y2={`${district.position.y}%`}
                  stroke="url(#lineGradient)"
                  strokeWidth="1"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              ))}
            </svg>

            {/* Districts */}
            {districts.map((district, index) => (
              <motion.button
                key={district.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.05, type: 'spring' }}
                onClick={() => handleNavigate(district.path)}
                onMouseEnter={() => setHoveredDistrict(district.id)}
                onMouseLeave={() => setHoveredDistrict(null)}
                className="absolute group"
                style={{
                  left: `${district.position.x}%`,
                  top: `${district.position.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                {/* Glow effect */}
                <motion.div
                  className={cn(
                    "absolute inset-0 rounded-2xl bg-gradient-to-br opacity-50 blur-xl",
                    district.color
                  )}
                  animate={{
                    scale: hoveredDistrict === district.id ? 1.5 : 1,
                    opacity: hoveredDistrict === district.id ? 0.8 : 0.3
                  }}
                />

                {/* Icon container */}
                <motion.div
                  className={cn(
                    "relative rounded-2xl flex items-center justify-center bg-gradient-to-br transition-transform",
                    getSizeClasses(district.size),
                    district.color,
                    district.highlight && "ring-2 ring-orange-500/50 ring-offset-2 ring-offset-background"
                  )}
                  whileHover={{ scale: 1.15 }}
                  animate={{
                    boxShadow: district.highlight 
                      ? ['0 0 20px hsl(25 95% 53% / 0.3)', '0 0 40px hsl(25 95% 53% / 0.5)', '0 0 20px hsl(25 95% 53% / 0.3)']
                      : undefined
                  }}
                  transition={{ boxShadow: { duration: 2, repeat: Infinity } }}
                >
                  <district.icon className={cn(
                    "text-white",
                    district.size === 'lg' ? 'w-10 h-10' : district.size === 'md' ? 'w-6 h-6' : 'w-4 h-4'
                  )} />

                  {district.highlight && (
                    <div className="absolute -top-1 -right-1">
                      <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    </div>
                  )}
                </motion.div>

                {/* Label */}
                <motion.div
                  className={cn(
                    "absolute left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap text-center transition-opacity",
                    hoveredDistrict === district.id ? "opacity-100" : "opacity-70"
                  )}
                >
                  <p className="text-sm font-semibold text-foreground">{district.name}</p>
                  <AnimatePresence>
                    {hoveredDistrict === district.id && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs text-muted-foreground max-w-[150px]"
                      >
                        {district.description}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.button>
            ))}

            {/* Legend */}
            <div className="absolute bottom-4 left-4 flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-orange-500 to-red-500" />
                <span>Featured</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-primary to-accent-blue" />
                <span>Hub</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
