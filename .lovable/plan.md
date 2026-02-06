
# Phase E: Visual/Animation Math.random() Cleanup

## Overview
This phase eliminates Math.random() from data-displaying components per the **Live Data First** doctrine, replacing simulated values with real database queries. Purely decorative/visual animations (particle effects, waveforms) will be retained as acceptable cosmetic randomness.

## Scope Analysis

### Found: 114 files with Math.random() usage (789+ occurrences)

**Categorized into 3 tiers:**

---

## Tier 1: Data Simulation → Live Query (Priority)

These components display fake statistics that should come from real database queries:

| Component | Current Behavior | Fix |
|-----------|------------------|-----|
| `useCollaborationStatus.tsx` | Random activeUsers, onlineEngineers, activeSessions | Query `profiles.last_active_at` and `collaboration_sessions.status` |
| `OnlineNowCounter.tsx` | Simulated ~127 users fluctuating randomly | Query `profiles WHERE last_active_at >= NOW() - 15min` |
| `CommunityLeaderboard.tsx` | `change` and `streak` are Math.random() | Wire to `user_streaks` table (exists) |
| `EnhancedLeaderboard.tsx` | `rankChange` is random | Compute from historical rank snapshots or remove |
| `StudioHub.tsx` | "This Week" collaborations is random | Query `collaboration_sessions` created in last 7 days |
| `AIActivityFeed.tsx` | Generates fake AI activity logs | Query `activity_feed` table for real platform events |
| `useLiveActivity.tsx` (hook) | Interval generates fake user activity | Use realtime subscription on `activity_feed` |

---

## Tier 2: Simulation Fallback → Audio State (Medium)

These hooks simulate audio data when no real audio is playing:

| Hook | Current Behavior | Fix |
|------|------------------|-----|
| `useAudioReactivity.tsx` | `isPlaying: Math.random() > 0.2` | Return static idle state when not connected to audio |
| `useAudioVisualization.tsx` | Random bars every 100ms | Return flat bars when `isPlaying: false` |

---

## Tier 3: Cosmetic Randomness (Keep As-Is)

These are acceptable for visual polish and do not represent data:

- `ParticleStorm.tsx` - particle positions/sizes
- `PlazaAmbience.tsx` - ambient floating particles  
- `WaveformVisualizer.tsx` - waveform generation
- `AudioWaveformBg.tsx` - decorative bars
- `ConnectionWeb.tsx` - network node positions
- `LogoAnimations.tsx` - beat-reactive particles
- `SpatialBackground.tsx` - 3D particle cloud
- `RolePortals.tsx` - portal particle effects
- ID generators (`useVersionHistory`, `useAudioImport`) - UUIDs

---

## Implementation Plan

### Step 1: Create/Enhance `useOnlineUsers` Hook
```text
Query: profiles WHERE last_active_at >= NOW() - INTERVAL '15 minutes'
Returns: { count, isLoading }
```
Wire to: `OnlineNowCounter`, `useCollaborationStatus`

### Step 2: Update `useCollaborationStatus` 
Replace random simulation with:
- `activeUsers` → useOnlineUsers count
- `activeSessions` → COUNT from `collaboration_sessions WHERE status = 'active'`
- `onlineEngineers` → COUNT from `profiles WHERE role = 'engineer' AND last_active_at recent`

### Step 3: Wire Streak Data to `user_streaks` Table
In `CommunityLeaderboard.tsx`:
- Join query to `user_streaks` table
- Use `current_count` for streak display
- Remove `Math.floor(Math.random() * 14) + 1`

### Step 4: Wire Week Stats in `StudioHub.tsx`
Replace `Math.floor(Math.random() * 50) + 20` with:
```text
COUNT(*) FROM collaboration_sessions 
WHERE created_at >= NOW() - INTERVAL '7 days'
```

### Step 5: Update `AIActivityFeed.tsx`
Replace `generateRealtimeLog()` with:
- Query last 5 from `activity_feed` WHERE `activity_type` IN ('analysis', 'sync', 'match', 'process')
- Use realtime subscription for live updates

### Step 6: Fix `useLiveActivity.tsx` (duplicate file issue)
There are two versions:
- `src/hooks/useLiveActivity.ts` - wired to `activity_feed` (correct)
- `src/hooks/useLiveActivity.tsx` - uses Math.random() interval (incorrect)

Consolidate to single `.ts` version, delete `.tsx` duplicate.

### Step 7: Audio Hooks Idle State
Update `useAudioReactivity` to return stable idle state:
```typescript
// When no audio callback provided
setAudioState({
  isPlaying: false,
  amplitude: 0,
  frequency: 440,
  beats: Array(8).fill(20) // Flat bars
});
```

---

## Database Tables Available

| Table | Key Columns | Usage |
|-------|-------------|-------|
| `profiles` | `last_active_at`, `points`, `level` | Online counts, XP |
| `user_streaks` | `user_id`, `current_count`, `streak_type` | Streak data |
| `collaboration_sessions` | `status`, `created_at` | Active/weekly sessions |
| `activity_feed` | `activity_type`, `is_public` | Real platform activity |

---

## Files to Modify

1. **Create**: `src/hooks/useOnlineUsers.ts` (new)
2. **Modify**: `src/hooks/useCollaborationStatus.tsx`
3. **Modify**: `src/components/community/OnlineNowCounter.tsx`
4. **Modify**: `src/components/crm/community/CommunityLeaderboard.tsx`
5. **Modify**: `src/components/gamification/EnhancedLeaderboard.tsx`
6. **Modify**: `src/components/studio/StudioHub.tsx`
7. **Modify**: `src/components/dashboard/AIActivityFeed.tsx`
8. **Delete**: `src/hooks/useLiveActivity.tsx` (keep `.ts` version)
9. **Modify**: `src/hooks/useAudioReactivity.tsx`
10. **Modify**: `src/hooks/useAudioVisualization.tsx`

---

## Technical Notes

**Realtime Subscriptions**
For `OnlineNowCounter` and `AIActivityFeed`, consider adding:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE activity_feed;
```

**Graceful Fallbacks**
All queries will include fallback to 0/empty when data unavailable, maintaining UI stability during cold-start conditions.

---

## Estimated Changes
- **10 files** modified
- **1 file** deleted  
- **1 hook** created
- **~50** Math.random() instances eliminated from data paths

