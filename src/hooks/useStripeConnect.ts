import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useStripeConnect = () => {
  const [loading, setLoading] = useState(false);

  const startOnboarding = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('stripe-connect-onboard', {
        body: { return_url: window.location.origin + '/settings?stripe=success' }
      });

      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to start Stripe onboarding');
    } finally {
      setLoading(false);
    }
  };

  return { startOnboarding, loading };
};
