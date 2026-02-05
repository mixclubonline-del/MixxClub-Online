

# Generate Cinematic Demo Phase Backgrounds

## Summary

Add the 6 documentary-style demo phase prompts to the Dream Engine and create a one-click batch generation workflow. This will populate the `brand_assets` table with cinematic backgrounds that the `PhaseBackground` component will automatically consume.

---

## Database Setup

Create 6 new asset contexts for the demo phases:

| Context Prefix | Name | Description |
|----------------|------|-------------|
| `demo_phase_problem` | Demo: The Problem | Lone creator at 3am, isolation and unrealized potential |
| `demo_phase_discovery` | Demo: The Discovery | Light breaking through, hope dawning |
| `demo_phase_connection` | Demo: The Connection | Split-screen artist and engineer collaborating |
| `demo_phase_transformation` | Demo: The Transformation | Audio waveform before/after visualization |
| `demo_phase_tribe` | Demo: The Tribe | Global network constellation of creators |
| `demo_phase_invitation` | Demo: The Invitation | Open studio door, welcoming threshold |

---

## Prompt Library Addition

Add a new `demo_phase_` section to `PROMPT_PRESETS` in `DreamEngine.tsx`:

```typescript
demo_phase_: [
  {
    id: 'problem',
    name: 'The Problem',
    context: 'demo_phase_problem',
    prompt: 'Cinematic wide shot of a music producer alone at 3am in a small bedroom studio. Multiple monitors showing DAW with unfinished projects. Hard drives stacked on desk. The weight of unreleased music visible in their tired posture. Purple-blue mood lighting. Documentary style, real moment. 8K photorealistic.',
  },
  {
    id: 'discovery',
    name: 'The Discovery',
    context: 'demo_phase_discovery',
    prompt: 'Abstract cinematic visualization of hope dawning. Infinity symbol (MixClub logo shape) forming from light particles in dark space. Colors shifting from deep purple to warm gold. Digital gateway opening. The moment of realization. 8K digital art, premium quality. No people, pure concept.',
  },
  {
    id: 'connection',
    name: 'The Connection',
    context: 'demo_phase_connection',
    prompt: 'Split composition cinematic shot: Young Black male artist in home bedroom studio (Brooklyn aesthetic) on left, professional female engineer at mixing console (Lagos studio) on right. Subtle beam of musical energy/data visualization connecting them across the frame. Both focused, both real. Warm collaboration energy. Documentary photography style. 8K cinematic.',
  },
  {
    id: 'transformation',
    name: 'The Transformation',
    context: 'demo_phase_transformation',
    prompt: 'Abstract visualization of audio transformation. Raw chaotic waveform on left side morphing into clean, professional mastered waveform on right. LUFS meter climbing. Frequency spectrum analysis visible. The craft of audio engineering visualized. Purple, cyan, and gold color palette. 8K digital visualization. No people, pure audio art.',
  },
  {
    id: 'tribe',
    name: 'The Tribe',
    context: 'demo_phase_tribe',
    prompt: 'Global network visualization with real human elements. Glowing circular portrait nodes of diverse music creators around the world (different ages, ethnicities, genders) connected by pulsing light streams forming infinity symbol pattern. Community constellation floating in space. Purple, cyan, and gold connection lines. Some faces in focus, others abstract. 8K cinematic digital art.',
  },
  {
    id: 'invitation',
    name: 'The Invitation',
    context: 'demo_phase_invitation',
    prompt: 'Cinematic shot of ornate studio door opening into a vibrant, professional recording studio. Warm golden light spilling out into dark purple hallway. Inside: mixing console, monitors, instruments, plants. An empty chair at the desk — waiting for the viewer. The threshold to belonging. Welcoming, aspirational. 8K photorealistic.',
  },
]
```

---

## Batch Generation Component

Create a new `DemoPhaseGenerator` component for the Dream Engine page that:

1. Shows all 6 phases with their prompts
2. Displays generation status (pending, generating, complete)
3. Provides "Generate All" button for one-click generation
4. Auto-saves each generated image with `makeActive: true`
5. Shows real-time progress (1/6, 2/6, etc.)

```text
UI Layout:

┌────────────────────────────────────────────────┐
│ 🎬 Demo Phase Backgrounds                       │
│ Generate all 6 cinematic backgrounds for demo   │
├────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│ │ PROBLEM  │ │ DISCOVERY│ │CONNECTION│          │
│ │ ⏳ Pending│ │ 🔄 Gen... │ │ ✅ Done  │          │
│ └──────────┘ └──────────┘ └──────────┘          │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│ │TRANSFORM │ │  TRIBE   │ │INVITATION│          │
│ │ ⏳ Pending│ │ ⏳ Pending│ │ ⏳ Pending│          │
│ └──────────┘ └──────────┘ └──────────┘          │
│                                                 │
│ [🎬 Generate All Demo Backgrounds]   (2/6 done) │
└────────────────────────────────────────────────┘
```

---

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/pages/DreamEngine.tsx` | Update | Add `demo_phase_` prompts to `PROMPT_PRESETS` |
| `src/components/dream/DemoPhaseGenerator.tsx` | Create | Batch generation UI component |
| Database migration | Create | Insert 6 `demo_phase_` contexts into `asset_contexts` table |

---

## Generation Flow

```text
User clicks "Generate All Demo Backgrounds"
           │
           ▼
┌─────────────────────────────────┐
│ For each phase (1-6):           │
│  1. Call dream-engine function  │
│     mode: 'image'               │
│     style: 'cinematic'          │
│     save: true                  │
│     makeActive: true            │
│  2. Wait for completion         │
│  3. Update UI with result       │
│  4. Move to next phase          │
└─────────────────────────────────┘
           │
           ▼
   All 6 images saved to brand_assets
   PhaseBackground auto-consumes them
```

---

## Technical Details

### Context Enhancement

Update the `contextEnhancements` in `dream-engine/index.ts` to include demo phase styling:

```typescript
demo_phase_: "cinematic documentary photography, emotional storytelling, MixClub narrative visual, music industry atmosphere, 8K quality"
```

### Generation Timing

Each image takes approximately 10-20 seconds to generate. Total batch time: ~1-2 minutes for all 6 phases. The UI will show real-time progress.

### Error Handling

If a single generation fails:
- Show error on that phase card
- Continue with remaining phases
- Allow retry for failed phases only

---

## Validation Criteria

- All 6 prompts appear in Dream Engine under "Demo Phase" context filter
- Batch generator shows all 6 phases with clear status indicators
- Each generation auto-saves with `demo_phase_{phaseId}` context
- Each generation is set as active automatically
- Demo experience immediately shows new backgrounds after generation
- Gradient fallbacks still work if any generation fails

