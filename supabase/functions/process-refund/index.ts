import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { getCorsHeaders } from '../_shared/cors.ts';
import { safeErrorResponse, AppError } from '../_shared/error-handler.ts';

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { paymentId, amount, reason } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    const { data: isAdmin } = await supabaseClient.rpc('is_admin', { user_uuid: user.id });
    
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get payment details
    const { data: payment, error: paymentError } = await supabaseClient
      .from('payments')
      .select('*, transaction_id')
      .eq('id', paymentId)
      .single();

    if (paymentError || !payment) {
      throw new Error('Payment not found');
    }

    if (payment.status === 'refunded') {
      throw new Error('Payment already refunded');
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Process refund with Stripe
    const refund = await stripe.refunds.create({
      payment_intent: payment.transaction_id,
      amount: amount ? Math.round(amount * 100) : undefined,
      reason: reason || 'requested_by_customer',
      metadata: {
        paymentId: paymentId,
        processedBy: user.id,
      }
    });

    console.log('Refund processed:', refund.id);

    // Update payment status
    const { error: updateError } = await supabaseClient
      .from('payments')
      .update({ 
        status: 'refunded',
        refund_amount: refund.amount / 100,
        refund_reason: reason,
        refunded_at: new Date().toISOString()
      })
      .eq('id', paymentId);

    if (updateError) {
      console.error('Error updating payment:', updateError);
    }

    // Update engineer earnings if applicable
    if (payment.project_id) {
      const { error: earningsError } = await supabaseClient
        .from('engineer_earnings')
        .update({ status: 'refunded' })
        .eq('project_id', payment.project_id);

      if (earningsError) {
        console.error('Error updating earnings:', earningsError);
      }
    }

    // Log audit event
    await supabaseClient
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'refund_processed',
        table_name: 'payments',
        record_id: paymentId,
        new_data: { refund_id: refund.id, amount: refund.amount / 100 }
      });

    return new Response(
      JSON.stringify({ 
        success: true,
        refundId: refund.id,
        amount: refund.amount / 100,
        status: refund.status
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing refund:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
