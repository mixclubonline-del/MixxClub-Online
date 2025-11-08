import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders } from '../_shared/cors.ts';

/**
 * Create Shareable Payment Link
 * Generates a Stripe Payment Link that can be shared with others
 */

interface PaymentLinkRequest {
  amount: number;
  currency?: string;
  description: string;
  metadata?: Record<string, string>;
  partnershipId?: string;
  recipientId?: string;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[CREATE-SHAREABLE-PAYMENT-LINK] Function started');

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

    console.log('[CREATE-SHAREABLE-PAYMENT-LINK] User authenticated:', user.id);

    const body: PaymentLinkRequest = await req.json();
    const { amount, currency = 'USD', description, metadata = {}, partnershipId, recipientId } = body;

    if (!amount || amount <= 0) {
      throw new Error('Invalid amount');
    }

    if (!description) {
      throw new Error('Description required');
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-08-27.basil',
    });

    // Create payment link
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            unit_amount: Math.round(amount * 100), // Convert to cents
            product_data: {
              name: description,
              metadata: {
                creator_id: user.id,
                ...metadata,
                ...(partnershipId && { partnership_id: partnershipId }),
                ...(recipientId && { recipient_id: recipientId }),
              },
            },
          },
          quantity: 1,
        },
      ],
      after_completion: {
        type: 'redirect',
        redirect: {
          url: `${req.headers.get('origin')}/payment-success`,
        },
      },
      metadata: {
        creator_id: user.id,
        ...metadata,
        ...(partnershipId && { partnership_id: partnershipId }),
        ...(recipientId && { recipient_id: recipientId }),
      },
    });

    console.log('[CREATE-SHAREABLE-PAYMENT-LINK] Payment link created:', paymentLink.id);

    // Store in database
    if (partnershipId) {
      await supabaseClient.from('payment_links').insert({
        creator_id: user.id,
        recipient_id: recipientId,
        partnership_id: partnershipId,
        amount,
        currency,
        description,
        link_url: paymentLink.url,
        stripe_payment_link_id: paymentLink.id,
        status: 'pending',
      });
    }

    return new Response(
      JSON.stringify({
        url: paymentLink.url,
        id: paymentLink.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[CREATE-SHAREABLE-PAYMENT-LINK] Error:', errorMessage);

    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
