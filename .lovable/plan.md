

# Double-Door Hallway with A/B Test Preservation

## Overview
Generate a new hallway background based on Concept 4 (Living Brand) + the user's reference image, featuring two doors with split "MIXX | CLUB" brushed chrome lettering. Keep the original hallway as `control`, new version as `variant_a`. Wire up via the existing `useABVariant` hook.

## Step 1 — Generate New Background Image
Use the `generate-promo-image` edge function to create the new hallway background:
- Dark luxury hallway, POV walking toward two large double doors at center-back
- Left door has "MIXX" in brushed chrome lettering, right door has "CLUB"
- Infinity symbol as an architectural LED ceiling light (pink-to-cyan gradient)
- Left door edge-lit warm orange (Artists), right door edge-lit cool cyan (Engineers)
- "FROM BEDROOM TO BILLBOARD" subtly etched above the doors in frosted glass
- Polished dark floor reflecting the ceiling neon
- Stored as `hallway-double-door-base.jpg`

## Step 2 — Create New Component: `StudioHallwayV2.tsx`
A new variant of the hallway with the double-door concept:

### Background
- Uses the new generated image instead of `studio-hallway-base.jpg`
- Same gradient overlays and ambient breathing as V1

### Remove from V1
- Marquee brand block (logo is now baked into the background image doors)
- Floor logo inlay (no longer needed)

### Add: Interactive Door Zones
Two hoverable/clickable zones positioned over the left and right doors:
- **Left door** — warm orange hover glow, "Artists" label reveals on hover, routes to artist onboarding
- **Right door** — cool cyan hover glow, "Engineers" label reveals on hover, routes to engineer onboarding
- Hover effect: subtle brightness increase + ambient glow intensification
- Each door zone is a `motion.div` with `whileHover` scale/glow animation

### Keep
- Depth layer indicator, connection indicator, studio hotspots
- Social proof whisper, sign-in button, keyboard hint
- All existing hooks and logic

### Layout
```text
┌─────────────────────────────────────┐
│      (infinity LED in ceiling)      │
│   "FROM BEDROOM TO BILLBOARD"       │  ← baked into image
│                                     │
│   ┌──────────┐  ┌──────────┐       │
│   │          │  │          │       │
│   │  MIXX    │  │   CLUB   │       │  ← brushed chrome in image
│   │          │  │          │       │
│   │ (orange) │  │  (cyan)  │       │  ← interactive hover zones
│   └──────────┘  └──────────┘       │
│                                     │
│    [ Choose Your Door ]             │  ← CTA area
│     "X creators have walked..."     │
└─────────────────────────────────────┘
```

## Step 3 — A/B Wrapper Component
Create `StudioHallwayAB.tsx` that wraps the decision:

```typescript
const { variant, trackConversion } = useABVariant('hallway_entrance', [
  { name: 'control', weight: 50 },
  { name: 'variant_a', weight: 50 },
]);

// control → original StudioHallway
// variant_a → StudioHallwayV2 (double doors)
```

Pass `trackConversion` down so door clicks and CTA clicks log conversions.

## Step 4 — Update References
- Update wherever `StudioHallway` is imported (likely the scene routing or `MixClubHome`) to use `StudioHallwayAB` instead
- Both variants receive the same props (`fullscreen`, `onEnter`)

## Files Changed
1. **Generate**: New background image → `src/assets/hallway-double-door-base.jpg`
2. **Create**: `src/components/scene/StudioHallwayV2.tsx` — double-door variant
3. **Create**: `src/components/scene/StudioHallwayAB.tsx` — A/B wrapper
4. **Update**: Parent component that renders `StudioHallway` → swap to `StudioHallwayAB`

