

## Video-Enhanced Visual Doctrine Upgrade

### Overview

This plan upgrades the video generation infrastructure to use Google VEO via the Gemini API (using your existing `GOOGLE_AI_API_KEY`), then applies the 2026 Visual Doctrine across the Demo and Club Scene with both static imagery and generated video support. Replicate stays as the primary synchronous fallback; VEO becomes the async premium path for cinematic background loops.

---

### Part 1: Fix Google VEO Integration (Edge Function Upgrade)

The current `generate-video-gemini` function is broken -- it calls `gemini-2.0-flash-exp:generateContent` which does not support video output. The correct approach uses `veo-2.0-generate-001:predictLongRunning` on the Gemini API endpoint, which is async (returns an operation ID, requires polling).

**1.1 -- Rewrite `generate-video-gemini` edge function**

Replace the broken Gemini Flash call with the correct VEO REST API:
- Endpoint: `POST https://generativelanguage.googleapis.com/v1beta/models/veo-2.0-generate-001:predictLongRunning`
- Header: `x-goog-api-key: $GOOGLE_AI_API_KEY`
- Body: `{ "instances": [{ "prompt": "..." }], "parameters": { "aspectRatio": "16:9", "sampleCount": 1 } }`
- Returns: `{ "name": "operations/..." }` (operation ID for polling)

This function now returns the operation name immediately for the caller to poll.

**1.2 -- Create `check-video-status` edge function**

New function that polls a VEO operation:
- Endpoint: `GET https://generativelanguage.googleapis.com/v1beta/{operationName}?key=$GOOGLE_AI_API_KEY`
- Returns operation status: `{ "done": true/false, "response": { "generateVideoResponse": { "generatedSamples": [{ "video": { "uri": "..." } }] } } }`
- When done, downloads the video from the returned URI, uploads to Lovable Cloud storage, and returns the permanent public URL.

**1.3 -- Update `dream-engine` video path**

Modify the `generateVideo` function in the dream-engine:
- **Primary path (fast):** Keep Replicate `minimax/video-01` for synchronous generation (returns URL in ~30-60s)
- **Premium path (high quality):** Add VEO option. When `options.model === 'veo'` is specified, call `generate-video-gemini` and return the operation ID instead of a URL. The frontend handles polling via `check-video-status`.
- The response shape changes: `{ ok: true, asset: { type: 'video', operationId: '...' } }` for async, or the existing `{ asset: { url: '...' } }` for sync.

---

### Part 2: Frontend Video Polling Support

**2.1 -- Add async generation to `useDreamEngine` hook**

Extend the hook to handle VEO's async workflow:
- New state: `pendingOperation` (stores operation ID while polling)
- New method: `pollOperation(operationId)` -- calls `check-video-status` every 10 seconds until done
- On completion, the result URL is set like any other generation
- Loading state shows "Generating video..." with a progress indicator

**2.2 -- Extend `brand_assets` video support**

The `brand_assets` table already has `asset_type: 'video'` and `duration_seconds` columns. No schema changes needed. The `useDynamicAssets` and `useDemoPhaseAssets` hooks already return URLs regardless of type -- the component just needs to know whether to render `<video>` or `<img>`.

---

### Part 3: Demo Experience Visual Doctrine Pass

All components get upgraded with static fallback imagery from `src/assets/promo/`. Video backgrounds layer on top when generated via Dream Engine and saved to `brand_assets` with the appropriate `demo_phase_*` context.

**3.1 -- PhaseBackground.tsx -- Static Fallback Images**

Add imported fallback images so no phase ever shows gradient-only:

| Phase | Fallback Image |
|-------|---------------|
| problem | `before-after-master.jpg` |
| discovery | `collaboration-hero.jpg` |
| connection | `mixing-collaboration.jpg` |
| transformation | `mastering-before-after.jpg` |
| tribe | `webrtc-collaboration.jpg` |
| invitation | `studio-console-hero.jpg` |

