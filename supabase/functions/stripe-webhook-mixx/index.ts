import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// Stripe SDK removed for Deno compatibility; using manual signature verification
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
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

    // Handle checkout.session.completed - Mark project escrow=held, mint MixPort Token
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const projectId = session.metadata?.projectId;
      
      if (projectId) {
        const { error: projectError } = await supabaseClient
          .from('projects')
          .update({ 
            escrow: 'held',
            checkout_session_id: session.id,
            mixport_token: `MIXX_${projectId}_${Date.now()}` // Generate MixPort token
          })
          .eq('id', projectId);

        if (projectError) {
          console.error('Error updating project:', projectError);
        }

        const { error: paymentError } = await supabaseClient
          .from('payments')
          .insert({
            project_id: projectId,
            stripe_checkout_id: session.id,
            stripe_payment_intent_id: session.payment_intent,
            amount: session.amount_total || 0,
            escrow: 'held'
          });

        if (paymentError) {
          console.error('Error creating payment record:', paymentError);
        }
      }
    }

    // Handle payment_intent.succeeded - Confirm payment record
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as any;
      
      const { error } = await supabaseClient
        .from('payments')
        .update({ status: 'completed' })
        .eq('stripe_payment_intent_id', paymentIntent.id);

      if (error) {
        console.error('Error updating payment:', error);
      }
    }

    // Handle account.updated - KYC status sync
    if (event.type === 'account.updated') {
      const account = event.data.object as any;
      
      const { error } = await supabaseClient
        .from('profiles')
        .update({ 
          kyc_verified: account.charges_enabled && account.payouts_enabled 
        })
        .eq('stripe_connect_id', account.id);

      if (error) {
        console.error('Error updating KYC status:', error);
      }
    }

    // Handle transfer.paid - Mark payout paid, unlock downloads
    if (event.type === 'transfer.paid') {
      const transfer = event.data.object as any;
      
      const { error } = await supabaseClient
        .from('payouts')
        .update({ 
          status: 'paid',
          paid_at: new Date().toISOString()
        })
        .eq('stripe_transfer_id', transfer.id);

      if (error) {
        console.error('Error updating payout:', error);
      }
    }

    // Handle charge.refunded - Set escrow=refunded
    if (event.type === 'charge.refunded') {
      const charge = event.data.object as any;
      
      const { data: payment } = await supabaseClient
        .from('payments')
        .select('project_id')
        .eq('stripe_payment_intent_id', charge.payment_intent)
        .single();

      if (payment) {
        await supabaseClient
          .from('projects')
          .update({ escrow: 'refunded' })
          .eq('id', payment.project_id);

        await supabaseClient
          .from('payments')
          .update({ escrow: 'refunded' })
          .eq('project_id', payment.project_id);
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
