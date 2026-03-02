---
description: CRM Phase 2 - Build critical missing features (Notifications Hub, Calendar/Scheduling, Mobile responsiveness) to fulfill landing page promises
---

# Phase 2: Critical Features

## Context

The CRM landing pages promise features that don't yet exist in the CRM implementations:

- **Notifications**: No notification hub wired into CRM grids (component exists at `src/components/crm/notifications/NotificationsHub.tsx` but isn't in any grid)
- **Calendar/Scheduling**: Artists and engineers were promised "Calendar Sync" and "Session Scheduling" but no calendar view exists
- **Mobile**: 34 of 42 hub components don't check `useIsMobile` — they render multi-column grids that break on phones

## Prerequisites

- Workspace: `/Volumes/ALL SESSIONS AND AUDIO/mixxclub/MixxClub-Online`
- Phase 1 (design tokens) should ideally be completed first so new components use `GlassPanel`/`HubHeader`
- Supabase tables: `collaboration_sessions`, `projects`, `audit_logs`, `profiles`

## Steps

### 1. Wire NotificationsHub into CRM grids

File: `src/components/crm/CRMHubGrid.tsx`

- Add `Bell` icon import from `lucide-react`
- Add notification entry to the `artist`, `engineer`, and `producer` hub definitions:

  ```ts
  { id: 'notifications', label: 'Alerts', icon: Bell, description: 'Updates & notifications' }
  ```

- Do NOT add to `fan` grid (fans already have their own system)

### 2. Wire NotificationsHub tab routing

Files: `src/pages/ArtistCRM.tsx`, `src/pages/EngineerCRM.tsx`, `src/pages/ProducerCRM.tsx`

- Import `NotificationsHub` from `@/components/crm/notifications`
- Add `case 'notifications'` to each CRM's tab switch that renders `<NotificationsHub />`

### 3. Verify NotificationsHub has real data

File: `src/components/crm/notifications/NotificationsHub.tsx`

- Check if it queries Supabase. If hardcoded, rewrite to query:
  - `audit_logs` for recent activity
  - `projects` for status changes
  - Subscribe to Supabase real-time channel for live updates
- Display notifications grouped by: Today, This Week, Earlier

### 4. Build ScheduleHub

Create `src/components/crm/schedule/ScheduleHub.tsx`:

- Query `collaboration_sessions` for scheduled sessions (`scheduled_at` field)
- Query `projects` for deadline tracking (`deadline` field)
- Render a month-view calendar grid showing:
  - Sessions as colored dots (blue for artist, orange for engineer)
  - Deadlines as red markers
  - Today highlighted
- Add upcoming sessions list below calendar
- Use `GlassPanel` and `HubHeader` from Phase 1 design tokens (or fallback to Card if Phase 1 not done)

### 5. Create barrel export for ScheduleHub

Create `src/components/crm/schedule/index.ts`:

```ts
export { ScheduleHub } from './ScheduleHub';
```

### 6. Wire ScheduleHub into CRM grids

File: `src/components/crm/CRMHubGrid.tsx`

- Add `Calendar` icon import
- Add to `artist` and `engineer` hub definitions:

  ```ts
  { id: 'schedule', label: 'Schedule', icon: Calendar, description: 'Calendar & deadlines' }
  ```

### 7. Wire ScheduleHub tab routing

Files: `src/pages/ArtistCRM.tsx`, `src/pages/EngineerCRM.tsx`

- Import `ScheduleHub` from `@/components/crm/schedule`
- Add `case 'schedule'` to tab switch

### 8. Mobile responsiveness pass

For each of these high-traffic hub files, add mobile checks:

- `src/components/crm/ActiveWorkHub.tsx` — stack columns on mobile
- `src/components/crm/RevenueHub.tsx` — tabs → dropdown on mobile
- `src/components/crm/clients/ClientsHub.tsx` — single-column cards
- `src/components/crm/community/CommunityHub.tsx` — stack feed/sidebar
- `src/components/crm/community/CommunityStats.tsx` — `grid-cols-2` on mobile (currently `grid-cols-6`)
- `src/components/crm/matches/MatchesHub.tsx` — stack match cards

For each file:

1. Import `useIsMobile` from `@/hooks/use-mobile`
2. Replace fixed `grid-cols-N` with responsive: `grid-cols-1 md:grid-cols-2 lg:grid-cols-N`
3. For tab bars with 4+ tabs, conditionally render a `<Select>` dropdown on mobile

### 9. Verify

// turbo

```bash
cd "/Volumes/ALL SESSIONS AND AUDIO/mixxclub/MixxClub-Online" && npx tsc --noEmit
```

### 10. Browser test

- Test `/artist-crm?tab=notifications` loads with real data
- Test `/artist-crm?tab=schedule` shows calendar
- Resize browser to 375px width and verify hub grids don't overflow

## Success Criteria

- [ ] NotificationsHub wired into Artist, Engineer, Producer CRM grids + tab routing
- [ ] ScheduleHub created with real session/deadline data + wired into grids
- [ ] At least 6 hub components made mobile-responsive
- [ ] Zero TypeScript errors
