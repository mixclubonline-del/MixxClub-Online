import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders } from '../_shared/cors.ts';
import { DAILY_COINZ_PURCHASE_LIMIT } from '../_shared/constants.ts';

/**
 * Create MixxCoinz Purchase Checkout Session
 * Handles Stripe checkout for MixxCoinz purchases
 */

interface CoinzCheckoutRequest {
  packageId: 'starter' | 'popular' | 'best_value';
  successUrl?: string;
  cancelUrl?: string;
}

// Coinz package definitions
const COINZ_PACKAGES = {
  starter: { name: 'Starter Pack', price_cents: 499, coinz: 500, bonus: 0 },
  popular: { name: 'Popular Pack', price_cents: 999, coinz: 1200, bonus: 200 },
  best_value: { name: 'Best Value Pack', price_cents: 1999, coinz: 2500, bonus: 500 },
};

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[CREATE-COINZ-CHECKOUT] Function started');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Authenticate user using standard getUser()
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const userId = user.id;
    const userEmail = user.email;

    console.log('[CREATE-COINZ-CHECKOUT] User authenticated:', userId);

    const body: CoinzCheckoutRequest = await req.json();
    const { packageId, successUrl, cancelUrl } = body;

    if (!packageId || !COINZ_PACKAGES[packageId]) {
      throw new Error('Invalid package ID');
    }

    const pkg = COINZ_PACKAGES[packageId];

    // Check daily purchase limit using service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: wallet } = await supabaseAdmin
      .from('mixx_wallets')
      .select('daily_purchased, daily_purchased_reset_at')
      .eq('user_id', userId)
      .single();

    // Check if daily limit would be exceeded
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    let dailyPurchased = 0;
    if (wallet && wallet.daily_purchased_reset_at) {
      const resetAt = new Date(wallet.daily_purchased_reset_at);
      if (resetAt >= todayStart) {
        dailyPurchased = wallet.daily_purchased || 0;
      }
    }

    if (dailyPurchased + pkg.coinz > DAILY_COINZ_PURCHASE_LIMIT) {
      throw new Error(`Daily purchase limit of ${DAILY_COINZ_PURCHASE_LIMIT} MixxCoinz would be exceeded`);
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-08-27.basil',
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
    let customerId: string | undefined;

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { user_id: userId },
      });
      customerId = customer.id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: pkg.price_cents,
            product_data: {
              name: pkg.name,
              description: `${pkg.coinz} MixxCoinz${pkg.bonus > 0 ? ` (+${pkg.bonus} bonus)` : ''}`,
              metadata: {
                package_id: packageId,
                coinz_amount: String(pkg.coinz),
              },
            },
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl || `${req.headers.get('origin')}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${req.headers.get('origin')}/economy`,
      metadata: {
        purchase_type: 'coinz',
        package_id: packageId,
        coinz_amount: String(pkg.coinz),
        user_id: userId,
      },
      client_reference_id: userId,
    });

    console.log('[CREATE-COINZ-CHECKOUT] Session created:', session.id);

    return new Response(
      JSON.stringify({
        url: session.url,
        sessionId: session.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[CREATE-COINZ-CHECKOUT] Error:', errorMessage);

    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
