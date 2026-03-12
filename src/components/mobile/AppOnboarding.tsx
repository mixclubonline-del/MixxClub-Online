import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useMobileOnboarding } from '@/hooks/useMobileOnboarding';
import { MobileOnboardingFlow } from './MobileOnboardingFlow';

export const AppOnboarding = () => {
  const { isPhone } = useBreakpoint();
  const { shouldShow, isLoading } = useMobileOnboarding();

  // Only render on phone for new users without roles
  if (!isPhone || isLoading || !shouldShow) return null;

  return <MobileOnboardingFlow />;
};
