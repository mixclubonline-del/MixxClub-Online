

# Quick Start Visual Pass + Deep Site Walkthrough ("Pathfinder")

## Part 1 — Quick Start Visual Upgrade

The `/start` page currently uses flat `bg-background` with plain `bg-card border-border` tiles. It needs the immersive glassmorphic treatment to match the rest of the funnel.

### Changes to `src/pages/QuickStart.tsx`

**Outer container:**
- Replace `bg-background` with a full atmospheric wrapper: radial gradient mesh (dark zinc base with a subtle primary glow center), plus a CSS noise texture overlay
- Add two soft animated glow orbs (top-left, bottom-right) using CSS keyframe animation -- no framer-motion needed here, just `@keyframes pulse` for performance

**Inner card:**
- Wrap the `max-w-lg` content in a glassmorphic card: `bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8`

**Role tiles (Step 1):**
- Replace `bg-card border-border` with `bg-white/5 border-white/10`
- Add hover: `hover:border-primary/60 hover:bg-primary/10 hover:shadow-[0_0_20px_hsl(var(--primary)/0.2)]`
- Icon container gets `bg-primary/15`

**Auth step (Step 2):**
- OAuth buttons: `bg-white/5 border-white/10` instead of default outline
- Input fields: `bg-white/5 border-white/10` styling
- Primary CTA: gradient fill `bg-gradient-to-r from-primary to-[hsl(220,90%,60%)]`

**Action tiles (Step 3):**
- Same glass treatment as role tiles

**Typography:**
- Headlines: `bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent`
- Subtext: `text-white/60`

**Progress indicator:**
- Replace plain dots with a thin glowing segmented bar with animated fill

---

## Part 2 — Deep Site Walkthrough System ("Pathfinder")

### Why Not Extend the Existing TutorialContext?

The existing `TutorialContext` is a solid DB-backed system with spotlight, narration, and progress tracking. However it:
- Requires authentication (queries `user_tutorial_progress`)
- Is designed for feature-specific tutorials within a single page context
- Uses `target_element` CSS selectors for in-page spotlight targeting

The Pathfinder is a different beast: it's a cross-site navigation guide that moves users between routes across the entire platform. It should work for both visitors (unauthenticated, exploring from the Hallway) and new members (authenticated, post-onboarding).

### Architecture: Hybrid Approach

- **Unauthenticated visitors**: Client-side `localStorage` persistence, starts from the Hallway
- **Authenticated users**: DB persistence via a new `pathfinder_progress` table so it survives across devices
- **Phased rollout**: The walkthrough is organized into "journeys" (phases), each covering a domain of the site. Phase 1 ships now, subsequent phases extend it.

### Journey Structure (All Phases)

**Phase 1 (this implementation):** The Visitor Journey -- Hallway to Conversion
| Step | Route | What They See | Nudge |
|------|-------|---------------|-------|
| 1 | `/` (Hallway) | The atmospheric entry | "This is the front door. Tap Enter or click to step inside." |
| 2 | `/` (Demo) | Cinematic music experience | "This is what MixxClub sounds like. Let it play, or skip ahead." |
| 3 | `/` (Info/Club) | The 6-room club tour | "Scroll through the rooms to see what's inside." |
| 4 | `/go` | Mastering funnel | "Try our AI mastering engine -- upload a track or use the demo." |
| 5 | `/start` | Quick Start | "Ready? Pick your role and create your account." |

**Phase 2 (future):** The New Member Journey -- Post-Auth Orientation
- Dashboard overview, CRM hub tour, profile setup, first upload

**Phase 3 (future):** The Creator Journey -- Tools Deep Dive
- Sessions, collaboration, marketplace, community features

**Phase 4 (future):** The Business Journey -- Monetization
- Revenue streams, seller dashboard, services, pricing

### New Files

**`src/hooks/usePathfinder.ts`**
- Manages the active journey, current step index, and completion state
- For unauthenticated users: reads/writes `localStorage` key `pathfinder_v1`
- For authenticated users: reads/writes from a `pathfinder_progress` DB table
- Exposes: `currentJourney`, `currentStep`, `isActive`, `next()`, `skip()`, `dismiss()`, `startJourney(journeyId)`
- Checks `isFullImmersiveRoute` to suppress the UI on routes where global overlays are hidden (but still tracks position)
- Detects when the user has naturally arrived at the step's target route and auto-advances

