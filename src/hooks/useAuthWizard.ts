import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  loading: boolean;
  error: string | null;
  resendCooldown: number;
}

const RESEND_COOLDOWN_SECONDS = 60;

export function useAuthWizard() {
  const navigate = useNavigate();
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const [state, setState] = useState<AuthWizardState>({
    step: 'role',
    mode: 'signup',
    selectedRole: null,
    email: '',
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

  // Check if user is already authenticated — redirect to their CRM
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user || !isMountedRef.current) return;

      // Look up user's role to route them correctly
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, onboarding_completed')
        .eq('id', session.user.id)
        .single();

      const role = profile?.role;
      if (!role) {
        navigate('/select-role');
        return;
      }

      if (!profile?.onboarding_completed) {
        navigate(`/onboarding/${role}`);
        return;
      }

      const crmMap: Record<string, string> = {
        producer: '/producer-crm',
        engineer: '/engineer-crm',
        fan: '/fan-hub',
        artist: '/artist-crm',
      };
      navigate(crmMap[role] || '/artist-crm');
    };
    checkSession();
  }, [navigate]);

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
    setError,
    setLoading,
    sendMagicLink,
    resendMagicLink,
    goBack,
    canGoBack,
    nextStep,
    navigate,
  };
}
