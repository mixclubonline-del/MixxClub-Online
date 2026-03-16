

# Authentication Flow from Hallway Doors

## Current State
The hallway has two interactive doors (Artist left, Engineer right) that currently navigate to `/home?path=artist|engineer`. The full auth wizard already exists at `/auth` with role selection, email/password, magic link, Google/Apple OAuth, and confirmation steps. The "Sign In" button at the bottom of the hallway already links to `/auth?mode=login`.

## Problem
Door clicks bypass auth entirely — they go to `/home` regardless of login state. The doors should gate entry behind authentication, using the role implied by the door choice.

## Plan

### 1. Update `handleDoorClick` in `StudioHallwayV2.tsx`
- If user is **already authenticated**: navigate to `/home?path=artist|engineer` (current behavior)
- If user is **not authenticated**: navigate to `/auth?mode=signup&role=artist` (left door) or `/auth?mode=signup&role=engineer` (right door)
- This pre-selects the role and skips straight to the email step in the wizard

### 2. Add door-opening transition animation
- When a door is clicked, play a brief "door opening" animation before navigating:
  - The clicked door zone scales up slightly and brightens (light spill intensifies)
  - A white flash overlay fades in over ~400ms
  - Navigation fires after the animation completes
- Use `framer-motion` `animate` with `onAnimationComplete` callback

### 3. Update `useAuthWizard` to honor pre-selected role from URL
- Already partially works: `roleParam` is read from `searchParams.get('role')` and if mode is `signup` with a role pre-set, `initStep` should skip to `'email'` instead of `'role'`
- Add logic: if `roleParam` is valid AND mode is signup, set `initStep = 'email'` (skip role selection)

### 4. Add role-aware branding to EmailStep
- When a role is pre-selected (from door click), show a small role badge/indicator at the top of the email step so users know their path choice was captured
- Use the existing role color system from `RoleStep` (amber/primary/cyan/pink)

### 5. Post-auth redirect back to hallway context
- After successful auth from a door click, redirect to the role-appropriate onboarding or CRM (already handled by `redirectAuthenticatedUser` in `useAuthWizard`)

## Files Modified
- `src/components/scene/StudioHallwayV2.tsx` — Auth-gated door clicks + door-open animation
- `src/hooks/useAuthWizard.ts` — Skip role step when role is pre-selected via URL param
- `src/components/auth/steps/EmailStep.tsx` — Show role badge when pre-selected

## No database changes needed

