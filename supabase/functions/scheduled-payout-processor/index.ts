import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = new Date();
  const runId = crypto.randomUUID();

  console.log(`[${runId}] Starting scheduled payout processing...`);

  try {
    // Parse request body for trigger source
    let triggerSource = 'api_call';
    try {
      const body = await req.json();
      triggerSource = body.trigger_source || 'api_call';
    } catch {
      // No body or invalid JSON, use default
    }

    // Initialize Supabase admin client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Initialize Stripe
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY not configured');
    }
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });

    // Fetch eligible payouts (pending + matured)
    const { data: eligiblePayouts, error: fetchError } = await supabaseAdmin
      .from('engineer_payouts')
      .select(`
        *,
        profile:profiles!engineer_payouts_engineer_id_fkey(
          id,
          full_name,
          stripe_connect_account_id,
          email
        )
      `)
      .eq('status', 'pending')
      .lte('eligible_for_payout_at', new Date().toISOString())
      .order('created_at', { ascending: true })
      .limit(25); // Batch size for rate limiting

    if (fetchError) {
      throw new Error(`Failed to fetch eligible payouts: ${fetchError.message}`);
    }

    console.log(`[${runId}] Found ${eligiblePayouts?.length || 0} eligible payouts`);

    const results: PayoutResult[] = [];
    let processed = 0;
    let failed = 0;
    let skipped = 0;
    let totalAmountTransferred = 0;

    // Process each payout
    for (const payout of eligiblePayouts || []) {
      const result: PayoutResult = {
        payoutId: payout.id,
        engineerId: payout.engineer_id,
        amount: payout.net_amount,
        status: 'skipped',
      };

      try {
        // Check if engineer has Stripe Connect account
        const stripeAccountId = payout.profile?.stripe_connect_account_id;
        if (!stripeAccountId) {
          result.status = 'skipped';
          result.error = 'No Stripe Connect account linked';
          skipped++;
          results.push(result);
          console.log(`[${runId}] Skipped payout ${payout.id}: No Stripe Connect account`);
          continue;
        }

        // Verify Stripe account is enabled for payouts
        const stripeAccount = await stripe.accounts.retrieve(stripeAccountId);
        if (!stripeAccount.payouts_enabled) {
          result.status = 'skipped';
          result.error = 'Stripe account not enabled for payouts';
          skipped++;
          results.push(result);
          console.log(`[${runId}] Skipped payout ${payout.id}: Payouts not enabled`);
          continue;
        }

        // Update status to processing
        await supabaseAdmin
          .from('engineer_payouts')
          .update({ status: 'processing' })
          .eq('id', payout.id);

        // Create Stripe transfer
        const transfer = await stripe.transfers.create({
          amount: Math.round(payout.net_amount * 100), // Convert to cents
          currency: 'usd',
          destination: stripeAccountId,
          transfer_group: `payout_${payout.id}`,
          metadata: {
            payout_id: payout.id,
            engineer_id: payout.engineer_id,
            project_id: payout.project_id || '',
            run_id: runId,
          },
        });

        // Update payout as completed
        await supabaseAdmin
          .from('engineer_payouts')
          .update({
            status: 'completed',
            stripe_transfer_id: transfer.id,
            processed_at: new Date().toISOString(),
          })
          .eq('id', payout.id);

        // Send notification to engineer
        await supabaseAdmin
          .from('notifications')
          .insert({
            user_id: payout.engineer_id,
            title: 'Payout Completed',
            message: `Your payout of $${payout.net_amount.toFixed(2)} has been processed and is on its way to your bank account.`,
            type: 'payout_completed',
            metadata: {
              payout_id: payout.id,
              amount: payout.net_amount,
              transfer_id: transfer.id,
            },
          });

        result.status = 'success';
        result.stripeTransferId = transfer.id;
        processed++;
        totalAmountTransferred += payout.net_amount;

        console.log(`[${runId}] Successfully processed payout ${payout.id}: $${payout.net_amount}`);

      } catch (err) {
        // Mark as failed
        await supabaseAdmin
          .from('engineer_payouts')
          .update({ status: 'failed' })
          .eq('id', payout.id);

        result.status = 'failed';
        result.error = err instanceof Error ? err.message : 'Unknown error';
        failed++;

        console.error(`[${runId}] Failed payout ${payout.id}:`, err);
      }

      results.push(result);
    }

    const completedAt = new Date();

    // Log the processing run
    const { error: logError } = await supabaseAdmin
      .from('payout_processing_logs')
      .insert({
        run_id: runId,
        started_at: startTime.toISOString(),
        completed_at: completedAt.toISOString(),
        trigger_source: triggerSource,
        payouts_processed: processed,
        payouts_failed: failed,
        payouts_skipped: skipped,
        total_amount_transferred: totalAmountTransferred,
        processing_details: { results },
        error_details: failed > 0 ? { 
          failed_payouts: results.filter(r => r.status === 'failed') 
        } : null,
      });

    if (logError) {
      console.error(`[${runId}] Failed to log processing run:`, logError);
    }

    const response: ProcessingResult = {
      runId,
      startedAt: startTime.toISOString(),
      completedAt: completedAt.toISOString(),
      triggerSource,
      processed,
      failed,
      skipped,
      totalAmountTransferred,
      results,
    };

    console.log(`[${runId}] Processing complete: ${processed} processed, ${failed} failed, ${skipped} skipped`);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error(`[${runId}] Fatal error in payout processing:`, error);

    return new Response(JSON.stringify({
      error: 'Payout processing failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      runId,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
