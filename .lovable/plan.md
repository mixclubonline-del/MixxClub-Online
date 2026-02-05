

# Fan Engagement Economy UI
## Mission Boards, Wallet Interface, Spending Destinations & Tier Progression

This plan creates a comprehensive, immersive Fan engagement economy experience that transforms passive listeners into active participants who earn, spend, and level up through the MixxClub ecosystem.

---

## Current State Analysis

### Existing Components (Already Built)
| Component | Location | Status |
|-----------|----------|--------|
| `FanMissionsHub` | `src/components/crm/fan/` | Basic shell with mock streak data |
| `FanWalletHub` | `src/components/crm/fan/` | Working - uses wallet hooks |
| `MissionsList` | `src/components/economy/` | Full implementation with tabs |
| `WalletBalance` | `src/components/economy/` | Complete with breakdown |
| `TransactionLedger` | `src/components/economy/` | Scrollable history |
| `StreakTracker` | `src/components/fan/` | Week view with multiplier badges |
| `TierProgressCard` | `src/components/fan/` | 5-tier system (Newcomer→Legend) |
| `SpendingDestinations` | `src/components/fan/` | 6 destinations (static) |
| `CoinzPurchaseModal` | `src/components/fan/` | Stripe integration ready |
| `useMissions` hook | `src/hooks/` | Full CRUD + claiming |
| `useMixxWallet` hook | `src/hooks/` | Earn/spend with dual balances |
| `useReferralSystem` hook | `src/hooks/` | Complete referral tracking |
| `fan_stats` table | Database | Has streak, tier, votes, shares |

### What's Missing
| Component | Purpose |
|-----------|---------|
| `useFanStats` hook | Fetch/update fan_stats with streak logic |
| `LeaderboardWidget` | Fan weekly leaderboard |
| `ReferralMissionsCard` | Invite-focused missions |
| `BonusMissionsCard` | Limited-time/special missions |
| `TipArtistModal` | Spend coinz to tip artists |
| `PremiumAccessCard` | Unlock premium content |
| `MerchDiscountCard` | Spend coinz for merch discounts |
| `SpendingFlowModal` | Generic spending confirmation |
| `TierBenefitsModal` | Detailed tier perks breakdown |
| Real streak data | Currently hardcoded |
| Spending destination routing | Currently static cards |

---

## Architecture

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                      FAN ENGAGEMENT ECONOMY                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                        FAN HUB TABS                              │   │
│  │  [Feed] [Day 1s] [Missions] [Wallet]                            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  MISSIONS TAB                    WALLET TAB                             │
│  ┌─────────────────┐            ┌─────────────────┐                     │
│  │ StreakTracker   │            │ WalletBalance   │                     │
│  │ - Week calendar │            │ - Total/breakdown│                     │
│  │ - Multiplier    │            │ - Buy button    │                     │
│  └────────┬────────┘            └────────┬────────┘                     │
│           │                              │                              │
│           ▼                              ▼                              │
│  ┌─────────────────┐            ┌─────────────────┐                     │
│  │ MissionBoard    │            │ TierProgressCard│                     │
│  │ - Daily/Weekly  │            │ - Current tier  │                     │
│  │ - Achievements  │            │ - XP to next    │                     │
│  │ - Referrals     │            │ - Benefits      │                     │
│  └────────┬────────┘            └────────┬────────┘                     │
│           │                              │                              │
│           ▼                              ▼                              │
│  ┌─────────────────┐            ┌─────────────────┐                     │
│  │ LeaderboardWidget│           │ SpendingCenter  │                     │
│  │ - Top 5 earners │            │ - Tip Artists   │                     │
│  │ - Your rank     │            │ - Buy Merch     │                     │
│  └─────────────────┘            │ - Premium Access│                     │
│                                 │ - Power Votes   │                     │
│                                 └─────────────────┘                     │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                     SPENDING MODALS                               │   │
│  │  TipArtistModal │ MerchCheckoutModal │ PremiumUnlockModal        │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Fan Stats Hook & Streak Integration

**1.1 Create `useFanStats` Hook**

**File:** `src/hooks/useFanStats.ts`

Core functionality:
- Fetch fan_stats for current user (create if not exists)
- Track engagement_streak with daily check logic
- Update total_votes, total_comments, total_shares
- Calculate tier based on mixxcoinz_earned
- Return streak multiplier (1x, 1.5x, 2x, 3x)

