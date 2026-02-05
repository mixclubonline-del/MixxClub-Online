
# Producer↔Artist Collaboration & Beat Royalty System
## Extending Partnerships for Producer-Artist Revenue Sharing

This plan extends the existing Artist-Engineer partnership model to support Producer↔Artist collaborations with revenue splits on released tracks and comprehensive beat royalty tracking.

---

## Current State Analysis

### Existing Partnership Infrastructure
| Component | Status | Notes |
|-----------|--------|-------|
| `partnerships` table | Built | Only supports `artist_id` + `engineer_id` |
| `collaborative_projects` table | Built | Tracks projects within partnerships |
| `revenue_splits` table | Built | Records revenue distributions |
| `usePartnershipEarnings` hook | Built | Full CRUD for Artist↔Engineer |
| `EarningsDashboard` | Built | Shows partnerships + splits |
| `NewPartnershipDialog` | Built | Only allows artist/engineer creation |
| `producer_beats` table | Built | Full beat catalog schema |
| `beat_purchases` table | Built | Tracks sales with 70/30 platform split |

### Gap Analysis
| Missing Component | Purpose |
|-------------------|---------|
| `producer_id` column in partnerships | Enable Producer↔Artist pairs |
| `beat_royalties` table | Track ongoing royalty streams |
| `track_releases` table | Link beats to released tracks |
| Partnership type field | Distinguish collab types |
| Producer partnership UI | ProducerCollabsHub is empty |
| Royalty calculation logic | Split revenue over time |
| Artist beat licensing flow | Artist initiates collab request |

---

## Architecture

```text
┌─────────────────────────────────────────────────────────────────────────┐
│               PRODUCER ↔ ARTIST COLLABORATION SYSTEM                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  PRODUCER SIDE                           ARTIST SIDE                    │
│  ┌─────────────────────┐                ┌─────────────────────┐        │
│  │  ProducerCollabsHub │                │  ArtistMatchesHub   │        │
│  │  - Active collabs   │                │  - Beat discovery   │        │
│  │  - Revenue splits   │                │  - Send collab req  │        │
│  │  - Release tracker  │                │  - Pending splits   │        │
│  └──────────┬──────────┘                └──────────┬──────────┘        │
│             │                                      │                    │
│             └───────────────┬──────────────────────┘                    │
│                             │                                           │
│                             ▼                                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                     PARTNERSHIPS TABLE                            │  │
│  │  - producer_id (new)                                              │  │
│  │  - artist_id                                                      │  │
│  │  - partnership_type: 'artist_engineer' | 'producer_artist'        │  │
│  │  - beat_id (for producer collabs)                                 │  │
│  │  - producer_percentage / artist_percentage                        │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                             │                                           │
│             ┌───────────────┴───────────────────┐                       │
│             ▼                                   ▼                       │
│  ┌─────────────────────┐          ┌──────────────────────────┐         │
│  │  track_releases     │          │     beat_royalties       │         │
│  │  - beat_id          │          │  - partnership_id        │         │
│  │  - partnership_id   │          │  - beat_id               │         │
│  │  - track_title      │          │  - total_streams         │         │
│  │  - streaming_links  │          │  - total_revenue         │         │
│  │  - release_date     │          │  - producer_earned       │         │
│  │  - status           │          │  - artist_earned         │         │
│  └─────────────────────┘          │  - last_payout_at        │         │
│                                   └──────────────────────────┘         │
│                                                                         │
│  ROYALTY FLOW                                                           │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │  1. Artist uses Producer's beat (lease/exclusive + royalty)    │    │
│  │  2. Track is released to streaming platforms                   │    │
│  │  3. Monthly royalty import (manual or DistroKid API)           │    │
│  │  4. Auto-split based on partnership agreement                  │    │
│  │  5. Revenue flows to revenue_splits table                      │    │
│  │  6. Dashboard shows cumulative royalties per track             │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema Changes

### 1. Extend `partnerships` Table

```sql
ALTER TABLE public.partnerships
ADD COLUMN producer_id uuid REFERENCES public.profiles(id),
ADD COLUMN partnership_type text NOT NULL DEFAULT 'artist_engineer',
ADD COLUMN beat_id uuid REFERENCES public.producer_beats(id),
ADD COLUMN producer_percentage numeric DEFAULT 50;

-- Add constraint: exactly 2 parties in each partnership
ALTER TABLE public.partnerships
ADD CONSTRAINT valid_partnership_parties CHECK (
  (partnership_type = 'artist_engineer' AND artist_id IS NOT NULL AND engineer_id IS NOT NULL) OR
  (partnership_type = 'producer_artist' AND producer_id IS NOT NULL AND artist_id IS NOT NULL)
);

