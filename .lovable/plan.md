

# Sprint 2 Plan: OG Images, A/B Framework, AI Mastering v2, Stem Separation UI

Sprint 2 covers tasks **8A.3**, **8A.4**, **8C.1**, and **8C.2** from the Phase 8 roadmap.

---

## Task 1: Dynamic OG Image Generator (8A.3)

**Goal**: Edge function that generates social share images for beat listings, engineer profiles, and battle results.

**Approach**:
- Create `supabase/functions/generate-og-image/index.ts`
- Use Lovable AI (gemini-2.5-flash) to generate structured SVG markup based on entity data (beat title + producer name + waveform gradient, or engineer name + rating + specialties)
- Accept query params: `type` (beat | engineer | battle), `id` (entity UUID)
- Fetch entity data from DB, generate an SVG card (1200×630), return as `image/svg+xml`
- Update `SEOHead.tsx` to accept dynamic `ogImage` URLs pointing to this function for relevant pages (beat detail, engineer profile, battle result)

**Key files**:
- New: `supabase/functions/generate-og-image/index.ts`
- Edit: `src/components/SEOHead.tsx` (helper to build OG image URL)
- Edit: `supabase/config.toml` (register function, `verify_jwt = false`)

---

## Task 2: A/B Testing Framework (8A.4)

**Goal**: Replace the stubbed `useABTest` hook with a real lightweight variant system backed by `funnel_events`.

**Approach**:
- Create `src/hooks/useABVariant.ts` — deterministic variant assignment using hash of `sessionId + testName`, stored in `localStorage` for consistency
- Variants: `'control' | 'variant_a' | 'variant_b'`
- Auto-logs impressions to `funnel_events` with `funnel_source = 'ab_test'` and `step_data = { test_name, variant }`
- Conversion tracking via `trackConversion(eventName)` writing to same table
- Create `src/components/marketing/ABProvider.tsx` — context wrapper that manages active tests and exposes `useABVariant`
- DB migration: add `ab_tests` table (test_name, variants JSONB, is_active, traffic_split, created_at) with admin-only RLS for configuration
- Admin can toggle tests via `platform_config` or directly in the table

**Key files**:
- New: `src/hooks/useABVariant.ts`, `src/components/marketing/ABProvider.tsx`
- Migration: `ab_tests` table
- Delete/replace: `src/hooks/useABTest.tsx` (stub)

---

## Task 3: AI Mastering Pipeline v2 (8C.1)

**Goal**: Upgrade the mastering experience from chat-only to a structured pipeline: Upload → Analyze → Select Preset → Preview → Download.

**Approach**:
- Create `src/components/studio/MasteringPipeline.tsx` — multi-step wizard using GlassPanel design tokens
  - Step 1: Upload audio (drag-and-drop, max 10MB)
  - Step 2: AI Analysis — calls `advanced-mastering` edge function with `analyzeOnly: true` flag; displays LUFS, dynamic range, frequency balance radar chart (Recharts)
  - Step 3: Preset selection — genre-based presets (Hip-Hop, Pop, Rock, Electronic, Podcast) with parameter previews
  - Step 4: Processing — calls `advanced-mastering` with selected preset; shows progress
  - Step 5: Results — before/after comparison, download button
- Edit `supabase/functions/advanced-mastering/index.ts` to support `analyzeOnly` mode that returns analysis without processing, and a `preset` field that maps to Auphonic preset configurations
- Wire into MasteringShowcase page alongside existing MasteringChatbot

**Key files**:
- New: `src/components/studio/MasteringPipeline.tsx`
- Edit: `supabase/functions/advanced-mastering/index.ts` (add analyzeOnly + preset modes)
- Edit: `src/pages/MasteringShowcase.tsx` (add pipeline section)

---

## Task 4: Stem Separation UI (8C.2)

**Goal**: Standalone stem separator page/component using GlassPanel tokens, wired to the existing `stem-separation` edge function.

**Approach**:
- Create `src/components/studio/StemSeparator.tsx` — GlassPanel-based UI distinct from the existing DAW-embedded `StemSeparation.tsx`
  - Upload zone (react-dropzone) with format validation (MP3/WAV/FLAC, max 25MB)
  - Stem selection checkboxes (vocals, drums, bass, other) with visual icons
  - Model selector (htdemucs default, htdemucs_ft for higher quality)
  - Processing progress with animated status
  - Results panel: play individual stems inline (WaveSurfer mini players), download individual or ZIP (JSZip)
  - Upload audio to Supabase storage first to get a public URL, then call `stem-separation` edge function
- Add route or integrate into existing Studio/Services section

**Key files**:
- New: `src/components/studio/StemSeparator.tsx`
- Edit: relevant page to mount the component (e.g., services or studio route)

---

## Technical Notes

- All new UI components use `GlassPanel`, `HubHeader`, `StaggeredList` design tokens
- Mobile-first responsive at 375px
- OG image function uses `verify_jwt = false` since crawlers cannot authenticate
- A/B variant assignment is deterministic (no flicker between page loads)
- Mastering pipeline reuses the existing Auphonic integration in `advanced-mastering`
- Stem separator reuses the existing Replicate integration in `stem-separation`

