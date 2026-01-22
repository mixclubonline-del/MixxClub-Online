/**
 * Hallway Ambience Component
 * 
 * Creates atmospheric life layers for the Studio Hallway:
 * - Light leaks that sweep across periodically
 * - Floating dust particles with slow drift
 * - Atmospheric color breathing over long cycles
 * - Random door flickers suggesting activity
 * 
 * Makes the space feel alive, not static.
 */

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface HallwayAmbienceProps {
  intensity?: number; // 0-1, how active the atmosphere feels
}

export function HallwayAmbience({ intensity = 0.5 }: HallwayAmbienceProps) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Light leak sweeps - periodic beams of light */}
      <LightLeaks intensity={intensity} />
      
      {/* Floating dust particles */}
      <DustParticles count={20} />
      
      {/* Atmospheric color breathing */}
      <AtmosphericBreathing intensity={intensity} />
      
      {/* Subtle vignette pulse */}
      <VignettePulse />
    </div>
  );
}

function LightLeaks({ intensity }: { intensity: number }) {
  return (
    <>
      {/* Left side light leak */}
      <motion.div
        className="absolute -left-20 top-1/4 w-40 h-[200%] bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rotate-12 blur-3xl"
        animate={{
          x: ['0%', '150%', '0%'],
          opacity: [0, 0.15 * intensity, 0]
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
          repeatDelay: 8
        }}
      />
      
      {/* Right side light leak */}
      <motion.div
        className="absolute -right-20 top-1/3 w-32 h-[180%] bg-gradient-to-l from-accent/8 via-accent/4 to-transparent -rotate-12 blur-3xl"
        animate={{
          x: ['0%', '-120%', '0%'],
          opacity: [0, 0.12 * intensity, 0]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 6,
          repeatDelay: 10
        }}
      />
      
      {/* Center spotlight drift */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-full bg-gradient-to-b from-primary/5 via-transparent to-transparent blur-3xl"
        animate={{
          x: ['-50%', '-30%', '-70%', '-50%'],
          opacity: [0.05, 0.1 * intensity, 0.05]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    </>
  );
}

function DustParticles({ count }: { count: number }) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    startX: Math.random() * 100,
    startY: Math.random() * 100,
    size: Math.random() * 2 + 1,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 10
  }));

  return (
    <>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-foreground/10"
          style={{
            left: `${particle.startX}%`,
            top: `${particle.startY}%`,
            width: particle.size,
            height: particle.size
          }}
          animate={{
            x: [0, Math.random() * 60 - 30, Math.random() * 40 - 20, 0],
            y: [0, Math.random() * -80, Math.random() * -40, 0],
            opacity: [0, 0.4, 0.2, 0]
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'linear'
          }}
        />
      ))}
    </>
  );
}

function AtmosphericBreathing({ intensity }: { intensity: number }) {
  return (
    <>
      {/* Warm hue layer */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3"
        animate={{
          opacity: [0, 0.08 * intensity, 0]
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      
      {/* Cool hue layer - offset timing */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-tl from-secondary/3 via-transparent to-muted/5"
        animate={{
          opacity: [0, 0.06 * intensity, 0]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 6
        }}
      />
    </>
  );
}

function VignettePulse() {
  return (
    <motion.div
      className="absolute inset-0"
      style={{
        background: 'radial-gradient(ellipse at center, transparent 40%, hsl(var(--background) / 0.4) 100%)'
      }}
      animate={{
        opacity: [0.8, 1, 0.8]
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    />
  );
}
