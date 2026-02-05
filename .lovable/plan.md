

# Producer Revenue Streams Integration
## Wire Producer Revenue into useRevenueStreams + Create Producer-Specific Revenue Hub

This plan integrates Producer-specific revenue streams (beat sales, licensing income, royalty splits) into the existing revenue infrastructure and creates a tailored Producer Revenue Hub.

---

## Current State Analysis

### Existing Infrastructure
| Component | Status | Notes |
|-----------|--------|-------|
| `useRevenueStreams` hook | Built | Artist/Engineer focused, 10 generic streams |
| `RevenueHub` component | Built | Generic for artist/engineer, tabs for overview/payouts/goals/analytics |
| `useProducerSales` hook | Built | Full beat sales analytics with monthly breakdowns |
| `useBeatRoyalties` hook | Built | Royalty tracking with platform breakdowns |
| `useProducerPartnerships` hook | Built | Collab splits and active partnerships |
| `ProducerSalesHub` | Built | Sales overview + table |
| `ProducerCRM` page | Built | No revenue tab wired up |
| `CRMHubGrid` | Built | Has `revenue` hub defined but not producer-specific |

### Gap Analysis
| Missing | Purpose |
|---------|---------|
| `useProducerRevenueStreams` hook | Producer-specific revenue aggregation |
| `ProducerRevenueHub` component | Tailored UI for beat/royalty/licensing revenue |
| Revenue tab in ProducerCRM | Wire up the revenue hub |
| Producer-specific stream definitions | Beat Sales, Leases, Exclusives, Royalties, Collabs |

---

## Architecture

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                    PRODUCER REVENUE SYSTEM                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  DATA SOURCES                                                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │  beat_purchases │  │  beat_royalties │  │   partnerships  │         │
│  │  (lease/excl)   │  │  (streaming $)  │  │  (collab splits)│         │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘         │
│           │                    │                    │                   │
│           └────────────────────┼────────────────────┘                   │
│                                │                                        │
│                                ▼                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │              useProducerRevenueStreams Hook                       │  │
│  │                                                                    │  │
│  │  Aggregates into 6 Producer-Specific Revenue Streams:             │  │
│  │  1. Beat Leases           (from beat_purchases, license=lease)    │  │
│  │  2. Exclusive Sales       (from beat_purchases, license=exclusive)│  │
│  │  3. Streaming Royalties   (from beat_royalties)                   │  │
│  │  4. Collab Revenue Splits (from partnerships.producer_earnings)   │  │
│  │  5. Sync Licensing        (future: licensing_deals table)         │  │
│  │  6. Samples & Sound Kits  (from marketplace_items)                │  │
│  │                                                                    │  │
│  │  Returns: ProducerRevenueAnalytics                                 │  │
│  │  - totalRevenue, thisMonth, lastMonth, monthlyGrowth              │  │
│  │  - streams: ProducerRevenueStream[]                               │  │
│  │  - salesBreakdown: { leases, exclusives, averageSaleValue }       │  │
│  │  - royaltyMetrics: { totalStreams, platformBreakdown }            │  │
│  │  - forecasts: RevenueForecast[]                                   │  │
│  │  - recentTransactions: Transaction[]                              │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                │                                        │
│                                ▼                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    ProducerRevenueHub                             │  │
│  │                                                                    │  │
│  │  Tabs:                                                             │  │
│  │  ┌─────────┬──────────┬──────────┬───────────┐                    │  │
│  │  │Overview │ Beat Sales│ Royalties│ Analytics │                    │  │
│  │  └─────────┴──────────┴──────────┴───────────┘                    │  │
│  │                                                                    │  │
│  │  Components:                                                       │  │
│  │  - ProducerRevenueOverview (hero card + KPIs)                     │  │
│  │  - ProducerRevenueStreamCards (6 producer streams)                │  │
│  │  - BeatSalesBreakdown (leases vs exclusives chart)                │  │
│  │  - RoyaltyEarningsPanel (streaming platform breakdown)            │  │
│  │  - ProducerEarningsTimeline (revenue over time)                   │  │
│  │  - RecentTransactionsTable (latest sales + royalties)             │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Create Producer Revenue Hook

