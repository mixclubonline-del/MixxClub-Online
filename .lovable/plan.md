
# Demo Data Seeding System
## Populate Platform with 50+ Realistic Profiles, Sessions, Beats, and Activity

This plan creates a comprehensive demo data seeding system that populates all dashboards with realistic, interconnected data that makes MixxClub feel alive from the first visit.

---

## Current State

| Table | Current Count | Target Count |
|-------|---------------|--------------|
| profiles | 12 | 100+ (50 engineers, 30 artists, 20 producers) |
| engineer_profiles | 0 | 50 |
| producer_beats | 0 | 40 |
| demo_beats | 0 | 20 |
| collaboration_sessions | 0 | 25 |
| reviews | 0 | 100+ |
| activity_feed | 4 | 100+ |
| user_follows | 0 | 200+ |
| playlists | 0 | 15 |
| achievements | 0 | 150+ |
| fan_stats | 0 | 30 |
| mixx_wallets | 1 | 100 |
| curator_profiles | 0 | 5 |

**Key Issue**: Existing `seed-platform-demo-data` edge function exists but appears to have not been run successfully. The `useDemoData` hook tries to call `get-demo-data` which doesn't exist, falling back to static placeholder stats.

---

## Architecture

```text
+------------------------------------------------------------------------+
|                    DEMO DATA SEEDING SYSTEM                            |
+------------------------------------------------------------------------+
|                                                                         |
|  EDGE FUNCTION: seed-comprehensive-demo-data                            |
|  +-----------------------------------------------------------------+   |
|  |  Phase 1: Core Profiles (100 users)                             |   |
|  |  - 50 Engineers (with engineer_profiles + earnings)             |   |
|  |  - 30 Artists (diverse genres, locations)                       |   |
|  |  - 20 Producers (with producer_beats + stats)                   |   |
|  +-----------------------------------------------------------------+   |
|                           |                                             |
|                           v                                             |
|  +-----------------------------------------------------------------+   |
|  |  Phase 2: Social Graph (500+ relationships)                     |   |
|  |  - user_follows (200+ connections)                              |   |
|  |  - artist_day1s (50+ early supporter records)                   |   |
|  |  - reviews (100+ engineer reviews)                              |   |
|  +-----------------------------------------------------------------+   |
|                           |                                             |
|                           v                                             |
|  +-----------------------------------------------------------------+   |
|  |  Phase 3: Content & Sessions                                    |   |
|  |  - collaboration_sessions (25 active/scheduled)                 |   |
|  |  - producer_beats (40 beats with pricing)                       |   |
|  |  - demo_beats (20 featured demo tracks)                         |   |
|  |  - playlists (15 curated playlists)                             |   |
|  +-----------------------------------------------------------------+   |
|                           |                                             |
|                           v                                             |
|  +-----------------------------------------------------------------+   |
|  |  Phase 4: Economy & Gamification                                |   |
|  |  - mixx_wallets (100 wallets with balances)                     |   |
|  |  - mixx_transactions (300+ history)                             |   |
|  |  - achievements (150+ across users)                             |   |
|  |  - fan_stats (30 fan engagement records)                        |   |
|  +-----------------------------------------------------------------+   |
|                           |                                             |
|                           v                                             |
|  +-----------------------------------------------------------------+   |
|  |  Phase 5: Activity & Vitality                                   |   |
|  |  - activity_feed (100+ recent activities)                       |   |
|  |  - notifications (sample notifications)                         |   |
|  |  - curator_profiles (5 active curators)                         |   |
|  +-----------------------------------------------------------------+   |
|                                                                         |
|  EDGE FUNCTION: get-demo-data (MISSING - needs creation)               |
|  +-----------------------------------------------------------------+   |
|  |  Returns real data from seeded tables for useDemoData hook      |   |
|  |  - type: 'engineers' | 'sessions' | 'activity' | 'stats' | 'all'|   |
|  |  - Joins profiles + engineer_profiles for enriched data         |   |
|  |  - Calculates live platform stats from actual counts            |   |
|  +-----------------------------------------------------------------+   |
|                                                                         |
+------------------------------------------------------------------------+
```

---

## Implementation Plan

### Phase 1: Enhance Seeding Edge Function

