

# Phase 6: Unified CRM Navigation + AI Guide Integration

## Current State Analysis

The CRM system has strong foundations but fragmented implementations across the four roles:

### Navigation Gaps

| Component | Artist/Engineer | Producer | Fan |
|-----------|----------------|----------|-----|
| CRMPortal | Full 14-hub grid | Uses same portal, but wrong hubs | Uses same portal, but wrong hubs |
| Hub Definitions | 14 hubs hardcoded | 5 custom tabs | 5 custom tabs |
| Status Bar | Shows "Artist" or "Engineer" only | Shows correct role badge | Missing role-specific styling |
| AI Guide | ProactivePrimeBot (generic) | ProactivePrimeBot (generic) | ProactivePrimeBot (generic) |

### The Problem

1. **CRMHubGrid** has 14 hardcoded hubs that apply to Artist/Engineer but NOT Producer/Fan
2. **CRMStatusBar** only shows "Artist" or "Engineer" badge (line 78)
3. **ProactivePrimeBot** uses generic "Prime 4.0" branding instead of role-specific AI guides
4. The characters Jax, Rell, Tempo, and Nova exist in config but aren't surfaced in CRMs

---

## Implementation

### 1. Role-Specific Hub Definitions

Create hub configurations per role in `CRMHubGrid.tsx`:

```text
ROLE_HUB_DEFINITIONS = {
  artist: [
    dashboard, clients, matches, sessions, opportunities, 
    active-work, revenue, community, growth, messages, 
    earnings, music, store, profile
  ],
  engineer: [
    dashboard, clients, matches, sessions, opportunities, 
    active-work, revenue, community, growth, messages, 
    earnings, profile
  ],
  producer: [
    dashboard, catalog, sales, collabs, revenue, 
    community, profile
  ],
  fan: [
    feed, day1s, missions, wallet, curator
  ]
}
```

**Changes in CRMHubGrid.tsx:**
- Replace single `HUB_DEFINITIONS` array with `ROLE_HUB_DEFINITIONS` object
- Select hubs based on `userType` prop
- Add role-specific descriptions and icons

### 2. Fix CRMStatusBar Role Badge

Currently line 78 only handles artist/engineer:
```typescript
{userType === 'artist' ? 'Artist' : 'Engineer'}
```

Should become a proper lookup:
```typescript
const ROLE_LABELS = {
  artist: 'Artist',
  engineer: 'Engineer', 
  producer: 'Producer',
  fan: 'Fan'
};
// ...
{ROLE_LABELS[userType]}
```

### 3. Role-Specific AI Guide in ProactivePrimeBot

Replace generic "Prime 4.0" with the role-specific character:

| Role | Character | Avatar | Personality |
|------|-----------|--------|-------------|
| Artist | Jax | jax-portrait.png | "Your vision. Perfected." |
| Engineer | Rell | rell-portrait.png | "The craft speaks for itself." |
| Producer | Tempo | tempo-portrait.png | "The beat is the foundation." |
| Fan | Nova | nova-portrait.png | "You're in the right room." |

**Changes in ProactivePrimeBot.tsx:**
- Import `getCharacter` and `ENTRY_POINT_CHARACTERS` from config
- Replace hardcoded "Prime 4.0" with character name
- Use character's avatar image
- Style card with character's accent color
- Use character-specific quotes in nudges

### 4. Add Character Avatar to CRMStatusBar

Surface the AI guide visually next to the user's profile:

```text
┌─────────────────────────────────────────────────────┐
│  [Avatar] Your Name  [Jax] Artist                   │
│           Level 5 ████░░ 450 XP                     │
└─────────────────────────────────────────────────────┘
```

