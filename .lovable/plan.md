

## Extend useDynamicLandingAssets to Universal Dynamic Asset System

### The Problem

Currently, `useDynamicLandingAssets` only queries `landing_%` and `prime_%` contexts, leaving other pages with hardcoded static asset imports:

| Page | Current Pattern | Problem |
|------|----------------|---------|
| `/city` | `import cityGatesImage from '@/assets/city-gates.jpg'` | Static, requires code change |
| `/city/*` | `DistrictPortal` uses hardcoded `DISTRICT_PORTALS` map | No admin control |
| `/community` | `import communityPlazaBg from '@/assets/community-plaza.jpg'` | Static |
| `/services` | `import servicesLobby from '@/assets/services-lobby.jpg'` | Static |

The `asset_contexts` table already defines prefixes for these areas (`city_`, `community_`, `services_`, `studio_`, `room_`, etc.), but no frontend hook queries them.

---

### Solution Architecture

Create a **universal dynamic asset hook** that:

1. Queries all relevant context prefixes from the database
2. Provides typed section-to-context mappings
3. Offers fallback to static imports when no database asset exists
4. Enables real-time updates via Supabase subscription

---

### Phase 1: Refactor Hook to Support All Page Contexts

**Rename and Extend:** `useDynamicLandingAssets` → `useDynamicAssets`

**New Query Pattern:**
```sql
-- Instead of:
.or('asset_context.like.landing_%,asset_context.like.prime_%')

-- Query ALL page-relevant contexts:
.or('asset_context.like.landing_%,asset_context.like.prime_%,asset_context.like.city_%,asset_context.like.community_%,asset_context.like.services_%,asset_context.like.studio_%,asset_context.like.hallway_%,asset_context.like.district_%')
```

**Extended Section Map:**
```typescript
const SECTION_ASSET_MAP: Record<string, string[]> = {
  // === Existing Landing/Prime ===
  hero_background: ['landing_origin_architect', 'landing_origin_basement', 'landing_origin_penthouse'],
  hero_prime: ['prime_drop', 'prime_hero'],
  // ... existing mappings ...

  // === City Districts (NEW) ===
  city_gates: ['city_gates', 'city_entrance'],
  city_tower: ['district_tower', 'city_tower', 'mixxtech_tower'],
  city_studio: ['district_rsd', 'city_studio', 'rsd_chamber'],
  city_creator: ['district_creator', 'city_creator', 'creator_hub'],
  city_neural: ['district_neural', 'city_neural', 'neural_engine'],
  city_arena: ['district_arena', 'city_arena', 'the_arena'],
  city_commerce: ['district_commerce', 'city_commerce', 'commerce_district'],
  city_data: ['district_data', 'city_data', 'data_realm'],
  city_broadcast: ['district_broadcast', 'city_broadcast', 'broadcast_tower'],

  // === Community Plaza (NEW) ===
  community_plaza: ['community_plaza', 'community_background'],
  community_arena: ['community_arena', 'battle_arena'],
  community_stage: ['community_stage', 'premiere_stage'],
  community_leaderboard: ['community_leaderboard'],
  community_network: ['community_network', 'connection_web'],

  // === Services District (NEW) ===
  services_lobby: ['services_lobby', 'services_background'],
  services_mixing: ['services_mixing', 'mixing_studio'],
  services_mastering: ['services_mastering', 'mastering_suite'],
  services_ai: ['services_ai', 'ai_mastering'],
  services_distribution: ['services_distribution', 'distribution_hub'],

  // === Studio Environments (NEW) ===
  studio_hallway_base: ['studio_hallway_base'],
  studio_hallway_active: ['studio_hallway_active'],
  studio_session_room: ['studio_session_room'],
};
```

---

### Phase 2: Add Fallback System

When no database asset exists for a section, fall back to static imports:

```typescript
// Fallback map for when no dynamic asset exists
const STATIC_FALLBACKS: Record<string, string> = {
  city_gates: '/src/assets/city-gates.jpg',
  city_tower: '/src/assets/district-tower.jpg',
  city_studio: '/src/assets/district-rsd.jpg',
  // ... etc
};

// Enhanced getter with fallback
const getImageUrl = (section: SectionKey, fallback?: string): string => {
  const dynamicUrl = getAssetForSection(section)?.public_url;
  return dynamicUrl || fallback || STATIC_FALLBACKS[section] || '';
};
```

---

### Phase 3: Add Real-Time Subscription

Enable live updates when admins change assets:

```typescript
useEffect(() => {
  // Subscribe to real-time changes
  const channel = supabase
    .channel('dynamic-assets')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'brand_assets',
        filter: 'is_active=eq.true'
      },
      () => {
        // Refetch on any change
        fetchAssets();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

---

### Phase 4: Create Convenience Hooks

For clean imports in page components:

```typescript
// src/hooks/useCityAssets.ts
export const useCityAssets = () => {
  const { getImageUrl, isLoading } = useDynamicAssets();
  
  return {
    isLoading,
    gates: getImageUrl('city_gates'),
    tower: getImageUrl('city_tower'),
    studio: getImageUrl('city_studio'),
    creator: getImageUrl('city_creator'),
    neural: getImageUrl('city_neural'),
    arena: getImageUrl('city_arena'),
    commerce: getImageUrl('city_commerce'),
    data: getImageUrl('city_data'),
    broadcast: getImageUrl('city_broadcast'),
  };
};

