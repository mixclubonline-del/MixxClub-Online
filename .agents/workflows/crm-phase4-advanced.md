---
description: CRM Phase 4 - Advanced features (Producer Licensing Engine, query deduplication, lazy loading) for depth and performance
---

# Phase 4: Advanced Features & Performance

## Context

This phase adds depth features promised on landing pages and optimizes CRM performance:

- **Producer Licensing Engine**: ProducerCatalogHub promises "Smart Pricing", "6 License Types", "Promo Codes", "Featured Rotation" but has basic catalog only
- **Query Deduplication**: Multiple hubs query the same Supabase tables independently (projects, earnings, achievements)
- **Lazy Loading**: Each CRM page eagerly imports all hub components (ArtistCRM has 60+ imports)

## Prerequisites

- Workspace: `/Volumes/ALL SESSIONS AND AUDIO/mixxclub/MixxClub-Online`
- Phases 1-3 ideally completed for design consistency
- Supabase tables: `marketplace_items`, `marketplace_purchases`, `projects`, `achievements`, `engineer_earnings`

## Steps

### 1. Create shared query hooks

Create `src/hooks/useUserProjects.ts`:

```ts
// Single cached source for all project data
export function useUserProjects(userId: string, role: 'artist' | 'engineer' | 'producer') {
  return useQuery({
    queryKey: ['user-projects', userId, role],
    queryFn: async () => {
      const field = role === 'engineer' ? 'engineer_id' : 'client_id';
      const { data } = await supabase.from('projects').select('*').eq(field, userId);
      return data || [];
    },
    staleTime: 60000,
  });
}
```

Create `src/hooks/useUserEarnings.ts`:

```ts
// Single cached source for all earnings data
export function useUserEarnings(userId: string) {
  return useQuery({
    queryKey: ['user-earnings', userId],
    queryFn: async () => {
      const [{ data: earnings }, { data: sales }] = await Promise.all([
        supabase.from('engineer_earnings').select('*').eq('engineer_id', userId),
        supabase.from('marketplace_purchases').select('*').eq('seller_id', userId),
      ]);
      return { earnings: earnings || [], sales: sales || [] };
    },
    staleTime: 60000,
  });
}
```

### 2. Migrate hubs to shared hooks

Replace direct Supabase queries in these files with the shared hooks:

- `src/components/crm/dashboard/EnhancedDashboardHub.tsx` — replace inline `fetchDashboardData()` project/earnings queries
- `src/components/crm/GrowthHub.tsx` — replace inline project/earnings queries
- `src/components/crm/ActiveWorkHub.tsx` — use `useUserProjects`
- `src/components/crm/community/CommunityChallenges.tsx` — use `useUserProjects`

Ensure `queryKey` matches so React Query caches are shared.

### 3. Build Producer License Builder

Create `src/components/crm/producer/LicenseBuilder.tsx`:

- 6 license tiers: MP3 Lease, WAV Lease, Trackout, Unlimited, Exclusive, Custom
- Each tier shows: price input, usage terms (streams/downloads/videos), contract template
- Toggle per tier: enabled/disabled
- Bulk deal configuration: "Buy 3 get 1 free" style
- Save to `marketplace_items` metadata field

### 4. Build Promo Code Manager

Create `src/components/crm/producer/PromoCodeManager.tsx`:

- Create/manage promo codes with: code string, discount %, expiry date, usage limit
- Store in `marketplace_items` or a new `promo_codes` table
- Display active promo codes with usage stats
- Copy-to-clipboard for code sharing

### 5. Build Featured Beat Rotation

Create `src/components/crm/producer/FeaturedRotation.tsx`:

- Query `marketplace_items` for user's beats
- Drag-to-reorder featured beats (top 5 shown on profile)
- Toggle "featured" status per beat
- Preview each beat in a mini audio player

### 6. Integrate into ProducerCatalogHub

File: `src/components/crm/producer/ProducerCatalogHub.tsx`

- Add sub-tabs for: Catalog, Licenses, Promos, Featured
- Wire new components into their respective tabs

### 7. Lazy load hub components

Files: `src/pages/ArtistCRM.tsx`, `src/pages/EngineerCRM.tsx`, `src/pages/ProducerCRM.tsx`

- Replace static imports with `React.lazy()`:

  ```tsx
  const MusicHub = lazy(() => import('@/components/crm/MusicHub'));
  const StoreHub = lazy(() => import('@/components/crm/StoreHub'));
  const GrowthHub = lazy(() => import('@/components/crm/GrowthHub'));
  // etc.
  ```

- Wrap the tab content switch in `<Suspense fallback={<HubSkeleton variant="cards" count={6} />}>`:

  ```tsx
  <Suspense fallback={<HubSkeleton variant="cards" count={6} />}>
    {renderTabContent()}
  </Suspense>
  ```

- Only the DashboardHub (always shown first) should remain eagerly imported

### 8. Verify

// turbo

```bash
cd "/Volumes/ALL SESSIONS AND AUDIO/mixxclub/MixxClub-Online" && npx tsc --noEmit
```

### 9. Performance check

// turbo

```bash
cd "/Volumes/ALL SESSIONS AND AUDIO/mixxclub/MixxClub-Online" && npx vite build 2>&1 | tail -20
```

Check that chunk sizes are smaller after lazy loading.

### 10. Browser test

- Test `/producer-crm?tab=catalog` and navigate to Licenses, Promos, Featured sub-tabs
- Verify lazy-loaded hubs show skeleton fallback briefly before loading
- Verify no duplicate network requests for projects/earnings in dev tools

## Success Criteria

- [ ] 2 shared query hooks created and adopted by 4+ hubs
- [ ] License Builder, Promo Code Manager, Featured Rotation built for Producer CRM
- [ ] All 3 CRM pages use React.lazy() for non-dashboard hubs
- [ ] Reduced bundle size per CRM page
- [ ] Zero TypeScript errors
