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
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response('No signature', { status: 400 });
    }

    const body = await req.text();
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    let event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret!);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response('Invalid signature', { status: 400 });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.client_reference_id;
      const packageId = session.metadata?.packageId;
      const packageType = session.metadata?.packageType || 'mastering';

      if (userId && packageId) {
        // Determine which table to insert into based on package type
        let tableName: string;
        if (packageType === 'mixing') {
          tableName = 'user_mixing_subscriptions';
        } else if (packageType === 'distribution') {
          tableName = 'user_distribution_subscriptions';
        } else {
          tableName = 'user_mastering_subscriptions';
        }
        
        // Create user subscription record
        const { error } = await supabaseClient
          .from(tableName)
          .insert({
            user_id: userId,
            package_id: packageId,
            stripe_customer_id: session.customer,
            status: 'active',
            tracks_used: 0
          });

        if (error) {
          console.error(`Error creating ${packageType} subscription:`, error);
        } else {
          console.log(`Successfully created ${packageType} subscription for user ${userId}`);
        }
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});