When a `brand_asset` with `asset_context = 'demo_phase_problem'` exists and `asset_type = 'video'`, the component renders a `<video>` tag instead of `<img>`. The existing `useDemoPhaseAssets` hook is extended to also return the asset type.

**3.2 -- ProblemReveal.tsx -- Cinematic Background**

- Import `daw-interface-hero.jpg` as a positioned background image behind the stat reveal
- Wrap the stat grid in a glassmorphic card: `bg-background/60 backdrop-blur-md border border-border/20 rounded-2xl`
- The "87%" headline and stat cards overlay on the darkened image
- Image has a gradient overlay for readability: `bg-gradient-to-b from-background/80 via-background/40 to-background/80`

**3.3 -- TransformationVisual.tsx -- Split Imagery**

- Import `before-after-master.jpg` and `mixing-realtime-feedback.jpg`
- "Before" panel gets the raw/unfinished image as a subtle background behind the waveform bars
- "After" panel gets the polished studio image
- Both panels get glassmorphic treatment so waveforms remain the primary visual
- The images add context ("this is what the before/after looks like in a real studio")

**3.4 -- CollaborationJourney.tsx -- Image Thumbnails**

- Replace the solid-gradient icon squares in the 3-column grid with actual images:
  - Artist column: `artist-upload-cloud.jpg` as the card header image
  - Prime AI column: keep `PrimeCharacter` component (already has avatar imagery)
  - Engineer column: `engineer-workspace-hero.jpg` as the card header image
- Each card gets a 120px tall image area above the existing content
- The journey timeline stays as-is (icons are appropriate for the step indicators)

**3.5 -- CommunityShowcase.tsx -- Atmospheric Backdrop**

- Import `mixing-collaboration.jpg` as a full-bleed background behind the floating avatar network
- Apply a darkening overlay (`bg-background/70`) so the floating cards remain prominent
- The SVG connection lines and floating cards render on top
- On mobile, the background image is more heavily faded to preserve card readability

---

### Part 4: Club Scene Room Visual Doctrine Pass

**4.1 -- ListeningRoom.tsx -- Hero Image + Track Card Imagery**

- Add `mixing-console-close.jpg` as a full-width hero image between the header and track cards
- Image gets a 200px height with object-cover, rounded corners, and a bottom gradient fade
- Track cards get a subtle background image strip (5 different studio shots, one per card)
- Waveform bars render on top of the image strip with semi-transparent background

**4.2 -- VaultRoom.tsx -- Atmospheric Vault Image**

- Import `studio-console-hero.jpg` as a dimmed full-bleed background behind the vault
- Replace the existing `bg-gradient-to-b from-primary/5` with the image + overlay combo
- The vault door glow effect stays overlaid on the image
- The tier timeline and milestone card get glassmorphic backgrounds (`backdrop-blur-md`)

**4.3 -- GreenRoom.tsx -- Portal Card Images**

- Import `portal-artist.jpg` and `portal-engineer.jpg` (already exist in `src/assets/promo/`)
- Each role portal card gets a 160px tall image area showing a real artist or engineer at work
- The character avatar overlaps the image bottom edge (positioned absolutely, offset -24px)
- The quote and online count remain below

**4.4 -- ControlRoom.tsx -- Image+Content Alternating Layout**

Convert from 4-column icon grid to alternating image+text pairs:
- Step 1 "Create": Image left (`artist-upload-cloud.jpg`), content right
- Step 2 "Match": Content left, image right (`ai-neural-network.jpg`)
- Step 3 "Collaborate": Image left (`mixing-realtime-feedback.jpg`), content right
- Step 4 "Release": Content left, image right (`artist-delivery.jpg`)
- Each pair is a flex row that reverses on alternating items
- On mobile, stacks vertically (image on top, content below)
- Stats row gets a glassmorphic container

**4.5 -- VIPBooth.tsx -- Hero Lifestyle Image**

