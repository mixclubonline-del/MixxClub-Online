
# DJ/Curator Role Features
## Fans Pay Artists in MixxCoinz for Track Promotion & Premiere Slots

This plan introduces a full-featured DJ/Curator system where elevated Fans can promote tracks on playlists and premiere slots, creating a paid promotion economy using MixxCoinz.

---

## Current State Analysis

### Existing Infrastructure
| Component | Status | Notes |
|-----------|--------|-------|
| `curator_promotion_requests` table | Exists | Full schema with artist/curator IDs, payment_amount, status |
| `playlists` table | Exists | User playlists with public/collaborative flags |
| `playlist_tracks` table | Exists | Tracks in playlists with positions |
| `premieres` table | Exists | Premiere slots with dates, ranks, ratings |
| `usePlaylists` hook | Exists | CRUD for playlists |
| `useMixxWallet` hook | Exists | Full earn/spend with transaction tracking |
| `useFanStats` hook | Exists | Tier system, engagement tracking |
| `TipArtistModal` | Exists | Pattern for MixxCoinz transfers |
| `PowerVoteModal` | Exists | Pattern for spending coinz on features |
| `app_role` enum | Exists | Includes 'fan' but not 'curator' or 'dj' |
| RLS on `curator_promotion_requests` | Exists | Artists insert, curators update |

### Key Insight
The `curator_promotion_requests` table already exists, suggesting an earlier design intent. Rather than creating a new role, we'll implement **Curator Mode** as a feature available to Fans who meet tier requirements (Champion+ tier = 5000+ MixxCoinz earned).

---

## Architecture

```text
+-------------------------------------------------------------------------+
|                    DJ/CURATOR PROMOTION SYSTEM                          |
+-------------------------------------------------------------------------+
|                                                                         |
|  FAN/CURATOR SIDE                        ARTIST SIDE                    |
|  +---------------------+                +---------------------+         |
|  |  CuratorDashboard   |                |  Artist Track Mgmt  |         |
|  |  - My Playlists     |                |  - Submit for promo |         |
|  |  - Promo Requests   |                |  - Pending requests |         |
|  |  - Premiere Slots   |                |  - Paid history     |         |
|  +----------+----------+                +----------+----------+         |
|             |                                      |                    |
|             v                                      v                    |
|  +----------------------------------------------------------+          |
|  |             curator_promotion_requests                    |          |
|  |  - artist_id        - curator_id                         |          |
|  |  - track_id         - payment_amount (MixxCoinz)         |          |
|  |  - payment_currency = 'mixxcoinz'                        |          |
|  |  - status: pending -> accepted/declined -> completed     |          |
|  +----------------------------------------------------------+          |
|             |                                      |                    |
|   On Accept |                           On Submit  |                    |
|             v                                      v                    |
|  +---------------------+                +---------------------+         |
|  |  Artist Wallet      |                |  MixxCoinz Escrow   |         |
|  |  Receives payment   |                |  Holds until accept |         |
|  +---------------------+                +---------------------+         |
|                                                                         |
|  NEW TABLES NEEDED:                                                     |
|  +----------------------------------------------------------+          |
|  |  curator_profiles (extends fan profile for curators)      |          |
|  |  - user_id, curator_name, bio, genres[], playlists[]     |          |
|  |  - total_placements, earnings_lifetime, rating           |          |
|  |  - verified (for top curators), featured_playlist_id     |          |
|  +----------------------------------------------------------+          |
|  |  curator_premiere_slots (premier slot offerings)          |          |
|  |  - curator_id, slot_name, description, price_coinz       |          |
|  |  - time_slot, max_duration, status, available_dates[]    |          |
|  +----------------------------------------------------------+          |
|  |  curator_slot_bookings (booked premiere slots)            |          |
|  |  - slot_id, artist_id, premiere_id, payment_amount       |          |
|  |  - booked_date, status, artist_notes                     |          |
|  +----------------------------------------------------------+          |
|                                                                         |
+-------------------------------------------------------------------------+
```

---

## Implementation Plan

### Phase 1: Database Schema

