# 🚀 PHASE 1: BACKEND CRITICAL PATH - STARTUP GUIDE

**Status**: Ready to Execute  
**Start Date**: December 26, 2025  
**Duration**: 3 weeks (15 days of work)  
**Target Completion**: January 15, 2026  

---

## 📋 PRE-START CHECKLIST

Before beginning Phase 1, ensure:

```
✅ Team assigned:
  - 1 Backend Lead
  - 2-3 Backend Developers
  - 1 DevOps Engineer
  - 1 QA Engineer

✅ Tools/Accounts created:
  - GitHub repo access
  - Slack workspace
  - Linear/Jira board for tracking
  - Development machine setup

✅ Documents reviewed:
  - IMPLEMENTATION_GUIDE.md
  - ACTION_PLAN_COMPLETE.md (Phase 1)
  - Database schema below

✅ Kickoff meeting completed:
  - Team understands goals
  - Timeline communicated
  - Dependencies identified
```

---

## 📦 WEEK 1: DATABASE & INFRASTRUCTURE SETUP

### **TASK 1: Supabase Project Setup** (Days 1-2)
**Owner**: DevOps Lead | Duration: 8 hours

#### Step-by-Step Instructions:

1. **Create Supabase Account** (if not exists)
   - Go to https://app.supabase.com
   - Click "New project"
   - Organization: MixClub
   - Project name: `mixclub-prod` (or `mixclub-staging` for testing)
   - Database password: Generate strong password, save to 1Password/vault
   - Region: Choose closest to users (recommend `us-east-1`)
   - Click "Create new project"
   - Wait 2-3 minutes for database to initialize

2. **Save Connection Details**
   - Navigate to Settings → Database
   - Copy connection string (PostgreSQL)
   - Save to secure location with:
     ```
     SUPABASE_URL=https://[project-id].supabase.co
     SUPABASE_ANON_KEY=[anon-key]
     SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
     DATABASE_URL=[connection-string]
     ```

3. **Enable Required Extensions**
   - Go to SQL Editor
   - Run queries below:
     ```sql
     CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
     CREATE EXTENSION IF NOT EXISTS "http";
     CREATE EXTENSION IF NOT EXISTS "pg_net";
     ```

4. **Set Up Backups**
   - Settings → Database → Backups
   - Enable daily backups
   - Set retention to 7 days (minimum)

**Checkpoint 1.1**: ✅ Supabase project created with backups enabled

---

### **TASK 2: Create Database Schema** (Days 1-3)
**Owner**: Backend Lead | Duration: 12 hours

Copy and run these SQL statements in Supabase SQL Editor:

