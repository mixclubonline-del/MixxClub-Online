import { motion } from "framer-motion";
import { Music, Headphones } from "lucide-react";

interface JourneyGatewayProps {
  activeRole: "artist" | "engineer";
  onRoleChange: (role: "artist" | "engineer") => void;
}

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
          Choose your path through MixClub City
        </p>
      </motion.div>

      {/* Gateway portals */}
      <motion.div 
        className="flex flex-col sm:flex-row gap-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {/* Artist Portal */}
        <motion.button
          onClick={() => onRoleChange("artist")}
          className={`relative group p-8 rounded-2xl border-2 transition-all duration-500 min-w-[200px] ${
            activeRole === "artist"
              ? "border-primary bg-primary/20 shadow-glow-raven"
              : "border-border/50 bg-card/30 backdrop-blur-sm hover:border-primary/50"
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className={`absolute inset-0 rounded-2xl transition-opacity duration-500 ${
            activeRole === "artist" ? "opacity-100" : "opacity-0"
          }`} style={{
            background: "radial-gradient(circle at center, hsl(262 83% 58% / 0.3), transparent 70%)"
          }} />
          
          <div className="relative flex flex-col items-center gap-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${
              activeRole === "artist"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground group-hover:bg-primary/20"
            }`}>
              <Music className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">Artist Path</h3>
              <p className="text-sm text-muted-foreground">Create & Release</p>
            </div>
          </div>
        </motion.button>

        {/* Divider */}
        <div className="hidden sm:flex items-center">
          <div className="w-px h-24 bg-gradient-to-b from-transparent via-border to-transparent" />
        </div>

        {/* Engineer Portal */}
        <motion.button
          onClick={() => onRoleChange("engineer")}
          className={`relative group p-8 rounded-2xl border-2 transition-all duration-500 min-w-[200px] ${
            activeRole === "engineer"
              ? "border-[hsl(180_100%_50%)] bg-[hsl(180_100%_50%)]/20 shadow-[0_0_30px_hsl(180_100%_50%_/_0.3)]"
              : "border-border/50 bg-card/30 backdrop-blur-sm hover:border-[hsl(180_100%_50%)]/50"
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className={`absolute inset-0 rounded-2xl transition-opacity duration-500 ${
            activeRole === "engineer" ? "opacity-100" : "opacity-0"
          }`} style={{
            background: "radial-gradient(circle at center, hsl(180 100% 50% / 0.3), transparent 70%)"
          }} />
          
          <div className="relative flex flex-col items-center gap-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${
              activeRole === "engineer"
                ? "bg-[hsl(180_100%_50%)] text-background"
                : "bg-muted text-muted-foreground group-hover:bg-[hsl(180_100%_50%)]/20"
            }`}>
              <Headphones className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">Engineer Path</h3>
              <p className="text-sm text-muted-foreground">Build & Earn</p>
            </div>
          </div>
        </motion.button>
      </motion.div>
    </div>
  );
};

export default JourneyGateway;
