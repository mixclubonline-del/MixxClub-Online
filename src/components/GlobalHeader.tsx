import { Link } from "react-router-dom";
import { usePrime } from "@/contexts/PrimeContext";
import { motion } from "framer-motion";
import { MixxclubLogo } from "@/components/brand/MixxclubLogo";
import { PrimeCharacter } from "@/components/prime/PrimeCharacter";
import { Activity, Users } from "lucide-react";

export default function GlobalHeader() {
  const { systemMode, accentColor, networkAwareness, audioState } = usePrime();
  
  const modeColors: Record<string, string> = {
    active: 'hsl(142 76% 36%)',
    processing: 'hsl(43 100% 50%)',
    syncing: 'hsl(217 91% 60%)',
    idle: 'hsl(var(--muted-foreground))'
  };

  return (
    <header className="fixed top-0 inset-x-0 z-40 flex items-center justify-between px-6 h-20 bg-[hsl(var(--card)/0.3)] backdrop-blur-2xl border-b border-[hsl(var(--border)/0.3)] shadow-[0_8px_32px_hsl(var(--background)/0.8)]">
      {/* Left: Logo + Prime Character */}
      <div className="flex items-center gap-4">
        {/* Mini Prime Character */}
        <div className="w-12 h-12 relative">
          <PrimeCharacter size="mini" showParticles={false} showRings={false} />
        </div>
        
        <Link to="/" className="flex items-center hover:scale-105 transition-transform">
          <MixxclubLogo variant="wordmark-only" size="sm" animated={false} />
        </Link>
      </div>

      {/* Right: Status Indicators */}
      <div className="flex items-center gap-6">
        {/* Audio State Indicator */}
        {audioState.isPlaying && (
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-0.5 rounded-full bg-[hsl(var(--accent-cyan))]"
                  animate={{
                    height: [8, 16, 8],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                />
              ))}
            </div>
            <span className="text-xs font-mono text-muted-foreground hidden md:inline">
              AUDIO
            </span>
          </motion.div>
        )}

        {/* System Mode Badge */}
        <motion.div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-[hsl(var(--border)/0.4)]"
          animate={{
            borderColor: [
              `${modeColors[systemMode]}40`,
              `${modeColors[systemMode]}80`,
              `${modeColors[systemMode]}40`,
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: modeColors[systemMode] }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [1, 0.5, 1]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <Activity className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs font-mono text-muted-foreground hidden md:inline">
            {systemMode.toUpperCase()}
          </span>
        </motion.div>

        {/* Network Awareness */}
        <motion.div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-[hsl(var(--border)/0.4)]"
          whileHover={{ scale: 1.05 }}
        >
          <Users className="w-3 h-3 text-[hsl(var(--accent-cyan))]" />
          <span className="text-xs font-mono font-bold text-foreground">
            {networkAwareness.activeUsers}
          </span>
          <span className="text-xs font-mono text-muted-foreground hidden md:inline">
            ONLINE
          </span>
        </motion.div>

        {/* Prime Status Glow */}
        <motion.div
          className="w-8 h-8 rounded-full"
          style={{
            background: `radial-gradient(circle, ${accentColor}40, transparent)`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
    </header>
  );
}
