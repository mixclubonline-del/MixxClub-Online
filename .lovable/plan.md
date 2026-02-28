

# Quick Start Landing Variant

## Goal

Create a `/start` route that takes a new visitor from landing to signup to first action (upload or create profile) in under 60 seconds. No hallway, no cinematic sequences, no scene transitions -- just a sharp, conversion-optimized single page.

## Architecture

One new page component (`QuickStart.tsx`) and one new route. Reuses the existing `AuthLayout`, `useAuthWizard` hook, and auth infrastructure. No new database tables or backend changes.

## User Flow (3 panels, one page)

```text
Panel 1: Value Prop + Role Pick     (5 sec)
Panel 2: Email/Password or OAuth    (15 sec)
Panel 3: First Action CTA           (5 sec)
         -> Upload Track (/upload)
         -> Create Profile (/onboarding/{role})
         -> Browse Engineers (/engineers)
```

All three panels live in a single component with CSS transitions between them (no route changes until the final CTA). The auth form embeds inline -- no redirect to `/auth`.

## Files to Create

### 1. `src/pages/QuickStart.tsx`
- Self-contained page with three steps: `role` | `credentials` | `action`
- Step 1: Compact role grid (same 4 roles as RoleStep, but smaller cards -- single click advances)
- Step 2: Inline auth form (email + password, Google/Apple OAuth buttons). Reuses `supabase.auth.signUp` / `signInWithPassword` / `lovable.auth.signInWithOAuth` directly. Listens for `onAuthStateChange` to auto-advance to Step 3.
- Step 3: "What do you want to do first?" -- three action cards (Upload Track, Create Profile, Browse Engineers) that navigate to the real destination.
- Minimal styling: dark bg, centered card, progress bar (1/2/3), no particles, no video, no Framer Motion animations beyond simple opacity fades.
- Mobile-first: `max-w-lg`, `min-h-[100svh]`, thumb-friendly tap targets.

### 2. Route Registration
- Add `/start` route in `publicRoutes.tsx` (lazy-loaded)
- Add `/start` to `FULL_IMMERSIVE_ROUTES` in `immersiveRoutes.ts` so no global overlays appear
- Add `START: '/start'` to the route registry in `config/routes.ts`

### 3. Entry Points
- Add a "Skip to Quick Start" link in the floating nav pill inside `SceneFlow.tsx` (next to "Join Free") so visitors in the immersive flow can bail out to the fast path at any time.

## What We Reuse (no duplication)

| Concern | Source |
|---|---|
| OAuth (Google/Apple) | `lovable.auth.signInWithOAuth` from `@/integrations/lovable` |
| Email/password auth | `supabase.auth.signUp` / `signInWithPassword` directly |
| Role persistence | `user_roles` table insert (same pattern as existing onboarding) |
| Profile auto-creation | Existing database trigger on `auth.users` |
| Redirect logic | Simplified version of `useAuthWizard.redirectAuthenticatedUser` |
| Auth callback | Existing `/auth/callback` route handles OAuth returns |

## What We Deliberately Skip

- No Framer Motion (page loads instantly, no animation overhead)
- No character images/videos (zero asset weight)
- No WaitlistGate wrapping (this is a direct funnel)
- No magic link option (password + OAuth only for speed -- magic link adds email-check latency that breaks the 60-second target)
- No social proof badges or testimonial carousels

## Technical Details

### QuickStart component structure

```text
QuickStart
  |-- step state: 'role' | 'credentials' | 'action'
  |-- selectedRole state
  |-- auth state (email, password, loading, error)
  |-- onAuthStateChange listener -> auto-advance to 'action' step
  |
  |-- Step 1: Role grid (2x2), single-tap selects + advances
  |-- Step 2: Email + password form, OAuth row, mode toggle (login/signup)
  |-- Step 3: Three action cards with navigate() calls
```

### Auth flow inside QuickStart

On signup success, the existing database trigger creates the profile row. We then insert the selected role into `user_roles` via a simple `supabase.from('user_roles').upsert(...)` call. This mirrors the existing onboarding pattern but happens inline.

For OAuth, we redirect to the provider with `redirect_uri` set to `/auth/callback`, which handles the token exchange and redirects back. We add a `?from=start` param so the callback can redirect back to `/start` instead of the standard post-auth flow, letting Step 3 render.

### Immersive route registration

Adding `/start` to `FULL_IMMERSIVE_ROUTES` prevents the global player bar, status overlays, and console from rendering on this page, keeping it distraction-free.

## Summary

| File | Action |
|---|---|
| `src/pages/QuickStart.tsx` | Create -- self-contained 3-step funnel page |
| `src/routes/publicRoutes.tsx` | Add `/start` route (lazy) |
| `src/config/routes.ts` | Add `START: '/start'` constant |
| `src/config/immersiveRoutes.ts` | Add `/start` to immersive list |
| `src/components/home/SceneFlow.tsx` | Add "Quick Start" link to floating nav pill |

Five touches. One new component. Zero new dependencies. The existing auth infrastructure does the heavy lifting.

