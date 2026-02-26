
# Horizontal Storybook Navigation -- Prototype Plan

## The Vision

Replace the current vertical scroll paradigm with a **full-screen horizontal chapter system**. Every "page" becomes a **chapter** in a continuous horizontal strip. Navigation feels like flipping through a storybook or swiping through a premium deck -- think Apple keynote transitions meets Instagram Stories for a music platform.

This is a **prototype experiment** in your test environment. The live site stays untouched.

---

## Architecture

```text
+------------------------------------------------------------------+
|  [ChapterShell]  -- full viewport, overflow-x hidden             |
|                                                                   |
|  +----------+  +----------+  +----------+  +----------+          |
|  | Chapter 0|  | Chapter 1|  | Chapter 2|  | Chapter 3|          |
|  | Hallway  |->| Demo     |->| Club     |->| Choose   |          |
|  | (100vw)  |  | (100vw)  |  | (100vw)  |  |  Path    |          |
|  +----------+  +----------+  +----------+  +----------+          |
|                                                                   |
|  [ChapterNav]  -- floating bottom pill: dots + arrows             |
|  [ChapterProgress] -- thin top bar showing position               |
+------------------------------------------------------------------+
```

Each chapter is exactly `100vw x 100svh`. The container uses CSS `translateX` (GPU-accelerated) to slide between chapters. Vertical scrolling is still available **within** a chapter for content that needs it (like the Club Scene rooms).

---

## How It Works

### 1. ChapterShell (new component)
- A wrapper that replaces `SceneStage` for this mode
- Holds an array of chapter components in a horizontal flex strip
- Manages the active chapter index and animates `translateX` via Framer Motion
- Transition style: smooth slide with a subtle parallax (content shifts at 1x, background shifts at 0.85x)

### 2. ChapterNav (new component)
- Floating pill at the bottom center (like the existing nav pill, but chapter-aware)
- Dot indicators showing total chapters and current position
- Left/right arrow buttons
- Chapter title fades in/out as you transition
- Swipe-aware on mobile (left/right swipe changes chapter)

### 3. ChapterProgress (new component)
- Ultra-thin bar at the very top of the viewport
- Shows horizontal progress through the story
- Segmented by chapter (like a Stories progress bar)

### 4. Navigation Inputs
| Input | Action |
|---|---|
| Arrow Left / Right | Previous / Next chapter |
| Swipe Left / Right | Previous / Next chapter (mobile) |
| Dot click | Jump to specific chapter |
| Scroll wheel (horizontal) | Navigate chapters |
| Escape | Back to previous chapter |

### 5. Chapter Order (initial prototype)
1. **Hallway** -- existing StudioHallway (intrigue / hook)
2. **Demo** -- existing InsiderDemoExperience (energy / proof)
3. **Club** -- existing ClubScene (information / deep dive)
4. **Choose Path** -- existing ChoosePath page (conversion / CTA)

### 6. Transition Animation
- Primary: `translateX` slide (600ms, ease-out cubic)
- Secondary: outgoing chapter fades to 95% opacity + slight scale-down (0.97)
- Incoming chapter enters at full opacity with a 50ms stagger
- Optional parallax: background layers shift at 85% of content speed

---

## What Changes

### New Files
| File | Purpose |
|---|---|
| `src/components/storybook/ChapterShell.tsx` | Horizontal chapter container with translateX animation |
| `src/components/storybook/ChapterNav.tsx` | Bottom floating navigation pill with dots and arrows |
| `src/components/storybook/ChapterProgress.tsx` | Top progress bar (Stories-style) |
| `src/stores/chapterStore.ts` | Zustand store: active chapter, transition state, chapter registry |
| `src/hooks/useChapterNavigation.ts` | Keyboard, swipe, and scroll-wheel input handler |

### Modified Files
| File | Change |
|---|---|
| `src/components/home/SceneFlow.tsx` | Add a feature flag toggle between vertical (current) and horizontal (storybook) modes. When storybook mode is active, render ChapterShell instead of SceneStage. |
| `src/stores/sceneFlowStore.ts` | Add a `mode: 'vertical' | 'horizontal'` flag so both paradigms coexist |

### Untouched
- All existing room components, scene components, and pages remain as-is. They just get wrapped in chapter slots instead of being vertically stacked.
- The live site routing, AppLayout, and protected routes are completely unaffected.

---

## Feature Flag (Safe Rollback)

A simple toggle in the scene flow store:

```text
storybook mode = OFF  -->  current vertical dissolve behavior (default)
storybook mode = ON   -->  horizontal chapter navigation
```

This means you can flip back to the current experience instantly with zero cleanup. The flag can be toggled via a keyboard shortcut (e.g., `Shift+H`) during development so you can compare both modes side by side.

---

## Technical Approach

- **GPU-only animation**: `translateX` and `opacity` only -- no layout thrashing
- **Lazy mounting**: Only the active chapter +/- 1 neighbor are mounted (the rest are unmounted to save memory)
- **Preserve inner scroll**: Chapters like the Club Scene keep their internal vertical snap-scroll. The horizontal system only captures left/right gestures, not up/down
- **Mobile-first swipe**: Reuses the existing `useSwipeNavigation` hook pattern but scoped to the chapter shell
- **Accessible**: Arrow key navigation, ARIA live region announcing current chapter, reduced-motion support via `prefers-reduced-motion`

---

## Pressure Pass (Edge Cases)

- **Deep linking**: URL updates with `?chapter=0|1|2|3` so sharing/refreshing lands on the right chapter
- **Club Scene internal scroll conflict**: The Club Scene uses vertical snap-scroll internally. The chapter system must not capture vertical swipes -- only horizontal. This is handled by checking swipe angle (must be within 30 degrees of horizontal to trigger chapter change)
- **Performance**: With lazy mounting (+/- 1 neighbor), at most 3 chapters are in the DOM at once
- **Keyboard focus trap**: When a chapter changes, focus moves to the new chapter's first interactive element

---

## Next Moves After Approval
1. Build `chapterStore.ts` + `useChapterNavigation` hook
2. Build `ChapterShell`, `ChapterNav`, `ChapterProgress` components
3. Wire into `SceneFlow.tsx` behind the feature flag
4. Test the horizontal flow end-to-end on desktop and mobile viewports
