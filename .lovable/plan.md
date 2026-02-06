

# Unlockable System Elevation: Phase 2

## Current State Assessment

Based on exploration of the codebase:

**Already Built:**
- `PersonalUnlocksWidget.tsx` - Reusable widget showing role-specific progress (just created)
- `UnlockAnnouncement.tsx` - Full-screen celebration modal (exists but not triggered)
- `CommunityMilestoneTracker.tsx` - Grid display of community milestones (exists but not used)
- `useUnlockables.tsx` - Complete hook with all 5 unlock types (community, artist, engineer, producer, fan)
- `prime-generate-unlockables` edge function - Live progress calculation
- Producer/Fan unlockables seeded in database

**Not Yet Built:**
- `UnlockPulseIndicator` - Persistent header indicator showing next milestone
- `VaultRoom` - ClubScene room showcasing the unlock system
- `CommunityUnlocksWidget` - Platform-wide progress for CRM dashboards
- `useUnlockCelebration` hook - Detect and trigger celebrations
- Live data wiring for `ComingSoon.tsx` (still uses `currentUsers = 42`)
- StageDoor dynamic CTA based on unlock progress
- FeatureGated integration with unlock progress display

---

## Implementation Plan

### Phase 2A: Core Infrastructure

**1. Create `useUnlockCelebration` Hook**

Detects newly unlocked milestones since last visit and triggers celebration:

```text
src/hooks/useUnlockCelebration.tsx

Logic:
- On mount, fetch all unlocked milestones
- Compare with localStorage 'seen_unlocks' array
- If new unlock found, return it for celebration trigger
- After celebration, update localStorage
- Supports both community and personal unlocks
```

**2. Create `UnlockPulseIndicator` Component**

Persistent header indicator showing community progress:

```text
src/components/unlock/UnlockPulseIndicator.tsx

Features:
- Compact pill showing next milestone name + progress %
- Pulses/glows when progress > 80%
- Clicking opens a popover with full milestone details
- Uses useCommunityMilestones() hook
- Mobile: Icon-only mode with badge
```

**3. Create `CommunityUnlocksWidget` Component**

Platform-wide progress display for dashboards:

```text
src/components/unlock/CommunityUnlocksWidget.tsx

Features:
- Shows next community milestone with large progress bar
- List of recent unlocks (last 3)
- "X of Y unlocked" summary
- Call to action: "Invite friends to unlock faster"
```

---

### Phase 2B: Entry Experience Integration

**4. Create `VaultRoom` for ClubScene**

New room between ControlRoom and VIPBooth:

```text
src/components/home/rooms/VaultRoom.tsx

Content:
- "The Vault" header with lock/unlock animation
- Visual timeline of unlock tiers (1-5)
- Current community progress prominently displayed
- "Features you'll unlock together" preview
- Uses live data from useUnlockables()
```

**5. Update ClubScene Room Order**

```text
src/components/home/ClubScene.tsx

Changes:
- Add 'vault' to ROOM_IDS array
- Import and render VaultRoom
- Update room order: listening → green → control → vault → vip → stage
```

**6. Update StageDoor with Dynamic CTA**

```text
src/components/home/rooms/StageDoor.tsx

Changes:
- Fetch next community milestone
- Replace "Join the Club" with "Join and help unlock [Milestone Name]"
- Show progress bar: "X more members needed"
- Add urgency when close to milestone (>80%)
```

---

### Phase 2C: Authenticated Experience

**7. Add UnlockPulseIndicator to Navigation**

```text
src/components/Navigation.tsx

Changes:
- Import UnlockPulseIndicator
- Add next to NotificationCenter for logged-in users
- Show for all authenticated users
```

**8. Wire CommunityUnlocksWidget to CRM Dashboards**

Add community progress section to all role dashboards:

```text
Files to modify:
- src/components/crm/artist/ArtistDashboardHub.tsx
- src/components/crm/engineer/EngineerDashboardHub.tsx
- src/components/crm/producer/ProducerDashboardHub.tsx
- src/pages/FanHub.tsx

Each gets:
- CommunityUnlocksWidget showing platform progress
- Existing PersonalUnlocksWidget (already added for producer/fan)
```

---

### Phase 2D: Celebration System

