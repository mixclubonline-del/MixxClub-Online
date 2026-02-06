# MixxTech Visual Building Standards (2026)

> **Effective Date:** February 2026  
> **Standard:** Showcase-First, Elevate or Don't Ship  
> **Philosophy:** If it doesn't push technology forward, don't implement it

---

## Core Visual Pillars

| Pillar | Definition | Anti-Pattern |
|--------|------------|--------------|
| **Showcase-First** | Every major content section uses alternating image+content layouts | Text-only feature grids |
| **Motion as Meaning** | Scroll reveals, hover interactions, subtle parallax | Static page loads |
| **Imagery is Mandatory** | Features paired with dedicated visuals | Icon-only cards |
| **Stats on Hover** | Interactive data reveals on desktop | Always-visible clutter |
| **Mobile-Visible Stats** | Stats grid always shown on mobile | Hidden important data |
| **Tech Badge Floating** | Technology stack visible as floating badges | Buried in paragraphs |

---

## Required Components

### ShowcaseFeature (Primary Content Block)

**Location:** `src/components/services/ShowcaseFeature.tsx`

Every service page, product page, and major landing section uses this pattern.

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `image` | string | ✓ | AI-generated or professional imagery |
| `icon` | LucideIcon | ✓ | Section identification icon |
| `title` | string | ✓ | Bold headline (2xl-4xl) |
| `subtitle` | string | ✓ | Badge text for categorization |
| `description` | string | ✓ | Detailed explanation |
| `stats` | Array<{ label, value }> | ✓ | Metrics for hover/display |
| `techDetails` | string[] | ✓ | Technology/capability badges |
| `reversed` | boolean | ○ | Alternate layout direction |
| `delay` | number | ○ | Animation delay |

**Usage Pattern:**
```tsx
{features.map((feature, index) => (
  <ShowcaseFeature
    key={feature.title}
    {...feature}
    reversed={index % 2 !== 0}
  />
))}
```

### ScrollRevealSection (Motion Wrapper)

**Location:** `src/components/landing/ScrollRevealSection.tsx`

Wrap any content block for scroll-triggered animation.

**Props:**
- `direction`: up | down | left | right
- `delay`: stagger timing for lists
- `className`: additional styling

### ServiceRoomView (Immersive Wrapper)

**Location:** `src/components/services/ServiceRoomView.tsx`

Immersive service page wrapper with background imagery and navigation.

---

## Asset Standards

### File Organization

```
src/assets/promo/
├── mixing-console-close.jpg
├── mixing-collaboration.jpg
├── mixing-stem-separation.jpg
├── mixing-realtime-feedback.jpg
├── mastering-eq-curve.jpg
├── mastering-loudness-meter.jpg
├── mastering-before-after.jpg
├── mastering-stereo-field.jpg
├── ai-neural-network.jpg
├── ai-instant-analysis.jpg
├── ai-platform-optimize.jpg
├── ai-quality-metrics.jpg
└── {context}-{subject}.jpg
```

### Naming Convention

```
{context}-{subject}.jpg
```

**Examples:**
- `mixing-console-close.jpg`
- `mastering-loudness-meter.jpg`
- `ai-instant-analysis.jpg`
- `community-arena-battle.jpg`
- `engineer-workspace-hero.jpg`

### Generation Method

1. **Dream Engine** (Gemini 3 Pro Image) for AI generation — preferred
2. **Professional photography** where available
3. **No stock photos** without significant enhancement

### Image Requirements

| Requirement | Standard |
|-------------|----------|
| Aspect Ratio | 16:9 (`aspect-video`) |
| Quality | High resolution, optimized for web |
| Style | Cinematic, professional, on-brand |
| Loading | `lazy` by default |
| Alt Text | Descriptive, meaningful |

---

## Implementation Checklist

Before any page ships, verify:

- [ ] Major content sections use `ShowcaseFeature` pattern
- [ ] Each feature has dedicated imagery (no placeholder icons)
- [ ] Scroll animations implemented (`whileInView`)
- [ ] Hover interactions on desktop (stat overlays)
- [ ] Mobile shows stats by default (no hidden data)
- [ ] Tech badges visible (floating or inline)
- [ ] Images lazy-loaded
- [ ] Alt text is descriptive
- [ ] Alternating layout creates visual rhythm
- [ ] Responsive breakpoints tested (mobile/tablet/desktop)

---

## Migration Priority

### Already Compliant ✓
- [x] `/showcase` — Original reference implementation
- [x] `/services/mixing` — Upgraded Feb 2026
- [x] `/services/mastering` — Upgraded Feb 2026
- [x] `/services/ai-mastering` — Upgraded Feb 2026

### High Priority (Phase 4)
- [ ] `/for-artists` — Portal page with benefits
- [ ] `/for-engineers` — Portal page with benefits
- [ ] `/how-it-works` — Platform explainer
- [ ] `/enterprise` — Enterprise info

### Medium Priority (Phase 5)
- [ ] `/community` — Hub sections
- [ ] `/pricing` — Plan comparisons
- [ ] `/about` — Company story

---

## The Doctrine Statement

```
2026 Visual Standard:
Showcase-First. Imagery is mandatory. Motion is meaning.
Text-only grids are deprecated. Hover reveals on desktop, visible stats on mobile.
Use the ShowcaseFeature pattern as baseline.
If it doesn't elevate, don't ship it.
We build forward. We never go backwards.
```

---

## Quick Reference

### When Building New Pages

1. **Start with imagery** — Generate assets before writing code
2. **Use ShowcaseFeature** — Every major section uses this component
3. **Alternate layouts** — Left-right-left-right rhythm
4. **Add motion** — `whileInView` on all sections
5. **Stats matter** — Hover reveals desktop, visible mobile
6. **Tech badges** — Floating or inline, always visible

### When Reviewing Existing Pages

1. Does it use `ShowcaseFeature`? If not, upgrade.
2. Does it have dedicated imagery? If icon-only, upgrade.
3. Does it animate on scroll? If static, upgrade.
4. Does mobile show stats? If hidden, upgrade.

---

## Doctrine Maintenance

This document is living. Update when:
- A new visual pattern becomes standard
- A component is added to the toolkit
- A page is migrated to compliance
- A new anti-pattern is identified

The standard only moves forward. We never regress.

---

**Last Updated:** February 2026  
**Maintained By:** MixxTech Development Team
