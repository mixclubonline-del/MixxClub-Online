
# Phase 5: The MixxClub Community -- Beyond Framer Motion

## The Directive

Framer Motion has served its purpose, but it's becoming a crutch. For the Community Showcase section, we elevate to a hybrid approach:

1. **Dream-Generated Images** -- AI-generated hero imagery for each community pillar, persisted via the existing Dream Engine pipeline
2. **Native CSS Animations + Intersection Observer** -- Replace `motion.div` / `whileInView` with performant CSS `@keyframes` and a lightweight `useInView` hook using the native `IntersectionObserver` API
3. **Canvas-Based Particle Systems** -- For the section background, use a raw `<canvas>` particle system (like `AudioVisualizer.tsx` already does) instead of Framer Motion's animated divs
4. **React Three Fiber for the MixxCoinz Hero** -- The MixxCoinz economy pillar gets a 3D rotating coin scene using the existing R3F infrastructure (`@react-three/fiber` + `drei`)

No Framer Motion imports anywhere in the new component.

---

## New Files

### 1. `src/hooks/useInView.ts` -- Lightweight Intersection Observer Hook

A zero-dependency hook that replaces `motion.div whileInView`:
- Uses native `IntersectionObserver` API
- Returns a ref and `isInView` boolean
- Supports `once`, `threshold`, and `rootMargin` options
- Components apply CSS classes conditionally: `className={isInView ? 'animate-reveal' : 'opacity-0'}`

### 2. `src/components/journey/CommunityShowcase.tsx` -- The Main Section

Six community pillars rendered as alternating showcase cards (matching `ShowcaseJourney` visual rhythm but without Framer Motion):

| # | Pillar | Title | Key Visual |
|---|--------|-------|------------|
| 1 | MixxCoinz Economy | "The Currency of the Culture" | R3F 3D coin scene (earned + purchased) |
| 2 | Unlockable System | "Unlock Your Level" | Dream-generated image (progression matrix) |
| 3 | Battles and Competitions | "Prove Your Sound" | Dream-generated image (battle arena) |
| 4 | Merch and Storefront | "Sell What You Create" | Dream-generated image (storefront) |
| 5 | Learning and Growth | "Level Up Your Craft" | Dream-generated image (masterclass) |
| 6 | Live Sessions | "Watch It Happen Live" | Dream-generated image (live session) |

**Animation Strategy (no Framer Motion):**
- Each card uses `useInView` + CSS transitions (`transform`, `opacity`) with staggered `transition-delay`
- Image hover zoom uses pure CSS `group-hover:scale-105` (already used in ShowcaseJourney)
- Stats overlay slide-up on hover uses pure CSS `translate-y` transitions (already established pattern)

**MixxCoinz Pillar Special Treatment:**
- Instead of a static image, renders a `<Canvas>` scene with two rotating MixxCoins using `useFrame` from R3F
- Earned coin orbits left, Purchased coin orbits right, with particle dust between them
- This replaces the MixxCoin3D component's Framer Motion approach with actual GPU-accelerated 3D

### 3. `src/components/journey/CommunityCanvasBackground.tsx` -- Section Background

A full-width `<canvas>` element behind the community section:
- Renders floating particles in all four role colors (purple, cyan, amber, pink)
- Particles drift slowly and connect with faint lines when near each other (constellation effect)
- Uses `requestAnimationFrame` -- zero library dependencies
- Follows the exact pattern established in `AudioVisualizer.tsx`

### 4. `src/components/journey/CoinScene3D.tsx` -- R3F MixxCoinz Hero

A small React Three Fiber scene specifically for the MixxCoinz pillar:
- Two textured planes (coin images) that slowly rotate on Y-axis using `useFrame`
- Additive blending particle dust between them
- Ambient glow via point lights in purple (earned) and gold (purchased)
- Falls back to the static `MixxCoin` component if WebGL is unavailable

---

## Image Generation Strategy

