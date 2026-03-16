

# Beat Marketplace Audit — Implementation Plan

## Gaps Found

| # | Issue | Impact |
|---|-------|--------|
| 1 | License tiers: UI shows 3 tiers but checkout only handles 2 | Premium Lease dead-end — buyer sees it but can't buy it |
| 2 | No producer payout path: `request-payout` only checks `engineer_earnings` | Producers can never withdraw beat sale revenue |
| 3 | Insecure download: `MyPurchases` opens raw `audio_url` in new tab | No license verification, no signed URLs, no stems for exclusive |
| 4 | CoinzPaymentToggle shown but discount never applied to Stripe session | Buyers see MixxCoinz discount but pay full price |
| 5 | RoyaltyTrackerPanel has no data source | Always shows empty state |

## Plan

### 1. Fix license tier alignment
- Update `LicenseComparisonModal` to clarify the 3 visual tiers map to 2 purchase tiers (lease and exclusive). The "Premium Lease" display is informational (higher stream limits) but routes to the same `lease` checkout — or add a `premium_lease` column to `producer_beats` and support it end-to-end.
- **Recommendation**: Simplify — collapse Premium Lease into Lease with a note about stream limits. Remove `priceMultiplier` hack.
- **Files**: `src/components/producer/LicenseComparisonModal.tsx`

### 2. Producer payout pipeline
- **Migration**: Create `producer_earnings` table (or add producer support to `payout_requests` balance check).
- Add a trigger on `beat_purchases` INSERT (status = 'completed') that inserts into a `producer_earnings` ledger with `seller_earnings_cents`.
- **Update `request-payout`**: Add a branch that checks the user's role — if producer, query `producer_earnings` instead of `engineer_earnings` to compute available balance.
- Wire the existing `PayoutRequestForm` + `PaymentIntegration` into the Producer CRM earnings tab (it currently only has `AutoSplitDashboard` + `CollaborativeEarnings`).
- **Files**: migration SQL, `supabase/functions/request-payout/index.ts`, Producer CRM earnings tab component

### 3. Secure download fulfillment
- Create `generate-beat-download` edge function that:
  - Verifies the caller owns a completed `beat_purchases` record for the beat
  - Checks license type to determine which files to serve (MP3 for lease, MP3+WAV+stems for exclusive)
  - Generates a signed Supabase Storage URL (60-min expiry)
  - Records download timestamp
- Update `MyPurchases.tsx` to call this function instead of opening raw `audio_url`
- **Files**: new edge function `supabase/functions/generate-beat-download/index.ts`, `src/pages/MyPurchases.tsx`

### 4. Wire CoinzPaymentToggle to checkout
- Pass `coinzToApply` from `BeatDetailModal` to `createBeatCheckout`
- In `create-beat-checkout`, if `coinzAmount > 0`:
  - Call `spend_coinz` RPC to deduct from wallet
  - Reduce the Stripe `unit_amount` by the coinz dollar value
  - Store coinz deduction in session metadata for reconciliation
- **Files**: `src/hooks/useBeatPurchase.ts`, `supabase/functions/create-beat-checkout/index.ts`, `src/components/marketplace/BeatDetailModal.tsx`

### 5. Remove dead RoyaltyTrackerPanel or stub data
- The royalty tracker depends on external distribution data (Spotify, Apple Music streams) that doesn't exist yet. Rather than building a full ingestion pipeline, update the panel to show beat marketplace sales as "platform royalties" — reusing `useProducerSales` data to populate the summary.
- **Files**: `src/components/producer/RoyaltyTrackerPanel.tsx`, wherever it's rendered in Producer CRM

## Execution Order

```text
1. Migration: producer_earnings table + trigger  (dependency for #2)
2. Fix request-payout for producers              (depends on #1)
3. Secure download edge function                 (independent)
4. License tier cleanup                          (independent)
5. CoinzPaymentToggle wiring                     (independent)
6. RoyaltyTracker data source                    (independent)
```

## Files Modified
- `supabase/functions/request-payout/index.ts`
- `supabase/functions/create-beat-checkout/index.ts`
- `src/hooks/useBeatPurchase.ts`
- `src/pages/MyPurchases.tsx`
- `src/components/marketplace/BeatDetailModal.tsx`
- `src/components/producer/LicenseComparisonModal.tsx`
- `src/components/producer/RoyaltyTrackerPanel.tsx`
- Producer CRM earnings tab wiring

## Files Created
- `supabase/functions/generate-beat-download/index.ts`
- Migration SQL for `producer_earnings` table + trigger

