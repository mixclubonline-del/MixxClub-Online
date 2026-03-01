
# Fix: Eliminate BPM-Synced Click from Velvet Curve Mastering

## Root Cause

The `VelvetCurveProcessor` class has two problematic defaults that affect the offline mastering path:

1. **`isBreathingEnabled` defaults to `true`** (line 35 of VelvetCurveProcessor.ts). While the `requestAnimationFrame` modulation loop does not run inside an `OfflineAudioContext`, the `destroy()` call at the end of mastering triggers `stopBreathing()`, which ramps filter gains via `linearRampToValueAtTime` -- potentially injecting a discontinuity at the tail of the rendered buffer.

2. **Double-compression pumping**: The VelvetCurveProcessor's internal power compressor (threshold -18dB, ratio 3:1, 10ms attack) plus the safety limiter in `velvetMaster.ts` (threshold -1dB, ratio 20:1, 10ms attack) creates aggressive double-compression. On rhythmic content (trap, drill, etc.), every kick/snare pushes both compressors into gain reduction simultaneously. The fast 10ms attack on both creates a brief but audible transient artifact on every beat -- the "metronome click."

## The Fix

### File 1: `src/lib/velvetMaster.ts`

**Explicitly disable breathing before rendering** and remove the double-limiter by relying only on the normalization stage for loudness control:

- Call `velvet.stopBreathing()` immediately after construction, before rendering begins. This sets `isBreathingEnabled = false` and ensures `destroy()` later does not inject ramp artifacts.
- Remove the `DynamicsCompressorNode` safety limiter entirely. The VelvetCurveProcessor already has its own internal power compressor for dynamics control. Adding a second compressor on top is what creates the rhythmic click. The `normalizeLoudness` function with soft saturation (`Math.tanh`) at the end already prevents overs -- no additional limiter needed.

Changes:
- After `velvet.applyGenrePreset(genre)`, add `velvet.stopBreathing()`
- Remove the `DynamicsCompressorNode` limiter creation (lines 40-46)
- Wire the chain directly: `source -> velvet -> destination` (remove limiter from chain)
- Keep the `normalizeLoudness` post-processing as-is (it already handles loudness + soft saturation safety)

### File 2: `src/audio/effects/VelvetCurveProcessor.ts`

**Change the default `isBreathingEnabled` from `true` to `false`**. Breathing modulation should be opt-in (via `startBreathing()`), not opt-in to disable. This is a defensive fix that prevents any future code paths from accidentally having breathing active.

Change line 35:
```
private isBreathingEnabled: boolean = true;
```
to:
```
private isBreathingEnabled: boolean = false;
```

This does not affect the DAW/studio path because `useVelvetCurve.ts` already manages breathing explicitly via `toggleBreathing()` which calls `startBreathing()` when needed.

## Why This Works

- **No more double-compression**: Removing the external limiter eliminates the dual-attack transient artifact. The VelvetCurveProcessor's internal compressor (knee: 20, ratio: 3:1) is gentle enough for music dynamics without producing clicks.
- **No breathing artifacts**: Explicitly disabling breathing before render prevents any ramp-related discontinuities during destroy.
- **Loudness safety preserved**: The `normalizeLoudness` function with `Math.tanh` soft saturation at 0.95 prevents any overs without the hard-knee click of a DynamicsCompressorNode.

## Signal Chain After Fix

```text
Input AudioBuffer
    |
    v
OfflineAudioContext
    |
    v
VelvetCurveProcessor (genre-aware, breathing OFF)
  - Warmth (320Hz peaking)
  - Silk Edge (8kHz shelf)
  - Emotion (1kHz peaking)
  - Power Compressor (gentle: -18dB, knee 20, ratio 3:1)
  - Harmonic Enhancer (HP @ 30Hz)
    |
    v
destination (no external limiter)
    |
    v
normalizeLoudness() -- gain + tanh soft saturation
    |
    v
Mastered AudioBuffer
```

## File Summary

| Action | File | Change |
|--------|------|--------|
| Modify | `src/lib/velvetMaster.ts` | Remove DynamicsCompressorNode limiter, add `stopBreathing()` call |
| Modify | `src/audio/effects/VelvetCurveProcessor.ts` | Default `isBreathingEnabled` to `false` |

Two files, ~15 lines changed total.
