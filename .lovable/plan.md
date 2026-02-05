

# Beat Marketplace Checkout Flow & Stripe Integration

## Executive Summary

This plan implements the complete beat purchase flow, allowing Artists and Fans to discover, preview, and purchase beats from Producers. The system integrates with the existing Stripe infrastructure and the MixxCoinz economy, with a 70/30 revenue split (70% to Producer, 30% platform).

---

## Current Infrastructure Analysis

### What Already Exists
| Component | Status |
|-----------|--------|
| `producer_beats` table | ✅ Has price_cents, exclusive_price_cents, license_type |
| `beat_purchases` table | ✅ Created with RLS, has seller_earnings_cents column |
| `update_producer_stats_on_sale` trigger | ✅ Auto-updates producer_stats + notifications |
| `producer_stats` table | ✅ Tracks total_sales, total_revenue_cents |
| Stripe webhook handler | ✅ Handles checkout.session.completed |
| `verify-stripe-session` edge function | ✅ Verifies payment status |
| `useProducerBeats` hook | ✅ CRUD for producer catalog |
| `BeatCard` component | ✅ Display with play/pause, pricing |
| `SpendingDestinations` | ✅ References "Beat Marketplace" |

### What's Missing
| Component | Status |
|-----------|--------|
| `create-beat-checkout` edge function | ❌ Not created |
| `BeatMarketplace` page | ❌ Not created |
| `BeatPreviewPlayer` component | ❌ Full audio player with purchase |
| `LicenseSelector` component | ❌ Lease vs exclusive selection |
| `BeatCheckoutModal` component | ❌ Stripe checkout trigger |
| `useBeatMarketplace` hook | ❌ Browse public beats |
| Beat purchase success handling | ❌ Not in verify-stripe-session |
| `CoinzPurchaseModal` | ❌ Not created |

---

## Architecture

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                      BEAT PURCHASE FLOW                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. DISCOVERY                  2. SELECTION                             │
│  ┌─────────────────┐          ┌─────────────────┐                       │
│  │ BeatMarketplace │──click──►│ BeatDetailModal │                       │
│  │ - Browse grid   │          │ - Full player   │                       │
│  │ - Filter/search │          │ - Producer info │                       │
│  │ - Preview audio │          │ - License select│                       │
│  └─────────────────┘          └────────┬────────┘                       │
│                                        │                                │
│                                        ▼                                │
│  3. CHECKOUT                   4. FULFILLMENT                           │
│  ┌─────────────────┐          ┌─────────────────┐                       │
│  │ Stripe Checkout │──paid───►│ Webhook Handler │                       │
│  │ - Payment form  │          │ - Record purchase│                       │
│  │ - License terms │          │ - Update stats   │                       │
│  └─────────────────┘          │ - Notify producer│                       │
│                               │ - Enable download│                       │
│                               └─────────────────┘                       │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                     REVENUE SPLIT                                 │   │
│  │  Beat Sale ($19.99)                                               │   │
│  │  ├── Producer (70%): $13.99                                       │   │
│  │  └── Platform (30%): $6.00                                        │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Edge Function - create-beat-checkout

**File:** `supabase/functions/create-beat-checkout/index.ts`

**Request Schema:**
```typescript
interface BeatCheckoutRequest {
  beatId: string;
  licenseType: 'lease' | 'exclusive';
  successUrl?: string;
  cancelUrl?: string;
}
```

**Core Logic:**
1. Authenticate user
2. Fetch beat details from `producer_beats`
3. Verify beat is published and available
4. For exclusive, check `is_exclusive_available`
5. Create Stripe checkout session with metadata
6. Return checkout URL

**Revenue Split Calculation:**
```typescript
const PLATFORM_FEE_PERCENTAGE = 0.30;
const priceCents = licenseType === 'exclusive' 
  ? beat.exclusive_price_cents 
  : beat.price_cents;
const platformFeeCents = Math.round(priceCents * PLATFORM_FEE_PERCENTAGE);
const sellerEarningsCents = priceCents - platformFeeCents;
```

