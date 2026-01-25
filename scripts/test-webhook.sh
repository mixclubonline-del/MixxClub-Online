#!/bin/bash

# Configuration
# Replace this with your actual edge function URL if different
WEBHOOK_URL="https://hfuecdxwqxuymsikqowk.supabase.co/functions/v1/stripe-webhook"
DATE=$(date +%s)

echo "🚀 Testing Stripe Webhook Integration"
echo "Target URL: $WEBHOOK_URL"
echo ""

# 1. Test Subscription Created
echo "1️⃣  Sending event: customer.subscription.created"
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "stripe-signature: t=$DATE,v1=test_signature" \
  -d '{
  "id": "evt_test_subscription_created",
  "object": "event",
  "type": "customer.subscription.created",
  "data": {
    "object": {
      "id": "sub_test_123",
      "customer": "cus_test_user",
      "status": "active",
      "items": {
        "data": [{ "price": { "id": "price_pro_monthly" } }]
      },
      "current_period_end": 1735689600
    }
  }
}'
echo -e "\n"

# 2. Test Payment Succeeded
echo "2️⃣  Sending event: invoice.payment_succeeded"
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "stripe-signature: t=$DATE,v1=test_signature" \
  -d '{
  "id": "evt_test_payment_success",
  "object": "event",
  "type": "invoice.payment_succeeded",
  "data": {
    "object": {
      "subscription": "sub_test_123",
      "customer": "cus_test_user",
      "amount_paid": 2900,
      "currency": "usd"
    }
  }
}'
echo -e "\n"

echo "✅ Tests sent. Check Supabase logs for processing results."
echo "Note: Without a valid Stripe signature, the endpoint might return 400. This confirms the endpoint is reachable but rejecting invalid signatures (security feature)."