-- Make engineer_id nullable for producer partnerships
ALTER TABLE public.partnerships
ALTER COLUMN engineer_id DROP NOT NULL;

CREATE INDEX idx_partnerships_producer ON public.partnerships(producer_id) WHERE producer_id IS NOT NULL;
CREATE INDEX idx_partnerships_type ON public.partnerships(partnership_type);
```

### 2. Create `track_releases` Table

```sql
CREATE TABLE public.track_releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id uuid NOT NULL REFERENCES public.partnerships(id) ON DELETE CASCADE,
  beat_id uuid REFERENCES public.producer_beats(id),
  track_title text NOT NULL,
  artist_name text,
  release_date date,
  streaming_platforms jsonb DEFAULT '{}',
  isrc_code text,
  upc_code text,
  cover_art_url text,
  status text DEFAULT 'unreleased' CHECK (status IN ('unreleased', 'pending', 'released', 'archived')),
  total_streams bigint DEFAULT 0,
  total_revenue numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.track_releases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partnership members can view releases"
  ON public.track_releases FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.partnerships p
      WHERE p.id = track_releases.partnership_id
      AND (p.artist_id = auth.uid() OR p.producer_id = auth.uid() OR p.engineer_id = auth.uid())
    )
  );

CREATE POLICY "Partnership members can insert releases"
  ON public.track_releases FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.partnerships p
      WHERE p.id = partnership_id
      AND (p.artist_id = auth.uid() OR p.producer_id = auth.uid())
    )
  );
```

### 3. Create `beat_royalties` Table

```sql
CREATE TABLE public.beat_royalties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id uuid NOT NULL REFERENCES public.partnerships(id) ON DELETE CASCADE,
  track_release_id uuid REFERENCES public.track_releases(id),
  beat_id uuid REFERENCES public.producer_beats(id),
  period_start date NOT NULL,
  period_end date NOT NULL,
  platform text, -- 'spotify', 'apple_music', 'youtube', etc.
  stream_count bigint DEFAULT 0,
  gross_revenue numeric NOT NULL DEFAULT 0,
  producer_amount numeric NOT NULL DEFAULT 0,
  artist_amount numeric NOT NULL DEFAULT 0,
  platform_fee numeric DEFAULT 0,
  producer_percentage numeric NOT NULL,
  artist_percentage numeric NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'paid')),
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.beat_royalties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partnership members can view royalties"
  ON public.beat_royalties FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.partnerships p
      WHERE p.id = beat_royalties.partnership_id
      AND (p.artist_id = auth.uid() OR p.producer_id = auth.uid())
    )
  );

CREATE INDEX idx_beat_royalties_partnership ON public.beat_royalties(partnership_id);
CREATE INDEX idx_beat_royalties_period ON public.beat_royalties(period_start, period_end);
```

### 4. Update Revenue Trigger

```sql
CREATE OR REPLACE FUNCTION public.update_partnership_revenue_extended()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.partnerships
  SET 
    total_revenue = COALESCE(total_revenue, 0) + NEW.total_amount,
    artist_earnings = COALESCE(artist_earnings, 0) + NEW.artist_amount,
    updated_at = now()
  WHERE id = NEW.partnership_id;
  
  -- For producer partnerships, update producer earnings separately
  IF EXISTS (SELECT 1 FROM partnerships WHERE id = NEW.partnership_id AND producer_id IS NOT NULL) THEN
    UPDATE public.partnerships
    SET producer_earnings = COALESCE(producer_earnings, 0) + NEW.producer_amount
    WHERE id = NEW.partnership_id;
  END IF;
  
  RETURN NEW;
END;
$function$;
```

---

## Implementation Plan

### Phase 1: Database & Types

**1.1 Database Migration**
- Extend partnerships table with producer support
- Create track_releases table
- Create beat_royalties table
- Add producer_earnings column
- Update RLS policies

**1.2 Update TypeScript Types**
- Add `producer_id`, `partnership_type`, `beat_id` to Partnership interface
- Create `TrackRelease` interface
- Create `BeatRoyalty` interface
- Extend `UserType` to include 'producer'

### Phase 2: Producer Collaboration Hooks

**2.1 Create `useProducerPartnerships` Hook**

**File:** `src/hooks/useProducerPartnerships.ts`

```typescript
interface ProducerPartnership {
  id: string;
  producer_id: string;
  artist_id: string;
  beat_id: string;
  beat?: ProducerBeat;
  artist?: { full_name: string; avatar_url: string };
  producer_percentage: number;
  artist_percentage: number;
  total_revenue: number;
  producer_earnings: number;
  artist_earnings: number;
  status: string;
}

