---
description: CRM Phase 3 - Polish UX with file version timeline, standardized loading skeletons, and illustrated empty states across all hub components
---

# Phase 3: UX Polish

## Context

The CRM has functional data connectivity but inconsistent UX quality:

- Loading: ~27 hubs use `<Skeleton>`, ~15 use `<Loader2>` spinner or nothing
- Empty states: Many hubs show bare `<p className="text-muted-foreground">No data</p>`
- File versioning: Artist CRM promises "Version Control" but ActiveWorkHub lists deliverables flatly
- No animation on stat counters

## Prerequisites

- Workspace: `/Volumes/ALL SESSIONS AND AUDIO/mixxclub/MixxClub-Online`
- Phase 1 design tokens should be available (GlassPanel, HubHeader)

## Steps

### 1. Create `HubSkeleton` component

Create `src/components/crm/design/HubSkeleton.tsx`:

- Accept props: `variant` ('stats' | 'list' | 'cards' | 'tabs'), `count` (number)
- `stats`: Render N skeleton stat cards in a responsive grid
- `list`: Render N skeleton rows with avatar placeholder, text lines, badge
- `cards`: Render N skeleton cards in a grid
- `tabs`: Render a skeleton tab bar + content area
- Use shadcn's `<Skeleton>` primitive with `animate-pulse`
- All variants should use GlassPanel styling if available

### 2. Create `EmptyState` component

Create `src/components/crm/design/EmptyState.tsx`:

- Accept props: `icon` (LucideIcon), `title` (string), `description` (string), `cta` (optional { label, onClick })
- Large centered icon (48px, `text-muted-foreground/30`)
- Title + description centered below
- Optional CTA button with primary styling
- Subtle entrance animation

### 3. Update barrel export

File: `src/components/crm/design/index.ts`

- Add exports for `HubSkeleton` and `EmptyState`

### 4. Build file version timeline in ActiveWorkHub

File: `src/components/crm/ActiveWorkHub.tsx`

- Group deliverables by project
- For each project, show a vertical timeline of versions:
  - Version number, file name, upload timestamp
  - Status badge (pending, in_progress, approved, revision_requested)
  - Connector line between versions
- Query `engineer_deliverables` ordered by `version_number` descending
- Use `formatDistanceToNow` from date-fns for relative timestamps

### 5. Migrate loading states — Batch 1 (core hubs)

For each of these files, replace `<Loader2 className="animate-spin">` with `<HubSkeleton>`:

- `src/components/crm/ActiveWorkHub.tsx` → `<HubSkeleton variant="list" count={5} />`
- `src/components/crm/StoreHub.tsx` → `<HubSkeleton variant="cards" count={6} />`
- `src/components/crm/MusicHub.tsx` → `<HubSkeleton variant="cards" count={4} />`
- `src/components/crm/BrandHub.tsx` → `<HubSkeleton variant="stats" count={3} />`

### 6. Migrate loading states — Batch 2 (sub-hubs)

- `src/components/crm/clients/ClientsHub.tsx` → `<HubSkeleton variant="list" count={8} />`
- `src/components/crm/matches/MatchesHub.tsx` → `<HubSkeleton variant="cards" count={4} />`
- `src/components/crm/opportunities/OpportunitiesHub.tsx` → `<HubSkeleton variant="list" count={6} />`

### 7. Add empty states — Batch 1

For each hub, find the "no data" fallback and replace with `<EmptyState>`:

- `ActiveWorkHub` → `icon: FileText, title: "No active projects", cta: "Browse Opportunities" → ?tab=opportunities`
- `MusicHub` → `icon: Music, title: "No tracks yet", cta: "Upload Your First Track"`
- `StoreHub` → `icon: ShoppingBag, title: "Your store is empty", cta: "Create a Listing"`
- `ClientsHub` → `icon: Users, title: "No clients yet", cta: "Find Matches" → ?tab=matches`

### 8. Add empty states — Batch 2

- `MessagingHub` → `icon: MessageSquare, title: "No conversations yet", cta: "Start a Conversation"`
- `OpportunitiesHub` → `icon: Briefcase, title: "No opportunities available"`
- `CommunityHub` feed → `icon: Users, title: "Community activity loading..."`

### 9. Verify

// turbo

```bash
cd "/Volumes/ALL SESSIONS AND AUDIO/mixxclub/MixxClub-Online" && npx tsc --noEmit
```

### 10. Visual check

- Browse each migrated hub with no data to verify empty states render properly
- Verify skeleton loading states appear during data fetch

## Success Criteria

- [ ] `HubSkeleton` and `EmptyState` components created
- [ ] File version timeline added to ActiveWorkHub
- [ ] At least 7 hubs migrated to standardized loading skeletons
- [ ] At least 7 hubs migrated to illustrated empty states
- [ ] Zero TypeScript errors
