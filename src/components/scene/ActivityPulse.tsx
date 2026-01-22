/**
 * Activity Pulse Component
 * 
 * A wordless visual indicator of platform activity.
 * Like a VU meter for energy - communicates state without text.
 * 
 * States:
 * - Zero sessions: Soft, slow pulse (waiting energy)
 * - Active sessions: Warm, faster pulse with intensity based on count
 * - High activity: Vibrant, rhythmic pulse
 */

import { motion } from 'framer-motion';

interface ActivityPulseProps {
  sessionCount: number;
  maxIntensity?: number;
  className?: string;
}

export function ActivityPulse({ 
  sessionCount, 
  maxIntensity = 5,
  className = '' 
}: ActivityPulseProps) {
  // Normalize intensity from 0 to 1 based on session count
  const intensity = Math.min(sessionCount / maxIntensity, 1);
  const isActive = sessionCount > 0;
  
  // Pulse speed increases with activity
  const baseDuration = isActive ? 2 - (intensity * 0.8) : 3;
  
  // Scale increases with activity
  const pulseScale = isActive ? 1.4 + (intensity * 0.4) : 1.2;
  
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Outer glow ring - always present, intensity varies */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 48,
          height: 48,
          background: isActive 
            ? `radial-gradient(circle, hsl(var(--primary) / ${0.15 + intensity * 0.2}) 0%, transparent 70%)`
            : 'radial-gradient(circle, hsl(var(--muted-foreground) / 0.1) 0%, transparent 70%)'
        }}
        animate={{
          scale: [1, pulseScale, 1],
          opacity: [0.4, 0.8, 0.4]
        }}
        transition={{
          duration: baseDuration,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      
      {/* Secondary ring - appears with activity */}
      {isActive && (
        <motion.div
          className="absolute rounded-full border border-primary/30"
          style={{ width: 32, height: 32 }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: baseDuration * 0.8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.2
          }}
        />
      )}
      
      {/* Core pulse - the heart */}
      <motion.div
        className={`relative z-10 rounded-full ${
          isActive ? 'bg-primary' : 'bg-muted-foreground/40'
        }`}
        style={{ 
          width: 12 + (intensity * 4), 
          height: 12 + (intensity * 4),
          boxShadow: isActive 
            ? `0 0 ${20 + intensity * 20}px hsl(var(--primary) / ${0.3 + intensity * 0.3})`
            : 'none'
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: isActive ? [0.8, 1, 0.8] : [0.4, 0.6, 0.4]
        }}
        transition={{
          duration: baseDuration * 0.6,
          repeat: Infinity,
          ease: 'easeOut'
        }}
      />
      
      {/* Energy ripples - high activity only */}
      {intensity > 0.5 && (
        <>
          <motion.div
            className="absolute rounded-full border border-primary/20"
            style={{ width: 56, height: 56 }}
            animate={{
              scale: [1, 2, 2],
              opacity: [0.4, 0, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeOut'
            }}
          />
          <motion.div
            className="absolute rounded-full border border-primary/15"
            style={{ width: 56, height: 56 }}
            animate={{
              scale: [1, 2, 2],
              opacity: [0.3, 0, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeOut',
              delay: 0.8
            }}
          />
        </>
      )}
    </div>
  );
}
