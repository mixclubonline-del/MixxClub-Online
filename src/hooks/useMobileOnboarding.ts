import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { supabase } from '@/integrations/supabase/client';
import { AppRole } from '@/hooks/useAuthWizard';

const STORAGE_KEY = 'mobile_onboarding_complete';

interface MobileOnboardingState {
  shouldShow: boolean;
  isLoading: boolean;
  completeOnboarding: (
    role: AppRole,
    displayName: string,
    username: string
  ) => Promise<void>;
}

export function useMobileOnboarding(): MobileOnboardingState {
  const { user, userRoles, refreshRoles } = useAuth();
  const { isPhone } = useBreakpoint();
  const [shouldShow, setShouldShow] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !isPhone) {
      setShouldShow(false);
      setIsLoading(false);
      return;
    }

    // Already completed
    if (localStorage.getItem(STORAGE_KEY)) {
      setShouldShow(false);
      setIsLoading(false);
      return;
    }

    // Has roles already → no onboarding needed
    if (userRoles.length > 0) {
      localStorage.setItem(STORAGE_KEY, 'true');
      setShouldShow(false);
      setIsLoading(false);
      return;
    }

    // New user on phone with no roles → show onboarding
    setShouldShow(true);
    setIsLoading(false);
  }, [user, isPhone, userRoles]);

  const completeOnboarding = async (
    role: AppRole,
    displayName: string,
    username: string
  ) => {
    if (!user) return;

    // Insert role
    await supabase.from('user_roles').insert({
      user_id: user.id,
      role,
    });

    // Update profile
    await supabase
      .from('profiles')
      .update({
        display_name: displayName,
        username,
        onboarding_completed: true,
      })
      .eq('id', user.id);

    // Refresh auth context
    await refreshRoles();

    // Mark complete
    localStorage.setItem(STORAGE_KEY, 'true');
    setShouldShow(false);
  };

  return { shouldShow, isLoading, completeOnboarding };
}
