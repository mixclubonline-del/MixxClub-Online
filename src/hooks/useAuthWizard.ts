import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type AppRole = 'producer' | 'artist' | 'engineer' | 'fan';
export type WizardStep = 'role' | 'email' | 'confirmation';
export type WizardMode = 'signup' | 'login';

export interface AuthWizardState {
  step: WizardStep;
  mode: WizardMode;
  selectedRole: AppRole | null;
  email: string;
  password: string;
  loading: boolean;
  error: string | null;
  resendCooldown: number;
}

const RESEND_COOLDOWN_SECONDS = 60;

export function useAuthWizard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const hasRedirected = useRef(false);

  // Derive initial state from URL params
  const modeParam = searchParams.get('mode') as WizardMode | null;
  const roleParam = searchParams.get('role') as AppRole | null;
  const initMode: WizardMode = modeParam === 'login' ? 'login' : 'signup';
  const validRoles: AppRole[] = ['producer', 'artist', 'engineer', 'fan'];
  const hasPreselectedRole = initMode === 'signup' && roleParam && validRoles.includes(roleParam);
  const initStep: WizardStep = initMode === 'login' ? 'email' : hasPreselectedRole ? 'email' : 'role';

  const [state, setState] = useState<AuthWizardState>({
    step: initStep,
    mode: initMode,
    selectedRole: roleParam,
    email: '',
    password: '',
    loading: false,
    error: null,
    resendCooldown: 0,
  });

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
      }
    };
  }, []);

  /** Redirect authenticated user to their destination */
  const redirectAuthenticatedUser = useCallback(async (userId: string) => {
    if (hasRedirected.current || !isMountedRef.current) return;

    // Check for explicit redirect param first
    const redirectTo = searchParams.get('redirect');

    // Use user_roles table (authoritative source)
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    if (!isMountedRef.current) return;

    let roles: string[] = userRoles?.map(r => r.role as string) || [];

    // If no roles in DB but metadata has a role (new signup), insert it
    if (roles.length === 0) {
      const { data: { user } } = await supabase.auth.getUser();
      const metadataRole = user?.user_metadata?.role;
      if (metadataRole && ['producer', 'artist', 'engineer', 'fan'].includes(metadataRole)) {
        await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: metadataRole })
          .select();
        roles = [metadataRole];
      }
    }

    if (roles.length === 0) {
      navigate('/select-role');
      return;
    }

    // Priority: admin > producer > engineer > artist > fan
    const priority = ['admin', 'producer', 'engineer', 'artist', 'fan'];
    const primaryRole = priority.find(r => roles.includes(r)) || 'fan';

    hasRedirected.current = true;

    // If redirect param exists, use it (e.g., ?redirect=/admin)
    if (redirectTo) {
      navigate(redirectTo);
      return;
    }

    // Admins skip onboarding entirely
    if (primaryRole === 'admin') {
      navigate('/admin');
      return;
    }

    // Check onboarding status for non-admin roles
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', userId)
      .maybeSingle();

    if (!profile?.onboarding_completed) {
      navigate(`/onboarding/${primaryRole}`);
      return;
    }

    const crmMap: Record<string, string> = {
      producer: '/producer-crm',
      engineer: '/engineer-crm',
      fan: '/fan-hub',
      artist: '/artist-crm',
    };
    navigate(crmMap[primaryRole] || '/artist-crm');
  }, [navigate, searchParams]);

  // Check session on mount AND listen for ongoing auth changes (handles OAuth return)
  useEffect(() => {
    // Initial check
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && isMountedRef.current) {
        redirectAuthenticatedUser(session.user.id);
      }
    };
    checkSession();

    // Listen for auth state changes (fires after OAuth redirect completes)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMountedRef.current) return;
        if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          redirectAuthenticatedUser(session.user.id);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [redirectAuthenticatedUser]);

  const setStep = useCallback((step: WizardStep) => {
    setState(prev => ({ ...prev, step, error: null }));
  }, []);

  const setMode = useCallback((mode: WizardMode) => {
    setState(prev => ({
      ...prev,
      mode,
      step: mode === 'login' ? 'email' : 'role',
      error: null
    }));
  }, []);

  const setSelectedRole = useCallback((role: AppRole) => {
    setState(prev => ({ ...prev, selectedRole: role, error: null }));
  }, []);

  const setEmail = useCallback((email: string) => {
    setState(prev => ({ ...prev, email, error: null }));
  }, []);

  const setPassword = useCallback((password: string) => {
    setState(prev => ({ ...prev, password, error: null }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const startResendCooldown = useCallback(() => {
    setState(prev => ({ ...prev, resendCooldown: RESEND_COOLDOWN_SECONDS }));

    cooldownTimerRef.current = setInterval(() => {
      if (!isMountedRef.current) return;

      setState(prev => {
        if (prev.resendCooldown <= 1) {
          if (cooldownTimerRef.current) {
            clearInterval(cooldownTimerRef.current);
            cooldownTimerRef.current = null;
          }
          return { ...prev, resendCooldown: 0 };
        }
        return { ...prev, resendCooldown: prev.resendCooldown - 1 };
      });
    }, 1000);
  }, []);

  const sendMagicLink = useCallback(async () => {
    if (!state.email) {
      setError('Please enter your email address');
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(state.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: state.email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            role: state.selectedRole || 'fan',
          }
        }
      });

      if (error) {
        // Parse common errors
        if (error.message.includes('rate limit') || error.message.includes('too many')) {
          setError('Too many requests. Please wait a few minutes and try again.');
        } else if (error.message.includes('invalid')) {
          setError('Invalid email address. Please check and try again.');
        } else {
          setError(error.message);
        }
        return false;
      }

      // Success - move to confirmation step
      setState(prev => ({ ...prev, step: 'confirmation' }));
      startResendCooldown();
      toast.success('Magic link sent! Check your inbox.');
      return true;
    } catch (err) {
      console.error('Magic link error:', err);
      setError('Failed to send magic link. Please try again.');
      return false;
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [state.email, state.selectedRole, setError, setLoading, startResendCooldown]);

  const resendMagicLink = useCallback(async () => {
    if (state.resendCooldown > 0) return false;
    return sendMagicLink();
  }, [state.resendCooldown, sendMagicLink]);

  // Email + Password auth
  const signInWithEmail = useCallback(async () => {
    if (!state.email) {
      setError('Please enter your email address');
      return false;
    }
    if (!state.password || state.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(state.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      if (state.mode === 'login') {
        // Sign in with existing account
        const { error } = await supabase.auth.signInWithPassword({
          email: state.email,
          password: state.password,
        });
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setError('Invalid email or password. Please try again.');
          } else {
            setError(error.message);
          }
          return false;
        }
        toast.success('Signed in successfully!');
      } else {
        // Sign up new account
        const { error } = await supabase.auth.signUp({
          email: state.email,
          password: state.password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              role: state.selectedRole || 'fan',
            },
          },
        });
        if (error) {
          if (error.message.includes('already registered')) {
            setError('This email is already registered. Try signing in instead.');
          } else {
            setError(error.message);
          }
          return false;
        }
        toast.success('Account created! Check your email to confirm.');
        setState(prev => ({ ...prev, step: 'confirmation' }));
      }
      return true;
    } catch (err) {
      console.error('Email auth error:', err);
      setError('Authentication failed. Please try again.');
      return false;
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [state.email, state.password, state.mode, state.selectedRole, setError, setLoading]);

  const goBack = useCallback(() => {
    setState(prev => {
      if (prev.step === 'confirmation') {
        return { ...prev, step: 'email', error: null };
      }
      if (prev.step === 'email' && prev.mode === 'signup') {
        return { ...prev, step: 'role', error: null };
      }
      // If on role step or login mode email step, go to landing
      return prev;
    });
  }, []);

  const canGoBack = state.step === 'confirmation' || (state.step === 'email' && state.mode === 'signup');
  const preselectedRole = hasPreselectedRole ? roleParam : null;

  const nextStep = useCallback(() => {
    if (state.step === 'role') {
      if (!state.selectedRole) {
        setError('Please select a role to continue');
        return;
      }
      setStep('email');
    } else if (state.step === 'email') {
      sendMagicLink();
    }
  }, [state.step, state.selectedRole, setStep, setError, sendMagicLink]);

  return {
    ...state,
    setStep,
    setMode,
    setSelectedRole,
    setEmail,
    setPassword,
    setError,
    setLoading,
    sendMagicLink,
    signInWithEmail,
    resendMagicLink,
    goBack,
    canGoBack,
    nextStep,
    navigate,
  };
}
