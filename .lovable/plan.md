

# Making InsiderDemoExperience a True Scene

## Current Issues Identified

| Problem | Location | Impact |
|---------|----------|--------|
| `min-h-screen` allows scroll bleed | Lines 126, 218, 303 | Breaks 100svh scene cage |
| Hard `navigate('/auth')` when embedded | Line 439 | Breaks dissolve flow |
| No `onJoinNow` callback prop | Interface (line 29-33) | Can't route join through SceneFlow |
| `skipToPhase` doesn't stop autoplay | Line 111-114 | Risk of double intervals |

---

## Technical Changes

### 1. Fix Container Heights (No Scroll Bleed)

**Pre-experience wrapper** (line 126):
```tsx
// Before
<div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">

// After  
<div className="h-[100svh] w-full bg-background flex items-center justify-center relative overflow-hidden">
```

**Main wrapper** (line 218):
```tsx
// Before
<div className="min-h-screen bg-background relative overflow-hidden">

// After
<div className="h-[100svh] w-full bg-background relative overflow-hidden">
```

**Main content area** (line 303):
```tsx
// Before
<main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-40">

// After
<main className="relative z-10 h-[100svh] w-full flex flex-col items-center justify-center px-6 pt-24 pb-40">
```

### 2. Add `onJoinNow` Callback Prop

Update the interface:
```tsx
interface InsiderDemoExperienceProps {
  embedded?: boolean;
  onLearnMore?: () => void;
  onBack?: () => void;
  onJoinNow?: () => void;  // NEW
}
```

Update the "Join Now" button logic:
```tsx
<Button
  size="lg"
  onClick={() => {
    if (embedded && onJoinNow) {
      onJoinNow();
      return;
    }
    navigate('/auth');
  }}
  className="gap-2 bg-gradient-to-r from-primary to-purple-600"
>
  Join Now
  <ArrowRight className="w-5 h-5" />
</Button>
```

### 3. Stabilize `skipToPhase`

Prevent double intervals by stopping autoplay:
```tsx
const skipToPhase = (index: number) => {
  setIsAutoPlay(false);  // Stop the interval loop cleanly
  setCurrentPhase(index);
  setPhaseProgress(0);
};
```

### 4. Wire `onJoinNow` in SceneFlow

Update SceneFlow to pass the new callback with dissolve-then-navigate:

```tsx
import { useNavigate } from 'react-router-dom';

// Inside SceneFlow component
const navigate = useNavigate();

const handleJoinNow = useCallback(() => {
  // Dissolve out, then navigate after dissolve completes
  go('HALLWAY'); // or could be a dedicated transition state
  setTimeout(() => navigate('/auth'), 950); // matches dissolveMs
}, [go, navigate]);

// In the render:
<InsiderDemoExperience 
  embedded 
  onLearnMore={handleLearnMore}
  onBack={handleBackToHallway}
  onJoinNow={handleJoinNow}
/>
```

---

## File Changes Summary

| File | Changes |
|------|---------|
| `src/components/demo/InsiderDemoExperience.tsx` | Replace `min-h-screen` with `h-[100svh]`, add `onJoinNow` prop, update Join button, stabilize `skipToPhase` |
| `src/components/home/SceneFlow.tsx` | Add `useNavigate`, create `handleJoinNow` callback, pass it to demo |

---

## What This Achieves

- **Demo is a true scene**: 100svh container, no scroll bleed, fits inside SceneStage cage
- **"Learn More" dissolves** into Info scene (already working)
- **"Back" dissolves** into Hallway (already working)
- **"Join Now" dissolves then routes**: Smooth light-pass transition before auth redirect
- **No double intervals**: Skip phase stops autoplay cleanly
- **Standalone mode preserved**: Non-embedded usage still navigates directly

