

# Fix: Maximum Update Depth Exceeded

## Root Cause

Two `useEffect` hooks fight over the same URL search params object:

1. **ChapterShell** syncs `active` chapter to `?chapter=X` -- depends on `[active, searchParams, setSearchParams]`
2. **SceneFlow** syncs `scene` to `?scene=X` -- depends on `[scene, searchParams, setSearchParams]`

When either calls `setSearchParams`, the returned `searchParams` reference changes, triggering the other effect, which calls `setSearchParams` again. The guards eventually break the loop, but not before React's update depth limit fires -- and the `AnimatePresence` key-swap in `ChapterNav` amplifies it by re-rendering the title animation on every pass.

## Fix

### 1. ChapterShell.tsx -- Use a ref to break the dependency cycle

Replace the `searchParams` dependency in the store-to-URL sync effect with a ref-based approach. Read `searchParams` via ref so it does not appear in the dependency array:

```tsx
import { useRef } from 'react';

// Inside ChapterShell:
const searchParamsRef = useRef(searchParams);
searchParamsRef.current = searchParams;

// Store -> URL sync: only fires when `active` changes
useEffect(() => {
  const sp = searchParamsRef.current;
  if (sp.get('chapter') === String(active)) return;
  const next = new URLSearchParams(sp);
  next.set('chapter', String(active));
  setSearchParams(next, { replace: true });
}, [active, setSearchParams]);
```

This breaks the circular trigger: the effect only runs when `active` changes, not when `searchParams` changes from SceneFlow's URL sync.

### 2. SceneFlow.tsx -- Same ref pattern for scene-to-URL sync

Apply the identical pattern to the scene-to-URL effect:

```tsx
import { useRef } from 'react';

// Inside VerticalSceneFlow:
const searchParamsRef = useRef(searchParams);
searchParamsRef.current = searchParams;

// Scene -> URL sync: only fires when `scene` changes
useEffect(() => {
  const sp = searchParamsRef.current;
  const target = SCENE_TO_QUERY[scene];
  if (sp.get('scene') === target) return;
  const next = new URLSearchParams(sp);
  next.set('scene', target);
  setSearchParams(next, { replace: true });
}, [scene, setSearchParams]);
```

### 3. ChapterNav.tsx -- No changes needed

The `AnimatePresence mode="wait"` with the chapter title is fine on its own. It was only re-triggering because the parent re-rendered excessively from the URL sync loop. Once the loop is fixed, the `AnimatePresence` key-swap fires once per chapter change as intended.

## Summary

| File | Change |
|---|---|
| `src/components/storybook/ChapterShell.tsx` | Replace `searchParams` dep with ref in store-to-URL effect |
| `src/components/home/SceneFlow.tsx` | Replace `searchParams` dep with ref in scene-to-URL effect |

Two surgical edits. No structural changes. The URL still syncs correctly -- it just no longer ping-pongs between effects.

