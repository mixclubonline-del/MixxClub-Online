

# Phase 8 — Upgrade Project Board

## Current State

The Project Board infrastructure already exists with 7 files in `src/components/crm/projects/`:
- `ProjectBoard.tsx` — Kanban columns but **status moves are simulated** (TODO on line 136: no actual Supabase write)
- `ProjectsHub.tsx` — 4-view tabs (Board/List/Timeline/Analytics) with search and filters
- `ProjectDetailPanel.tsx` — Slide-out detail sheet with edit, milestones, files, comments
- `CreateProjectModal.tsx` — Project creation with usage enforcement
- `MilestoneTracker.tsx`, `ProjectTimeline.tsx`, `ProjectAnalytics.tsx` — Supporting views
- `useProjectsHub.ts` — Full CRUD hook with `updateStatus` method already written

The `EarningsDashboard.tsx` also embeds `ProjectBoard` in a tab but uses `usePartnershipEarnings` instead of `useProjectsHub`, creating a **data source split**.

## Problems to Fix

1. **ProjectBoard.tsx uses `usePartnershipEarnings`** for data but has a fake `handleMoveProject` (setTimeout simulation). The real `updateStatus` method lives in `useProjectsHub`.
2. **No cross-partnership filtering** — ProjectsHub queries all projects but doesn't filter by partner.
3. **No GlassPanel/HubHeader design tokens** — ProjectsHub uses raw Cards instead of the standardized design system.
4. **EarningsDashboard's ProjectBoard tab** is disconnected from ProjectsHub's richer filtering/views.

## Changes

### 1. `src/components/crm/projects/ProjectBoard.tsx` (~30 lines changed)
- Replace `usePartnershipEarnings` with `useProjectsHub`
- Wire `handleMoveProject` to the real `updateStatus` method (Supabase write + activity log)
- Add toast feedback on status change
- Remove the setTimeout simulation

### 2. `src/components/crm/projects/ProjectsHub.tsx` (~40 lines changed)
- Import and apply `GlassPanel`, `HubHeader` from `../design`
- Add partner filter dropdown (query distinct partners from projects)
- Wrap stats cards in GlassPanel
- Add `useIsMobile` for mobile-responsive tab → Select dropdown (matching NotificationsHub pattern)

### 3. `src/components/crm/earnings/EarningsDashboard.tsx` (~10 lines changed)
- Replace standalone `ProjectBoard` embed with `ProjectsHub` component (brings full 4-view experience into the Earnings tab)
- Remove now-redundant `CreateProjectModal` import (ProjectsHub manages its own)

### 4. `src/components/crm/projects/ProjectBoard.tsx` — Design Token Upgrade (~20 lines)
- Wrap columns in GlassPanel instead of raw Card
- Use design-token color classes for column headers

No database changes needed — `useProjectsHub.updateStatus` already performs the Supabase write and activity logging.

