import { motion } from "framer-motion";
import { Music, Headphones, Disc3, Heart } from "lucide-react";

export type JourneyRole = "artist" | "engineer" | "producer" | "fan";

interface JourneyGatewayProps {
  activeRole: JourneyRole;
  onRoleChange: (role: JourneyRole) => void;
}

const roles: {
  id: JourneyRole;
  icon: typeof Music;
  label: string;
  tagline: string;
  color: string;
  glowColor: string;
  bgActive: string;
  borderActive: string;
  hoverBorder: string;
  iconBg: string;
}[] = [
  {
    id: "artist",
    icon: Music,
    label: "Artist Path",
    tagline: "Create & Release",
    color: "hsl(var(--primary))",
    glowColor: "hsl(262 83% 58% / 0.3)",
    bgActive: "bg-primary/20",
    borderActive: "border-primary",
    hoverBorder: "hover:border-primary/50",
    iconBg: "bg-primary text-primary-foreground",
  },
  {
    id: "engineer",
    icon: Headphones,
    label: "Engineer Path",
    tagline: "Build & Earn",
    color: "hsl(180 100% 50%)",
    glowColor: "hsl(180 100% 50% / 0.3)",
    bgActive: "bg-[hsl(180_100%_50%)]/20",
    borderActive: "border-[hsl(180_100%_50%)]",
    hoverBorder: "hover:border-[hsl(180_100%_50%)]/50",
    iconBg: "bg-[hsl(180_100%_50%)] text-background",
  },
  {
    id: "producer",
    icon: Disc3,
    label: "Producer Path",
    tagline: "Supply the Sound",
    color: "hsl(45 90% 50%)",
    glowColor: "hsl(45 90% 50% / 0.3)",
    bgActive: "bg-[hsl(45_90%_50%)]/20",
    borderActive: "border-[hsl(45_90%_50%)]",
    hoverBorder: "hover:border-[hsl(45_90%_50%)]/50",
    iconBg: "bg-[hsl(45_90%_50%)] text-background",
  },
  {
    id: "fan",
    icon: Heart,
    label: "Fan Path",
    tagline: "Discover & Invest",
    color: "hsl(330 80% 60%)",
    glowColor: "hsl(330 80% 60% / 0.3)",
    bgActive: "bg-[hsl(330_80%_60%)]/20",
    borderActive: "border-[hsl(330_80%_60%)]",
    hoverBorder: "hover:border-[hsl(330_80%_60%)]/50",
    iconBg: "bg-[hsl(330_80%_60%)] text-background",
  },
];

const JourneyGateway = ({ activeRole, onRoleChange }: JourneyGatewayProps) => {
  return (
    <div className="flex flex-col items-center gap-8 pt-24 pb-12">
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
          Choose your path through the MixxClub ecosystem
        </p>
      </motion.div>

      {/* Gateway portals — 2x2 on mobile, 4-across on desktop */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 w-full max-w-3xl px-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {roles.map((role, i) => {
          const isActive = activeRole === role.id;
          const Icon = role.icon;

          return (
            <motion.button
              key={role.id}
              onClick={() => onRoleChange(role.id)}
              className={`relative group p-6 rounded-2xl border-2 transition-all duration-500 ${
                isActive
                  ? `${role.borderActive} ${role.bgActive}`
                  : `border-border/50 bg-card/30 backdrop-blur-sm ${role.hoverBorder}`
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              style={
                isActive
                  ? { boxShadow: `0 0 30px ${role.glowColor}` }
                  : undefined
              }
            >
              {/* Radial glow */}
              <div
                className={`absolute inset-0 rounded-2xl transition-opacity duration-500 ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
                style={{
                  background: `radial-gradient(circle at center, ${role.glowColor}, transparent 70%)`,
                }}
              />

              <div className="relative flex flex-col items-center gap-3">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 ${
                    isActive
                      ? role.iconBg
                      : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                  }`}
                >
                  <Icon className="w-7 h-7" />
                </div>
                <div className="text-center">
                  <h3 className="text-base font-bold text-foreground leading-tight">
                    {role.label}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {role.tagline}
                  </p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
};

export default JourneyGateway;
