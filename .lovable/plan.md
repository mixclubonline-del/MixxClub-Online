

## Hallway Session Presence: From UI Dots to Environmental Storytelling

### The Problem
The current `DepthAwareHotspot` renders floating circles and mini-avatar dots positioned over the hallway image at fixed percentage coordinates. It looks like a game HUD overlaid on a photograph — instantly breaking the cinematic, wordless immersion the hallway is designed to create.

### The Concept: "Light Under the Door"

In a real studio hallway, you know a room is occupied because:
- Warm light spills from under the door
- You hear muffled bass or vocal bleed
- The "Recording" light above the door is on
- Maybe you see shadows moving through frosted glass

We replace all floating UI dots with **environmental light effects** that feel like they belong in the hallway image itself.

---

### Design: Four Presence Signals (No Floating UI)

#### 1. Door Light Spill (replaces the glowing circle)
A soft, horizontal gradient strip positioned at the bottom of each door position — simulating light leaking from under a studio door. Color communicates state:
- **Warm amber/gold**: Active session (people creating)
- **Red pulse**: Recording in progress (do not disturb energy)
- **Cool dim**: Idle / empty room
- **No light**: No session

The light is a CSS gradient with subtle breathing animation, not a circle. It sits flush with the "floor" of the hallway perspective.

#### 2. Bass Ripple (replaces participant count dots)
Instead of showing avatar circles, active rooms emit subtle concentric ripple rings from the door base — like bass frequencies vibrating the hallway floor. More participants = more frequent/wider ripples. This communicates "energy level" without showing literal UI elements.

#### 3. Recording Beacon (replaces the red dot)
A small, fixed-position glow above the door position — mimicking a studio "Recording" light. Only visible when `room.state === 'recording'`. Just a tiny warm-red dot that pulses slowly, like a real indicator light mounted on the wall.

#### 4. Hover: Frosted Glass Reveal (replaces the tooltip card)
On hover, instead of a floating card, the door area gets a frosted-glass overlay effect that reveals session info as if you're peering through a studio door window. The info fades in with a depth-of-field blur transition, feeling like your eyes are adjusting to look through glass — not like a tooltip popped up.

---

### Progressive Revelation (Depth Layers) — Unchanged Logic, New Visuals

| Depth Layer | What You See |
|---|---|
| **Posted Up** | Faint door light spill only (ambient awareness). No interaction. |
| **In the Room** | Brighter light spill + bass ripples + session title fades in on hover (frosted glass). |
| **On the Mic** | Full light + ripples + clickable doors (cursor changes, light brightens on hover). |
| **On Stage** | Your door has a spotlight bloom effect — you ARE the energy source. Premium glow that bleeds into the hallway. |

---

### Technical Changes

#### File: `src/components/scene/DepthAwareHotspot.tsx` (full rewrite)

Replace all four sub-components (`PostedUpView`, `InTheRoomView`, `OnTheMicView`, `OnStageView`) with new environmental versions:

- **`DoorLightSpill`**: A `div` with a horizontal radial gradient (`bg-gradient-radial`), width ~120px, height ~8px, positioned at the door's floor line. Opacity and color animated via framer-motion based on room state.

- **`BassRipple`**: 2-3 concentric `div` rings that scale outward and fade, originating from the door base. Frequency tied to `participantCount`. Uses `motion.div` with staggered `repeat: Infinity` animations.

- **`RecordingBeacon`**: A 6x6px circle positioned above the door, red with slow opacity pulse. Only rendered when `room.state === 'recording'`.

- **`FrostedGlassReveal`**: On hover, a `backdrop-blur` container fades in at the door position with session title and participant count. Styled as a frosted rectangle (not a floating card), with `bg-background/20 backdrop-blur-lg border border-white/10`.

- **`SpotlightBloom`** (On Stage only): A large radial gradient div that extends beyond the door area, simulating a spotlight beam on the hallway floor. Uses `mix-blend-mode: screen` for a natural light-additive effect.

#### File: `src/components/scene/StudioHallway.tsx` (minor adjustments)

- Remove the separate "Active session count indicator" bottom bar (the floating pill that says "3 sessions active"). Instead, the hallway's overall ambient light level communicates this — more active rooms = more light in the hallway image (the base-to-active crossfade already handles this).
- Keep the depth layer indicator (top-left) as is — it's meta-UI, not part of the scene.
- Keep the "Enter the Club" CTA button as is — it's intentionally outside the illusion.

#### File: `src/components/scene/StudioHotspot.tsx`

- No changes needed (this is the legacy non-depth version, unused when `DepthAwareHotspot` is active).

---

### What Gets Removed
- Floating colored circles (the main hotspot dots)
- Mini avatar row beneath hotspots
- Floating tooltip cards with borders and shadows
- "X sessions active" bottom pill indicator

### What Gets Added
- Horizontal light-under-door gradients
- Bass ripple ring animations
- Recording beacon (wall-mounted red light feel)
- Frosted glass hover reveal
- On Stage spotlight bloom

### No New Dependencies
All effects use existing framer-motion + Tailwind + CSS gradients. No new packages needed.

