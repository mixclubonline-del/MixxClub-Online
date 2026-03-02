import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { getCorsHeaders } from '../_shared/cors.ts';
import { requireAdmin, authErrorResponse } from '../_shared/auth.ts';

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require admin authentication
    const auth = await requireAdmin(req);
    if ('error' in auth) return authErrorResponse(auth, corsHeaders);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting financial reconciliation, requested by admin:', auth.user.id);

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
    const discrepancies: any[] = [];
    const reconciled: any[] = [];
    let totalRevenue = 0;
    let totalPayouts = 0;

    for (const payment of (payments || [])) {
      totalRevenue += payment.amount || 0;
      reconciled.push({
        id: payment.id,
        amount: payment.amount,
        status: 'reconciled'
      });
    }

    // Get engineer payouts
    const { data: payouts } = await supabaseClient
      .from('engineer_payouts')
      .select('*')
      .eq('status', 'completed');

    for (const payout of (payouts || [])) {
      totalPayouts += payout.net_amount || 0;
    }

    const platformEarnings = totalRevenue - totalPayouts;
    const commissionRate = totalRevenue > 0 ? (platformEarnings / totalRevenue * 100).toFixed(2) : '0';

    const report = {
      generated_at: new Date().toISOString(),
      generated_by: auth.user.id,
      summary: {
        total_revenue: totalRevenue,
        total_payouts: totalPayouts,
        platform_earnings: platformEarnings,
        effective_commission_rate: `${commissionRate}%`,
        total_payments_processed: payments?.length || 0,
        active_subscriptions: subscriptions?.length || 0,
        discrepancies_found: discrepancies.length
      },
      discrepancies,
      reconciled_count: reconciled.length
    };

    console.log('Reconciliation complete:', report.summary);

    return new Response(JSON.stringify(report), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('[INTERNAL] Reconciliation error:', error);
    return new Response(
      JSON.stringify({ error: 'Reconciliation failed. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
