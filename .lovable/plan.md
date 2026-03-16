

# User Onboarding & Profile Flows — Audit Plan

## Gaps Found

| # | Issue | Impact |
|---|-------|--------|
| 1 | No password reset flow — no `/reset-password` page exists; `resetPasswordForEmail` redirects to `/auth` which has no reset handler | Password-auth users are permanently locked out if they forget their password |
| 2 | Duplicate role-selection surfaces — `RoleStep` (auth wizard), `RoleSelection` page, `ChoosePath` page, and `MobileOnboardingFlow` all implement role selection independently with divergent logic | Maintenance burden, inconsistent behavior |
| 3 | No "Edit Profile" entry from CRM hubs — users who skip onboarding or want to update username/bio/avatar have no in-app path back to profile editing | Profile data stays incomplete or stale |
| 4 | Profile completion % not tracked — no way for users to see what's missing or get nudged toward completion | Incomplete profiles hurt matching and marketplace trust |
| 5 | OAuth users skip role metadata — Google/Apple sign-in doesn't pass role in `user_metadata`, so `AuthCallback` falls through to `/select-role` every time | Extra friction for OAuth signups who already chose a role on the marketing page |
| 6 | Onboarding wizards don't save progress — refreshing the page resets the wizard to step 0 | Users who accidentally close the tab lose all entered data |

## Plan

### 1. Add password reset flow
- Create `/reset-password` page that checks for `type=recovery` in URL hash, shows new-password form, calls `supabase.auth.updateUser({ password })`
- Add "Forgot password?" link to `EmailStep.tsx` (password mode only) that calls `resetPasswordForEmail` with `redirectTo: /reset-password`
- Add route to the router

### 2. Consolidate role selection logic
- Extract shared `useRoleSelection` hook from `RoleSelection.tsx` that handles: role insert, profile update, `refreshRoles()`, navigation to onboarding
- Refactor `RoleSelection.tsx` and `ChoosePath.tsx` to use the shared hook (keep their distinct UI — RoleSelection is post-auth, ChoosePath is marketing)
- No UI changes, just logic deduplication

### 3. Add profile editing from CRM
- Create `ProfileEditSheet.tsx` — a slide-over drawer with the same fields as onboarding (name, username, bio, avatar, genres) pre-filled from the `profiles` table
- Wire it into each CRM sidebar/header via a "Edit Profile" button
- Reuse `useUsernameValidation` and `AvatarUploadStep` components

### 4. Add profile completion indicator
- Create `useProfileCompletion` hook that checks: username, display_name, avatar_url, bio, genre_specialties — returns a percentage and list of missing fields
- Show a small progress ring + "Complete your profile" nudge in the CRM sidebar when < 100%
- Replace the existing `OnboardingReminder` component (which is a blunt banner) with this smarter, less intrusive indicator

### 5. Persist OAuth role through callback
- In `EmailStep.tsx`, before calling `lovable.auth.signInWithOAuth`, store the selected role in `sessionStorage` under `pending_oauth_role`
- In `AuthCallback.tsx`, if no role is found in `user_metadata`, check `sessionStorage` for `pending_oauth_role` and use it
- This eliminates the unnecessary redirect to `/select-role` for OAuth users who chose a role in the auth wizard

### 6. Persist onboarding wizard progress
- Save form state to `sessionStorage` keyed by `onboarding_progress_{role}` on every field change
- Restore from sessionStorage on mount in each wizard
- Clear on successful completion
- Lightweight change — just wrap the state initializers

## Execution Order

```text
1. Password reset flow          (critical security gap)
2. OAuth role persistence       (small, high-impact fix)
3. Profile edit sheet           (fills major UX gap)
4. Profile completion indicator (depends on #3)
5. Onboarding progress persist  (quality-of-life)
6. Role selection consolidation (cleanup, lowest priority)
```

## Files Created
- `src/pages/ResetPassword.tsx`
- `src/components/profile/ProfileEditSheet.tsx`
- `src/hooks/useProfileCompletion.ts`
- `src/hooks/useRoleSelection.ts`

## Files Modified
- `src/components/auth/steps/EmailStep.tsx` — forgot password link, OAuth role storage
- `src/pages/AuthCallback.tsx` — sessionStorage role fallback
- `src/App.tsx` (router) — add `/reset-password` route
- `src/components/onboarding/ArtistOnboardingWizard.tsx` — sessionStorage persistence
- `src/components/onboarding/EngineerOnboardingWizard.tsx` — same
- `src/components/onboarding/ProducerOnboardingWizard.tsx` — same
- `src/components/onboarding/FanOnboardingWizard.tsx` — same
- CRM sidebar components — add profile edit + completion indicator

