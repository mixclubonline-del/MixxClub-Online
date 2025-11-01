import { Link } from "react-router-dom";
import { usePrime } from "@/contexts/PrimeContext";
import { motion } from "framer-motion";
import { MixxclubLogo } from "@/components/brand/MixxclubLogo";

export default function GlobalHeader() {
  const { systemMode, accentColor, networkAwareness } = usePrime();
  
  return (
    <header className="fixed top-0 inset-x-0 z-40 flex items-center justify-between px-6 h-16 glass-mid border-b border-[hsl(var(--glass-border))] animate-glass-breathe">
      <Link to="/" className="flex items-center">
        <MixxclubLogo variant="wordmark-only" size="sm" animated={false} />
      </Link>
      <motion.div 
        className="glass-pill flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-full border border-[hsl(var(--glass-border))]"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div 
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ 
            backgroundColor: accentColor,
            boxShadow: `0 0 8px ${accentColor}`
          }}
        />
        <span className="text-muted-foreground">
          PRIME: {systemMode.toUpperCase()} • {networkAwareness.activeUsers} ONLINE
        </span>
      </motion.div>
    </header>
  );
}
