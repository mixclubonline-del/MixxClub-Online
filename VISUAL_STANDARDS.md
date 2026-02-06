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
- [x] `/for-artists` — Upgraded Feb 2026 with ShowcaseJourney + ShowcaseFeature
- [x] `/for-engineers` — Upgraded Feb 2026 with ShowcaseFeature sections

### High Priority (Phase 4)
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

## Cultural Representation Standards

> **MixxClub represents hip-hop culture authentically.**  
> Our community is predominantly African American, Hispanic/Latino, Caribbean, and diverse urban creators.  
> All imagery must reflect this reality.

### Mandatory Demographics

When generating or sourcing images with human subjects:

| Priority | Demographics | Representation |
|----------|-------------|----------------|
| Primary | African American | 50%+ of human subjects |
| Primary | Hispanic/Latino | 25%+ of human subjects |
| Secondary | Caribbean, African, Mixed | Represented throughout |
| Inclusive | All ethnicities | Welcome, but not at expense of primary representation |

### Style Requirements

| Element | Standard | Anti-Pattern |
|---------|----------|--------------|
| **Clothing** | Streetwear, contemporary urban, authentic creator style | Business casual, corporate attire |
| **Setting** | Home studios, pro studios, urban environments | Stock-photo offices, generic "creative spaces" |
| **Expression** | Authentic focus, confidence, real moments | Stock-photo smiles, posed "diversity" |
| **Age Range** | 18-45 primarily, veterans included | Only young or only old |

### Image Generation Prompt Templates

When using Dream Engine (Gemini 3 Pro Image), always include cultural context:

**For Artist Imagery:**
```
young [African American/Hispanic/Black] artist, [specific action], 
[specific setting: bedroom studio/home setup/professional booth], 
hip-hop aesthetic, [clothing: streetwear/hoodie/contemporary urban], 
authentic music creator, cinematic lighting, 16:9
```

**For Engineer Imagery:**
```
[African American/Hispanic/veteran Black] audio engineer, 
[specific action: at console/adjusting EQ/reviewing mix], 
professional studio environment, focused expression, 
contemporary urban professional style, warm studio lighting, 16:9
```

**For Collaboration Imagery:**
```
[diverse pairing: young Black artist + veteran Hispanic engineer], 
real collaboration moment, [video call/same room/split view], 
genuine connection, hip-hop production context, 16:9
```

### Examples of Correct vs. Incorrect

| Correct ✓ | Incorrect ✗ |
|-----------|-------------|
| "Young Black producer in hoodie, bedroom studio with LED strips" | "Diverse group of professionals in meeting room" |
| "Hispanic engineer at SSL console, focused on mix" | "Generic engineer at computer workstation" |
| "African American artist recording in booth, authentic expression" | "Smiling person holding headphones near microphone" |

### The Cultural Doctrine

```
This is hip-hop. This is our culture.
African American, Hispanic, Caribbean, urban creators.
Streetwear over suits. Real studios over stock offices.
Authentic expression over posed smiles.
If it doesn't look like us, it doesn't ship.
```

---

**Last Updated:** February 2026  
**Maintained By:** MixxTech Development Team
