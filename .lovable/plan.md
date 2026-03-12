

# Mobile Onboarding Flow — Swipeable Card-Based Experience

## What We're Building

A full-screen, swipeable onboarding experience that fires for new mobile users after signup. It replaces the generic `AppOnboarding.tsx` with a MixxClub-branded, role-aware flow that:

1. Introduces the culture (3 swipeable intro cards)
2. Picks your role (integrated role selector card)
3. Sets up a minimal profile (display name + username)
4. Launches you into your role-specific CRM

This is distinct from the existing per-role onboarding wizards (`ArtistOnboardingWizard`, etc.) which handle deeper profile setup. This flow is the **first-touch mobile welcome** — fast, emotional, swipeable.

## Architecture

```text
MobileOnboardingFlow (full-screen overlay)
  ├─ Card 1: "Welcome to MixxClub" — culture intro, animated logo
  ├─ Card 2: "The Atlanta Model" — ecosystem pitch (artists + engineers + fans)
  ├─ Card 3: "Your Crew Awaits" — social proof (member count, active sessions)
  ├─ Card 4: "Choose Your Path" — role picker (reuses RoleStep's 4-role grid)
  ├─ Card 5: "Claim Your Name" — display name + username (minimal profile)
  └─ Card 6: "You're In" — confetti + CTA to enter CRM
```

Swipe left/right via `framer-motion` drag gestures. Progress dots at bottom. Skip available on culture cards but not on role/profile cards.

## Implementation

### Task 1: Create `MobileOnboardingFlow.tsx`
New file: `src/components/mobile/MobileOnboardingFlow.tsx`

- Full-screen overlay (`fixed inset-0 z-[100]`) with dark gradient background
- 6 cards using `framer-motion` drag with `dragConstraints`, `onDragEnd` threshold detection
- Cards 1-3: Culture intro with icons, gradient text, skip button
- Card 4: Role selection grid (4 roles with icons, colors from existing `RoleStep` palette)
- Card 5: Display name + username inputs using existing `useUsernameValidation` hook
- Card 6: Celebration with `canvas-confetti`, auto-redirect after 2s
- On completion: saves role to `user_roles`, updates `profiles` table with display name/username, sets `localStorage` flag, navigates to role-specific onboarding (`/onboarding/{role}`) or CRM

### Task 2: Create `useMobileOnboarding` hook
New file: `src/hooks/useMobileOnboarding.ts`

- Determines if user needs mobile onboarding: authenticated + `isPhone` + no role in `user_roles` + no `mobile_onboarding_complete` localStorage flag
- Provides `shouldShow`, `completeOnboarding(role, displayName, username)` function
- `completeOnboarding` inserts role, updates profile, calls `refreshRoles()`, sets localStorage flag

### Task 3: Replace `AppOnboarding.tsx`
- Rewrite `AppOnboarding.tsx` to import and render `MobileOnboardingFlow` when `useMobileOnboarding().shouldShow` is true
- Keep the component as the entry point (it's already mounted in the app) but delegate to the new flow
- Desktop users skip this entirely (gated by `isPhone` from `useBreakpoint`)

### Task 4: Wire into AppLayout
- In `AppLayout.tsx`, render `<AppOnboarding />` inside the phone branch so mobile users see it after first login
- Ensure it renders above the nav layers (`z-[100]`)

## File Impact
- **Create**: `src/components/mobile/MobileOnboardingFlow.tsx`, `src/hooks/useMobileOnboarding.ts`
- **Edit**: `src/components/mobile/AppOnboarding.tsx` (rewrite as thin wrapper), `src/components/layouts/AppLayout.tsx` (mount AppOnboarding in phone branch)

## No Database Changes
Uses existing `user_roles`, `profiles` tables, and `useUsernameValidation` hook.

## Technical Details
- Swipe detection: `framer-motion` `drag="x"` with `onDragEnd` checking `offset.x > 100` or `velocity.x > 500`
- Role assignment reuses the same insert pattern from `AuthCallback.tsx`
- Username validation reuses `useUsernameValidation` (debounced uniqueness check)
- Haptic feedback on card transitions via `useHaptics`

