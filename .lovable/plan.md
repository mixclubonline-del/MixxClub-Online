

# Phase 10 Sprint 4+: Two Apps in One — Pro Manager vs Fan Social

## The Vision

Right now `MobileHome.tsx` is one monolithic page that uses `if/else` branching per role. The mobile nav (`MobileEnhancedNav` and `MobileBottomNav`) does the same — same shell, different labels. This sprint replaces that with two genuinely distinct mobile experiences:

**Pro Mode** (Artist / Engineer / Producer): An on-the-go business manager — earnings ticker, pending actions, messages, session management. The vibe is "your music business in your pocket."

**Fan Mode**: A social-first discovery app — live streams, drops, community challenges, marketplace browsing. The vibe is "TikTok meets Bandcamp."

## Architecture

```text
AppLayout (phone detected)
  ├─ role === fan
  │   ├─ MobileFanNav        ← social tabs: Feed, Live, Drops, Shop, Profile
  │   └─ MobileFanHome       ← social feed, live streams, challenges, drops
  │
  └─ role === artist|engineer|producer
      ├─ MobileProNav        ← business tabs: Home, Jobs/Sessions, Messages, Earnings, Profile
      └─ MobileProHome       ← earnings summary, pending actions, active projects, messages
```

## Implementation Plan

### Task 1: Create MobileProHome — the business command center
New file: `src/pages/MobileProHome.tsx`

Sections (all real data, no mocks):
- **Personalized greeting** — time-of-day + user's first name + role badge pill
- **Earnings ticker** — today's earnings from `useUserEarnings`, animated count-up
- **Pending Actions card** — pending session applications, unread messages count, pulled from existing hooks
- **Active Projects strip** — horizontal scroll of in-progress projects from `useProjectsHub`
- **Quick Actions** — role-specific (Artist: Post Session, Find Engineer, Messages | Engineer: Browse Jobs, Messages, Earnings | Producer: Upload Beat, Sessions, Messages)
- **Session feed** — reuses existing `useOpenSessions` + `MobileSessionCard`
- Confetti on milestone moments via `canvas-confetti`

### Task 2: Create MobileFanHome — the social discovery feed
New file: `src/pages/MobileFanHome.tsx`

Sections:
- **Greeting** — time-of-day + streak badge + MixxCoinz balance
- **Live Now strip** — horizontal scroll of active streams (reuses live stream data)
- **Featured Drops** — new releases from artists the fan follows, from `FanDropsHub` data
- **Community Challenges** — active challenges from `community_challenges` table (seeded in Sprint 3)
- **Trending in Marketplace** — top marketplace items horizontal scroll
- **Missions reminder** — streak status + next mission CTA from `useFanStats`

### Task 3: Create MobileProNav — business-focused bottom navigation
New file: `src/components/mobile/MobileProNav.tsx`

5 tabs with elevated center action:
- **Home** (house icon) → MobileProHome
- **Sessions/Jobs** (briefcase) → role-specific jobs or sessions page
- **[Center] Create** (plus, elevated gradient button) → Post Session / Upload Beat
- **Messages** (message circle) → messaging hub
- **Earnings** (dollar sign) → earnings/revenue view

Inherits the haptic feedback, active indicator animation, and badge system from current `MobileBottomNav`.

### Task 4: Create MobileFanNav — social-focused bottom navigation
New file: `src/components/mobile/MobileFanNav.tsx`

5 tabs with elevated center action:
- **Feed** (heart) → FanFeedHub
- **Live** (radio) → live streams
- **[Center] Discover** (compass, elevated gradient button) → community/explore
- **Shop** (shopping bag) → marketplace/merch
- **Me** (user) → fan profile with stats, trophies, wallet

Different color palette — pink/magenta gradient on center button vs the green used for pros.

### Task 5: Wire AppLayout to split by archetype
Edit: `src/components/layouts/AppLayout.tsx`

In the `deviceType === 'phone'` branch, replace the single `MobileEnhancedNav` with:
- `role === 'fan'` → render `MobileFanNav`
- all other roles → render `MobileProNav`

### Task 6: Update Dashboard redirect for mobile
Edit: `src/pages/Dashboard.tsx`

When on a phone viewport:
- Fan → redirect to `/mobile-fan` (new route for `MobileFanHome`)
- Pro roles → redirect to `/mobile-pro` (new route for `MobileProHome`)

Add the new routes to `src/config/routes.ts` and `src/routes/mobileRoutes.tsx`.

### Task 7: Delete dead mobile stubs + consolidate
- **Delete** `MobileOnboardingWizard.tsx` (dead stub)
- **Delete** `MobileHome.tsx` (replaced by MobileProHome + MobileFanHome)
- **Edit** `MobileLanding.tsx` — replace wizard usage with navigate to `/choose-path`
- **Remove** duplicate `MobileBottomNav` references (replaced by the two new navs)
- Keep `MobileEnhancedNav` as fallback for edge cases / admin

### Task 8: Page transitions + micro-delight
Edit: `src/components/layouts/AppLayout.tsx`

- Wrap the mobile `<main>` outlet with `framer-motion` `AnimatePresence` for fade+slide-up transitions between pages
- Add `touch-manipulation` to all mobile page roots
- Add `pb-24` to authenticated mobile pages that are missing it

## File Impact
- **Create**: `src/pages/MobileProHome.tsx`, `src/pages/MobileFanHome.tsx`, `src/components/mobile/MobileProNav.tsx`, `src/components/mobile/MobileFanNav.tsx`
- **Edit**: `src/components/layouts/AppLayout.tsx`, `src/pages/Dashboard.tsx`, `src/config/routes.ts`, `src/routes/mobileRoutes.tsx`, `src/pages/MobileLanding.tsx`
- **Delete**: `src/pages/MobileHome.tsx`, `src/components/mobile/MobileOnboardingWizard.tsx`

## No Database Changes
All data hooks already exist. This is pure frontend architecture work.

