

# Financial Projections Dashboard

## Overview

Build a new admin-only page at `/financial-projections` that visualizes all 13 revenue streams with interactive scenario modeling, break-even analysis, and monthly/annual projections. Uses Recharts (already installed) and existing design tokens (GlassPanel, HubHeader).

## Architecture

```text
src/pages/FinancialProjections.tsx          ← Page wrapper
src/components/finance/
  ├── FinancialProjectionsDashboard.tsx      ← Main dashboard container
  ├── ScenarioSelector.tsx                   ← Conservative/Moderate/Aggressive toggle
  ├── RevenueProjectionChart.tsx             ← Stacked area chart (13 streams over 12 months)
  ├── StreamProjectionTable.tsx              ← Detailed table with per-stream monthly/annual estimates
  ├── BreakEvenAnalysis.tsx                  ← Break-even chart + metrics (fixed costs vs cumulative revenue)
  ├── ScenarioComparison.tsx                 ← Side-by-side bar chart comparing 3 scenarios
  ├── UnitEconomicsCard.tsx                  ← ARPU, LTV, CAC, margins
  └── projectionModels.ts                    ← Pure data: 13 stream definitions, scenario multipliers, cost model
```

## Data Model (`projectionModels.ts`)

Defines all 13 revenue streams with base monthly estimates per 1,000 users:

| Stream | Conservative | Moderate | Aggressive |
|--------|-------------|----------|-----------|
| Transaction Fees | $12,000 | $15,000 | $18,000 |
| Subscriptions | $14,000 | $18,050 | $22,000 |
| Beat Marketplace | $1,500 | $3,250 | $5,000 |
| MixxCoinz | $2,000 | $3,500 | $5,000 |
| Live Gifting | $500 | $1,250 | $2,000 |
| Mastering Packages | $2,000 | $5,500 | $8,000 |
| Mixing Packages | $1,000 | $2,500 | $4,000 |
| Course Sales | $500 | $1,250 | $2,000 |
| Streaming Royalties | $300 | $750 | $1,200 |
| Sync Licensing | $200 | $500 | $800 |
| Referral Commissions | $300 | $600 | $1,000 |
| Curator Marketplace | $400 | $800 | $1,500 |
| Distribution Fees | $300 | $550 | $800 |

Each scenario includes monthly growth rates (2%/5%/8%) and a cost model (infrastructure, Stripe fees, AI costs, payouts).

## Components

1. **ScenarioSelector** -- Three-button toggle (Conservative/Moderate/Aggressive) with color coding (amber/blue/green). Controls all charts simultaneously via lifted state.

2. **RevenueProjectionChart** -- Recharts `AreaChart` with 13 stacked streams over 12 months. Tooltip shows per-stream breakdown. Legend toggles individual streams.

3. **StreamProjectionTable** -- Sortable table with columns: Stream, Monthly (Mo 1), Monthly (Mo 6), Monthly (Mo 12), Annual Total, % of Revenue. Color-coded bars for visual weight.

4. **BreakEvenAnalysis** -- `ComposedChart` plotting cumulative revenue (area) vs cumulative costs (line). Intersection point highlighted with annotation. Below chart: break-even month, runway needed, and monthly burn rate cards.

5. **ScenarioComparison** -- Grouped `BarChart` showing annual totals for all three scenarios side by side. Quick visual comparison.

6. **UnitEconomicsCard** -- Grid of KPI cards: ARPU, LTV (12-mo), CAC target, LTV:CAC ratio, gross margin %, net margin %, payback period.

## Routing

- Add lazy import + route in `appRoutes.tsx` under AdminRoute at `/financial-projections`
- Page is admin-only (wrapped in `<AdminRoute>`)

## Technical Details

- All projections are client-side computed from the static model (no database queries needed -- this is a planning tool)
- Uses existing `GlassPanel`, `HubHeader`, `Card` components
- Recharts for all charts (already a dependency)
- Responsive: charts stack vertically on mobile, table scrolls horizontally
- Tabs structure: Overview | Streams | Break-Even | Scenarios

