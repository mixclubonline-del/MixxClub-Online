import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders } from '../_shared/cors.ts';

/**
 * Create Payment Checkout Session
 * Supports all package types: mastering, mixing, distribution, add-ons
 */

interface CheckoutRequest {
  packageId: string;
  packageType: 'mastering' | 'mixing' | 'distribution' | 'addon';
  successUrl?: string;
  cancelUrl?: string;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[CREATE-PAYMENT-CHECKOUT] Function started');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Authenticate user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('[CREATE-PAYMENT-CHECKOUT] User authenticated:', user.id);

    const body: CheckoutRequest = await req.json();
    const { packageId, packageType, successUrl, cancelUrl } = body;

    if (!packageId || !packageType) {
      throw new Error('Package ID and type are required');
    }

    // Fetch package details based on type
    let packageData: any;
    let tableName: string;

    switch (packageType) {
      case 'mastering':
        tableName = 'mastering_packages';
        break;
      case 'mixing':
        tableName = 'mixing_packages';
        break;
      case 'distribution':
        tableName = 'distribution_packages';
        break;
      case 'addon':
        tableName = 'add_on_services';
        break;
      default:
        throw new Error('Invalid package type');
    }

    const { data, error: fetchError } = await supabaseClient
      .from(tableName)
      .select('*')
      .eq('id', packageId)
      .single();

    if (fetchError || !data) {
      throw new Error(`Package not found: ${fetchError?.message}`);
    }

    packageData = data;
    console.log('[CREATE-PAYMENT-CHECKOUT] Package found:', packageData.name);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-08-27.basil',
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log('[CREATE-PAYMENT-CHECKOUT] Existing customer found:', customerId);
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
          package_type: packageType,
        },
      });
      customerId = customer.id;
      console.log('[CREATE-PAYMENT-CHECKOUT] New customer created:', customerId);
    }

    // Determine if recurring (for distribution) or one-time
    const isRecurring = packageType === 'distribution';
    const amount = Math.round((packageData.price || 0) * 100); // Convert to cents

    // Create checkout session with dynamic pricing
    const sessionConfig: any = {
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: (packageData.currency || 'usd').toLowerCase(),
            unit_amount: amount,
            product_data: {
              name: packageData.name || packageData.service_name,
              description: packageData.description || packageData.service_description,
              metadata: {
                package_id: packageId,
                package_type: packageType,
              },
            },
            ...(isRecurring && {
              recurring: {
                interval: 'year',
              },
            }),
          },
          quantity: 1,
        },
      ],
      mode: isRecurring ? 'subscription' : 'payment',
      success_url: successUrl || `${req.headers.get('origin')}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${req.headers.get('origin')}/payment-canceled`,
      metadata: {
        user_id: user.id,
        package_id: packageId,
        package_type: packageType,
      },
      client_reference_id: user.id,
    };

    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log('[CREATE-PAYMENT-CHECKOUT] Session created:', session.id);

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
    console.error('[CREATE-PAYMENT-CHECKOUT] Error:', errorMessage);

    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
