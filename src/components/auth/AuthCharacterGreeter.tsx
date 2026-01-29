/**
 * Auth Character Greeter
 * 
 * Character-guided role selection for sign-up mode.
 * Features Jax (Artist) and Rell (Engineer) with welcoming quotes.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CharacterAvatar } from '@/components/characters/CharacterAvatar';
import { getCharacter, type CharacterId } from '@/config/characters';
import { cn } from '@/lib/utils';

interface AuthCharacterGreeterProps {
  role: 'artist' | 'engineer';
  onRoleChange: (role: 'artist' | 'engineer') => void;
}

// Auth-specific quotes for each character
const AUTH_QUOTES = {
  jax: {
    idle: "Ready to make some noise?",
    active: "Your sound is waiting.",
    hover: "Let's get that mix right."
  },
  rell: {
    idle: "The studio is calling.",
    active: "Let's build something legendary.",
    hover: "Time to put in work."
  }
};

export function AuthCharacterGreeter({ role, onRoleChange }: AuthCharacterGreeterProps) {
  const [hoveredRole, setHoveredRole] = useState<'artist' | 'engineer' | null>(null);
  
  const jaxCharacter = getCharacter('jax');
  const rellCharacter = getCharacter('rell');

  const getQuote = (characterKey: 'jax' | 'rell', isActive: boolean, isHovered: boolean) => {
    if (isHovered) return AUTH_QUOTES[characterKey].hover;
    if (isActive) return AUTH_QUOTES[characterKey].active;
    return AUTH_QUOTES[characterKey].idle;
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-white/60 text-center">Choose your path</p>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Jax - Artist Path */}
        <motion.button
          type="button"
          onClick={() => onRoleChange('artist')}
          onMouseEnter={() => setHoveredRole('artist')}
          onMouseLeave={() => setHoveredRole(null)}
          className={cn(
            "relative flex flex-col items-center gap-3 rounded-xl p-5 transition-all",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
            role === 'artist'
              ? "bg-primary/20 border-2 border-primary shadow-lg shadow-primary/30"
              : "bg-white/5 border border-white/10 hover:bg-white/10"
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Active glow */}
          {role === 'artist' && (
            <motion.div
              className="absolute inset-0 rounded-xl"
              layoutId="authRoleGlow"
              style={{
                background: 'radial-gradient(circle at center, hsl(var(--primary) / 0.3), transparent 70%)'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
          
          {/* Character Avatar */}
          <motion.div
            className="relative z-10"
            animate={{
              scale: role === 'artist' ? 1.1 : 1,
              y: role === 'artist' ? -4 : 0
            }}
            transition={{ duration: 0.3 }}
          >
            <CharacterAvatar
              characterId="jax"
              size="lg"
              showGlow={role === 'artist' || hoveredRole === 'artist'}
            />
          </motion.div>
          
          {/* Role Label */}
          <div className="relative z-10 text-center">
            <span className={cn(
              "font-semibold text-sm",
              role === 'artist' ? "text-white" : "text-white/70"
            )}>
              Artist
            </span>
            <p className="text-xs text-white/50 mt-0.5">
              Get professional mixes
            </p>
          </div>

          {/* Quote Bubble */}
          <AnimatePresence>
            {(role === 'artist' || hoveredRole === 'artist') && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.2 }}
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 translate-y-full z-20 w-[140px]"
              >
                <div className="bg-background/90 backdrop-blur-md border border-border/50 rounded-lg px-3 py-2 shadow-lg">
                  <p className="text-xs text-foreground/80 italic text-center leading-tight">
                    "{getQuote('jax', role === 'artist', hoveredRole === 'artist')}"
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1 text-center">— {jaxCharacter.name}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Rell - Engineer Path */}
        <motion.button
          type="button"
          onClick={() => onRoleChange('engineer')}
          onMouseEnter={() => setHoveredRole('engineer')}
          onMouseLeave={() => setHoveredRole(null)}
          className={cn(
            "relative flex flex-col items-center gap-3 rounded-xl p-5 transition-all",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50",
            role === 'engineer'
              ? "bg-cyan-500/20 border-2 border-cyan-400 shadow-lg shadow-cyan-500/30"
              : "bg-white/5 border border-white/10 hover:bg-white/10"
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Active glow */}
          {role === 'engineer' && (
            <motion.div
              className="absolute inset-0 rounded-xl"
              layoutId="authRoleGlow"
              style={{
                background: 'radial-gradient(circle at center, hsl(190 95% 50% / 0.3), transparent 70%)'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
          
          {/* Character Avatar */}
          <motion.div
            className="relative z-10"
            animate={{
              scale: role === 'engineer' ? 1.1 : 1,
              y: role === 'engineer' ? -4 : 0
            }}
            transition={{ duration: 0.3 }}
          >
            <CharacterAvatar
              characterId="rell"
              size="lg"
              showGlow={role === 'engineer' || hoveredRole === 'engineer'}
            />
          </motion.div>
          
          {/* Role Label */}
          <div className="relative z-10 text-center">
            <span className={cn(
              "font-semibold text-sm",
              role === 'engineer' ? "text-white" : "text-white/70"
            )}>
              Engineer
            </span>
            <p className="text-xs text-white/50 mt-0.5">
              Offer your services
            </p>
          </div>

          {/* Quote Bubble */}
          <AnimatePresence>
            {(role === 'engineer' || hoveredRole === 'engineer') && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.2 }}
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 translate-y-full z-20 w-[140px]"
              >
                <div className="bg-background/90 backdrop-blur-md border border-border/50 rounded-lg px-3 py-2 shadow-lg">
                  <p className="text-xs text-foreground/80 italic text-center leading-tight">
                    "{getQuote('rell', role === 'engineer', hoveredRole === 'engineer')}"
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1 text-center">— {rellCharacter.name}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
}
