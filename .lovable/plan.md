
## Visual Doctrine Pass: Demo + Club Scene Implementation

This is the implementation phase for the approved visual doctrine upgrade. All 11 components get upgraded from text/icon-only to Showcase-First compliant using existing imagery from `src/assets/promo/` and `src/assets/`, plus video rendering support for database-driven assets.

---

### Batch 1: PhaseBackground + Demo Phase Assets Hook

**PhaseBackground.tsx** -- The highest-impact single file change. Currently falls back to gradient-only when no database asset exists. 

Changes:
- Import 6 static fallback images from `src/assets/promo/`:
  - `problem` -> `before-after-master.jpg`
  - `discovery` -> `collaboration-hero.jpg`  
  - `connection` -> `mixing-collaboration.jpg`
  - `transformation` -> `mastering-before-after.jpg`
  - `tribe` -> `webrtc-collaboration.jpg`
  - `invitation` -> `studio-console-hero.jpg`
- Update the render logic: database asset (image or video) takes priority, then static fallback image, then gradient as last resort
- Add `<video>` rendering path: when `getAssetTypeForPhase(phaseId) === 'video'`, render a `<video autoPlay muted loop playsInline>` tag instead of `<img>`
- Video gets the same opacity treatment (0.55) and cross-fade transition as images
- All existing gradient palettes remain as ultimate fallback
- Audio-reactive glow layer stays unchanged on top

---

### Batch 2: Demo Components (4 files)

**ProblemReveal.tsx**
- Import `daw-interface-hero.jpg` as a positioned absolute background behind the entire component
- Add a darkening gradient overlay: `bg-gradient-to-b from-background/80 via-background/40 to-background/80`
- Wrap the stats grid (4 cards) in a glassmorphic container: `bg-background/60 backdrop-blur-md border border-border/20 rounded-2xl p-6`
- The "87%" headline and subtext remain above the glassmorphic card
- Image uses `object-cover` with `loading="lazy"`

**TransformationVisual.tsx**
- Import `before-after-master.jpg` and `mixing-realtime-feedback.jpg`
- Add each image as a subtle background inside the respective Before/After panels
- Images sit behind the waveform bars with reduced opacity (0.15) and `object-cover`
- Each panel gets `overflow-hidden relative` so the image stays contained
- The glassmorphic treatment is already partially there (`bg-destructive/5`, `bg-emerald-500/5`) -- enhance with `backdrop-blur-sm`
- Waveform bars and LUFS meter render on top unchanged

**CollaborationJourney.tsx**
- Import `artist-upload-cloud.jpg` and `engineer-workspace-hero.jpg`
- Replace the gradient icon squares in the Artist column card (line 128-136) with a 120px tall image area using `artist-upload-cloud.jpg`, rounded-2xl with `object-cover`
- Replace the gradient icon square in the Engineer column card (line 217-225) with `engineer-workspace-hero.jpg`
- The Prime AI column keeps its existing `PrimeCharacter` component (already has avatar imagery)
- Each card header image gets a bottom gradient fade into the card content below

**CommunityShowcase.tsx**
- Import `mixing-collaboration.jpg` as a full-bleed background behind the floating avatar network
- Add as an absolute positioned image behind the SVG connection lines and floating cards
- Apply a heavy darkening overlay: `bg-background/70` so the floating glassmorphic cards stay prominent
- Image gets `object-cover` and reduced opacity (0.3)
- On mobile (`md:` breakpoint), increase overlay opacity to 0.85 for better card readability

---

### Batch 3: Club Scene Rooms (6 files)

**ListeningRoom.tsx**
- Import `mixing-console-close.jpg`
- Add a hero image between the header and track cards grid: 200px tall, full width, `rounded-2xl overflow-hidden` with a bottom gradient fade
- Each track card gets a subtle background atmosphere: add a shared `bg-muted/30` with a very faint image texture using a CSS pseudo-approach or a small inset image with 0.1 opacity
- The waveform bars and track info remain overlaid on top
- `loading="lazy"` on the hero image

**VaultRoom.tsx**
- Import `studio-console-hero.jpg`
- Replace the existing `bg-gradient-to-b from-primary/5 via-transparent to-primary/5` div (line 47) with the image as an absolute background
- Image gets `object-cover`, reduced opacity (0.2), and the existing glow orb stays on top
- The tier timeline and next milestone card get enhanced glassmorphic treatment: add `backdrop-blur-md` to the milestone card (line 150)
- The vault door glow effect (line 50-57) stays overlaid on the image

**GreenRoom.tsx**  
- Import `portal-artist.jpg` and `portal-engineer.jpg` from `src/assets/`
- Each role portal card gets a 160px tall image area at the top showing the respective portal image
- Image area uses `rounded-t-2xl overflow-hidden` with `object-cover`
- Add a gradient fade at the bottom of the image area that transitions into the card content
- The character avatar (line 101-111) gets repositioned to overlap the image bottom edge: `absolute -mt-8 ml-6` with a white/border ring
- Quote and online count remain below in the existing card body

