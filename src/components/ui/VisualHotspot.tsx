/**
 * Visual Hotspot Component
 * 
 * A reusable, glowing interactive point for spatial navigation.
 * Communicates state through lighting and animation, not labels.
 * Text appears only on hover.
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  GLOW_ANIMATIONS, 
  PULSE_TIMING, 
  getHotspotSize,
  type HotspotState 
} from '@/lib/spatial-interface';

interface VisualHotspotProps {
  position: { x: number; y: number };
  state?: HotspotState;
  size?: 'sm' | 'md' | 'lg';
  glowColor?: string; // HSL values without hsl() wrapper
  label?: string;
  description?: string;
  highlight?: boolean;
  onClick?: () => void;
  className?: string;
}

export function VisualHotspot({
  position,
  state = 'idle',
  size = 'md',
  glowColor,
  label,
  description,
  highlight = false,
  onClick,
  className,
}: VisualHotspotProps) {
  const [isHovered, setIsHovered] = useState(false);
  const sizeConfig = getHotspotSize(size);
  
  const isActive = state !== 'idle' && state !== 'waiting';
  const isRecording = state === 'recording';
  const isLive = state === 'live';
  
  // Dynamic glow color based on state or custom color
  const getGlowStyle = () => {
    if (isRecording) {
      return { boxShadow: `0 0 ${sizeConfig.glowSpread}px 8px hsl(var(--destructive) / 0.5)` };
    }
    if (isLive) {
      return { boxShadow: `0 0 ${sizeConfig.glowSpread}px 8px hsl(142 76% 36% / 0.5)` };
    }
    if (glowColor && (isActive || isHovered)) {
      return { boxShadow: `0 0 ${sizeConfig.glowSpread}px 8px hsl(${glowColor} / 0.5)` };
    }
    return {};
  };

  return (
    <motion.button
      className={cn(
        "absolute cursor-pointer group",
        className
      )}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Outer glow ring for active/highlighted states */}
      {(isActive || highlight) && (
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: sizeConfig.width * 2,
            height: sizeConfig.height * 2,
            left: -sizeConfig.width / 2,
            top: -sizeConfig.height / 2,
            background: glowColor 
              ? `radial-gradient(circle, hsl(${glowColor} / 0.3), transparent 70%)`
              : 'radial-gradient(circle, hsl(var(--primary) / 0.3), transparent 70%)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0.2, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Main hotspot circle */}
      <motion.div
        className={cn(
          "relative rounded-full border-2 backdrop-blur-sm transition-colors duration-300",
          isActive
            ? "bg-primary/40 border-primary"
            : "bg-muted/20 border-muted-foreground/30 hover:border-muted-foreground/60"
        )}
        style={{
          width: sizeConfig.width,
          height: sizeConfig.height,
          ...getGlowStyle(),
        }}
        animate={isActive ? GLOW_ANIMATIONS[state] : {}}
        transition={PULSE_TIMING[state]}
      >
        {/* Recording indicator - red dot */}
        {isRecording && (
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-destructive"
            style={{
              width: sizeConfig.iconSize * 0.5,
              height: sizeConfig.iconSize * 0.5,
            }}
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        )}

        {/* Live indicator - green pulsing circle */}
        {isLive && (
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: sizeConfig.iconSize * 0.6,
              height: sizeConfig.iconSize * 0.6,
              backgroundColor: 'hsl(142 76% 36%)',
            }}
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [1, 0.7, 1] 
            }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}

        {/* Active session inner glow */}
        {isActive && !isRecording && !isLive && (
          <div 
            className="absolute inset-2 rounded-full"
            style={{
              backgroundColor: glowColor 
                ? `hsl(${glowColor} / 0.6)` 
                : 'hsl(var(--primary) / 0.6)',
            }}
          />
        )}

        {/* Highlight indicator */}
        {highlight && (
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-yellow-400"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </motion.div>

      {/* Hover tooltip */}
      {(label || description) && isHovered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute left-1/2 -translate-x-1/2 z-20 pointer-events-none"
          style={{ top: sizeConfig.height + 12 }}
        >
          <div className="bg-background/95 backdrop-blur-md border border-border/50 rounded-lg px-3 py-2 shadow-xl whitespace-nowrap">
            {label && (
              <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                {label}
              </p>
            )}
            {description && (
              <p className="text-xs text-muted-foreground max-w-[200px]">
                {description}
              </p>
            )}
          </div>
        </motion.div>
      )}
    </motion.button>
  );
}