**9. Create Celebration Trigger in App**

```text
src/components/unlock/UnlockCelebrationProvider.tsx

Features:
- Wraps app, checks for new unlocks on mount
- If new unlock detected, renders UnlockAnnouncement modal
- Uses useUnlockCelebration() hook
- After dismiss, marks as seen
```

**10. Integrate Celebration Provider in App.tsx**

```text
src/App.tsx

Changes:
- Import UnlockCelebrationProvider
- Wrap main app content (inside AuthProvider, QueryClientProvider)
```

---

### Phase 2E: Live Data & Polish

**11. Wire ComingSoon.tsx to Live Data**

```text
src/pages/ComingSoon.tsx

Changes:
- Replace hardcoded currentUsers = 42 with useUnlockables()
- Pull tier data from database instead of hardcoded featureData
- Show real progress toward each tier
- Add CommunityMilestoneTracker component
```

**12. Update FeatureGated to Show Unlock Progress**

```text
src/components/backend/FeatureGated.tsx

Changes:
- Add optional communityGated prop
- If communityGated, check unlock status instead of subscription
- Show progress toward unlock instead of "Upgrade Now"
- Display: "This feature unlocks at X members. We're at Y."
```

---

## New Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/useUnlockCelebration.tsx` | Detect new unlocks, manage seen state |
| `src/components/unlock/UnlockPulseIndicator.tsx` | Header progress indicator |
| `src/components/unlock/CommunityUnlocksWidget.tsx` | Dashboard community progress |
| `src/components/home/rooms/VaultRoom.tsx` | ClubScene unlock showcase room |
| `src/components/unlock/UnlockCelebrationProvider.tsx` | App-level celebration trigger |

## Files to Modify

| File | Change |
|------|--------|
| `src/components/home/ClubScene.tsx` | Add VaultRoom to room sequence |
| `src/components/home/rooms/StageDoor.tsx` | Dynamic unlock-aware CTA |
| `src/components/Navigation.tsx` | Add UnlockPulseIndicator |
| `src/pages/ComingSoon.tsx` | Wire to live data |
| `src/components/backend/FeatureGated.tsx` | Add community unlock support |
| `src/App.tsx` | Add UnlockCelebrationProvider |
| CRM Dashboard files (4) | Add CommunityUnlocksWidget |

---

## Technical Details

### useUnlockCelebration Logic

```text
1. On mount, fetch all unlockables with is_unlocked = true
2. Get 'mixx_seen_unlocks' from localStorage (array of IDs)
3. Find unlocks not in seen array
4. Return { newUnlock, markAsSeen }
5. markAsSeen() adds ID to localStorage array
```

### UnlockPulseIndicator States

```text
- Default: "Next: [Name] (X%)" with subtle glow
- Near (>80%): Pulsing glow, "Almost there!" text
- Just unlocked (within 24h): "New unlock!" celebration state
```

### VaultRoom Visual Structure

```text
┌─────────────────────────────────────────────────────┐
│                     THE VAULT                       │
│            "Unlocked by the community"              │
│                                                     │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  │
│  │ T1 ✓ │──│ T2 ✓ │──│ T3   │──│ T4   │──│ T5   │  │
│  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘  │
│                         ▲                           │
│                    [You are here]                   │
│                                                     │
│           ┌───────────────────────────┐            │
│           │  Next Unlock: Marketplace │            │
│           │  ████████████░░░ 78%     │            │
│           │  56 more members needed  │            │
│           └───────────────────────────┘            │
│                                                     │
│  "Every signup brings us closer. Every session     │
│   counts. This isn't our platform. It's ours."    │
└─────────────────────────────────────────────────────┘
```

---

## Summary

This phase transforms the unlock system from a hidden database feature into the **central narrative** of MixxClub:

1. **Pre-auth visibility**: VaultRoom in ClubScene, dynamic StageDoor CTA
2. **Persistent awareness**: UnlockPulseIndicator in navigation
3. **Dashboard integration**: Both personal and community progress visible
4. **Celebration moments**: Full-screen announcements when milestones hit
5. **Live data everywhere**: No more hardcoded user counts

The dual narrative of "your progress" + "our progress" creates both personal investment and community belonging.

