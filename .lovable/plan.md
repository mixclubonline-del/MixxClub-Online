
# Dream Engine City District - Implementation Plan

## Summary

Transform the Dream Engine from a standalone utility at `/dream-engine` into an immersive **Dream Chamber** district at `/city/dream`, featuring Prime as the guiding presence and full integration with the MixxClub City visual language.

---

## Implementation Sequence

### 1. Add District Configuration to DistrictPortal

Update `src/components/ui/DistrictPortal.tsx` to include the 'dream' district entry:
- Use `district-neural.jpg` as the background (creative/AI theme alignment)
- Set glow color to purple-cyan blend (`270 75% 55%`) for the creative vision aesthetic

### 2. Create Dream Chamber Components

**New File: `src/components/dream/DreamChamberGuide.tsx`**
- Prime avatar with state-aware behavior (idle, generating, success)
- Contextual quotes about vision and creation
- Ambient glow effects matching the creative theme
- Reacts to `isGenerating` and `hasResult` states

**New File: `src/components/dream/DreamHero.tsx`**
- Cinematic header section with "Dream Chamber" title
- Mode selector integrated as sleek pill buttons
- Live assets count badge
- Prime character placement

**New File: `src/components/dream/EnhancedPromptCard.tsx`**
- Holographic-styled prompt cards with depth effects
- Category icons and glow states
- Prime commentary on hover (optional)
- Improved visual hierarchy

**New File: `src/components/dream/GenerationReveal.tsx`**
- Full-screen theatrical reveal overlay
- Particle effects during generation
- Prime reaction on completion
- Enhanced save/discard actions

### 3. Create Dream Chamber Page

**New File: `src/pages/city/DreamChamber.tsx`**
- Wrap with `DistrictPortal` using 'dream' district ID
- Integrate all Dream Engine functionality via `useDreamEngine` hook
- Add Prime guide component throughout
- Glassmorphic card styling matching other city districts
- Organized sections: Hero, Vision Templates, Freeform Dream, City Canvas

### 4. Update Routes

**Modify: `src/routes/cityRoutes.tsx`**
- Add `/city/dream` route pointing to DreamChamber

**Modify: `src/routes/appRoutes.tsx`**
- Redirect `/dream-engine` → `/city/dream`

### 5. Add District to Tower Navigation

**Modify: `src/pages/city/MixxTechTower.tsx`**
- Add Dream Chamber to the districts array
- Include in quick actions ("Dream Vision" button)
- Purple-cyan gradient icon styling

### 6. Extend Character Quotes (Optional)

**Modify: `src/config/characters.ts`**
- Add 'Dream Chamber' to Prime's locations
- Include dream-specific contextQuotes for generation states

---

## File Changes Summary

### New Files (6)
```text
src/pages/city/DreamChamber.tsx          - Main district page
src/components/dream/DreamChamberGuide.tsx - Prime character component
src/components/dream/DreamHero.tsx        - Hero section with mode selector
src/components/dream/EnhancedPromptCard.tsx - Upgraded prompt cards
src/components/dream/GenerationReveal.tsx  - Theatrical generation reveal
```

### Modified Files (4)
```text
src/components/ui/DistrictPortal.tsx     - Add 'dream' district config
src/routes/cityRoutes.tsx                - Add /city/dream route
src/routes/appRoutes.tsx                 - Redirect /dream-engine
src/pages/city/MixxTechTower.tsx         - Add Dream Chamber to navigation
```

---

## Technical Details

**Character Integration:**
- Use `CharacterAvatar` and `getCharacter('prime')` for consistent rendering
- Prime quotes for dreaming state: "See it before you build it.", "The city's look is in your hands.", "Dream it. Save it. Ship it."
- Prime reaction quotes: "That's the one.", "Vision locked.", "Now make it live."

**Generation State Handling:**
- Idle: Prime with ambient quote and glow
- Generating: Prime with "Dreaming..." pulsing animation
- Success: Prime celebration with reaction + result reveal
- Error: Prime with encouraging recovery quote

**Visual Styling:**
- Glassmorphic cards: `bg-card/50 backdrop-blur border-border/50`
- Ambient glows: `hsl(270 75% 55%)` purple-cyan creative energy
- Prompt cards: holographic depth with subtle parallax on hover
- Generation reveal: full-screen overlay with particle burst

**Mobile Optimization:**
- Prime guide as mini-avatar fixed at bottom during scroll
- Mode selector as horizontal scroll tabs
- Prompt cards in single-column layout
- Touch-friendly 44px+ hit targets

---

## Expected Outcome

The enhanced Dream Chamber will:
1. Integrate seamlessly into MixxClub City as `/city/dream`
2. Feature Prime as a contextual guide throughout the generation experience
3. Transform AI generation from utility into creative ritual
4. Match the immersive aesthetic of other city districts
5. Provide theatrical reveal animations for generated assets
6. Work beautifully across all device sizes
