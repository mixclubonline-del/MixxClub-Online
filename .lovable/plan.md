

## Fix Admin Profile Data + Unify Role Routing

### Problem Summary

Your admin account (`mixclubonline@gmail.com`) has stale data in the `profiles` table:
- `profiles.role = 'artist'` (should be `admin`)
- `onboarding_completed = false` (should be `true`)

Three code paths all read `profiles.role` first, which sends you into an artist onboarding loop instead of the Admin CRM:
1. `useAuthWizard.ts` (session redirect on auth page load)
2. `AuthCallback.tsx` (post-magic-link redirect)
3. `Dashboard.tsx` (already fixed to use `activeRole` from `useAuth`)

### Plan

#### 1. Fix admin profile data (database update)

Set `role = 'admin'` and `onboarding_completed = true` for the admin account. This is a data update, not a schema change.

#### 2. Fix `useAuthWizard.ts` -- use `user_roles` table

Replace the `profiles.role` query (lines 55-59) with a `user_roles` lookup:
- Query `user_roles` for the authenticated user
- Use role priority (admin > producer > engineer > artist > fan) to pick the primary role
- Add `admin` to the `crmMap` routing table
- Skip onboarding check entirely for admin users

#### 3. Fix `AuthCallback.tsx` -- prioritize `user_roles` for routing

The callback currently checks `profiles.role` first (line 76), then falls back to `user_roles`. Flip the priority:
- Use the role from `user_roles` (already fetched on line 52-54) as the primary source
- Only fall back to `profiles.role` or metadata if `user_roles` is empty
- Add `admin` to the CRM routing map
- Skip onboarding for admin users

#### 4. Add missing routes to `ImmersiveAppShell.tsx`

Add `/producer-crm` and `/fan-hub` to the `immersiveRoutes` array so all four role CRMs get consistent ambient shell treatment.

### Technical Details

**Database update (not a migration):**
- `UPDATE profiles SET role = 'admin', onboarding_completed = true WHERE email = 'mixclubonline@gmail.com'`

**Files modified:**
- `src/hooks/useAuthWizard.ts` -- query `user_roles` instead of `profiles.role`; add admin to crmMap
- `src/pages/AuthCallback.tsx` -- flip role priority to `user_roles` first; add admin routing
- `src/components/immersive/ImmersiveAppShell.tsx` -- add `/producer-crm` and `/fan-hub` to immersive routes

**No schema changes. No new dependencies.**

