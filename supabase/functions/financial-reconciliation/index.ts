import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { getCorsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting financial reconciliation...');

    // Fetch unreconciled payments
    const { data: payments, error: paymentsError } = await supabaseClient
      .from('payments')
      .select('*')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(100);

    if (paymentsError) throw paymentsError;

    // Fetch active subscriptions
    const { data: subscriptions, error: subsError } = await supabaseClient
      .from('user_mastering_subscriptions')
      .select('*, mastering_packages(*)')
      .eq('status', 'active');

    if (subsError) throw subsError;

    // Reconciliation logic
    const discrepancies = [];
    const reconciled = [];

    // Check if payments match expected subscription amounts
    for (const payment of payments || []) {
      const subscription = subscriptions?.find(s => 
        s.user_id === payment.user_id && 
        Math.abs(new Date(payment.created_at).getTime() - new Date(s.created_at).getTime()) < 86400000 // 24 hours
      );

      if (subscription) {
        const expectedAmount = subscription.mastering_packages?.price || 0;
        const actualAmount = Number(payment.amount);

        if (Math.abs(expectedAmount - actualAmount) > 0.01) {
          discrepancies.push({
            payment_id: payment.id,
            subscription_id: subscription.id,
            expected: expectedAmount,
            actual: actualAmount,
            difference: actualAmount - expectedAmount,
            user_id: payment.user_id
          });
        } else {
          reconciled.push({
            payment_id: payment.id,
            subscription_id: subscription.id,
            amount: actualAmount
          });
        }
      }
    }

    // Calculate totals
    const totalPayments = payments?.reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;
    const totalExpected = subscriptions?.reduce((sum, s) => sum + Number(s.mastering_packages?.price || 0), 0) || 0;
    const variance = totalPayments - totalExpected;

    // Update revenue analytics
    await supabaseClient.rpc('update_revenue_analytics');

    // Create AI insight if significant discrepancies found
    if (Math.abs(variance) > 100) {
      await supabaseClient.from('ai_financial_insights').insert({
        insight_type: 'cash_flow_forecast',
        title: 'Reconciliation Discrepancy Detected',
        description: `Found ${discrepancies.length} payment discrepancies totaling $${Math.abs(variance).toFixed(2)}. ${variance > 0 ? 'Overpayments' : 'Underpayments'} detected.`,
        severity: Math.abs(variance) > 500 ? 'warning' : 'info',
        confidence_score: 0.95,
        impact_amount: Math.abs(variance),
        metadata: { 
          discrepancies: discrepancies.length,
          reconciled: reconciled.length 
        }
      });
    }

    // Log the action
    await supabaseClient.from('financial_actions_log').insert({
      action_type: 'automated_reconciliation',
      action_description: `Reconciled ${reconciled.length} payments, found ${discrepancies.length} discrepancies`,
      status: 'completed',
      result: {
        total_payments: totalPayments,
        total_expected: totalExpected,
        variance: variance,
        discrepancies_count: discrepancies.length,
        reconciled_count: reconciled.length
      }
    });

    console.log(`Reconciliation complete: ${reconciled.length} reconciled, ${discrepancies.length} discrepancies`);

    return new Response(
      JSON.stringify({ 
        success: true,
        summary: {
          total_payments: totalPayments,
          total_expected: totalExpected,
          variance: variance,
          discrepancies: discrepancies.length,
          reconciled: reconciled.length
        },
        discrepancies: discrepancies.slice(0, 10), // Return first 10
        reconciled_count: reconciled.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Reconciliation error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
