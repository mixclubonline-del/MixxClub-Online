/**
 * HomeOverlayNav — Floating navigation overlay for the SceneFlow home page.
 * Provides visitors access to key public pages (Pricing, How It Works, roles, Auth)
 * without breaking the immersive atmosphere.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import mixclub3DLogo from '@/assets/mixclub-3d-logo.png';

const PUBLIC_LINKS = [
  { label: 'How It Works', path: '/how-it-works' },
  { label: 'For Artists', path: '/for-artists' },
  { label: 'For Engineers', path: '/for-engineers' },
  { label: 'For Producers', path: '/for-producers' },
  { label: 'For Fans', path: '/for-fans' },
  { label: 'Pricing', path: '/pricing' },
  { label: 'About', path: '/about' },
  { label: 'FAQ', path: '/faq' },
];

export function HomeOverlayNav() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Top bar — always visible, glassmorphism */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 h-14 bg-gradient-to-b from-background/60 to-transparent"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <img src={mixclub3DLogo} alt="MixxClub" className="w-8 h-6 object-contain" />
          <span className="font-black text-sm tracking-wider text-foreground/80 group-hover:text-foreground transition-colors">
            MIXXCLUB
          </span>
        </Link>

        {/* Center: Desktop links */}
        <nav className="hidden md:flex items-center gap-1">
          {PUBLIC_LINKS.slice(0, 4).map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-foreground/5 transition-all"
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/pricing"
            className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-foreground/5 transition-all"
          >
            Pricing
          </Link>
        </nav>

        {/* Right: Auth + Menu */}
        <div className="flex items-center gap-2">
          {user ? (
            <Button asChild size="sm" variant="outline" className="h-8 text-xs border-border/40 bg-background/30 backdrop-blur-sm">
              <Link to="/dashboard">Dashboard →</Link>
            </Button>
          ) : (
            <>
              <Button asChild size="sm" variant="ghost" className="h-8 text-xs text-muted-foreground hover:text-foreground hidden sm:inline-flex">
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button asChild size="sm" className="h-8 text-xs">
                <Link to="/choose-path">Get Started</Link>
              </Button>
            </>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </motion.header>

      {/* Mobile slide-down menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed top-14 left-0 right-0 z-40 md:hidden bg-background/95 backdrop-blur-xl border-b border-border/30"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <nav className="flex flex-col p-4 gap-1">
              {PUBLIC_LINKS.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-foreground/5 transition-all"
                >
                  {link.label}
                </Link>
              ))}
              {!user && (
                <Link
                  to="/auth"
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-3 text-sm font-medium text-primary hover:text-primary/80 rounded-lg hover:bg-primary/5 transition-all"
                >
                  Sign In
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
