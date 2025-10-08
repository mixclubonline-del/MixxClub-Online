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

    const { item_id } = await req.json();

    // Get marketplace item
    const { data: item, error: itemError } = await supabaseClient
      .from('marketplace_items')
      .select('*')
      .eq('id', item_id)
      .eq('is_published', true)
      .single();

    if (itemError || !item) {
      throw new Error('Item not found');
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Get or create customer
    const { data: sellerProfile } = await supabaseClient
      .from('profiles')
      .select('stripe_customer_id, stripe_connect_id')
      .eq('id', item.seller_id)
      .single();

    let customerId: string;
    const { data: buyerProfile } = await supabaseClient
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', user.id)
      .single();

    if (!buyerProfile?.stripe_customer_id) {
      const customer = await stripe.customers.create({ 
        email: user.email || buyerProfile?.email 
      });
      customerId = customer.id;
      await supabaseClient
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    } else {
      customerId = buyerProfile.stripe_customer_id;
    }

    // Calculate platform fee (20%)
    const priceInCents = Math.round(item.price * 100);
    const platformFee = Math.floor(priceInCents * 0.20);

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { 
            name: item.item_name,
            description: item.item_description || undefined,
            images: item.thumbnail_url ? [item.thumbnail_url] : undefined
          },
          unit_amount: priceInCents,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/marketplace?purchase=success&item=${item_id}`,
      cancel_url: `${req.headers.get('origin')}/marketplace?purchase=cancelled`,
      payment_intent_data: sellerProfile?.stripe_connect_id ? {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: sellerProfile.stripe_connect_id,
        },
      } : undefined,
      metadata: {
        item_id,
        buyer_id: user.id,
        seller_id: item.seller_id
      }
    });

    // Create purchase record
    await supabaseClient
      .from('marketplace_purchases')
      .insert({
        item_id,
        buyer_id: user.id,
        seller_id: item.seller_id,
        purchase_price: item.price,
        stripe_session_id: session.id,
        status: 'pending'
      });

    return new Response(
      JSON.stringify({ checkout_url: session.url }),
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