import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Rocket, Star, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface JourneyDestinationProps {
  role: "artist" | "engineer";
}

const JourneyDestination = ({ role }: JourneyDestinationProps) => {
  const navigate = useNavigate();

  const content = {
    artist: {
      title: "Ready to Release Your Hit?",
      subtitle: "Join thousands of artists who've transformed their sound",
      cta: "Start Your Journey",
      icon: Rocket,
    },
    engineer: {
      title: "Ready to Build Your Empire?",
      subtitle: "Join elite engineers earning on their own terms",
      cta: "Claim Your Spot",
      icon: Trophy,
    },
  };

  const { title, subtitle, cta, icon: Icon } = content[role];
  const accentColor = role === "artist" ? "primary" : "[hsl(180_100%_50%)]";

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
            <Star className={`w-4 h-4 text-${accentColor}/40`} />
          </motion.div>
        ))}
      </div>

      {/* Destination card */}
      <div className="max-w-2xl mx-auto">
        <motion.div
          className={`relative p-8 md:p-12 rounded-3xl border-2 backdrop-blur-md text-center ${
            role === "artist"
              ? "border-primary/50 bg-primary/10"
              : "border-[hsl(180_100%_50%)]/50 bg-[hsl(180_100%_50%)]/10"
          }`}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          {/* Glow effect */}
          <div className={`absolute inset-0 rounded-3xl ${
            role === "artist"
              ? "shadow-glow-raven"
              : "shadow-[0_0_60px_hsl(180_100%_50%_/_0.3)]"
          }`} />

          <div className="relative">
            {/* Icon */}
            <motion.div
              className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
                role === "artist"
                  ? "bg-primary text-primary-foreground"
                  : "bg-[hsl(180_100%_50%)] text-background"
              }`}
              initial={{ scale: 0, rotate: -180 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", duration: 0.8, delay: 0.2 }}
            >
              <Icon className="w-10 h-10" />
            </motion.div>

            {/* Content */}
            <h2 className="text-3xl md:text-4xl font-black mb-4 text-foreground">
              {title}
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
              {subtitle}
            </p>

            {/* CTA */}
            <Button
              size="lg"
              onClick={() => navigate(`/auth?signup=true&role=${role}`)}
              className={`text-lg px-10 py-6 ${
                role === "artist"
                  ? "shadow-glow-raven"
                  : "bg-[hsl(180_100%_50%)] hover:bg-[hsl(180_100%_45%)] text-background shadow-[0_0_30px_hsl(180_100%_50%_/_0.3)]"
              }`}
            >
              {cta}
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default JourneyDestination;
