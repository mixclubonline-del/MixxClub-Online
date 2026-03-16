import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';
import { getCorsHeaders } from '../_shared/cors.ts';
import { requireAdmin, authErrorResponse } from '../_shared/auth.ts';

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const auth = await requireAdmin(req);
    if ('error' in auth) return authErrorResponse(auth, corsHeaders);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json().catch(() => ({}));
    const startDate = body.start_date || null;
    const endDate = body.end_date || null;

    console.log('Starting financial reconciliation, requested by admin:', auth.user.id, { startDate, endDate });

    // Build payments query with optional date range
    let paymentsQuery = supabaseClient
      .from('payments').select('*').eq('status', 'completed').order('created_at', { ascending: false });

    if (startDate) paymentsQuery = paymentsQuery.gte('created_at', startDate);
    if (endDate) paymentsQuery = paymentsQuery.lte('created_at', endDate);

    const { data: payments, error: paymentsError } = await paymentsQuery.limit(1000);
    if (paymentsError) throw paymentsError;

    // Fetch mastering + general subscriptions
    const [{ data: masteringSubs, error: masteringSubsErr }, { data: userSubs, error: userSubsErr }] = await Promise.all([
      supabaseClient.from('user_mastering_subscriptions').select('*, mastering_packages(*)').eq('status', 'active'),
      supabaseClient.from('user_subscriptions').select('*').eq('status', 'active'),
    ]);
    if (masteringSubsErr) throw masteringSubsErr;
    if (userSubsErr) throw userSubsErr;

    const totalActiveSubscriptions = (masteringSubs?.length || 0) + (userSubs?.length || 0);

    const discrepancies: any[] = [];
    const reconciled: any[] = [];
    let totalRevenue = 0;
    let totalPayouts = 0;

    // Per-service-type breakdown
    const revenueByType: Record<string, { count: number; total: number }> = {};

    for (const payment of (payments || [])) {
      totalRevenue += payment.amount || 0;
      reconciled.push({ id: payment.id, amount: payment.amount, status: 'reconciled' });

      const serviceType = payment.package_type || payment.payment_type || 'other';
      if (!revenueByType[serviceType]) revenueByType[serviceType] = { count: 0, total: 0 };
      revenueByType[serviceType].count += 1;
      revenueByType[serviceType].total += payment.amount || 0;
    }

    let payoutsQuery = supabaseClient.from('engineer_payouts').select('*').eq('status', 'completed');
    if (startDate) payoutsQuery = payoutsQuery.gte('created_at', startDate);
    if (endDate) payoutsQuery = payoutsQuery.lte('created_at', endDate);

    const { data: payoutsData } = await payoutsQuery;
    for (const payout of (payoutsData || [])) { totalPayouts += payout.net_amount || 0; }

    const platformEarnings = totalRevenue - totalPayouts;
    const commissionRate = totalRevenue > 0 ? (platformEarnings / totalRevenue * 100).toFixed(2) : '0';

    // Tax-ready line items
    const taxLineItems = (payments || []).map((p: any) => ({
      date: p.created_at,
      transaction_id: p.transaction_id || p.stripe_checkout_session_id || p.id,
      service_type: p.package_type || p.payment_type || 'other',
      gross_amount: p.amount || 0,
      refund_amount: p.refund_amount || 0,
      currency: p.currency || 'usd',
      status: p.status,
      user_id: p.user_id,
      stripe_customer_id: p.stripe_customer_id || null,
    }));

    let stripeReconciliation: any = null;
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');

    if (stripeKey) {
      try {
        const stripe = new Stripe(stripeKey, { apiVersion: '2025-08-27.basil' });
        const recentCharges = await stripe.charges.list({ limit: 100 });

        const stripeChargeMap = new Map<string, any>();
        for (const ch of recentCharges.data) {
          if (ch.payment_intent) {
            stripeChargeMap.set(ch.payment_intent as string, { id: ch.id, amount: ch.amount / 100, status: ch.status, paid: ch.paid });
          }
        }

        const missingInStripe: any[] = [], missingInDB: any[] = [], amountMismatches: any[] = [];
        const dbTransactionIds = new Set<string>();

        for (const payment of (payments || [])) {
          const txId = payment.transaction_id || payment.stripe_checkout_session_id;
          if (txId) {
            dbTransactionIds.add(txId);
            const stripeCharge = stripeChargeMap.get(txId);
            if (!stripeCharge) missingInStripe.push({ db_id: payment.id, transaction_id: txId, db_amount: payment.amount });
            else if (Math.abs(stripeCharge.amount - payment.amount) > 0.01) {
              amountMismatches.push({ db_id: payment.id, transaction_id: txId, db_amount: payment.amount, stripe_amount: stripeCharge.amount, difference: stripeCharge.amount - payment.amount });
            }
          }
        }

        for (const [piId, ch] of stripeChargeMap) {
          if (ch.paid && !dbTransactionIds.has(piId)) missingInDB.push({ stripe_charge_id: ch.id, payment_intent: piId, stripe_amount: ch.amount });
        }

        stripeReconciliation = { charges_checked: recentCharges.data.length, missing_in_stripe: missingInStripe, missing_in_db: missingInDB, amount_mismatches: amountMismatches, total_discrepancies: missingInStripe.length + missingInDB.length + amountMismatches.length };
        for (const m of missingInStripe) discrepancies.push({ type: 'missing_in_stripe', ...m });
        for (const m of missingInDB) discrepancies.push({ type: 'missing_in_db', ...m });
        for (const m of amountMismatches) discrepancies.push({ type: 'amount_mismatch', ...m });
      } catch (stripeErr: any) {
        stripeReconciliation = { error: stripeErr.message };
      }
    } else {
      stripeReconciliation = { error: 'STRIPE_SECRET_KEY not configured' };
    }

    const report = {
      generated_at: new Date().toISOString(),
      generated_by: auth.user.id,
      date_range: { start_date: startDate, end_date: endDate },
      summary: {
        total_revenue: totalRevenue,
        total_payouts: totalPayouts,
        platform_earnings: platformEarnings,
        effective_commission_rate: `${commissionRate}%`,
        total_payments_processed: payments?.length || 0,
        active_subscriptions: totalActiveSubscriptions,
        mastering_subscriptions: masteringSubs?.length || 0,
        user_subscriptions: userSubs?.length || 0,
        discrepancies_found: discrepancies.length,
        revenue_by_type: revenueByType,
      },
      stripe_reconciliation: stripeReconciliation,
      discrepancies,
      reconciled_count: reconciled.length,
      tax_line_items: taxLineItems,
    };

    return new Response(JSON.stringify(report), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    console.error('[INTERNAL] Reconciliation error:', error);
    return new Response(
      JSON.stringify({ error: 'Reconciliation failed. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