**1.1 Create `useProducerRevenueStreams` Hook**

**File:** `src/hooks/useProducerRevenueStreams.ts`

```typescript
export interface ProducerRevenueStream {
  id: string;
  name: string;
  icon: string;
  amount: number;       // in cents for precision
  displayAmount: number; // in dollars for display
  trend: number;        // percentage change
  color: string;
  description: string;
  transactionCount: number;
}

export interface ProducerRevenueAnalytics {
  // Core metrics
  totalRevenue: number;        // lifetime in dollars
  thisMonth: number;
  lastMonth: number;
  monthlyGrowth: number;
  
  // Payout info
  pendingEarnings: number;
  availableBalance: number;
  
  // Producer-specific
  totalBeatsSold: number;
  leaseSales: number;
  exclusiveSales: number;
  averageSaleValue: number;
  topSellingBeatId: string | null;
  
  // Royalty metrics
  totalStreamCount: number;
  royaltyEarnings: number;
  activeCollabCount: number;
  
  // Revenue streams (6 producer-specific)
  streams: ProducerRevenueStream[];
  
  // Charts
  revenueByMonth: { month: string; leases: number; exclusives: number; royalties: number }[];
  forecasts: { month: string; projected: number; actual?: number }[];
  
  // Recent activity
  recentTransactions: {
    id: string;
    type: 'lease' | 'exclusive' | 'royalty' | 'collab';
    amount: number;
    beatTitle?: string;
    date: string;
    status: string;
  }[];
}
```

Data fetching logic:
- Query `beat_purchases` for sales (filter by `seller_id`)
- Query `beat_royalties` via partnerships (filter by `producer_id`)
- Query `partnerships` for collab revenue (filter `producer_artist` type)
- Calculate trends by comparing current vs previous period
- Build 6 revenue streams with real data

### Phase 2: Create Producer Revenue Hub Components

**2.1 Create `ProducerRevenueHub`**

**File:** `src/components/crm/producer/ProducerRevenueHub.tsx`

Main component with 4 tabs:
- **Overview**: Hero revenue card + stream cards + recent transactions
- **Beat Sales**: Detailed breakdown of leases vs exclusives with charts
- **Royalties**: Streaming platform breakdown, collab earnings
- **Analytics**: Forecasting, trends, performance comparison

**2.2 Create `ProducerRevenueOverview`**

**File:** `src/components/producer/revenue/ProducerRevenueOverview.tsx`

Hero section showing:
- Total lifetime revenue (big number)
- This month earnings with growth badge
- Available balance (ready for payout)
- Pending earnings (processing)
- Quick stats: Total beats sold, Average sale value, Active collabs

**2.3 Create `ProducerRevenueStreamCards`**

**File:** `src/components/producer/revenue/ProducerRevenueStreamCards.tsx`

Grid of 6 producer-specific revenue stream cards:
1. **Beat Leases** (icon: disc-3, color: blue)
2. **Exclusive Sales** (icon: crown, color: purple)
3. **Streaming Royalties** (icon: music, color: green)
4. **Collab Splits** (icon: handshake, color: amber)
5. **Sync Licensing** (icon: tv, color: red) - placeholder for future
6. **Samples & Kits** (icon: package, color: cyan) - from marketplace

Each card shows: amount, trend %, transaction count, % of total

**2.4 Create `BeatSalesBreakdown`**

**File:** `src/components/producer/revenue/BeatSalesBreakdown.tsx`

Visual breakdown of beat sales:
- Stacked bar chart: Leases vs Exclusives by month
- Pie chart: License type distribution
- Top selling beats list with sale counts
- Average sale value comparison

**2.5 Create `RoyaltyEarningsPanel`**

**File:** `src/components/producer/revenue/RoyaltyEarningsPanel.tsx`

Streaming royalty dashboard:
- Platform breakdown (Spotify, Apple Music, YouTube, etc.)
- Total streams counter
- Earnings by track/collab
- Monthly trend chart
- Pending vs paid royalties

**2.6 Create `RecentTransactionsTable`**

**File:** `src/components/producer/revenue/RecentTransactionsTable.tsx`

