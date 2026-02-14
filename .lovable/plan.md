

## Ambient Audio Cues for the Studio Hallway

### Concept

Each active studio door emits a subtle, muffled bass hum — the kind you'd hear walking past a studio where someone's mixing at 2 AM. The hum gets louder and richer when you hover over a door, as if you're leaning in to listen. Recording rooms get a distinct low-frequency pulse. Idle rooms are silent.

This uses the Web Audio API directly (no file assets needed) — synthesized low-frequency tones with heavy filtering to sound like bass bleeding through walls.

---

### Architecture

A new `HallwayAmbientAudio` hook creates a single shared AudioContext with one oscillator + filter per active room. Gain nodes control volume based on hover state and room activity. Everything cleans up on unmount.

```text
Per active room:
  OscillatorNode (40-80Hz sine)
    --> BiquadFilter (lowpass, cutoff ~120Hz = "wall muffling")
      --> GainNode (volume: idle=0.02, hover=0.12)
        --> MasterGain (global volume)
          --> AudioContext.destination
```

---

### New File: `src/hooks/useHallwayAmbience.ts`

A hook that:
- Takes an array of `StudioRoom` objects and the currently hovered room ID
- Creates one oscillator per active room (frequency varies slightly per room for organic feel)
- Recording rooms get a slower LFO modulation on the gain (pulsing bass)
- On hover, smoothly ramps the hovered room's gain up (using `linearRampToValueAtTime` for smooth transitions)
- All rooms get a very faint baseline hum (barely audible) when active
- Returns a `startAmbience()` function (must be called from a user gesture to satisfy browser autoplay policy)
- Cleans up all nodes on unmount

Key parameters:
- Base frequency per room: `40 + (roomIndex * 7)` Hz (each door has a slightly different pitch)
- Muffling filter: lowpass at 100-150 Hz, Q of 1
- Idle gain: 0.015 (barely perceptible)
- Hover gain: 0.08 (noticeable but not intrusive)
- Recording rooms: gain modulated with a secondary LFO oscillator at 0.5Hz
- Ramp time: 300ms for smooth hover transitions

### Changes to: `src/components/scene/DepthAwareHotspot.tsx`

- Accept a new `onHoverChange?: (roomId: string, hovered: boolean) => void` callback prop
- Call it from the existing `onMouseEnter`/`onMouseLeave` handlers alongside the existing `setIsHovered` state

### Changes to: `src/components/scene/StudioHallway.tsx`

- Import and use `useHallwayAmbience` hook, passing the studios array and tracked hover state
- Track `hoveredRoomId` in local state, passed down to hotspots via `onHoverChange`
- Auto-start ambience on first user interaction (click on "Enter the Club" or any hover, using a one-time `useRef` guard)
- Pass `onHoverChange` to each `DepthAwareHotspot`

### Browser Autoplay Compliance

The `AudioContext` is created in a `suspended` state. On the first user gesture (click/hover on any hallway element), we call `ctx.resume()`. This follows the graceful degradation pattern already established — if audio fails, the hallway works fine visually.

### No New Dependencies

Pure Web Audio API synthesis. No audio files to load or store.

---

### What This Sounds Like

- Walking into the hallway: silence, then faint low hums emerge from lit doors
- Hovering over an active door: the hum swells — like pressing your ear to the wall
- Recording room: the hum pulses slowly, a heartbeat-like throb
- Moving away: the hum fades back to ambient
- Idle/empty rooms: complete silence

