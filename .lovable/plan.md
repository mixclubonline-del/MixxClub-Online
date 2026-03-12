

# Fix: Onboarding Blank Screen After Signup

## Root Cause

`PageTransition.tsx` relies on the browser's `transitionEnd` CSS event to swap route content. The flow is:

1. User picks role on `/select-role` → navigates to `/onboarding/engineer`
2. PageTransition sets `transitionStage = 'fade-out'` (opacity: 0)
3. Waits for `onTransitionEnd` to fire, then swaps to `'fade-in'` (opacity: 1)

**Problem**: `transitionEnd` is unreliable — it can silently fail if the element isn't painted, is off-screen, or if multiple transitions race. When it doesn't fire, the page stays at `opacity: 0` forever → blank screen.

This affects ALL route transitions, but onboarding is hit hardest because:
- The `/auth/callback` → `/select-role` → `/onboarding/X` chain involves rapid sequential navigations
- The ProtectedRoute wrapper adds a loading state that can prevent the initial paint needed for the transition event

## Fix

**Edit `src/components/layouts/PageTransition.tsx`** — Add a timeout fallback that forces the transition to complete if `transitionEnd` doesn't fire within 400ms. This is a standard defensive pattern for CSS transition-based animations.

```typescript
useEffect(() => {
  if (location.pathname !== displayLocation.pathname) {
    setTransitionStage('fade-out');
    
    // Fallback: force transition complete if transitionEnd doesn't fire
    const fallback = setTimeout(() => {
      setTransitionStage('fade-in');
      setDisplayLocation(location);
    }, 400);
    
    return () => clearTimeout(fallback);
  }
}, [location, displayLocation]);
```

The `onAnimationEnd` handler stays — if it fires first (normal case), the state update is idempotent. The timeout is purely a safety net.

## Files Changed

| File | Change |
|---|---|
| `src/components/layouts/PageTransition.tsx` | Add 400ms fallback timeout to prevent stuck transitions |

One file, surgical fix. No other components affected.