**1.1 Create `curator_profiles` Table**
```sql
CREATE TABLE public.curator_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  curator_name text NOT NULL,
  bio text,
  genres text[] DEFAULT '{}',
  avatar_url text,
  cover_url text,
  social_links jsonb DEFAULT '{}',
  total_placements integer DEFAULT 0,
  total_earnings integer DEFAULT 0,    -- in MixxCoinz
  average_rating numeric DEFAULT 0,
  total_reviews integer DEFAULT 0,
  is_verified boolean DEFAULT false,
  featured_playlist_id uuid REFERENCES public.playlists(id),
  minimum_payment integer DEFAULT 50,  -- minimum coinz for promotion
  response_time_hours integer DEFAULT 48,
  tier_required text DEFAULT 'champion', -- Fan tier required to become curator
  status text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'suspended')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**1.2 Create `curator_premiere_slots` Table**
```sql
CREATE TABLE public.curator_premiere_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  curator_id uuid REFERENCES public.curator_profiles(id) ON DELETE CASCADE NOT NULL,
  slot_name text NOT NULL,
  description text,
  price_coinz integer NOT NULL,
  slot_type text DEFAULT 'standard' CHECK (slot_type IN ('standard', 'featured', 'exclusive')),
  time_window text,            -- e.g., "Friday 8PM-10PM EST"
  max_duration_seconds integer DEFAULT 300,
  available_days text[] DEFAULT '{}',
  max_bookings_per_day integer DEFAULT 3,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
```

**1.3 Create `curator_slot_bookings` Table**
```sql
CREATE TABLE public.curator_slot_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id uuid REFERENCES public.curator_premiere_slots(id) ON DELETE CASCADE NOT NULL,
  curator_id uuid REFERENCES public.curator_profiles(id) NOT NULL,
  artist_id uuid REFERENCES public.profiles(id) NOT NULL,
  track_id uuid,                 -- Reference to user_tracks or audio_files
  track_title text NOT NULL,
  track_url text,
  premiere_date date NOT NULL,
  payment_amount integer NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'refunded')),
  artist_notes text,
  curator_notes text,
  escrow_transaction_id uuid,    -- Reference to mixx_transactions for escrow
  created_at timestamptz DEFAULT now(),
  confirmed_at timestamptz,
  completed_at timestamptz
);
```

**1.4 Add RLS Policies**
- Curators can view/update their own profiles, slots, and bookings
- Artists can view curator profiles and available slots
- Artists can create bookings, curators can update booking status
- Public can view active curator profiles

**1.5 Add Indexes**
```sql
CREATE INDEX idx_curator_profiles_user ON public.curator_profiles(user_id);
CREATE INDEX idx_curator_profiles_status ON public.curator_profiles(status) WHERE status = 'active';
CREATE INDEX idx_curator_slots_curator ON public.curator_premiere_slots(curator_id);
CREATE INDEX idx_curator_bookings_artist ON public.curator_slot_bookings(artist_id);
CREATE INDEX idx_curator_bookings_status ON public.curator_slot_bookings(status);
```

---

### Phase 2: Curator Hooks

**2.1 Create `useCuratorProfile` Hook**
**File:** `src/hooks/useCuratorProfile.ts`

```typescript
interface CuratorProfile {
  id: string;
  user_id: string;
  curator_name: string;
  bio: string | null;
  genres: string[];
  total_placements: number;
  total_earnings: number;
  average_rating: number;
  is_verified: boolean;
  minimum_payment: number;
  status: 'active' | 'paused' | 'suspended';
}

// Functions:
// - fetchCuratorProfile(userId)
// - createCuratorProfile(data)
// - updateCuratorProfile(updates)
// - checkCuratorEligibility() - verifies fan tier
```

**2.2 Create `useCuratorSlots` Hook**
**File:** `src/hooks/useCuratorSlots.ts`

```typescript
interface CuratorSlot {
  id: string;
  curator_id: string;
  slot_name: string;
  price_coinz: number;
  slot_type: 'standard' | 'featured' | 'exclusive';
  is_active: boolean;
}