```sql
-- ============================================
-- USER & PROFILE TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS public.users_extended (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type VARCHAR(50) CHECK (user_type IN ('artist', 'engineer', 'studio', 'enterprise')),
  display_name VARCHAR(255),
  avatar_url TEXT,
  bio TEXT,
  website URL,
  location VARCHAR(255),
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- SUBSCRIPTION & BILLING TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier VARCHAR(50) CHECK (tier IN ('free', 'starter', 'pro', 'studio', 'enterprise')),
  stripe_customer_id VARCHAR(255) UNIQUE,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_price_id VARCHAR(255),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  status VARCHAR(50) CHECK (status IN ('active', 'past_due', 'canceled', 'paused')),
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, stripe_subscription_id)
);

CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_method_id VARCHAR(255) UNIQUE,
  card_last_four VARCHAR(4),
  card_brand VARCHAR(50),
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_invoice_id VARCHAR(255) UNIQUE,
  subscription_id UUID REFERENCES public.subscriptions(id),
  amount_paid DECIMAL(10, 2),
  amount_due DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) CHECK (status IN ('draft', 'open', 'paid', 'uncollectible', 'void')),
  invoice_date TIMESTAMP,
  due_date TIMESTAMP,
  paid_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- USAGE & CREDITS TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS public.usage_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month VARCHAR(7) CHECK (month ~ '^\d{4}-\d{2}$'),
  tracks_processed INTEGER DEFAULT 0,
  masters_completed INTEGER DEFAULT 0,
  storage_used_gb DECIMAL(8, 2) DEFAULT 0,
  api_calls_used INTEGER DEFAULT 0,
  engineer_matches_used INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, month)
);

CREATE TABLE IF NOT EXISTS public.user_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance DECIMAL(10, 2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  source VARCHAR(50) CHECK (source IN ('subscription', 'referral', 'promotion', 'admin')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2),
  transaction_type VARCHAR(50) CHECK (transaction_type IN ('earned', 'spent', 'refund', 'adjustment')),
  reason VARCHAR(255),
  related_transaction_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- REFERRAL TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS public.referral_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code VARCHAR(10) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  reward_type VARCHAR(50) CHECK (reward_type IN ('credit', 'discount', 'subscription-month')),
  reward_value DECIMAL(10, 2),
  reward_description VARCHAR(255),
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.referral_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code_id UUID REFERENCES public.referral_codes(id),
  reward_given BOOLEAN DEFAULT FALSE,
  reward_type VARCHAR(50) CHECK (reward_type IN ('credit', 'discount', 'subscription-month')),
  reward_value DECIMAL(10, 2),
  reward_granted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(referrer_id, referred_user_id)
);

-- ============================================
-- MARKETPLACE TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS public.marketplace_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_type VARCHAR(50) CHECK (product_type IN ('sample-pack', 'template', 'preset', 'course')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'USD',
  cover_image_url TEXT,
  status VARCHAR(50) CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  downloads INTEGER DEFAULT 0,
  rating DECIMAL(2, 1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.marketplace_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.marketplace_products(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'USD',
  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  status VARCHAR(50) CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  UNIQUE(product_id, buyer_id)
);

-- ============================================
-- ANALYTICS TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  event_properties JSONB DEFAULT '{}'::JSONB,
  user_properties JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.viral_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  share_id VARCHAR(255) UNIQUE,
  platform VARCHAR(50) CHECK (platform IN ('twitter', 'facebook', 'linkedin', 'email', 'whatsapp', 'link')),
  shared_content_type VARCHAR(50) CHECK (shared_content_type IN ('battle-result', 'profile', 'portfolio', 'referral')),
  shared_at TIMESTAMP DEFAULT NOW(),
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- AUDIT & LOGGING TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR(100),
  resource_type VARCHAR(50),
  resource_id UUID,
  changes JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON public.subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_user_month ON public.usage_metrics(user_id, month);
CREATE INDEX IF NOT EXISTS idx_referral_codes_user_id ON public.referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_referrer ON public.referral_rewards(referrer_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_seller ON public.marketplace_products(seller_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_created ON public.analytics_events(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at);

-- ============================================
-- ROW-LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users_extended ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viral_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can read own subscription" ON public.subscriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can read own usage" ON public.usage_metrics
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can read own credits" ON public.user_credits
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can read own referrals" ON public.referral_codes
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can read own transactions" ON public.credit_transactions
  FOR SELECT USING (user_id = auth.uid());

-- Sellers can read their products
CREATE POLICY "Sellers can read own products" ON public.marketplace_products
  FOR SELECT USING (seller_id = auth.uid());

-- Buyers can read their purchases
CREATE POLICY "Buyers can read own purchases" ON public.marketplace_purchases
  FOR SELECT USING (buyer_id = auth.uid());
```

**After running:**
1. Go to Data Editor tab
2. Verify all tables created
3. Check indexes in Database menu

**Checkpoint 1.2**: ✅ All database tables and indexes created

---

### **TASK 3: Configure API Authentication** (Days 2-3)
**Owner**: Backend Lead | Duration: 6 hours

1. **Enable Supabase Auth**
   - Go to Authentication → Providers
   - Enable Email/Password (already on by default)
   - Enable Google OAuth:
     - Go to Google Cloud Console
     - Create OAuth 2.0 credentials (OAuth client ID)
     - Redirect URI: `https://[project-id].supabase.co/auth/v1/callback`
     - Copy Client ID & Secret to Supabase
   - Enable Apple OAuth (similar process)

2. **Create Service Role Keys**
   - Already generated in Settings → API
   - Add to environment variables

3. **Set Up CORS**
   - Settings → API → CORS Allowed Origins
   - Add:
     ```
     http://localhost:3000
     http://localhost:5173
     https://yourdomain.com
     https://app.yourdomain.com
     ```

4. **Create Environment Variables File**
   ```bash
   # .env.local (never commit this!)
   VITE_SUPABASE_URL=https://[project-id].supabase.co
   VITE_SUPABASE_ANON_KEY=[anon-key]
   
   # Backend only (.env backend)
   SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
   DATABASE_URL=[postgres-connection-string]
   STRIPE_SECRET_KEY=[from-stripe-account]
   STRIPE_PUBLISHABLE_KEY=[from-stripe-account]
   ```

**Checkpoint 1.3**: ✅ OAuth providers enabled, environment variables set

---

### **TASK 4: Stripe Account Setup & Configuration** (Day 4)
**Owner**: Finance Lead + Backend Lead | Duration: 4 hours