For the five image-based pillars, we generate via the existing Dream Engine pipeline (`supabase.functions.invoke('dream-engine')`). The component will:

1. First check for existing `brand_assets` with matching `asset_context` keys (e.g., `community_unlockables`, `community_battles`, etc.)
2. If no asset exists, display a fallback from `src/assets/promo/` (mapped below)
3. New asset contexts will be registered so Prime can dream them from the Dream Chamber

**Asset Context Mapping:**

| Pillar | asset_context Key | Fallback Image |
|--------|------------------|----------------|
| Unlockables | `community_unlockables` | `mixxtech-city.png` |
| Battles | `community_battles` | `mixing-collaboration.jpg` |
| Merch | `community_merch` | `enterprise-whitelabel.jpg` |
| Learning | `community_learning` | `engineer-growth-coaching.jpg` |
| Live Sessions | `community_sessions` | `webrtc-collaboration.jpg` |

### 5. `src/hooks/useCommunityShowcaseAssets.ts` -- Asset Hook

Convenience hook wrapping `useDynamicAssets` for the community section:
- Provides typed access to each pillar's image URL
- Handles fallback chain: Dream asset -> promo fallback
- Extends the existing `SectionKey` type in `useDynamicAssets.ts` with the new community keys

---

## Modified Files

### `src/hooks/useDynamicAssets.ts`
- Add 5 new `SectionKey` entries: `community_unlockables`, `community_battles`, `community_merch`, `community_learning`, `community_sessions`
- Add corresponding entries to `SECTION_ASSET_MAP` and `STATIC_FALLBACKS`

### `src/pages/HowItWorks.tsx`
- Import and place `<CommunityShowcase />` between `<EcosystemFlow />` and `<JourneyDestination />`
- Single line addition

---

## What We Are NOT Using

- Framer Motion (`motion.div`, `whileInView`, `AnimatePresence`) -- replaced entirely
- Any animation library -- pure CSS + IntersectionObserver + Canvas + R3F

## What We ARE Using

- **CSS `@keyframes` + `transition`** -- for reveal animations, hover effects, stagger
- **IntersectionObserver API** -- for scroll-triggered reveals (native browser API)
- **Canvas 2D API** -- for particle background (existing pattern from AudioVisualizer)
- **React Three Fiber** -- for the MixxCoinz 3D scene (existing dependency, GPU-accelerated)
- **Dream Engine** -- for AI-generated imagery (existing pipeline)

---

## Content for Each Pillar

### 1. MixxCoinz Economy
- **Stats**: Earn Rate: "Every Action" | Cash Out: "200:1 USD" | Types: "Earned + Purchased"
- **Badges**: Dual Currency, Instant Payouts, Ownership Model, Escrow System
- **Visual**: 3D R3F coin scene

### 2. Unlockable System
- **Stats**: Paths: "5 Roles" | Tiers: "5 Per Path" | Goals: "Community + Personal"
- **Badges**: Progression Matrix, Collective Goals, Role Rewards, Vault Room

### 3. Battles and Competitions
- **Stats**: Formats: "1v1 + Open" | Voting: "Community" | Prizes: "MixxCoinz + Status"
- **Badges**: Live Battles, Remix Challenges, Leaderboards, Judge and Earn

### 4. Merch and Storefront
- **Stats**: Products: "Unlimited" | Payment: "USD + MixxCoinz" | Commission: "0% Fee"
- **Badges**: Beat Store, Preset Packs, Physical Merch, Digital Goods

### 5. Learning and Growth
- **Stats**: Courses: "Growing" | Instructors: "Verified Pros" | Earn: "MixxCoinz/Course"
- **Badges**: Masterclasses, Certifications, Mixing Breakdowns, Community Teachers

### 6. Live Sessions and Events
- **Stats**: Latency: "<50ms" | Capacity: "Unlimited" | Events: "Daily"
- **Badges**: Real-Time Collab, Listening Parties, Album Premieres, AMA Events