// Functions:
// - fetchProducerPartnerships()
// - createProducerPartnership(artistId, beatId, splitPercentage)
// - acceptCollabRequest(partnershipId)
// - declineCollabRequest(partnershipId)
```

**2.2 Create `useBeatRoyalties` Hook**

**File:** `src/hooks/useBeatRoyalties.ts`

```typescript
interface RoyaltySummary {
  totalRoyalties: number;
  thisMonthRoyalties: number;
  pendingPayouts: number;
  topPerformingTracks: TrackRelease[];
  royaltiesByPlatform: { platform: string; amount: number }[];
}

// Functions:
// - fetchRoyalties(partnershipId?)
// - recordRoyalty(data: RoyaltyInput)
// - markRoyaltyPaid(royaltyId)
// - getRoyaltySummary()
```

**2.3 Create `useTrackReleases` Hook**

**File:** `src/hooks/useTrackReleases.ts`

```typescript
// Functions:
// - fetchReleases(partnershipId?)
// - createRelease(data)
// - updateRelease(id, data)
// - linkStreamingPlatform(releaseId, platform, url)
```

### Phase 3: Producer Collaboration UI

**3.1 Refactor `ProducerCollabsHub`**

**File:** `src/components/crm/producer/ProducerCollabsHub.tsx`

Replace empty shell with full collaboration management:
- Pending collab requests (from artists)
- Active collaborations with revenue splits
- Track release tracker
- Royalty earnings overview

**3.2 Create `CollabRequestCard`**

**File:** `src/components/producer/CollabRequestCard.tsx`

Card showing:
- Artist info (name, avatar, profile link)
- Beat they want to use
- Proposed split percentage
- Accept/Decline buttons
- Negotiate split option

**3.3 Create `ActiveCollabCard`**

**File:** `src/components/producer/ActiveCollabCard.tsx`

Card showing:
- Artist + Beat combo
- Revenue split visualization
- Total earnings so far
- Track release status
- Link to royalty details

**3.4 Create `RoyaltyTrackerPanel`**

**File:** `src/components/producer/RoyaltyTrackerPanel.tsx`

Panel showing:
- Monthly royalty breakdown by platform
- Cumulative earnings chart
- Pending vs. paid status
- Export to CSV

### Phase 4: Artist-Side Integration

**4.1 Create `BeatCollabRequestModal`**

**File:** `src/components/artist/BeatCollabRequestModal.tsx`

When Artist wants to use a beat:
- Select license type (lease with royalty share / exclusive)
- Propose royalty split (slider)
- Add message to producer
- Submit collab request

**4.2 Update `BeatDetailModal`**

Add "Request Collab" button alongside purchase options:
```typescript
// New action button
<Button onClick={() => setCollabModalOpen(true)}>
  <Users className="h-4 w-4 mr-2" />
  Request Revenue Share
</Button>
```

**4.3 Create `ArtistCollabsView`**

**File:** `src/components/artist/ArtistCollabsView.tsx`

Add to Artist CRM:
- My producer collaborations
- Pending requests sent
- Active revenue shares
- Track releases using licensed beats

### Phase 5: Track Release Management

**5.1 Create `NewReleaseModal`**

**File:** `src/components/producer/NewReleaseModal.tsx`

Form to add a track release:
- Partnership/collab selector
- Track title, artist name
- Release date picker
- ISRC/UPC codes (optional)
- Streaming platform links
- Cover art upload

**5.2 Create `ReleaseCard`**

**File:** `src/components/producer/ReleaseCard.tsx`

Card showing:
- Track artwork + title
- Streaming platform icons with links
- Stream count (manual entry or API)
- Revenue to date
- Edit/Archive actions

**5.3 Create `RecordRoyaltyModal`**

**File:** `src/components/producer/RecordRoyaltyModal.tsx`

Manual royalty entry (until API integration):
- Select track release
- Reporting period (month)
- Platform breakdown
- Stream counts + revenue
- Auto-calculate split

### Phase 6: Partnership Dialog Enhancement

**6.1 Update `NewPartnershipDialog`**

Add partnership type selector:
```typescript
// New field
<RadioGroup value={partnershipType} onValueChange={setPartnershipType}>
  <RadioGroupItem value="artist_engineer" label="Artist ↔ Engineer" />
  <RadioGroupItem value="producer_artist" label="Producer ↔ Artist" />
</RadioGroup>