1. **Create Stripe Business Account**
   - Go to https://dashboard.stripe.com/register
   - Company name: MixClub
   - Business type: SaaS
   - Complete verification process

2. **Add Bank Account**
   - Settings → Bank accounts
   - Add your business bank account for payouts

3. **Create Products in Stripe Dashboard**

   **Product: Audio Processing**
   - Go to Products → Add Product
   - Name: "Audio Processing - Monthly"
   - Click "Create Pricing Plan"
   
   Then create prices for each tier:
   ```
   STARTER ($9/month):
   - Product: Audio Processing
   - Recurring: Monthly
   - Price: $9.00
   - Billing period: Month
   - Save as test mode price
   
   PRO ($29/month):
   - Product: Audio Processing
   - Recurring: Monthly
   - Price: $29.00
   - Billing period: Month
   
   STUDIO ($99/month):
   - Product: Audio Processing
   - Recurring: Monthly
   - Price: $99.00
   - Billing period: Month
   
   ENTERPRISE (Custom):
   - Product: Audio Processing
   - Recurring: Annually
   - Price: $999.00
   ```

4. **Set Up Webhooks**
   - Settings → Webhooks
   - Add endpoint: `https://[supabase-project].functions.supabase.co/stripe-webhook`
   - Select events:
     ```
     charge.succeeded
     charge.failed
     customer.subscription.created
     customer.subscription.updated
     customer.subscription.deleted
     invoice.payment_succeeded
     invoice.payment_failed
     ```
   - Save webhook signing secret to environment

5. **Configure API Keys**
   - Settings → API Keys
   - Copy Publishable Key
   - Copy Secret Key
   - Save to environment variables

**Checkpoint 1.4**: ✅ Stripe products created, webhooks configured, keys secured

**End of Week 1 Checkpoint**: ✅ All infrastructure ready

---

## 📦 WEEK 2: CORE API ENDPOINTS

### **TASK 5: Payment Processing Endpoints** (Days 6-7)
**Owner**: Backend Developer | Duration: 12 hours

Create a new Supabase Edge Function for checkout:

```typescript
// supabase/functions/checkout/index.ts

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "");
const FRONTEND_URL = Deno.env.get("FRONTEND_URL") || "http://localhost:5173";

interface CheckoutRequest {
  priceId: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
}

serve(async (req) => {
  if (req.method === "POST") {
    try {
      const { priceId, userId, successUrl, cancelUrl }: CheckoutRequest =
        await req.json();

      if (!priceId || !userId) {
        return new Response(
          JSON.stringify({ error: "Missing required fields" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const session = await stripe.checkout.sessions.create({
        customer_email: userId, // In production, get user email from database
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
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
```

Deploy with:
```bash
supabase functions deploy checkout
```

### **TASK 6: Webhook Handler** (Days 7-8)
**Owner**: Backend Developer | Duration: 8 hours

```typescript
// supabase/functions/stripe-webhook/index.ts

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
      const event = stripe.webhooks.constructEvent(
        body,
        signature || "",
        webhookSecret
      );

      switch (event.type) {
        case "customer.subscription.created":
          await handleSubscriptionCreated(event.data.object);
          break;
        case "customer.subscription.updated":
          await handleSubscriptionUpdated(event.data.object);
          break;
        case "customer.subscription.deleted":
          await handleSubscriptionDeleted(event.data.object);
          break;
        case "charge.succeeded":
          await handleChargeSucceeded(event.data.object);
          break;
        case "charge.failed":
          await handleChargeFailed(event.data.object);
          break;
        case "invoice.payment_succeeded":
          await handleInvoicePaymentSucceeded(event.data.object);
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

async function handleSubscriptionCreated(subscription: any) {
  const { data, error } = await supabase
    .from("subscriptions")
    .upsert({
      stripe_customer_id: subscription.customer,
      stripe_subscription_id: subscription.id,
      stripe_price_id: subscription.items.data[0].price.id,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
    });

  if (error) console.error("Error creating subscription:", error);
}

async function handleSubscriptionUpdated(subscription: any) {
  const { data, error } = await supabase
    .from("subscriptions")
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
    })
    .eq("stripe_subscription_id", subscription.id);

  if (error) console.error("Error updating subscription:", error);
}

async function handleSubscriptionDeleted(subscription: any) {
  const { data, error } = await supabase
    .from("subscriptions")
    .update({ status: "canceled" })
    .eq("stripe_subscription_id", subscription.id);

  if (error) console.error("Error deleting subscription:", error);
}

async function handleChargeSucceeded(charge: any) {
  console.log("Charge succeeded:", charge.id);
  // Log for analytics
}

async function handleChargeFailed(charge: any) {
  console.log("Charge failed:", charge.id);
  // Send email to customer
}

async function handleInvoicePaymentSucceeded(invoice: any) {
  console.log("Invoice payment succeeded:", invoice.id);
  // Award credits, update metrics, etc.
}
```