**1.1 Create `seed-comprehensive-demo-data` Edge Function**

**File:** `supabase/functions/seed-comprehensive-demo-data/index.ts`

This consolidates and expands the existing `seed-platform-demo-data` function with:

**Profile Generation Data:**
```typescript
const FIRST_NAMES = [
  // Engineers (music industry vibes)
  "Marcus", "Aaliyah", "Devon", "Jasmine", "Tyrell", "Keisha", "Brandon",
  "Destiny", "Jordan", "Brianna", "Malik", "Ciara", "Dwayne", "Tiffany",
  // Artists (creative names)
  "Zora", "Kyan", "Amara", "Phoenix", "Skylar", "Rio", "Luna", "Atlas",
  // Producers (brand-like names)
  "808Mafia", "Metro", "Southside", "Murda", "Wheezy", "Pi'erre"
];

const LOCATIONS = [
  "Los Angeles, CA", "Atlanta, GA", "New York, NY", "Chicago, IL",
  "Houston, TX", "Miami, FL", "Detroit, MI", "Philadelphia, PA",
  "Nashville, TN", "Austin, TX", "Toronto, ON", "London, UK"
];

const GENRES = [
  "Hip-Hop", "R&B", "Trap", "Drill", "Pop", "Afrobeats",
  "Reggaeton", "Soul", "Neo-Soul", "Alternative", "Electronic"
];

const SPECIALTIES = [
  "Mixing", "Mastering", "Vocal Production", "Beat Making",
  "Sound Design", "Recording", "Vocal Tuning", "Stem Mixing", "Dolby Atmos"
];

const BEAT_TITLES = [
  "Midnight Drip", "808 Madness", "Velvet Dreams", "Street Anthem",
  "Neon Nights", "Crown Royal", "Diamond Flow", "Trap Symphony"
];
```

**Seeding Logic:**
1. **Profiles**: Create 100 demo profiles with `is_demo: true` flag
2. **Engineer Profiles**: Link 50 profiles with detailed engineer data
3. **Producer Beats**: Create 40 beats with pricing, genres, BPM
4. **Sessions**: Create 25 sessions (10 active, 10 scheduled, 5 completed)
5. **Reviews**: Generate 100+ reviews with realistic ratings
6. **Follows**: Create 200+ follow relationships
7. **Wallets**: Initialize 100 wallets with varied balances
8. **Activity Feed**: Generate 100+ recent activities

### Phase 2: Create Missing `get-demo-data` Edge Function

**File:** `supabase/functions/get-demo-data/index.ts`

This function serves real data to the `useDemoData` hook:

```typescript
// Returns data based on type parameter:
// - 'engineers': Joins profiles + engineer_profiles for top engineers
// - 'sessions': Active/scheduled sessions with host info
// - 'activity': Recent activity_feed entries
// - 'stats': Live platform statistics from actual counts
// - 'all': Combined response for all types
```

**Stats Calculation:**
```typescript
const stats = {
  totalEngineers: await countEngineers(),
  activeSession: await countActiveSessions(),
  projectsCompleted: await countCompletedProjects(),
  totalEarnings: await sumEngineerEarnings()
};
```

### Phase 3: Admin Seeding UI

**3.1 Create `AdminSeedingPanel` Component**

**File:** `src/components/admin/AdminSeedingPanel.tsx`

Simple admin panel to trigger seeding:
- "Seed Demo Data" button
- Progress indicator
- Results summary
- Clear demo data option

### Phase 4: Update useDemoData Hook

**File:** `src/hooks/useDemoData.ts` (modify)

Improve fallback handling:
- Better error logging
- Retry logic
- Cache successful responses
- Show loading states correctly

---

## Demo Data Specifications

### 50 Engineer Profiles

| Field | Value Range |
|-------|-------------|
| full_name | Realistic names |
| role | "engineer" |
| bio | Professional descriptions |
| avatar_url | DiceBear avatars |
| location | 12 major cities |
| is_verified | 40% verified |
| hourly_rate | $50-$300 |
| years_experience | 2-20 |
| rating | 4.2-5.0 |
| completed_projects | 15-500 |
| specialties | 2-4 per engineer |
| genres | 2-5 per engineer |
| availability_status | 70% available |

