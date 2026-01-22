// Pulse UI Components - Energy state visualization
import { motion, AnimatePresence } from 'framer-motion';
import { usePulse } from '@/contexts/PulseContext';
import { EnergyState, PULSE_CONFIGS } from '@/types/pulse';
import { cn } from '@/lib/utils';
import { Compass, Sparkles, Users, LayoutDashboard, Coins, PartyPopper } from 'lucide-react';

const ENERGY_ICONS: Record<EnergyState, React.ElementType> = {
  DISCOVER: Compass,
  CREATE: Sparkles,
  COLLABORATE: Users,
  MANAGE: LayoutDashboard,
  EARN: Coins,
  CELEBRATE: PartyPopper,
};

// Subtle energy state indicator
export function EnergyIndicator({ className }: { className?: string }) {
  const { currentEnergy, config, transitionInProgress } = usePulse();
  const Icon = ENERGY_ICONS[currentEnergy];
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full",
        "bg-card/60 backdrop-blur-sm border border-border/30",
        "text-xs font-medium",
        transitionInProgress && "animate-pulse",
        className
      )}
    >
      <Icon className="w-3.5 h-3.5 text-primary" />
      <span className="text-muted-foreground">{config.label}</span>
    </motion.div>
  );
}

// Transition overlay effect
export function EnergyTransition() {
  const { transitionInProgress, config } = usePulse();
  
  return (
    <AnimatePresence>
      {transitionInProgress && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 pointer-events-none z-50"
          style={{ backgroundColor: config.color }}
        />
      )}
    </AnimatePresence>
  );
}

// Depth-aware content revelation
interface DepthRevealProps {
  postedUp: React.ReactNode;
  inTheRoom?: React.ReactNode;
  onTheMic?: React.ReactNode;
  onStage?: React.ReactNode;
}

export function DepthReveal({ postedUp, inTheRoom, onTheMic, onStage }: DepthRevealProps) {
  const { currentLayer } = usePulse();
  
  switch (currentLayer) {
    case 'on-stage':
      return <>{onStage ?? onTheMic ?? inTheRoom ?? postedUp}</>;
    case 'on-the-mic':
      return <>{onTheMic ?? inTheRoom ?? postedUp}</>;
    case 'in-the-room':
      return <>{inTheRoom ?? postedUp}</>;
    default:
      return <>{postedUp}</>;
  }
}
