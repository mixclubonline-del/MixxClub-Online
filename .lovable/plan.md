

# Extending the Unlockable System to Producer & Fan

## Overview

The current unlockable system supports three types: `community`, `artist`, and `engineer`. We need to add `producer` and `fan` types to create personalized progression paths for all four roles in the MixxClub ecosystem.

This creates the full unlockable matrix:
- **Community**: Platform-wide milestones (everyone benefits)
- **Artist**: Session-based progression  
- **Engineer**: Project delivery progression
- **Producer**: Beat catalog & sales progression (new)
- **Fan**: Engagement & support progression (new)

---

## Producer Unlockables - The Beat Empire Path

Producers progress by building their catalog and generating sales:

| Tier | Name | Metric | Target | Reward |
|------|------|--------|--------|--------|
| 1 | First Upload | beats_uploaded | 1 | Profile Featured Badge |
| 2 | Catalog Started | beats_uploaded | 5 | Beat Preview Player |
| 3 | First Sale | beats_sold | 1 | Sales Analytics Dashboard |
| 4 | Building Momentum | beats_sold | 10 | Premium Licensing Templates |
| 5 | Empire Status | beats_sold | 50 | Label Partnership Access |

**Metrics sourced from:**
- `producer_beats` table (COUNT for beats_uploaded)
- `beat_purchases` table WHERE status='completed' (COUNT for beats_sold)
- `producer_stats.total_revenue_cents` (for revenue milestones)

---

## Fan Unlockables - The Supporter Path

Fans progress through engagement and early artist support:

| Tier | Name | Metric | Target | Reward |
|------|------|--------|--------|--------|
| 1 | First Day 1 | day1_badges | 1 | Day 1 Collector Badge |
| 2 | Streak Starter | engagement_streak | 7 | 2x MixxCoinz Multiplier |
| 3 | Super Supporter | artists_supported | 10 | Early Access to Premieres |
| 4 | Streak Master | longest_streak | 30 | Curator Mode Unlocked |
| 5 | Legend Status | mixxcoinz_earned | 10000 | VIP Community Access |

**Metrics sourced from:**
- `fan_stats` table columns: `day1_badges`, `engagement_streak`, `artists_supported`, `longest_streak`, `mixxcoinz_earned`
- `artist_day1s` table (COUNT for day1_badges if not in fan_stats)

---

## Technical Implementation

### Step 1: Database - Add Unlockable Records

Insert 5 producer and 5 fan unlockables into the `unlockables` table.

```text
INSERT INTO unlockables (
  unlock_type, name, description, icon_name, 
  metric_type, target_value, tier, reward_description,
  created_by, ai_reasoning
)
VALUES
  -- Producer unlockables
  ('producer', 'First Upload', 'Upload your first beat', 'upload', 
   'beats_uploaded', 1, 1, 'Profile Featured Badge',
   'prime_ai', 'Every empire starts with a single beat.'),
  
  ('producer', 'Catalog Started', 'Build a catalog of 5 beats', 'disc-3',
   'beats_uploaded', 5, 2, 'Beat Preview Player',
   'prime_ai', 'Five beats means you have options to offer.'),
  
  -- ... (5 producer, 5 fan records)
```

### Step 2: Update TypeScript Types

Extend the `Unlockable` interface:

```typescript
// src/hooks/useUnlockables.tsx
export interface Unlockable {
  id: string;
  unlock_type: 'community' | 'artist' | 'engineer' | 'producer' | 'fan';
  // ... rest unchanged
}

export interface UnlockablesData {
  community: Unlockable[];
  artist: Unlockable[];
  engineer: Unlockable[];
  producer: Unlockable[];  // NEW
  fan: Unlockable[];       // NEW
  platformStats: { ... };
}
```

### Step 3: Update Hook - Add Producer/Fan Stats

Extend `fetchUnlockablesWithProgress` to query producer and fan metrics:

```typescript
// Add to Promise.all queries
const [
  profilesResult, 
  sessionsResult, 
  projectsResult,
  producerBeatsResult,   // NEW
  beatPurchasesResult,   // NEW
  fanStatsResult,        // NEW
  unlockablesResult
] = await Promise.all([
  supabase.from('profiles').select('id', { count: 'exact', head: true }),
  supabase.from('collaboration_sessions').select('id', { count: 'exact', head: true }),
  supabase.from('projects').select('id', { count: 'exact', head: true }),
  supabase.from('producer_beats').select('id', { count: 'exact', head: true }),
  supabase.from('beat_purchases').select('id', { count: 'exact', head: true })
    .eq('status', 'completed'),
  supabase.from('fan_stats').select('*'), // For aggregate metrics
  supabase.from('unlockables').select('*').order('tier', { ascending: true }),
]);

// Extend metric_type switch
case 'beats_uploaded':
  currentValue = producerBeatsResult.count || 0;
  break;
case 'beats_sold':
  currentValue = beatPurchasesResult.count || 0;
  break;
case 'day1_badges':
  currentValue = aggregateFanStat(fanStatsResult.data, 'day1_badges');
  break;
// ... etc
```

### Step 4: Add Role-Specific Hooks

```typescript
// Already exists pattern - add producer/fan
export function useProducerUnlockables() {
  const { data, ...rest } = useUnlockables();
  return {
    data: data?.producer || [],
    ...rest,
  };
}

export function useFanUnlockables() {
  const { data, ...rest } = useUnlockables();
  return {
    data: data?.fan || [],
    ...rest,
  };
}
```

### Step 5: Update Edge Function

Extend `prime-generate-unlockables/index.ts` with producer and fan metric queries and grouping.

### Step 6: Wire to CRM Dashboards

**ProducerDashboardHub.tsx:**
```tsx
import { useProducerUnlockables } from '@/hooks/useUnlockables';

// In dashboard, add UnlocksProgressWidget
<UnlocksProgressWidget 
  unlockables={producerUnlockables} 
  title="Beat Empire Progress" 
/>
```

**FanFeedHub.tsx or FanMissionsHub.tsx:**
```tsx
import { useFanUnlockables } from '@/hooks/useUnlockables';

<UnlocksProgressWidget 
  unlockables={fanUnlockables} 
  title="Supporter Journey" 
/>
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/hooks/useUnlockables.tsx` | Add producer/fan types, hooks, and metric queries |
| `supabase/functions/prime-generate-unlockables/index.ts` | Add producer/fan metric queries and grouping |

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/unlock/PersonalUnlocksWidget.tsx` | Reusable widget for role-specific progress |

## Database Changes

Insert 10 new unlockable records (5 producer, 5 fan) with appropriate metric_types.

---

## Personal vs Platform Context

For producer and fan unlockables, we need to support **personal** progress tracking (how many beats has THIS producer uploaded) in addition to platform-wide stats:

```typescript
// For personal unlockables, pass userId
export function usePersonalUnlockables(userId: string, role: 'producer' | 'fan') {
  return useQuery({
    queryKey: ['personal-unlockables', userId, role],
    queryFn: () => fetchPersonalProgress(userId, role),
  });
}
```

This queries:
- Producer: `producer_beats WHERE user_id = ?`
- Fan: `fan_stats WHERE user_id = ?`

---

## Summary

This extension creates a 5-path unlockable system:

| Path | Who | Progression |
|------|-----|-------------|
| Community | Everyone | Platform growth |
| Artist | Artists | Sessions completed |
| Engineer | Engineers | Projects delivered |
| Producer | Producers | Beats uploaded & sold |
| Fan | Fans | Engagement & support |

Every role now has personal milestones to achieve alongside the collective community goals. The "you vs. we" dual narrative is complete.

