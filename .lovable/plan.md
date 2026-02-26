

# Hybrid Flow: Vertical Dissolve into Horizontal Chapters

## Concept

Keep the existing Hallway and Demo scenes exactly as they are today (vertical dissolve transitions via `SceneStage`). When the user finishes the Demo and clicks "Learn More" or advances past it, the experience transitions into the horizontal storybook chapter system for everything that follows (Club, Choose Path, and any future pages).

The flow becomes:

```text
HALLWAY ──dissolve──> DEMO ──dissolve──> HORIZONTAL CHAPTERS
                                           |
                                    [Club] ──slide──> [Choose Path]
```

## What Changes

### 1. SceneFlow.tsx (modified)
- Remove the pure "horizontal mode replaces everything" branch
- Keep the vertical dissolve flow for HALLWAY and DEMO unchanged
- When scene transitions to INFO, instead of rendering `ClubScene` directly inside `SceneStage`, render the `ChapterShell` with Club + Choose Path as its chapter slots
- The dissolve-out from DEMO leads into the horizontal chapter world

### 2. sceneFlowStore.ts (simplified)
- Remove the `mode` toggle (`'vertical' | 'horizontal'`) since we no longer need a full-page mode switch -- the hybrid is the default behavior
- Keep all existing dissolve logic intact

### 3. chapterStore.ts (updated)
- Reduce default chapters to just the post-demo pages: Club and Choose Path (2 chapters instead of 4)
- Update chapter definitions accordingly

### 4. ChapterShell.tsx (minor tweak)
- No structural changes needed -- it already renders whatever slots it receives
- Ensure it works cleanly as a child of `SceneStage` (it does, since it's a full-viewport div)

### 5. Shift+H toggle removed
- No longer needed since the hybrid is the single mode
- Clean up the keyboard listener from SceneFlow

## User Experience

1. User lands on **Hallway** -- same as today, full dissolve transitions
2. User clicks "Enter" -- dissolves into **Demo** -- same as today
3. User clicks "Learn More" -- dissolves into **horizontal chapter zone**
4. Inside the chapter zone: **Club** slides left/right to **Choose Path**
5. Arrow keys, swipe, dots, and scroll-wheel all work within the chapter zone
6. "Back" from the chapter zone dissolves back to Demo

## Technical Details

- The `ChapterShell` renders inside the INFO scene slot of the vertical flow
- The chapter store resets to chapter 0 (Club) when entering the horizontal zone
- The `useChapterNavigation` hook only activates when the INFO scene is active
- Deep-link URL changes from `?scene=info&chapter=0` format
- ClubScene's internal vertical scroll remains fully functional within its chapter panel

## Files Modified
| File | Change |
|---|---|
| `src/components/home/SceneFlow.tsx` | Replace INFO scene content with ChapterShell; remove mode toggle |
| `src/stores/sceneFlowStore.ts` | Remove mode/setMode (no longer needed) |
| `src/stores/chapterStore.ts` | Update default chapters to Club + Choose Path only |

## Files Unchanged
- `ChapterShell.tsx`, `ChapterNav.tsx`, `ChapterProgress.tsx` -- work as-is
- `useChapterNavigation.ts` -- works as-is
- All room components, StudioHallway, InsiderDemoExperience -- untouched

