import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreatePaymentLinkParams {
  amount: number;
  currency?: string;
  description: string;
  metadata?: Record<string, string>;
  partnershipId?: string;
  recipientId?: string;
}

interface CreateCheckoutParams {
  packageId: string;
  packageType: 'mastering' | 'mixing' | 'distribution' | 'addon';
  successUrl?: string;
  cancelUrl?: string;
}

export function usePaymentLink() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createShareableLink = async (params: CreatePaymentLinkParams) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-shareable-payment-link', {
        body: params,
      });

      if (error) throw error;

      toast({
        title: 'Payment Link Created',
        description: 'Share this link to receive payments',
      });

      return data;
    } catch (error) {
      console.error('Error creating payment link:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create payment link',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createCheckoutSession = async (params: CreateCheckoutParams) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment-checkout', {
        body: params,
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe checkout in new tab
        window.open(data.url, '_blank');
      }

      return data;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create checkout session',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Copied!',
        description: 'Payment link copied to clipboard',
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        title: 'Error',
        description: 'Failed to copy link',
        variant: 'destructive',
      });
    }
  };

  return {
    loading,
    createShareableLink,
    createCheckoutSession,
    copyToClipboard,
  };
}
