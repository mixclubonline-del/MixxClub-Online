

# Dream the Community Pillar Images

## What We're Building

A one-shot batch image generator that creates AI artwork for the five community pillars (Unlockables, Battles, Merch, Learning, Live Sessions) using the existing Dream Engine pipeline. Each image gets saved to `brand_assets` with the correct `asset_context` key and set as active -- so the CommunityShowcase component picks them up automatically via `useDynamicAssets`.

The MixxCoinz pillar already has the R3F 3D coin scene, so it does not need an image.

---

## Step 1: Register the Five New Asset Contexts

The `asset_contexts` table needs entries for the community showcase pillars so the validation trigger (`validate_asset_context`) allows saving. We insert five new rows:

| context_prefix | name | description | icon |
|---|---|---|---|
| `community_unlockables` | Community - Unlockables | Progression matrix and tier system visuals | unlock |
| `community_battles` | Community - Battles | Battle arena and competition visuals | swords |
| `community_merch` | Community - Merch | Storefront and merchandise visuals | shopping-bag |
| `community_learning` | Community - Learning | Masterclass and education visuals | graduation-cap |
| `community_sessions` | Community - Sessions | Live session and real-time collaboration visuals | radio |

This is a database migration (INSERT into `asset_contexts`).

## Step 2: Build the Batch Dreamer Component

Create `src/components/journey/CommunityPillarDreamer.tsx` -- an admin-facing batch generation tool (similar to the existing `DemoPhaseGenerator`).

**How it works:**
1. Renders a card for each of the five pillars with a curated prompt
2. A "Dream All" button fires all five generations sequentially via `useDreamEngine.generate()` with `save: true` and `makeActive: true`
3. Each pillar card shows status: pending / generating / success / error
4. On success, the `useDynamicAssets` hook automatically picks up the new active assets via its real-time subscription
5. The CommunityShowcase component renders the new images immediately -- no code changes needed there

**Curated Prompts (the creative DNA):**

| Pillar | Context Key | Prompt |
|---|---|---|
| Unlockables | `community_unlockables` | "A futuristic progression matrix floating in a dark space, five glowing pathways radiating from a central hub, each path a different color (purple, cyan, amber, pink, green), tiered milestone markers along each path like checkpoints in a video game, holographic achievement badges orbiting the structure, dark background with subtle grid lines, music industry aesthetic meets sci-fi RPG progression system" |
| Battles | `community_battles` | "Two music producers facing off in a neon-lit arena, turntables and mixing consoles as weapons, crowd of spectators visible in silhouette behind glowing barriers, scoreboard floating above showing versus scores, purple and red lighting clash in the center, hip-hop battle culture meets esports arena, dramatic spotlight, smoke effects, urban energy" |
| Merch | `community_merch` | "A sleek digital storefront floating in space, holographic product displays showing vinyl records, beat packs, branded streetwear, preset bundles, and sample pack cubes, neon price tags in MixxCoinz currency, shopping cart with glowing items, modern e-commerce meets music culture aesthetic, clean dark UI with accent lighting" |
| Learning | `community_learning` | "A masterclass in session inside a futuristic studio classroom, a veteran engineer at a massive mixing console teaching a small group, holographic waveforms and EQ curves floating in the air as visual aids, certification badges displayed on the wall, warm amber and cyan lighting, knowledge transfer moment, mentorship atmosphere, professional music education" |
| Sessions | `community_sessions` | "A live collaborative music session viewed through a floating holographic screen, multiple participants visible in small video panels around a central waveform visualization, real-time chat messages scrolling, listening party atmosphere with glowing audio meters, purple and pink neon accents, community gathering around music being created, intimate yet connected feeling" |

## Step 3: Wire Into the Dream Chamber Page

Add the `CommunityPillarDreamer` as an optional section in the existing Dream Engine page (`src/pages/DreamEngine.tsx`), gated behind admin check. This keeps it accessible from the Dream Chamber where Prime already guides generation.

Alternatively, it can be a standalone route `/admin/dream-community` for one-time use.

## Step 4: No Changes to CommunityShowcase

The existing `CommunityShowcase.tsx` already calls `useDynamicAssets().getImageUrl()` with keys like `community_arena`, `community_stage`, etc. We update it to use the correct keys matching the new contexts:

- `community_unlockables` (currently using `community_arena` as fallback)
- `community_battles` (currently using `community_stage` as fallback)
- `community_merch` (currently using `community_network` as fallback)
- `community_learning` (currently using `services_mixing` as fallback)
- `community_sessions` (currently using `services_ai` as fallback)

This is a minor fix to ensure the correct `SectionKey` values are used so dreamed images map directly.

---

## Technical Summary

| File | Action |
|---|---|
| Database migration | INSERT 5 rows into `asset_contexts` |
| `src/components/journey/CommunityPillarDreamer.tsx` | **New** -- batch image generation UI |
| `src/pages/DreamEngine.tsx` | Add CommunityPillarDreamer section |
| `src/components/journey/CommunityShowcase.tsx` | Fix `SectionKey` references to match new contexts |

**No new dependencies.** Uses existing `useDreamEngine` hook, existing `dream-engine` edge function, existing `brand_assets` table, existing `useDynamicAssets` real-time subscription.

**Flow:**
1. Prime opens Dream Chamber (or admin route)
2. Clicks "Dream Community Pillars"
3. Five images generate sequentially via Lovable AI (Gemini 3 Pro Image)
4. Each saves to `brand-assets` storage bucket and `brand_assets` table with correct `asset_context`
5. Real-time subscription fires in `useDynamicAssets`
6. CommunityShowcase renders dreamed images automatically
7. Fallback promo images still work if generation fails

