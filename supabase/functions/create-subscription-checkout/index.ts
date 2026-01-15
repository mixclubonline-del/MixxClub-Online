import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders } from '../_shared/cors.ts';

/**
 * Create Subscription Checkout Session
 * Handles platform subscription purchases (Free, Starter, Pro, Studio)
 */

interface SubscriptionCheckoutRequest {
  planId: string; // UUID from subscription_plans table
  billingInterval?: 'monthly' | 'yearly';
  successUrl?: string;
  cancelUrl?: string;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[SUBSCRIPTION-CHECKOUT] Function started');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Authenticate user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('[SUBSCRIPTION-CHECKOUT] User authenticated:', user.id);

    const body: SubscriptionCheckoutRequest = await req.json();
    const { planId, billingInterval = 'monthly', successUrl, cancelUrl } = body;

    if (!planId) {
      throw new Error('Plan ID is required');
    }

    // Fetch subscription plan
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      throw new Error(`Subscription plan not found: ${planError?.message}`);
    }

    // Free tier doesn't need checkout
    if (plan.plan_name === 'free') {
      // Just create/update the subscription record
      await supabase.from('user_subscriptions').upsert({
        user_id: user.id,
        plan_id: planId,
        status: 'active',
        tier: 'free',
      }, { onConflict: 'user_id' });

      return new Response(
        JSON.stringify({ success: true, redirect: '/dashboard' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-08-27.basil',
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;
    }

    // Determine price based on billing interval
    const price = billingInterval === 'yearly' ? plan.price_yearly : plan.price_monthly;
    const interval = billingInterval === 'yearly' ? 'year' : 'month';

    // Check if we have a Stripe price ID, otherwise create dynamic pricing
    let priceData: any;
    const stripePriceId = billingInterval === 'yearly' 
      ? plan.stripe_price_id_yearly 
      : plan.stripe_price_id_monthly;

    if (stripePriceId) {
      priceData = { price: stripePriceId };
    } else {
      priceData = {
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(price * 100),
          recurring: { interval },
          product_data: {
            name: `${plan.display_name} Plan`,
            description: plan.description,
            metadata: {
              plan_id: planId,
              plan_name: plan.plan_name,
            },
          },
        },
      };
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ ...priceData, quantity: 1 }],
      mode: 'subscription',
      success_url: successUrl || `${req.headers.get('origin')}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${req.headers.get('origin')}/pricing?canceled=true`,
      metadata: {
        user_id: user.id,
        plan_id: planId,
        plan_name: plan.plan_name,
        package_type: 'subscription',
      },
      client_reference_id: user.id,
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan_id: planId,
          plan_name: plan.plan_name,
        },
      },
    });

    console.log('[SUBSCRIPTION-CHECKOUT] Session created:', session.id);

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[SUBSCRIPTION-CHECKOUT] Error:', errorMessage);

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
