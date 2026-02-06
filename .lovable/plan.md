# MixClub Development Plan

## Active Standard: 2026 Visual Building Doctrine

**Status:** ✅ LOCKED IN (February 2026)

All future development follows the Showcase-First Visual Standard. See `VISUAL_STANDARDS.md` for full doctrine.

---

## The Doctrine (Quick Reference)

```
Showcase-First. Imagery is mandatory. Motion is meaning.
Text-only grids are deprecated. Hover reveals on desktop, visible stats on mobile.
Use the ShowcaseFeature pattern as baseline.
If it doesn't elevate, don't ship it.
We build forward. We never go backwards.
```

---

## Standard Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `ShowcaseFeature` | `src/components/services/ShowcaseFeature.tsx` | Primary content block with image + stats + badges |
| `ScrollRevealSection` | `src/components/landing/ScrollRevealSection.tsx` | Wrapper for scroll-triggered reveals |
| `ServiceRoomView` | `src/components/services/ServiceRoomView.tsx` | Immersive service page wrapper |

---

## Asset Organization

```
src/assets/promo/
└── {context}-{subject}.jpg
```

**Examples:** `mixing-console-close.jpg`, `ai-neural-network.jpg`

**Generation:** Dream Engine (Gemini 3 Pro Image) preferred

---

## Migration Status

### ✅ Compliant
- `/showcase` — Reference implementation
- `/services/mixing` — Upgraded Feb 2026
- `/services/mastering` — Upgraded Feb 2026
- `/services/ai-mastering` — Upgraded Feb 2026

### 🔲 High Priority (Phase 4)
- `/for-artists` — Portal page
- `/for-engineers` — Portal page
- `/how-it-works` — Platform explainer
- `/enterprise` — Enterprise info

### 🔲 Medium Priority (Phase 5)
- `/community` — Hub sections
- `/pricing` — Plan comparisons
- `/about` — Company story

---

## Implementation Checklist

Before any page ships:

- [ ] Major content sections use `ShowcaseFeature` pattern
- [ ] Each feature has dedicated imagery
- [ ] Scroll animations implemented (`whileInView`)
- [ ] Hover interactions on desktop
- [ ] Mobile shows stats by default
- [ ] Tech badges visible
- [ ] Images lazy-loaded
- [ ] Alternating layout rhythm

---

## Reference Documents

- `VISUAL_STANDARDS.md` — Full visual doctrine
- `DEVELOPMENT_PHILOSOPHY.md` — Core development pillars

---

**Last Updated:** February 2026
