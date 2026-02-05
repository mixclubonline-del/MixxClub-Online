
# Producer & Fan CRM Expansion
## Opening the World to the Full Creation Triangle + Community

This plan extends MixxClub's CRM ecosystem from the current **Artist/Engineer** duality to the full **Creation Triangle** (Producer, Artist, Engineer) plus **Fans** as active economy participants.

---

## Current State

### What Exists
- **Roles in database**: `app_role` enum contains `admin`, `moderator`, `user`, `artist`, `engineer`
- **CRM Pages**: `ArtistCRM.tsx`, `EngineerCRM.tsx` with full hub systems
- **Characters**: Prime (mentor), Jax (artist), Rell (engineer), Nova (community)
- **Fan infrastructure**: `fan_stats` table tracking votes, comments, premieres
- **Auth system**: `useAuth` hook with multi-role support (`userRoles`, `activeRole`, `isHybridUser`)

### What's Missing
- **No `producer` or `fan` in `app_role` enum**
- **No Producer CRM page** or onboarding wizard
- **No Fan CRM page** or engagement dashboard
- **No character guide for Producer** (Tempo is planned per memory but not implemented)
- **Navigation config** only supports `artist | engineer | admin | null`

---

## Architecture Vision

```text
┌─────────────────────────────────────────────────────────────────┐
│                    MIXXCLUB ROLE ECOSYSTEM                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    ┌──────────────┐                             │
│                    │    PRIME     │  Mentor/Guide               │
│                    │   (The OG)   │  All roles                  │
│                    └──────────────┘                             │
│                           │                                     │
│         ┌─────────────────┼─────────────────┐                   │
│         │                 │                 │                   │
│         ▼                 ▼                 ▼                   │
│  ┌────────────┐   ┌────────────┐   ┌────────────┐               │
│  │  PRODUCER  │◄──│   ARTIST   │──►│  ENGINEER  │               │
│  │   Tempo    │   │    Jax     │   │    Rell    │               │
│  │ Beat forge │   │  Creation  │   │  Services  │               │
│  └────────────┘   └────────────┘   └────────────┘               │
│         │                 │                 │                   │
│         └─────────────────┼─────────────────┘                   │
│                           │                                     │
│                           ▼                                     │
│                    ┌──────────────┐                             │
│                    │     FAN      │  Community/Discovery        │
│                    │    Nova      │  Engagement Economy         │
│                    └──────────────┘                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Database Foundation

**1.1 Extend `app_role` Enum**

Add `producer` and `fan` to the existing role enum:

```sql
ALTER TYPE public.app_role ADD VALUE 'producer';
ALTER TYPE public.app_role ADD VALUE 'fan';
```

**1.2 Create Producer-Specific Tables**

```sql
-- Producer catalog: beats, kits, samples
CREATE TABLE public.producer_beats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  bpm integer,
  key_signature text,
  genre text,
  tags text[],
  audio_url text,
  preview_url text,
  price_cents integer DEFAULT 0,
  license_type text DEFAULT 'lease',
  is_exclusive_available boolean DEFAULT true,
  exclusive_price_cents integer,
  downloads integer DEFAULT 0,
  plays integer DEFAULT 0,
  status text DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Producer analytics
CREATE TABLE public.producer_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_beats integer DEFAULT 0,
  total_sales integer DEFAULT 0,
  total_revenue_cents integer DEFAULT 0,
  total_plays integer DEFAULT 0,
  total_downloads integer DEFAULT 0,
  avg_rating numeric(3,2),
  updated_at timestamptz DEFAULT now()
);
```

**1.3 Enhance `fan_stats` Table**

Add engagement economy columns:

```sql
ALTER TABLE public.fan_stats 
  ADD COLUMN IF NOT EXISTS mixxcoinz_earned integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS artists_supported integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS day1_badges integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS engagement_streak integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS current_tier text DEFAULT 'listener';
```

---

### Phase 2: Character System Extension

**2.1 Add Tempo Character (Producer Guide)**

Update `src/config/characters.ts`:

```typescript
export type CharacterId = 'prime' | 'jax' | 'rell' | 'nova' | 'tempo';

