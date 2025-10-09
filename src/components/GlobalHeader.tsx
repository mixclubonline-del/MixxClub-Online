import { Link } from "react-router-dom";
import { usePrime } from "@/contexts/PrimeContext";
import { motion } from "framer-motion";

export default function GlobalHeader() {
  const { systemMode, accentColor, networkAwareness } = usePrime();
  
  return (
    <header className="fixed top-0 inset-x-0 z-40 flex items-center justify-between px-6 h-16 bg-[hsl(var(--card)/0.5)] backdrop-blur-xl border-b border-[hsl(var(--border)/0.4)]">
      <Link to="/" className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent-blue))]">
        Mixx Club
      </Link>
      <motion.div 
        className="flex items-center gap-2 text-xs font-mono"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div 
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: accentColor }}
        />
        <span className="text-muted-foreground">
          PRIME: {systemMode.toUpperCase()} • {networkAwareness.activeUsers} ONLINE
        </span>
      </motion.div>
    </header>
  );
}
