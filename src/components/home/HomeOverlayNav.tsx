/**
 * HomeOverlayNav — Floating navigation overlay for the SceneFlow home page.
 * Provides visitors access to key public pages (Pricing, How It Works, roles, Auth)
 * without breaking the immersive atmosphere.
 * 
 * - Logo removed: brand lives on the hallway floor (MixxclubLogo floor decal)
 * - Scene-aware: hidden entirely when scene is DEMO or INFO
 * - Full role set: includes For Fans
 */

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useSceneFlowStore } from '@/stores/sceneFlowStore';

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

const AUTHENTICATED_LINKS = [
  { label: 'How It Works', path: '/how-it-works' },
  { label: 'For Artists', path: '/artist-crm' },
  { label: 'For Engineers', path: '/engineer-crm' },
  { label: 'For Producers', path: '/producer-crm' },
  { label: 'For Fans', path: '/fan-hub' },
  { label: 'Pricing', path: '/pricing' },
  { label: 'About', path: '/about' },
  { label: 'FAQ', path: '/faq' },
];

const getRoleHubPath = (userRole?: string | null) => {
  if (userRole === 'admin') return '/admin';
  if (userRole === 'engineer') return '/engineer-crm';
  if (userRole === 'producer') return '/producer-crm';
  if (userRole === 'fan') return '/fan-hub';
  return '/artist-crm';
};

export function HomeOverlayNav() {
  const { user, userRole } = useAuth();
  const { user, activeRole } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const scene = useSceneFlowStore((s) => s.scene);
  const activeLinks = useMemo(() => (user ? AUTHENTICATED_LINKS : PUBLIC_LINKS), [user]);
  const dashboardPath = useMemo(() => getRoleHubPath(userRole), [userRole]);

  const roleRoutes = {
    artist: '/artist-crm',
    engineer: '/engineer-crm',
    producer: '/producer-crm',
    fan: '/fan-hub',
    admin: '/admin-crm',
  } as const;

  const roleAwarePath = (path: string) => {
    if (!user) return path;

    const map: Record<string, string> = {
      '/for-artists': '/artist-crm',
      '/for-engineers': '/engineer-crm',
      '/for-producers': '/producer-crm',
      '/for-fans': '/fan-hub',
    };

    return map[path] || path;
  };

  const dashboardPath = activeRole ? roleRoutes[activeRole] : '/dashboard';

  // Hide entirely during Demo and Club Scene — they have their own internal nav
  if (scene !== 'HALLWAY') return null;

  return (
    <>
      {/* Top bar — always visible during HALLWAY, glassmorphism, no logo */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 h-14 bg-gradient-to-b from-background/60 to-transparent"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {/* Center: Desktop links — all 6 roles, no duplication */}
        <nav className="hidden md:flex items-center gap-1">
          {activeLinks.slice(0, 6).map((link) => (
            <Link
              key={link.path}
              to={roleAwarePath(link.path)}
              className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-foreground/5 transition-all"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: Auth + Mobile Menu */}
        <div className="flex items-center gap-2 ml-auto">
          {user ? (
            <Button asChild size="sm" variant="outline" className="h-8 text-xs border-border/40 bg-background/30 backdrop-blur-sm">
              <Link to={dashboardPath}>Dashboard →</Link>
            </Button>
          ) : (
            <>
              <Button asChild size="sm" variant="ghost" className="h-8 text-xs text-muted-foreground hover:text-foreground hidden sm:inline-flex">
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button asChild size="sm" className="h-8 text-xs">
                <Link to="/how-it-works">Get Started</Link>
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
              {activeLinks.map((link) => (
                <Link
                  key={link.path}
                  to={roleAwarePath(link.path)}
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
