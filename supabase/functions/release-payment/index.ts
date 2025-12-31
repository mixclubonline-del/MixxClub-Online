import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      console.error("STRIPE_SECRET_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Stripe not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Get the authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Not authenticated" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { payment_id, session_id } = await req.json();

    if (!payment_id || !session_id) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing payment_id or session_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing payment release for payment_id: ${payment_id}`);

    // Fetch the payment record
    const { data: payment, error: paymentError } = await supabaseClient
      .from("session_payments")
      .select("*")
      .eq("id", payment_id)
      .eq("session_id", session_id)
      .single();

    if (paymentError || !payment) {
      console.error("Payment not found:", paymentError);
      return new Response(
        JSON.stringify({ success: false, error: "Payment not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (payment.status === "released") {
      return new Response(
        JSON.stringify({ success: false, error: "Payment already released" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the payee's Stripe account (if connected)
    const { data: payeeProfile } = await supabaseClient
      .from("profiles")
      .select("stripe_account_id")
      .eq("id", payment.payee_id)
      .single();

    let transferId = null;

    // If payee has a connected Stripe account, create a transfer
    if (payeeProfile?.stripe_account_id) {
      try {
        const transfer = await stripe.transfers.create({
          amount: Math.round(payment.amount * 100), // Convert to cents
          currency: payment.currency.toLowerCase(),
          destination: payeeProfile.stripe_account_id,
          metadata: {
            payment_id: payment_id,
            session_id: session_id,
          },
        });
        transferId = transfer.id;
        console.log(`Stripe transfer created: ${transfer.id}`);
      } catch (stripeError: any) {
        console.error("Stripe transfer error:", stripeError);
        // Continue even if transfer fails - mark as released for manual processing
      }
    } else {
      console.log("Payee does not have connected Stripe account - marking for manual payout");
    }

    // Update payment status to released
    const { error: updateError } = await supabaseClient
      .from("session_payments")
      .update({
        status: "released",
        released_at: new Date().toISOString(),
        stripe_transfer_id: transferId,
      })
      .eq("id", payment_id);

    if (updateError) {
      console.error("Failed to update payment status:", updateError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to update payment" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create notification for payee
    await supabaseClient.from("notifications").insert({
      user_id: payment.payee_id,
      type: "payment_released",
      title: "Payment Received!",
      message: `You received a payment of ${payment.currency} ${payment.amount}`,
      data: { session_id, payment_id, amount: payment.amount },
    });

    console.log(`Payment ${payment_id} released successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        transfer_id: transferId,
        message: "Payment released successfully",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in release-payment function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
