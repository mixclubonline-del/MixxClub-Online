
# Wire Revenue Hub to Complete Backend Data Sources
## Replace Random Mock Values with Real Database Queries

The Revenue Hub currently uses `useRevenueStreams.ts` which fetches real data for 6 of 10 revenue streams, but falls back to `Math.random()` for the remaining 4 streams. This phase completes the backend integration so all revenue data is accurate and persistent.

---

## Current Gap Analysis

```text
REVENUE STREAMS STATUS

WORKING (Real Database)             BROKEN (Random Values)
+-----------------------+           +------------------------+
| ✓ Mixing Services     |           | ✗ Marketplace Sales    |
| ✓ Mastering           |           | ✗ Course Sales         |
| ✓ Project Payments    |           | ✗ Streaming Royalties  |
| ✓ Partnership Splits  |           | ✗ Sync Licensing       |
| ✓ Referral Bonuses    |           +------------------------+
| ✓ Subscription Revenue|
+-----------------------+

Trends: Math.random() for all streams (should compare to previous period)
Forecasts: Math.random() noise (should use actual historical data)
```

**Root Cause in `useRevenueStreams.ts`:**
```typescript
// Line 175-202: These use Math.random() instead of real data
amount: Math.floor(Math.random() * 500),  // Marketplace
amount: Math.floor(Math.random() * 300),  // Courses
amount: Math.floor(Math.random() * 800),  // Royalties
amount: Math.floor(Math.random() * 1200), // Licensing
```

---

## Implementation Plan

### Phase 1: Complete Revenue Data Integration

**File:** `src/hooks/useRevenueStreams.ts`

Replace random values with real database queries:

| Stream | Current Source | Target Source |
|--------|----------------|---------------|
| Marketplace Sales | `Math.random() * 500` | `marketplace_items` where `seller_id = user.id` |
| Course Sales | `Math.random() * 300` | `course_enrollments` where instructor = user |
| Streaming Royalties | `Math.random() * 800` | `streaming_analytics` or `royalty_payments` table |
| Sync Licensing | `Math.random() * 1200` | `licensing_agreements` table |

### Phase 2: Add Missing Tables (If Needed)

Check if these tables exist; create migrations if missing:

| Table | Purpose | Status |
|-------|---------|--------|
| `marketplace_items` | Seller's products | EXISTS |
| `marketplace_purchases` | Purchase records | EXISTS |
| `streaming_royalties` | Royalty tracking | CHECK |
| `licensing_agreements` | Sync license deals | CHECK |
| `course_instructor_earnings` | Course sales revenue | CHECK |

### Phase 3: Fix Trend Calculations

Replace random trend generation:

```typescript
// BEFORE (random)
const calculateTrend = () => Math.floor(Math.random() * 30) - 10;

// AFTER (real comparison)
const calculateTrend = (currentAmount: number, previousAmount: number) => {
  if (previousAmount === 0) return currentAmount > 0 ? 100 : 0;
  return Math.round(((currentAmount - previousAmount) / previousAmount) * 100);
};
```

This requires fetching previous period data (last month vs this month).

### Phase 4: Fix Forecast Generation

Replace random forecast noise with actual historical trend-based projection:

```typescript
// BEFORE (random noise)
projected: totalRevenue * (0.1 + i * 0.02) + Math.random() * 500,

// AFTER (trend-based)
projected: calculateProjection(historicalData, monthsAhead);
```

---

## Database Schema Additions

**If `streaming_royalties` doesn't exist:**

```sql
CREATE TABLE public.streaming_royalties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  platform TEXT NOT NULL, -- 'spotify', 'apple_music', 'youtube', etc.
  track_id UUID REFERENCES audio_files(id),
  amount_cents INTEGER NOT NULL DEFAULT 0,
  streams_count INTEGER NOT NULL DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'disputed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.streaming_royalties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own royalties"
  ON public.streaming_royalties FOR SELECT
  USING (user_id = auth.uid());
```