**Session Metadata:**
```typescript
metadata: {
  purchase_type: 'beat',
  beat_id: beatId,
  seller_id: beat.producer_id,
  buyer_id: user.id,
  license_type: licenseType,
  platform_fee_cents: platformFeeCents,
  seller_earnings_cents: sellerEarningsCents,
}
```

---

### Phase 2: Webhook Handler Update

**File:** `supabase/functions/stripe-webhook/index.ts`

**Add beat purchase handling in `handleCheckoutCompleted`:**

```typescript
// Check if this is a beat purchase
if (session.metadata?.purchase_type === 'beat') {
  await handleBeatPurchase(supabase, session);
}
```

**New function: `handleBeatPurchase`**
- Insert record into `beat_purchases`
- Mark exclusive as unavailable if exclusive license
- Trigger sends notification to producer (already handled by trigger)
- Update producer_stats (already handled by trigger)

---

### Phase 3: useBeatMarketplace Hook

**File:** `src/hooks/useBeatMarketplace.ts`

**Features:**
- Fetch published beats with producer profile info
- Filter by genre, BPM range, key signature, price range
- Search by title/tags
- Sort by newest, most plays, price
- Paginated results

**Query:**
```typescript
const { data } = await supabase
  .from('producer_beats')
  .select(`
    *,
    producer:producer_id(id, username, avatar_url, full_name)
  `)
  .eq('status', 'published')
  .order('created_at', { ascending: false })
  .range(offset, offset + limit - 1);
```

---

### Phase 4: BeatMarketplace Page

**File:** `src/pages/BeatMarketplace.tsx`

**Layout:**
- Header with search bar and filters
- Filter sidebar (genre, BPM, key, price)
- Beat grid using enhanced BeatCard
- Click to open BeatDetailModal

**Route:** `/beats` (public, no auth required to browse)

---

### Phase 5: Beat Marketplace Components

**5.1 BeatMarketplaceCard**
**File:** `src/components/marketplace/BeatMarketplaceCard.tsx`

Enhanced version of BeatCard for public marketplace:
- Producer avatar and name
- Audio preview on hover
- Price display (lease / exclusive)
- Quick buy button

**5.2 BeatDetailModal**
**File:** `src/components/marketplace/BeatDetailModal.tsx`

Full-screen modal with:
- Full audio player (waveform optional)
- Producer profile card
- License selection (LicenseSelector)
- Terms and conditions
- Buy button → Stripe checkout

**5.3 LicenseSelector**
**File:** `src/components/marketplace/LicenseSelector.tsx`

Radio group showing:
- Lease license: $X.XX - Non-exclusive, limited streams
- Exclusive license: $X.XX - Full ownership, unlimited use
- Comparison table of rights

**5.4 BeatAudioPlayer**
**File:** `src/components/marketplace/BeatAudioPlayer.tsx`

Simple audio player with:
- Play/pause
- Progress bar
- Time display
- Volume control

---

### Phase 6: Beat Purchase Hook

**File:** `src/hooks/useBeatPurchase.ts`

```typescript
export function useBeatPurchase() {
  const createBeatCheckout = async (beatId: string, licenseType: 'lease' | 'exclusive') => {
    const { data, error } = await supabase.functions.invoke('create-beat-checkout', {
      body: { beatId, licenseType }
    });
    
    if (data?.url) {
      window.open(data.url, '_blank');
    }
  };
  
  return { createBeatCheckout, loading };
}
```

---

### Phase 7: My Purchases Page

**File:** `src/pages/MyPurchases.tsx`

Dashboard for buyers showing:
- Purchased beats with download links
- License type and purchase date
- Re-download capability

**Route:** `/my-purchases` (requires auth)

---

### Phase 8: CoinzPurchaseModal (Fan Economy)

**File:** `src/components/fan/CoinzPurchaseModal.tsx`

Modal for purchasing MixxCoinz with Stripe:

**Pricing Tiers:**
| Package | Price | Coinz | Bonus |
|---------|-------|-------|-------|
| Starter | $4.99 | 500 | - |
| Popular | $9.99 | 1,200 | +20% |
| Best Value | $19.99 | 2,500 | +25% |

