/**
 * BackButton — Consistent site-wide back navigation
 * 
 * Smart behavior:
 * - If there's browser history, goes back one page
 * - If no history (direct link/bookmark), navigates to a fallback route
 * - Accepts optional `to` prop to override the destination
 * - Accepts optional `label` for custom text
 * 
 * Positioned as a fixed floating button (top-left) by default,
 * or inline when `floating={false}`.
 */

import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCallback } from 'react';

interface BackButtonProps {
    /** Explicit navigation target (overrides go-back behavior) */
    to?: string;
    /** Label text next to the chevron */
    label?: string;
    /** Whether to position as floating overlay (default) or inline */
    floating?: boolean;
    /** Additional class names */
    className?: string;
}

// Map of routes to sensible "parent" routes for direct-link fallback
const parentRoutes: Record<string, string> = {
    '/for-artists': '/how-it-works',
    '/for-engineers': '/how-it-works',
    '/for-producers': '/how-it-works',
    '/for-fans': '/how-it-works',
    '/auth': '/',
    '/how-it-works': '/',
    '/faq': '/',
    '/pricing': '/',
    '/contact': '/',
    '/about': '/',
    '/press': '/',
    '/waitlist': '/',
    '/showcase': '/',
    '/terms': '/',
    '/privacy': '/',
    '/install': '/',
    '/enterprise': '/',
};

export function BackButton({
    to,
    label = 'Back',
    floating = true,
    className = ''
}: BackButtonProps) {
    const navigate = useNavigate();
    const location = useLocation();

    const handleBack = useCallback(() => {
        if (to) {
            navigate(to);
            return;
        }

        // Check if there's meaningful history to go back to
        // window.history.length > 2 means there's a page before (1 = blank, 2 = current)
        if (window.history.length > 2) {
            navigate(-1);
        } else {
            // No history — use the parent route map or fall back to home
            const fallback = parentRoutes[location.pathname] || '/';
            navigate(fallback);
        }
    }, [to, navigate, location.pathname]);

    if (floating) {
        return (
            <motion.button
                onClick={handleBack}
                className={`fixed top-6 left-6 z-[60] flex items-center gap-1.5
                    px-3 py-2 rounded-full
                    bg-white/10 backdrop-blur-xl border border-white/10
                    text-white/70 hover:text-white hover:bg-white/15
                    transition-all duration-200
                    shadow-lg shadow-black/20
                    ${className}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Go back"
            >
                <ChevronLeft className="w-4 h-4" />
                <span className="text-sm font-medium">{label}</span>
            </motion.button>
        );
    }

    // Inline variant
    return (
        <button
            onClick={handleBack}
            className={`flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors ${className}`}
            aria-label="Go back"
        >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm font-medium">{label}</span>
        </button>
    );
}
