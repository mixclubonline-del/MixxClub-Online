

## Role-Specific Starter Features + Auth Guard Cleanup

### What We're Doing

Every CRM page currently shows all hubs unlocked with no gating. This plan defines **3 role-specific starter features** that are immediately available to new users, gates everything else behind the existing `FeatureGated` component, and removes redundant auth guards that cause race conditions.

### Starter Features by Role

| Role | Starter 1 | Starter 2 | Starter 3 |
|------|-----------|-----------|-----------|
| **Producer** | AI Mastering | Beat Catalog (upload) | Dashboard |
| **Artist** | AI Mastering | Music Hub (catalog) | Dashboard |
| **Engineer** | AI Mastering | Sessions (portfolio) | Dashboard |
| **Fan** | Feed (discover) | Missions (earn coinz) | Day 1s (support artists) |

Producers, Artists, and Engineers all share **AI Mastering** as their flagship starter. The other two starters are the most role-relevant features for immediate value. Dashboard is always unlocked as the home base.

Everything else (Clients, Matches, Active Work, Revenue, Community, Growth, Messages, Earnings, Sales, Collabs, Store, Brand Hub, Tri-Collabs, Opportunities, etc.) becomes gated -- showing either a community milestone progress bar or a subscription upgrade prompt via the existing `FeatureGated` component.

### Technical Implementation

#### 1. New config file: `src/config/starterFeatures.ts`

A single source of truth mapping each role to its 3 unlocked hub IDs. Everything not in the starter list is considered gated.

```text
STARTER_HUBS = {
  producer: ['dashboard', 'catalog', 'mastering'],
  artist:   ['dashboard', 'music', 'mastering'],
  engineer: ['dashboard', 'sessions', 'mastering'],
  fan:      ['feed', 'missions', 'day1s'],
}
```

Also exports a helper: `isStarterHub(role, hubId) -> boolean`

#### 2. Update `CRMHubGrid.tsx` -- visual gating on hub tiles

- Import the starter config
- For non-starter hubs, render a lock overlay on the tile (dimmed icon, lock badge, "Unlock" label)
- Clicking a locked hub shows a toast or navigates to unlockables page instead of opening the tab
- Starter hubs render normally with full interactivity

#### 3. Update CRM pages -- gate tab content with `FeatureGated`

In `ProducerCRM.tsx`, `ArtistCRM.tsx`, `EngineerCRM.tsx`, and `FanHub.tsx`:
- Wrap non-starter tab content in `<FeatureGated>` inside the `renderContent()` switch
- Starter tabs render their content directly (no gate)
- Add a "mastering" tab case to Producer/Artist/Engineer CRMs that renders the `AIMasteringService` component

#### 4. Remove redundant auth guards from CRM pages

All four CRM pages have `if (!user) navigate('/auth')` checks that race with `ProtectedAppLayout`. These will be removed:
- `ProducerCRM.tsx` lines 72-76
- `ArtistCRM.tsx` lines 95-98
- `EngineerCRM.tsx` lines 91-94
- `FanHub.tsx` has no redundant guard (already clean)

#### 5. Add "AI Mastering" hub to `CRMHubGrid` definitions

Add a mastering hub entry to the artist, engineer, and producer hub arrays so it appears in their grid:
```text
{ id: 'mastering', label: 'AI Mastering', icon: Sparkles, description: 'Master your tracks' }
```

### Files Modified

- `src/config/starterFeatures.ts` -- **new** -- starter hub definitions per role
- `src/components/crm/CRMHubGrid.tsx` -- visual lock overlay on non-starter hubs
- `src/pages/ProducerCRM.tsx` -- remove auth guard, add mastering tab, wrap gated tabs
- `src/pages/ArtistCRM.tsx` -- remove auth guard, add mastering tab, wrap gated tabs
- `src/pages/EngineerCRM.tsx` -- remove auth guard, add mastering tab, wrap gated tabs
- `src/pages/FanHub.tsx` -- wrap gated tabs (wallet, curator, favorites)

### What This Does NOT Change

- The routes themselves (no URL changes)
- The existing `FeatureGated` component (already supports both community and subscription gating)
- The auth flow (useAuth, useAuthWizard, AuthCallback -- already fixed)
- The database schema (no changes needed)
- Admin CRM (admins have full access, no gating)

