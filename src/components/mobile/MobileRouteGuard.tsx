import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useMobileDetect } from '@/hooks/useMobileDetect';
import { useAuth } from '@/hooks/useAuth';
import { useFlowNavigation } from '@/core/fabric/useFlow';

const MOBILE_EXCLUDED_ROUTES = [
  '/auth',
  '/auth/callback',
  '/insider-demo',
  '/mixxclub-demo',
  '/city-gates'
];

export const MobileRouteGuard = () => {
  const { isPhone } = useMobileDetect();
  const { user, loading } = useAuth();
  const { navigateTo } = useFlowNavigation();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;

    const currentPath = location.pathname;
    
    // Don't redirect if on excluded routes
    if (MOBILE_EXCLUDED_ROUTES.some(route => currentPath.startsWith(route))) return;

    // Phone-specific: ensure mobile-friendly pages are used
    if (isPhone && user) {
      // Redirect complex desktop admin to simpler mobile version
      if (currentPath.startsWith('/admin') && !currentPath.includes('mobile')) {
        // Admin pages work on mobile with bottom nav, no redirect needed
        return;
      }
    }

    // No aggressive redirects - let users browse freely
    // The MobileBottomNav provides easy navigation
  }, [isPhone, user, loading, location.pathname, navigateTo]);

  return null;
};
