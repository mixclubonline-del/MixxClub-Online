

# Hallway Scene — Mixxclub Brand Presence Upgrade

## Current State
The hallway has a near-invisible floor logo (13% opacity, perspective-warped infinity symbol only). No wordmark. No tagline. Nothing that says "Mixxclub" to a first-time visitor. The scene is atmospheric but anonymous.

## Vision
Make arriving at the hallway feel like walking up to the entrance of an exclusive club. You see the name, you feel the brand, you know where you are — but it's integrated into the environment, not slapped on like a banner ad.

## Design — Three Brand Layers

### 1. Marquee Logo (Top Center, Above the Door)
A prominent `MixxclubLogo` with the full wordmark + infinity symbol, positioned like a club sign above the hallway entrance. Animated entrance: fades in with a subtle neon glow pulse. Uses the existing `MixxclubLogo` component with `variant="full"` at `size="lg"`.

- Soft ambient glow behind it (radial gradient matching the brand pink-to-cyan palette)
- Gentle breathing animation on the glow (not the logo itself — the light around it)
- Positioned top-center of the scene, floating above the hallway perspective

### 2. Tagline Reveal (Below Marquee)
"From Bedroom to Billboard" fades in 1s after the logo, styled as a subtle etched-glass or frosted subtitle. Small, elegant, muted — like signage on a club window.

### 3. Floor Logo Enhancement
Upgrade the existing floor inlay from 13% to ~20% opacity, and add a very subtle animated light sweep across it (like a spotlight passing over a club floor logo). Keep it perspective-foreshortened.

## Technical Changes

### File: `src/components/scene/StudioHallway.tsx`
- **Replace** the current minimal floor logo block (lines 247-267) with the enhanced version
- **Add** a new marquee brand block positioned at the top-center of the scene, above the hotspots layer
- The marquee includes: `MixxclubLogo` full variant, tagline with staggered delay, and an ambient glow div behind it
- Add a CSS keyframe for the light-sweep effect on the floor logo (inline style or Tailwind arbitrary)

### File: `src/components/brand/MixxclubLogo.tsx`
- No changes needed — already supports `full` and `full-with-tagline` variants

## Layout Structure (Top to Bottom)

```text
┌─────────────────────────────────────┐
│         ∞  Mixxclub                 │  ← Marquee (z-10, top 15%)
│    "From Bedroom to Billboard"      │  ← Tagline (fade-in delay)
│         ╌╌╌glow╌╌╌                  │  ← Ambient brand glow
│                                     │
│    🚪          🚪          🚪       │  ← Studio hotspots
│       🚪          🚪               │
│                                     │
│           ∞ (floor inlay)           │  ← Enhanced floor logo
│                                     │
│        [ Enter the Club ]           │  ← Existing CTA
│     "X creators have walked..."     │  ← Existing social proof
└─────────────────────────────────────┘
```

## Animation Timeline
- **0s**: Background loads
- **0.3s**: Marquee logo fades in with scale (0.95 → 1)
- **0.8s**: Ambient glow begins breathing
- **1.3s**: Tagline fades in from below
- **1.5s**: CTA appears (existing timing)
- **Continuous**: Floor logo light sweep (slow, 8s cycle)

## Key Principles
- The branding is environmental, not overlay — it feels part of the space
- Glow effects use the brand gradient (pink → lavender → cyan)
- Everything is `pointer-events-none` except the CTA
- Mobile: marquee scales down gracefully, floor logo hidden on small screens (already handled by `fullscreen` prop)

