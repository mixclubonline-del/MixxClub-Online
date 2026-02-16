import { ReactNode, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Map } from 'lucide-react';
import { RadialNavigation } from './RadialNavigation';
import { CityMapOverlay } from './CityMapOverlay';
import { DistrictTransition } from './DistrictTransition';
import { useAuth } from '@/hooks/useAuth';
import { usePulse } from '@/contexts/PulseContext';
import { EnergyState } from '@/types/pulse';
import { cn } from '@/lib/utils';

interface ImmersiveAppShellProps {
  children: ReactNode;
}

// Routes that should use the immersive shell (no traditional nav)
const immersiveRoutes = [
  '/city',
  '/hybrid-daw',
  '/collaborate',
  '/upload',
  '/prime-beat-forge',
  '/brand-forge',
  '/marketplace',
  '/community',
  '/artist-crm',
  '/engineer-crm',
  '/producer-crm',
  '/fan-hub',
  '/settings',
  '/sessions',
];

// Routes that should not show any navigation (full immersive)
const fullImmersiveRoutes = [
  '/',
  '/intro',
  '/auth',
  '/onboarding',
  '/city/gates',
];

// Energy-aware ambient configuration
interface EnergyAmbient {
  primaryGlow: string;
  secondaryGlow: string;
  gridOpacity: number;
  animationDuration: number;
  glowIntensity: number;
}

const ENERGY_AMBIENTS: Record<EnergyState, EnergyAmbient> = {
  DISCOVER: {
    primaryGlow: 'hsl(var(--primary))',
    secondaryGlow: 'hsl(var(--accent-blue))',
    gridOpacity: 0.02,
    animationDuration: 8,
    glowIntensity: 0.2,
  },
  CREATE: {
    primaryGlow: 'hsl(280 70% 50%)', // Purple focus
    secondaryGlow: 'hsl(320 70% 50%)', // Pink accent
    gridOpacity: 0.01, // Minimal distraction
    animationDuration: 12, // Slower, calmer
    glowIntensity: 0.1, // Subdued
  },
  COLLABORATE: {
    primaryGlow: 'hsl(25 90% 55%)', // Warm amber
    secondaryGlow: 'hsl(35 90% 60%)', // Gold
    gridOpacity: 0.02,
    animationDuration: 6, // Slightly energetic
    glowIntensity: 0.25, // Social warmth
  },
  MANAGE: {
    primaryGlow: 'hsl(160 50% 40%)', // Muted teal
    secondaryGlow: 'hsl(180 40% 35%)', // Calm cyan
    gridOpacity: 0.015, // Clean
    animationDuration: 15, // Very slow, stable
    glowIntensity: 0.08, // Minimal
  },
  EARN: {
    primaryGlow: 'hsl(45 90% 50%)', // Gold
    secondaryGlow: 'hsl(35 85% 45%)', // Amber
    gridOpacity: 0.02,
    animationDuration: 7,
    glowIntensity: 0.22, // Prosperity glow
  },
  CELEBRATE: {
    primaryGlow: 'hsl(330 80% 60%)', // Party pink
    secondaryGlow: 'hsl(280 80% 65%)', // Vibrant purple
    gridOpacity: 0.025,
    animationDuration: 4, // Fast, energetic
    glowIntensity: 0.35, // High energy
  },
};

export const ImmersiveAppShell = ({ children }: ImmersiveAppShellProps) => {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  
  // Get current energy state for ambient adaptation
  const pulseContext = usePulse();
  const currentEnergy = pulseContext?.currentEnergy ?? 'DISCOVER';
  const isFocusMode = pulseContext?.isFocusMode ?? false;
  
  // Get ambient config for current energy
  const ambient = useMemo(() => ENERGY_AMBIENTS[currentEnergy], [currentEnergy]);

  // Check if current route should use immersive mode
  const isImmersiveRoute = immersiveRoutes.some(route => 
    location.pathname.startsWith(route)
  );

  // Check if we should hide all navigation
  const isFullImmersive = fullImmersiveRoutes.some(route => 
    location.pathname === route || location.pathname.startsWith(route)
  );

  // Don't show immersive nav for unauthenticated users or full immersive routes
  if (!user || isFullImmersive) {
    return (
      <>
        <DistrictTransition />
        {children}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Ambient background - energy-aware */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div 
          className="absolute inset-0"
          animate={{
            background: `linear-gradient(to bottom, ${ambient.primaryGlow}05, transparent, ${ambient.secondaryGlow}05)`,
          }}
          transition={{ duration: 0.5 }}
        />
        
        {/* Subtle grid pattern - reduced in focus modes */}
        <div 
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            backgroundImage: `linear-gradient(${ambient.primaryGlow} 1px, transparent 1px),
                             linear-gradient(90deg, ${ambient.primaryGlow} 1px, transparent 1px)`,
            backgroundSize: '100px 100px',
            opacity: isFocusMode ? ambient.gridOpacity * 0.5 : ambient.gridOpacity,
          }}
        />

        {/* Corner glow effects - energy-aware colors and intensity */}
        <motion.div 
          className="absolute -top-20 -left-20 w-96 h-96 rounded-full blur-3xl"
          animate={{ 
            opacity: [ambient.glowIntensity * 0.5, ambient.glowIntensity, ambient.glowIntensity * 0.5],
            scale: isFocusMode ? [1, 1.02, 1] : [1, 1.1, 1],
            backgroundColor: ambient.primaryGlow,
          }}
          transition={{ 
            duration: ambient.animationDuration, 
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div 
          className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full blur-3xl"
          animate={{ 
            opacity: [ambient.glowIntensity * 0.5, ambient.glowIntensity * 0.75, ambient.glowIntensity * 0.5],
            scale: isFocusMode ? [1, 1.01, 1] : [1, 1.05, 1],
            backgroundColor: ambient.secondaryGlow,
          }}
          transition={{ 
            duration: ambient.animationDuration * 1.25, 
            repeat: Infinity, 
            delay: 2,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* District transition effect */}
      <DistrictTransition />

      {/* Main content */}
      <main className="relative z-10">
        {children}
      </main>

      {/* Quick map button - top left, positioned after header */}
      {isImmersiveRoute && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => setIsMapOpen(true)}
          className={cn(
            "fixed top-20 left-4 z-30 flex items-center gap-2 px-3 py-2 rounded-xl",
            "bg-card/80 backdrop-blur-sm border border-border/50",
            "hover:bg-primary/10 hover:border-primary/50 transition-all",
            "shadow-lg"
          )}
        >
          <Map className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium hidden sm:inline">City Map</span>
        </motion.button>
      )}

      {/* City map overlay */}
      <CityMapOverlay isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} />

      {/* Radial navigation - bottom right for authenticated immersive routes */}
      {isImmersiveRoute && <RadialNavigation />}
    </div>
  );
};
