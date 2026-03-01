

# Promo Funnel v3: Add Interactive AI Mastering Demo Scene

Insert a new **"Try It"** scene between Proof (scene 3) and Culture (scene 4) that lets anonymous visitors upload a track and experience the AI mastering engine live -- before they even sign up. This is the hook that turns passive scrollers into active users.

---

## The New Scene: "Try It Now"

A fullscreen scene with the promo background asset, overlaid with a compact, mobile-optimized mastering widget. The flow:

1. **Headline**: "Don't take our word for it. Hear it yourself."
2. **Upload zone**: Drag-drop or tap-to-browse for audio files (WAV, MP3, FLAC -- 10MB max)
3. **Genre preset selector**: Hip Hop, Rock, Electronic, Pop, Jazz, Classical (pill badges)
4. **"Master My Track" button**: Calls the existing `advanced-mastering` edge function (no auth required)
5. **Processing state**: Animated progress bar with "AI is mastering your track..." copy
6. **Results**: Before/After playback with LUFS comparison, improvement tags, and a CTA: "Want unlimited mastering? Sign up below." that auto-advances to the signup scene.

This reuses the existing `advanced-mastering` edge function as-is -- it already works without authentication, uses Auphonic for real mastering, and returns before/after audio with analysis data.

---

## Technical Changes

### New File: `src/components/promo/scenes/TryItScene.tsx`

A self-contained scene component (~200 lines) that:
- Renders `SceneBackground` with a new `promo_tryit` / `demo_phase_transformation` asset
- Contains a compact file upload zone (styled for dark/immersive context)
- Genre preset badges (reuses the same list from `QuickMasteringTool`)
- Calls `supabase.functions.invoke('advanced-mastering', ...)` directly
- Shows processing state with a real progress indicator
- On completion, displays:
  - Two audio players (original vs mastered) using native `<audio>` elements
  - LUFS improvement stat (e.g., "-20 LUFS -> -14 LUFS")
  - Improvement tags from the API response
  - A "Sign up for unlimited mastering" CTA button that advances to the next scene
- Handles 429/402 errors gracefully with user-friendly messages
- Tracks `'demo_mastering_started'` and `'demo_mastering_completed'` via the funnel tracking system

### Modified: `src/hooks/usePromoAssets.ts`

- Add `'tryit'` to the `PromoSceneId` type
- Add mapping: `tryit: { primary: 'promo_tryit', fallback: 'demo_phase_transformation' }`
- Add default asset entry for `tryit`

### Modified: `src/components/promo/PromoFunnelController.tsx`

- Import `TryItScene`
- Update `SCENES` array: `['hook', 'answer', 'proof', 'tryit', 'culture', 'cta']` (6 scenes now)
- Add `tryit` to `sceneComponents` map
- Auto-advance is **paused** on the `tryit` scene (user-driven interaction required)

### Modified: `src/hooks/useFunnelTracking.ts`

- Add `'demo_mastering_started'` and `'demo_mastering_completed'` to the `FunnelStep` type
- Add `'scene_tryit'` for scene transition tracking

---

## UX Details

- **Auto-advance pauses** on this scene. The timer stops so users have time to upload and listen. They advance manually via swipe, the CTA, or the progress dots.
- **Mobile-first layout**: Upload zone is large tap target. Genre pills wrap naturally. Audio players are stacked vertically.
- **No account required**: The `advanced-mastering` function doesn't check auth. Anonymous users get the full experience.
- **File size limit**: 10MB enforced client-side before upload, matching the edge function's own validation.
- **Fallback if mastering fails**: Show AI analysis text only (the function still returns analysis even without mastering success) with a "Sign up to try again with priority processing" CTA.

---

## Why This Works as a Hook

1. **Tangible value before signup** -- visitors hear their own music professionally mastered. That's not a promise, it's proof.
2. **Existing infrastructure** -- the `advanced-mastering` edge function, Auphonic integration, and storage buckets are already live. Zero new backend work.
3. **Conversion catalyst** -- after hearing the difference, the signup scene (next) becomes a natural next step. The sales proposal from the API even recommends a package.
4. **Viral potential** -- "Upload your track and hear it mastered in 60 seconds" is a shareable hook for social media.

---

## Summary

| Item | Detail |
|------|--------|
| New files | 1 (`TryItScene.tsx`) |
| Modified files | 3 (`PromoFunnelController.tsx`, `usePromoAssets.ts`, `useFunnelTracking.ts`) |
| New dependencies | 0 |
| New edge functions | 0 |
| Schema changes | 0 |
| Estimated lines | ~250 new |

