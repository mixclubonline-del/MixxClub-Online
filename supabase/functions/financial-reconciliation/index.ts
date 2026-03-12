import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
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

    // --- Stripe Cross-Reference ---
    let stripeReconciliation: any = null;
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    
    if (stripeKey) {
      try {
        const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
        const recentCharges = await stripe.charges.list({ limit: 100 });

        const stripeChargeMap = new Map<string, any>();
        for (const ch of recentCharges.data) {
          if (ch.payment_intent) {
            stripeChargeMap.set(ch.payment_intent as string, {
              id: ch.id,
              amount: ch.amount / 100,
              status: ch.status,
              paid: ch.paid,
            });
          }
        }

        // Cross-match: DB payments with stripe_checkout_session_id or transaction_id
        const missingInStripe: any[] = [];
        const missingInDB: any[] = [];
        const amountMismatches: any[] = [];

        const dbTransactionIds = new Set<string>();
        for (const payment of (payments || [])) {
          const txId = payment.transaction_id || payment.stripe_checkout_session_id;
          if (txId) {
            dbTransactionIds.add(txId);
            const stripeCharge = stripeChargeMap.get(txId);
            if (!stripeCharge) {
              missingInStripe.push({ db_id: payment.id, transaction_id: txId, db_amount: payment.amount });
            } else if (Math.abs(stripeCharge.amount - payment.amount) > 0.01) {
              amountMismatches.push({
                db_id: payment.id,
                transaction_id: txId,
                db_amount: payment.amount,
                stripe_amount: stripeCharge.amount,
                difference: stripeCharge.amount - payment.amount,
              });
            }
          }
        }

        // Stripe charges not in DB
        for (const [piId, ch] of stripeChargeMap) {
          if (ch.paid && !dbTransactionIds.has(piId)) {
            missingInDB.push({ stripe_charge_id: ch.id, payment_intent: piId, stripe_amount: ch.amount });
          }
        }

        stripeReconciliation = {
          charges_checked: recentCharges.data.length,
          missing_in_stripe: missingInStripe,
          missing_in_db: missingInDB,
          amount_mismatches: amountMismatches,
          total_discrepancies: missingInStripe.length + missingInDB.length + amountMismatches.length,
        };

        // Add stripe discrepancies to main list
        for (const m of missingInStripe) discrepancies.push({ type: 'missing_in_stripe', ...m });
        for (const m of missingInDB) discrepancies.push({ type: 'missing_in_db', ...m });
        for (const m of amountMismatches) discrepancies.push({ type: 'amount_mismatch', ...m });

        console.log('Stripe cross-reference complete:', stripeReconciliation);
      } catch (stripeErr: any) {
        console.error('Stripe cross-reference failed (non-fatal):', stripeErr.message);
        stripeReconciliation = { error: stripeErr.message };
      }
    } else {
      stripeReconciliation = { error: 'STRIPE_SECRET_KEY not configured' };
    }

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
      stripe_reconciliation: stripeReconciliation,
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
