
# Fix Navigation Dropdown Links Redirecting to Auth

## The Problem

When an unauthenticated user clicks links in the **Studio** or **Community** dropdown menus from the Navigation bar (visible on `/how-it-works` and other public pages), they get redirected to `/auth?redirect=...` instead of reaching the actual page. This is because the service and community routes are **only** defined inside `appRoutes.tsx`, which wraps everything in `ProtectedAppLayout` (requires login).

**Affected links:**
- Studio dropdown: `/services/mixing`, `/services/mastering`, `/services/ai-mastering`, `/services/distribution`, `/showcase`
- Community dropdown: `/community`, `/community?tab=arena`, `/community?tab=leaderboard`, `/marketplace`

## The Fix

Move these showcase/marketing routes out of the protected `appRoutes` and into `publicRoutes.tsx` so they're accessible to everyone. The authenticated versions in `appRoutes` (which add the sidebar/header layout) remain for logged-in users.

### File: `src/routes/publicRoutes.tsx`

Add these public route entries (imports + `<Route>` elements):

- `/services` (Services index)
- `/services/mixing` (MixingShowcase)
- `/services/mastering` (MasteringShowcase)
- `/services/ai-mastering` (AIMastering)
- `/services/distribution` (DistributionHub)
- `/showcase` (Showcase)
- `/marketplace` (BeatMarketplace)

**Note:** `/community` is already in `publicRoutes.tsx` (line 60), so that one is fine. The issue there is that React Router matches the `appRoutes` version first (inside `ProtectedAppLayout`) before the public one. Since both route sets are rendered as siblings inside `<Routes>`, the first match wins -- and `appRoutes` appears after `publicRoutes` in `App.tsx` (line 91-92), so `publicRoutes` should win. But the community dropdown links with query params like `?tab=arena` may still resolve to the protected version if there's a path conflict.

### Execution

1. Import `MixingShowcase`, `MasteringShowcase`, `AIMastering`, `DistributionHub`, `Services`, `BeatMarketplace`, and `Showcase` into `publicRoutes.tsx`
2. Add `<Route>` entries for each path listed above
3. Keep the same routes in `appRoutes.tsx` as-is (logged-in users get the app layout wrapper; since `publicRoutes` is rendered first in `App.tsx`, unauthenticated users hit the public version)

This is a single-file edit to `src/routes/publicRoutes.tsx` -- roughly 10 new lines of imports and 7 new `<Route>` elements.
