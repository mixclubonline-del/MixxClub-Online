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

export function OnboardingCharacterGuide({
  characterId,
  step,
  totalSteps,
  customQuote,
  className,
}: OnboardingCharacterGuideProps) {
  const character = getCharacter(characterId);
  const primeCharacter = getCharacter('prime');
  
  // Use character-specific onboarding quotes from config
  const quotes = character.onboardingQuotes || character.sampleQuotes;
  const primeQuotes = primeCharacter.onboardingQuotes || primeCharacter.sampleQuotes;
  
  const isLastStep = step === totalSteps - 1;
  const showTransition = isLastStep && characterId !== 'prime';
  
  // Get the appropriate quote based on step and transition state
  const currentQuote = customQuote || (
    showTransition 
      ? primeQuotes[primeQuotes.length - 1] // Prime's final welcome quote
      : quotes[Math.min(step, quotes.length - 1)]
  );

  const activeCharacter = showTransition ? primeCharacter : character;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className={cn(
        'fixed bottom-6 left-6 z-50',
        'flex items-end gap-3',
        // Mobile: smaller and more compact
        'max-md:bottom-4 max-md:left-4 max-md:gap-2',
        className
      )}
    >
      {/* Character Avatar with ambient pulse */}
      <AnimatePresence mode="wait">
        <motion.div
          key={showTransition ? 'prime' : characterId}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative"
        >
          {/* Ambient breathing glow */}
          <motion.div 
            className="absolute inset-0 rounded-full blur-xl"
            style={{ background: activeCharacter.accentColor }}
            animate={{
              opacity: [0.3, 0.5, 0.3],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          
          {/* Scale up effect on Prime handoff */}
          <motion.div
            animate={showTransition ? { scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <CharacterAvatar 
              characterId={showTransition ? 'prime' : characterId} 
              size="lg" 
              showGlow 
              className="max-md:w-12 max-md:h-12"
            />
          </motion.div>
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
            'px-4 py-3 max-w-[220px]',
            'shadow-lg',
            // Mobile adjustments
            'max-md:px-3 max-md:py-2 max-md:max-w-[180px] max-md:rounded-xl max-md:rounded-bl-sm'
          )}
          style={{
            boxShadow: `0 4px 20px -4px ${activeCharacter.accentColor}40`,
          }}
        >
          {/* Quote */}
          <p className="text-sm text-foreground leading-snug max-md:text-xs">
            "{currentQuote}"
          </p>
          
          {/* Character Name with accent */}
          <p 
            className="text-xs font-medium mt-1.5 max-md:mt-1"
            style={{ color: activeCharacter.accentColor }}
          >
            — {activeCharacter.name}
          </p>

          {/* Bubble pointer */}
          <div 
            className="absolute -left-2 bottom-3 w-4 h-4 rotate-45 bg-background/95 border-l border-b border-border/50 max-md:w-3 max-md:h-3 max-md:-left-1.5 max-md:bottom-2"
          />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
