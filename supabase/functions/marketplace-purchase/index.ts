import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      throw new Error('Unauthorized');
    }

    const { itemId } = await req.json();

    // Get marketplace item
    const { data: item, error: itemError } = await supabaseClient
      .from('marketplace_items')
      .select('*')
      .eq('id', itemId)
      .eq('active', true)
      .single();

    if (itemError || !item) {
      throw new Error('Item not found');
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Get or create customer
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('stripe_customer_id, stripe_connect_id')
      .eq('id', item.owner_id)
      .single();

    let customerId: string;
    const { data: buyerProfile } = await supabaseClient
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (!buyerProfile?.stripe_customer_id) {
      const customer = await stripe.customers.create({ email: user.email });
      customerId = customer.id;
      await supabaseClient.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id);
    } else {
      customerId = buyerProfile.stripe_customer_id;
    }

    // Calculate splits
    const creatorAmount = Math.floor(item.price_cents * (item.split_creator_percent / 100));
    const platformAmount = item.price_cents - creatorAmount;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: item.name },
          unit_amount: item.price_cents,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/marketplace?purchase=success`,
      cancel_url: `${req.headers.get('origin')}/marketplace?purchase=cancelled`,
      payment_intent_data: profile?.stripe_connect_id ? {
        application_fee_amount: platformAmount,
        transfer_data: {
          destination: profile.stripe_connect_id,
        },
      } : undefined,
      metadata: {
        itemId,
        buyerId: user.id,
        ownerId: item.owner_id
      }
    });

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
