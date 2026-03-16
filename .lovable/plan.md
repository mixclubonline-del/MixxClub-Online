

# Financial Reporting & Reconciliation — Enhancement Plan

## Current State

The AdminRevenueHub already has:
- Overview with 30-day revenue/payout charts, revenue-by-type pie chart
- Transactions table (limited to 30 rows, no filtering)
- Payouts table (limited to 25 rows, no filtering)
- Basic reconciliation (run button, summary stats, no discrepancy details)
- Stripe Command Center (live Stripe balance, charges, disputes, subscriptions)

**What's missing:**
1. No date range filtering on any tab
2. No CSV/JSON export for transactions, payouts, or reconciliation reports
3. Reconciliation discrepancies are computed but never displayed in the UI
4. No tax-ready export (itemized revenue by type/period with tax-relevant fields)
5. No connection between the financial projections model and actual revenue data (forecast vs actuals)
6. Stripe reconciliation detail (missing_in_stripe, missing_in_db, amount_mismatches) is returned by the edge function but silently dropped in the UI

## Plan

### 1. Add date range filter + export toolbar to AdminRevenueHub
- Add a shared filter bar at the top with: date range picker (preset: 7d, 30d, 90d, YTD, custom), payment type filter, status filter
- Apply filters to all tabs (Overview chart, Transactions, Payouts)
- Add "Export CSV" and "Export JSON" buttons using the existing `AnalyticsExportButton` pattern

### 2. Show reconciliation discrepancy details
- When `reconciliationReport` is set, render a table of `discrepancies[]` showing type (missing_in_stripe, missing_in_db, amount_mismatch), IDs, amounts, and differences
- Show Stripe reconciliation details (charges checked, per-category counts)

### 3. Add tax-ready export
- New "Tax Export" button on the reconciliation tab
- Generates a CSV with: Date, Transaction ID, Customer Email (if available), Service Type, Gross Amount, Platform Fee, Net Amount, Refund Amount, Currency, Status
- Groups by month with subtotals row
- Add date range to the `financial-reconciliation` edge function as input params so reports can be scoped to tax periods (Q1, Q2, full year, custom)

### 4. Add forecast vs actuals comparison
- New "Forecast" tab in AdminRevenueHub
- Pull actual revenue by month from `payments` table, overlay against the projections model data from `projectionModels.ts`
- Simple line chart: projected vs actual per month

### 5. Enhance financial-reconciliation edge function
- Accept optional `start_date` and `end_date` params to scope the reconciliation window
- Include `user_subscriptions` in the reconciliation (currently only checks `user_mastering_subscriptions`)
- Return per-service-type revenue breakdown in the summary

### Files to Modify
- `src/components/admin/AdminRevenueHub.tsx` — date filters, export buttons, discrepancy table, forecast tab
- `supabase/functions/financial-reconciliation/index.ts` — date range params, per-type breakdown, subscription inclusion
- `src/utils/csvExport.ts` — add `prepareTaxExport` helper

### Files to Create
- `src/components/admin/RevenueFilters.tsx` — shared date range + type filter bar
- `src/components/admin/ForecastVsActuals.tsx` — chart comparing projections to real data
- `src/components/admin/ReconciliationDetails.tsx` — discrepancy table + Stripe detail cards

