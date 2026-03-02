import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Rocket, Trophy, Star, Disc3, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { JourneyRole } from "./JourneyGateway";

interface JourneyDestinationProps {
  role: JourneyRole;
}

const roleContent: Record<JourneyRole, {
  title: string;
  subtitle: string;
  cta: string;
  icon: typeof Rocket;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
  glowClass: string;
  btnClass: string;
}> = {
  artist: {
    title: "Ready to Release Your Hit?",
    subtitle: "Join thousands of artists who've transformed their sound",
    cta: "Start Your Journey",
    icon: Rocket,
    accentColor: "hsl(var(--primary))",
    accentBg: "bg-primary/10",
    accentBorder: "border-primary/50",
    glowClass: "shadow-glow-raven",
    btnClass: "shadow-glow-raven",
  },
  engineer: {
    title: "Ready to Build Your Empire?",
    subtitle: "Join elite engineers earning on their own terms",
    cta: "Claim Your Spot",
    icon: Trophy,
    accentColor: "hsl(180 100% 50%)",
    accentBg: "bg-[hsl(180_100%_50%)]/10",
    accentBorder: "border-[hsl(180_100%_50%)]/50",
    glowClass: "shadow-[0_0_60px_hsl(180_100%_50%_/_0.3)]",
    btnClass: "bg-[hsl(180_100%_50%)] hover:bg-[hsl(180_100%_45%)] text-background shadow-[0_0_30px_hsl(180_100%_50%_/_0.3)]",
  },
  producer: {
    title: "Ready to Monetize Your Catalog?",
    subtitle: "Turn your beats into a passive income engine",
    cta: "List Your First Beat",
    icon: Disc3,
    accentColor: "hsl(45 90% 50%)",
    accentBg: "bg-[hsl(45_90%_50%)]/10",
    accentBorder: "border-[hsl(45_90%_50%)]/50",
    glowClass: "shadow-[0_0_60px_hsl(45_90%_50%_/_0.3)]",
    btnClass: "bg-[hsl(45_90%_50%)] hover:bg-[hsl(45_90%_45%)] text-background shadow-[0_0_30px_hsl(45_90%_50%_/_0.3)]",
  },
  fan: {
    title: "Ready to Shape the Sound?",
    subtitle: "Discover unreleased heat and earn as a tastemaker",
    cta: "Start Discovering",
    icon: Heart,
    accentColor: "hsl(330 80% 60%)",
    accentBg: "bg-[hsl(330_80%_60%)]/10",
    accentBorder: "border-[hsl(330_80%_60%)]/50",
    glowClass: "shadow-[0_0_60px_hsl(330_80%_60%_/_0.3)]",
    btnClass: "bg-[hsl(330_80%_60%)] hover:bg-[hsl(330_80%_55%)] text-background shadow-[0_0_30px_hsl(330_80%_60%_/_0.3)]",
  },
};

const JourneyDestination = ({ role }: JourneyDestinationProps) => {
  const navigate = useNavigate();
  const { title, subtitle, cta, icon: Icon, accentBg, accentBorder, glowClass, btnClass, accentColor } = roleContent[role];

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
              left: `${10 + i * 7}%`,
              top: `${20 + Math.random() * 60}%`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
          >
            <Star className="w-4 h-4" style={{ color: `${accentColor}66` }} />
          </motion.div>
        ))}
      </div>

      {/* Destination card */}
      <div className="max-w-2xl mx-auto">
        <motion.div
          className={`relative p-8 md:p-12 rounded-3xl border-2 backdrop-blur-md text-center ${accentBorder} ${accentBg}`}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <div className={`absolute inset-0 rounded-3xl ${glowClass}`} />

          <div className="relative">
            <motion.div
              className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: accentColor, color: "hsl(var(--background))" }}
              initial={{ scale: 0, rotate: -180 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", duration: 0.8, delay: 0.2 }}
            >
              <Icon className="w-10 h-10" />
            </motion.div>

            <h2 className="text-3xl md:text-4xl font-black mb-4 text-foreground">
              {title}
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
              {subtitle}
            </p>

            <Button
              size="lg"
              onClick={() => navigate(`/auth?signup=true&role=${role}`)}
              className={`text-lg px-10 py-6 ${btnClass}`}
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
