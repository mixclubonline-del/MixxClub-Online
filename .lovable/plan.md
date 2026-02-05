
# Putting the Economy on Screen
## Producer & Fan Economic UI Implementation Plan

This plan outlines the UI components needed to visualize and operationalize the MixxClub economy across Producer CRM and Fan Hub, building on the existing infrastructure.

---

## Current Economic Infrastructure

### What Already Exists

| Component | Purpose |
|-----------|---------|
| `mixx_wallets` table | Dual-balance system (earned/purchased) |
| `mixx_transactions` table | Full transaction ledger |
| `mixx_missions` + `mixx_mission_progress` | Engagement reward system |
| `useMixxWallet` hook | Wallet CRUD operations |
| `useMissions` hook | Mission progress + claiming |
| `useRevenueStreams` hook | 10-stream revenue analytics (Artist/Engineer) |
| `WalletBalance` component | Visual balance display |
| `MissionsList` component | Daily/Weekly/Achievement missions UI |
| `MixxCoin` / `MixxCoin3D` | Currency visualization (Earned vs Purchased) |
| `producer_beats` table | Beat catalog with pricing |
| `producer_stats` table | Producer analytics |
| `fan_stats` table | Fan engagement metrics |

### What's Missing (Shells Only)

| Component | Status |
|-----------|--------|
| `ProducerCatalogHub` | Empty state only |
| `ProducerSalesHub` | Empty state only |
| `FanWalletHub` | Empty state only |
| `FanMissionsHub` | Empty state only |
| Beat purchase flow | Not implemented |
| Producer revenue streams | Not wired to `useRevenueStreams` |

---

## Architecture Vision

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                         MIXXCLUB ECONOMY FLOWS                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  PRODUCER CRM                    FAN HUB                                │
│  ┌─────────────────┐            ┌─────────────────┐                     │
│  │ Beat Catalog    │──sells──►  │ Discover Feed   │                     │
│  │ - Upload beats  │            │ - Browse beats  │                     │
│  │ - Set pricing   │            │ - Preview audio │                     │
│  │ - Manage licenses│           │ - Purchase flow │                     │
│  └────────┬────────┘            └────────┬────────┘                     │
│           │                              │                              │
│           ▼                              ▼                              │
│  ┌─────────────────┐            ┌─────────────────┐                     │
│  │ Sales Dashboard │◄───────────│ MixxCoinz Wallet│                     │
│  │ - Order history │   revenue  │ - Earned balance│                     │
│  │ - Revenue chart │            │ - Spend tracking│                     │
│  │ - Payout request│            │ - Purchase coinz│                     │
│  └────────┬────────┘            └────────┬────────┘                     │
│           │                              │                              │
│           ▼                              ▼                              │
│  ┌─────────────────┐            ┌─────────────────┐                     │
│  │ Revenue Hub     │            │ Missions Board  │                     │
│  │ - Beat Sales    │            │ - Daily tasks   │                     │
│  │ - Royalty splits│            │ - Weekly goals  │                     │
│  │ - Licensing $   │            │ - Earn coinz    │                     │
│  └─────────────────┘            └─────────────────┘                     │
│                                                                         │
│              ◄─────── 70/30 SPLIT ───────►                              │
│         Platform 30%              Creator 70%                           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Producer Catalog Hub (Beat Management)

**1.1 Create `useProducerBeats` Hook**

```typescript
// src/hooks/useProducerBeats.ts
interface ProducerBeat {
  id: string;
  title: string;
  bpm: number;
  key_signature: string;
  genre: string;
  tags: string[];
  audio_url: string;
  preview_url: string;
  price_cents: number;
  license_type: 'lease' | 'exclusive' | 'both';
  exclusive_price_cents: number;
  downloads: number;
  plays: number;
  status: 'draft' | 'published' | 'archived';
}

export function useProducerBeats() {
  // CRUD operations for producer_beats table
  // Upload beat audio to storage
  // Update pricing/licensing
  // Track plays and downloads
}
```

**1.2 Build `ProducerCatalogHub` Components**

| Component | Purpose |
|-----------|---------|
| `BeatUploadForm` | Multi-step beat upload with audio preview |
| `BeatCard` | Card display with play/pause, stats, pricing |
| `BeatPricingEditor` | Set lease/exclusive prices |
| `BeatTagsInput` | Genre and mood tags with autocomplete |
| `CatalogGrid` | Grid layout with filtering/sorting |
| `CatalogEmptyState` | Tempo-guided first beat upload |

**Key Features:**
- Drag-and-drop audio upload
- Waveform preview generation
- BPM/key auto-detection (stretch goal)
- Quick pricing templates ($19.99 lease / $299 exclusive)
- Bulk actions (publish, archive, update pricing)