**Features:**
- Visual tier selection
- Daily limit indicator (2000/day)
- Stripe checkout integration
- Webhook updates purchased_balance

---

### Phase 9: Payment Success Updates

**Update:** `src/pages/PaymentSuccess.tsx`

Add handling for beat purchases:
- Show beat title and producer
- Download link for audio files
- License certificate download

**Update:** `supabase/functions/verify-stripe-session/index.ts`

Add beat purchase verification:
```typescript
case 'beat':
  const { data: beat } = await supabase
    .from('producer_beats')
    .select('title, producer:producer_id(username)')
    .eq('id', session.metadata?.beat_id)
    .single();
  packageName = beat?.title || 'Beat Purchase';
  break;
```

---

### Phase 10: Navigation & Routing

**Updates to:** `src/config/navigationConfig.ts`

Add public marketplace link:
```typescript
{
  label: 'Beat Store',
  path: '/beats',
  icon: Disc3,
  roles: null, // Public
  category: 'Discover',
}
```

**Updates to:** `src/routes/appRoutes.tsx`

Add routes:
```typescript
<Route path="/beats" element={<BeatMarketplace />} />
<Route path="/my-purchases" element={<ProtectedRoute><MyPurchases /></ProtectedRoute>} />
```

---

## File Summary

### New Files (13)

| File | Purpose |
|------|---------|
| `supabase/functions/create-beat-checkout/index.ts` | Stripe checkout for beats |
| `supabase/functions/create-coinz-checkout/index.ts` | Stripe checkout for MixxCoinz |
| `src/hooks/useBeatMarketplace.ts` | Browse public beats hook |
| `src/hooks/useBeatPurchase.ts` | Beat checkout trigger hook |
| `src/pages/BeatMarketplace.tsx` | Public beat store page |
| `src/pages/MyPurchases.tsx` | User's purchased beats |
| `src/components/marketplace/BeatMarketplaceCard.tsx` | Marketplace beat card |
| `src/components/marketplace/BeatDetailModal.tsx` | Full beat details modal |
| `src/components/marketplace/LicenseSelector.tsx` | License type picker |
| `src/components/marketplace/BeatAudioPlayer.tsx` | Audio playback component |
| `src/components/marketplace/index.ts` | Barrel export |
| `src/components/fan/CoinzPurchaseModal.tsx` | Buy MixxCoinz modal |
| `src/components/fan/CoinzPurchaseButton.tsx` | Trigger for purchase modal |

### Modified Files (5)

| File | Changes |
|------|---------|
| `supabase/functions/stripe-webhook/index.ts` | Add beat purchase handling |
| `supabase/functions/verify-stripe-session/index.ts` | Add beat verification |
| `src/pages/PaymentSuccess.tsx` | Add beat purchase success UI |
| `src/config/navigationConfig.ts` | Add Beat Store nav item |
| `src/routes/appRoutes.tsx` | Add marketplace routes |

---

## Technical Considerations

### License Terms
- **Lease License:** Non-exclusive, up to 500K streams, credit required
- **Exclusive License:** Full ownership transfer, unlimited use, no credit required
- Terms displayed before checkout, acceptance required

### Download Security
- Signed URLs with expiration (24 hours)
- Download link only visible after payment verified
- Re-download capability from MyPurchases

### Exclusive Beat Handling
- When exclusive purchased, set `is_exclusive_available = false`
- Producer cannot sell exclusive again
- Lease purchases still allowed if configured as `license_type = 'both'`

### Real-time Updates
- Enable Supabase Realtime on `beat_purchases`
- Producer dashboard shows instant sale notifications
- Buyer sees confirmation immediately

---

## Rollout Sequence

1. **Phase A:** Edge functions (create-beat-checkout, webhook updates)
2. **Phase B:** Hooks (useBeatMarketplace, useBeatPurchase)
3. **Phase C:** Marketplace page + components
4. **Phase D:** Payment success updates
5. **Phase E:** My Purchases page
6. **Phase F:** CoinzPurchaseModal
7. **Phase G:** Navigation + routing

This plan completes the economic loop where Producers monetize their beats and Artists/Fans can purchase through a seamless Stripe-integrated checkout experience.