Deploy with:
```bash
supabase functions deploy stripe-webhook
```

**Checkpoint 2.1**: ✅ Payment endpoints operational

---

### **TASK 7: Usage & Credit Management** (Days 9-10)
**Owner**: Backend Developer | Duration: 8 hours

```typescript
// supabase/functions/usage/index.ts

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
    // Get current month usage
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const { data: usage, error } = await supabase
      .from("usage_metrics")
      .select("*")
      .eq("user_id", user.id)
      .eq("month", month)
      .single();

    if (error && error.code !== "PGRST116") {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify(usage || { tracks_processed: 0, masters_completed: 0 }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  if (req.method === "POST") {
    // Deduct credits
    const { amount, reason } = await req.json();

    const { data: creditData, error: creditError } = await supabase
      .from("user_credits")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    if (creditError) {
      return new Response(JSON.stringify({ error: "Credits not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (creditData.balance < amount) {
      return new Response(JSON.stringify({ error: "Insufficient credits" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Deduct credits
    const { error: deductError } = await supabase
      .from("user_credits")
      .update({ balance: creditData.balance - amount })
      .eq("user_id", user.id);

    if (deductError) {
      return new Response(JSON.stringify({ error: deductError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Log transaction
    await supabase.from("credit_transactions").insert({
      user_id: user.id,
      amount: -amount,
      transaction_type: "spent",
      reason,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response("Method not allowed", { status: 405 });
});
```

Deploy with:
```bash
supabase functions deploy usage
```

**Checkpoint 2.2**: ✅ Usage tracking and credit system operational

**End of Week 2 Checkpoint**: ✅ Core payment flow working

---

## 📦 WEEK 3: REFERRAL SYSTEM & TESTING

### **TASK 8: Referral System Endpoints** (Days 11-12)
**Owner**: Backend Developer | Duration: 10 hours

```typescript
// supabase/functions/referral/index.ts

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
    // Generate new referral code
    const code = generateReferralCode();

    const { data, error } = await supabase
      .from("referral_codes")
      .insert({
        user_id: user.id,
        code,
        reward_type: "credit",
        reward_value: 10,
        reward_description: "$10 account credit for referred user",
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

  if (req.method === "POST" && action === "join") {
    // User joins with referral code
    const { code } = await req.json();

    const { data: refCodeData, error: refError } = await supabase
      .from("referral_codes")
      .select("*")
      .eq("code", code.toUpperCase())
      .single();

    if (refError || !refCodeData) {
      return new Response(
        JSON.stringify({ error: "Invalid referral code" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!refCodeData.is_active) {
      return new Response(
        JSON.stringify({ error: "Referral code expired" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create referral record
    const { error: rewardError } = await supabase
      .from("referral_rewards")
      .insert({
        referrer_id: refCodeData.user_id,
        referred_user_id: user.id,
        referral_code_id: refCodeData.id,
        reward_type: "credit",
        reward_value: 10,
      });

    if (rewardError) {
      return new Response(JSON.stringify({ error: rewardError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Award credit to referred user
    await supabase
      .from("user_credits")
      .update({ balance: 10 })
      .eq("user_id", user.id);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (req.method === "GET" && action === "stats") {
    // Get referral stats
    const { data: stats, error } = await supabase
      .from("referral_rewards")
      .select("*")
      .eq("referrer_id", user.id);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const totalReferred = stats?.length || 0;
    const totalEarned = (stats || []).reduce(
      (sum, reward) => sum + (reward.reward_given ? reward.reward_value : 0),
      0
    );

    return new Response(
      JSON.stringify({
        totalReferred,
        totalEarned,
        pendingEarnings: totalEarned,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response("Method not allowed", { status: 405 });
});
```

Deploy with:
```bash
supabase functions deploy referral
```

**Checkpoint 3.1**: ✅ Referral system operational

---

### **TASK 9: Comprehensive Testing** (Days 14-15)
**Owner**: QA Engineer | Duration: 8 hours

**Checklist:**

