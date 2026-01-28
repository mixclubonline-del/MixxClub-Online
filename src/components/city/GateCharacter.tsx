/**
 * Gate Character Component
 * 
 * Character-guided path selection for the City Gates.
 * Shows Jax (Artist) or Rell (Engineer) with ambient glow and speech bubble.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CharacterAvatar } from '@/components/characters/CharacterAvatar';
import { getCharacter, type CharacterId } from '@/config/characters';
import { cn } from '@/lib/utils';

interface GateCharacterProps {
  characterId: CharacterId;
  role: 'artist' | 'engineer';
  position: 'left' | 'right';
  onClick: () => void;
  isEntering?: boolean;
  className?: string;
}

export function GateCharacter({
  characterId,
  role,
  position,
  onClick,
  isEntering = false,
  className,
}: GateCharacterProps) {
  const [isHovered, setIsHovered] = useState(false);
  const character = getCharacter(characterId);
  
  // Get a random onboarding quote
  const quote = character.onboardingQuotes?.[0] || character.sampleQuotes[0];
  
  // Role-specific colors
  const glowColor = role === 'artist' 
    ? 'hsl(280 65% 60%)' // Purple-pink
    : 'hsl(190 95% 50%)'; // Cyan
  
  const glowShadow = role === 'artist'
    ? '0 0 60px 20px hsl(280 65% 60% / 0.4)'
    : '0 0 60px 20px hsl(190 95% 50% / 0.4)';

  return (
    <motion.button
      className={cn(
        "relative flex flex-col items-center gap-4 cursor-pointer group",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-2xl",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      initial={{ opacity: 0, y: 30 }}
      animate={{ 
        opacity: isEntering ? 0 : 1, 
        y: isEntering ? -20 : 0,
        scale: isEntering ? 1.2 : 1,
      }}
      transition={{ duration: 0.6, delay: position === 'left' ? 0.2 : 0.4 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Ambient glow ring */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 180,
          height: 180,
          background: `radial-gradient(circle, ${glowColor.replace(')', ' / 0.3)')}, transparent 70%)`,
        }}
        animate={{
          scale: isHovered ? [1, 1.2, 1] : [1, 1.1, 1],
          opacity: isHovered ? [0.6, 0.4, 0.6] : [0.3, 0.2, 0.3],
        }}
        transition={{
          duration: isHovered ? 1.5 : 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Character Avatar */}
      <motion.div
        className="relative z-10"
        animate={{
          y: [0, -4, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          boxShadow: isHovered ? glowShadow : 'none',
          borderRadius: '50%',
        }}
      >
        <CharacterAvatar
          characterId={characterId}
          size="xl"
          showGlow={isHovered}
        />
      </motion.div>

      {/* Role Label */}
      <motion.div
        className="relative z-10 text-center"
        animate={{ opacity: isEntering ? 0 : 1 }}
      >
        <h3 className="text-lg md:text-xl font-bold text-white drop-shadow-lg">
          {role === 'artist' ? 'Artist Path' : 'Engineer Path'}
        </h3>
        <p className="text-xs md:text-sm text-white/70 mt-0.5">
          {role === 'artist' ? 'Create • Collaborate • Release' : 'Mix • Master • Earn'}
        </p>
      </motion.div>

      {/* Speech Bubble - appears on hover */}
      <AnimatePresence>
        {isHovered && !isEntering && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "absolute z-20 max-w-[200px] md:max-w-[240px]",
              "bg-background/95 backdrop-blur-md border border-border/50",
              "rounded-xl px-4 py-3 shadow-xl",
              position === 'left' ? 'left-full ml-4' : 'right-full mr-4',
              "top-1/2 -translate-y-1/2",
              // Mobile: position below
              "max-md:left-1/2 max-md:-translate-x-1/2 max-md:right-auto",
              "max-md:top-auto max-md:bottom-full max-md:mb-4 max-md:translate-y-0"
            )}
          >
            {/* Speech bubble arrow */}
            <div
              className={cn(
                "absolute w-3 h-3 bg-background/95 border-border/50 rotate-45",
                position === 'left' 
                  ? '-left-1.5 top-1/2 -translate-y-1/2 border-l border-b' 
                  : '-right-1.5 top-1/2 -translate-y-1/2 border-r border-t',
                // Mobile: arrow points down
                "max-md:left-1/2 max-md:-translate-x-1/2 max-md:top-auto max-md:-bottom-1.5",
                "max-md:border-r max-md:border-b max-md:border-l-0 max-md:border-t-0"
              )}
            />
            <p className="text-sm text-foreground italic leading-relaxed">
              "{quote}"
            </p>
            <p className="text-xs text-muted-foreground mt-1.5 font-medium">
              — {character.name}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click prompt */}
      <motion.p
        className="absolute -bottom-8 text-xs text-white/50"
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        Click to enter
      </motion.p>
    </motion.button>
  );
}