// Functions:
// - fetchMySlots()
// - createSlot(data)
// - updateSlot(id, updates)
// - deleteSlot(id)
// - fetchAvailableSlots(curatorId) - for artists browsing
```

**2.3 Create `useCuratorPromotions` Hook**
**File:** `src/hooks/useCuratorPromotions.ts`

```typescript
// Functions:
// - fetchPromotionRequests() - for curator
// - fetchMySubmissions() - for artist
// - submitForPromotion(curatorId, trackId, payment, notes)
// - acceptPromotion(requestId)
// - declinePromotion(requestId, reason)
// - markCompleted(requestId, playlistUrl)
```

**2.4 Create `useCuratorBookings` Hook**
**File:** `src/hooks/useCuratorBookings.ts`

```typescript
// Functions:
// - fetchSlotBookings(slotId?)
// - bookPremiereSlot(slotId, trackData, date)
// - confirmBooking(bookingId)
// - cancelBooking(bookingId, reason)
// - completeBooking(bookingId)
```

---

### Phase 3: Curator Dashboard Components

**3.1 Create `CuratorDashboard` Page**
**File:** `src/pages/CuratorDashboard.tsx`

Main curator management page with tabs:
- Overview (stats, quick actions)
- Promotion Requests (pending, accepted, completed)
- Premiere Slots (manage offerings)
- Playlists (curated playlists)
- Earnings (MixxCoinz history)

**3.2 Create `CuratorOnboarding`**
**File:** `src/components/curator/CuratorOnboarding.tsx`

Guided setup for new curators:
- Verify tier eligibility (Champion+)
- Set curator name, bio, genres
- Create first playlist
- Set pricing structure
- Feature initial slots

**3.3 Create `CuratorProfileCard`**
**File:** `src/components/curator/CuratorProfileCard.tsx`

Display curator info:
- Avatar, name, verified badge
- Genres specialization
- Stats (placements, rating)
- Featured playlist preview
- "Request Promotion" button

**3.4 Create `PromotionRequestCard`**
**File:** `src/components/curator/PromotionRequestCard.tsx`

Card for managing incoming requests:
- Artist info + track preview
- Payment offered
- Artist notes
- Accept/Decline buttons
- Playlist selector for placement

**3.5 Create `PremiereSlotCard`**
**File:** `src/components/curator/PremiereSlotCard.tsx`

Display/manage premiere slot offerings:
- Slot name + description
- Price in MixxCoinz
- Available dates/times
- Booking count
- Edit/Pause actions

---

### Phase 4: Artist-Side Components

**4.1 Create `CuratorDiscovery`**
**File:** `src/components/artist/CuratorDiscovery.tsx`

Browse available curators:
- Filter by genre, price range, rating
- Sort by popularity, response time
- Curator cards with quick view
- Search functionality

**4.2 Create `SubmitForPromotionModal`**
**File:** `src/components/artist/SubmitForPromotionModal.tsx`

Modal for artists to submit tracks:
- Curator selection
- Track selector from library
- Payment amount (slider)
- Message to curator
- MixxCoinz balance display
- Escrow explanation

**4.3 Create `BookPremiereSlotModal`**
**File:** `src/components/artist/BookPremiereSlotModal.tsx`

Modal for booking premiere slots:
- Date picker (available dates)
- Track upload/selection
- Slot details display
- Payment confirmation
- Terms agreement

**4.4 Create `MyPromotionSubmissions`**
**File:** `src/components/artist/MyPromotionSubmissions.tsx`

Track submission history:
- Pending submissions
- Accepted/Completed
- Declined with reasons
- Refund status

---

### Phase 5: Payment Flow (MixxCoinz)

**5.1 Escrow System Logic**
```typescript
// In useCuratorPromotions:

async function submitForPromotion(curatorId, trackId, payment, notes) {
  // 1. Verify artist can afford
  if (!canAfford(payment)) throw new Error('Insufficient balance');
  
  // 2. Spend coinz (held in escrow)
  const txResult = await spendCoinz({
    amount: payment,
    source: 'curator_promo_escrow',
    description: `Escrow for promotion request`,
    referenceType: 'curator_promo_request',
    referenceId: null, // Will update after request created
  });
  
  // 3. Create promotion request
  const request = await supabase
    .from('curator_promotion_requests')
    .insert({
      artist_id: user.id,
      curator_id: curatorId,
      track_id: trackId,
      payment_amount: payment,
      payment_currency: 'mixxcoinz',
      status: 'pending',
    })
    .select()
    .single();
  
  // 4. Update transaction reference
  // (tracked via reference_id on transaction)
  
  return request;
}
```

**5.2 Release/Refund Logic**
```typescript
// When curator accepts:
async function acceptPromotion(requestId) {
  // 1. Update request status
  await supabase
    .from('curator_promotion_requests')
    .update({ status: 'accepted', responded_at: new Date() })
    .eq('id', requestId);
  
  // 2. Transfer escrowed coinz to curator wallet
  const request = await fetchRequest(requestId);
  await earnCoinz({
    userId: request.curator_id,
    amount: request.payment_amount,
    source: 'curator_promo_received',
    description: `Promotion payment for "${request.track_title}"`,
    referenceType: 'curator_promo_request',
    referenceId: requestId,
  });
}

// When curator declines or artist cancels:
async function refundPromotion(requestId, reason) {
  // 1. Update status
  await supabase
    .from('curator_promotion_requests')
    .update({ status: 'declined', curator_notes: reason })
    .eq('id', requestId);
  
  // 2. Refund to artist
  const request = await fetchRequest(requestId);
  await earnCoinz({
    userId: request.artist_id,
    amount: request.payment_amount,
    source: 'curator_promo_refund',
    description: `Refund for declined promotion`,
    referenceType: 'curator_promo_refund',
    referenceId: requestId,
  });
}
```

---

### Phase 6: FanHub Integration

**6.1 Add Curator Tab to FanHub**
Update `src/pages/FanHub.tsx`:
```typescript
// Add tab for curator mode
case 'curator':
  return <FanCuratorHub />;
