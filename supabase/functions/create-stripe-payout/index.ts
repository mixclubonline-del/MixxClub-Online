import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0';

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

    const { payoutRequestId } = await req.json();

    if (!payoutRequestId) {
      throw new Error('Missing payoutRequestId');
    }

    // Get payout request
    const { data: payoutRequest, error: fetchError } = await supabaseClient
      .from('payout_requests')
      .select('*, profiles(stripe_connect_account_id)')
      .eq('id', payoutRequestId)
      .single();

    if (fetchError || !payoutRequest) {
      throw new Error('Payout request not found');
    }

    if (!payoutRequest.profiles?.stripe_connect_account_id) {
      throw new Error('Engineer has not connected their bank account');
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Create transfer to connected account
    const transfer = await stripe.transfers.create({
      amount: Math.round(payoutRequest.amount * 100), // Convert to cents
      currency: 'usd',
      destination: payoutRequest.profiles.stripe_connect_account_id,
      description: `Payout for engineer earnings`,
      metadata: {
        payout_request_id: payoutRequestId,
        engineer_id: payoutRequest.engineer_id,
      },
    });

    // Update payout request
    const { error: updateError } = await supabaseClient
      .from('payout_requests')
      .update({
        status: 'completed',
        processed_at: new Date().toISOString(),
        stripe_transfer_id: transfer.id,
      })
      .eq('id', payoutRequestId);

    if (updateError) {
      console.error('Failed to update payout request:', updateError);
    }

    // Send notification
    await supabaseClient.rpc('create_notification', {
      p_user_id: payoutRequest.engineer_id,
      p_type: 'payout_completed',
      p_title: 'Payout Completed',
      p_message: `Your payout of $${payoutRequest.amount} has been sent to your bank account`,
      p_action_url: '/engineer-crm?tab=business',
      p_related_id: payoutRequestId,
      p_related_type: 'payout',
    });

    return new Response(
      JSON.stringify({ success: true, transferId: transfer.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Payout error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
