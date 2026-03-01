/**
 * PublicPageLayout — Consistent navigation wrapper for all public pages.
 * 
 * Used by: /about, /faq, /pricing, /how-it-works, /for-artists,
 *          /for-engineers, /for-producers, /for-fans
 * 
 * The hallway is nav-free by design. Once visitors click through to
 * any public page, they get this persistent nav bar with links to
 * all other public pages, sign in, and get started.
 */

import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { MixxclubLogo } from '@/components/brand/MixxclubLogo';

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

export function PublicPageLayout() {
    const { user } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();

    return (
        <>
            {/* Sticky nav bar */}
            <motion.header
                className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 h-14 bg-background/80 backdrop-blur-xl border-b border-border/20"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {/* Left: Logo → home */}
                <Link to="/" className="flex items-center gap-2 shrink-0" aria-label="Back to hallway">
                    <MixxclubLogo variant="symbol-only" size="sm" animated={false} />
                </Link>

                {/* Center: Desktop links */}
                <nav className="hidden lg:flex items-center gap-0.5 mx-4">
                    {PUBLIC_LINKS.map((link) => {
                        const isActive = location.pathname === link.path;
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${isActive
                                        ? 'text-foreground bg-foreground/10'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Right: Auth + Mobile Menu */}
                <div className="flex items-center gap-2 shrink-0">
                    {user ? (
                        <Button asChild size="sm" variant="outline" className="h-8 text-xs border-border/40">
                            <Link to="/dashboard">Dashboard →</Link>
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
                        className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all"
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
                        className="fixed top-14 left-0 right-0 z-40 lg:hidden bg-background/95 backdrop-blur-xl border-b border-border/30"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <nav className="flex flex-col p-4 gap-1">
                            {PUBLIC_LINKS.map((link) => {
                                const isActive = location.pathname === link.path;
                                return (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        onClick={() => setMenuOpen(false)}
                                        className={`px-4 py-3 text-sm font-medium rounded-lg transition-all ${isActive
                                                ? 'text-foreground bg-foreground/10'
                                                : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
                                            }`}
                                    >
                                        {link.label}
                                    </Link>
                                );
                            })}
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

            {/* Page content */}
            <main>
                <Outlet />
            </main>
        </>
    );
}
