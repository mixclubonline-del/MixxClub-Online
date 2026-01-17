import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';
import { webhookHeaders } from '../_shared/cors.ts';

/**
 * Enhanced Stripe Webhook Handler
 * Processes all payment events: checkout completed, subscription events, invoice paid
 * Records payments, triggers engineer payouts, updates user subscriptions
 */

const PLATFORM_FEE_PERCENTAGE = 0.30; // 30% platform fee
const ENGINEER_SHARE_PERCENTAGE = 0.70; // 70% to engineer

serve(async (req) => {
  // Webhooks should not accept OPTIONS/preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 405 });
  }

  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      console.error('[STRIPE-WEBHOOK] No signature provided');
      return new Response('No signature', { status: 400 });
    }

    const body = await req.text();
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-08-27.basil',
    });

    const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret!);
    } catch (err) {
      console.error('[STRIPE-WEBHOOK] Signature verification failed:', err);
      return new Response('Invalid signature', { status: 400 });
    }

    // Use service role to bypass RLS for database operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`[STRIPE-WEBHOOK] Processing event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(supabase, stripe, event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'invoice.paid':
        await handleInvoicePaid(supabase, event.data.object as Stripe.Invoice);
        break;
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(supabase, event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(supabase, event.data.object as Stripe.Subscription);
        break;
      
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(supabase, event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'transfer.created':
        await handleTransferCreated(supabase, event.data.object as Stripe.Transfer);
        break;

      default:
        console.log(`[STRIPE-WEBHOOK] Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: webhookHeaders, status: 200 }
    );
  } catch (error) {
    console.error('[STRIPE-WEBHOOK] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: webhookHeaders, status: 500 }
    );
  }
});

/**
 * Handle checkout.session.completed event
 * Records payment, creates subscription records, triggers engineer payout, processes referrals
 */
async function handleCheckoutCompleted(
  supabase: ReturnType<typeof createClient>,
  stripe: Stripe,
  session: Stripe.Checkout.Session
) {
  console.log('[STRIPE-WEBHOOK] Checkout completed:', session.id);

  const userId = session.client_reference_id || session.metadata?.user_id;
  const packageId = session.metadata?.packageId || session.metadata?.package_id;
  const packageType = session.metadata?.packageType || session.metadata?.package_type;
  const engineerId = session.metadata?.engineer_id;
  const projectId = session.metadata?.project_id;
  const referralCode = session.metadata?.referral_code;

  if (!userId) {
    console.error('[STRIPE-WEBHOOK] No user ID in session');
    return;
  }

  // Calculate amounts
  const amountTotal = (session.amount_total || 0) / 100; // Convert from cents

  // Record the payment
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .insert({
      user_id: userId,
      stripe_checkout_session_id: session.id,
      stripe_customer_id: session.customer as string,
      stripe_payment_intent_id: session.payment_intent as string,
      amount: amountTotal,
      currency: session.currency?.toUpperCase() || 'USD',
      status: 'completed',
      payment_type: session.mode === 'subscription' ? 'subscription' : 'one_time',
      package_type: packageType,
      package_id: packageId,
      metadata: {
        session_id: session.id,
        package_type: packageType,
        package_id: packageId,
        engineer_id: engineerId,
        project_id: projectId,
        referral_code: referralCode,
      },
      completed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (paymentError) {
    console.error('[STRIPE-WEBHOOK] Error recording payment:', paymentError);
  } else {
    console.log('[STRIPE-WEBHOOK] Payment recorded:', payment.id);
  }

  // Handle subscription creation if applicable
  if (packageType && packageId) {
    await createUserSubscription(supabase, userId, packageId, packageType, session);
  }

  // Queue engineer payout if engineer was assigned
  if (engineerId && payment) {
    await queueEngineerPayout(supabase, {
      engineerId,
      paymentId: payment.id,
      projectId,
      grossAmount: amountTotal,
    });
  }

  // Record earnings in engineer_earnings if applicable
  if (engineerId) {
    await recordEngineerEarnings(supabase, engineerId, amountTotal, projectId);
  }

  // Process referral commission if referral code present
  if (referralCode && payment) {
    await processReferralCommission(supabase, {
      referralCode,
      paymentId: payment.id,
      paymentAmount: amountTotal,
      referredUserId: userId,
    });
  }
}

/**
 * Process referral commission for successful payment
 * Calculates tier-based commission and updates referral record
 */
async function processReferralCommission(
  supabase: ReturnType<typeof createClient>,
  params: {
    referralCode: string;
    paymentId: string;
    paymentAmount: number;
    referredUserId: string;
  }
) {
  console.log('[STRIPE-WEBHOOK] Processing referral commission for code:', params.referralCode);

  // Find the referral record by code
  const { data: referral, error: referralError } = await supabase
    .from('distribution_referrals')
    .select('*')
    .eq('referral_code', params.referralCode)
    .eq('status', 'pending')
    .single();

  if (referralError || !referral) {
    console.log('[STRIPE-WEBHOOK] No pending referral found for code:', params.referralCode);
    return;
  }

  // Get referrer's tier info for commission calculation
  const { data: referrerProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', referral.referrer_id)
    .single();

  // Count successful referrals to determine tier
  const { count: successfulReferrals } = await supabase
    .from('distribution_referrals')
    .select('id', { count: 'exact' })
    .eq('referrer_id', referral.referrer_id)
    .eq('status', 'completed');

  // Calculate commission based on tier
  const referralCount = successfulReferrals || 0;
  let commissionRate = 0.10; // Default 10% Bronze

  if (referralCount >= 200) {
    commissionRate = 0.30; // Platinum
  } else if (referralCount >= 50) {
    commissionRate = 0.20; // Gold
  } else if (referralCount >= 10) {
    commissionRate = 0.15; // Silver
  }

  const commissionAmount = params.paymentAmount * commissionRate;

  // Update referral record
  const { error: updateError } = await supabase
    .from('distribution_referrals')
    .update({
      status: 'completed',
      referred_user_id: params.referredUserId,
      commission_amount: commissionAmount,
    })
    .eq('id', referral.id);

  if (updateError) {
    console.error('[STRIPE-WEBHOOK] Error updating referral:', updateError);
    return;
  }

  console.log(`[STRIPE-WEBHOOK] Referral commission processed: $${commissionAmount.toFixed(2)} (${(commissionRate * 100)}%)`);

  // Create notification for referrer
  try {
    await supabase.rpc('create_notification', {
      p_user_id: referral.referrer_id,
      p_title: 'Referral Commission Earned!',
      p_message: `You earned $${commissionAmount.toFixed(2)} from a successful referral!`,
      p_type: 'referral_commission',
      p_metadata: {
        referral_id: referral.id,
        payment_id: params.paymentId,
        commission_amount: commissionAmount,
        commission_rate: commissionRate,
      },
    });
  } catch (notifError) {
    console.error('[STRIPE-WEBHOOK] Error creating referral notification:', notifError);
  }
}

/**
 * Create user subscription record based on package type
 */
async function createUserSubscription(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  packageId: string,
  packageType: string,
  session: Stripe.Checkout.Session
) {
  let tableName: string;
  
  switch (packageType) {
    case 'mixing':
      tableName = 'user_mixing_subscriptions';
      break;
    case 'distribution':
      tableName = 'user_distribution_subscriptions';
      break;
    case 'mastering':
      tableName = 'user_mastering_subscriptions';
      break;
    case 'subscription':
      // Handle platform subscriptions
      tableName = 'user_subscriptions';
      break;
    default:
      console.log(`[STRIPE-WEBHOOK] No subscription table for type: ${packageType}`);
      return;
  }

  const { error } = await supabase
    .from(tableName)
    .upsert({
      user_id: userId,
      package_id: packageId,
      stripe_customer_id: session.customer,
      stripe_subscription_id: session.subscription,
      status: 'active',
      tracks_used: 0,
      created_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id'
    });

  if (error) {
    console.error(`[STRIPE-WEBHOOK] Error creating ${packageType} subscription:`, error);
  } else {
    console.log(`[STRIPE-WEBHOOK] ${packageType} subscription created for user ${userId}`);
  }
}

/**
 * Queue engineer payout with platform fee calculation
 */
async function queueEngineerPayout(
  supabase: ReturnType<typeof createClient>,
  params: {
    engineerId: string;
    paymentId: string;
    projectId?: string;
    grossAmount: number;
  }
) {
  const platformFee = params.grossAmount * PLATFORM_FEE_PERCENTAGE;
  const netAmount = params.grossAmount * ENGINEER_SHARE_PERCENTAGE;

  const { error } = await supabase
    .from('engineer_payouts')
    .insert({
      engineer_id: params.engineerId,
      payment_id: params.paymentId,
      project_id: params.projectId,
      gross_amount: params.grossAmount,
      platform_fee: platformFee,
      net_amount: netAmount,
      status: 'pending',
    });

  if (error) {
    console.error('[STRIPE-WEBHOOK] Error queuing engineer payout:', error);
  } else {
    console.log(`[STRIPE-WEBHOOK] Engineer payout queued: $${netAmount.toFixed(2)}`);
  }
}

/**
 * Record earnings in engineer_earnings table
 */
async function recordEngineerEarnings(
  supabase: ReturnType<typeof createClient>,
  engineerId: string,
  amount: number,
  projectId?: string
) {
  const engineerShare = amount * ENGINEER_SHARE_PERCENTAGE;

  const { error } = await supabase
    .from('engineer_earnings')
    .insert({
      engineer_id: engineerId,
      amount: engineerShare,
      project_id: projectId,
      status: 'pending',
      source: 'project_payment',
      created_at: new Date().toISOString(),
    });

  if (error) {
    console.error('[STRIPE-WEBHOOK] Error recording earnings:', error);
  }
}

/**
 * Handle invoice.paid event for recurring subscriptions
 */
async function handleInvoicePaid(
  supabase: ReturnType<typeof createClient>,
  invoice: Stripe.Invoice
) {
  console.log('[STRIPE-WEBHOOK] Invoice paid:', invoice.id);

  // Find the user by customer ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', invoice.customer)
    .single();

  if (profile) {
    // Record the recurring payment
    await supabase.from('payments').insert({
      user_id: profile.id,
      stripe_customer_id: invoice.customer as string,
      stripe_payment_intent_id: invoice.payment_intent as string,
      amount: (invoice.amount_paid || 0) / 100,
      currency: invoice.currency?.toUpperCase() || 'USD',
      status: 'completed',
      payment_type: 'subscription',
      metadata: {
        invoice_id: invoice.id,
        subscription_id: invoice.subscription,
      },
      completed_at: new Date().toISOString(),
    });
  }
}

/**
 * Handle subscription status changes
 */
async function handleSubscriptionChange(
  supabase: ReturnType<typeof createClient>,
  subscription: Stripe.Subscription
) {
  console.log('[STRIPE-WEBHOOK] Subscription changed:', subscription.id, subscription.status);

  // Find user by customer ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', subscription.customer)
    .single();

  if (profile) {
    // Update user subscription status
    await supabase
      .from('user_subscriptions')
      .update({
        status: subscription.status,
        stripe_subscription_id: subscription.id,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', profile.id);
  }
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionCanceled(
  supabase: ReturnType<typeof createClient>,
  subscription: Stripe.Subscription
) {
  console.log('[STRIPE-WEBHOOK] Subscription canceled:', subscription.id);

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', subscription.customer)
    .single();

  if (profile) {
    await supabase
      .from('user_subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', profile.id);
  }
}

/**
 * Handle payment intent succeeded (for one-time payments without checkout)
 */
async function handlePaymentIntentSucceeded(
  supabase: ReturnType<typeof createClient>,
  paymentIntent: Stripe.PaymentIntent
) {
  console.log('[STRIPE-WEBHOOK] Payment intent succeeded:', paymentIntent.id);

  // Check if we already recorded this payment via checkout
  const { data: existing } = await supabase
    .from('payments')
    .select('id')
    .eq('stripe_payment_intent_id', paymentIntent.id)
    .single();

  if (!existing) {
    // Record the payment if not already recorded
    const userId = paymentIntent.metadata?.user_id;
    if (userId) {
      await supabase.from('payments').insert({
        user_id: userId,
        stripe_payment_intent_id: paymentIntent.id,
        stripe_customer_id: paymentIntent.customer as string,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        status: 'completed',
        payment_type: 'one_time',
        metadata: paymentIntent.metadata,
        completed_at: new Date().toISOString(),
      });
    }
  }
}

/**
 * Handle transfer created (for engineer payouts via Connect)
 */
async function handleTransferCreated(
  supabase: ReturnType<typeof createClient>,
  transfer: Stripe.Transfer
) {
  console.log('[STRIPE-WEBHOOK] Transfer created:', transfer.id);

  const payoutId = transfer.metadata?.payout_id;
  if (payoutId) {
    await supabase
      .from('engineer_payouts')
      .update({
        stripe_transfer_id: transfer.id,
        status: 'completed',
        processed_at: new Date().toISOString(),
      })
      .eq('id', payoutId);
  }
}
