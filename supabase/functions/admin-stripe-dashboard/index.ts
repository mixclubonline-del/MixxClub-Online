import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
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

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      return new Response(
        JSON.stringify({ error: 'Stripe secret key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

    // Parse body safely (supabase.functions.invoke always sends POST)
    let body: Record<string, any> = {};
    try {
      const text = await req.text();
      if (text) body = JSON.parse(text);
    } catch { /* empty body = dashboard fetch */ }

    const action = body.action;

    if (action) {
      const params = body;

      if (action === 'refund') {
        const { payment_intent_id, amount, reason } = params;
        if (!payment_intent_id) throw new Error('payment_intent_id required');
        const refund = await stripe.refunds.create({
          payment_intent: payment_intent_id,
          amount: amount ? Math.round(amount * 100) : undefined,
          reason: reason || 'requested_by_customer',
          metadata: { processed_by: auth.user.id },
        });
        console.log('[admin-stripe-dashboard] Refund created:', refund.id);
        return new Response(JSON.stringify({ success: true, refund_id: refund.id, amount: refund.amount / 100, status: refund.status }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (action === 'accept_dispute') {
        const { dispute_id } = params;
        if (!dispute_id) throw new Error('dispute_id required');
        const dispute = await stripe.disputes.close(dispute_id);
        console.log('[admin-stripe-dashboard] Dispute closed:', dispute.id);
        return new Response(JSON.stringify({ success: true, dispute_id: dispute.id, status: dispute.status }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (action === 'cancel_subscription') {
        const { subscription_id } = params;
        if (!subscription_id) throw new Error('subscription_id required');
        const sub = await stripe.subscriptions.cancel(subscription_id);
        console.log('[admin-stripe-dashboard] Subscription cancelled:', sub.id);
        return new Response(JSON.stringify({ success: true, subscription_id: sub.id, status: sub.status }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ error: 'Unknown action' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET = dashboard data
    console.log('[admin-stripe-dashboard] Fetching dashboard data for admin:', auth.user.id);

    const [balance, charges, disputes, subscriptions, payouts] = await Promise.all([
      stripe.balance.retrieve(),
      stripe.charges.list({ limit: 25, expand: ['data.customer'] }),
      stripe.disputes.list({ limit: 20 }),
      stripe.subscriptions.list({ limit: 100, status: 'active', expand: ['data.items.data.price.product'] }),
      stripe.payouts.list({ limit: 10 }),
    ]);

    // Calculate subscription metrics
    let mrr = 0;
    const tierBreakdown: Record<string, { count: number; revenue: number }> = {};

    for (const sub of subscriptions.data) {
      const item = sub.items.data[0];
      if (!item?.price) continue;
      const monthlyAmount = item.price.recurring?.interval === 'year'
        ? (item.price.unit_amount || 0) / 12
        : (item.price.unit_amount || 0);
      mrr += monthlyAmount;

      const product = item.price.product;
      const tierName = typeof product === 'object' && product !== null && 'name' in product
        ? (product as any).name
        : 'Unknown';
      if (!tierBreakdown[tierName]) tierBreakdown[tierName] = { count: 0, revenue: 0 };
      tierBreakdown[tierName].count += 1;
      tierBreakdown[tierName].revenue += monthlyAmount;
    }

    // Format balance
    const availableBalance = balance.available.reduce((s, b) => s + b.amount, 0) / 100;
    const pendingBalance = balance.pending.reduce((s, b) => s + b.amount, 0) / 100;

    // Format charges
    const formattedCharges = charges.data.map(ch => ({
      id: ch.id,
      amount: (ch.amount || 0) / 100,
      currency: ch.currency,
      status: ch.status,
      paid: ch.paid,
      refunded: ch.refunded,
      amount_refunded: (ch.amount_refunded || 0) / 100,
      customer_email: typeof ch.customer === 'object' && ch.customer !== null ? (ch.customer as any).email : null,
      description: ch.description,
      payment_intent: ch.payment_intent,
      created: new Date(ch.created * 1000).toISOString(),
    }));

    // Format disputes
    const openDisputes = disputes.data.filter(d => d.status !== 'won' && d.status !== 'lost');
    const formattedDisputes = disputes.data.map(d => ({
      id: d.id,
      amount: (d.amount || 0) / 100,
      currency: d.currency,
      status: d.status,
      reason: d.reason,
      charge_id: d.charge,
      created: new Date(d.created * 1000).toISOString(),
      evidence_due: d.evidence_details?.due_by ? new Date(d.evidence_details.due_by * 1000).toISOString() : null,
    }));

    // Format payouts
    const formattedPayouts = payouts.data.map(p => ({
      id: p.id,
      amount: (p.amount || 0) / 100,
      currency: p.currency,
      status: p.status,
      arrival_date: new Date(p.arrival_date * 1000).toISOString(),
      created: new Date(p.created * 1000).toISOString(),
    }));

    const dashboard = {
      balance: { available: availableBalance, pending: pendingBalance },
      charges: formattedCharges,
      disputes: formattedDisputes,
      open_disputes_count: openDisputes.length,
      subscriptions: {
        active_count: subscriptions.data.length,
        mrr: mrr / 100,
        tier_breakdown: Object.entries(tierBreakdown).map(([name, data]) => ({
          name,
          count: data.count,
          revenue: data.revenue / 100,
        })),
      },
      payouts: formattedPayouts,
      fetched_at: new Date().toISOString(),
    };

    return new Response(JSON.stringify(dashboard), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('[admin-stripe-dashboard] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