- Import `engineer-workspace-hero.jpg` as a hero banner above the pricing cards
- Banner is 240px tall with a gradient fade at the bottom
- The "Most Popular" card gets a subtle background image (studio session)
- Pricing cards get `backdrop-blur-sm` for a glassmorphic effect against the atmospheric background

**4.6 -- StageDoor.tsx -- Full-Bleed Cinematic Background**

- Import `studio-console-hero.jpg` as a full-bleed background
- The MIXXCLUB logo and CTA overlay on top with a frosted container
- The milestone progress bar gets a glassmorphic card treatment
- When a video asset exists at context `stage_door_bg`, render `<video>` instead of `<img>` for a living, breathing final scene

---

### Part 5: Video Context Registration

Add new `asset_contexts` entries so the Dream Engine can generate and assign videos directly to demo/club backgrounds:

| Context | Description |
|---------|-------------|
| `demo_phase_problem` | Problem phase cinematic background |
| `demo_phase_discovery` | Discovery phase background |
| `demo_phase_connection` | Connection phase background |
| `demo_phase_transformation` | Transformation phase background |
| `demo_phase_tribe` | Tribe/community phase background |
| `demo_phase_invitation` | Invitation/CTA phase background |
| `club_listening_hero` | Listening Room hero visual |
| `club_vault_bg` | Vault Room atmospheric background |
| `club_stage_bg` | Stage Door cinematic background |

These register in the Dream Engine admin so admins can generate and assign both images and videos to each slot.

---

### Files to Create

| File | Purpose |
|------|---------|
| `supabase/functions/check-video-status/index.ts` | VEO operation polling + video download |

### Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/generate-video-gemini/index.ts` | Rewrite to use VEO `predictLongRunning` endpoint |
| `supabase/functions/dream-engine/index.ts` | Add VEO premium path alongside Replicate |
| `src/hooks/useDreamEngine.ts` | Add async polling support for VEO operations |
| `src/hooks/useDemoPhaseAssets.ts` | Return `asset_type` alongside URL for video detection |
| `src/components/demo/PhaseBackground.tsx` | Add static fallback images, video rendering support |
| `src/components/demo/ProblemReveal.tsx` | Add cinematic background image + glassmorphic stats |
| `src/components/demo/TransformationVisual.tsx` | Add split imagery behind waveform panels |
| `src/components/demo/CollaborationJourney.tsx` | Add image thumbnails to column cards |
| `src/components/demo/CommunityShowcase.tsx` | Add atmospheric backdrop image |
| `src/components/home/rooms/ListeningRoom.tsx` | Add hero image, image backgrounds on cards |
| `src/components/home/rooms/VaultRoom.tsx` | Add atmospheric background image |
| `src/components/home/rooms/GreenRoom.tsx` | Add portal card images |
| `src/components/home/rooms/ControlRoom.tsx` | Convert to alternating image+content layout |
| `src/components/home/rooms/VIPBooth.tsx` | Add hero lifestyle image |
| `src/components/home/rooms/StageDoor.tsx` | Add full-bleed cinematic background |

### Database Migration

Insert new `asset_contexts` rows for the demo/club video slots so they appear in the Dream Engine admin panel.

---

### Execution Order

1. **VEO infrastructure** -- Fix `generate-video-gemini`, create `check-video-status`, update `dream-engine` video path
2. **Frontend polling** -- Extend `useDreamEngine` with async operation support
3. **PhaseBackground** -- Static fallbacks + video rendering (highest visual impact)
4. **Demo components** -- ProblemReveal, TransformationVisual, CollaborationJourney, CommunityShowcase
5. **Club rooms** -- ListeningRoom, VaultRoom, GreenRoom, ControlRoom, VIPBooth, StageDoor
6. **Context registration** -- Database migration for new asset_contexts
7. **Verification** -- End-to-end test: generate a video via Dream Engine, assign to a phase, verify it plays

