

# Cinematic Phase Backgrounds: MixClub Edition

## The Shift

| Before | After |
|--------|-------|
| Prime character renders | Real people making music |
| AI mascot-centric | Human connection-centric |
| Existing prime_* assets | Fresh Dream Engine generations |
| Single character focus | Community/network visuals |

---

## New Background Concept: "The People Behind the Music"

Each phase background should feel like a **documentary still** — real moments from the creative process, not character portraits.

### Phase 1: "THE PROBLEM"
**Visual**: Lone creator at 3am, surrounded by unfinished projects
**Mood**: Isolation, frustration, unrealized potential
**No Prime**: This is about the artist's struggle, not a guide
**Palette**: Deep purple shadows, harsh screen glow

```text
Prompt: "Cinematic wide shot of a music producer alone at 3am in a small bedroom studio. Multiple monitors showing DAW with unfinished projects. Hard drives stacked on desk. The weight of unreleased music visible in their tired posture. Purple-blue mood lighting. Documentary style, real moment. 8K photorealistic."
```

### Phase 2: "THE DISCOVERY"  
**Visual**: Light breaking through — the MixClub logo/portal emerging
**Mood**: Hope, possibility, the solution appearing
**No Prime**: The platform itself is the discovery
**Palette**: Dark purple transitioning to warm gold

```text
Prompt: "Abstract cinematic visualization of hope dawning. Infinity symbol (MixClub logo shape) forming from light particles in dark space. Colors shifting from deep purple to warm gold. Digital gateway opening. The moment of realization. 8K digital art, premium quality. No people, pure concept."
```

### Phase 3: "THE CONNECTION"
**Visual**: Split-screen of artist + engineer in their respective spaces, connected
**Mood**: Collaboration across distance, human bond
**No Prime**: Two real people, not a mascot introducing them
**Palette**: Warm tones, connection energy

```text
Prompt: "Split composition cinematic shot: Young Black male artist in home bedroom studio (Brooklyn aesthetic) on left, professional female engineer at mixing console (Lagos studio) on right. Subtle beam of musical energy/data visualization connecting them across the frame. Both focused, both real. Warm collaboration energy. Documentary photography style. 8K cinematic."
```

### Phase 4: "THE TRANSFORMATION"
**Visual**: Before/after sonic transformation — waveforms, meters, the craft
**Mood**: Technical excellence, the magic of engineering
**No Prime**: The work speaks for itself
**Palette**: Purple to gold gradient, frequency spectrum colors

```text
Prompt: "Abstract visualization of audio transformation. Raw chaotic waveform on left side morphing into clean, professional mastered waveform on right. LUFS meter climbing. Frequency spectrum analysis visible. The craft of audio engineering visualized. Purple, cyan, and gold color palette. 8K digital visualization. No people, pure audio art."
```

### Phase 5: "THE TRIBE"
**Visual**: Global network of creators — constellation of real faces
**Mood**: Belonging, community, scale with intimacy
**No Prime**: The community IS the star
**Palette**: Deep space with warm node glows

```text
Prompt: "Global network visualization with real human elements. Glowing circular portrait nodes of diverse music creators around the world (different ages, ethnicities, genders) connected by pulsing light streams forming infinity symbol pattern. Community constellation floating in space. Purple, cyan, and gold connection lines. Some faces in focus, others abstract. 8K cinematic digital art."
```

### Phase 6: "THE INVITATION"
**Visual**: Open door to a vibrant studio space — the threshold
**Mood**: Welcoming, aspirational, "your seat is saved"
**No Prime**: An empty chair waiting for YOU
**Palette**: Purple shadows outside, golden warmth inside

```text
Prompt: "Cinematic shot of ornate studio door opening into a vibrant, professional recording studio. Warm golden light spilling out into dark purple hallway. Inside: mixing console, monitors, instruments, plants. An empty chair at the desk — waiting for the viewer. The threshold to belonging. Welcoming, aspirational. 8K photorealistic."
```

---

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/components/demo/PhaseBackground.tsx` | Create | Cinematic phase background component with cross-fade transitions |
| `src/hooks/useDemoPhaseAssets.ts` | Create | Hook to fetch demo_phase_* assets from brand_assets table |
| `src/components/demo/InsiderDemoExperience.tsx` | Update | Integrate PhaseBackground component |

---

## Asset Context Naming

All new assets will use the `demo_phase_` prefix:

| Phase ID | Asset Context |
|----------|---------------|
| problem | `demo_phase_problem` |
| discovery | `demo_phase_discovery` |
| connection | `demo_phase_connection` |
| transformation | `demo_phase_transformation` |
| tribe | `demo_phase_tribe` |
| invitation | `demo_phase_invitation` |

---

## PhaseBackground Component Design

```text
Layer Stack (bottom to top):

1. Cinematic Image (object-cover, 0.5-0.7 opacity)
   - Cross-fades between phases
   - AnimatePresence for smooth transitions

2. Darkening Gradient Overlay
   - Ensures text readability
   - from-background/80 via-background/40 to-background/90

3. Audio-Reactive Glow Layer
   - Existing radial gradients
   - Pulses with bass/amplitude

4. Content Layer
   - Phase text, typewriter, CTAs
```

---

## Generation Strategy

### Option A: Generate Now (Recommended)
Use Dream Engine to generate all 6 backgrounds before implementing:
1. Navigate to admin Dream Engine page
2. Generate each image with prompts above
3. Save with `demo_phase_{phaseId}` context
4. Implement PhaseBackground component to consume them

### Option B: Implement First, Generate Later
Build the component with gradient-only fallbacks, then generate assets when ready

---

## Fallback Behavior

Since we're NOT using prime_* assets:

```text
1. Check for demo_phase_{phaseId} asset → Use if exists
2. Use phase-specific gradient palette → Always works

NO prime_* fallback chain.
```

Each phase will have a unique gradient palette as fallback:

| Phase | Fallback Gradient |
|-------|-------------------|
| problem | Deep purple + destructive red accents |
| discovery | Purple to gold radial bloom |
| connection | Warm split (pink left, cyan right) |
| transformation | Purple to gold horizontal |
| tribe | Multi-point network glow |
| invitation | Gold center, purple edges (doorway) |

---

## Validation Criteria

- Zero Prime assets used in demo backgrounds
- Each phase has a unique, cinematic background
- Imagery focuses on real people or abstract concepts (not mascots)
- Backgrounds tell the "Find Your People" story visually
- Cross-fade transitions are smooth (0.8-1s)
- Content remains readable over all backgrounds
- Audio-reactive layer still visible
- Graceful gradient fallback if assets missing

