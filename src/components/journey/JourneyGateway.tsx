import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CharacterAvatar } from "@/components/characters";
import { getCharacter } from "@/config/characters";

interface JourneyGatewayProps {
  activeRole: "artist" | "engineer";
  onRoleChange: (role: "artist" | "engineer") => void;
}

const JourneyGateway = ({ activeRole, onRoleChange }: JourneyGatewayProps) => {
  const [hoveredRole, setHoveredRole] = useState<"artist" | "engineer" | null>(null);
  
  const jax = getCharacter("jax");
  const rell = getCharacter("rell");

  return (
    <div className="flex flex-col items-center gap-8 pt-24 pb-12 px-6">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-primary via-[hsl(220_90%_60%)] to-[hsl(180_100%_50%)] bg-clip-text text-transparent">
          Your Journey Begins
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Choose your path through MixClub City
        </p>
      </motion.div>

      {/* Character Gateway Portals */}
      <motion.div 
        className="flex flex-col sm:flex-row gap-8 sm:gap-12"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {/* Jax - Artist Portal */}
        <motion.button
          onClick={() => onRoleChange("artist")}
          onMouseEnter={() => setHoveredRole("artist")}
          onMouseLeave={() => setHoveredRole(null)}
          className={`relative group flex flex-col items-center gap-4 p-6 rounded-3xl border-2 transition-all duration-500 min-w-[220px] ${
            activeRole === "artist"
              ? "border-primary bg-primary/10 shadow-glow-raven"
              : "border-border/30 bg-card/20 backdrop-blur-sm hover:border-primary/50 hover:bg-primary/5"
          }`}
          whileHover={{ scale: 1.03, y: -5 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Ambient glow */}
          <motion.div 
            className="absolute inset-0 rounded-3xl pointer-events-none"
            animate={{
              boxShadow: activeRole === "artist" 
                ? "0 0 60px hsl(262 83% 58% / 0.4), inset 0 0 30px hsl(262 83% 58% / 0.1)"
                : "0 0 0px transparent"
            }}
            transition={{ duration: 0.5 }}
          />
          
          {/* Radial gradient background */}
          <div className={`absolute inset-0 rounded-3xl transition-opacity duration-500 ${
            activeRole === "artist" ? "opacity-100" : "opacity-0 group-hover:opacity-50"
          }`} style={{
            background: "radial-gradient(circle at center, hsl(262 83% 58% / 0.2), transparent 70%)"
          }} />
          
          <div className="relative flex flex-col items-center gap-4">
            {/* Character Avatar */}
            <motion.div
              animate={{ 
                y: activeRole === "artist" ? [0, -4, 0] : 0,
              }}
              transition={{ 
                duration: 2.5, 
                repeat: activeRole === "artist" ? Infinity : 0,
                ease: "easeInOut"
              }}
            >
              <CharacterAvatar 
                characterId="jax" 
                size="xl" 
                showGlow={activeRole === "artist"}
              />
            </motion.div>

            {/* Name and Role */}
            <div className="text-center">
              <h3 className="text-xl font-bold text-foreground">{jax.name}</h3>
              <p className="text-sm text-primary font-medium">Artist Path</p>
              <p className="text-xs text-muted-foreground mt-1">Create & Release</p>
            </div>

            {/* Speech Bubble */}
            <AnimatePresence>
              {(hoveredRole === "artist" || activeRole === "artist") && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-48"
                >
                  <div className="relative bg-card/95 backdrop-blur-sm border border-primary/30 rounded-xl px-4 py-2 text-center">
                    {/* Arrow */}
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-card/95" />
                    <p className="text-xs text-muted-foreground italic">
                      "{jax.onboardingQuotes?.[0]}"
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.button>

        {/* Divider */}
        <div className="hidden sm:flex items-center">
          <div className="w-px h-32 bg-gradient-to-b from-transparent via-border/50 to-transparent" />
        </div>

        {/* Rell - Engineer Portal */}
        <motion.button
          onClick={() => onRoleChange("engineer")}
          onMouseEnter={() => setHoveredRole("engineer")}
          onMouseLeave={() => setHoveredRole(null)}
          className={`relative group flex flex-col items-center gap-4 p-6 rounded-3xl border-2 transition-all duration-500 min-w-[220px] ${
            activeRole === "engineer"
              ? "border-[hsl(180_100%_50%)] bg-[hsl(180_100%_50%)]/10 shadow-[0_0_40px_hsl(180_100%_50%_/_0.3)]"
              : "border-border/30 bg-card/20 backdrop-blur-sm hover:border-[hsl(180_100%_50%)]/50 hover:bg-[hsl(180_100%_50%)]/5"
          }`}
          whileHover={{ scale: 1.03, y: -5 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Ambient glow */}
          <motion.div 
            className="absolute inset-0 rounded-3xl pointer-events-none"
            animate={{
              boxShadow: activeRole === "engineer" 
                ? "0 0 60px hsl(180 100% 50% / 0.4), inset 0 0 30px hsl(180 100% 50% / 0.1)"
                : "0 0 0px transparent"
            }}
            transition={{ duration: 0.5 }}
          />
          
          {/* Radial gradient background */}
          <div className={`absolute inset-0 rounded-3xl transition-opacity duration-500 ${
            activeRole === "engineer" ? "opacity-100" : "opacity-0 group-hover:opacity-50"
          }`} style={{
            background: "radial-gradient(circle at center, hsl(180 100% 50% / 0.2), transparent 70%)"
          }} />
          
          <div className="relative flex flex-col items-center gap-4">
            {/* Character Avatar */}
            <motion.div
              animate={{ 
                y: activeRole === "engineer" ? [0, -4, 0] : 0,
              }}
              transition={{ 
                duration: 2.5, 
                repeat: activeRole === "engineer" ? Infinity : 0,
                ease: "easeInOut"
              }}
            >
              <CharacterAvatar 
                characterId="rell" 
                size="xl" 
                showGlow={activeRole === "engineer"}
              />
            </motion.div>

            {/* Name and Role */}
            <div className="text-center">
              <h3 className="text-xl font-bold text-foreground">{rell.name}</h3>
              <p className="text-sm text-[hsl(180_100%_50%)] font-medium">Engineer Path</p>
              <p className="text-xs text-muted-foreground mt-1">Build & Earn</p>
            </div>

            {/* Speech Bubble */}
            <AnimatePresence>
              {(hoveredRole === "engineer" || activeRole === "engineer") && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-48"
                >
                  <div className="relative bg-card/95 backdrop-blur-sm border border-[hsl(180_100%_50%)]/30 rounded-xl px-4 py-2 text-center">
                    {/* Arrow */}
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-card/95" />
                    <p className="text-xs text-muted-foreground italic">
                      "{rell.onboardingQuotes?.[0]}"
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.button>
      </motion.div>
    </div>
  );
};

export default JourneyGateway;
