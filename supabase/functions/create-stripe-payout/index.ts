import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';
import Stripe from 'https://esm.sh/stripe@18.5.0';
import { getCorsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - No authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const { payoutRequestId } = await req.json();
    if (!payoutRequestId) throw new Error('Missing payoutRequestId');

    const { data: payoutRequest, error: fetchError } = await supabaseClient
      .from('payout_requests')
      .select('*, profiles(stripe_connect_account_id)')
      .eq('id', payoutRequestId)
      .single();

    if (fetchError || !payoutRequest) throw new Error('Payout request not found');

    const { data: isAdmin } = await supabaseClient.rpc('has_role', { _user_id: user.id, _role: 'admin' });
    const isPayoutOwner = payoutRequest.engineer_id === user.id;

    if (!isAdmin && !isPayoutOwner) {
      return new Response(
        JSON.stringify({ error: 'Forbidden - You are not authorized to process this payout' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    if (!payoutRequest.profiles?.stripe_connect_account_id) {
      throw new Error('Engineer has not connected their bank account');
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-08-27.basil',
    });

    const transfer = await stripe.transfers.create({
      amount: Math.round(payoutRequest.amount * 100),
      currency: 'usd',
      destination: payoutRequest.profiles.stripe_connect_account_id,
      description: 'Payout for engineer earnings',
      metadata: { payout_request_id: payoutRequestId, engineer_id: payoutRequest.engineer_id },
    });

    await supabaseClient.from('payout_requests').update({
      status: 'completed',
      processed_at: new Date().toISOString(),
      stripe_transfer_id: transfer.id,
    }).eq('id', payoutRequestId);

    await supabaseClient.rpc('create_notification', {
      p_user_id: payoutRequest.engineer_id,
      p_type: 'payout_completed',
      p_title: 'Payout Completed',
      p_message: `Your payout of $${payoutRequest.amount} has been sent to your bank account`,
      p_action_url: '/engineer-crm?tab=business',
    });

    return new Response(
      JSON.stringify({ success: true, transferId: transfer.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Payout error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
