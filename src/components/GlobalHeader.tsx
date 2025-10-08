import { Link } from "react-router-dom";
import { usePrime } from "@/contexts/PrimeContext";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

export default function GlobalHeader() {
  const { systemMode, accentColor, networkAwareness } = usePrime();
  const { user } = useAuth();
  
  return (
    <header className="fixed top-0 inset-x-0 z-40 flex items-center justify-between px-6 h-16 bg-[hsl(var(--card)/0.5)] backdrop-blur-xl border-b border-[hsl(var(--border)/0.4)]">
      <Link to="/" className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent-blue))]">
        MIXXCLUB
      </Link>
      
      <div className="flex items-center gap-6">
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

        {user ? (
          <Button asChild variant="outline" size="sm">
            <Link to="/dashboard" className="flex items-center gap-2">
              <User size={16} />
              Dashboard
            </Link>
          </Button>
        ) : (
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth">Log In</Link>
            </Button>
            <Button asChild size="sm" className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700">
              <Link to="/auth">Sign Up</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