The small guide avatar indicates "Jax is your guide" for artists, etc.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/crm/CRMHubGrid.tsx` | Role-specific hub definitions |
| `src/components/crm/CRMStatusBar.tsx` | Fix role badge + add guide avatar |
| `src/components/crm/ai/ProactivePrimeBot.tsx` | Role-specific character integration |
| `src/components/crm/CRMPortal.tsx` | Pass character info to children (minor) |

---

## Technical Details

### CRMHubGrid Refactor

```text
const ROLE_HUB_DEFINITIONS: Record<string, typeof HUB_DEFINITIONS> = {
  artist: [
    { id: 'dashboard', label: 'Dashboard', icon: Home, description: 'Overview & momentum' },
    { id: 'clients', label: 'Clients', icon: Users, description: 'Contact management' },
    // ... 12 more artist hubs
  ],
  engineer: [
    { id: 'dashboard', label: 'Dashboard', icon: Home, description: 'Overview & momentum' },
    // ... 11 more engineer hubs
  ],
  producer: [
    { id: 'dashboard', label: 'Dashboard', icon: Home, description: 'Your beat empire' },
    { id: 'catalog', label: 'Catalog', icon: Disc3, description: 'Your beat library' },
    { id: 'sales', label: 'Sales', icon: ShoppingBag, description: 'Transaction history' },
    { id: 'collabs', label: 'Collabs', icon: Users, description: 'Artist connections' },
    { id: 'revenue', label: 'Revenue', icon: TrendingUp, description: 'Earnings analytics' },
    { id: 'community', label: 'Community', icon: Users, description: 'Producer network' },
    { id: 'profile', label: 'Brand Hub', icon: User, description: 'Your identity' },
  ],
  fan: [
    { id: 'feed', label: 'Feed', icon: Compass, description: 'Discover new music' },
    { id: 'day1s', label: 'Day 1s', icon: Star, description: 'Your early supports' },
    { id: 'missions', label: 'Missions', icon: Target, description: 'Earn MixxCoinz' },
    { id: 'wallet', label: 'Wallet', icon: Coins, description: 'Your rewards' },
    { id: 'curator', label: 'Curator', icon: Sparkles, description: 'Playlist power' },
  ],
};

// In component:
const hubs = ROLE_HUB_DEFINITIONS[userType] || ROLE_HUB_DEFINITIONS.artist;
```

### ProactivePrimeBot Character Integration

```text
import { getCharacter, ENTRY_POINT_CHARACTERS } from '@/config/characters';

// In component:
const characterId = ENTRY_POINT_CHARACTERS[userType];
const character = getCharacter(characterId);

// In header:
<div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent">
  <img src={character.avatarPath} alt={character.name} />
</div>
<p className="text-sm font-bold">{character.name}</p>
<p className="text-xs text-muted-foreground">{character.tagline}</p>
```

---

## User Experience After Implementation

### Artist CRM
- Jax appears as guide in ProactiveBot
- 14 hubs in grid (full creative suite)
- Green accent from Jax's config
- Jax's quotes in nudges

### Engineer CRM
- Rell appears as guide
- 12 hubs in grid (business-focused)
- Secondary accent from Rell's config
- Rell's quotes in nudges

### Producer CRM
- Tempo appears as guide
- 7 hubs in grid (catalog + sales focus)
- Gold accent from Tempo's config
- Tempo's quotes in nudges

### Fan Hub
- Nova appears as guide
- 5 hubs in grid (discovery + rewards)
- Pink/magenta accent from Nova's config
- Nova's quotes in nudges

---

## Acceptance Criteria

- [ ] Each role sees only their relevant hubs in CRMHubGrid
- [ ] CRMStatusBar shows correct role name for all 4 roles
- [ ] ProactivePrimeBot uses role-specific character (Jax/Rell/Tempo/Nova)
- [ ] Character avatar appears in the bot's header
- [ ] Character's accent color is reflected in the UI
- [ ] Producer CRM shows 7 hubs (not 14)
- [ ] Fan Hub shows 5 hubs (not 14)
- [ ] Character quotes appear in nudges and briefings

---

## Summary

This phase unifies the CRM navigation by:

1. **Contextualizing the hub grid** to each role's workflow
2. **Surfacing AI guides** (Jax/Rell/Tempo/Nova) visually in the experience
3. **Fixing status bar** to properly label all four roles
4. **Personalizing nudges** with character-specific quotes

The result: each role feels like a tailored product, not a one-size-fits-all dashboard.

