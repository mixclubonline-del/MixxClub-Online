import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Building2, Music, Brain, BarChart3, Store, Radio, 
  Users, Home, Sparkles, Compass, X, Settings, LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface District {
  id: string;
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  angle: number;
}

const districts: District[] = [
  { id: 'tower', name: 'Tower', path: '/city/tower', icon: Building2, color: 'from-primary to-accent-blue', angle: 0 },
  { id: 'studio', name: 'RSD', path: '/hybrid-daw', icon: Sparkles, color: 'from-orange-500 to-red-500', angle: 45 },
  { id: 'creator', name: 'Create', path: '/upload', icon: Music, color: 'from-purple-500 to-pink-500', angle: 90 },
  { id: 'neural', name: 'Prime', path: '/prime-beat-forge', icon: Brain, color: 'from-cyan-500 to-blue-500', angle: 135 },
  { id: 'arena', name: 'Arena', path: '/community?tab=arena', icon: Users, color: 'from-red-500 to-pink-500', angle: 180 },
  { id: 'commerce', name: 'Market', path: '/marketplace', icon: Store, color: 'from-yellow-500 to-orange-500', angle: 225 },
  { id: 'data', name: 'Stats', path: '/dashboard', icon: BarChart3, color: 'from-green-500 to-emerald-500', angle: 270 },
  { id: 'profile', name: 'Profile', path: '/settings', icon: Home, color: 'from-teal-500 to-cyan-500', angle: 315 },
];

export const RadialNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleNavigate = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  const radius = 140; // Distance from center to icons

  return (
    <div ref={containerRef} className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/60 backdrop-blur-md -z-10"
              onClick={() => setIsOpen(false)}
            />

            {/* Radial menu items */}
            {districts.map((district, index) => {
              const angleRad = (district.angle - 90) * (Math.PI / 180);
              const x = Math.cos(angleRad) * radius;
              const y = Math.sin(angleRad) * radius;

              return (
                <motion.button
                  key={district.id}
                  initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                  animate={{ 
                    opacity: 1, 
                    x: x, 
                    y: y, 
                    scale: 1,
                    transition: { delay: index * 0.05, type: 'spring', stiffness: 300, damping: 20 }
                  }}
                  exit={{ 
                    opacity: 0, 
                    x: 0, 
                    y: 0, 
                    scale: 0,
                    transition: { delay: (districts.length - index) * 0.02 }
                  }}
                  onClick={() => handleNavigate(district.path)}
                  onMouseEnter={() => setHoveredDistrict(district.id)}
                  onMouseLeave={() => setHoveredDistrict(null)}
                  className={cn(
                    "absolute w-14 h-14 rounded-2xl flex items-center justify-center transition-all",
                    "bg-gradient-to-br shadow-lg",
                    district.color,
                    hoveredDistrict === district.id ? "scale-110 shadow-xl" : ""
                  )}
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                  }}
                >
                  <district.icon className="w-6 h-6 text-white" />
                  
                  {/* Label on hover */}
                  <AnimatePresence>
                    {hoveredDistrict === district.id && (
                      <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute -bottom-8 whitespace-nowrap text-xs font-medium text-foreground bg-background/90 px-2 py-1 rounded-md border border-border/50"
                      >
                        {district.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}

            {/* Settings and Logout - inner ring */}
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1, transition: { delay: 0.3 } }}
              exit={{ opacity: 0, scale: 0 }}
              onClick={() => handleNavigate('/settings')}
              className="absolute w-10 h-10 rounded-xl bg-muted/80 flex items-center justify-center hover:bg-muted transition-colors"
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%) translate(-50px, 0)',
              }}
            >
              <Settings className="w-5 h-5 text-muted-foreground" />
            </motion.button>

            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1, transition: { delay: 0.35 } }}
              exit={{ opacity: 0, scale: 0 }}
              onClick={() => signOut()}
              className="absolute w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center hover:bg-destructive/30 transition-colors"
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%) translate(50px, 0)',
              }}
            >
              <LogOut className="w-5 h-5 text-destructive" />
            </motion.button>
          </>
        )}
      </AnimatePresence>

      {/* Main orb button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: isOpen 
            ? '0 0 30px hsl(var(--primary)/0.5)' 
            : ['0 0 20px hsl(var(--primary)/0.3)', '0 0 40px hsl(var(--primary)/0.4)', '0 0 20px hsl(var(--primary)/0.3)'],
        }}
        transition={{ 
          boxShadow: { duration: 2, repeat: isOpen ? 0 : Infinity }
        }}
        className={cn(
          "relative w-16 h-16 rounded-full flex items-center justify-center transition-all z-10",
          "bg-gradient-to-br from-primary via-accent-blue to-primary",
          "shadow-lg shadow-primary/30"
        )}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="w-7 h-7 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="compass"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <Compass className="w-7 h-7 text-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Orbiting particles when closed */}
        {!isOpen && (
          <>
            {[0, 120, 240].map((angle, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-white/60"
                animate={{
                  rotate: [angle, angle + 360],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  transformOrigin: '0 0',
                  left: '50%',
                  top: '50%',
                }}
              >
                <div 
                  className="w-2 h-2 rounded-full bg-white/60"
                  style={{ transform: 'translate(28px, -4px)' }}
                />
              </motion.div>
            ))}
          </>
        )}
      </motion.button>
    </div>
  );
};
