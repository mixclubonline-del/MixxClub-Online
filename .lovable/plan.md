

# Fix: Blank Onboarding Screen + Build Hybrid Welcome Flow

## Root Cause (Found It)

Three compounding issues are causing the blank screen:

1. **No profile row exists for your user** (`436db5d9-...`). The `handle_new_user` trigger tried to insert with an `email` column that was dropped and re-added — it likely failed silently during your Google OAuth signup. The onboarding wizards query `profiles` with `.single()`, which returns a **406 error** when 0 rows exist, and the components silently fail with no visible UI.

2. **No user_roles row exists** either, so `useAuth` resolves to the `fan` fallback role, while the route expects `engineer`.

3. **The `user_roles` INSERT RLS policy only allows `artist` and `engineer`** — not `producer` or `fan`. So even if a user tries to select Producer or Fan during role selection, the insert silently fails.

## Fix Plan (3 Parts)

### Part 1: Database Fixes
- **Migration**: Update the `user_roles` INSERT policy to allow all 4 roles (`artist`, `engineer`, `producer`, `fan`)
- **Migration**: Update `handle_new_user()` to be resilient — use `INSERT ... ON CONFLICT DO NOTHING` and handle the case where the email column might cause issues
- **Data fix**: Insert a profile row for your user (`436db5d9-...`) so existing sessions work

### Part 2: Make Onboarding Resilient
- **Edit all 4 onboarding wizards** (`ArtistOnboardingWizard`, `EngineerOnboardingWizard`, `ProducerOnboardingWizard`, `FanOnboardingWizard`): Change `.single()` to `.maybeSingle()` in the `checkOnboardingStatus` effect so a missing profile row doesn't crash the component
- **Edit onboarding wizards**: Add an `upsert` fallback in `handleComplete` — if the profile doesn't exist yet, create it instead of just updating
- **Remove the DEV_AUTH_BYPASS** code from `useAuth.tsx` — it was a debugging artifact and is no longer needed

### Part 3: Build Hybrid Welcome Flow (New)
A universal welcome screen that renders **before** the detailed role-specific onboarding. This ensures users always see something — even if their profile/role data hasn't resolved yet.

**New file: `src/components/onboarding/WelcomeGate.tsx`**
- Renders at `/onboarding/:role` as a wrapper around the role-specific wizard
- **Step 1 — Welcome card**: "Welcome to MIXXCLUB" with the role's character (Jax/Rell/Prime/Nova), animated entry, and a "Let's Set Up Your Profile" CTA
- **Step 2 — Passes through** to the existing detailed role-specific wizard (profile + preferences + goals)
- If user data isn't loaded yet, shows a branded loading state instead of blank
- Persists welcome-seen state to `localStorage` so returning users skip straight to the wizard

**Edit: `src/pages/ArtistOnboarding.tsx`, `EngineerOnboarding.tsx`, `ProducerOnboarding.tsx`, `FanOnboarding.tsx`**
- Wrap wizard in `WelcomeGate` component

### Files Changed

| File | Change |
|---|---|
| `src/components/onboarding/WelcomeGate.tsx` | **Create** — Universal welcome screen wrapper |
| `src/components/onboarding/ArtistOnboardingWizard.tsx` | Fix `.single()` → `.maybeSingle()`, add upsert fallback |
| `src/components/onboarding/EngineerOnboardingWizard.tsx` | Same fixes |
| `src/components/onboarding/ProducerOnboardingWizard.tsx` | Same fixes |
| `src/components/onboarding/FanOnboardingWizard.tsx` | Same fixes |
| `src/pages/ArtistOnboarding.tsx` | Wrap in WelcomeGate |
| `src/pages/EngineerOnboarding.tsx` | Wrap in WelcomeGate |
| `src/pages/ProducerOnboarding.tsx` | Wrap in WelcomeGate |
| `src/pages/FanOnboarding.tsx` | Wrap in WelcomeGate |
| `src/hooks/useAuth.tsx` | Remove DEV_AUTH_BYPASS code |
| **Migration** | Fix `user_roles` INSERT policy, harden `handle_new_user()` |
| **Data insert** | Create missing profile row for your user |

