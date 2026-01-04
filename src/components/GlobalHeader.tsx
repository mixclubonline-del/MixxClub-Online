import { Link } from "react-router-dom";
import { usePrime } from "@/contexts/PrimeContext";
import { motion } from "framer-motion";
import { MixxclubLogo } from "@/components/brand/MixxclubLogo";
import { cn } from "@/lib/utils";

interface GlobalHeaderProps {
  className?: string;
}

export default function GlobalHeader({ className }: GlobalHeaderProps) {
  const { systemMode, accentColor, networkAwareness } = usePrime();
  
  return (
    <header 
      className={cn(
        "fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4 sm:px-6 h-16",
        "bg-background/80 backdrop-blur-xl border-b border-border/50",
        className
      )}
    >
      <Link to="/" className="flex items-center">
        <MixxclubLogo variant="wordmark-only" size="sm" animated={false} />
      </Link>
      <motion.div 
        className="hidden sm:flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-full border border-border/50 bg-muted/50"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 3, repeat: Infinity }}
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