**Streak Logic:**
```typescript
interface FanStats {
  id: string;
  user_id: string;
  total_votes: number;
  total_comments: number;
  total_shares: number;
  total_premieres_attended: number;
  mixxcoinz_earned: number;
  artists_supported: number;
  day1_badges: number;
  engagement_streak: number;
  current_tier: string;
}

// Check if streak is still valid (last activity < 24 hours ago)
const isStreakActive = (lastActivityAt: string) => {
  const lastActivity = new Date(lastActivityAt);
  const now = new Date();
  const hoursSinceActivity = (now - lastActivity) / (1000 * 60 * 60);
  return hoursSinceActivity < 36; // 36 hour grace period
};
```

**1.2 Update `FanMissionsHub` with Real Data**

Replace mock streak data with `useFanStats`:
- Connect StreakTracker to real `engagement_streak`
- Show longest streak from database
- Mark today as complete when any mission is claimed

---

### Phase 2: Enhanced Mission Board

**2.1 Create `ReferralMissionsCard`**

**File:** `src/components/fan/ReferralMissionsCard.tsx`

Visual card showing:
- Current referral code with copy button
- Number of friends invited / target (e.g., 0/5)
- Coinz reward per successful referral
- Bonus for milestone (5, 10, 25 friends)

Uses existing `useReferralSystem` hook.

**2.2 Create `BonusMissionsCard`**

**File:** `src/components/fan/BonusMissionsCard.tsx`

Time-limited opportunities:
- Event-based missions (e.g., "Vote in today's premiere")
- Community goals (collective target)
- Seasonal campaigns
- Countdown timer for expiring missions

**2.3 Update `FanMissionsHub` Layout**

New layout structure:
```
├── StreakTracker (connected to real data)
├── BonusMissionsCard (if any active)
├── MissionsList (existing - Daily/Weekly/Achievements)
├── ReferralMissionsCard
├── LeaderboardWidget
```

---

### Phase 3: Fan Leaderboard

**3.1 Create `useFanLeaderboard` Hook**

**File:** `src/hooks/useFanLeaderboard.ts`

Query fan_stats ordered by mixxcoinz_earned:
```typescript
interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  avatar_url: string | null;
  mixxcoinz_earned: number;
  current_tier: string;
  engagement_streak: number;
}

// Fetch top 10 + current user's rank
const fetchLeaderboard = async (period: 'weekly' | 'monthly' | 'all') => {
  // Query fan_stats with profile join
  // Calculate rank for current user
};
```

**3.2 Create `LeaderboardWidget`**

**File:** `src/components/fan/LeaderboardWidget.tsx`

Compact leaderboard showing:
- Top 5 fans this week
- Current user's rank (highlighted if in top 50)
- Tier badges next to names
- "View Full Leaderboard" button → modal or page

**Design:**
- Crown icon for #1
- Animated rank changes
- Current user always visible (if not in top 5, show as "You: #42")

---

### Phase 4: Enhanced Wallet & Spending

**4.1 Add "Buy MixxCoinz" Button to WalletBalance**

Update `WalletBalance` or `FanWalletHub` to include:
- Prominent "Buy Coinz" button
- Opens `CoinzPurchaseModal`
- Show daily limit remaining

**4.2 Create `TipArtistModal`**

**File:** `src/components/fan/TipArtistModal.tsx`

Interface for tipping artists with MixxCoinz:
- Search/select artist
- Tip amount slider (10, 25, 50, 100, custom)
- Optional message
- Uses `spendCoinz` from `useMixxWallet`
- Records transaction with artist as counterparty

**4.3 Create `PremiumUnlockModal`**

**File:** `src/components/fan/PremiumUnlockModal.tsx`

Unlock exclusive content/features:
- List of unlockable items with prices
- Preview of what's behind the unlock
- One-time purchase (permanent ownership per doctrine)
- Confirmation before spend

**4.4 Create `PowerVoteModal`**

**File:** `src/components/fan/PowerVoteModal.tsx`

Spend coinz to boost votes:
- Select premiere/battle to boost
- Vote multiplier (2x, 5x, 10x)
- Cost scales with multiplier
- Updates fan_stats.total_votes

**4.5 Update `SpendingDestinations` with Navigation**

Currently static - add actual navigation:
```typescript
const handleNavigate = (destination: string) => {
  switch (destination) {
    case 'tips':
      setTipModalOpen(true);
      break;
    case 'premium':
      setPremiumModalOpen(true);
      break;
    case 'votes':
      setPowerVoteModalOpen(true);
      break;
    case 'music':
      navigate('/beats');
      break;
    case 'merch':
      // Future: Artist merch stores
      toast.info('Artist merch stores coming soon!');
      break;
    case 'events':
      // Future: Event tickets
      toast.info('Event tickets coming soon!');
      break;
  }
};
```

---

### Phase 5: Tier Benefits & Visualization

**5.1 Create `TierBenefitsModal`**

