import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';
import Stripe from 'https://esm.sh/stripe@18.5.0';
import { getCorsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Optional: Authenticate caller for manual triggers
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
      );

      const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
      if (userError || !user) {
        throw new Error('Unauthorized');
      }

      // Check if user is admin
      const { data: userRole } = await supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (userRole?.role !== 'admin') {
        throw new Error('Admin access required');
      }
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-08-27.basil',
    });

    // Get all pending or retryable payouts
    const { data: pendingPayouts, error: payoutsError } = await supabaseAdmin
      .from('engineer_payouts')
      .select(`
        *,
        profiles!engineer_payouts_engineer_id_fkey (
          id,
          stripe_connect_account_id,
          full_name,
          email
        )
      `)
      .or('status.eq.pending,and(status.eq.retry_pending,next_retry_at.lte.' + new Date().toISOString() + ')');

    if (payoutsError) {
      throw new Error(`Failed to fetch pending payouts: ${payoutsError.message}`);
    }

    if (!pendingPayouts || pendingPayouts.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No pending payouts to process', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const results = {
      processed: 0,
      failed: 0,
      skipped: 0,
      details: [] as Array<{ id: string; status: string; message: string }>,
    };

    for (const payout of pendingPayouts) {
      const profile = payout.profiles;
      
      if (!profile?.stripe_connect_account_id) {
        results.skipped++;
        results.details.push({ id: payout.id, status: 'skipped', message: 'Engineer has no Stripe Connect account' });
        continue;
      }

      try {
        const account = await stripe.accounts.retrieve(profile.stripe_connect_account_id);
        
        if (!account.payouts_enabled) {
          results.skipped++;
          results.details.push({ id: payout.id, status: 'skipped', message: 'Engineer Stripe account not enabled for payouts' });
          continue;
        }

        await supabaseAdmin.from('engineer_payouts').update({ status: 'processing' }).eq('id', payout.id);

        const transfer = await stripe.transfers.create({
          amount: Math.round(payout.net_amount * 100),
          currency: 'usd',
          destination: profile.stripe_connect_account_id,
          metadata: {
            payout_id: payout.id,
            engineer_id: payout.engineer_id,
            project_id: payout.project_id || '',
            payment_id: payout.payment_id || '',
          },
        });

        await supabaseAdmin.from('engineer_payouts').update({
          status: 'completed',
          stripe_transfer_id: transfer.id,
          processed_at: new Date().toISOString(),
        }).eq('id', payout.id);

        await supabaseAdmin.from('notifications').insert({
          user_id: payout.engineer_id,
          title: 'Payout Completed',
          message: `Your payout of $${payout.net_amount.toFixed(2)} has been transferred to your bank account.`,
          type: 'payout',
          metadata: { payout_id: payout.id, amount: payout.net_amount, transfer_id: transfer.id },
        });

        results.processed++;
        results.details.push({ id: payout.id, status: 'completed', message: `Transfer ${transfer.id} created successfully` });

      } catch (transferError) {
        console.error(`Transfer failed for payout ${payout.id}:`, transferError);
        
        const currentRetry = (payout.retry_count || 0) + 1;
        const MAX_RETRIES = 3;
        
        if (currentRetry < MAX_RETRIES) {
          // Schedule retry with exponential backoff (5min, 20min, 80min)
          const backoffMs = Math.pow(4, currentRetry) * 5 * 60 * 1000;
          const nextRetry = new Date(Date.now() + backoffMs).toISOString();
          
          await supabaseAdmin.from('engineer_payouts').update({
            status: 'retry_pending',
            retry_count: currentRetry,
            next_retry_at: nextRetry,
          }).eq('id', payout.id);
          
          results.failed++;
          results.details.push({
            id: payout.id,
            status: 'retry_scheduled',
            message: `Retry ${currentRetry}/${MAX_RETRIES} scheduled for ${nextRetry}`,
          });
        } else {
          // Max retries exhausted — mark as failed and notify admin
          await supabaseAdmin.from('engineer_payouts').update({
            status: 'failed',
            retry_count: currentRetry,
          }).eq('id', payout.id);
          
          // Notify admins
          const { data: admins } = await supabaseAdmin
            .from('user_roles')
            .select('user_id')
            .eq('role', 'admin');
          
          if (admins) {
            for (const admin of admins) {
              await supabaseAdmin.rpc('create_notification_checked', {
                p_user_id: admin.user_id,
                p_title: '❌ Engineer Payout Failed',
                p_message: `Payout of $${payout.net_amount.toFixed(2)} for engineer ${payout.engineer_id} failed after ${MAX_RETRIES} retries.`,
                p_type: 'payment',
              });
            }
          }
          
          results.failed++;
          results.details.push({
            id: payout.id,
            status: 'failed',
            message: `Failed after ${MAX_RETRIES} retries: ${transferError instanceof Error ? transferError.message : 'Unknown error'}`,
          });
        }
      }
    }

    return new Response(
      JSON.stringify({ message: 'Payout processing complete', ...results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Process engineer payout error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
