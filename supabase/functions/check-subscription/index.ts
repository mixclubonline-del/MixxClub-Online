import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders } from '../_shared/cors.ts';

/**
 * Check Subscription Status
 * Queries Stripe for the authenticated user's active subscription.
 * Returns: { subscribed, product_id, subscription_end, tier }
 */

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

// Map Stripe product IDs to internal tier names
// These will be matched against subscription_plans.plan_name
const TIER_MAP: Record<string, string> = {
  // Will be resolved dynamically from subscription metadata
};

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Function started');

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) throw new Error('STRIPE_SECRET_KEY is not set');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header provided');

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error('User not authenticated or email not available');
    logStep('User authenticated', { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: '2025-08-27.basil' });

    // Find Stripe customer by email
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      logStep('No Stripe customer found');
      return new Response(
        JSON.stringify({ subscribed: false, product_id: null, subscription_end: null, tier: 'free' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const customerId = customers.data[0].id;
    logStep('Found Stripe customer', { customerId });

    // Store stripe_customer_id on profile if not already set
    await supabaseClient
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id)
      .is('stripe_customer_id', null);

    // Query active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      logStep('No active subscription');
      return new Response(
        JSON.stringify({ subscribed: false, product_id: null, subscription_end: null, tier: 'free' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const subscription = subscriptions.data[0];
    const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
    const productId = subscription.items.data[0]?.price?.product as string;
    logStep('Active subscription found', { subscriptionId: subscription.id, productId, endDate: subscriptionEnd });

    // Resolve tier from subscription metadata or product lookup
    let tier = subscription.metadata?.plan_name || 'pro';

    // If no plan_name in metadata, try to match from our subscription_plans table
    if (!subscription.metadata?.plan_name) {
      const stripePriceId = subscription.items.data[0]?.price?.id;
      if (stripePriceId) {
        const { data: matchedPlan } = await supabaseClient
          .from('subscription_plans')
          .select('plan_name')
          .or(`stripe_price_id_monthly.eq.${stripePriceId},stripe_price_id_yearly.eq.${stripePriceId}`)
          .single();

        if (matchedPlan) {
          tier = matchedPlan.plan_name;
        }
      }
    }

    logStep('Resolved tier', { tier });

    return new Response(
      JSON.stringify({
        subscribed: true,
        product_id: productId,
        subscription_end: subscriptionEnd,
        tier,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep('ERROR', { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
