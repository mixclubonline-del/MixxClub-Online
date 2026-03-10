

# Immersive CTA Portal Scene — Pick Your Path

## Concept

Replace the current flat colored cards with an immersive "warehouse portal" scene. The generated CTA background image already shows four glowing doorways in a dark warehouse — we lean into that by making each doorway a clickable hotspot overlaid on the image, with animated fog drifting across the scene and a colored glow pulse on hover.

## What changes

### 1. Animated fog layer (CSS-only)
Add 2-3 semi-transparent fog/smoke divs that drift horizontally using CSS `@keyframes`, layered between the background image and the interactive content. No canvas, no JS — just `translateX` animation on blurred white gradients at low opacity.

### 2. Replace colored cards with transparent portal hotspots
Instead of four solid gradient rectangles, render four transparent clickable zones positioned over the doorway areas of the background image. Each zone:
- Is a tall `Link` with a subtle colored border glow matching its role color
- On hover: intensifies the glow (box-shadow pulse), scales slightly, and shows a label + role description
- Default state: just the role name floating at the bottom of each portal area

### 3. Layout
- 4 columns on desktop, 2x2 grid on mobile
- Each portal is `aspect-[2/3]` with a glassmorphic/transparent background (`bg-white/5 backdrop-blur-sm`)
- Colored glow ring on hover (`shadow-[0_0_30px_var(--color)]`)

### 4. Fog keyframes in `tailwind.config.ts`
```
fogDrift: "0%: translateX(-100%), 100%: translateX(100%)"
fogDriftReverse: "0%: translateX(100%), 100%: translateX(-100%)"
```

## Files modified
- `src/components/creatives/scenes/PickPathScene.tsx` — full rewrite with fog + portal hotspots
- `tailwind.config.ts` — add `fogDrift` keyframe + animation

## No other changes needed
The `SceneBackground` component already renders the warehouse/portals background image. The fog and interactive portals layer on top.

