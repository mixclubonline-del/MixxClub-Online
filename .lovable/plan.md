

# Fix Pre-Existing Build Errors

These errors pre-date the Community Showcase changes. They fall into two categories: a missing component prop, and Supabase type mismatches where code references tables/RPCs not yet in the generated types.

---

## Category 1: Missing Prop (Quick Fix)

**File**: `src/components/crm/CoinzRevenueHub.tsx` (line 30)

`HubSkeleton` now requires a `variant` prop. Add it:
```tsx
if (isLoading) return <HubSkeleton variant="stats" />;
```

---

## Category 2: Supabase Type Mismatches (Type Assertions)

The following hooks reference tables and RPCs that exist in the database but haven't been regenerated into the TypeScript types file. Since we cannot edit `types.ts` (auto-generated), the fix is to add targeted type assertions (`as any`) at each Supabase call site so the compiler stops blocking the build, while the runtime behavior stays identical.

### File: `src/hooks/useAutoEarn.ts`
- **Line 51**: `caps._date = today` -- `_date` is a string being assigned where the record type expects number. Cast the caps object.
- **Line 121**: `supabase.rpc('earn_coinz', ...)` -- RPC not in types. Add `as any` to the RPC name.

### File: `src/hooks/useCareerManager.ts`
- **Lines 80-84**: `.from('tracks')`, `.from('storefront_orders')`, `.from('collaborations')` -- tables not in types. Add `as any` after each `.from()` call.
- **Line 87**: `.total_amount` property access -- add type assertion on the data.
- **Lines 122-126**: `.from('career_milestones')` and `.milestone_id` access -- same pattern.
- **Line 231**: `.from('career_module_usage')` -- same pattern.

### File: `src/hooks/useEventTickets.ts`
- **Lines 177, 199, 217, 235, 283, 288, 324**: `.from('mixx_events')`, `.from('event_ticket_tiers')`, `.from('event_tickets')` -- tables not in types. Add `as any` after each `.from()` call.
- **Line 290**: `.insert()` with `event_id` -- add type assertion on the insert payload.
- **Line 330**: `.sold` / `.quantity` property access -- add type assertion.

---

## Implementation Pattern

For each table not in types, the fix looks like:
```typescript
// Before (type error)
supabase.from('mixx_events').select('*')

// After (compiles, runtime identical)
(supabase.from as any)('mixx_events').select('*')
```

For RPC calls:
```typescript
// Before
supabase.rpc('earn_coinz', { ... })

// After
(supabase.rpc as any)('earn_coinz', { ... })
```

---

## Summary

| File | Fix |
|---|---|
| `src/components/crm/CoinzRevenueHub.tsx` | Add `variant="stats"` to `HubSkeleton` |
| `src/hooks/useAutoEarn.ts` | Type assertions on `_date` assignment + `earn_coinz` RPC |
| `src/hooks/useCareerManager.ts` | Type assertions on 5 `.from()` calls + property accesses |
| `src/hooks/useEventTickets.ts` | Type assertions on 7+ `.from()` calls + insert/property accesses |

No schema changes. No new files. No behavior changes. Pure type-level fixes to unblock the build.

