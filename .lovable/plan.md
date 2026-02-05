

# Fix Type Error & Add Beat/Coinz Webhook Handling

## Issue 1: MixxCoin Type Error

**Location:** `src/components/fan/CoinzPurchaseModal.tsx` line 115

**Problem:** `MixxCoin` component requires a `type` prop (`'earned' | 'purchased'`) but only `size="sm"` is passed.

**Fix:** Add `type="purchased"` since these are purchased coinz packages:
```typescript
<MixxCoin type="purchased" size="sm" />
```

---

## Issue 2: Stripe Webhook Missing Beat & Coinz Handlers

The `stripe-webhook/index.ts` needs to handle two new purchase types:

### 2.1 Beat Purchase Handler

**Trigger:** `session.metadata?.purchase_type === 'beat'`

**Actions:**
1. Insert record into `beat_purchases` table
2. If license type is exclusive, mark beat as `is_exclusive_available = false`
3. Trigger already handles producer notification via database trigger

**Function: `handleBeatPurchase`**
```typescript
async function handleBeatPurchase(
  supabase: ReturnType<typeof createClient>,
  session: Stripe.Checkout.Session
) {
  const metadata = session.metadata;
  const beatId = metadata?.beat_id;
  const buyerId = metadata?.buyer_id;
  const sellerId = metadata?.seller_id;
  const licenseType = metadata?.license_type;
  const amountCents = session.amount_total || 0;
  const platformFeeCents = parseInt(metadata?.platform_fee_cents || '0');
  const sellerEarningsCents = parseInt(metadata?.seller_earnings_cents || '0');

  // Insert beat purchase record
  const { error: purchaseError } = await supabase
    .from('beat_purchases')
    .insert({
      beat_id: beatId,
      buyer_id: buyerId,
      seller_id: sellerId,
      license_type: licenseType,
      amount_cents: amountCents,
      platform_fee_cents: platformFeeCents,
      seller_earnings_cents: sellerEarningsCents,
      stripe_payment_intent_id: session.payment_intent as string,
      status: 'completed',
    });

  // If exclusive, mark beat as unavailable
  if (licenseType === 'exclusive') {
    await supabase
      .from('producer_beats')
      .update({ is_exclusive_available: false })
      .eq('id', beatId);
  }
}
```

### 2.2 Coinz Purchase Handler

**Trigger:** `session.metadata?.purchase_type === 'coinz'`

**Actions:**
1. Add coinz to user's `mixx_wallets.purchased_balance`
2. Update `daily_purchased` tracking
3. Record transaction in `mixx_transactions`
4. Create notification for user

**Function: `handleCoinzPurchase`**
```typescript
async function handleCoinzPurchase(
  supabase: ReturnType<typeof createClient>,
  session: Stripe.Checkout.Session
) {
  const metadata = session.metadata;
  const userId = metadata?.user_id;
  const coinzAmount = parseInt(metadata?.coinz_amount || '0');

  // Get or create wallet
  const { data: wallet } = await supabase
    .from('mixx_wallets')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (wallet) {
    // Update existing wallet
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const resetNeeded = !wallet.daily_purchased_reset_at || 
      new Date(wallet.daily_purchased_reset_at) < todayStart;
    
    await supabase
      .from('mixx_wallets')
      .update({
        purchased_balance: wallet.purchased_balance + coinzAmount,
        daily_purchased: resetNeeded ? coinzAmount : (wallet.daily_purchased || 0) + coinzAmount,
        daily_purchased_reset_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
  } else {
    // Create new wallet
    await supabase
      .from('mixx_wallets')
      .insert({
        user_id: userId,
        earned_balance: 0,
        purchased_balance: coinzAmount,
        daily_purchased: coinzAmount,
        daily_purchased_reset_at: new Date().toISOString(),
      });
  }

  // Record transaction
  await supabase
    .from('mixx_transactions')
    .insert({
      user_id: userId,
      type: 'purchase',
      amount: coinzAmount,
      balance_type: 'purchased',
      description: `Purchased ${coinzAmount} MixxCoinz`,
      metadata: { package_id: metadata?.package_id, session_id: session.id },
    });
}
```

---

## File Changes

| File | Changes |
|------|---------|
| `src/components/fan/CoinzPurchaseModal.tsx` | Add `type="purchased"` to MixxCoin |
| `supabase/functions/stripe-webhook/index.ts` | Add beat and coinz purchase handlers |

---

## Implementation Order

1. Fix MixxCoin type error in CoinzPurchaseModal
2. Add `handleBeatPurchase` function to webhook
3. Add `handleCoinzPurchase` function to webhook
4. Update `handleCheckoutCompleted` to route to new handlers

