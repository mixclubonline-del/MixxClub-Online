

# Upgrading Scene Flow to Zustand State Machine

## Current State
The existing `SceneFlow.tsx` uses React's `useState` with Framer Motion's `AnimatePresence`. This works but is:
- Isolated from other stores (no event bus integration)
- Using opacity-only transitions (no "dissolve into light" effect)
- Missing keyboard support
- Not following the established Zustand patterns in the codebase

## Proposed Upgrade

### Architecture Overview

```text
┌────────────────────────────────────────────────────────────────┐
│                      sceneFlowStore.ts                         │
│  scene: HALLWAY | DEMO | INFO                                  │
│  phase: IDLE | DISSOLVE_OUT | DISSOLVE_IN                      │
│  go(next) → triggers timed phase sequence                      │
│  back() → returns to lastScene                                 │
└────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
┌─────────────────────────┐    ┌─────────────────────────────────┐
│     SceneStage.tsx      │    │        SceneFlow.tsx            │
│  Dissolve veil wrapper  │    │  Keyboard bindings + routing    │
│  Light sweep + bloom    │    │  Renders current scene          │
└─────────────────────────┘    └─────────────────────────────────┘
```

### File Changes

| File | Action | Purpose |
|------|--------|---------|
| `src/stores/sceneFlowStore.ts` | Create | Zustand store with scene + phase state |
| `src/components/scene/SceneStage.tsx` | Create | Dissolve veil wrapper with light effects |
| `src/components/home/SceneFlow.tsx` | Rewrite | Use store, add keyboard, wire to SceneStage |
| `src/lib/hubEventBus.ts` | Update | Add scene flow event types |

---

## Technical Details

### 1. Scene Flow Store (`src/stores/sceneFlowStore.ts`)

State shape:
- `scene`: Current visible scene (`HALLWAY` | `DEMO` | `INFO`)
- `phase`: Transition state (`IDLE` | `DISSOLVE_OUT` | `DISSOLVE_IN`)
- `toScene`: Target scene during transition
- `lastScene`: Previous scene for `back()` navigation
- `dissolveMs`: Configurable timing (default 950ms)

Actions:
- `go(next)`: Initiates transition sequence with guards (no double-fire)
- `back()`: Returns to previous scene
- `setDissolveMs(ms)`: Runtime timing adjustment

Transition sequence:
1. Set `phase: DISSOLVE_OUT` + `toScene`
2. After `dissolveMs`, swap `scene` + set `phase: DISSOLVE_IN`
3. After fade-in duration, set `phase: IDLE`

Event publishing:
- `scene:transition_started` when dissolve begins
- `scene:changed` when scene swaps
- `scene:transition_completed` when idle resumes

### 2. Scene Stage Component (`src/components/scene/SceneStage.tsx`)

A wrapper that adds the "dissolve into light" effect:
- Outer container with `100svh` height, `overflow-hidden`
- Inner content wrapper with opacity + scale transitions
- Dissolve veil overlay (white bloom → fade) synced to phase
- Pure CSS transitions (no heavy animation library)

Visual effects during dissolve:
- Content scales slightly (0.98 → 1.02)
- Opacity fades
- Light bloom overlay sweeps across
- Subtle blur during peak transition

### 3. Updated SceneFlow Component

Changes:
- Subscribe to `sceneFlowStore` instead of local state
- Wrap scenes in `SceneStage`
- Add keyboard event listeners:
  - `Enter` in hallway → `go('DEMO')`
  - `Escape` anywhere → `back()` or `go('HALLWAY')`
- Pass scene-specific props via callbacks

### 4. Hub Event Bus Updates

New event types:
- `scene:transition_started`
- `scene:changed`
- `scene:transition_completed`

This allows other systems (analytics, ALS, Prime Brain) to react to scene changes.

---

## Information Scene No-Scroll Mode

The user's spec emphasizes "no scroll" — the Info scene should either:
1. Be full-viewport with internal snap sections, OR
2. Be allowed to scroll but contained within a `100svh` outer wrapper

For this implementation, we'll add the outer container constraint. Internal scroll behavior can be refined separately.

---

## Keyboard Flow Summary

| Key | Context | Action |
|-----|---------|--------|
| `Enter` | Hallway | Advance to Demo |
| `Escape` | Demo | Return to Hallway |
| `Escape` | Info | Return to Demo |

---

## Integration Points

- **Pulse System**: Scene transitions can trigger energy shifts (HALLWAY = DISCOVER, DEMO = DISCOVER/CREATE, INFO = MANAGE)
- **ALS Bar**: Can reflect scene state without interrupting
- **Analytics**: Scene dwell time tracking via new events

---

## Validation Criteria

- Hallway loads as full-screen (100svh, no scroll)
- Single CTA triggers dissolve into light → Demo appears
- Demo "Learn More" dissolves to Info
- All back buttons dissolve in reverse
- Enter/Escape keys work from hallway/demo
- No page reloads, no URL changes
- Console shows scene transition events

