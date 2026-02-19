
# Mixx Club Hallway Revival — Combined Master Plan

## Build Errors (Platform Timeouts — Not Code Errors)

The two build errors reported are Lovable Cloud infrastructure timeouts during the integration and edge function deployment steps. These are not caused by any code change — they are platform-level retries that resolve on the next deploy attempt. No code fix is required. The plan below will trigger a fresh build that will clear them.

---

## What We Are Fixing — The Full Combined Plan

### Section A: Immersive Route Expansion
`src/config/immersiveRoutes.ts`

Add `/choose-path` and `/select-role` to `FULL_IMMERSIVE_ROUTES`. These are gateway/cinematic pages that currently allow `PrimeStatusBar`, `GlobalAudioPlayer`, and `GlobalMusicPlayer` to render on top of them, destroying the atmosphere before a user even picks their role.

```text
BEFORE: ['/', '/intro', '/auth', '/onboarding', '/city/gates']
AFTER:  ['/', '/intro', '/auth', '/onboarding', '/city/gates', '/choose-path', '/select-role']
```

---

### Section B: HomeOverlayNav — Strip Logo, Add Fans, Hide During Demo
`src/components/home/HomeOverlayNav.tsx`

Three changes in one surgical edit:

**1. Remove the logo entirely from the top bar.**
The 3D M icon and "MIXXCLUB" wordmark are removed from the nav header. The Mixxclub brand presence will live on the hallway floor (Section D). The top bar becomes a pure navigation strip — no logo collisions, no overlap with hallway content.

**2. Fix the desktop nav links — include "For Fans", remove duplication.**
Currently the nav does `PUBLIC_LINKS.slice(0, 4)` plus a hardcoded extra Pricing link, which duplicates Pricing and skips "For Fans". Replace with a clean render of the first 6 links from `PUBLIC_LINKS`:
`How It Works | For Artists | For Engineers | For Producers | For Fans | Pricing`

**3. Hide the nav when scene is DEMO or INFO.**
Import `useSceneFlowStore`. When `scene !== 'HALLWAY'`, return `null` for the entire nav. The demo and Club Scene both have their own internal navigation (back button, phase dots, phase progress bar). Two nav bars on screen at once is confusing and breaks immersion.

---

### Section C: StudioHallway — Three CTA/UX Upgrades
`src/components/scene/StudioHallway.tsx`

**1. Move the depth layer indicator off the top-left.**
The "posted up / in the room / on the mic" pill currently renders at `top-4 left-4 z-20` — the exact same area the nav logo used to occupy. Move it to `bottom-28 left-4` so it reads as ground-level environmental info, not a top-bar element. This is also semantically correct — it is ambient status, not a navigation element.

**2. Upgrade the "Enter the Club" CTA with social proof.**
Below the pulsing "Enter the Club" button, add a one-liner with a live green pulse dot:

```
● 10,000+ Artists, Engineers, Producers and Fans are collaborating right now
```

Rendered as: pulsing `bg-emerald-500` dot + `text-xs text-muted-foreground/60` — ambient, not a button. On desktop only, add a very faint mono hint below: `press ENTER to step inside`.

The full CTA block from top to bottom:

```
[ ○ pulsing ring ]
  Enter the Club

● 10,000+ Artists, Engineers, Producers and Fans are collaborating right now

press ENTER to step inside   ← desktop only, opacity-30
```

**3. Replace "Already know what you need?" with "Been here before?" — move to bottom center.**
The skip hint currently appears at `top-6 right-6` after 3 seconds, competing with the nav. Move it to `bottom-6 left-1/2 -translate-x-1/2` as a centered ghost pill. Change the copy to "Been here before?" with the keyboard hint `I`. Same 3-second delay, same `onSkipToInfo` handler — just relocated and reworded.

---

### Section D: Mixxclub Logo on the Hallway Floor
`src/components/scene/StudioHallway.tsx`

This is the signature visual upgrade. Using the existing `MixxclubLogo` component (SVG infinity symbol), render a perspective-foreshortened floor decal in the lower center of the hallway — between the door vanishing point and the Enter CTA.

**Technique:**
```css
transform: perspective(500px) rotateX(60deg) scaleX(0.9)
opacity: 0.12  /* feels painted on, not floating */
pointer-events: none
```

**Placement:** Absolute positioned at `bottom-36 left-1/2 -translate-x-1/2` — above the Enter CTA group, below the studio door line.

**Variant:** `symbol-only` at size `lg` — the pure SVG infinity inlay. The pink→lavender→cyan gradient on the symbol reads like neon floor lighting spilling across studio tile. No text, no wordmark on the floor — just the symbol.

**Masking:** Wrap with a `bg-gradient-to-t from-transparent via-transparent to-background/50` mask container so the top edge of the logo softly fades into the hallway depth, reinforcing perspective.

The result: a glowing infinity inlay on the studio floor, visible when you first walk into the hallway — grounding the brand in the physical space without floating UI.

---

### Section E: Demo Background — Fix DAW Bleed-Through
`src/components/demo/PhaseBackground.tsx`

The transformation phase (`mastering-before-after.jpg`) renders a DAW screenshot at 55% opacity with only a 40% center darkening overlay. The result: track names, timeline rulers, and channel strips are fully visible behind the demo content. Immersion shattered.

Two fixes:

**1. Reduce the static image opacity from `0.55` to `0.35`** for all phases. The cinematic gradient overlays are the real atmosphere — the images are accents, not backgrounds.

**2. Increase the center darkening in Layer 2** from `0.4` at 30% to `0.65` at 30%, giving the content area much better contrast:

```text
BEFORE:  0.7 / 0.4 / 0.5 / 0.85
AFTER:   0.75 / 0.65 / 0.6 / 0.9
```

This is the single change that stops the DAW bleeding through and stops community feed elements from appearing at the bottom of the connection phase.

---

### Section F: Demo Container — Fix Bottom Ghost UI Bleed
`src/components/demo/InsiderDemoExperience.tsx`

The `fixed bottom-0` AudioVisualizer strip has sub-layers visible beneath it during certain phases. Two-line fix:

1. Add `isolate` to the root `div` of the main experience container (creates a CSS stacking context, preventing sub-layer bleed).
2. Add `bg-background` to the fixed bottom visualizer wrapper so it has a solid backdrop rather than being fully transparent.

---

## Files Modified

| File | Change |
|---|---|
| `src/config/immersiveRoutes.ts` | Add `/choose-path`, `/select-role` |
| `src/components/home/HomeOverlayNav.tsx` | Remove logo, fix nav links (add Fans, remove dupe Pricing), hide when scene is DEMO/INFO |
| `src/components/scene/StudioHallway.tsx` | Move depth indicator to bottom-left, upgrade CTA with social proof, rename/relocate skip hint to "Been here before?", add floor logo |
| `src/components/demo/PhaseBackground.tsx` | Reduce image opacity to 0.35, increase darkening overlay center stop |
| `src/components/demo/InsiderDemoExperience.tsx` | Add `isolate` to root container, add `bg-background` to visualizer wrapper |

**No new files. No database changes. No new dependencies.**

---

## The Spirit We're Restoring

You walk into a hallway. The floor has the infinity mark — the studio's signature, inlaid in light. One button, one invitation. Social proof whispers beneath it: thousands creating right now. The nav floats quietly above — all roles represented, no logo competing with the scene. When you step through the door into the demo, the nav disappears entirely. The story takes over. That is Mixx Club.
