import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useMobileOnboarding } from '@/hooks/useMobileOnboarding';
import { MobileOnboardingFlow } from './MobileOnboardingFlow';
import { useLocation } from 'react-router-dom';

// Public routes where onboarding tour should never appear
const PUBLIC_ROUTES = ['/', '/for-artists', '/for-engineers', '/for-producers', '/for-fans', '/auth', '/home', '/how-it-works', '/showcase', '/faq', '/pricing', '/contact', '/about', '/press', '/waitlist', '/install', '/enterprise'];

export const AppOnboarding = () => {
  const { isPhone } = useBreakpoint();
  const { shouldShow, isLoading } = useMobileOnboarding();
  const location = useLocation();

  // Never render on public marketing pages
  const isPublicRoute = PUBLIC_ROUTES.some(route => location.pathname === route || location.pathname.startsWith('/for-'));
  if (isPublicRoute) return null;

  // Only render on phone for new users without roles
  if (!isPhone || isLoading || !shouldShow) return null;

  return <MobileOnboardingFlow />;
};
