import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Stripe not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-08-27.basil",
    });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

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

    const { data: payment, error: paymentError } = await supabaseClient
      .from("session_payments")
      .select("*")
      .eq("id", payment_id)
      .eq("session_id", session_id)
      .single();

    if (paymentError || !payment) {
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

    const { data: payeeProfile } = await supabaseClient
      .from("profiles")
      .select("stripe_account_id")
      .eq("id", payment.payee_id)
      .single();

    let transferId = null;

    if (payeeProfile?.stripe_account_id) {
      try {
        const transfer = await stripe.transfers.create({
          amount: Math.round(payment.amount * 100),
          currency: payment.currency.toLowerCase(),
          destination: payeeProfile.stripe_account_id,
          metadata: { payment_id, session_id },
        });
        transferId = transfer.id;
        console.log(`Stripe transfer created: ${transfer.id}`);
      } catch (stripeError) {
        console.error("Stripe transfer error:", stripeError);
      }
    }

    await supabaseClient.from("session_payments").update({
      status: "released",
      released_at: new Date().toISOString(),
      stripe_transfer_id: transferId,
    }).eq("id", payment_id);

    await supabaseClient.from("notifications").insert({
      user_id: payment.payee_id,
      type: "payment_released",
      title: "Payment Received!",
      message: `You received a payment of ${payment.currency} ${payment.amount}`,
    });

    return new Response(
      JSON.stringify({ success: true, transfer_id: transferId, message: "Payment released successfully" }),
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
