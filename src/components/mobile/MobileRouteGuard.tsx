import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMobileDetect } from '@/hooks/useMobileDetect';
import { useAuth } from '@/hooks/useAuth';

const MOBILE_EXCLUDED_ROUTES = [
  '/auth',
  '/auth/callback',
  '/mobile-landing',
  '/mobile-home',
  '/mobile-admin',
  '/mobile-mixxbot'
];

const MOBILE_OPTIMIZED_ROUTES = [
  '/mobile-home',
  '/mobile-mixxbot',
  '/mobile-admin'
];

export const MobileRouteGuard = () => {
  const { deviceType, isPhone } = useMobileDetect();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Skip during auth loading
    if (loading) return;

    const currentPath = location.pathname;
    
    // Don't redirect if already on excluded routes
    if (MOBILE_EXCLUDED_ROUTES.includes(currentPath)) return;

    // Phone-specific routing: Redirect to mobile-optimized versions for complex pages
    if (isPhone) {
      // Redirect admin routes to mobile-admin for authenticated users
      if (user && currentPath.startsWith('/admin') && currentPath !== '/mobile-admin') {
        navigate('/mobile-admin', { replace: true });
        return;
      }

      // Redirect to mobile home for authenticated users on complex desktop pages
      if (user && (
        currentPath === '/artist-crm' ||
        currentPath === '/engineer-crm' ||
        currentPath === '/dashboard'
      )) {
        navigate('/mobile-home', { replace: true });
        return;
      }

      // Redirect unauthenticated users to mobile landing on homepage
      if (!user && currentPath === '/') {
        navigate('/mobile-landing', { replace: true });
        return;
      }
    }

    // Tablets can access all routes - no redirects needed
    // Desktop gets full experience
  }, [deviceType, isPhone, user, loading, location.pathname, navigate]);

  return null;
};
