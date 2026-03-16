import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

/**
 * Verify Stripe Session Edge Function
 * Retrieves session details from Stripe and returns payment info for success page
 * Supports: mixing, mastering, distribution, subscription, coinz, beat, course
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: 'Session ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-08-27.basil',
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'payment_intent'],
    });

    if (!session) {
      return new Response(
        JSON.stringify({ error: 'Session not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: payment } = await supabase
      .from('payments')
      .select('id, amount, status, package_type, completed_at')
      .eq('stripe_checkout_session_id', sessionId)
      .single();

    // Resolve package name from metadata
    let packageName = 'Purchase';
    const packageType = session.metadata?.packageType || session.metadata?.package_type;
    const packageId = session.metadata?.packageId || session.metadata?.package_id;
    const purchaseType = session.metadata?.purchase_type;

    // Handle coinz purchases
    if (purchaseType === 'coinz') {
      const coinzAmount = session.metadata?.coinz_amount || '0';
      const coinzPackageId = session.metadata?.package_id;
      const coinzPackageNames: Record<string, string> = {
        starter: 'Starter Pack',
        popular: 'Popular Pack',
        best_value: 'Best Value Pack',
      };
      packageName = coinzPackageNames[coinzPackageId || ''] || `${coinzAmount} MixxCoinz`;
    }
    // Handle beat purchases
    else if (purchaseType === 'beat') {
      const beatId = session.metadata?.beat_id;
      if (beatId) {
        const { data: beat } = await supabase
          .from('producer_beats')
          .select('title')
          .eq('id', beatId)
          .single();
        packageName = beat?.title ? `Beat: ${beat.title}` : 'Beat Purchase';
      } else {
        packageName = 'Beat Purchase';
      }
    }
    // Handle course purchases
    else if (packageType === 'course') {
      const courseId = session.metadata?.course_id;
      if (courseId) {
        const { data: course } = await supabase
          .from('courses')
          .select('title')
          .eq('id', courseId)
          .single();
        packageName = course?.title || 'Course Enrollment';
      }
    }
    // Handle standard service packages
    else if (packageType && packageId) {
      let tableName = '';
      let nameField = 'name';
      
      switch (packageType) {
        case 'mixing':
          tableName = 'mixing_packages';
          nameField = 'package_name';
          break;
        case 'mastering':
          tableName = 'mastering_packages';
          break;
        case 'distribution':
          tableName = 'distribution_packages';
          nameField = 'package_name';
          break;
        case 'subscription':
          tableName = 'subscription_plans';
          nameField = 'display_name';
          break;
        case 'addon':
          tableName = 'addon_services';
          nameField = 'service_name';
          break;
      }

      if (tableName) {
        const { data: pkg } = await supabase
          .from(tableName)
          .select(nameField)
          .eq('id', packageId)
          .single();
        
        if (pkg) {
          packageName = pkg[nameField as keyof typeof pkg] as string || packageName;
        }
      }
    }

    const response = {
      success: session.payment_status === 'paid' || session.status === 'complete',
      payment: {
        id: payment?.id || null,
        amount: (session.amount_total || 0) / 100,
        currency: session.currency?.toUpperCase() || 'USD',
        packageType: purchaseType || packageType || 'general',
        packageName: packageName,
        status: payment?.status || (session.payment_status === 'paid' ? 'completed' : 'pending'),
        completedAt: payment?.completed_at || new Date().toISOString(),
      },
      customer: {
        email: session.customer_details?.email || null,
      },
      metadata: session.metadata,
    };

    console.log('[VERIFY-SESSION] Session verified:', sessionId, response.success);

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('[VERIFY-SESSION] Error:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      return new Response(
        JSON.stringify({ error: 'Session not found or expired', details: (error as Error).message }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