---

### Phase 2: Producer Sales Hub (Revenue Tracking)

**2.1 Create `useProducerSales` Hook**

```typescript
// src/hooks/useProducerSales.ts
interface BeatSale {
  id: string;
  beat_id: string;
  buyer_id: string;
  license_type: 'lease' | 'exclusive';
  amount_cents: number;
  platform_fee_cents: number;
  producer_earnings_cents: number;
  purchased_at: string;
}

export function useProducerSales() {
  // Fetch sales from beat_purchases table (to be created)
  // Calculate revenue analytics
  // Generate earnings reports
}
```

**2.2 Build `ProducerSalesHub` Components**

| Component | Purpose |
|-----------|---------|
| `SalesOverview` | Total earnings, this month, pending |
| `SalesTable` | Sortable table of all transactions |
| `EarningsChart` | Line chart of earnings over time |
| `TopBeatsLeaderboard` | Best-selling beats ranking |
| `PayoutRequestButton` | Trigger cashout flow |

**Key Features:**
- Real-time sales notifications
- Filter by date range, beat, license type
- Export to CSV for tax purposes
- Stripe Connect payout integration

---

### Phase 3: Fan Wallet Hub (MixxCoinz Management)

**3.1 Enhance `FanWalletHub` Component**

Replace empty state with full wallet experience using existing `WalletBalance` and `TransactionLedger` components.

| Component | Purpose |
|-----------|---------|
| `WalletBalance` (existing) | Total + earned/purchased breakdown |
| `CoinzPurchaseModal` | Buy MixxCoinz with Stripe |
| `SpendingDestinations` | Where to spend (merch, tips, unlocks) |
| `TransactionLedger` (existing) | Full transaction history |
| `TierProgressCard` | Show current tier + next milestone |

**Key Features:**
- One-tap purchase flows ($4.99 = 500 coinz, $9.99 = 1200 coinz)
- Daily purchase limit indicator (2000/day)
- Spending shortcuts to artist merch stores
- Gifting interface for sending coinz to friends

---

### Phase 4: Fan Missions Hub (Engagement Economy)

**4.1 Enhance `FanMissionsHub` Component**

Wrap existing `MissionsList` with fan-specific context and add new components.

| Component | Purpose |
|-----------|---------|
| `MissionsList` (existing) | Daily/Weekly/Achievement missions |
| `StreakTracker` | Show engagement streak with rewards |
| `LeaderboardWidget` | Top earners this week |
| `BonusMissionsCard` | Limited-time bonus opportunities |
| `ReferralMissions` | Earn by inviting friends |

**Key Features:**
- Mission categories: Listen, Vote, Share, Comment
- Streak multipliers (7-day streak = 2x rewards)
- Seasonal/event missions
- Community-wide goals (collective targets)

---

### Phase 5: Producer Revenue Integration

**5.1 Extend `useRevenueStreams` Hook**

Add producer-specific revenue streams to the existing hook:

```typescript
// New streams for producers
{
  id: 'beat_leases',
  name: 'Beat Leases',
  icon: 'disc-3',
  amount: leaseSalesTotal,
  color: 'hsl(45, 100%, 55%)',
  description: 'Non-exclusive beat licenses'
},
{
  id: 'exclusives',
  name: 'Exclusive Sales',
  icon: 'crown',
  amount: exclusiveSalesTotal,
  color: 'hsl(280, 100%, 60%)',
  description: 'Full ownership transfers'
},
{
  id: 'beat_royalties',
  name: 'Beat Royalties',
  icon: 'music',
  amount: royaltyTotal,
  color: 'hsl(120, 80%, 50%)',
  description: 'Revenue share from released tracks'
}
```

**5.2 Create Producer Revenue Hub Tab**

Add producer-specific revenue dashboard tab to ProducerCRM.

---

### Phase 6: Beat Marketplace Integration

**6.1 Database Schema Additions**

