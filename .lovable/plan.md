

# The First 100: Launch Campaign Engine

## What You Already Have

Your infrastructure is strong — waitlist capture, invite codes, welcome emails, promo funnel (/go), broadcast notifications, ad copy generator, and the pre_launch/live toggle. The missing piece is the **orchestration layer** that ties these together into a coordinated campaign with automated triggers, drip sequences, and a launch countdown experience.

## What We Build

### 1. Launch Command Center (Admin Hub)
A new admin hub tile — "Launch" — that replaces scattered waitlist/invite controls in System Hub with a dedicated war room for the First 100.

- **Campaign Dashboard**: Real-time counters (waitlist size, invites sent, converted, target remaining out of 100)
- **Batch Invite Tool**: Select N waitlist entries by role priority or position, send invites in one click (triggers welcome email + status update)
- **Invite Wave Scheduler**: Schedule invite batches (e.g., "Wave 1: 10 engineers, Wave 2: 25 artists") with dates
- **Countdown Timer**: Configurable launch date stored in `platform_config`, displayed on the public waitlist page
- **Go Live Checklist**: Pre-flight verification (DNS verified, Stripe connected, welcome email working, seed data present) before flipping the switch

### 2. Waitlist-to-Signup Drip Pipeline (Edge Function)
`process-invite-wave` edge function that:
- Takes a wave config (role filter, count, wave label)
- Marks selected waitlist entries as `invited`
- Sends personalized invite emails via Resend with a unique signup link containing their invite code
- Logs the wave to a new `invite_waves` table for history tracking

### 3. Launch Countdown on Waitlist Page
Enhance `WaitlistCapture` with:
- Animated countdown timer (days/hours/minutes) when a launch date is configured
- Social proof pulse ("47 people ahead of you" → "You're #12!")
- Progress bar toward the 100-user goal

### 4. Referral Program Engine
- When someone joins the waitlist, generate a personal referral code
- Track referrals via `referred_by` column on `waitlist_signups`
- Referrers who bring 3+ people get bumped up in queue position
- Leaderboard visible on the success screen ("You've referred 2 people — 1 more to skip the line!")

### 5. Launch Day Auto-Sequence
A `launch-day-sequence` edge function triggered when admin flips to `live`:
- Sends "We're Live" email blast to all `invited` + `converted` users
- Posts celebratory broadcast notification
- Updates platform_config with launch timestamp
- Triggers confetti on the landing page for first 24 hours

## Database Changes

```sql
-- Invite wave tracking
CREATE TABLE public.invite_waves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wave_label TEXT NOT NULL,
  role_filter TEXT,
  count INTEGER NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT now(),
  sent_by UUID REFERENCES auth.users(id)
);

-- Referral tracking on waitlist
ALTER TABLE public.waitlist_signups
  ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by TEXT;
```

## File Changes

### Create (6 files)
| File | Purpose |
|---|---|
| `src/components/admin/AdminLaunchHub.tsx` | Launch Command Center with batch invite, wave scheduler, checklist, countdown config |
| `src/hooks/useLaunchCampaign.ts` | Hook for invite waves, referral stats, launch checklist state |
| `supabase/functions/process-invite-wave/index.ts` | Batch invite processing with personalized Resend emails |
| `supabase/functions/launch-day-sequence/index.ts` | Go-live automation: blast emails, broadcast, timestamp |
| `src/components/waitlist/WaitlistCountdown.tsx` | Animated countdown + progress bar component |
| `src/components/waitlist/ReferralTracker.tsx` | Post-signup referral leaderboard + share mechanics |

### Edit (4 files)
| File | Change |
|---|---|
| `src/components/crm/CRMHubGrid.tsx` | Add "Launch" hub tile to admin definitions |
| `src/pages/AdminCRM.tsx` | Add `launch` case to `renderContent()` |
| `src/components/waitlist/WaitlistCapture.tsx` | Integrate countdown timer + referral code generation on signup |
| `src/components/admin/AdminSystemHub.tsx` | Move waitlist/invite sections to Launch Hub, keep security-only content |

## The Campaign Playbook (Built Into the UI)

The Launch Hub will include a suggested wave strategy displayed as a timeline:

```text
WAVE 1 (Day 1)  →  10 Engineers  →  "Founding Engineers"
WAVE 2 (Day 3)  →  15 Artists    →  "First Session Artists"  
WAVE 3 (Day 5)  →  10 Producers  →  "Beat Pioneers"
WAVE 4 (Day 7)  →  15 Fans       →  "Day 1 Supporters"
WAVE 5 (Day 10) →  25 Mixed      →  "Inner Circle"
WAVE 6 (Day 14) →  25 Mixed      →  "The Century Club"
────────────────────────────────────
LAUNCH DAY       →  Go Live       →  Open to public
```

Engineers first because they create supply. Artists next because they create demand. Fans last because they need content to engage with.

