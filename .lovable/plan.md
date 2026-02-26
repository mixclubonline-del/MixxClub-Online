

# Add Features & Pricing Horizontal Chapters

## What Changes

Extend the horizontal storybook zone with two new chapters inserted between **Club** and **Choose Path**, making the final chapter order:

1. **Club** (existing) -- Explore the platform
2. **Features** (new) -- Showcase key platform capabilities
3. **Pricing** (new) -- Subscription tiers and service packages
4. **Choose Path** (existing) -- Sign up / conversion CTA

## New Files

### 1. `src/components/storybook/chapters/FeaturesChapter.tsx`
A full-viewport chapter showcasing platform features in a visually rich layout:
- Hero section with a bold headline ("What You Get") and subtitle
- 3-column grid of feature cards using glassmorphic styling (consistent with existing `FeatureGlassCards` patterns)
- Features pulled from core value props: AI-Powered Analysis, Real-Time Collaboration, Pro Engineer Matching, Secure Cloud Storage, Smart Contracts, Community & Events
- Each card has an icon, title, and description
- Subtle scroll-triggered animations within the chapter panel (since each chapter allows internal vertical scroll)
- A "See Pricing" CTA button at the bottom that calls `useChapterStore().next()` to advance to the Pricing chapter

### 2. `src/components/storybook/chapters/PricingChapter.tsx`
A full-viewport chapter displaying pricing tiers:
- Hero section: "Simple, Transparent Pricing"
- Reuses the existing `PricingTierCards` component (Starter / Professional / Premium per-track pricing)
- Reuses the existing `BulkPricingSection` component (EP/Album volume discounts)
- A "Get Started" CTA button that advances to the Choose Path chapter
- All content fits within a scrollable chapter panel, no external page navigation needed

## Modified Files

### 3. `src/stores/chapterStore.ts`
Update `DEFAULT_CHAPTERS` to include four entries:
```
club -> Explore / The Club
features -> Discover / Features
pricing -> Plans / Pricing
choose -> Join / Choose Your Path
```

### 4. `src/components/home/SceneFlow.tsx`
Add the two new chapter slots to the `ChapterShell` in the INFO scene:
- Import `FeaturesChapter` and `PricingChapter` (lazy-loaded)
- Insert them as slots between Club and Choose Path
- No changes to the vertical Hallway/Demo flow

## Technical Details

- Both new chapters are full-height (`min-h-[100svh]`) with internal `overflow-y-auto` so content can scroll within the chapter if it exceeds viewport height
- The `ChapterNav` dots, `ChapterProgress` bar, and `useChapterNavigation` hook automatically adapt because they read from the chapter store -- no changes needed to those components
- Features and Pricing chapters are lazy-loaded via `React.lazy()` to keep the initial bundle lean
- Deep-linking works automatically: `?scene=info&chapter=2` would land on Pricing
- GPU-accelerated transitions remain unchanged -- adding more slots to the flex strip just extends the `translateX` range

## Files Unchanged
- `ChapterShell.tsx` -- works with any number of slots
- `ChapterNav.tsx` -- reads chapter count from store, auto-adapts dots
- `ChapterProgress.tsx` -- auto-adapts segment count
- `useChapterNavigation.ts` -- bounds-checked against store length
- `PricingTierCards.tsx`, `BulkPricingSection.tsx` -- reused as-is inside PricingChapter