// src/hooks/useCommunityAssets.ts
export const useCommunityAssets = () => {
  const { getImageUrl, isLoading } = useDynamicAssets();
  
  return {
    isLoading,
    plaza: getImageUrl('community_plaza'),
    arena: getImageUrl('community_arena'),
    stage: getImageUrl('community_stage'),
  };
};

// src/hooks/useServicesAssets.ts
export const useServicesAssets = () => {
  const { getImageUrl, isLoading } = useDynamicAssets();
  
  return {
    isLoading,
    lobby: getImageUrl('services_lobby'),
    mixing: getImageUrl('services_mixing'),
    mastering: getImageUrl('services_mastering'),
    ai: getImageUrl('services_ai'),
    distribution: getImageUrl('services_distribution'),
  };
};
```

---

### Phase 5: Update DistrictPortal for Dynamic Assets

Refactor `DistrictPortal` to use dynamic assets with static fallbacks:

```typescript
// Before: Hardcoded imports
import districtTower from '@/assets/district-tower.jpg';
export const DISTRICT_PORTALS = {
  tower: { image: districtTower, glowColor: '262 83% 58%' },
};

// After: Dynamic with fallback
const { getImageUrl } = useDynamicAssets();
const portal = {
  image: getImageUrl(`city_${districtId}`, STATIC_FALLBACKS[districtId]),
  glowColor: DISTRICT_GLOW_COLORS[districtId],
};
```

---

### Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/useDynamicAssets.ts` | Universal dynamic asset hook (replaces/extends useDynamicLandingAssets) |
| `src/hooks/useCityAssets.ts` | Convenience wrapper for city district assets |
| `src/hooks/useCommunityAssets.ts` | Convenience wrapper for community assets |
| `src/hooks/useServicesAssets.ts` | Convenience wrapper for services assets |

### Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useDynamicLandingAssets.ts` | Re-export from new hook for backward compatibility |
| `src/components/ui/DistrictPortal.tsx` | Use dynamic assets with fallback |
| `src/pages/city/CityGates.tsx` | Use useCityAssets hook |
| `src/pages/Community.tsx` | Use useCommunityAssets hook |
| `src/pages/Services.tsx` | Use useServicesAssets hook |

---

### Database: New Asset Contexts

Add new context prefixes to `asset_contexts` table for completeness:

| context_prefix | name | icon |
|----------------|------|------|
| `city_` | City Districts | building |
| `services_` | Services District | sliders |
| `district_` | District Backgrounds | map |

---

### Technical Details

**Type Definitions:**

```typescript
export type PageContext = 
  | 'landing' 
  | 'prime' 
  | 'city' 
  | 'community' 
  | 'services' 
  | 'studio' 
  | 'hallway';

export type SectionKey = 
  // Landing
  | 'hero_background' | 'hero_prime' 
  | 'community_artists' | 'community_engineers'
  | 'journey_transformation' | 'future_ownership'
  // Prime phases
  | 'prime_drop' | 'prime_spark' | 'prime_community' 
  | 'prime_collaboration' | 'prime_network' | 'prime_place' | 'prime_invitation'
  // City districts
  | 'city_gates' | 'city_tower' | 'city_studio' | 'city_creator' 
  | 'city_neural' | 'city_arena' | 'city_commerce' | 'city_data' | 'city_broadcast'
  // Community
  | 'community_plaza' | 'community_arena' | 'community_stage' 
  | 'community_leaderboard' | 'community_network'
  // Services
  | 'services_lobby' | 'services_mixing' | 'services_mastering' 
  | 'services_ai' | 'services_distribution'
  // Studio
  | 'studio_hallway_base' | 'studio_hallway_active' | 'studio_session_room';
```

**Query Optimization:**

The hook uses a single query with OR filters to fetch all page-relevant assets in one call, caching locally and refreshing via realtime subscription. This prevents N+1 query patterns while keeping the UI responsive.

---

### Success Criteria

After implementation:

- Admins can upload new district/community/services backgrounds via Dream Engine
- Assets appear automatically in the UI without code changes
- Real-time updates when assets are changed
- Static fallbacks ensure no broken images during transition
- Type-safe section keys prevent typos
- Backward compatibility maintained for existing `useDynamicLandingAssets` consumers

---

### Admin Workflow (Post-Implementation)

1. **Open Dream Engine** → Select context (e.g., "City Districts")
2. **Generate/upload image** → Tagged with `city_gates`, `city_tower`, etc.
3. **Set active** → Image immediately appears on live site
4. **No code deploy required**

This transforms imagery management from "developer task" to "admin task" — exactly what the MixxClub doctrine demands.