Table showing recent revenue activity:
- Type badge (Lease/Exclusive/Royalty/Collab)
- Beat/Track title
- Amount earned
- Date
- Status (completed/pending/processing)

### Phase 3: Wire into ProducerCRM

**3.1 Update `ProducerCRM`**

Add revenue tab to the renderContent switch:
```typescript
case 'revenue':
  return <ProducerRevenueHub />;
```

**3.2 Update Producer Quick Actions**

Add "View Revenue" quick action:
```typescript
{
  label: 'View Revenue',
  icon: <DollarSign className="w-4 h-4" />,
  onClick: () => handleTabChange('revenue'),
  variant: 'outline',
}
```

**3.3 Update ProducerDashboardHub**

Wire real stats from the revenue hook:
```typescript
const { analytics } = useProducerRevenueStreams();

// Use real values
<p className="text-2xl font-bold">
  ${analytics?.totalRevenue.toFixed(2) || '0'}
</p>
```

---

## File Summary

### New Files (8)

| File | Purpose |
|------|---------|
| `src/hooks/useProducerRevenueStreams.ts` | Aggregate producer revenue from all sources |
| `src/components/crm/producer/ProducerRevenueHub.tsx` | Main revenue hub with tabs |
| `src/components/producer/revenue/ProducerRevenueOverview.tsx` | Hero card + KPIs |
| `src/components/producer/revenue/ProducerRevenueStreamCards.tsx` | 6 stream cards |
| `src/components/producer/revenue/BeatSalesBreakdown.tsx` | Leases vs exclusives charts |
| `src/components/producer/revenue/RoyaltyEarningsPanel.tsx` | Streaming royalty dashboard |
| `src/components/producer/revenue/RecentTransactionsTable.tsx` | Recent activity table |
| `src/components/producer/revenue/index.ts` | Barrel exports |

### Modified Files (3)

| File | Changes |
|------|---------|
| `src/pages/ProducerCRM.tsx` | Add revenue tab case, quick action |
| `src/components/crm/producer/ProducerDashboardHub.tsx` | Wire real revenue stats |
| `src/components/producer/index.ts` | Export revenue components |

---

## Revenue Stream Definitions

| Stream | Source | Calculation |
|--------|--------|-------------|
| Beat Leases | `beat_purchases` | `license_type = 'lease'`, sum `seller_earnings_cents` |
| Exclusive Sales | `beat_purchases` | `license_type = 'exclusive'`, sum `seller_earnings_cents` |
| Streaming Royalties | `beat_royalties` | sum `producer_amount` |
| Collab Splits | `partnerships` | `producer_artist` type, sum `producer_earnings` |
| Sync Licensing | future table | placeholder $0 for now |
| Samples & Kits | `marketplace_items` | filter by producer, sum earnings |

---

## Technical Considerations

### Data Aggregation Strategy
- Use `Promise.all` for parallel fetching from multiple tables
- Calculate trends by comparing current period vs previous period
- Build monthly breakdown for charts

### Currency Handling
- Store amounts in cents internally
- Display in dollars with proper formatting
- Use `toLocaleString` for thousand separators

### Performance
- Use React Query for caching and background updates
- Memoize expensive calculations
- Lazy load chart components

### Real-time Updates
- Add Supabase realtime subscription for `beat_purchases`
- Trigger refetch when new sale comes in
- Show toast notification on new sale

---

## Rollout Sequence

1. **Phase A**: Create `useProducerRevenueStreams` hook with full data aggregation
2. **Phase B**: Create `ProducerRevenueOverview` and `ProducerRevenueStreamCards`
3. **Phase C**: Build `BeatSalesBreakdown` and `RoyaltyEarningsPanel`
4. **Phase D**: Create `RecentTransactionsTable` and `ProducerRevenueHub`
5. **Phase E**: Wire into `ProducerCRM` and update dashboard
6. **Phase F**: Add real-time subscriptions and polish

This implementation gives Producers a dedicated revenue dashboard that tracks their unique income streams: beat sales (leases vs exclusives), streaming royalties from collaborations, and partnership revenue splits - all with real data from the existing database tables.

