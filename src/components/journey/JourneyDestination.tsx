import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Rocket, Star, Trophy, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CharacterAvatar } from "@/components/characters";
import { getCharacter } from "@/config/characters";

interface JourneyDestinationProps {
  role: "artist" | "engineer";
}

const JourneyDestination = ({ role }: JourneyDestinationProps) => {
  const navigate = useNavigate();
  
  const characterId = role === "artist" ? "jax" : "rell";
  const character = getCharacter(characterId);
  const accentColor = role === "artist" ? "hsl(262 83% 58%)" : "hsl(180 100% 50%)";

  const content = {
    artist: {
      title: "Ready to Release Your Hit?",
      subtitle: "Join thousands of artists who've transformed their sound",
      cta: "Enter MixClub City",
      secondaryCta: "Sign Up First",
      icon: Rocket,
      quote: "Let's get this bag.",
    },
    engineer: {
      title: "Ready to Build Your Empire?",
      subtitle: "Join elite engineers earning on their own terms",
      cta: "Enter MixClub City",
      secondaryCta: "Sign Up First",
      icon: Trophy,
      quote: "Time to get paid.",
    },
  };

  const { title, subtitle, cta, secondaryCta, icon: Icon, quote } = content[role];

  const handleEnterCity = () => {
    localStorage.setItem('mixclub_role', role);
    navigate('/city');
  };

  const handleSignUp = () => {
    navigate(`/auth?signup=true&role=${role}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative py-20 px-6"
    >
      {/* Celebration particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${10 + (i * 7)}%`,
              top: `${20 + Math.random() * 60}%`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
          >
            <Star 
              className="w-4 h-4" 
              style={{ color: `${accentColor}`, opacity: 0.4 }}
            />
          </motion.div>
        ))}
      </div>

      {/* Destination card */}
      <div className="max-w-2xl mx-auto">
        <motion.div
          className="relative p-8 md:p-12 rounded-3xl border-2 backdrop-blur-md"
          style={{
            borderColor: `${accentColor}50`,
            backgroundColor: `${accentColor}10`,
          }}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          {/* Glow effect */}
          <div 
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{ boxShadow: `0 0 60px ${accentColor}30` }}
          />

          <div className="relative">
            {/* Character avatar with icon */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <motion.div
                initial={{ scale: 0, x: -20 }}
                whileInView={{ scale: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", duration: 0.6, delay: 0.1 }}
              >
                <CharacterAvatar 
                  characterId={characterId} 
                  size="xl" 
                  showGlow={true}
                />
              </motion.div>
              
              <motion.div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: accentColor }}
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", duration: 0.8, delay: 0.2 }}
              >
                <Icon className="w-8 h-8 text-background" />
              </motion.div>
            </div>

            {/* Character quote */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-sm italic text-muted-foreground mb-4 text-center"
            >
              "{quote}" — <span style={{ color: accentColor }}>{character.name}</span>
            </motion.p>

            {/* Content */}
            <h2 className="text-3xl md:text-4xl font-black mb-4 text-foreground text-center">
              {title}
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto text-center">
              {subtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {/* Primary: Enter City */}
              <Button
                size="lg"
                onClick={handleEnterCity}
                className="text-lg px-8 py-6 group"
                style={{
                  backgroundColor: accentColor,
                  boxShadow: `0 0 30px ${accentColor}40`,
                }}
              >
                {cta}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              {/* Secondary: Sign Up */}
              <Button
                size="lg"
                variant="outline"
                onClick={handleSignUp}
                className="text-lg px-8 py-6"
                style={{
                  borderColor: `${accentColor}50`,
                  color: accentColor,
                }}
              >
                {secondaryCta}
              </Button>
            </div>

            {/* Preview teaser */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="text-xs text-muted-foreground mt-6 text-center"
            >
              Explore the city first, or create an account to save your progress
            </motion.p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default JourneyDestination;
