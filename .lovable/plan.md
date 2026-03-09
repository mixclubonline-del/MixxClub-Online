

# Replace Ecosystem Flow Icons with Character Avatars & Fix Animation Alignment

## What Changes

### 1. Replace Lucide Icons with Character Avatars

Swap the generic icon circles for each role's canonical character portrait:

| Role | Current Icon | New Avatar | Character |
|------|-------------|------------|-----------|
| Producer | Disc3 (generic) | `/assets/characters/rell-portrait.png` | Rell |
| Artist | Music (generic) | `/assets/characters/jax-portrait.png` | Jax |
| Engineer | Headphones (generic) | `/assets/prime-pointing.jpg` | Prime |
| Fan | Heart (generic) | `/assets/characters/nova-portrait.png` | Nova |

Each node circle will render a cropped character portrait (`object-cover` in a `rounded-full` container) instead of a Lucide SVG icon, using the character's canonical `accentColor` for the border and glow.

### 2. Fix Animation Alignment

The current architecture renders SVG paths in an `<svg viewBox="-200 -200 400 400">` but places role nodes as absolutely-positioned `<div>` elements using percentage math. This creates subtle coordinate drift between the animated particle endpoints and the node positions.

**Fix**: Move everything into the same SVG coordinate space. Render the role nodes (now with character avatars) as SVG `<foreignObject>` elements at the exact polar coordinates, eliminating the dual-coordinate-system mismatch. This ensures animated particles travel directly to/from the avatar circles.

### 3. Technical Details

**File**: `src/components/journey/EcosystemFlow.tsx`

- Import `getCharacter` and `CharacterId` from `@/config/characters`
- Update the `nodes` array to include `characterId` instead of `icon`:
  ```
  { id: "producer", label: "Rell", sublabel: "Producer", characterId: "rell", ... }
  { id: "artist", label: "Jax", sublabel: "Artist", characterId: "jax", ... }
  { id: "engineer", label: "Prime", sublabel: "Engineer", characterId: "prime", ... }
  { id: "fan", label: "Nova", sublabel: "Fan", characterId: "nova", ... }
  ```
- Replace the role node `<div>` elements with `<foreignObject>` inside the same SVG, positioned at exact polar coordinates
- Each avatar renders as a `<img>` inside a styled circle container with the character's accent color border and glow
- Display the character name as the primary label and the role as a smaller sublabel beneath
- Remove Lucide icon imports (Music, Headphones, Disc3, Heart) since they are no longer used

**No new dependencies.** Uses existing character config and avatar assets already in the project.

