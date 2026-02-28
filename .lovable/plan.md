

# Promo Funnel: `/go` -- Cinematic Media-First Experience

A fullscreen, swipeable promo funnel at `/go` that uses **real images and video backgrounds** from the existing `brand_assets` system instead of animated icons or SVG waveforms. Every scene is a full-bleed visual moment.

---

## The 5 Scenes (Media-First)

Each scene is a fullscreen viewport with a **real image or video background**, overlaid text, and a progress bar (5 dots, IG-story style). Auto-advances every 8 seconds or on swipe/tap. Mobile-first, vertical orientation.

### Scene 1: "The Problem" (0-8s)
- **Background**: `demo_phase_problem` image from `brand_assets` (already exists -- shows the struggle)
- Overlay text fades in: **"87% of independent artists never get their music professionally mixed."**
- Subtle Ken Burns zoom effect on the background image
- Mixxclub logo watermark at bottom

### Scene 2: "The Answer" (8-16s)
- **Background**: `demo_phase_discovery` image (shows the discovery/revelation moment)
- Text: **"Mixxclub connects you with real engineers who mix your sound. For real."**
- 3 short text labels slide in over the image: "Upload" / "Get Mixed" / "Release" -- plain white text on dark overlay, no icons

### Scene 3: "The Transformation" (16-28s)
- **Background**: `demo_phase_transformation` image (the before/after visual)
- Instead of a waveform component, the image itself tells the story
- Animated counter stats overlay: **"10,000+ Projects" / "500+ Engineers" / "98% Satisfaction"**
- A short testimonial quote in a glass card at bottom

### Scene 4: "The Culture" (28-40s)
- **Background**: `demo_phase_tribe` image (community/people visual)
- Text: **"Whether you make beats, mix tracks, or just love music -- there's a place for you."**
- 4 role labels pulse in: Artist / Producer / Engineer / Fan -- text-only, floating over the image

### Scene 5: "The Move" (40s+)
- **Background**: `demo_phase_invitation` image (the CTA/invitation visual)
- **"Your sound. Elevated."** large headline
- Inline signup form: role-select buttons + OAuth (Google/Apple) + email/password
- "Sign up in 10 seconds" micro-copy
- After signup: confetti + redirect to onboarding

---

## Asset Loading Strategy

The funnel uses a new `usePromoAssets` hook that:
1. Queries `brand_assets` for `asset_context` matching `demo_phase_%` and `promo_%`
2. Falls back to the existing demo phase images (already in the database)
3. Supports future video assets -- if an asset's `public_url` ends in `.mp4`/`.webm`, it renders as a `<video>` background instead of `<img>`
4. Admin can swap any scene's background by uploading a new asset with the matching `asset_context` (e.g., `promo_hook`, `promo_answer`, etc.) -- no code change needed

### Asset Context Mapping

| Scene | Primary context | Fallback context |
|---|---|---|
| Hook | `promo_hook` | `demo_phase_problem` |
| Answer | `promo_answer` | `demo_phase_discovery` |
| Transformation | `promo_proof` | `demo_phase_transformation` |
| Culture | `promo_culture` | `demo_phase_tribe` |
| CTA | `promo_cta` | `demo_phase_invitation` |

This means the funnel works immediately with existing assets, and can be upgraded to custom promo-specific imagery or video later.

---

## Technical Architecture

### New Files

| File | Purpose |
|---|---|
| `src/config/routes.ts` | Add `PROMO_FUNNEL: '/go'` constant |
| `src/routes/publicRoutes.tsx` | Add `/go` route |
| `src/pages/PromoFunnel.tsx` | Page wrapper with social-optimized Helmet SEO meta tags |
| `src/components/promo/PromoFunnelController.tsx` | Scene state machine: auto-advance timer, swipe/tap detection, progress dots |
| `src/components/promo/scenes/HookScene.tsx` | Scene 1 -- image bg + stat text |
| `src/components/promo/scenes/AnswerScene.tsx` | Scene 2 -- image bg + 3-step text |
| `src/components/promo/scenes/ProofScene.tsx` | Scene 3 -- image bg + animated counters |
| `src/components/promo/scenes/CultureScene.tsx` | Scene 4 -- image bg + role labels |
| `src/components/promo/scenes/SignupScene.tsx` | Scene 5 -- image bg + inline auth form |
| `src/hooks/usePromoAssets.ts` | Fetches promo/demo_phase assets from brand_assets, detects video vs image |

### Funnel Tracking

Extend `useFunnelTracking.ts`:
- Add `'promo'` to the `FunnelSource` type
- Add new steps: `'scene_2'`, `'scene_3'`, `'scene_4'`, `'signup_started'`, `'signup_completed'`
- Capture UTM params from URL on `'landed'` step

### Signup Flow

Scene 5 reuses the existing OAuth + email/password auth pattern from QuickStart:
- Role selection (4 buttons: Artist / Producer / Engineer / Fan)
- Google + Apple OAuth buttons
- Email/password form as fallback
- On success: confetti burst via `canvas-confetti`, then redirect to role-specific onboarding

### Social Sharing Meta

The page includes OG tags optimized for all distribution channels:
- `og:title`: "Mixxclub -- Your Sound. Elevated."
- `og:description`: "Professional mixing and mastering for independent artists. Join the culture."
- `og:image`: Uses the first promo asset URL (or demo_phase_problem as default)
- `og:url`: `https://mixxclub.lovable.app/go`
- Twitter card: `summary_large_image`

---

## Visual Design

- **No navigation chrome** -- pure immersive, no header/footer
- **Full-bleed images** -- `object-cover` filling the entire viewport
- **Dark gradient overlay** -- `bg-gradient-to-t from-black/80 via-black/40 to-transparent` for text readability
- **Typography**: Bold, large, uppercase headings -- hip-hop poster energy
- **Ken Burns effect**: Slow CSS `scale` animation on background images for cinematic motion
- **Reduced motion**: Respects `prefers-reduced-motion` -- disables auto-advance and animations
- **Progress dots**: 5 small circles at bottom, current scene filled, others outlined

---

## Estimated Size

~700 lines of new code across 10 files. No new dependencies. No schema changes. Reuses existing auth, tracking, and asset infrastructure.

