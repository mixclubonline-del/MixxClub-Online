import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { 
  Building2, Music, Brain, BarChart3, Store, Radio, 
  Users, Home, Sparkles, Compass, X, Settings, LogOut, Lock
} from 'lucide-react';
import { useFlowNavigation } from '@/core/fabric/useFlow';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useDepthLayer } from '@/hooks/useDepthLayer';
import { usePulse } from '@/contexts/PulseContext';
import { DepthLayer } from '@/types/depth';
import { EnergyState } from '@/types/pulse';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface District {
  id: string;
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  angle: number;
  minDepth: DepthLayer;
  energy?: EnergyState;
}

// Depth layer order for comparison
const DEPTH_ORDER: DepthLayer[] = ['posted-up', 'in-the-room', 'on-the-mic', 'on-stage'];

const getDepthIndex = (layer: DepthLayer): number => DEPTH_ORDER.indexOf(layer);

const DEPTH_LABELS: Record<DepthLayer, string> = {
  'posted-up': 'Posted Up',
  'in-the-room': 'In the Room',
  'on-the-mic': 'On the Mic',
  'on-stage': 'On Stage',
};

const districts: District[] = [
  { 
    id: 'tower', 
    name: 'Tower', 
    path: '/city/tower', 
    icon: Building2, 
    color: 'from-primary to-accent-blue', 
    angle: 0,
    minDepth: 'posted-up',
    energy: 'DISCOVER',
  },
  { 
    id: 'studio', 
    name: 'RSD', 
    path: '/hybrid-daw', 
    icon: Sparkles, 
    color: 'from-orange-500 to-red-500', 
    angle: 45,
    minDepth: 'on-the-mic', // Requires depth to access studio
    energy: 'CREATE',
  },
  { 
    id: 'creator', 
    name: 'Create', 
    path: '/upload', 
    icon: Music, 
    color: 'from-purple-500 to-pink-500', 
    angle: 90,
    minDepth: 'in-the-room',
    energy: 'CREATE',
  },
  { 
    id: 'neural', 
    name: 'Prime', 
    path: '/prime-beat-forge', 
    icon: Brain, 
    color: 'from-cyan-500 to-blue-500', 
    angle: 135,
    minDepth: 'in-the-room',
    energy: 'CREATE',
  },
  { 
    id: 'arena', 
    name: 'Arena', 
    path: '/community?tab=arena', 
    icon: Users, 
    color: 'from-red-500 to-pink-500', 
    angle: 180,
    minDepth: 'in-the-room',
    energy: 'COLLABORATE',
  },
  { 
    id: 'commerce', 
    name: 'Market', 
    path: '/marketplace', 
    icon: Store, 
    color: 'from-yellow-500 to-orange-500', 
    angle: 225,
    minDepth: 'in-the-room',
    energy: 'EARN',
  },
  { 
    id: 'data', 
    name: 'Stats', 
    path: '/dashboard', 
    icon: BarChart3, 
    color: 'from-green-500 to-emerald-500', 
    angle: 270,
    minDepth: 'on-the-mic', // Business stats require depth
    energy: 'MANAGE',
  },
  { 
    id: 'profile', 
    name: 'Profile', 
    path: '/settings', 
    icon: Home, 
    color: 'from-teal-500 to-cyan-500', 
    angle: 315,
    minDepth: 'posted-up', // Always accessible
  },
];

