

## Clean the Hallway — Strip Global Overlays from Immersive Routes

### The Problem

The home screen (`/`) currently has **5 global components** rendering on top of the immersive hallway, breaking the atmosphere:

1. **PrimeConsole** (bottom-left) — rotating status text like "AUDIO: ACTIVE - Amplitude 69"
2. **PrimeStatusBar** (bottom-left) — Prime/Network/Sessions/Audio indicator panel
3. **GlobalAudioPlayer** (bottom-right) — floating music player widget
4. **GlobalMusicPlayer** (bottom bar) — full-width music player bar
5. **GlobalPrimeChat** (bottom-right) — Prime chatbot FAB (already self-hides for unauth, but still loads)

These are all mounted unconditionally in `App.tsx` (lines 136-140) and render on every route, including the hallway. The `ImmersiveAppShell` already knows about "full immersive routes" (`/`, `/intro`, `/auth`, `/onboarding`) but these 5 components sit outside the shell and have no route awareness.

Additionally, the **HomeOverlayNav logo** text ("MIXXCLUB") may overlap with content from the StudioHallway or the SceneFlow because the nav header has no background — it's fully transparent, and text layers underneath bleed through.

### The Fix

#### 1. Route-aware visibility for global overlays

Add a shared route check to these 4 components (GlobalPrimeChat already self-hides). Each component will import the same `fullImmersiveRoutes` list and return `null` when the current path matches:

- **`PrimeConsole.tsx`** — add `useLocation()` check, return `null` on full-immersive routes
- **`PrimeStatusBar.tsx`** — same treatment
- **`GlobalAudioPlayer.tsx`** — same treatment
- **`GlobalMusicPlayer.tsx`** — same treatment (already returns `null` when no track, but should also hide on immersive routes even if a track is loaded)

#### 2. Fix the HomeOverlayNav logo overlap

Add a subtle `bg-gradient-to-b from-background/60 to-transparent` backdrop to the header bar so the logo and nav links don't collide with hallway content underneath. This preserves the glassmorphic feel while ensuring readability.

#### 3. Extract the immersive route list to a shared config

Move the `fullImmersiveRoutes` array from `ImmersiveAppShell.tsx` into a shared constant (e.g., `src/config/immersiveRoutes.ts`) so all global components reference the same list. This prevents drift if routes are added later.

### Technical Details

**New file:** `src/config/immersiveRoutes.ts`
```text
Exports:
  - FULL_IMMERSIVE_ROUTES: string[] = ['/', '/intro', '/auth', '/onboarding', '/city/gates']
  - isFullImmersiveRoute(pathname: string): boolean
```

**Modified files:**

- `src/components/prime/PrimeConsole.tsx` — import `isFullImmersiveRoute`, add `useLocation`, return `null` when true
- `src/components/prime/PrimeStatusBar.tsx` — same
- `src/components/audio/GlobalAudioPlayer.tsx` — same
- `src/components/player/GlobalMusicPlayer.tsx` — same
- `src/components/immersive/ImmersiveAppShell.tsx` — import `FULL_IMMERSIVE_ROUTES` instead of inline array
- `src/components/home/HomeOverlayNav.tsx` — add gradient backdrop to header for logo readability

**No database changes. No new dependencies.**

### Result

The hallway becomes a clean, atmospheric scene with only the minimal `HomeOverlayNav` floating over it — no status bars, no music players, no console readouts. The immersive magic is restored.