**File:** `src/components/fan/TierBenefitsModal.tsx`

Detailed breakdown of each tier:

| Tier | Threshold | Benefits |
|------|-----------|----------|
| Newcomer | 0 | Basic access |
| Supporter | 500 | Early access to premieres, 5% merch discount |
| Advocate | 2,000 | 2x daily mission slots, exclusive badges |
| Champion | 5,000 | VIP support, 15% merch discount, premiere voting weight 2x |
| Legend | 10,000 | Direct artist messaging, exclusive drops, 25% merch discount |

Visual comparison table with locked/unlocked states.

**5.2 Enhance `TierProgressCard`**

Add:
- "View Benefits" button → opens TierBenefitsModal
- Animated progress when earning coinz
- Celebration animation on tier-up
- Next benefit preview (e.g., "500 coinz until Early Access!")

---

### Phase 6: Integration & Polish

**6.1 Update `FanHub` Stats**

Replace mock stats with real data from `useFanStats` and `useMixxWallet`:
```typescript
const stats = [
  { icon: <Star />, label: 'Day 1s', value: fanStats?.day1_badges || 0 },
  { icon: <Heart />, label: 'Following', value: followingCount },
  { icon: <Coins />, label: 'MixxCoinz', value: totalBalance },
  { icon: <Sparkles />, label: 'Streak', value: fanStats?.engagement_streak || 0 },
];
```

**6.2 Streak Update Trigger**

Auto-update streak when:
- Any mission is completed
- Any vote is cast
- Any comment is made
- Any share is performed

Use `updateFanStats` mutation from `useFanStats`.

**6.3 Database Migration**

Add `longest_streak` and `last_activity_at` to `fan_stats`:
```sql
ALTER TABLE public.fan_stats 
ADD COLUMN IF NOT EXISTS longest_streak integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity_at timestamptz DEFAULT now();
```

---

## File Summary

### New Files (11)

| File | Purpose |
|------|---------|
| `src/hooks/useFanStats.ts` | Fan stats CRUD + streak logic |
| `src/hooks/useFanLeaderboard.ts` | Weekly/monthly leaderboard query |
| `src/components/fan/LeaderboardWidget.tsx` | Compact top 5 + user rank |
| `src/components/fan/ReferralMissionsCard.tsx` | Referral mission progress |
| `src/components/fan/BonusMissionsCard.tsx` | Limited-time missions |
| `src/components/fan/TipArtistModal.tsx` | Tip artists with coinz |
| `src/components/fan/PremiumUnlockModal.tsx` | Unlock premium content |
| `src/components/fan/PowerVoteModal.tsx` | Boost votes with coinz |
| `src/components/fan/TierBenefitsModal.tsx` | Detailed tier benefits |
| `src/components/fan/CoinzPurchaseButton.tsx` | Trigger for purchase modal |
| Database migration | Add streak columns to fan_stats |

### Modified Files (7)

| File | Changes |
|------|---------|
| `src/components/crm/fan/FanMissionsHub.tsx` | Real streak data, new components |
| `src/components/crm/fan/FanWalletHub.tsx` | Buy coinz button, modal states |
| `src/components/fan/TierProgressCard.tsx` | Benefits button, animations |
| `src/components/fan/SpendingDestinations.tsx` | Navigation handlers |
| `src/components/fan/index.ts` | Export new components |
| `src/pages/FanHub.tsx` | Real stats from hooks |
| `src/hooks/useMissions.ts` | Trigger fan_stats update on claim |

---

## Rollout Sequence

1. **Phase A: Foundation** - useFanStats hook, database migration
2. **Phase B: Missions** - Real streak, referral card, bonus card, leaderboard
3. **Phase C: Spending** - Tip modal, premium modal, power vote modal
4. **Phase D: Tier System** - Benefits modal, enhanced progress card
5. **Phase E: Integration** - FanHub stats, streak triggers, polish

---

## Technical Considerations

### Streak Validation
- 36-hour grace period prevents timezone edge cases
- Streak resets if no activity in grace period
- "Streak shield" items could be added later (purchasable with coinz)

### Tier Calculation
- Based on `total_earned` (lifetime) not current balance
- Prevents tier loss from spending
- Rewards long-term engagement

### Spending Priority
- Earned coinz spent first (per doctrine)
- Purchased coinz used when earned depleted
- Transparent in transaction ledger

### Real-time Updates
- Fan leaderboard refreshes on focus
- Wallet balance updates immediately after transactions
- Streak tracker reflects mission completion instantly

This plan creates a cohesive engagement economy where Fans are recognized as active participants, earning their status through genuine investment of time, attention, and support in the MixxClub ecosystem.

