

# Add Slide Transition Animations

## Approach

Wrap the slide content in `SlideRenderer` with Framer Motion's `AnimatePresence` and `motion.div`, keyed by `slideIndex`. This gives a fade + subtle slide-in on each transition. Also track navigation direction in `DeckShell` to animate left vs right.

## Changes

### 1. `DeckShell.tsx`
- Add `direction` state (`1` for forward, `-1` for back)
- Update `next`/`prev`/`goTo` to set direction before changing slide
- Pass `direction` to `SlideRenderer`

### 2. `SlideRenderer.tsx`
- Import `motion`, `AnimatePresence` from `framer-motion`
- Accept `direction` prop
- Wrap `SlideComponent` in `AnimatePresence mode="wait"` with `motion.div` keyed by `slideIndex`
- Variants: enter from `direction * 60px` translateX + opacity 0, animate to center + opacity 1, exit opposite direction
- Duration ~0.35s with easeOut

Two files, minimal changes, uses already-installed framer-motion.

