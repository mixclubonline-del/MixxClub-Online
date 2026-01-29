/**
 * Auth Welcome Back
 * 
 * Login mode character greeting with Prime as the welcomer.
 * Simpler single-character layout for returning users.
 */

import { motion } from 'framer-motion';
import { CharacterAvatar } from '@/components/characters/CharacterAvatar';
import { getCharacter } from '@/config/characters';

const WELCOME_QUOTES = [
  "Welcome back to the city.",
  "The session awaits.",
  "Good to see you again.",
  "Ready to get back to work?"
];

export function AuthWelcomeBack() {
  const primeCharacter = getCharacter('prime');
  
  // Pick a consistent quote based on the current hour (changes every hour)
  const quoteIndex = new Date().getHours() % WELCOME_QUOTES.length;
  const quote = WELCOME_QUOTES[quoteIndex];

  return (
    <motion.div
      className="flex flex-col items-center gap-3 mb-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
    >
      {/* Prime Avatar with subtle glow */}
      <motion.div
        className="relative"
        animate={{
          y: [0, -3, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Ambient glow ring */}
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            width: 80,
            height: 80,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, hsl(var(--primary) / 0.25), transparent 70%)',
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        <CharacterAvatar
          characterId="prime"
          size="lg"
          showGlow={true}
        />
      </motion.div>

      {/* Welcome Quote */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
      >
        <p className="text-sm text-white/80 italic">
          "{quote}"
        </p>
        <p className="text-xs text-white/50 mt-1">
          — {primeCharacter.name}
        </p>
      </motion.div>
    </motion.div>
  );
}
