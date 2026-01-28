import { motion, AnimatePresence } from "framer-motion";
import { CharacterAvatar } from "@/components/characters";
import { getCharacter, type CharacterId } from "@/config/characters";

interface JourneyCompanionProps {
  role: "artist" | "engineer";
  currentStep: number;
  totalSteps: number;
  isVisible?: boolean;
}

const stepQuotes: Record<"artist" | "engineer", Record<number, string>> = {
  artist: {
    0: "Drop that heat. Let's go.",
    1: "AI got your back.",
    2: "Real engineers, real results.",
    3: "This where the magic happens.",
    4: "That's a hit. Period.",
  },
  engineer: {
    0: "Show 'em what you got.",
    1: "Artists finding you now.",
    2: "Do what you do best.",
    3: "Secure the bag.",
  },
};

const JourneyCompanion = ({ 
  role, 
  currentStep, 
  totalSteps,
  isVisible = true 
}: JourneyCompanionProps) => {
  const characterId: CharacterId = role === "artist" ? "jax" : "rell";
  const character = getCharacter(characterId);
  const quote = stepQuotes[role][currentStep] || character.sampleQuotes[0];
  
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const accentColor = role === "artist" 
    ? "hsl(262 83% 58%)" 
    : "hsl(180 100% 50%)";

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ duration: 0.4 }}
          className="fixed right-6 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col items-center gap-4"
        >
          {/* Progress bar */}
          <div className="w-1 h-32 bg-border/30 rounded-full overflow-hidden">
            <motion.div
              className="w-full rounded-full"
              style={{ backgroundColor: accentColor }}
              initial={{ height: 0 }}
              animate={{ height: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Character avatar with glow */}
          <motion.div
            className="relative"
            animate={{ 
              y: [0, -5, 0],
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {/* Glow ring */}
            <div 
              className="absolute -inset-2 rounded-full blur-md opacity-50"
              style={{ backgroundColor: accentColor }}
            />
            
            <CharacterAvatar 
              characterId={characterId} 
              size="lg" 
              showGlow={true}
            />
          </motion.div>

          {/* Speech bubble */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ delay: 0.2 }}
            className="relative max-w-[160px]"
          >
            {/* Bubble arrow */}
            <div 
              className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent"
              style={{ borderBottomColor: 'hsl(var(--card))' }}
            />
            
            <div className="bg-card/90 backdrop-blur-sm border border-border/50 rounded-xl px-3 py-2 text-center">
              <p className="text-xs text-muted-foreground italic">
                "{quote}"
              </p>
              <p 
                className="text-xs font-medium mt-1"
                style={{ color: accentColor }}
              >
                — {character.name}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default JourneyCompanion;