**`src/components/walkthrough/PathfinderBeacon.tsx`**
- The main floating UI widget -- a compact glassmorphic card pinned to bottom-right
- Shows: step title, one-line description, "Go" button (navigates to destination), "Skip" button, mini progress dots
- Animated compass/waypoint icon as identity
- On the Hallway specifically, this appears as a subtle pulsing beacon near the bottom (not a card) since the Hallway is a full-immersive route -- it morphs into the card format once on non-immersive routes
- Uses `framer-motion` for entry/exit animations
- Width: ~320px, glassmorphic: `bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl`

**`src/components/walkthrough/PathfinderStep.tsx`**
- Individual step card content: icon, title, description, action button
- Handles the "navigate" action type that triggers `useFlowNavigation` or `navigate()` depending on whether it's a scene transition or route change

**`src/config/pathfinderJourneys.ts`**
- Static journey definitions (no DB needed for the journey structure itself)
- Each journey has an ID, title, and ordered array of steps
- Each step defines: `route`, `sceneHint` (for SceneFlow steps), `title`, `description`, `icon`
- Role-aware filtering: some journeys only appear for certain roles

### Database Migration

New table: `pathfinder_progress`
```
id: uuid (PK)
user_id: uuid (FK profiles.id)
journey_id: text
current_step: integer (default 0)
is_completed: boolean (default false)
dismissed_at: timestamptz (nullable)
completed_at: timestamptz (nullable)
created_at: timestamptz
updated_at: timestamptz
```

RLS: users can only read/write their own progress rows.

### Integration Points

**`src/App.tsx`:**
- Add `<PathfinderBeacon />` at the top level (outside `AuthGatedOverlays` since it works for visitors too)
- Position it after `<CookieConsent />` in the render tree

**`src/components/home/SceneFlow.tsx`:**
- The Pathfinder needs to detect which scene is active (HALLWAY, DEMO, INFO) to auto-advance steps within the home route
- Pass scene state to PathfinderBeacon via the existing `useSceneFlowStore`

**`src/config/immersiveRoutes.ts`:**
- No changes needed -- the Pathfinder reads this but behaves differently on immersive routes (beacon mode vs card mode)

### Auto-Trigger Logic

- **First-time visitors**: Pathfinder auto-starts 3 seconds after the Hallway loads (checks `localStorage` for `pathfinder_v1_started`)
- **Post-signup users**: Pathfinder auto-starts the "New Member" journey (Phase 2) after first login if they haven't completed it
- **Manual trigger**: A compass icon in the help menu (TutorialLauncher) lets users restart any journey

---

## File Summary

| Action | File | Change |
|--------|------|--------|
| Modify | `src/pages/QuickStart.tsx` | Full visual overhaul -- glassmorphic card, atmospheric background, gradient type |
| Create | `src/config/pathfinderJourneys.ts` | Static journey/step definitions for all phases |
| Create | `src/hooks/usePathfinder.ts` | State management, persistence, auto-advance logic |
| Create | `src/components/walkthrough/PathfinderBeacon.tsx` | Main floating walkthrough widget |
| Create | `src/components/walkthrough/PathfinderStep.tsx` | Individual step content card |
| Migrate | SQL | `pathfinder_progress` table with RLS |
| Modify | `src/App.tsx` | Add PathfinderBeacon to global render tree |
| Modify | `src/components/tutorial/TutorialLauncher.tsx` | Add "Site Walkthrough" option to help menu |

### Phase 1 Scope (This Implementation)

- QuickStart visual pass (complete)
- Pathfinder infrastructure (hook, beacon, step component, journey config)
- Visitor Journey (5 steps: Hallway through Quick Start)
- localStorage persistence for visitors
- DB table + auth persistence for members
- Auto-trigger on first Hallway visit

### Future Phases (Not in This Implementation)

- Phase 2: New Member Journey (dashboard, CRM, profile)
- Phase 3: Creator Journey (sessions, collaboration, tools)
- Phase 4: Business Journey (revenue, marketplace, services)
- Phase 5: Role-specific micro-walkthroughs per CRM

Each future phase adds entries to `pathfinderJourneys.ts` and seeds step data -- the infrastructure built in Phase 1 supports all of them without architectural changes.