tempo: {
  id: 'tempo',
  name: 'Tempo',
  role: 'Producer Entry',
  tagline: 'The beat is the foundation.',
  voiceId: 'EXAVITQu4vr4xnSDxMaL', // Assign appropriate voice
  avatarPath: '/assets/characters/tempo-portrait.png',
  accentColor: 'hsl(45 90% 50%)', // Gold/amber accent
  accentGlow: 'shadow-[0_0_20px_hsl(45_90%_50%_/_0.4)]',
  personality: ['Creative', 'Rhythm-focused', 'Collaborative'],
  sampleQuotes: [
    "Every hit starts with a beat.",
    "I make the canvas. Artists paint on it.",
    "The pocket is everything."
  ],
  locations: ['Producer landing', 'Beat marketplace', 'Producer CRM'],
  onboardingQuotes: [
    "Your sound. Your signature.",
    "What's your production style?",
    "Ready to get your beats heard."
  ],
  contextQuotes: {
    beats: "Your catalog is your legacy. Keep stacking.",
    sales: "Every sale is proof your sound connects.",
    // ... additional contexts
  }
}
```

**2.2 Extend Entry Point Mapping**

```typescript
export const ENTRY_POINT_CHARACTERS: Record<
  'artist' | 'engineer' | 'producer' | 'fan' | 'community', 
  CharacterId
> = {
  artist: 'jax',
  engineer: 'rell',
  producer: 'tempo',
  fan: 'nova',
  community: 'nova',
};
```

---

### Phase 3: Auth & Role System Updates

**3.1 Extend `useAuth.tsx`**

Update type definitions:

```typescript
type AppRole = 'artist' | 'engineer' | 'producer' | 'fan' | 'admin';

// Update priority logic for primary role
if (roles.includes('admin')) {
  setUserRole('admin');
} else if (roles.includes('producer')) {
  setUserRole('producer');
} else if (roles.includes('engineer')) {
  setUserRole('engineer');
} else if (roles.includes('artist')) {
  setUserRole('artist');
} else if (roles.includes('fan')) {
  setUserRole('fan');
}
```

**3.2 Extend Navigation Config**

Update `src/config/navigationConfig.ts`:

```typescript
export type UserRole = 'artist' | 'engineer' | 'producer' | 'fan' | 'admin' | null;

// Add producer navigation items
{
  label: 'Dashboard',
  path: '/producer-crm',
  icon: Disc3,
  roles: ['producer'],
  category: 'Main',
},

// Add fan navigation items
{
  label: 'My Feed',
  path: '/fan-hub',
  icon: Heart,
  roles: ['fan'],
  category: 'Main',
},
```

**3.3 Extend Role Switcher**

Update `RoleSwitcher.tsx` to support 4 creation roles:

```typescript
// Support switching between producer/artist/engineer/fan
const roleIcons = {
  producer: Disc3,
  artist: Mic2,
  engineer: Headphones,
  fan: Heart
};
```

---

### Phase 4: Onboarding Flows

**4.1 Producer Onboarding Wizard**

Create `src/components/onboarding/ProducerOnboardingWizard.tsx`:

- **Step 1: Profile** - Producer name, username, avatar
- **Step 2: Style** - Production genres (Trap, Boom Bap, Drill, R&B, etc.)
- **Step 3: Catalog** - Upload first beat (optional), set pricing preferences
- **Step 4: Goals** - Sell beats, find artists, collaboration, licensing

**4.2 Fan Onboarding (Lightweight)**

Create `src/components/onboarding/FanOnboardingWizard.tsx`:

- **Step 1: Profile** - Display name, username
- **Step 2: Interests** - Favorite genres, discover preferences
- **Step 3: Connect** - Follow first artists (recommendations)

**4.3 Onboarding Page Routes**

Create `src/pages/ProducerOnboarding.tsx` and `src/pages/FanOnboarding.tsx`.

---

### Phase 5: CRM Pages

**5.1 Producer CRM (`ProducerCRM.tsx`)**

Hub structure tailored for beat-makers:

| Hub | Purpose |
|-----|---------|
| Dashboard | Beat catalog stats, revenue snapshot, trending sounds |
| Catalog | Beat management, pricing, licensing options |
| Sales | Orders, downloads, customer info |
| Collabs | Artist requests, split agreements |
| Revenue | Sales analytics, payout history |
| Community | Producer network, feedback |
| Brand Hub | Producer identity, portfolio site |

**5.2 Fan Hub (`FanHub.tsx`)**

Engagement-focused experience:

| Hub | Purpose |
|-----|---------|
| Feed | Personalized discovery, new releases |
| Day 1s | Artists you supported early, badges |
| Premieres | Upcoming drops, voting queue |
| Missions | Engagement tasks for MixxCoinz |
| Wallet | MixxCoinz balance, spend history |
| Favorites | Saved artists, tracks, playlists |

---

### Phase 6: Auth Page Updates

**6.1 Role Selection Expansion**

Update `Auth.tsx` role selection to include all 4 roles:

```typescript
const ROLES = [
  { id: 'producer', label: 'Producer', icon: Disc3, description: 'I make beats' },
  { id: 'artist', label: 'Artist', icon: Mic2, description: 'I make music' },
  { id: 'engineer', label: 'Engineer', icon: Headphones, description: 'I mix & master' },
  { id: 'fan', label: 'Fan', icon: Heart, description: 'I discover & support' },
];
```

**6.2 Smart Destination Routing**

```typescript
const getOnboardingDestination = (role: string) => {
  switch (role) {
    case 'producer': return '/onboarding/producer';
    case 'artist': return '/onboarding/artist';
    case 'engineer': return '/onboarding/engineer';
    case 'fan': return '/onboarding/fan';
    default: return '/onboarding/artist';
  }
};
```

---

### Phase 7: Routing Updates

Update `src/routes/appRoutes.tsx`:

```typescript
// Producer routes
<Route path="/producer-crm" element={<AppLayout><ProducerCRM /></AppLayout>} />
<Route path="/onboarding/producer" element={<ProtectedRoute><ProducerOnboarding /></ProtectedRoute>} />

