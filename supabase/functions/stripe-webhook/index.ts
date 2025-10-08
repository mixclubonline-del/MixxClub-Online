import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// Stripe SDK removed for Deno compatibility; using manual signature verification
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
    const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';

    // Parse Stripe-Signature header: t=timestamp,v1=signature
    const sigParts = Object.fromEntries(
      signature.split(',').map((kv) => {
        const [k, v] = kv.split('=');
        return [k.trim(), (v || '').trim()];
      })
    ) as Record<string, string>;

    const timestamp = sigParts['t'];
    const v1 = sigParts['v1'];
    if (!timestamp || !v1 || !endpointSecret) {
      return new Response('Invalid signature header', { status: 400 });
    }

    const encoder = new TextEncoder();
    const toHex = (buf: ArrayBuffer) => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    function timingSafeEqual(a: string, b: string) {
      if (a.length !== b.length) return false;
      let result = 0;
      for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
      return result === 0;
    }

    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(endpointSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signatureBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(`${timestamp}.${body}`));
    const expected = toHex(signatureBytes);

    if (!timingSafeEqual(expected, v1)) {
      console.error('Webhook signature verification failed');
      return new Response('Invalid signature', { status: 400 });
    }

    const event = JSON.parse(body);

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