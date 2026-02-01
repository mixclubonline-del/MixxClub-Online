import { Link } from "react-router-dom";
import { useFlowNavigation } from "@/core/fabric/useFlow";
import { usePrime } from "@/contexts/PrimeContext";
import { motion } from "framer-motion";
import { MixxclubLogo } from "@/components/brand/MixxclubLogo";
import { cn } from "@/lib/utils";
import { GoLiveButton } from "@/components/live/GoLiveButton";
import NotificationCenter from "@/components/NotificationCenter";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface GlobalHeaderProps {
  className?: string;
}

export default function GlobalHeader({ className }: GlobalHeaderProps) {
  const { systemMode, accentColor, networkAwareness } = usePrime();
  const { user } = useAuth();
  const { navigateTo } = useFlowNavigation();
  
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
      <div className="flex items-center gap-2 sm:gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigateTo('/search')}
          className="h-9 w-9"
        >
          <Search className="h-4 w-4" />
        </Button>
        {user && <NotificationCenter />}
        <GoLiveButton className="hidden sm:flex" />
        <motion.div 
          className="hidden lg:flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-full border border-border/50 bg-muted/50"
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
      </div>
    </header>
  );
}
