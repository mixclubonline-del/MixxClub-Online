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

    const { amountCents } = await req.json();

    // Check KYC status
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('kyc_verified, stripe_connect_id')
      .eq('id', user.id)
      .single();

    if (!profile?.kyc_verified) {
      throw new Error('KYC verification required for cashouts');
    }

    if (!profile.stripe_connect_id) {
      throw new Error('Stripe Connect account required');
    }

    // Get points balance
    const { data: ledger } = await supabaseClient
      .from('points_ledger')
      .select('delta_cents')
      .eq('user_id', user.id);

    const totalPoints = ledger?.reduce((sum, entry) => sum + entry.delta_cents, 0) || 0;

    if (totalPoints < amountCents) {
      throw new Error('Insufficient points balance');
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Create transfer to Connect account
    const transfer = await stripe.transfers.create({
      amount: amountCents,
      currency: 'usd',
      destination: profile.stripe_connect_id,
      metadata: {
        user_id: user.id,
        type: 'points_cashout'
      }
    });

    // Deduct points
    await supabaseClient
      .from('points_ledger')
      .insert({
        user_id: user.id,
        delta_cents: -amountCents,
        reason: 'Points cashed out',
        ref_id: transfer.id
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        transferId: transfer.id,
        newBalance: totalPoints - amountCents 
      }),
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
