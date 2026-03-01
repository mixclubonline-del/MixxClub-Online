

# Demo Experience Controls Overhaul + Polish Pass

## Problems Identified

### 1. Controls Hidden by Navigation (Critical)
The SceneFlow floating nav pill ("Home / Quick Start / Join Free") sits at `z-[60]` top-center and persists during the DEMO scene. The demo's own header also renders at `z-[60]` top-left/right. On desktop they visually collide. On mobile, the demo controls (play/pause, volume, skip, auto-sync, lite mode) are either `hidden sm:block` or fully obscured by the nav pill.

**Result**: On mobile, users have ZERO control over the demo once it starts -- no pause, no skip, no volume. On desktop, the nav pill overlaps the demo branding area.

### 2. Stale `/choose-path` Links (Bug)
Two locations still navigate to `/choose-path` instead of `/how-it-works`:
- SceneFlow nav pill "Join Free" link (line 163)
- InsiderDemoExperience invitation phase "Join Now" button (line 764)

### 3. Phase Navigation Hard to Use
The phase dots are small, unlabeled circles. On mobile they sit at `bottom-36` competing with the audio visualizer. No phase title is visible -- users don't know which chapter they're in.

### 4. No Replay / Restart Capability
Once the audio ends, there's no way to replay the experience without refreshing the page.

---

## Solution: Bottom Control Bar ("Transport Bar")

Replace the scattered top-right header controls with a unified **bottom transport bar** -- a single glassmorphic strip pinned to the bottom of the screen, above the audio visualizer. This follows the universal media player pattern (Spotify, YouTube, etc.) and keeps the top area clear for content.

### Transport Bar Design

```text
+------------------------------------------------------+
|  [<] [||] [>]  |  Phase 3/10: THE CONNECTION  |  Vol  |
|  prev pause next    phase label + mini progress   mute |
+------------------------------------------------------+
```

- **Position**: Fixed bottom, `bottom-32` (above the 32-unit audio visualizer), full width with max-w and horizontal padding
- **Style**: `bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl` -- consistent with Pathfinder and other glassmorphic elements
- **Z-index**: `z-30` -- above content (z-10) but below the full-screen overlays
- **Contents**:
  - **Left cluster**: Previous phase, Play/Pause, Next phase (icon buttons)
  - **Center**: Current phase title + step counter ("3 of 10") + thin progress bar showing phase-level progress
  - **Right**: Volume toggle (mute/unmute), Auto-sync indicator dot, Settings gear (opens a popover with Lite Mode toggle and volume slider)
- **Mobile**: Same layout but slightly more compact. All controls visible -- no `hidden sm:` classes. The phase title truncates. The settings gear replaces inline volume/lite toggles.
- **Auto-hide**: The bar fades to 70% opacity after 4 seconds of no interaction, returns to full on touch/hover. Optional: fully hides after 8s, tap anywhere to reveal.
- **Swipe hint**: On mobile, a subtle up-swipe on the bar could expand a mini phase-picker (stretch goal, not in this pass).

### SceneFlow Nav Pill Changes

During the DEMO scene, the floating nav pill should either:
- **Option A (recommended)**: Collapse to a single minimal "Exit" button (just a small X or door icon at top-right) that returns to the Hallway. Removes visual clutter entirely.
- **Option B**: Hide completely during DEMO (the transport bar's back button serves the same purpose).

Going with **Option A**: During DEMO, the nav pill renders as a small translucent exit button at top-right instead of the full "Home / Quick Start / Join Free" strip.

### Demo Header Removal

The existing `<header>` block in InsiderDemoExperience (lines 342-396) is completely replaced by the new transport bar. The MIXXCLUB branding (logo + badge) in the header is removed during active playback -- the content itself carries the brand. The back button is absorbed into the transport bar.

---

## File Changes

### Modify: `src/components/demo/InsiderDemoExperience.tsx`

**Remove**: The entire `<header>` block (lines 342-396) -- all controls move to the new transport bar component.

**Remove**: The phase navigation dots block (lines 399-418) -- phase navigation moves into the transport bar.

**Add**: Import and render `<DemoTransportBar>` as a fixed-bottom element inside the main demo container, passing all the control state (isPlaying, volume, currentPhase, phases, callbacks).

**Fix**: Line 764 -- change `navigate('/choose-path')` to `navigate('/how-it-works')`.

**Adjust**: Main content padding -- change `pb-36 sm:pb-40` to `pb-48` to make room for the transport bar above the visualizer.

### Create: `src/components/demo/DemoTransportBar.tsx`

The new unified control bar component. Props:
- `isPlaying`, `onToggle` -- play/pause
- `currentPhase`, `totalPhases`, `phaseTitle` -- phase info
- `phaseProgress` -- 0-100 within current phase
- `onPrevPhase`, `onNextPhase`, `onSkipToPhase` -- navigation
- `volume`, `onVolumeChange`, `onMuteToggle`, `isMuted` -- audio
- `isAutoPlay`, `onAutoPlayToggle` -- sync state
- `liteMode`, `onLiteModeToggle` -- performance
- `onBack` -- exit demo

Structure:
- Outer: `fixed bottom-36 left-4 right-4 z-30` with glassmorphic styling
- Three sections (flex row): transport controls | phase info | settings
- Settings popover: Radix Popover with volume slider + lite mode toggle
- Auto-fade: Uses a local `useEffect` timer that sets opacity to 0.7 after 4s of no pointer activity

### Modify: `src/components/home/SceneFlow.tsx`

**Line 136-169 (nav pill)**: Wrap in a conditional:
- When `scene === 'DEMO'`: Render a compact exit button only (small glassmorphic circle, top-right, with a door/X icon)
- Otherwise: Render the current nav pill as-is

**Line 163**: Change `to="/choose-path"` to `to="/how-it-works"` and update the label from "Join Free" to "Join Free" (keep label, fix route).

### Adjust: Audio visualizer positioning

The existing visualizer at `bottom-0 h-32` stays. The transport bar sits at `bottom-36` (above the visualizer's gradient region). This creates a clean layered stack: content > transport bar > visualizer gradient.

---

## Summary of UX Improvements

| Before | After |
|--------|-------|
| Controls hidden behind nav on mobile | All controls in visible bottom bar |
| No pause/skip on mobile | Play/Pause/Prev/Next always accessible |
| No phase label visible | "Phase 3 of 10: THE CONNECTION" visible |
| Phase dots hard to find/use | Phase info integrated into transport bar |
| Scattered controls across header | Single unified transport strip |
| Nav pill clashes with demo header | Nav collapses to small exit button during demo |
| Two stale `/choose-path` links | Both fixed to `/how-it-works` |
| No replay capability | Back-to-start via prev phase or replay button on final phase |
| No auto-hide for immersion | Bar fades after 4s inactivity |

---

## Technical Notes

- The transport bar uses the same glassmorphic vocabulary as PathfinderBeacon and QuickStart cards for visual consistency.
- `z-30` for the transport bar avoids conflicts with the phase progress bar (z-50), dialogs (z-50), and nav elements (z-60).
- The auto-fade timer resets on `onPointerMove` and `onPointerDown` events within the bar container.
- Volume state and phase state are passed down from InsiderDemoExperience -- no new global state needed.
- The Settings popover uses the existing Radix Popover component from the UI library.

