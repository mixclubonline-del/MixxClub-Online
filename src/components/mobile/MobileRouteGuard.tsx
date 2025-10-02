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

export const MobileRouteGuard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile } = useMobileDetect();
  const { user } = useAuth();

  useEffect(() => {
    // Only redirect mobile users on desktop-only routes
    if (!isMobile) return;

    // Don't redirect if already on mobile route
    const isOnMobileRoute = MOBILE_EXCLUDED_ROUTES.some(route => 
      location.pathname.startsWith(route)
    );
    if (isOnMobileRoute) return;

    // Smart mobile routing based on auth status
    const currentPath = location.pathname;
    
    // Landing page redirect
    if (currentPath === '/' && !user) {
      navigate('/mobile-landing', { replace: true });
      return;
    }

    // Dashboard redirects for authenticated users
    if (user && (currentPath === '/' || currentPath === '/dashboard')) {
      navigate('/mobile-home', { replace: true });
    }
  }, [isMobile, location.pathname, user, navigate]);

  return null;
};
