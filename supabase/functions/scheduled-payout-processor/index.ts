import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';
import Stripe from 'https://esm.sh/stripe@18.5.0';
import { getCorsHeaders } from '../_shared/cors.ts';

interface PayoutResult {
  payoutId: string;
  engineerId: string;
  amount: number;
  status: 'success' | 'failed' | 'skipped';
  error?: string;
  stripeTransferId?: string;
}

interface ProcessingResult {
  runId: string;
  startedAt: string;
  completedAt: string;
  triggerSource: string;
  processed: number;
  failed: number;
  skipped: number;
  totalAmountTransferred: number;
  results: PayoutResult[];
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = new Date();
  const runId = crypto.randomUUID();

  console.log(`[${runId}] Starting scheduled payout processing...`);

  try {
    let triggerSource = 'api_call';
    try {
      const body = await req.json();
      triggerSource = body.trigger_source || 'api_call';
    } catch { /* empty body */ }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) throw new Error('STRIPE_SECRET_KEY not configured');

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2025-08-27.basil',
    });

    const { data: eligiblePayouts, error: fetchError } = await supabaseAdmin
      .from('engineer_payouts')
      .select(`
        *,
        profile:profiles!engineer_payouts_engineer_id_fkey(
          id, full_name, stripe_connect_account_id, email
        )
      `)
      .eq('status', 'pending')
      .lte('eligible_for_payout_at', new Date().toISOString())
      .order('created_at', { ascending: true })
      .limit(25);

    if (fetchError) throw new Error(`Failed to fetch eligible payouts: ${fetchError.message}`);

    console.log(`[${runId}] Found ${eligiblePayouts?.length || 0} eligible payouts`);

    const results: PayoutResult[] = [];
    let processed = 0, failed = 0, skipped = 0, totalAmountTransferred = 0;

    for (const payout of eligiblePayouts || []) {
      const result: PayoutResult = { payoutId: payout.id, engineerId: payout.engineer_id, amount: payout.net_amount, status: 'skipped' };

      try {
        const stripeAccountId = payout.profile?.stripe_connect_account_id;
        if (!stripeAccountId) {
          result.error = 'No Stripe Connect account linked';
          skipped++;
          results.push(result);
          continue;
        }

        const stripeAccount = await stripe.accounts.retrieve(stripeAccountId);
        if (!stripeAccount.payouts_enabled) {
          result.error = 'Stripe account not enabled for payouts';
          skipped++;
          results.push(result);
          continue;
        }

        await supabaseAdmin.from('engineer_payouts').update({ status: 'processing' }).eq('id', payout.id);

        const transfer = await stripe.transfers.create({
          amount: Math.round(payout.net_amount * 100),
          currency: 'usd',
          destination: stripeAccountId,
          transfer_group: `payout_${payout.id}`,
          metadata: { payout_id: payout.id, engineer_id: payout.engineer_id, project_id: payout.project_id || '', run_id: runId },
        });

        await supabaseAdmin.from('engineer_payouts').update({
          status: 'completed', stripe_transfer_id: transfer.id, processed_at: new Date().toISOString(),
        }).eq('id', payout.id);

        await supabaseAdmin.from('notifications').insert({
          user_id: payout.engineer_id,
          title: 'Payout Completed',
          message: `Your payout of $${payout.net_amount.toFixed(2)} has been processed and is on its way to your bank account.`,
          type: 'payout_completed',
          metadata: { payout_id: payout.id, amount: payout.net_amount, transfer_id: transfer.id },
        });

        result.status = 'success';
        result.stripeTransferId = transfer.id;
        processed++;
        totalAmountTransferred += payout.net_amount;

      } catch (err) {
        await supabaseAdmin.from('engineer_payouts').update({ status: 'failed' }).eq('id', payout.id);
        result.status = 'failed';
        result.error = err instanceof Error ? err.message : 'Unknown error';
        failed++;
      }

      results.push(result);
    }

    const completedAt = new Date();

    await supabaseAdmin.from('payout_processing_logs').insert({
      run_id: runId,
      started_at: startTime.toISOString(),
      completed_at: completedAt.toISOString(),
      trigger_source: triggerSource,
      payouts_processed: processed,
      payouts_failed: failed,
      payouts_skipped: skipped,
      total_amount_transferred: totalAmountTransferred,
      processing_details: { results },
      error_details: failed > 0 ? { failed_payouts: results.filter(r => r.status === 'failed') } : null,
    }).then(({ error }) => { if (error) console.error(`[${runId}] Log error:`, error); });

    const response: ProcessingResult = {
      runId, startedAt: startTime.toISOString(), completedAt: completedAt.toISOString(),
      triggerSource, processed, failed, skipped, totalAmountTransferred, results,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
    });

  } catch (error) {
    console.error(`[${runId}] Fatal error:`, error);
    return new Response(JSON.stringify({
      error: 'Payout processing failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      runId,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500,
    });
  }
});