```
🧪 Database Tests
- [ ] All tables created and accessible
- [ ] Indexes performance verified
- [ ] RLS policies working correctly
- [ ] Sample data loaded successfully

🔐 Authentication Tests
- [ ] Email signup working
- [ ] Google OAuth working
- [ ] JWT tokens valid
- [ ] Token refresh working

💳 Payment Tests
- [ ] Stripe test card accepted
- [ ] Webhook receiving events
- [ ] Subscription record created
- [ ] Payment method saved
- [ ] Invoice generated

💰 Credit Tests
- [ ] User credit initialized
- [ ] Credit deduction working
- [ ] Credit transaction logged
- [ ] Balance accurate

🔗 Referral Tests
- [ ] Referral code generated
- [ ] Code validation working
- [ ] Reward calculation correct
- [ ] Referral tracking accurate

🔒 Security Tests
- [ ] No SQL injection vulnerabilities
- [ ] RLS policies enforce access control
- [ ] API keys not exposed in logs
- [ ] CORS properly configured

⚡ Performance Tests
- [ ] Response time < 1s
- [ ] Database queries optimized
- [ ] No N+1 queries
- [ ] Webhook processing < 5s

📊 Integration Tests
- [ ] Complete signup → payment flow
- [ ] Complete referral flow
- [ ] Error handling working
- [ ] Logging comprehensive
```

**Load Testing:**
```bash
# Using Apache Bench
ab -n 1000 -c 10 https://[supabase-project].functions.supabase.co/checkout

# Or using k6
k6 run load-test.js
```

**Security Audit Checklist:**
```
- [ ] Run OWASP security scan
- [ ] Check for exposed secrets
- [ ] Verify API authentication on all endpoints
- [ ] Test authorization boundaries
- [ ] Review error messages (no info leakage)
```

**Checkpoint 3.2**: ✅ All systems tested and ready

---

## ✅ PHASE 1 COMPLETION CHECKLIST

**Before Moving to Phase 2, verify:**

```
INFRASTRUCTURE
- [ ] Supabase project created and configured
- [ ] All 14 database tables created
- [ ] RLS policies enabled and working
- [ ] Backups scheduled and tested
- [ ] CORS configured for frontend

AUTHENTICATION
- [ ] Email/password auth working
- [ ] Google OAuth configured
- [ ] Apple OAuth configured
- [ ] JWT tokens validating correctly
- [ ] Rate limiting implemented

PAYMENTS
- [ ] Stripe account live (or in test mode)
- [ ] 3 subscription products created
- [ ] Webhook endpoint configured
- [ ] Payment processing tested
- [ ] Subscription creation tested

API ENDPOINTS
- [ ] /checkout working
- [ ] /usage working
- [ ] /referral working
- [ ] /stripe-webhook working
- [ ] All error handling implemented
- [ ] All endpoints authenticated

TESTING
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Load tests acceptable
- [ ] Security audit passed
- [ ] No critical bugs

MONITORING
- [ ] Error logging configured (Sentry/similar)
- [ ] Uptime monitoring set up
- [ ] Database monitoring active
- [ ] Webhook monitoring active
- [ ] Performance monitoring configured

DOCUMENTATION
- [ ] API documentation complete
- [ ] Database schema documented
- [ ] Deployment guide written
- [ ] Troubleshooting guide created
- [ ] Team trained on systems
```

---

## 🚨 COMMON ISSUES & SOLUTIONS

### Issue: "Edge Functions not deploying"
**Solution:**
```bash
# Make sure you're logged in
supabase login

# Check function status
supabase functions list

# Debug deployment
supabase functions deploy checkout --debug
```

### Issue: "Webhook signature verification failing"
**Solution:**
- Verify webhook secret matches Stripe dashboard
- Ensure Stripe header parsing is correct
- Check timestamp validation (within 5 minutes)

### Issue: "RLS policies blocking legitimate access"
**Solution:**
- Check that policies reference correct user ID
- Ensure service role key used for admin operations
- Verify policy conditions are correct

### Issue: "Stripe test payment not creating subscription"
**Solution:**
- Use Stripe test card: 4242 4242 4242 4242
- Expiry: Any future date
- CVC: Any 3 digits
- Check webhook endpoint is public and reachable

---

## 📞 SUPPORT CONTACTS

- **Supabase Issues**: https://github.com/supabase/supabase/discussions
- **Stripe Issues**: support@stripe.com or Slack community
- **Backend Team Lead**: [name]
- **DevOps Lead**: [name]

---

## 🎯 NEXT STEPS

Once Phase 1 is complete:

1. **Schedule Phase 2 kickoff** - Website Integration
2. **Share Phase 1 results** with team
3. **Update ACTION_PLAN_COMPLETE.md** with actual timings
4. **Begin Phase 2** - Enterprise dashboard integration (can run in parallel)

---

**Phase 1 Status: 🟢 READY TO EXECUTE**

Start Date: **December 26, 2025**  
Target Completion: **January 15, 2026**

Good luck! 🚀
