

# Phase 3: Unlockable System Completion & Polish

## Current State Assessment

**Phase 1 (Database Extension) - Complete:**
- Producer and Fan unlockables seeded in database (5 each)
- `useUnlockables.tsx` extended with all 5 unlock types
- `usePersonalUnlockables(role)` hook for individual progress
- `PersonalUnlocksWidget.tsx` created and integrated

**Phase 2 (Core Infrastructure) - Complete:**
- `useUnlockCelebration.tsx` - Detects new unlocks, manages seen state
- `UnlockCelebrationProvider.tsx` - App-level celebration with confetti
- `UnlockPulseIndicator.tsx` - Header progress indicator
- `CommunityUnlocksWidget.tsx` - Dashboard community progress widget
- `VaultRoom.tsx` - ClubScene unlock showcase room
- `StageDoor.tsx` - Dynamic unlock-aware CTA
- Integrated into `App.tsx` and `Navigation.tsx`
- Producer and Fan dashboards have `PersonalUnlocksWidget`

**Still Remaining:**

| Item | Status | Priority |
|------|--------|----------|
| Wire `ComingSoon.tsx` to live data | Not done | High |
| Add `CommunityUnlocksWidget` to all CRM dashboards | Partial | High |
| Create `UnlockAttributionToast` | Not done | Medium |
| Create `useUnlockContribution` hook | Not done | Medium |
| Realtime subscription for unlockables | Not done | Low |
| Artist/Engineer personal unlock widgets | Missing | Medium |

---

## Phase 3 Implementation Plan

### 3A: Wire ComingSoon.tsx to Live Data

The `ComingSoon.tsx` page currently uses hardcoded data:
- `currentUsers = 42` (line 103)
- `featureData` array with hardcoded milestones/targets

**Changes:**
1. Replace hardcoded `currentUsers` with live platform stats from `useUnlockables()`
2. Replace `featureData` array with database unlockables grouped by tier
3. Add the existing `CommunityMilestoneTracker` component for rich display
4. Show real progress toward each community milestone

```text
Before: currentUsers = 42
After:  const { platformStats } = useUnlockables();
        const currentUsers = platformStats.users;
```

### 3B: Add CommunityUnlocksWidget to All CRM Dashboards

Currently only Producer (`ProducerDashboardHub`) and Fan (`FanMissionsHub`) have unlock widgets integrated.

**Add to:**
1. `EnhancedDashboardHub.tsx` - Used by both Artist and Engineer via `DashboardHub`
2. Consider adding personal unlocks for artist/engineer types as well

**Integration approach:**
```text
// EnhancedDashboardHub.tsx
import { CommunityUnlocksWidget } from '@/components/unlock/CommunityUnlocksWidget';
import { PersonalUnlocksWidget } from '@/components/unlock/PersonalUnlocksWidget';
import { usePersonalUnlockables } from '@/hooks/useUnlockables';

// In component:
const { data: personalUnlockables } = usePersonalUnlockables(userType);

// In render (after AI Insights section):
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <CommunityUnlocksWidget />
  <PersonalUnlocksWidget 
    unlockables={personalUnlockables?.unlockables || []}
    title={userType === 'artist' ? 'Session Journey' : 'Project Progress'}
    description="Your personal milestones"
  />
</div>
```

### 3C: Create UnlockAttributionToast System

When a user completes an action that contributes to community progress, show a toast linking their action to collective progress.

**New files:**
- `src/components/unlock/UnlockAttributionToast.tsx`
- `src/hooks/useUnlockContribution.tsx`

**Usage scenarios:**
- Artist completes a session: "Your session moved us 0.3% closer to Century Club!"
- Engineer delivers a project: "Great work! The community is 2 members from unlocking Marketplace."
- Producer uploads a beat: "First upload complete! You're building the catalog."
- Fan earns a Day 1 badge: "You're among the first! 12 more Day 1s to unlock Curator Mode."

**Hook logic:**
```text
useUnlockContribution(metricType: string)
  - Takes the metric that just changed
  - Fetches relevant milestone for that metric
  - Returns attribution message + progress delta
  - Can be called after actions like:
    - Session completion
    - Project delivery
    - Beat upload
    - Day 1 badge earned
```

**Toast component:**
```text
UnlockAttributionToast
  - Subtle toast variant (not intrusive)
  - Shows: action completed + impact on nearest milestone
  - Optional link to full unlock dashboard
  - Auto-dismiss after 4 seconds
```

### 3D: Add Personal Unlocks to Artist/Engineer Dashboards

Artists and Engineers also have unlock types in the database (`artist` and `engineer`). We should show their personal progress alongside community progress.

**For Artists:**
- Metric: `sessions_completed`
- Tiers: First Session, 5 Sessions, 10 Sessions, etc.

**For Engineers:**
- Metric: `projects_delivered`
- Tiers: First Project, 10 Projects, 50 Projects, etc.

These already exist in the database schema but need UI integration in `EnhancedDashboardHub`.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/ComingSoon.tsx` | Replace hardcoded data with live `useUnlockables()` query |
| `src/components/crm/dashboard/EnhancedDashboardHub.tsx` | Add CommunityUnlocksWidget + PersonalUnlocksWidget |

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/unlock/UnlockAttributionToast.tsx` | Post-action attribution toast |
| `src/hooks/useUnlockContribution.tsx` | Calculate contribution to milestones |

---

## Technical Details

### ComingSoon.tsx Transformation

```text
Current structure:
- Hardcoded featureData array (5 tiers)
- Hardcoded currentUsers = 42
- Progress calculated against hardcoded milestone numbers

New structure:
- Fetch community unlockables via useCommunityMilestones()
- Group by tier for display
- Show real user count from platformStats
- Use CommunityMilestoneTracker for grid display
- Add dynamic "next unlock" calculation
```

### Attribution Toast Logic

```text
After session completion:
1. Identify relevant metric: 'sessions_completed' or 'total_users'
2. Fetch milestone that tracks this metric
3. Calculate: "X more until [Milestone Name]"
4. If progress > 80%: Add urgency messaging
5. Show toast with contribution message

Example messages:
- "Session complete! 47 more sessions until we unlock Pro Matching."
- "You're on fire! The community is 3 members away from Marketplace."
- "Your 5th session! Personal milestone unlocked: Repeat Collaborator Badge."
```

### Dashboard Integration Layout

```text
EnhancedDashboardHub sections:
1. Welcome Experience (new users)
2. Header
3. Who's Live + Gamification + Social (grid)
4. Hip-Hop Pulse
5. Career Momentum
6. Revenue Analytics
7. **NEW: Unlock Progress Section** <-- Add here
   - CommunityUnlocksWidget (left)
   - PersonalUnlocksWidget (right)
8. AI Insights
9. Recent Activity
```

---

## Summary

Phase 3 completes the unlockable system by:

1. **Live Data Everywhere**: ComingSoon page uses real database values
2. **Universal Dashboard Integration**: All CRM dashboards show unlock progress
3. **Action Attribution**: Users see how their actions contribute to collective goals
4. **Complete Role Coverage**: Artist and Engineer personal unlocks displayed

This creates the full "your work matters to everyone" narrative loop:
- User takes action (session, project, upload)
- Toast shows immediate contribution
- Dashboard shows personal + community progress
- ComingSoon page reflects real platform state
- Celebration triggers when milestones are reached

