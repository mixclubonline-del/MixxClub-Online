

# Mini Phase-Picker (Swipe-Up Drawer on Transport Bar)

## Overview

Add an expandable phase-picker drawer that reveals all 10 phase thumbnails when the user swipes up on the transport bar (or taps a chevron handle). Each thumbnail shows the phase number, title, and active/completed state. Tapping a phase jumps directly to it.

## Design

```text
  Collapsed (default):
  +------------------------------------------------------+
  |  [<] [||] [>]  |  3/10: THE CONNECTION  |  Vol  Gear  |
  +------------------------------------------------------+

  Expanded (swipe up / tap handle):
  +------------------------------------------------------+
  |  1       2       3       4       5                    |
  |  PROBLEM DISCOV  CONNEC  TRANS   STUDIO              |
  |  [done]  [done]  [now]   [ ]     [ ]                 |
  |                                                       |
  |  6       7       8       9       10                   |
  |  MARKET  STAGE   BAG     NETWORK INVITE              |
  |  [ ]     [ ]     [ ]     [ ]     [ ]                 |
  +------------------------------------------------------+
  |  [<] [||] [>]  |  3/10: THE CONNECTION  |  Vol  Gear  |
  +------------------------------------------------------+
```

- The picker renders as a grid (5 columns, 2 rows) above the existing transport controls
- Each cell: phase number, truncated title, colored state indicator (completed = emerald, current = primary pulse, future = muted)
- A small drag handle / chevron-up icon sits centered above the transport bar as the swipe affordance
- Tapping any phase fires `onSkipToPhase(index)` and collapses the picker

## Implementation

### Modify: `src/components/demo/DemoTransportBar.tsx`

**New prop**: `phases: Array<{ id: string; title: string }>` and `onSkipToPhase: (index: number) => void` (already in the interface but unused -- will wire it up).

**Add state**: `pickerOpen: boolean` (default false).

**Swipe detection**: Attach `onPanEnd` from framer-motion to the outer container. If `deltaY < -40` (upward swipe), open the picker. If `deltaY > 40` (downward swipe), close it. Also add a tap-toggle via a small chevron handle.

**Picker panel**: Renders as an `AnimatePresence` block above the control strip. Uses `motion.div` with `initial={{ height: 0, opacity: 0 }}` / `animate={{ height: 'auto', opacity: 1 }}`. Contains a CSS grid (`grid-cols-5`) of phase cells.

**Phase cell**: Each cell is a button with:
- Phase number badge (small circle)
- Truncated title (max 8 chars)
- State ring: green border if completed (`index < currentPhase`), pulsing primary if active (`index === currentPhase`), dim border if future
- `onClick={() => { onSkipToPhase(index); setPickerOpen(false); }}`

**Drag handle**: A `ChevronUp` icon (rotates 180deg when open) centered above the bar, acts as both visual affordance and tap target.

**Auto-close**: Picker collapses after a phase is selected or after 6 seconds of inactivity.

### Modify: `src/components/demo/InsiderDemoExperience.tsx`

**Pass new props** to `DemoTransportBar`:
- `phases={DEMO_PHASES.map(p => ({ id: p.id, title: p.title }))}`
- `onSkipToPhase` is already defined -- ensure it's wired through

No other files need changes.

## Technical Notes

- Swipe gesture uses framer-motion's `onPan` / `onPanEnd` handlers (already imported) rather than adding a new touch library
- The picker grid uses `grid-cols-5` for a clean 2-row layout of 10 phases
- Z-index stays at `z-30` -- the picker expands upward within the same container, no new layer needed
- On desktop, the chevron handle serves as hover/click toggle since swipe isn't natural with a mouse
- The auto-fade timer pauses while the picker is open to prevent the bar from fading mid-interaction

