

# Replace Auphonic with Proprietary Velvet Curve Mastering

## The Problem

The `advanced-mastering` edge function sends user audio to Auphonic, a third-party service optimized for speech/podcast content. MixxClub already has a proprietary mastering engine -- the Velvet Curve -- with genre-aware psychoacoustic enhancement, dynamics processing, and offline rendering. The promo funnel's "Try It" scene should showcase YOUR technology, not a third party's.

## The Solution

Build a new edge function that processes audio server-side using Web Audio API concepts (via OfflineAudioContext in Deno), applying the Velvet Curve mastering chain, then returns the mastered file. This eliminates the Auphonic dependency entirely for the mastering demo.

Since Deno edge functions don't have access to Web Audio API (browser-only), the approach is:

**Option A -- Client-Side Mastering (Recommended)**
Process the audio directly in the browser using the existing `audioEngine.renderOffline()` pipeline. The `TryItScene` loads the uploaded file into an AudioBuffer, runs it through a temporary VelvetCurve + limiter chain via OfflineAudioContext, and produces the mastered output -- all client-side, zero backend dependency, instant results.

**Option B -- Hybrid (AI Analysis + Client Mastering)**
Keep the edge function for AI-powered analysis (genre detection, LUFS measurement, improvement suggestions via Gemini) but do the actual audio processing client-side through VelvetCurve.

Option A is the cleanest path. Option B adds the AI analysis layer on top.

## Recommended: Option B (Hybrid)

This gives the best of both worlds -- your proprietary mastering engine does the audio work, and AI provides the professional analysis and feedback that makes the demo feel premium.

## Technical Changes

### New File: `src/lib/velvetMaster.ts`

A standalone offline mastering function (~80 lines) that:
- Accepts an `AudioBuffer` and genre preset string
- Creates an `OfflineAudioContext`
- Wires: source -> VelvetCurveProcessor (with genre preset) -> DynamicsCompressorNode (limiter) -> destination
- Applies loudness normalization targeting -14 LUFS
- Returns the mastered `AudioBuffer`
- No dependency on the live `audioEngine` singleton (creates its own offline context)

```text
Input AudioBuffer
    |
    v
OfflineAudioContext
    |
    v
VelvetCurveProcessor (genre-aware)
  - Warmth (320Hz peaking)
  - Silk Edge (8kHz shelf)
  - Emotion (1kHz peaking)
  - Power Compressor
  - Harmonic Enhancer (HP @ 30Hz)
    |
    v
Safety Limiter (DynamicsCompressorNode, -1dBFS ceiling)
    |
    v
Mastered AudioBuffer
```

### Modified: `src/components/promo/scenes/TryItScene.tsx`

Replace the `supabase.functions.invoke('advanced-mastering')` call with:

1. Decode uploaded file into `AudioBuffer` using browser's `AudioContext.decodeAudioData()`
2. Call `velvetMaster(buffer, selectedGenre)` from the new utility
3. Create object URLs from both original and mastered buffers for `<audio>` playback
4. Calculate before/after LUFS using simple RMS analysis on the buffers
5. Optionally call a lightweight edge function for AI analysis text (genre detection, improvement tips) -- but this is cosmetic, not required for the core demo

Key changes:
- Remove Supabase client import and `functions.invoke` call
- Add `velvetMaster` import
- Add `AudioContext` buffer decoding logic
- Add `audioBufferToWav` import from existing `src/lib/audioExport` for creating playable blobs
- Processing happens instantly (sub-second for most tracks) -- no polling, no waiting for external APIs

### Modified: `supabase/functions/advanced-mastering/index.ts`

Two options:
- **Keep as-is** for any non-promo use cases that still want Auphonic (existing subscribers, etc.)
- **Or** update to remove Auphonic dependency and only provide AI analysis (genre detection, LUFS targets, improvement suggestions via Gemini) while the client handles actual processing

Recommendation: Keep the existing function unchanged for backward compatibility. The promo funnel simply doesn't use it anymore.

### No Changes Needed

- `VelvetCurveProcessor.ts` -- works as-is with any AudioContext including OfflineAudioContext
- `GenreContext.ts` -- genre presets already defined and exported
- `audioExport.ts` -- `audioBufferToWav` already exists for encoding
- `audioEngine.ts` -- not used directly (we create a standalone offline context)

## What the User Experiences

1. Upload a track (WAV/MP3/FLAC, 10MB max)
2. Select a genre preset (Hip Hop, R&B, Pop, etc.)
3. Click "Master My Track"
4. Processing happens instantly in-browser (< 1 second for a 3-minute track)
5. Before/After playback with LUFS comparison
6. "Powered by Velvet Curve" branding on the results

## Why This Is Better

1. **It's YOUR technology** -- visitors experience MixxClub's proprietary Velvet Curve, not a third-party podcast tool
2. **No metronome clicks** -- VelvetCurve is purpose-built for music with genre-aware processing
3. **Instant results** -- client-side OfflineAudioContext renders in under a second vs. 30-60 second Auphonic round-trip
4. **Zero API costs** -- no Auphonic credits consumed for promo demos
5. **Works offline** -- no network dependency for the mastering step
6. **Genre-aware** -- Trap, Drill, R&B presets automatically tune the processing chain

## File Summary

| Action | File | Lines |
|--------|------|-------|
| Create | `src/lib/velvetMaster.ts` | ~80 |
| Modify | `src/components/promo/scenes/TryItScene.tsx` | ~40 lines changed |

Zero new dependencies. Zero new edge functions. Zero external API calls.

