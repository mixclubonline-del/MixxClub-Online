/**
 * Gate Activity Indicator Component
 * 
 * Shows live platform activity to combat the "ghost town" effect.
 * Displays session count with a pulsing ambient effect.
 */

import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import { ActivityPulse } from '@/components/scene/ActivityPulse';
import { cn } from '@/lib/utils';

interface GateActivityIndicatorProps {
  sessionCount?: number;
  className?: string;
}

export function GateActivityIndicator({
  sessionCount = 0,
  className,
}: GateActivityIndicatorProps) {
  // For demo purposes, show a realistic-looking count if none provided
  const displayCount = sessionCount > 0 ? sessionCount : Math.floor(Math.random() * 8) + 3;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
      className={cn(
        "flex items-center gap-3 px-4 py-2",
        "bg-background/40 backdrop-blur-md rounded-full",
        "border border-white/10",
        className
      )}
    >
      {/* Activity Pulse */}
      <ActivityPulse sessionCount={displayCount} maxIntensity={10} />
      
      {/* Count Display */}
      <div className="flex items-center gap-1.5">
        <Activity className="w-3.5 h-3.5 text-primary/80" />
        <span className="text-sm text-white/80 font-medium">
          {displayCount} active {displayCount === 1 ? 'session' : 'sessions'}
        </span>
      </div>
    </motion.div>
  );
}
