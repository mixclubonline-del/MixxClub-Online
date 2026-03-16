import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders } from '../_shared/cors.ts';
import { MINIMUM_PAYOUT_AMOUNT } from '../_shared/constants.ts';

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    const authHeader = req.headers.get("Authorization")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { amount, paymentMethod, notes } = await req.json();

    // Validate amount
    if (!amount || amount < MINIMUM_PAYOUT_AMOUNT) {
      return new Response(JSON.stringify({ error: `Minimum payout is $${MINIMUM_PAYOUT_AMOUNT}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Determine available balance from BOTH engineer_earnings AND producer_earnings
    const { data: engineerEarnings, error: engErr } = await supabaseAdmin
      .from("engineer_earnings")
      .select("amount")
      .eq("engineer_id", user.id)
      .eq("status", "pending");

    if (engErr) {
      console.error("Error fetching engineer earnings:", engErr);
    }

    const { data: producerEarnings, error: prodErr } = await supabaseAdmin
      .from("producer_earnings")
      .select("amount_cents")
      .eq("producer_id", user.id)
      .eq("status", "pending");

    if (prodErr) {
      console.error("Error fetching producer earnings:", prodErr);
    }

    const engineerBalance = (engineerEarnings || []).reduce((sum, e) => sum + (e.amount || 0), 0);
    const producerBalanceCents = (producerEarnings || []).reduce((sum, e) => sum + (e.amount_cents || 0), 0);
    const producerBalance = producerBalanceCents / 100; // Convert cents to dollars

    const availableBalance = engineerBalance + producerBalance;

    // Subtract any pending payout requests
    const { data: pendingPayouts } = await supabaseAdmin
      .from("payout_requests")
      .select("amount")
      .eq("user_id", user.id)
      .in("status", ["pending", "processing"]);

    const pendingAmount = (pendingPayouts || []).reduce((sum, p) => sum + (p.amount || 0), 0);
    const effectiveBalance = availableBalance - pendingAmount;

    if (effectiveBalance < amount) {
      return new Response(JSON.stringify({ 
        error: `Insufficient balance. Available: $${effectiveBalance.toFixed(2)}, Requested: $${amount.toFixed(2)}` 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create payout request
    const { data: payout, error: payoutError } = await supabase
      .from("payout_requests")
      .insert({
        user_id: user.id,
        amount,
        payment_method: paymentMethod || "stripe",
        notes,
        status: "pending",
      })
      .select()
      .single();

    if (payoutError) throw payoutError;

    console.log(`Payout request created: ${payout.id} for $${amount} (engineer: $${engineerBalance.toFixed(2)}, producer: $${producerBalance.toFixed(2)}, pending payouts: $${pendingAmount.toFixed(2)})`);

    return new Response(JSON.stringify({ success: true, payout }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Payout request error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
