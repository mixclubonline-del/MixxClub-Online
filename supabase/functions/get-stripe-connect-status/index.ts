import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';
import Stripe from 'https://esm.sh/stripe@18.5.0';
import { getCorsHeaders } from '../_shared/cors.ts';

interface ConnectStatus {
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

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) throw new Error('Unauthorized');

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('stripe_connect_account_id')
      .eq('id', user.id)
      .single();

    const accountId = profile?.stripe_connect_account_id;

    const defaultStatus: ConnectStatus = {
      connected: false, accountId: null, payoutsEnabled: false, chargesEnabled: false, detailsSubmitted: false,
      requirements: { currently_due: [], eventually_due: [], pending_verification: [] },
      details: { email: null, bankLast4: null, status: 'not_connected' },
    };

    if (!accountId) {
      return new Response(JSON.stringify(defaultStatus), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
      });
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-08-27.basil',
    });

    const account = await stripe.accounts.retrieve(accountId);

    let status: 'not_connected' | 'pending' | 'enabled' | 'restricted' = 'pending';
    if (account.payouts_enabled && account.charges_enabled) status = 'enabled';
    else if (account.requirements?.disabled_reason) status = 'restricted';

    let bankLast4: string | null = null;
    try {
      const externalAccounts = await stripe.accounts.listExternalAccounts(accountId, { object: 'bank_account', limit: 1 });
      if (externalAccounts.data.length > 0) {
        bankLast4 = (externalAccounts.data[0] as Stripe.BankAccount).last4 || null;
      }
    } catch (e) {
      console.log('Could not fetch external accounts:', e);
    }

    const response: ConnectStatus = {
      connected: true, accountId: account.id,
      payoutsEnabled: account.payouts_enabled || false,
      chargesEnabled: account.charges_enabled || false,
      detailsSubmitted: account.details_submitted || false,
      requirements: {
        currently_due: account.requirements?.currently_due || [],
        eventually_due: account.requirements?.eventually_due || [],
        pending_verification: account.requirements?.pending_verification || [],
      },
      details: { email: account.email || null, bankLast4, status },
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
    });
  } catch (error) {
    console.error('Get Stripe Connect status error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
