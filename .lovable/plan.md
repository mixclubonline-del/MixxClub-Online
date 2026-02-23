

# Mobile Refinements for Community Showcase

Fixes four issues found during the 390px mobile audit. All changes stay within the zero-Framer-Motion constraint.

---

## Fix 1: Stats Grid Overflow

**Problem**: The 3-column stats grid truncates long values like "MixxCoinz/Course" and "Earned + Purchased" at 390px.

**Solution**: Switch to `grid-cols-2` on phone, `grid-cols-3` on tablet+. For stats with only 3 items (all pillars), the third item spans full width on phone, creating a clean 2+1 layout.

**File**: `src/components/journey/CommunityShowcase.tsx` (line 134)

Change:
```
grid grid-cols-3 gap-3 md:gap-4
```
To:
```
grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4
```

Also add `text-sm` to stat values on mobile to prevent overflow:
```
text-base md:text-2xl font-bold  (was text-lg md:text-2xl)
```

---

## Fix 2: Touch-Accessible Stats Overlay

**Problem**: The image stats overlay uses `group-hover:translate-y-0` which is unreachable on touch devices.

**Solution**: On mobile, always show the stats overlay in a collapsed/visible state instead of hiding it behind hover. Use a CSS approach:
- Add `max-sm:translate-y-0` so on phone screens the overlay is always visible
- Reduce opacity on mobile so it doesn't obscure the full image: `max-sm:opacity-90`
- Keep the hover behavior on desktop/tablet

**File**: `src/components/journey/CommunityShowcase.tsx` (line 86)

Change the overlay div classes from:
```
translate-y-full group-hover:translate-y-0
```
To:
```
sm:translate-y-full sm:group-hover:translate-y-0
```

This makes the overlay always visible on phone screens (below `sm` breakpoint), while preserving the hover reveal on larger screens.

---

## Fix 3: R3F Performance Guard

**Problem**: WebGL may fall back to software rendering on low-end phones, causing jank.

**Solution**: Add a `devicePixelRatio` cap and reduce particle count on mobile in `CoinScene3D.tsx`:
- Set `dpr={[1, 1.5]}` instead of `[1, 2]` to cap pixel density
- Reduce particle count from 80 to 40 on mobile via the existing `useMobileDetect` hook
- Add `frameloop="demand"` consideration (but keep "always" since the coins need to spin)

**File**: `src/components/journey/CoinScene3D.tsx`

Import `useMobileDetect` and pass reduced particle count:
```typescript
const { isMobile } = useMobileDetect();
// In Canvas: dpr={isMobile ? [1, 1.5] : [1, 2]}
// In Scene: <ParticleDust count={isMobile ? 40 : 80} />
```

---

## Fix 4: Badge Positioning on Mobile

**Problem**: Floating badges at `absolute -bottom-3 -right-3` can overlap content below on narrow screens.

**Solution**: Remove absolute positioning on phone, use inline flow instead:
- On mobile (`max-sm`): badges render inline below the image with margin-top
- On tablet+ (`sm:`): keep the current absolute floating position

**File**: `src/components/journey/CommunityShowcase.tsx` (line 101)

Change:
```
absolute -bottom-3 -right-3 md:-bottom-4 md:-right-4
```
To:
```
mt-2 sm:mt-0 sm:absolute sm:-bottom-4 sm:-right-4
```

---

## Summary of Changes

| File | Change |
|---|---|
| `src/components/journey/CommunityShowcase.tsx` | Stats grid responsive cols, overlay touch fix, badge positioning |
| `src/components/journey/CoinScene3D.tsx` | Mobile DPR cap + reduced particles |

No new files. No new dependencies. Four surgical CSS + performance fixes.

