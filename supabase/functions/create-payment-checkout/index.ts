import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders } from '../_shared/cors.ts';
import { STRIPE_API_VERSION } from '../_shared/constants.ts';

/**
 * Unified Payment Checkout Session
 * Canonical function for all Stripe Checkout flows:
 *   - mastering  (one-time payment)
 *   - mixing     (one-time payment)
 *   - distribution (subscription — monthly or annual based on package billing_cycle)
 *   - addon      (one-time payment via Checkout redirect — NOT the embedded PaymentIntent flow)
 */

interface CheckoutRequest {
  packageId: string;
  packageType: 'mastering' | 'mixing' | 'distribution' | 'addon';
  referralCode?: string;
  successUrl?: string;
  cancelUrl?: string;
}

/** Table name lookup by package type */
const TABLE_MAP: Record<CheckoutRequest['packageType'], string> = {
  mastering: 'mastering_packages',
  mixing: 'mixing_packages',
  distribution: 'distribution_packages',
  addon: 'add_on_services',
};

/** Normalize field names across different package table schemas */
function normalizePackage(raw: Record<string, unknown>, packageType: string) {
  return {
    name:
      (raw.name as string) ??
      (raw.package_name as string) ??
      (raw.service_name as string) ??
      'Package',
    description:
      (raw.description as string) ??
      (raw.package_description as string) ??
      (raw.service_description as string) ??
      '',
    price: Number(raw.price ?? 0),
    currency: ((raw.currency as string) ?? 'usd').toLowerCase(),
    billingCycle: (raw.billing_cycle as string) ?? null,
  };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[CHECKOUT] Function started');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Authenticate
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }
    console.log('[CHECKOUT] User authenticated:', user.id);

    const body: CheckoutRequest = await req.json();
    const { packageId, packageType, referralCode, successUrl, cancelUrl } = body;

    if (!packageId || !packageType) {
      throw new Error('packageId and packageType are required');
    }

    const tableName = TABLE_MAP[packageType];
    if (!tableName) {
      throw new Error(`Invalid packageType: ${packageType}`);
    }

    // Fetch package
    const { data: raw, error: fetchError } = await supabaseClient
      .from(tableName)
      .select('*')
      .eq('id', packageId)
      .single();

    if (fetchError || !raw) {
      throw new Error(`Package not found: ${fetchError?.message}`);
    }

    const pkg = normalizePackage(raw as Record<string, unknown>, packageType);
    console.log('[CHECKOUT] Package:', pkg.name, '| Type:', packageType);

    // Stripe init
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: STRIPE_API_VERSION,
    });

    // Find or create Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string;

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;
    }
    console.log('[CHECKOUT] Stripe customer:', customerId);

    // Determine if subscription (distribution only)
    const isRecurring = packageType === 'distribution';
    const recurringInterval = pkg.billingCycle === 'monthly' ? 'month' : 'year';
    const amountCents = Math.round(pkg.price * 100);

    // Build metadata
    const metadata: Record<string, string> = {
      user_id: user.id,
      package_id: packageId,
      package_type: packageType,
    };
    if (referralCode) {
      metadata.referral_code = referralCode;
    }

    const origin = req.headers.get('origin') || '';

    // Build checkout session config
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: pkg.currency,
            unit_amount: amountCents,
            product_data: {
              name: pkg.name,
              description: pkg.description || undefined,
              metadata: {
                package_id: packageId,
                package_type: packageType,
              },
            },
            ...(isRecurring && {
              recurring: { interval: recurringInterval as 'month' | 'year' },
            }),
          },
          quantity: 1,
        },
      ],
      mode: isRecurring ? 'subscription' : 'payment',
      success_url: successUrl || `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${origin}/payment-canceled`,
      metadata,
      client_reference_id: user.id,
    };

    const session = await stripe.checkout.sessions.create(sessionConfig);
    console.log('[CHECKOUT] Session created:', session.id);

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[CHECKOUT] Error:', msg);
    return new Response(
      JSON.stringify({ error: msg }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
