

## Phase 2: Background Blackout + Hallway Centering Fix

Three surgical fixes that eliminate the remaining visual bleed-through and alignment bugs.

---

### Fix 1: Kill the Static Fallback Images in PhaseBackground

**File**: `src/components/demo/PhaseBackground.tsx`

**Problem**: Line 113 currently reads `const resolvedUrl = dbAssetUrl || staticFallback;` — meaning every phase without a database-uploaded asset falls back to a DAW screenshot or promo photo at 35% opacity. The result: track names, channel strips, "File / View / Edit" menus, and watermarks bleed through behind demo content across all 10 phases.

**Fix**: Change the resolution chain from `DB asset > static image > gradient` to `DB asset > gradient`. When no database asset is uploaded, the handcrafted `PHASE_GRADIENTS` become the primary background. The gradients are already defined for all 10 phases and provide superior cinematic atmosphere without any UI bleed.

Change line 113 from:
```
const resolvedUrl = dbAssetUrl || staticFallback;
```
to:
```
const resolvedUrl = dbAssetUrl || null;
```

The static imports and `STATIC_FALLBACKS` record stay in the file for documentation — they will be tree-shaken out by the bundler since nothing references them at runtime.

---

### Fix 2: Separate Floor Logo Centering from Perspective Transform

**File**: `src/components/scene/StudioHallway.tsx`

**Problem**: The floor logo div (lines 251-268) has `className="... left-1/2 -translate-x-1/2"` AND an inline `style={{ transform: 'translateX(-50%) perspective(500px) rotateX(60deg) scaleX(0.9)' }}`. The inline `transform` overrides Tailwind's `-translate-x-1/2` entirely. While the manual `translateX(-50%)` compensates, the two transform systems fighting creates a fragile pattern and the perspective distortion shifts the visual center.

**Fix**: Nest two divs. Outer div handles centering only (Tailwind). Inner div handles perspective only (inline style). No conflicts.

```
BEFORE (single div, conflicting transforms):
  <div class="left-1/2 -translate-x-1/2" style="transform: translateX(-50%) perspective(...)">

AFTER (nested, clean separation):
  <div class="absolute bottom-44 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
    <div style="transform: perspective(500px) rotateX(60deg) scaleX(0.9); opacity: 0.13">
      ...logo...
    </div>
  </div>
```

---

### Fix 3: Remove Background Image from CommunityShowcase

**File**: `src/components/demo/CommunityShowcase.tsx`

**Problem**: Lines 43-53 render `mixing-collaboration.jpg` at 20% opacity behind the floating member cards. This is a secondary source of image bleed independent of `PhaseBackground` — it layers a promo photo under the connection phase content, adding visual noise that competes with the phase gradient.

**Fix**: Remove the atmospheric background image container entirely (lines 43-53). The phase gradient from `PhaseBackground` already provides the atmosphere. The floating glassmorphic member cards provide all the visual depth needed. Also remove the unused `mixingCollabImg` import on line 5.

---

### Files Modified

| File | Change |
|---|---|
| `src/components/demo/PhaseBackground.tsx` | Skip static fallback images; use gradient as default when no DB asset |
| `src/components/scene/StudioHallway.tsx` | Separate floor logo centering wrapper from perspective wrapper |
| `src/components/demo/CommunityShowcase.tsx` | Remove inline background image and its import |

No new files. No database changes. No new dependencies. Three files, three clean cuts.

