import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CharacterAvatar } from './CharacterAvatar';
import { getCharacter, type CharacterId } from '@/config/characters';

interface OnboardingCharacterGuideProps {
  characterId: CharacterId;
  step: number;
  totalSteps: number;
  customQuote?: string;
  className?: string;
}

const stepQuotes: Record<CharacterId, string[]> = {
  jax: [
    "I got the idea. I just need it to sound right.",
    "Let's find your sound.",
    "What's the goal? Let's lock it in.",
    "You're ready. Prime's got it from here.",
  ],
  rell: [
    "If the system's solid, the work speaks.",
    "Show them what you can do.",
    "Set your rates. Know your worth.",
    "You're ready. Prime's got it from here.",
  ],
  nova: [
    "You're in the right room.",
    "Keep going, you've got this.",
    "Almost there!",
    "Welcome to the club!",
  ],
  prime: [
    "Welcome. Let's build something.",
    "I've been where you're trying to go.",
    "Trust the process.",
    "Let's get legendary.",
  ],
};

export function OnboardingCharacterGuide({
  characterId,
  step,
  totalSteps,
  customQuote,
  className,
}: OnboardingCharacterGuideProps) {
  const character = getCharacter(characterId);
  const quotes = stepQuotes[characterId] || stepQuotes.nova;
  const currentQuote = customQuote || quotes[Math.min(step, quotes.length - 1)];
  const isLastStep = step === totalSteps - 1;
  const showTransition = isLastStep && characterId !== 'prime';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className={cn(
        'fixed bottom-6 left-6 z-50',
        'hidden md:flex items-end gap-3',
        className
      )}
    >
      {/* Character Avatar */}
      <AnimatePresence mode="wait">
        <motion.div
          key={showTransition ? 'prime' : characterId}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative"
        >
          {/* Ambient glow */}
          <div 
            className="absolute inset-0 rounded-full blur-xl opacity-40"
            style={{ 
              background: showTransition 
                ? getCharacter('prime').accentColor 
                : character.accentColor 
            }}
          />
          <CharacterAvatar 
            characterId={showTransition ? 'prime' : characterId} 
            size="lg" 
            showGlow 
          />
        </motion.div>
      </AnimatePresence>

      {/* Speech Bubble */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${step}-${showTransition}`}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className={cn(
            'relative bg-background/95 backdrop-blur-sm',
            'border border-border/50 rounded-2xl rounded-bl-sm',
            'px-4 py-3 max-w-[200px]',
            'shadow-lg'
          )}
          style={{
            boxShadow: `0 4px 20px -4px ${showTransition ? getCharacter('prime').accentColor : character.accentColor}40`,
          }}
        >
          {/* Quote */}
          <p className="text-sm text-foreground leading-snug">
            "{currentQuote}"
          </p>
          
          {/* Character Name */}
          <p 
            className="text-xs font-medium mt-1"
            style={{ color: showTransition ? getCharacter('prime').accentColor : character.accentColor }}
          >
            — {showTransition ? 'Prime' : character.name}
          </p>

          {/* Bubble pointer */}
          <div 
            className="absolute -left-2 bottom-3 w-4 h-4 rotate-45 bg-background/95 border-l border-b border-border/50"
          />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
