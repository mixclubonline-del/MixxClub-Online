

# Fix Build Errors (3 Categories)

Three groups of errors are blocking the build. All are missing imports or type mismatches -- no logic changes needed.

---

## 1. SceneFlow.tsx -- Missing `motion` Import

`motion` from framer-motion is used at lines 128 and 154 but never imported.

**Fix**: Add `import { motion } from 'framer-motion'` to the existing imports at the top of the file.

---

## 2. appRoutes.tsx -- 6 Missing Page Imports

Lines 229-234 reference `RoleSelection`, `ArtistOnboarding`, `EngineerOnboarding`, `HybridOnboarding`, `ProducerOnboarding`, and `FanOnboarding` but none are imported. All 6 page files exist under `src/pages/`.

**Fix**: Add lazy imports after the existing lazy-loaded pages block (around line 91):

```typescript
const RoleSelection = React.lazy(() => import("@/pages/RoleSelection"));
const ArtistOnboarding = React.lazy(() => import("@/pages/ArtistOnboarding"));
const EngineerOnboarding = React.lazy(() => import("@/pages/EngineerOnboarding"));
const HybridOnboarding = React.lazy(() => import("@/pages/HybridOnboarding"));
const ProducerOnboarding = React.lazy(() => import("@/pages/ProducerOnboarding"));
const FanOnboarding = React.lazy(() => import("@/pages/FanOnboarding"));
```

---

## 3. PromoStudio.tsx -- Supabase Type Mismatches

`.from('promo_campaigns')` and `.from('promo_assets')` are not in the generated types. Same pattern as previous fixes.

**Fix**: Apply `(supabase.from as any)` cast on the two Supabase calls at lines 127 and 141:

```typescript
const { data, error } = await (supabase.from as any)('promo_campaigns')
```
```typescript
const { data, error } = await (supabase.from as any)('promo_assets')
```

---

## Summary

| File | Error | Fix |
|---|---|---|
| `src/components/home/SceneFlow.tsx` | `motion` not defined | Add framer-motion import |
| `src/routes/appRoutes.tsx` | 6 undefined components | Add 6 lazy imports |
| `src/pages/PromoStudio.tsx` | `promo_campaigns` / `promo_assets` not in types | `(supabase.from as any)` casts |

Three files edited. No behavior changes. Pure import/type fixes.
