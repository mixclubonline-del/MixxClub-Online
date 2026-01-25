#!/bin/bash

# MixClub Phase 1 Deployment Script
# Run this after Supabase is set up to deploy all Edge Functions

set -e

echo "🚀 MixClub Phase 1 - Edge Functions Deployment"
echo "=============================================="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Install with: npm install -g supabase"
    exit 1
fi

# Check if logged in
echo "🔐 Checking Supabase authentication..."
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase. Run: supabase login"
    exit 1
fi

echo "✅ Authenticated"
echo ""

# Create functions directory if not exists
mkdir -p supabase/functions/{checkout,stripe-webhook,usage,referral}

echo "📁 Creating Edge Functions..."
echo ""

# Function 1: Checkout
echo "1️⃣  Deploying checkout function..."
cat > supabase/functions/checkout/index.ts << 'EOF'
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
EOF

supabase functions deploy checkout && echo "✅ Checkout deployed"
echo ""

# Function 2: Stripe Webhook
echo "2️⃣  Deploying stripe-webhook function..."
cat > supabase/functions/stripe-webhook/index.ts << 'EOF'
// See PHASE_1_STARTUP_GUIDE.md for full code
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";
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
      const event = stripe.webhooks.constructEvent(body, signature || "", webhookSecret);

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
EOF

supabase functions deploy stripe-webhook && echo "✅ Webhook deployed"
echo ""

# Function 3: Usage
echo "3️⃣  Deploying usage function..."
cat > supabase/functions/usage/index.ts << 'EOF'
// See PHASE_1_STARTUP_GUIDE.md for full code
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const token = authHeader.replace("Bearer ", "");
  const { data: user } = await supabase.auth.getUser(token);

  if (!user) {
    return new Response(JSON.stringify({ error: "Invalid token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (req.method === "GET") {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const { data: usage } = await supabase
      .from("usage_metrics")
      .select("*")
      .eq("user_id", user.id)
      .eq("month", month)
      .single();

    return new Response(
      JSON.stringify(usage || { tracks_processed: 0 }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response("Method not allowed", { status: 405 });
});
EOF

supabase functions deploy usage && echo "✅ Usage deployed"
echo ""

# Function 4: Referral
echo "4️⃣  Deploying referral function..."
cat > supabase/functions/referral/index.ts << 'EOF'
// See PHASE_1_STARTUP_GUIDE.md for full code
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

function generateReferralCode(): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

serve(async (req) => {
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");
  const { data: user } = await supabase.auth.getUser(token || "");

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  if (req.method === "POST" && action === "generate") {
    const code = generateReferralCode();

    const { data, error } = await supabase
      .from("referral_codes")
      .insert({
        user_id: user.id,
        code,
        reward_type: "credit",
        reward_value: 10,
      })
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response("Method not allowed", { status: 405 });
});
EOF

supabase functions deploy referral && echo "✅ Referral deployed"
echo ""

echo "=============================================="
echo "✅ All functions deployed successfully!"
echo "=============================================="
echo ""
echo "📝 Next steps:"
echo "1. Set environment variables in Supabase:"
echo "   - STRIPE_SECRET_KEY"
echo "   - STRIPE_WEBHOOK_SECRET"
echo "   - STRIPE_PUBLISHABLE_KEY"
echo "   - FRONTEND_URL"
echo ""
echo "2. Configure Stripe webhook:"
echo "   - Go to Stripe Dashboard → Webhooks"
echo "   - Add: https://[project-id].functions.supabase.co/stripe-webhook"
echo "   - Select events: charge.*, customer.subscription.*"
echo ""
echo "3. Test checkout flow:"
echo "   - Visit http://localhost:5173/pricing"
echo "   - Click upgrade button"
echo "   - Use Stripe test card: 4242 4242 4242 4242"
echo ""
echo "4. Monitor logs:"
echo "   - Supabase Dashboard → Functions → Logs"
echo ""
