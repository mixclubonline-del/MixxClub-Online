import { motion } from "framer-motion";
import { LucideIcon, Check, Sparkles } from "lucide-react";
import { CharacterAvatar } from "@/components/characters";
import { getCharacter } from "@/config/characters";

interface JourneyStep {
  icon: LucideIcon;
  title: string;
  description: string;
  time: string;
}

interface JourneyPathProps {
  steps: JourneyStep[];
  activeStep: number;
  onStepClick: (index: number) => void;
  variant: "artist" | "engineer";
}

const JourneyPath = ({ steps, activeStep, onStepClick, variant }: JourneyPathProps) => {
  const accentColor = variant === "artist" 
    ? "hsl(262 83% 58%)" 
    : "hsl(180 100% 50%)";
  
  const characterId = variant === "artist" ? "jax" : "rell";
  const character = getCharacter(characterId);
  
  // Milestone quotes at key steps
  const milestoneQuotes: Record<number, string> = variant === "artist" 
    ? { 0: "Let's get it.", 4: "That's a hit. Period." }
    : { 0: "Show 'em what you got.", 3: "Secure the bag." };

  return (
    <div className="relative py-12 px-6">
      {/* Path line with glow */}
      <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 hidden md:block">
        <div className="h-full bg-gradient-to-b from-transparent via-border/50 to-transparent rounded-full" />
        
        {/* Animated progress glow */}
        <motion.div
          className="absolute top-0 w-full rounded-full"
          style={{ 
            background: `linear-gradient(to bottom, ${accentColor}, ${accentColor}80, transparent)`,
          }}
          initial={{ height: 0 }}
          animate={{ height: `${((activeStep + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
        
        {/* Glow effect */}
        <motion.div
          className="absolute top-0 w-4 -left-1.5 rounded-full blur-sm"
          style={{ 
            background: `linear-gradient(to bottom, ${accentColor}60, transparent)`,
          }}
          initial={{ height: 0 }}
          animate={{ height: `${((activeStep + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>

      {/* Steps */}
      <div className="max-w-4xl mx-auto space-y-8 md:space-y-16">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === activeStep;
          const isPast = index < activeStep;
          const isFuture = index > activeStep;
          const isFinalStep = index === steps.length - 1;
          const hasMilestoneQuote = milestoneQuotes[index];

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative flex items-center gap-6 md:gap-8 ${
                index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              }`}
              onClick={() => onStepClick(index)}
            >
              {/* Milestone marker with enhanced styling */}
              <motion.button
                className={`relative z-10 flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-full border-2 flex items-center justify-center transition-all duration-500 cursor-pointer ${
                  isPast
                    ? "border-green-500/50 bg-green-500/20"
                    : isActive
                    ? "border-current bg-current/20"
                    : "border-border bg-card/50"
                }`}
                style={{
                  borderColor: isActive ? accentColor : isPast ? undefined : undefined,
                  backgroundColor: isActive ? `${accentColor}20` : undefined,
                  boxShadow: isActive 
                    ? `0 0 30px ${accentColor}50, 0 0 60px ${accentColor}20` 
                    : isPast 
                    ? "0 0 20px hsl(142 76% 36% / 0.3)"
                    : undefined,
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {isPast ? (
                  <Check className="w-6 h-6 text-green-500" />
                ) : isFinalStep && isActive ? (
                  <Sparkles className="w-6 h-6" style={{ color: accentColor }} />
                ) : (
                  <Icon className={`w-6 h-6 transition-colors duration-500 ${
                    isActive ? "text-foreground" : "text-muted-foreground"
                  }`} />
                )}
                
                {/* Step number badge */}
                <span 
                  className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 rounded-full text-xs flex items-center justify-center font-bold"
                  style={{
                    backgroundColor: isPast ? "hsl(142 76% 36%)" : isActive ? accentColor : "hsl(var(--muted))",
                    color: isPast || isActive ? "white" : "hsl(var(--muted-foreground))",
                  }}
                >
                  {isPast ? "✓" : index + 1}
                </span>
                
                {/* Active pulse ring */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2"
                    style={{ borderColor: accentColor }}
                    animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.button>

              {/* Step content card */}
              <motion.div
                className={`flex-1 p-5 md:p-6 rounded-2xl border backdrop-blur-sm transition-all duration-500 ${
                  isActive
                    ? "bg-card/90"
                    : isPast
                    ? "bg-card/60"
                    : "bg-card/30"
                } ${isFuture ? "opacity-40" : "opacity-100"}`}
                style={{
                  borderColor: isActive ? `${accentColor}60` : isPast ? "hsl(142 76% 36% / 0.3)" : "hsl(var(--border) / 0.3)",
                  boxShadow: isActive ? `0 4px 30px ${accentColor}15` : undefined,
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm md:text-base text-muted-foreground">
                      {step.description}
                    </p>
                    
                    {/* Milestone quote with character */}
                    {hasMilestoneQuote && isActive && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center gap-3 mt-4 pt-3 border-t border-border/30"
                      >
                        <CharacterAvatar characterId={characterId} size="sm" showGlow={false} />
                        <p className="text-xs italic text-muted-foreground">
                          "{milestoneQuotes[index]}" — <span style={{ color: accentColor }}>{character.name}</span>
                        </p>
                      </motion.div>
                    )}
                  </div>
                  
                  <span 
                    className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: isActive ? `${accentColor}20` : "hsl(var(--muted))",
                      color: isActive ? accentColor : "hsl(var(--muted-foreground))",
                    }}
                  >
                    {step.time}
                  </span>
                </div>
              </motion.div>

              {/* Character avatar floating near active step (desktop) */}
              {isActive && index === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="hidden lg:block absolute -right-20"
                  style={{ top: "50%", transform: "translateY(-50%)" }}
                >
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <CharacterAvatar characterId={characterId} size="lg" showGlow={true} />
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default JourneyPath;