// Fan routes
<Route path="/fan-hub" element={<AppLayout><FanHub /></AppLayout>} />
<Route path="/onboarding/fan" element={<ProtectedRoute><FanOnboarding /></ProtectedRoute>} />
```

---

## File Creation Summary

| File | Purpose |
|------|---------|
| `src/pages/ProducerCRM.tsx` | Producer command center |
| `src/pages/FanHub.tsx` | Fan engagement dashboard |
| `src/pages/ProducerOnboarding.tsx` | Producer onboarding page |
| `src/pages/FanOnboarding.tsx` | Fan onboarding page |
| `src/components/onboarding/ProducerOnboardingWizard.tsx` | Producer wizard UI |
| `src/components/onboarding/FanOnboardingWizard.tsx` | Fan wizard UI |
| `src/components/crm/producer/` | Producer-specific hub components |
| `src/components/crm/fan/` | Fan-specific hub components |
| `src/assets/characters/tempo-portrait.png` | Tempo character asset (placeholder) |

---

## File Modification Summary

| File | Changes |
|------|---------|
| `src/config/characters.ts` | Add Tempo character, extend types |
| `src/config/navigationConfig.ts` | Extend UserRole type, add producer/fan nav items |
| `src/hooks/useAuth.tsx` | Extend AppRole type, update priority logic |
| `src/pages/Auth.tsx` | Add producer/fan role selection options |
| `src/routes/appRoutes.tsx` | Add producer and fan routes |
| `src/components/crm/RoleSwitcher.tsx` | Support 4 roles in switcher UI |
| `src/components/crm/CRMPortal.tsx` | Extend userType to include producer/fan |
| `src/components/crm/CRMHubGrid.tsx` | Role-specific hub definitions |
| Database migration | Extend enum, create producer tables, enhance fan_stats |

---

## Technical Considerations

### Multi-Role Users
The existing `isHybridUser` flag and `userRoles` array already support users with multiple roles. A producer who also creates vocal tracks can have both `producer` and `artist` roles.

### Character Consistency
- **Tempo** guides Producers through beat catalog management
- **Nova** guides Fans through discovery and engagement
- **Prime** remains the omniscient mentor across all roles

### Economy Integration
- Producers sell beats to Artists (marketplace transactions)
- Fans earn MixxCoinz through engagement, spend in merch stores
- Artists and Engineers continue existing service flows

### Gradual Rollout
Consider feature flags for phased deployment:

```typescript
FEATURE_FLAGS = {
  PRODUCER_CRM_ENABLED: false,
  FAN_HUB_ENABLED: false,
  // Enable after core functionality tested
}
```

---

## Rollout Phases

1. **Phase A**: Database schema + role enum extension
2. **Phase B**: Character system + auth updates
3. **Phase C**: Producer onboarding + CRM (core hubs)
4. **Phase D**: Fan onboarding + Hub (core features)
5. **Phase E**: Cross-role marketplace integrations
6. **Phase F**: Full economy wiring (MixxCoinz flows)

This establishes the foundational infrastructure to "open the world" to Producers and Fans as first-class citizens in the MixxClub ecosystem.