### 30 Artist Profiles

| Field | Value Range |
|-------|-------------|
| full_name | Creative stage names |
| role | "artist" |
| bio | Artist descriptions |
| follower_count | 50-10000 |
| following_count | 20-500 |
| points | 100-5000 |
| level | 1-15 |

### 20 Producer Profiles + 40 Beats

| Field | Value Range |
|-------|-------------|
| title | Creative beat names |
| genre | 11 genres |
| bpm | 80-160 |
| price_cents | 1999-9999 |
| exclusive_price_cents | 9999-49999 |
| plays | 100-50000 |
| downloads | 10-500 |
| mood | ["dark", "energetic", "chill", "aggressive"] |

### 25 Collaboration Sessions

| Field | Value Range |
|-------|-------------|
| status | 10 active, 10 scheduled, 5 completed |
| visibility | 80% public |
| session_type | mixing, mastering, recording, collaboration |
| max_participants | 2-8 |
| audio_quality | high, studio, lossless |

### 100+ Reviews

| Field | Value Range |
|-------|-------------|
| rating | 4-5 (weighted toward 5) |
| review_text | 10 template variations |
| is_verified | 70% verified |

### 200+ Follows (Social Graph)

- Artists following engineers
- Engineers following each other
- Fans following artists
- Cross-role connections

### 100+ Activity Feed Entries

| Type | Description |
|------|-------------|
| session_started | "Started a new mixing session" |
| project_completed | "Completed album mix for [Artist]" |
| user_joined | "Joined MixClub" |
| achievement_unlocked | "Earned [Badge Name]" |
| review_posted | "Left a 5-star review" |
| beat_uploaded | "Uploaded new beat: [Title]" |
| collab_started | "Started collaborating with [Name]" |

---

## File Summary

### New Files (3)

| File | Purpose |
|------|---------|
| `supabase/functions/seed-comprehensive-demo-data/index.ts` | Main seeding function |
| `supabase/functions/get-demo-data/index.ts` | Serve demo data to frontend |
| `src/components/admin/AdminSeedingPanel.tsx` | Admin UI for seeding |

### Modified Files (1)

| File | Changes |
|------|---------|
| `src/hooks/useDemoData.ts` | Improve error handling, add retry logic |

---

## Seeding Flow

```text
Admin clicks "Seed Demo Data"
          |
          v
+-------------------+
| Profiles (100)    |  <-- Phase 1: Core identities
+-------------------+
          |
          v
+-------------------+
| Role-specific     |  <-- Phase 2: Engineer/Producer details
| (engineer_profiles|
|  producer_beats)  |
+-------------------+
          |
          v
+-------------------+
| Social Graph      |  <-- Phase 3: Relationships
| (follows, reviews)|
+-------------------+
          |
          v
+-------------------+
| Content           |  <-- Phase 4: Sessions, playlists
| (sessions, beats) |
+-------------------+
          |
          v
+-------------------+
| Economy           |  <-- Phase 5: Wallets, transactions
| (wallets, coinz)  |
+-------------------+
          |
          v
+-------------------+
| Activity          |  <-- Phase 6: Feed, notifications
| (activity_feed)   |
+-------------------+
          |
          v
    PLATFORM ALIVE!
```

---

## Expected Results

After seeding:
- **Home Page**: Shows 3 "Online" engineers with real data
- **Engineer Directory**: 50 browseable engineers with ratings
- **Sessions Browser**: 25 sessions to browse
- **Producer Marketplace**: 40 beats with pricing
- **Activity Feed**: Constant stream of demo activity
- **Platform Stats**: Real counts (247 engineers, 18 active sessions, etc.)
- **Leaderboards**: Populated with top performers
- **CRM Dashboards**: Revenue data, client lists, project history

---

## Rollout Sequence

1. Create `seed-comprehensive-demo-data` edge function
2. Create `get-demo-data` edge function
3. Update `useDemoData` hook with better error handling
4. Deploy edge functions
5. Invoke seeding via admin panel or direct call
6. Verify all dashboards populate correctly

This creates a "lived-in" platform feel that solves the cold-start problem, making new visitors see an active, thriving community from their first interaction.
