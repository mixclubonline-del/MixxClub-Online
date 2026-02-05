

# Fix ReferralMissionsCard Type Error

## Issue

**Error:** `Property 'totalReferrals' does not exist on type 'ReferralStats'`

**Location:** `src/components/fan/ReferralMissionsCard.tsx` line 34

**Root Cause:** The component accesses `referralStats?.totalReferrals` but the `ReferralStats` interface in `useReferralSystem.ts` defines the property as `total`:

```typescript
// In useReferralSystem.ts
interface ReferralStats {
  total: number;      // ← Correct property name
  active: number;
  pending: number;
  earnings: number;
}
```

---

## Fix

**File:** `src/components/fan/ReferralMissionsCard.tsx`

**Change line 34 from:**
```typescript
const totalReferrals = referralStats?.totalReferrals || 0;
```

**To:**
```typescript
const totalReferrals = referralStats?.total || 0;
```

---

## Summary

| File | Change |
|------|--------|
| `src/components/fan/ReferralMissionsCard.tsx` | Change `totalReferrals` → `total` |

Single line fix that aligns the component with the existing hook's type definition.

