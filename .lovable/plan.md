
# Role-Specific Pathfinder Journeys (Phase 2)

## Overview

Add four role-specific "New Member" journeys that auto-start after a user completes signup and lands in the app. Each journey guides the user through their role's key destinations in priority order.

## Journey Definitions

Added to `src/config/pathfinderJourneys.ts`:

**Artist Journey** (5 steps)
| # | Route | Title | Nudge |
|---|-------|-------|-------|
| 1 | `/artist-crm` | Your Dashboard | Career stats, projects, and quick actions live here. |
| 2 | `/go` | AI Mastering | Polish your tracks with our mastering engine. |
| 3 | `/services/mixing` | Mixing Services | Find engineers and book mixing sessions. |
| 4 | `/community` | Community | Connect with producers, engineers, and fans. |
| 5 | `/economy` | MixxCoinz | Earn and spend coins across the platform. |

**Engineer Journey** (5 steps)
| # | Route | Title | Nudge |
|---|-------|-------|-------|
| 1 | `/engineer-crm` | Your Dashboard | Client management, sessions, and earnings. |
| 2 | `/engineer-crm?tab=clients` | Client Hub | Manage your client roster and projects. |
| 3 | `/go` | AI Mastering | Use our mastering engine on client tracks. |
| 4 | `/jobs` | Job Board | Find mixing and mastering gigs. |
| 5 | `/community` | Community | Network and build your reputation. |

**Producer Journey** (5 steps)
| # | Route | Title | Nudge |
|---|-------|-------|-------|
| 1 | `/producer-crm` | Your Dashboard | Beat catalog, sales, and analytics. |
| 2 | `/producer-crm?tab=catalog` | Beat Catalog | Manage and upload your beats. |
| 3 | `/marketplace` | Beat Store | List beats for sale in the marketplace. |
| 4 | `/go` | AI Mastering | Master your beats before publishing. |
| 5 | `/economy` | MixxCoinz | Track your earnings and rewards. |

**Fan Journey** (4 steps)
| # | Route | Title | Nudge |
|---|-------|-------|-------|
| 1 | `/fan-hub` | Your Feed | Discover new music and creators. |
| 2 | `/fan-hub?tab=day1s` | Day 1s | Support artists early and earn rewards. |
| 3 | `/community` | Community | Join conversations and battles. |
| 4 | `/economy` | MixxCoinz | Earn coins through engagement missions. |

Each journey has a `roles` filter (e.g., `roles: ['artist']`) and `phase: 2`.

## Hook Changes (`src/hooks/usePathfinder.ts`)

1. Import `useAuth` to access `activeRole`
2. Add a new effect: when a user is authenticated, has a role, has no active journey, and hasn't completed a role journey before, auto-start the matching Phase 2 journey after a short delay
3. Add a helper `getJourneyForRole(role)` that finds the first journey whose `roles` array includes the given role
4. The auto-start checks `localStorage` key `pathfinder_v1_role_started` to avoid re-triggering

## Step Card Icon Map Update (`src/components/walkthrough/PathfinderStep.tsx`)

Add new icon mappings for the role journeys: `bar-chart-3`, `users`, `briefcase`, `music`, `coins`, `disc-3`, `heart`, `compass`, `shopping-bag`, `mic-2`, `radio`.

## Beacon Update (`src/components/walkthrough/PathfinderBeacon.tsx`)

Add the journey title to the header so users see "Pathfinder -- Explore Mixxclub" vs "Pathfinder -- Your Studio Tour", giving context for which journey is active. Pull `journey` from the hook (already exposed).

## File Changes

| Action | File | Change |
|--------|------|--------|
| Modify | `src/config/pathfinderJourneys.ts` | Add 4 role-specific journeys with `roles` filter and `phase: 2` |
| Modify | `src/hooks/usePathfinder.ts` | Add role-aware auto-start logic for Phase 2 journeys |
| Modify | `src/components/walkthrough/PathfinderStep.tsx` | Expand icon map with new lucide icons |
| Modify | `src/components/walkthrough/PathfinderBeacon.tsx` | Show journey title in header |

No database changes needed -- the existing `pathfinder_progress` table already stores `journey_id` per user, supporting multiple journey types.
