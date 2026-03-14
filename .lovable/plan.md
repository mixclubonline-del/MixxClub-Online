

# Double-Door Hallway Refinements

## What You're Seeing
The new **StudioHallwayV2** is live via the A/B wrapper (`StudioHallwayAB`). The double-door design with split "MIXX | CLUB" branding is currently being served to 50% of traffic. The doors have:
- **Left door (orange)**: Routes to `/home?path=artist` with Mic icon and "Record · Collaborate · Release" tagline
- **Right door (cyan)**: Routes to `/home?path=engineer` with Headphones icon and "Mix · Master · Build Your Roster" tagline
- Hover reveals labels and intensifies ambient glows
- Conversion tracking logs `door_click_artist` / `door_click_engineer` events

## Potential Next Steps

### Option 1 — Dynamic Background Transitions
**What**: Wire the V2 variant to use `useDynamicHallwayAssets` to pull different background images based on collaboration activity (base vs. active state).

**Why**: Currently V2 uses a static `hallway-double-door-base.jpg`. The hook already exists to query `brand_assets` for `studio_hallway_base` and `studio_hallway_active` contexts. This would let you A/B test whether showing dynamic visual feedback (hallway changes when sessions are live) improves conversion.

**How**:
1. Update `StudioHallwayV2` to import and call `useDynamicHallwayAssets`
2. Replace the static `hallwayDoubleDoor` import with dynamic URL from `getBackgroundUrl(hasActiveSessions)`
3. Add conditional rendering for video backgrounds (check `isVideo()` and render `<video>` instead of `<img>`)
4. Test with a second generated image for the "active" state (e.g., neon glowing brighter, more saturated colors)

### Option 2 — Add Third Door for "Producers"
**What**: Expand the two-door layout to three doors with a center "Producer" path glowing gold/amber.

**Why**: If your platform serves producers as a distinct role, giving them their own entrance reinforces the segmentation and could improve path clarity.

**How**:
1. Generate a third door concept image (or regenerate the hallway with three doors)
2. Add a center door zone to `StudioHallwayV2` between the existing Artist/Engineer zones
3. Route to `/home?path=producer` with relevant icon (e.g., Sliders or Disc3)
4. Update conversion tracking to log `door_click_producer`

### Option 3 — Improve Door Positioning Precision
**What**: The current door zones use `max-w-[280px]` flex boxes positioned via a centered container. If the background image doors don't perfectly align with the hover zones, the experience feels off.

**Why**: Environmental branding works best when interactive zones match visual cues exactly.

**How**:
1. Take a screenshot of the preview at desktop resolution
2. Measure exact pixel positions of the doors in `hallway-double-door-base.jpg`
3. Convert to percentage-based absolute positioning (e.g., `left: 30%`, `width: 18%`)
4. Replace the flex layout with absolutely positioned zones that overlay the exact door positions

### Option 4 — Animate Door Opening on Hover
**What**: When hovering a door, add a subtle "door crack" visual effect — a vertical sliver of light growing from the edge.

**Why**: Reinforces the metaphor that the door is reacting to your presence and about to open.

**How**:
1. Add a pseudo-element (`::before`) to each door button
2. Position it along the inner edge (left edge for left door, right edge for right door)
3. Animate `scaleX` from 0 to 1 on hover, with a bright gradient fill
4. Pair with a soft sound effect (door creak) if audio is enabled

### Option 5 — Wire Conversion Data to A/B Dashboard
**What**: Build a minimal admin dashboard that shows impression/conversion stats for the A/B test.

**Why**: Currently `useABVariant` logs to `funnel_events`, but there's no UI to review which variant is performing better. You need to query the database manually.

**How**:
1. Create `/admin/ab-tests` route (protected by admin role check)
2. Query `funnel_events` grouped by `step_data->'test_name'` and `step_data->'variant'`
3. Calculate conversion rate: `conversions / impressions`
4. Display in a table with "Declare Winner" button that updates the A/B wrapper to serve 100% winning variant
5. Optionally add a chart showing conversion trend over time

### Option 6 — Test Door Click Sounds
**What**: Add subtle audio feedback when hovering/clicking doors (e.g., low hum on hover, door unlatch on click).

**Why**: Environmental cues like sound deepen immersion and can improve perceived quality.

**How**:
1. Source or generate two short audio files (`door-hover.mp3`, `door-click.mp3`)
2. Preload via `useEffect` on mount
3. Play on hover/click using `new Audio().play()` gated by user interaction (browser autoplay policy)
4. Ensure audio respects a global mute toggle if one exists

### Option 7 — Add "Skip to Demo" Shortcut
**What**: While the doors are a narrative choice, some users just want to explore the demo. Add a subtle skip link below the CTA.

**Why**: Reduces friction for users who already understand the value prop or who don't identify strongly with either path yet.

**How**:
1. Below the "Enter the Club" CTA, add a small text link: "Not sure? Explore the demo first →"
2. Route to `/home` or `/demo` depending on your preferred demo entry point
3. Track as `skip_door_choice` conversion event

## Recommended Sequence
If you want to **maximize the double-door concept**, I'd suggest:
1. **Option 3** first (fix door alignment if needed) — ensures the UX is tight before adding complexity
2. **Option 1** (dynamic backgrounds) — tests whether environmental feedback improves conversion
3. **Option 5** (A/B dashboard) — gives you data to decide if V2 should become the default

If you want to **expand the concept**, go with:
1. **Option 2** (three doors) — requires regenerating the background but expands role segmentation
2. **Option 4** (door opening animation) — adds polish without changing the architecture

