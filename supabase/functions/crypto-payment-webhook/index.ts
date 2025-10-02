import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cc-webhook-signature',
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

    const payload = await req.json();
    console.log('Webhook received:', payload.event.type);

    const event = payload.event;
    const chargeData = event.data;

    // Handle different event types
    if (event.type === 'charge:confirmed' || event.type === 'charge:resolved') {
      // Update payment status to completed
      const { data: payment, error: fetchError } = await supabaseClient
        .from('payments')
        .select('*, projects(client_id, engineer_id)')
        .eq('crypto_charge_id', chargeData.id)
        .single();

      if (fetchError || !payment) {
        console.error('Payment not found:', fetchError);
        throw new Error('Payment not found');
      }

      // Update payment status
      const { error: updateError } = await supabaseClient
        .from('payments')
        .update({
          status: 'completed',
          crypto_payment_data: chargeData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.id);

      if (updateError) {
        console.error('Failed to update payment:', updateError);
        throw updateError;
      }

      // Update project status to in_progress
      const { error: projectError } = await supabaseClient
        .from('projects')
        .update({ status: 'in_progress' })
        .eq('id', payment.project_id);

      if (projectError) {
        console.error('Failed to update project:', projectError);
      }

      // Create engineer earnings record
      if (payment.projects?.engineer_id) {
        const engineerAmount = payment.amount * 0.7; // 70% to engineer
        const { error: earningsError } = await supabaseClient
          .from('engineer_earnings')
          .insert({
            engineer_id: payment.projects.engineer_id,
            project_id: payment.project_id,
            base_amount: engineerAmount,
            total_amount: engineerAmount,
            status: 'pending',
          });

        if (earningsError) {
          console.error('Failed to create earnings record:', earningsError);
        }
      }

      // Send notification
      if (payment.projects?.client_id) {
        await supabaseClient.rpc('create_notification', {
          p_user_id: payment.projects.client_id,
          p_type: 'payment_confirmed',
          p_title: 'Crypto Payment Confirmed',
          p_message: `Your cryptocurrency payment of $${payment.amount} has been confirmed!`,
          p_action_url: `/project/${payment.project_id}`,
          p_related_id: payment.id,
          p_related_type: 'payment',
        });
      }

      console.log('Payment confirmed and processed successfully');
    } else if (event.type === 'charge:failed') {
      // Update payment status to failed
      const { error } = await supabaseClient
        .from('payments')
        .update({
          status: 'failed',
          crypto_payment_data: chargeData,
        })
        .eq('crypto_charge_id', chargeData.id);

      if (error) {
        console.error('Failed to update payment:', error);
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
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
