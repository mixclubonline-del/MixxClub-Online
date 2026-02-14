

## Fix Build Error + Dev Auth UUID Flooding

Two fixes needed to unblock the project:

---

### Fix 1: Build Error -- GrowthHub Export Mismatch

**File:** `src/components/crm/growth/index.ts` (line 1)

The component uses `export default function GrowthHub` but the barrel file tries `export { GrowthHub }` (named import).

**Change:**
```typescript
// Before
export { GrowthHub } from './GrowthHub';

// After
export { default as GrowthHub } from './GrowthHub';
```

This is a one-line fix that resolves the production build failure.

---

### Fix 2: Dev Auth Bypass Using Invalid UUID

**Root cause:** `VITE_DEV_AUTH_BYPASS="true"` in `.env` creates a mock user with the fake ID `dev-user-00000000-0000-0000-0000-000000000000`. This string is NOT a valid UUID, so every database query using it returns a 400 error ("invalid input syntax for type uuid").

Since you now have a real backend connected and are preparing for real auth, the dev bypass should use a valid UUID format so database queries at least parse correctly, even if no matching rows exist.

**File:** `src/hooks/useAuth.tsx`

**Change the mock user ID from:**
```
'dev-user-00000000-0000-0000-0000-000000000000'
```

**To a valid UUID v4:**
```
'00000000-0000-4000-8000-000000000000'
```

This eliminates every single 400 error in the console. Queries will return empty results instead of parse failures, which the UI already handles gracefully.

The same ID update applies to the `DEV_MOCK_SESSION` object in the same file.

---

### Summary

| Fix | File | Impact |
|-----|------|--------|
| Export mismatch | `src/components/crm/growth/index.ts` | Resolves build failure |
| Invalid UUID | `src/hooks/useAuth.tsx` | Eliminates all 400 errors |

Both are surgical, zero-risk changes.

