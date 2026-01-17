import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface StripeConnectStatus {
  connected: boolean;
  accountId: string | null;
  payoutsEnabled: boolean;
  chargesEnabled: boolean;
  detailsSubmitted: boolean;
  requirements: {
    currently_due: string[];
    eventually_due: string[];
    pending_verification: string[];
  };
  details: {
    email: string | null;
    bankLast4: string | null;
    status: 'not_connected' | 'pending' | 'enabled' | 'restricted';
  };
}

const defaultStatus: StripeConnectStatus = {
  connected: false,
  accountId: null,
  payoutsEnabled: false,
  chargesEnabled: false,
  detailsSubmitted: false,
  requirements: {
    currently_due: [],
    eventually_due: [],
    pending_verification: [],
  },
  details: {
    email: null,
    bankLast4: null,
    status: 'not_connected',
  },
};

export const useStripeConnect = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<StripeConnectStatus>(defaultStatus);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarding, setIsOnboarding] = useState(false);

  const fetchStatus = useCallback(async () => {
    if (!user) {
      setStatus(defaultStatus);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('get-stripe-connect-status');
      
      if (error) {
        console.error('Error fetching Stripe Connect status:', error);
        setStatus(defaultStatus);
      } else {
        setStatus(data as StripeConnectStatus);
      }
    } catch (err) {
      console.error('Failed to fetch Stripe Connect status:', err);
      setStatus(defaultStatus);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Check for returning from Stripe onboarding
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const setupStatus = urlParams.get('setup');
    
    if (setupStatus === 'complete') {
      toast.success('Stripe Connect setup completed! Verifying your account...');
      fetchStatus();
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (setupStatus === 'refresh') {
      toast.info('Please complete your Stripe Connect setup to receive payouts.');
      fetchStatus();
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [fetchStatus]);

  const startOnboarding = async () => {
    if (!user) {
      toast.error('Please log in to connect your bank account');
      return;
    }

    setIsOnboarding(true);

    try {
      const returnUrl = `${window.location.origin}/engineer-crm?setup=complete`;
      const refreshUrl = `${window.location.origin}/engineer-crm?setup=refresh`;

      const { data, error } = await supabase.functions.invoke('setup-stripe-connect', {
        body: {
          email: user.email,
          returnUrl,
          refreshUrl,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to start Stripe Connect setup');
      }

      if (data?.url) {
        // Redirect to Stripe onboarding
        window.location.href = data.url;
      } else {
        throw new Error('No onboarding URL received');
      }
    } catch (err) {
      console.error('Failed to start Stripe onboarding:', err);
      toast.error('Failed to start bank account setup. Please try again.');
      setIsOnboarding(false);
    }
  };

  const refreshStatus = () => {
    setIsLoading(true);
    fetchStatus();
  };

  return {
    status,
    isLoading,
    isOnboarding,
    startOnboarding,
    refreshStatus,
    isConnected: status.connected,
    canReceivePayouts: status.payoutsEnabled,
    needsSetup: status.connected && !status.detailsSubmitted,
    hasRequirements: status.requirements.currently_due.length > 0,
  };
};
