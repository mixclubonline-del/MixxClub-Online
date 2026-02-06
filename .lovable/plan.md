
# Phase 4: Unlockable System - ✅ COMPLETE

## Current State (The Raw Tracks)

The unlock system has all major components built:

| Component | Status |
|-----------|--------|
| Database schema + 15 unlockables (5 community, 5 producer, 5 fan) | Done |
| `useUnlockables` hook with all 5 types | Done |
| `usePersonalUnlockables` for producer/fan | Done |
| `PersonalUnlocksWidget` + `CommunityUnlocksWidget` | Done |
| `useUnlockCelebration` + `UnlockCelebrationProvider` | Done |
| `UnlockPulseIndicator` in navigation | Done |
| `VaultRoom` in ClubScene | Done |
| `StageDoor` dynamic CTA | Done |
| `ComingSoon.tsx` wired to live data | Done |
| `useUnlockContribution` hook | Done |
| `UnlockAttributionToast` utilities | Done |
| Artist/Engineer dashboard integration | Done |

**What's Missing (The Unmixed Elements):**

1. Attribution toasts NOT wired to actual action completion points
2. No realtime subscriptions for live unlock updates
3. Artist/Engineer unlockables not seeded in database
4. `FeatureGated` component not using community unlock logic
5. No trigger for "user joined" attribution

---

## Mastering Plan

### Track 1: Wire Attribution Toasts to Action Points

When these actions complete, show the contribution toast:

| Action | File | Integration Point |
|--------|------|-------------------|
| Project completed | `MixReviewInterface.tsx` | After `status: 'completed'` update |
| Beat uploaded | `useProducerBeats.ts` | In `createBeatMutation.onSuccess` |
| Session completed | `SessionManagement.tsx` (if exists) | After session status change |
| User signup | `Auth.tsx` or welcome flow | Post-signup celebration |

**Implementation:**

```text
// Example for beat upload in useProducerBeats.ts
import { useUnlockContribution } from './useUnlockContribution';
import { attributionToasts } from '@/components/unlock/UnlockAttributionToast';

onSuccess: () => {
  const { getContributionMessage } = useUnlockContribution();
  const contribution = getContributionMessage('beats_uploaded', 'Beat');
  attributionToasts.beatUploaded(contribution);
  // ...existing success logic
}
```

### Track 2: Seed Artist & Engineer Unlockables

Currently only community, producer, and fan unlockables exist. Add 5 for each:

**Artist Unlockables:**
| Tier | Name | Metric | Target | Reward |
|------|------|--------|--------|--------|
| 1 | First Session | sessions_completed | 1 | Session Starter Badge |
| 2 | Active Creator | sessions_completed | 5 | Priority Matching |
| 3 | Session Pro | sessions_completed | 10 | Featured Artist Status |
| 4 | Studio Regular | sessions_completed | 25 | Discounted Rates |
| 5 | Elite Artist | sessions_completed | 50 | VIP Support Access |

**Engineer Unlockables:**
| Tier | Name | Metric | Target | Reward |
|------|------|--------|--------|--------|
| 1 | First Delivery | projects_delivered | 1 | Engineer Badge |
| 2 | Building Rep | projects_delivered | 5 | Profile Boost |
| 3 | Trusted Pro | projects_delivered | 10 | Top Results Placement |
| 4 | Studio Veteran | projects_delivered | 25 | Reduced Platform Fee |
| 5 | Master Engineer | projects_delivered | 50 | Partnership Tier |

### Track 3: Add Realtime Subscription for Unlocks

When the database `unlockables.is_unlocked` changes, trigger celebration immediately (not just on page load):

```text
// In UnlockCelebrationProvider or useUnlockCelebration
useEffect(() => {
  const channel = supabase
    .channel('unlockables-realtime')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'unlockables',
      filter: 'is_unlocked=eq.true'
    }, (payload) => {
      // New unlock detected - trigger celebration
      const newUnlock = payload.new;
      setNewUnlock(transformPayload(newUnlock));
    })
    .subscribe();
    
  return () => channel.unsubscribe();
}, []);
```

**Database requirement:** Enable realtime on `unlockables` table:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.unlockables;
```

### Track 4: FeatureGated Community Unlock Integration

The `FeatureGated` component should optionally check unlock status:

```text
// Already has communityGated and communityMilestoneKey props
// Wire to actual milestone check:

if (communityGated && communityMilestoneKey) {
  const milestone = milestones.find(m => m.metric_type === communityMilestoneKey);
  if (milestone && !milestone.is_unlocked) {
    return <UnlockProgressFallback milestone={milestone} />;
  }
}
```

### Track 5: Welcome Flow Attribution

Show new users how their signup contributes:

```text
// In AuthCallback.tsx or post-signup flow
const { getContributionMessage } = useUnlockContribution();
const contribution = getContributionMessage('user_count', 'Your signup');
attributionToasts.userJoined(contribution);
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/hooks/useProducerBeats.ts` | Wire attribution toast on beat create |
| `src/components/artist/MixReviewInterface.tsx` | Wire attribution toast on project complete |
| `src/hooks/useUnlockCelebration.tsx` | Add realtime subscription |
| `src/components/backend/FeatureGated.tsx` | Wire communityGated to actual milestone check |
| `src/pages/AuthCallback.tsx` | Show welcome attribution toast |

## Database Changes

1. Insert 10 new unlockables (5 artist, 5 engineer)
2. Enable realtime on `unlockables` table

---

## Final Mix Summary

This "mastering pass" completes the unlock system by:

1. **Attribution Loop Complete**: Every major action shows its community impact
2. **Full 5-Path Coverage**: All roles have personal milestones
3. **Realtime Celebration**: Unlocks trigger immediately, not on refresh
4. **Feature Gating Wired**: Locked features show progress toward unlock
5. **Welcome Experience**: New signups see their immediate contribution

The "you vs. we" dual narrative is now fully operational across the platform.
