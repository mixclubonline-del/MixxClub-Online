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
  // Mobile route guard disabled - users can access all routes on mobile
  // The website is fully responsive and works on mobile devices
  return null;
};