export const RadialNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);
  const { navigateTo } = useFlowNavigation();
  const location = useLocation();
  const { signOut } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Get depth layer for gating
  const { currentLayer } = useDepthLayer();
  const currentDepthIndex = getDepthIndex(currentLayer);
  
  // Get current energy for highlighting
  const pulseContext = usePulse();
  const currentEnergy = pulseContext?.currentEnergy ?? 'DISCOVER';

  // Filter and categorize districts based on depth
  const { accessibleDistricts, lockedDistricts } = useMemo(() => {
    const accessible: District[] = [];
    const locked: District[] = [];
    
    districts.forEach(district => {
      const requiredIndex = getDepthIndex(district.minDepth);
      if (currentDepthIndex >= requiredIndex) {
        accessible.push(district);
      } else {
        locked.push(district);
      }
    });
    
    return { accessibleDistricts: accessible, lockedDistricts: locked };
  }, [currentDepthIndex]);

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

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleNavigate = (path: string) => {
    setIsOpen(false);
    navigateTo(path);
  };

  const radius = 140; // Distance from center to icons

  const renderDistrictButton = (district: District, index: number, isLocked: boolean) => {
    const angleRad = (district.angle - 90) * (Math.PI / 180);
    const x = Math.cos(angleRad) * radius;
    const y = Math.sin(angleRad) * radius;
    const isCurrentEnergy = district.energy === currentEnergy;

    const button = (
      <motion.button
        key={district.id}
        initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
        animate={{ 
          opacity: isLocked ? 0.4 : 1, 
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
        onClick={() => !isLocked && handleNavigate(district.path)}
        onMouseEnter={() => setHoveredDistrict(district.id)}
        onMouseLeave={() => setHoveredDistrict(null)}
        disabled={isLocked}
        className={cn(
          "absolute w-14 h-14 rounded-2xl flex items-center justify-center transition-all z-[70]",
          "bg-gradient-to-br shadow-lg",
          district.color,
          isLocked && "grayscale cursor-not-allowed",
          !isLocked && hoveredDistrict === district.id && "scale-110 shadow-xl",
          !isLocked && isCurrentEnergy && "ring-2 ring-white/50 ring-offset-2 ring-offset-background"
        )}
        style={{
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
        }}
      >
        {isLocked ? (
          <Lock className="w-5 h-5 text-white/70" />
        ) : (
          <district.icon className="w-6 h-6 text-white" />
        )}
        
        {/* Label on hover - show lock requirement for locked items */}
        <AnimatePresence>
          {hoveredDistrict === district.id && (
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={cn(
                "absolute -bottom-8 whitespace-nowrap text-xs font-medium px-2 py-1 rounded-md border",
                isLocked 
                  ? "text-muted-foreground bg-muted/90 border-border/50"
                  : "text-foreground bg-background/90 border-border/50"
              )}
            >
              {isLocked ? `Requires: ${DEPTH_LABELS[district.minDepth]}` : district.name}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    );

    // Wrap locked buttons in tooltip
    if (isLocked) {
      return (
        <Tooltip key={district.id}>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <p className="font-medium">{district.name}</p>
            <p className="text-xs text-muted-foreground">
              Unlock by reaching "{DEPTH_LABELS[district.minDepth]}" depth
            </p>
          </TooltipContent>
        </Tooltip>
      );
    }

    return button;
  };

  return (
    <div ref={containerRef} className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-60">
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop blur - covers entire screen */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/60 backdrop-blur-md z-[69]"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />

            {/* Radial menu items - accessible districts */}
            {accessibleDistricts.map((district, index) => 
              renderDistrictButton(district, index, false)
            )}
            
            {/* Radial menu items - locked districts (shown grayed) */}
            {lockedDistricts.map((district, index) => 
              renderDistrictButton(district, accessibleDistricts.length + index, true)
            )}

            {/* Settings and Logout - inner ring */}
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1, transition: { delay: 0.3 } }}
              exit={{ opacity: 0, scale: 0 }}
              onClick={() => handleNavigate('/settings')}
              className="absolute w-10 h-10 rounded-xl bg-muted/80 flex items-center justify-center hover:bg-muted transition-colors z-[70]"
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
              className="absolute w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center hover:bg-destructive/30 transition-colors z-[70]"
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
          "relative w-16 h-16 rounded-full flex items-center justify-center transition-all z-[71]",
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
