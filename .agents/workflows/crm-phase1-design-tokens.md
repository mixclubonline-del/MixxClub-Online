---
description: CRM Phase 1 - Create shared design tokens (GlassPanel, HubHeader, animation standards) to unify visual quality across all 42 hub components
---

# Phase 1: CRM Design Tokens

## Context

The CRM shell (CRMPortal, CRMHubModule, CRMStatusBar) uses premium glassmorphism, but individual hub components use inconsistent styling — some use `bg-white/[0.03] backdrop-blur-xl`, others use plain `<Card>`, and many have no visual effects at all.

This phase creates **3 shared design token components** that all 42 hub components can adopt.

## Prerequisites

- Workspace: `/Volumes/ALL SESSIONS AND AUDIO/mixxclub/MixxClub-Online`
- Familiarity with the CRM role accent system in `CRMHubModule.tsx` (lines 16-54)
- The existing EnhancedDashboardHub at `src/components/crm/dashboard/EnhancedDashboardHub.tsx` is the gold standard for visual quality

## Steps

### 1. Create `GlassPanel` component

Create `src/components/crm/design/GlassPanel.tsx`:

- Accept props: `accent` (role color), `glow` (boolean), `hoverable` (boolean), `className`, `children`
- Base styles: `bg-white/[0.03] backdrop-blur-xl border border-white/8 rounded-2xl`
- Hover state: subtle lift (`y: -2`), border glow using role accent
- Inner ambient glow orb (optional, based on `glow` prop)
- Export as named export

Reference the styling patterns in `EnhancedDashboardHub.tsx` lines 309-379 for the glassmorphic stat grid pattern.

### 2. Create `HubHeader` component

Create `src/components/crm/design/HubHeader.tsx`:

- Accept props: `icon` (ReactNode), `title` (string), `subtitle` (string), `accent` (role accent object), `action` (optional ReactNode for right-side button)
- Render a `9x9` rounded-lg icon container with the role accent background
- Title: `text-lg font-semibold text-foreground`
- Subtitle: `text-xs text-muted-foreground`
- Use `framer-motion` for entrance animation (`opacity: 0, y: -10 → 1, 0`)

### 3. Create `StaggeredList` animation wrapper

Create `src/components/crm/design/StaggeredList.tsx`:

- Accept props: `children` (ReactNode[]), `delay` (base delay, default 0.05), `className`
- Wrap each child in a `motion.div` with staggered `y: 20 → 0` entrance
- Use `whileInView` with `viewport={{ once: true }}` for scroll-triggered animation

### 4. Create barrel export

Create `src/components/crm/design/index.ts`:

```ts
export { GlassPanel } from './GlassPanel';
export { HubHeader } from './HubHeader';
export { StaggeredList } from './StaggeredList';
```

### 5. Migrate `ActiveWorkHub` as proof-of-concept

File: `src/components/crm/ActiveWorkHub.tsx` (176 lines, currently uses plain `<Card>/<CardHeader>`)

- Replace `<Card>` wrappers with `<GlassPanel>`
- Replace `<CardHeader>/<CardTitle>` with `<HubHeader>`
- Wrap project list in `<StaggeredList>`
- Ensure all existing functionality (data queries, status badges) is preserved

### 6. Migrate `StoreHub`

File: `src/components/crm/StoreHub.tsx`

- Apply same GlassPanel + HubHeader + StaggeredList pattern
- Keep all existing marketplace/store functionality intact

### 7. Migrate `ClientsHub`

File: `src/components/crm/clients/ClientsHub.tsx`

- Apply GlassPanel + HubHeader treatment
- The client list cards should use GlassPanel with `hoverable` prop

### 8. Verify

// turbo

```bash
cd "/Volumes/ALL SESSIONS AND AUDIO/mixxclub/MixxClub-Online" && npx tsc --noEmit
```

Ensure zero TypeScript errors.

### 9. Visual check

Open the browser to `/artist-crm?tab=active-work` and verify the glassmorphic treatment looks consistent with the dashboard.

## Success Criteria

- [ ] 3 new design token components created and exported
- [ ] At least 3 hub components migrated as proof-of-concept
- [ ] Zero TypeScript errors
- [ ] Visual consistency between hub interiors and the CRM shell