// Conditional fields based on type
{partnershipType === 'producer_artist' && (
  <BeatSelector value={selectedBeatId} onChange={setSelectedBeatId} />
)}
```

**6.2 Create `BeatSelector` Component**

**File:** `src/components/producer/BeatSelector.tsx`

Dropdown/modal to select a beat for collaboration:
- Search published beats
- Show beat preview (waveform mini)
- Display current pricing

### Phase 7: Dashboard Integration

**7.1 Update `ProducerDashboardHub`**

Add collaboration stats:
```typescript
const stats = [
  { label: 'Active Collabs', value: activeCollabs },
  { label: 'Pending Requests', value: pendingRequests },
  { label: 'Royalty Earnings', value: formatCurrency(royaltyTotal) },
  { label: 'Released Tracks', value: releasedTracks },
];
```

**7.2 Add Royalty Earnings to Revenue Hub**

Create new revenue stream card for royalties:
```typescript
// In RevenueStreamCards
{
  id: 'beat_royalties',
  name: 'Beat Royalties',
  icon: Music,
  amount: royaltyEarnings,
  trend: royaltyTrend,
  description: 'Revenue share from artist collaborations',
}
```

---

## File Summary

### New Files (14)

| File | Purpose |
|------|---------|
| `src/hooks/useProducerPartnerships.ts` | Producer↔Artist partnership CRUD |
| `src/hooks/useBeatRoyalties.ts` | Royalty tracking and calculations |
| `src/hooks/useTrackReleases.ts` | Track release management |
| `src/components/producer/CollabRequestCard.tsx` | Pending collab request card |
| `src/components/producer/ActiveCollabCard.tsx` | Active collaboration card |
| `src/components/producer/RoyaltyTrackerPanel.tsx` | Monthly royalty breakdown |
| `src/components/producer/NewReleaseModal.tsx` | Add track release form |
| `src/components/producer/ReleaseCard.tsx` | Track release display card |
| `src/components/producer/RecordRoyaltyModal.tsx` | Manual royalty entry |
| `src/components/producer/BeatSelector.tsx` | Beat selection dropdown |
| `src/components/artist/BeatCollabRequestModal.tsx` | Artist sends collab request |
| `src/components/artist/ArtistCollabsView.tsx` | Artist's producer collabs |
| `src/types/producer-partnership.ts` | TypeScript interfaces |
| Database migration | Schema changes |

### Modified Files (8)

| File | Changes |
|------|---------|
| `src/types/partnership.ts` | Add producer partnership types |
| `src/components/crm/producer/ProducerCollabsHub.tsx` | Full implementation |
| `src/components/crm/producer/ProducerDashboardHub.tsx` | Add collab stats |
| `src/components/crm/earnings/NewPartnershipDialog.tsx` | Partnership type selector |
| `src/components/marketplace/BeatDetailModal.tsx` | "Request Collab" button |
| `src/hooks/usePartnershipEarnings.ts` | Support producer partnerships |
| `src/components/crm/revenue/RevenueStreamCards.tsx` | Add royalties stream |
| `src/components/producer/index.ts` | Export new components |

---

## Rollout Sequence

1. **Phase A: Database** - Schema migration, new tables, updated triggers
2. **Phase B: Types & Hooks** - TypeScript interfaces, data fetching hooks
3. **Phase C: Producer UI** - ProducerCollabsHub, collab cards, royalty tracker
4. **Phase D: Artist UI** - Collab request modal, artist collabs view
5. **Phase E: Track Releases** - Release management, royalty recording
6. **Phase F: Integration** - Dashboard stats, revenue hub, notifications

---

## Technical Considerations

### Revenue Split Flow
1. Artist requests collab with proposed split (e.g., 70% artist / 30% producer)
2. Producer accepts/negotiates
3. Partnership created with agreed percentages
4. Track is released, streams accrue
5. Monthly: Artist/Producer manually records royalties (or future API)
6. System auto-calculates split based on partnership agreement
7. Earnings reflected in both parties' dashboards

### Royalty Tracking Options
- **Phase 1 (MVP)**: Manual entry via RecordRoyaltyModal
- **Phase 2 (Future)**: DistroKid API integration for automated imports
- **Phase 3 (Future)**: Spotify for Artists / Apple Music for Artists webhooks

### Platform Split Handling
- MixxClub takes no cut on royalties (pure revenue share between parties)
- Only initial beat sale (if applicable) has 70/30 platform fee
- Royalties are 100% split between producer and artist per agreement

### Beat Licensing + Royalty Combo
Support for hybrid deals:
- Artist pays upfront lease ($29.99)
- PLUS ongoing royalty share (e.g., 20% to producer)
- Both recorded: lease in `beat_purchases`, royalties in `beat_royalties`

### Notifications
Trigger notifications for:
- New collab request received
- Collab request accepted/declined
- Track marked as released
- Monthly royalty recorded
- Royalty payout processed

This extension transforms MixxClub into a complete Producer↔Artist collaboration platform where beats become revenue-generating assets with tracked royalty streams, transparent splits, and professional release management.
