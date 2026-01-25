// See PHASE_1_STARTUP_GUIDE.md for full code
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "");
const FRONTEND_URL = Deno.env.get("FRONTEND_URL") || "http://localhost:5173";

serve(async (req) => {
  if (req.method === "POST") {
    try {
      const { priceId, userId, successUrl, cancelUrl } = await req.json();
      
      const session = await stripe.checkout.sessions.create({
        customer_email: userId,
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "subscription",
        success_url: `${FRONTEND_URL}${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${FRONTEND_URL}${cancelUrl}`,
      });

      return new Response(
        JSON.stringify({ sessionId: session.id, url: session.url }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("Checkout error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }
  return new Response("Method not allowed", { status: 405 });
});
