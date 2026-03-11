

# CRM Dashboard Polish — HubSkeleton, Producer Slideshow, Fan Lazy Loading

## Current Gaps

1. **Loading states**: All 3 CRMs (Artist, Producer, Engineer) use a raw CSS spinner for their initial loading screen instead of the `HubSkeleton` component. The `Suspense` fallbacks in Artist and Engineer CRMs also use inconsistent approaches.

2. **Producer slideshow/intro**: Artist CRM has `ArtistCRMSlideshow` + `ArtistAssistantIntro`. Engineer CRM has `EngineerCRMSlideshow` + `EngineerAssistantIntro`. Producer CRM has **neither** — no first-time onboarding experience at all.

3. **Fan Hub lazy loading**: All 9 fan hub components (`FanFeedHub`, `FanDay1sHub`, etc.) are eagerly imported at the top of `FanHub.tsx`. No code splitting, no `Suspense`, no `HubSkeleton` fallback.

---

## Changes

### 1. Replace CSS Spinners with HubSkeleton (3 files)

In `ArtistCRM.tsx`, `EngineerCRM.tsx`, and `ProducerCRM.tsx`, replace the `min-h-screen flex items-center` spinner block with a full-width `HubSkeleton variant="tabs"` wrapped in the CRM shell layout padding. This gives users a content-shaped skeleton instead of a centered spinner.

Also ensure all `<Suspense>` fallbacks in `renderContent()` use `<HubSkeleton variant="cards" />` consistently. Currently the lazy-loaded components lack explicit Suspense wrappers in the switch cases — wrap the entire `renderContent()` return in a single `<Suspense fallback={<HubSkeleton variant="cards" />}>`.

### 2. Create Producer Slideshow + Assistant Intro (2 new files)

**`src/components/crm/ProducerCRMSlideshow.tsx`** (~300 lines)
- Mirror `ArtistCRMSlideshow.tsx` structure: full-screen motion overlay, script segments, audio-reactive background, skip/continue buttons
- Producer-specific script: "Welcome to the lab — your beat empire starts here." → "Upload beats, set licenses, connect with artists" → "Track sales, splits, and royalties in real-time" → "Let's build your catalog"
- Amber/gold accent glow instead of purple

**`src/components/crm/ProducerAssistantIntro.tsx`** (~150 lines)
- Mirror `ArtistAssistantIntro.tsx`: Dialog with 4 feature cards
- Producer features: "Upload & Manage Beats" → catalog tab, "Find Artists" → matches tab, "Track Sales & Royalties" → sales tab, "24/7 Guidance" → chatbot
- Use Tempo character personality (from Character Voice Registry)

**Update `ProducerCRM.tsx`**:
- Add slideshow/intro state management (same pattern as Artist/Engineer)
- Check `localStorage` for `producer_crm_slideshow_seen_${user.id}`
- Show slideshow → then assistant intro → then dashboard

### 3. Fan Hub Lazy Loading (1 file)

**Update `FanHub.tsx`**:
- Convert all 9 eager imports to `lazy()` imports
- Import `Suspense` and `HubSkeleton`
- Wrap `renderContent()` return in `<Suspense fallback={<HubSkeleton variant="cards" />}>`
- Add `ErrorBoundary` wrapper around the CRMPortal

### Files Summary

| File | Action |
|------|--------|
| `src/components/crm/ProducerCRMSlideshow.tsx` | Create |
| `src/components/crm/ProducerAssistantIntro.tsx` | Create |
| `src/pages/ProducerCRM.tsx` | Edit — add slideshow/intro flow + HubSkeleton loading |
| `src/pages/ArtistCRM.tsx` | Edit — replace spinner with HubSkeleton + Suspense wrapper |
| `src/pages/EngineerCRM.tsx` | Edit — replace spinner with HubSkeleton + Suspense wrapper |
| `src/pages/FanHub.tsx` | Edit — lazy imports + Suspense + ErrorBoundary |