**If `licensing_agreements` doesn't exist:**

```sql
CREATE TABLE public.licensing_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  licensor_id UUID NOT NULL REFERENCES auth.users(id),
  track_id UUID REFERENCES audio_files(id),
  licensee_name TEXT NOT NULL,
  license_type TEXT NOT NULL, -- 'sync', 'master', 'mechanical', 'performance'
  usage_context TEXT, -- 'film', 'tv', 'commercial', 'game', 'web'
  amount_cents INTEGER NOT NULL,
  royalty_percentage NUMERIC(5,2),
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'completed', 'expired')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.licensing_agreements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own licensing agreements"
  ON public.licensing_agreements FOR SELECT
  USING (licensor_id = auth.uid());

CREATE POLICY "Users can create their own licensing agreements"
  ON public.licensing_agreements FOR INSERT
  WITH CHECK (licensor_id = auth.uid());
```

---

## Secondary Fix: AIMatchesHub Fallback Removal

**File:** `src/components/crm/matches/AIMatchesHub.tsx`

Remove the `generateSampleMatches()` fallback that produces fake data when no matches exist. Instead, show a proper empty state encouraging users to complete their profile or wait for real matches.

```typescript
// Lines 151-158: BEFORE
} else {
  setMatches(generateSampleMatches()); // Fake data
}

// AFTER
} else {
  setMatches([]); // Real empty state
}
```

---

## Files Summary

### Modified Files (2)

| File | Changes |
|------|---------|
| `src/hooks/useRevenueStreams.ts` | Replace 4 random streams with real queries; fix trends/forecasts |
| `src/components/crm/matches/AIMatchesHub.tsx` | Remove `generateSampleMatches()` fallback |

### New Database Tables (2, if missing)

| Table | Purpose |
|-------|---------|
| `streaming_royalties` | Track royalty payments from streaming platforms |
| `licensing_agreements` | Track sync/licensing deals |

---

## Updated Data Flow

```text
useRevenueStreams()
       |
       v
+------------------------------------------+
| Parallel Queries (10 sources)            |
|------------------------------------------|
| 1. engineer_earnings      -> Mixing      |
| 2. engineer_earnings      -> Mastering   |
| 3. payments               -> Projects    |
| 4. partnerships           -> Splits      |
| 5. referrals              -> Bonuses     |
| 6. user_subscriptions     -> Subs        |
| 7. marketplace_purchases  -> Marketplace | <- NEW
| 8. course_enrollments     -> Courses     | <- FIX
| 9. streaming_royalties    -> Royalties   | <- NEW
| 10. licensing_agreements  -> Licensing   | <- NEW
+------------------------------------------+
       |
       v
+------------------------------------------+
| Trend Calculation (Compare Periods)      |
| This month vs Last month                 |
+------------------------------------------+
       |
       v
+------------------------------------------+
| Forecast Generation (Historical Trend)   |
| 6-month projection based on growth rate  |
+------------------------------------------+
```

---

## Testing Checklist

After implementation:
- [ ] Marketplace Sales shows real data from `marketplace_purchases`
- [ ] Course Sales shows real data from courses where user is instructor
- [ ] Streaming Royalties shows data from `streaming_royalties` table
- [ ] Sync Licensing shows data from `licensing_agreements` table
- [ ] Trends show actual period-over-period comparison
- [ ] Forecasts use historical growth rate (no random noise)
- [ ] AIMatchesHub shows empty state when no matches (not fake data)
- [ ] Revenue Hub displays consistent values on page refresh

---

## Benefit Summary

| Metric | Before | After |
|--------|--------|-------|
| Accurate streams | 6/10 | 10/10 |
| Data persistence | Partial | Full |
| Random values | 15+ usages | 0 usages |
| Refresh consistency | Values change | Values stable |
| Trend accuracy | Random ±15% | Real comparison |
