

# Add Visual Waveform Comparison to Mastering Results

## What Changes

The results phase of TryItScene currently shows LUFS numbers and browser-native audio players. This adds a **side-by-side (stacked) waveform visualization** that lets users visually see the difference Velvet Curve makes -- tighter dynamics, louder peaks, fuller body.

## Approach

### New Component: `src/components/promo/WaveformComparison.tsx` (~70 lines)

A lightweight canvas-based before/after waveform renderer purpose-built for the promo funnel. It:

- Accepts two `AudioBuffer` objects (original and mastered)
- Renders them as mirrored bar waveforms on two stacked canvases (or one split canvas)
- Uses the MixxClub gradient palette (pink/lavender/cyan) for the mastered waveform, and muted white/gray for the original
- Downsamples to ~200 bars for clean visual at mobile widths
- Animates in with a left-to-right reveal using framer-motion
- Labels: "Before" (top) and "After - Velvet Curve" (bottom)

```text
+----------------------------------+
|  Before                          |
|  ||||| |||| ||| || ||| ||||      |  (white/gray bars)
|  ||||| |||| ||| || ||| ||||      |
+----------------------------------+
|  After - Velvet Curve            |
|  ||||||||||||||||||||||||||||     |  (pink-to-cyan gradient bars)
|  ||||||||||||||||||||||||||||     |
+----------------------------------+
```

The visual difference is immediate: the mastered waveform will show fuller, more consistent bars with tighter dynamic range, while the original will have more variation and lower average level.

### Modified: `src/components/promo/scenes/TryItScene.tsx`

- Store both `originalBuffer` and `masteredBuffer` in state (currently only URLs are kept)
- Add `<WaveformComparison>` between the LUFS comparison and the audio players in the results phase
- Pass both AudioBuffers to the new component

Changes are ~15 lines added to TryItScene (two new state variables + the component insertion).

## Technical Details

**Downsampling logic** (inside WaveformComparison):
- Divide each buffer's channel data into ~200 equal windows
- For each window, compute the peak absolute value
- Normalize both waveforms to the same scale so the loudness difference is visually obvious
- Render as symmetric bars (mirrored around center line)

**Canvas rendering** (not SVG) for performance with 200+ bars on mobile.

**No new dependencies** -- uses raw Canvas API + framer-motion (already installed).

## File Summary

| Action | File | Lines |
|--------|------|-------|
| Create | `src/components/promo/WaveformComparison.tsx` | ~70 |
| Modify | `src/components/promo/scenes/TryItScene.tsx` | ~15 lines added |

