import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders } from '../_shared/cors.ts';

/**
 * One-time setup: Create Stripe products and prices for subscription tiers.
 * Creates Starter ($9/mo, $90/yr), Pro ($29/mo, $290/yr), Studio ($99/mo, $990/yr)
 * and updates the subscription_plans table with the real price IDs.
 * 
 * Admin-only endpoint.
 */

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) throw new Error('STRIPE_SECRET_KEY is not set');

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Auth check — require admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) throw new Error('Unauthorized');

    const { data: adminRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', userData.user.id)
      .eq('role', 'admin')
      .single();

    if (!adminRole) throw new Error('Admin access required');

    const stripe = new Stripe(stripeKey, { apiVersion: '2025-08-27.basil' });

    const tiers = [
      { plan_name: 'starter', display: 'Starter', monthly: 900, yearly: 9000 },
      { plan_name: 'pro', display: 'Pro', monthly: 2900, yearly: 29000 },
      { plan_name: 'studio', display: 'Studio', monthly: 9900, yearly: 99000 },
    ];

    const results: Record<string, any> = {};

    for (const tier of tiers) {
      // Create product
      const product = await stripe.products.create({
        name: `MixClub ${tier.display}`,
        description: `MixClub ${tier.display} subscription plan`,
        metadata: { plan_name: tier.plan_name, platform: 'mixclub' },
      });

      // Create monthly price
      const monthlyPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: tier.monthly,
        currency: 'usd',
        recurring: { interval: 'month' },
        metadata: { plan_name: tier.plan_name, interval: 'monthly' },
      });

      // Create yearly price
      const yearlyPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: tier.yearly,
        currency: 'usd',
        recurring: { interval: 'year' },
        metadata: { plan_name: tier.plan_name, interval: 'yearly' },
      });

      // Update subscription_plans table
      const { error: updateError } = await supabaseAdmin
        .from('subscription_plans')
        .update({
          stripe_product_id: product.id,
          stripe_price_id_monthly: monthlyPrice.id,
          stripe_price_id_yearly: yearlyPrice.id,
        })
        .eq('plan_name', tier.plan_name);

      if (updateError) {
        console.error(`Failed to update ${tier.plan_name}:`, updateError);
      }

      results[tier.plan_name] = {
        product_id: product.id,
        monthly_price_id: monthlyPrice.id,
        yearly_price_id: yearlyPrice.id,
        updated_db: !updateError,
      };

      console.log(`[SETUP] Created ${tier.display}: product=${product.id}, monthly=${monthlyPrice.id}, yearly=${yearlyPrice.id}`);
    }

    return new Response(
      JSON.stringify({ success: true, products: results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[SETUP-STRIPE-PRODUCTS] Error:', msg);
    return new Response(
      JSON.stringify({ error: msg }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