```

**6.2 Create `FanCuratorHub`**
**File:** `src/components/crm/fan/FanCuratorHub.tsx`

Curator management within FanHub:
- Eligibility check (tier gate)
- Curator onboarding CTA
- Active curator dashboard
- Promotion requests queue
- Earnings summary

**6.3 Update Fan Stats Display**
Add curator stats to fan profile:
- Total placements
- Curator earnings
- Average rating

---

### Phase 7: Notifications

**7.1 Notification Triggers**
- New promotion request received (to curator)
- Promotion accepted/declined (to artist)
- Premiere slot booked (to curator)
- Booking confirmed/cancelled (to artist)
- Payment received (to curator)
- Refund processed (to artist)

---

## File Summary

### New Files (16)

| File | Purpose |
|------|---------|
| `src/hooks/useCuratorProfile.ts` | Curator profile CRUD |
| `src/hooks/useCuratorSlots.ts` | Premiere slot management |
| `src/hooks/useCuratorPromotions.ts` | Promotion request handling |
| `src/hooks/useCuratorBookings.ts` | Slot booking management |
| `src/components/curator/CuratorOnboarding.tsx` | New curator setup flow |
| `src/components/curator/CuratorProfileCard.tsx` | Curator display card |
| `src/components/curator/PromotionRequestCard.tsx` | Request management card |
| `src/components/curator/PremiereSlotCard.tsx` | Slot offering card |
| `src/components/curator/CuratorStatsCard.tsx` | Stats overview |
| `src/components/curator/index.ts` | Barrel exports |
| `src/components/artist/CuratorDiscovery.tsx` | Browse curators |
| `src/components/artist/SubmitForPromotionModal.tsx` | Submit track modal |
| `src/components/artist/BookPremiereSlotModal.tsx` | Book slot modal |
| `src/components/artist/MyPromotionSubmissions.tsx` | Submissions history |
| `src/components/crm/fan/FanCuratorHub.tsx` | Curator tab in FanHub |
| `src/pages/CuratorDashboard.tsx` | Full curator page |
| Database migration | Schema changes |

### Modified Files (5)

| File | Changes |
|------|---------|
| `src/pages/FanHub.tsx` | Add curator tab |
| `src/components/crm/fan/index.ts` | Export FanCuratorHub |
| `src/hooks/useFanStats.ts` | Add curator eligibility check |
| `src/App.tsx` | Add CuratorDashboard route |
| `src/components/fan/index.ts` | Export new components |

---

## Rollout Sequence

1. **Phase A: Database** - Create tables, RLS policies, indexes
2. **Phase B: Hooks** - Build data layer with escrow logic
3. **Phase C: Curator UI** - Dashboard, slots, request management
4. **Phase D: Artist UI** - Discovery, submission, booking modals
5. **Phase E: FanHub Integration** - Curator tab, eligibility gate
6. **Phase F: Notifications** - Trigger notifications on key events
7. **Phase G: Polish** - Verified badges, featured curators, analytics

---

## Technical Considerations

### Curator Eligibility
- Fans must reach **Champion tier** (5000+ MixxCoinz earned) to unlock Curator Mode
- This ensures curators have demonstrated engagement and understand the platform
- Eligibility checked via `fan_stats.mixxcoinz_earned >= 5000`

### MixxCoinz Escrow Flow
1. Artist submits request -> Coinz deducted immediately (escrow)
2. Curator accepts -> Coinz transferred to curator wallet
3. Curator declines OR 72hr timeout -> Coinz refunded to artist
4. Dispute resolution: Admin can manually refund

### Promotion Types
- **Playlist Placement**: Add track to curator's public playlist
- **Premiere Slot**: Featured playback at scheduled time
- **Social Shoutout**: Curator promotes on connected socials (future)

### Rating System
- After completion, artists can rate curator (1-5 stars)
- Affects curator's `average_rating` and visibility in discovery
- Helps surface quality curators

### Platform Cut
- MixxClub takes **no cut** on curator-artist transactions
- This is peer-to-peer within the MixxCoinz ecosystem
- Encourages organic growth of the curator market

This plan creates a complete ecosystem where engaged Fans can monetize their curation skills using MixxCoinz, while Artists gain access to authentic promotion channels within the MixxClub community.
