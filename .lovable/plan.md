

# Next Phases: Fix Black Screen + Dream Engine Assets

## Current Issue
The `/for-creatives` page is stuck on the app's global loading screen. The scene controller and components are structurally sound, but the **fallback images** created as `.jpg` files in `src/assets/ecosystem/` are likely empty placeholder files (0 bytes or invalid). The `useEcosystemAssets` hook queries `brand_assets` for `ecosystem_*` contexts, finds nothing in the database, falls back to these broken static imports, and the page renders black backgrounds behind dark overlays — appearing as a black screen.

## Phase 1: Fix the Black Screen (Immediate)

**Problem**: Static fallback images are empty/broken files. No `brand_assets` rows exist for `ecosystem_*` contexts.

**Fix**: Replace the broken static fallback approach with inline gradient backgrounds per scene so the page works immediately without any image assets:
- Each scene component gets a role-colored gradient fallback (purple for artist, cyan for engineer, amber for producer, pink for fan, mixed for connection/ecosystem/cta)
- `EcosystemSceneBackground` gets a `fallbackGradient` prop — when the asset URL fails to load or is a broken import, show the gradient instead
- This makes the page functional and visually on-brand right now

**Files**: `EcosystemSceneBackground.tsx`, all 7 scene components (minor prop additions)

## Phase 2: Generate Real Dream Engine Assets

Once the page is functional with gradient fallbacks, use the Dream Engine to generate the 7 cinematic images and store them in `brand_assets` with the correct `ecosystem_*` contexts. The `useEcosystemAssets` hook will automatically pick them up — no code changes needed.

**Assets to generate**:
1. `ecosystem_artist_pain` — bedroom studio, unreleased tracks, purple/violet mood
2. `ecosystem_engineer_pain` — empty professional studio, cyan/teal mood
3. `ecosystem_producer_pain` — type beat grind, amber/gold mood
4. `ecosystem_fan_disconnect` — scrolling phone, rose/pink mood
5. `ecosystem_connection` — people connecting, multi-color
6. `ecosystem_cycle` — living ecosystem, flowing energy
7. `ecosystem_cta` — four glowing portals

## Phase 3: Polish & Enhancements

After assets are live:
- Scene transitions (crossfade between scenes instead of hard cut)
- Haptic feedback on mobile swipe (Capacitor Haptics is already installed)
- Sound design hooks (optional ambient audio per scene)
- Analytics tracking for scene completion rates

## Execution Order

Phase 1 first (gradient fallbacks) → page works immediately. Phase 2 (Dream Engine images) → page becomes cinematic. Phase 3 → refinement.

**Total Phase 1: ~8 files touched. No database changes.**

