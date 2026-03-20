import { Link, useNavigate } from "react-router-dom";
import { usePrime } from "@/contexts/PrimeContext";
import { motion } from "framer-motion";
import { MixxclubLogo } from "@/components/brand/MixxclubLogo";
import { cn } from "@/lib/utils";
import { GoLiveButton } from "@/components/live/GoLiveButton";
import NotificationCenter from "@/components/NotificationCenter";
import { Button } from "@/components/ui/button";
import { Search, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePublicNavItems } from "@/hooks/useNavItems";
import { useState } from "react";

interface GlobalHeaderProps {
  className?: string;
}

export default function GlobalHeader({ className }: GlobalHeaderProps) {
  const { systemMode, accentColor, networkAwareness } = usePrime();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: navItems = [] } = usePublicNavItems('main');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filter auth-required items when not logged in
  const visibleItems = navItems.filter(item => !item.requires_auth || user);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4 sm:px-6 h-16",
          "bg-background/80 backdrop-blur-xl border-b border-border/50",
          className
        )}
      >
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center">
            <MixxclubLogo variant="wordmark-only" size="sm" animated={false} />
          </Link>

          {/* Desktop nav links from DB */}
          {visibleItems.length > 0 && (
            <nav className="hidden lg:flex items-center gap-1">
              {visibleItems.slice(0, 6).map(item => (
                <Link
                  key={item.id}
                  to={item.href}
                  target={item.open_in_new_tab ? '_blank' : undefined}
                  rel={item.open_in_new_tab ? 'noopener noreferrer' : undefined}
                  className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/50"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/search')}
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

          {/* Mobile menu toggle */}
          {visibleItems.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9"
              onClick={() => setMobileMenuOpen(v => !v)}
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </header>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && visibleItems.length > 0 && (
        <div className="fixed top-16 inset-x-0 z-30 bg-background/95 backdrop-blur-xl border-b border-border/50 lg:hidden">
          <nav className="flex flex-col px-4 py-3 gap-1">
            {visibleItems.map(item => (
              <Link
                key={item.id}
                to={item.href}
                target={item.open_in_new_tab ? '_blank' : undefined}
                rel={item.open_in_new_tab ? 'noopener noreferrer' : undefined}
                className="px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/50"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
