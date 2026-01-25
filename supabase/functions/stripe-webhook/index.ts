// See PHASE_1_STARTUP_GUIDE.md for full code
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "");
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === "POST") {
    const signature = req.headers.get("stripe-signature");
    const body = await req.text();

    try {
      const event = await stripe.webhooks.constructEventAsync(body, signature || "", webhookSecret);

      switch (event.type) {
        case "customer.subscription.created":
          console.log("Subscription created:", event.data.object);
          break;
        case "customer.subscription.updated":
          console.log("Subscription updated:", event.data.object);
          break;
        case "charge.succeeded":
          console.log("Charge succeeded:", event.data.object);
          break;
      }

      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Webhook error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
  }
  return new Response("Method not allowed", { status: 405 });
});
