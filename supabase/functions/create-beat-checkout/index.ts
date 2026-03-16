import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders } from '../_shared/cors.ts';
import { COINZ_TO_CENTS_RATE } from '../_shared/constants.ts';

/**
 * Create Beat Checkout Session
 * Handles Stripe checkout for beat purchases with 70/30 revenue split.
 * Supports MixxCoinz partial/full payment via spend_coinz RPC.
 */

const PLATFORM_FEE_PERCENTAGE = 0.30; // 30% platform fee

interface BeatCheckoutRequest {
  beatId: string;
  licenseType: 'lease' | 'exclusive';
  coinzToApply?: number;
  successUrl?: string;
  cancelUrl?: string;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[CREATE-BEAT-CHECKOUT] Function started');

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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      throw new Error('Unauthorized');
    }

     const token = authHeader.replace('Bearer ', '');
     const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
     
     if (userError || !userData.user) {
       throw new Error('Unauthorized');
     }
 
     const userId = userData.user.id;
     const userEmail = userData.user.email as string;

    console.log('[CREATE-BEAT-CHECKOUT] User authenticated:', userId);

    const body: BeatCheckoutRequest = await req.json();
    const { beatId, licenseType, coinzToApply = 0, successUrl, cancelUrl } = body;

    if (!beatId || !licenseType) {
      throw new Error('Beat ID and license type are required');
    }

    if (!['lease', 'exclusive'].includes(licenseType)) {
      throw new Error('Invalid license type');
    }

    // Use service role for database operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch beat details
    const { data: beat, error: beatError } = await supabaseAdmin
      .from('producer_beats')
      .select(`
        id, title, producer_id, price_cents, exclusive_price_cents, 
        license_type, status, is_exclusive_available,
        producer:producer_id(id, username, full_name)
      `)
      .eq('id', beatId)
      .single();

    if (beatError || !beat) {
      throw new Error('Beat not found');
    }

    if (beat.status !== 'published') {
      throw new Error('Beat is not available for purchase');
    }

    if (licenseType === 'exclusive' && beat.is_exclusive_available === false) {
      throw new Error('Exclusive license is no longer available for this beat');
    }

    if (beat.license_type !== 'both' && beat.license_type !== licenseType) {
      throw new Error(`This beat is only available for ${beat.license_type} license`);
    }

    if (beat.producer_id === userId) {
      throw new Error('You cannot purchase your own beat');
    }

    // Calculate base pricing
    const basePriceCents = licenseType === 'exclusive' 
      ? beat.exclusive_price_cents 
      : beat.price_cents;

    if (!basePriceCents || basePriceCents <= 0) {
      throw new Error('Beat price is not configured');
    }

    // Apply MixxCoinz discount if any
    let coinzDiscountCents = 0;
    let coinzActuallySpent = 0;

    if (coinzToApply > 0) {
      // Cap coinz to the beat price (in coinz units, where 1 coinz = 1 cent)
      const maxCoinzAllowed = Math.ceil(basePriceCents / COINZ_TO_CENTS_RATE);
      coinzActuallySpent = Math.min(coinzToApply, maxCoinzAllowed);
      coinzDiscountCents = coinzActuallySpent * COINZ_TO_CENTS_RATE;

      // Deduct coinz via RPC (this validates balance server-side)
      const { data: spendResult, error: spendError } = await supabaseAdmin.rpc('spend_coinz', {
        p_user_id: userId,
        p_amount: coinzActuallySpent,
        p_source: 'beat_purchase',
        p_description: `Beat purchase: ${beat.title} (${licenseType})`,
        p_reference_type: 'beat_purchase',
        p_reference_id: beatId,
      });

      if (spendError) {
        console.error('[CREATE-BEAT-CHECKOUT] Coinz spend failed:', spendError);
        throw new Error(spendError.message || 'Failed to apply MixxCoinz');
      }

      console.log('[CREATE-BEAT-CHECKOUT] Coinz spent:', coinzActuallySpent, 'Result:', spendResult);
    }

    const chargeAmountCents = basePriceCents - coinzDiscountCents;

    // If fully covered by coinz, record purchase directly without Stripe
    if (chargeAmountCents <= 0) {
      const platformFeeCents = Math.round(basePriceCents * PLATFORM_FEE_PERCENTAGE);
      const sellerEarningsCents = basePriceCents - platformFeeCents;

      const { error: insertError } = await supabaseAdmin
        .from('beat_purchases')
        .insert({
          beat_id: beatId,
          buyer_id: userId,
          seller_id: beat.producer_id,
          license_type: licenseType,
          amount_cents: basePriceCents,
          platform_fee_cents: platformFeeCents,
          seller_earnings_cents: sellerEarningsCents,
          status: 'completed',
        });

      if (insertError) throw insertError;

      // Mark exclusive as sold
      if (licenseType === 'exclusive') {
        await supabaseAdmin
          .from('producer_beats')
          .update({ is_exclusive_available: false })
          .eq('id', beatId);
      }

      console.log('[CREATE-BEAT-CHECKOUT] Fully covered by coinz, purchase recorded directly');

      return new Response(
        JSON.stringify({
          url: `${req.headers.get('origin')}/payment-success?coinz=true`,
          sessionId: null,
          fullyCoveredByCoinz: true,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Calculate fees on the total original price (coinz discount comes off the Stripe charge only)
    const platformFeeCents = Math.round(basePriceCents * PLATFORM_FEE_PERCENTAGE);
    const sellerEarningsCents = basePriceCents - platformFeeCents;

    console.log('[CREATE-BEAT-CHECKOUT] Price calculation:', {
      basePriceCents,
      coinzDiscountCents,
      chargeAmountCents,
      platformFeeCents,
      sellerEarningsCents,
      licenseType
    });

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

    const producer = Array.isArray(beat.producer) ? beat.producer[0] : beat.producer;
    const producerName = producer?.full_name || producer?.username || 'Producer';

    // Build description with coinz info
    let description = `${licenseType === 'exclusive' ? 'Exclusive' : 'Lease'} License by ${producerName}`;
    if (coinzDiscountCents > 0) {
      description += ` (${coinzActuallySpent} MixxCoinz applied: -$${(coinzDiscountCents / 100).toFixed(2)})`;
    }

    // Create checkout session with adjusted price
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: chargeAmountCents,
            product_data: {
              name: beat.title,
              description,
              metadata: {
                beat_id: beatId,
                license_type: licenseType,
              },
            },
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl || `${req.headers.get('origin')}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${req.headers.get('origin')}/beats`,
      metadata: {
        purchase_type: 'beat',
        beat_id: beatId,
        beat_title: beat.title,
        seller_id: beat.producer_id,
        buyer_id: userId,
        license_type: licenseType,
        original_price_cents: String(basePriceCents),
        coinz_discount_cents: String(coinzDiscountCents),
        coinz_spent: String(coinzActuallySpent),
        charge_amount_cents: String(chargeAmountCents),
        platform_fee_cents: String(platformFeeCents),
        seller_earnings_cents: String(sellerEarningsCents),
      },
      client_reference_id: userId,
    });

    console.log('[CREATE-BEAT-CHECKOUT] Session created:', session.id);

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
    console.error('[CREATE-BEAT-CHECKOUT] Error:', errorMessage);

    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
