import { ReactNode, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Map } from 'lucide-react';
import { RadialNavigation } from './RadialNavigation';
import { CityMapOverlay } from './CityMapOverlay';
import { DistrictTransition } from './DistrictTransition';
import { useAuth } from '@/hooks/useAuth';
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
  '/dashboard',
  '/artist-crm',
  '/engineer-crm',
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

export const ImmersiveAppShell = ({ children }: ImmersiveAppShellProps) => {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

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
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent-blue/5" />
        
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
                             linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: '100px 100px'
          }}
        />

        {/* Corner glow effects */}
        <motion.div 
          className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-primary/10 blur-3xl"
          animate={{ 
            opacity: [0.1, 0.2, 0.1],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div 
          className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-accent-blue/10 blur-3xl"
          animate={{ 
            opacity: [0.1, 0.15, 0.1],
            scale: [1, 1.05, 1]
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
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
