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

    // Verify admin role
    const { data: roles } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roles) {
      throw new Error('Admin access required');
    }

    const { disputeId, resolution, refundPercent = 0 } = await req.json();

    // Get dispute and project
    const { data: dispute } = await supabaseClient
      .from('disputes')
      .select('*, projects(*)')
      .eq('id', disputeId)
      .single();

    if (!dispute) {
      throw new Error('Dispute not found');
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    let newEscrowStatus: string;
    let disputeStatus: string;

    // Handle resolution
    if (resolution === 'refund') {
      const { data: payment } = await supabaseClient
        .from('payments')
        .select('stripe_payment_intent_id, amount')
        .eq('project_id', dispute.project_id)
        .single();

      if (payment?.stripe_payment_intent_id) {
        const refundAmount = Math.floor((payment.amount || 0) * (refundPercent / 100));
        await stripe.refunds.create({
          payment_intent: payment.stripe_payment_intent_id,
          amount: refundAmount
        });
      }

      newEscrowStatus = 'refunded';
      disputeStatus = 'refunded';
    } else if (resolution === 'partial') {
      newEscrowStatus = 'released';
      disputeStatus = 'partial';
    } else {
      newEscrowStatus = 'released';
      disputeStatus = 'resolved';
    }

    // Update dispute
    await supabaseClient
      .from('disputes')
      .update({
        status: disputeStatus,
        resolved_at: new Date().toISOString()
      })
      .eq('id', disputeId);

    // Update project escrow
    await supabaseClient
      .from('projects')
      .update({ escrow: newEscrowStatus })
      .eq('id', dispute.project_id);

    await supabaseClient
      .from('payments')
      .update({ escrow: newEscrowStatus })
      .eq('project_id', dispute.project_id);

    return new Response(
      JSON.stringify({ success: true }),
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
