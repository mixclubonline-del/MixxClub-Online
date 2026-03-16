

# Navigation, Flow, Standards & Imagery Audit

## Findings

### A. Navigation & Flow Issues

**1. Hallway CTA misalignment on mobile (390px)**
The "Enter the Club" and "Sign In" buttons are pushed off-screen by the onboarding tour overlay. The `left-[calc(50%-35px)]` offset was tuned for the desktop background door handles but breaks on small screens where the doors are barely visible.

**2. Onboarding tour fires on public pages**
The "Explore Mixxclub" product tour ("The Front Door" step) appears on the `/for-artists` and `/for-engineers` pages, overlapping the hero content and stats. It should only trigger on authenticated app screens, not public marketing pages.

**3. Hallway doors not interactive on mobile**
The door hitbox zones (`fullscreen && ...`) only render when `fullscreen` is true. On mobile (phone deviceType), the hallway is rendered inside the SceneFlow at full height, but the door zones use absolute percentage positioning that doesn't align with the smaller viewport. The "Choose your door" hint text appears but the doors themselves have hitboxes sized for 1200px+ widths.

**4. Duplicate Sign In CTAs**
The hallway shows two Sign In buttons simultaneously: one in the main CTA stack (line 494-510) and another "Been here before?" pill at the bottom (line 558-569). These compete for attention and create visual clutter.

**5. SceneFlow nav pill overlaps hallway**
The floating `mg-panel` pill ("Quick Start · Join Free") at the top center sits above the hallway but isn't styled to complement the club entrance aesthetic. On mobile it can overlap the neon signage.

### B. Standards Compliance

**6. Missing `alt` text on marketing page images**
Both `/for-artists` and `/for-engineers` use `ShowcaseFeature` and `ShowcaseJourney` components with image props but the `LandingPortal` background uses `alt=""`. While decorative backgrounds get empty alt, the journey step images and feature showcase images should have descriptive alt text for accessibility.

**7. `Skip to content` link exists** — confirmed in `App.tsx`. Good.

**8. ARIA labels on doors** — confirmed. Both door buttons have proper `aria-label` attributes. Good.

**9. BackButton parent routes** — `/for-artists` and `/for-engineers` map to `/home` as parent. This should map to `/` (the hallway) since that's where unauthenticated visitors came from.

### C. Imagery & Hip-Hop Cultural Alignment

**10. Artist page background** — Graffiti mural + neon waveform overlay. Strong urban aesthetic. Passes the culture test.

**11. Engineer page background** — Professional mixing console/studio. Shows real studio environment. Culturally neutral but appropriate for the professional engineer audience.

**12. Promo asset filenames** suggest AI-generated imagery (e.g., `artist-upload-cloud.jpg`, `artist-ai-analysis.jpg`). These should be verified to contain culturally authentic representation per the 50%+ African American, 25%+ Hispanic/Latino standard. Cannot verify image contents from code alone — requires visual review.

**13. Hallway background** — The `hallway-double-door-base.jpg` shows a cinematic club entrance with "MIXX | CLUB" branding, neon infinity symbol, and brushed chrome doors. Strong immersive aesthetic that matches the club concept.

---

## Plan

### Fix 1: Mobile-responsive hallway CTAs
- Remove the `left-[calc(50%-35px)]` offset from the CTA container
- Center CTAs with `left-1/2 -translate-x-1/2` (standard centering)
- Make door zones responsive: on mobile, convert to two side-by-side tap buttons below the image instead of overlay hitboxes

### Fix 2: Suppress onboarding tour on public pages
- In `AppOnboarding.tsx` (or wherever the product tour mounts), add a route guard that skips rendering on public routes (`/`, `/for-artists`, `/for-engineers`, `/for-producers`, `/for-fans`, `/auth`, etc.)

### Fix 3: Mobile door interaction
- For `deviceType === 'phone'`, render the Artist/Engineer doors as visible, tappable glassmorphic cards below the hallway image (similar to PlazaGateway's two-card layout) instead of invisible overlay hitboxes

### Fix 4: Consolidate duplicate Sign In
- Remove the "Been here before?" duplicate pill at the bottom
- Keep only the main Sign In button in the CTA stack

### Fix 5: BackButton parent route fix
- Change `/for-artists` and `/for-engineers` parent routes from `/home` to `/` so the Back button returns to the hallway

### Fix 6: Add descriptive alt text
- Update `ShowcaseJourney` and `ShowcaseFeature` components to pass meaningful `alt` props to their images based on the step/feature title

### Fix 7: SceneFlow nav pill styling
- On mobile, collapse the nav pill to just the "Quick Start" link with smaller padding to avoid overlapping the neon signage

---

## Files to Modify
- `src/components/scene/StudioHallwayV2.tsx` — Fixes 1, 3, 4
- `src/components/mobile/AppOnboarding.tsx` — Fix 2
- `src/components/navigation/BackButton.tsx` — Fix 5
- `src/components/landing/ShowcaseJourney.tsx` — Fix 6
- `src/components/services/ShowcaseFeature.tsx` — Fix 6
- `src/components/home/SceneFlow.tsx` — Fix 7

## No database changes needed