```sql
-- Beat purchases table
CREATE TABLE public.beat_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  beat_id uuid REFERENCES producer_beats(id) ON DELETE SET NULL,
  buyer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  seller_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  license_type text NOT NULL,
  amount_cents integer NOT NULL,
  platform_fee_cents integer NOT NULL DEFAULT 0,
  seller_earnings_cents integer NOT NULL,
  stripe_payment_intent_id text,
  status text DEFAULT 'pending',
  downloaded_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Update producer_stats on sale
CREATE OR REPLACE FUNCTION update_producer_stats_on_sale()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE producer_stats
  SET 
    total_sales = total_sales + 1,
    total_revenue_cents = total_revenue_cents + NEW.seller_earnings_cents
  WHERE user_id = NEW.seller_id;
  
  UPDATE producer_beats
  SET downloads = downloads + 1
  WHERE id = NEW.beat_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**6.2 Create Beat Purchase Flow**

| Component | Purpose |
|-----------|---------|
| `BeatPreviewPlayer` | Full audio player with buy button |
| `LicenseSelector` | Choose lease vs exclusive |
| `BeatCheckout` | Stripe payment form |
| `PurchaseConfirmation` | Download link + license PDF |

**Edge Function: `create-beat-checkout`**
- Creates Stripe checkout session for beat purchase
- Applies 70/30 split (70% to producer)
- Records transaction in beat_purchases

---

### Phase 7: Cross-Hub Economy Wiring

**7.1 Event Bus Integration**

Wire producer sales to fan spending:

```typescript
// When fan purchases beat
hubEventBus.emit('beat_purchased', {
  buyerId: fanId,
  sellerId: producerId,
  beatId,
  amountCents,
});

// Producer receives notification
hubEventBus.on('beat_purchased', async (data) => {
  await createNotification(data.sellerId, {
    type: 'sale',
    title: 'New Beat Sale!',
    message: `Your beat just sold for $${(data.amountCents / 100).toFixed(2)}`,
  });
});
```

**7.2 Fan Tier System Display**

Show tier badges and progression in Fan Hub:

| Tier | Threshold | Badge |
|------|-----------|-------|
| Newcomer | 0 coinz | Bronze |
| Supporter | 500 coinz | Silver |
| Advocate | 2000 coinz | Gold |
| Champion | 5000 coinz | Platinum |
| Legend | 10000 coinz | Diamond |

---

## File Creation Summary

| File | Purpose |
|------|---------|
| `src/hooks/useProducerBeats.ts` | Beat catalog CRUD hook |
| `src/hooks/useProducerSales.ts` | Sales analytics hook |
| `src/components/producer/BeatUploadForm.tsx` | Beat upload UI |
| `src/components/producer/BeatCard.tsx` | Beat display card |
| `src/components/producer/BeatPricingEditor.tsx` | Pricing modal |
| `src/components/producer/CatalogGrid.tsx` | Beat grid layout |
| `src/components/producer/SalesOverview.tsx` | Sales dashboard header |
| `src/components/producer/SalesTable.tsx` | Transaction table |
| `src/components/producer/EarningsChart.tsx` | Revenue visualization |
| `src/components/fan/CoinzPurchaseModal.tsx` | Buy coinz flow |
| `src/components/fan/SpendingDestinations.tsx` | Spend options |
| `src/components/fan/TierProgressCard.tsx` | Tier display |
| `src/components/fan/StreakTracker.tsx` | Engagement streak |
| `supabase/functions/create-beat-checkout/index.ts` | Stripe checkout |

## File Modification Summary

| File | Changes |
|------|---------|
| `src/components/crm/producer/ProducerCatalogHub.tsx` | Full catalog UI |
| `src/components/crm/producer/ProducerSalesHub.tsx` | Full sales dashboard |
| `src/components/crm/producer/ProducerDashboardHub.tsx` | Wire real stats |
| `src/components/crm/fan/FanWalletHub.tsx` | Full wallet experience |
| `src/components/crm/fan/FanMissionsHub.tsx` | Enhanced missions UI |
| `src/hooks/useRevenueStreams.ts` | Add producer streams |
| Database migration | Add beat_purchases table + triggers |

---

## Rollout Sequence

1. **Phase A: Database + Hooks** - beat_purchases table, useProducerBeats, useProducerSales
2. **Phase B: Producer Catalog** - Upload, manage, price beats
3. **Phase C: Fan Wallet** - Full wallet experience with purchase flow
4. **Phase D: Producer Sales** - Revenue tracking and analytics
5. **Phase E: Fan Missions** - Enhanced engagement with streaks
6. **Phase F: Beat Marketplace** - Purchase flow + Stripe integration
7. **Phase G: Cross-Hub Wiring** - Notifications + event bus

---

## Technical Considerations

### Revenue Split Logic
- 70% to creator, 30% platform fee
- Calculated server-side in edge function
- Stored in beat_purchases for audit trail

### Coinz Economy Balance
- Earned coinz: High-status items, leaderboards
- Purchased coinz: Convenience, no pay-to-win
- Daily purchase limit: 2000 coinz
- Cashout ratio: 200 coinz = $1 USD

### Real-time Updates
- Use Supabase Realtime for sales notifications
- Producer sees instant sale alerts
- Fan wallet updates immediately after spend

This plan transforms the current shell components into a fully operational economy where Producers monetize beats and Fans earn through engagement, all connected through the MixxCoinz currency system.
