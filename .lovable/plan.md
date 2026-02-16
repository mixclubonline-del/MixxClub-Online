

## Fix Dashboard Trapping and Admin Navigation

### Problem
Three compounding issues are preventing proper navigation:
1. The generic Dashboard page does not redirect admin users to `/admin` -- it only handles `engineer` and `client` roles
2. Auth roles load asynchronously *after* the loading state is set to false, causing a race condition where routing decisions happen before the admin role is determined
3. The ImmersiveAppShell wraps the dashboard in immersive UI, making it feel inescapable

### Solution

#### 1. Fix the auth loading race condition (`src/hooks/useAuth.tsx`)
- Do NOT set `loading = false` until both the session AND user roles are fully resolved
- Move role fetching out of the `setTimeout` and into the initial auth flow
- On auth state changes, fetch roles before clearing the loading flag
- This ensures `ProtectedRoute` and downstream components always have accurate role data before rendering

#### 2. Fix Dashboard role routing (`src/pages/Dashboard.tsx`)
- Replace the incomplete role redirect (only handles `engineer`/`client`) with a proper redirect that uses `useAuth().activeRole`
- Route map:
  - `admin` -> `/admin`
  - `producer` -> `/producer-crm`
  - `engineer` -> `/engineer-crm`
  - `artist` -> `/artist-crm`
  - `fan` -> `/fan-hub`
- Remove the redundant manual auth check (the page is already inside `ProtectedAppLayout`)
- Show a loading spinner while the role is still resolving, then redirect immediately once known

#### 3. Clean up ImmersiveAppShell route list (`src/components/immersive/ImmersiveAppShell.tsx`)
- Remove `/dashboard` from the `immersiveRoutes` array since the Dashboard is now just a redirect pass-through, not a destination page
- This prevents the immersive overlay (map button, radial nav, ambient glow) from rendering on a page that should immediately redirect

### Technical Details

**Files modified:**
- `src/hooks/useAuth.tsx` -- fix loading state to wait for roles
- `src/pages/Dashboard.tsx` -- complete role-based redirect using `activeRole` from auth context
- `src/components/immersive/ImmersiveAppShell.tsx` -- remove `/dashboard` from immersive routes

**No database or schema changes required.**

The admin role for `mixclubonline@gmail.com` is confirmed present in the database. This fix ensures the auth system surfaces that role before any routing decisions are made.

