

## Expand ProofScene — Tabbed Product Showcase with Real Screenshots

The MixxCoin images are now in place. The next step from our earlier discussion: expand ProofScene from 4 static features into a **tabbed auto-cycling showcase** with 3 categories and 9 features, using real product screenshots instead of icons.

### What changes

**Single file: `src/components/promo/scenes/ProofScene.tsx`** — full rewrite

**Three tabs** that auto-rotate every 3s (tap to override):

| Tab | Feature | Screenshot Import |
|-----|---------|-------------------|
| **CREATE** | AI Mastering | `before-after-master.jpg` |
| **CREATE** | Hybrid DAW | `daw-interface-hero.jpg` |
| **CREATE** | Prime AI | `primebot-avatar.jpg` |
| **CONNECT** | Engineer Matching | `artist-engineer-match.jpg` |
| **CONNECT** | Real-Time Collabs | `webrtc-collaboration.jpg` |
| **CONNECT** | Battle Tournaments | `mixing-collaboration.jpg` |
| **EARN** | MixxCoinz Economy | `mixxcoinz-hero.png` (already imported) |
| **EARN** | Beat Marketplace | `studio-console-hero.jpg` |
| **EARN** | Distribution Hub | `artist-release-growth.jpg` |

All assets already exist in `src/assets/promo/`. No new files needed.

### Layout

- Three pill tabs at top: **Create** / **Connect** / **Earn** with primary highlight on active
- Active tab shows 3 feature cards with 48x48 rounded screenshot thumbnails (not icons)
- `useState` for active tab + `useEffect` auto-advance timer (3s), reset on manual tap
- Staggered `framer-motion` entry per card using `AnimatePresence` with `mode="wait"` for tab switches
- Logo, headline ("This is Mixxclub."), and closing line stay unchanged