**ControlRoom.tsx** -- Most significant restructure
- Import `artist-upload-cloud.jpg`, `ai-neural-network.jpg`, `mixing-realtime-feedback.jpg`, `artist-delivery.jpg`
- Convert from the current 4-column icon grid to alternating image+content flex rows:
  - Step 1 "Create": Image left, content right
  - Step 2 "Match": Content left, image right (flex-row-reverse)
  - Step 3 "Collaborate": Image left, content right
  - Step 4 "Release": Content left, image right (flex-row-reverse)
- Each row is `flex flex-col md:flex-row gap-8 items-center` with alternating items using `md:flex-row-reverse`
- Image side: `w-full md:w-1/2 aspect-[4/3] rounded-2xl overflow-hidden`
- Content side: `w-full md:w-1/2` with the existing step number, icon, title, description, and stat
- Stats row at the bottom gets a glassmorphic container: `bg-background/60 backdrop-blur-md rounded-2xl p-6`
- Remove the connector arrows (they made sense in horizontal layout but not in alternating)
- On mobile, stacks vertically: image on top, content below

**VIPBooth.tsx**
- Import `engineer-workspace-hero.jpg`
- Add as a hero banner between the header and pricing cards: 240px tall, full width, `rounded-2xl overflow-hidden`
- Bottom gradient fade from image into the pricing section
- The "Most Popular" card (index 1) gets enhanced with a subtle background image (`mixing-console-close.jpg` at 0.08 opacity) and `backdrop-blur-sm`
- Other pricing cards get `backdrop-blur-sm` for subtle glassmorphic effect
- `loading="lazy"` on hero image

**StageDoor.tsx**
- Import `studio-console-hero.jpg`
- Add as a full-bleed absolute positioned background behind the entire room
- Image gets `object-cover`, reduced opacity (0.25), and a heavy gradient overlay for text readability
- The MIXXCLUB logo and CTA section gets wrapped in a glassmorphic container: `bg-background/40 backdrop-blur-lg rounded-3xl p-12 border border-border/20`
- The milestone progress card gets `backdrop-blur-md` enhancement
- When a video asset is available from `brand_assets` with context `club_stage_bg`, render `<video>` instead of `<img>`
- Add the `useDynamicAssets` or direct query for `club_stage_bg` context

---

### Database Migration

Insert new `asset_context` reference rows so the Dream Engine admin recognizes these slots:

```text
INSERT INTO brand_assets (asset_name, asset_context, asset_type, is_active, public_url)
VALUES 
  ('Demo Phase: Problem', 'demo_phase_problem', 'image', false, ''),
  ('Demo Phase: Discovery', 'demo_phase_discovery', 'image', false, ''),
  ('Demo Phase: Connection', 'demo_phase_connection', 'image', false, ''),
  ('Demo Phase: Transformation', 'demo_phase_transformation', 'image', false, ''),
  ('Demo Phase: Tribe', 'demo_phase_tribe', 'image', false, ''),
  ('Demo Phase: Invitation', 'demo_phase_invitation', 'image', false, ''),
  ('Club: Listening Room Hero', 'club_listening_hero', 'image', false, ''),
  ('Club: Vault Background', 'club_vault_bg', 'image', false, ''),
  ('Club: Stage Door Background', 'club_stage_bg', 'image', false, '');
```

These are inactive placeholders -- admins can generate and assign real assets via the Dream Engine, which will then override the static fallbacks.

---

### Files Summary

| File | Change Type |
|------|------------|
| `src/components/demo/PhaseBackground.tsx` | Static fallback images + video rendering |
| `src/components/demo/ProblemReveal.tsx` | Background image + glassmorphic stats |
| `src/components/demo/TransformationVisual.tsx` | Split imagery behind waveform panels |
| `src/components/demo/CollaborationJourney.tsx` | Image thumbnails replacing icon squares |
| `src/components/demo/CommunityShowcase.tsx` | Atmospheric backdrop image |
| `src/components/home/rooms/ListeningRoom.tsx` | Hero image + card atmosphere |
| `src/components/home/rooms/VaultRoom.tsx` | Background image + glassmorphic cards |
| `src/components/home/rooms/GreenRoom.tsx` | Portal card images with avatar overlap |
| `src/components/home/rooms/ControlRoom.tsx` | Alternating image+content layout |
| `src/components/home/rooms/VIPBooth.tsx` | Hero banner + glassmorphic pricing |
| `src/components/home/rooms/StageDoor.tsx` | Full-bleed cinematic background |

---

### Execution Order

1. PhaseBackground.tsx (static fallbacks + video -- unlocks cinematic demo immediately)
2. ProblemReveal.tsx + TransformationVisual.tsx (the two most text-heavy demo phases)
3. CollaborationJourney.tsx + CommunityShowcase.tsx (complete demo visual pass)
4. ControlRoom.tsx (biggest Club Scene restructure -- alternating layout)
5. ListeningRoom.tsx + VaultRoom.tsx + GreenRoom.tsx (atmospheric upgrades)
6. VIPBooth.tsx + StageDoor.tsx (conversion rooms)
7. Database migration for asset context placeholders
