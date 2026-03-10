

# Phase 4: Remaining Work — Shared Query Hook Adoption

## Status

Most of Phase 4 is already complete:
- All 3 CRM pages use `React.lazy()` for non-dashboard hubs
- LicenseBuilder, PromoCodeManager, FeaturedRotation are built and wired into ProducerCatalogHub
- `useUserProjects` and `useUserEarnings` hooks exist in `src/hooks/`

**The only remaining gap**: the shared hooks are not adopted by any hub component. Four hubs still make duplicate inline queries to `projects`, `engineer_earnings`, and `marketplace_purchases`.

## Plan

### 1. Migrate EnhancedDashboardHub to shared hooks

**File**: `src/components/crm/dashboard/EnhancedDashboardHub.tsx`

Replace the inline `fetchDashboardData()` pattern (lines 121-150) that directly queries `projects`, `engineer_earnings`, and `marketplace_purchases` with:
- `useUserProjects(user?.id, userType)` for project data
- `useUserEarnings(user?.id)` for earnings + sales data
- Keep the `audit_logs` and `achievements` queries inline (those are dashboard-specific)
- Remove the `useEffect` + `useState` loading pattern in favor of the hook's built-in `isLoading`

### 2. Migrate GrowthHub to shared hooks

**File**: `src/components/crm/GrowthHub.tsx`

The growth hub (lines 55-110) fetches projects, earnings, and sales independently. Replace with:
- `useUserProjects(user?.id, userType)` for project counts
- `useUserEarnings(user?.id)` for earnings/sales totals
- Keep achievements, partnerships, and profile queries inline (growth-specific)
- Derive XP from the shared hook data instead of re-fetching

### 3. Migrate ActiveWorkHub to shared hooks

**File**: `src/components/crm/ActiveWorkHub.tsx`

This hub queries `engineer_deliverables` joined with `projects` — it's a specialized query, so it won't directly use `useUserProjects`. However, if it also fetches standalone project data elsewhere, we'll consolidate. Otherwise, this stays as-is (its query is already unique enough).

### 4. Update .lovable/plan.md

Mark Phase 4 as complete.

## Files Modified
- `src/components/crm/dashboard/EnhancedDashboardHub.tsx`
- `src/components/crm/GrowthHub.tsx`
- `.lovable/plan.md`

