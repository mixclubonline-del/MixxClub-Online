

## Lock In 2026 Visual Building Doctrine

### The Mission

Codify the Showcase-style imagery pattern as a mandatory building standard. From this point forward, every new page and major UI section follows this technique as the **baseline**. We only upgrade from here; we never go backwards.

---

### What Gets Documented

We will create a new doctrine file and update the existing philosophy to reference it:

**1. New File: `VISUAL_STANDARDS.md`**

A dedicated building doctrine for visual implementation that defines:

| Standard | Definition |
|----------|------------|
| **Showcase-First Design** | Every major content section uses the `ShowcaseFeature` pattern: alternating layouts, dedicated imagery, hover stat overlays, tech badges |
| **No Naked Text Blocks** | Feature sections must be paired with imagery. Text-only grids are 2022; we're in 2026 |
| **Motion as Meaning** | Scroll-triggered reveals (`whileInView`) are standard. Static page loads are deprecated |
| **Responsive by Default** | Mobile gets stacked layouts with visible stats; desktop gets hover reveals. No breakpoint is an afterthought |
| **AI-Generated Assets** | Use Dream Engine (Gemini 3 Pro Image) to generate promotional imagery. Self-generating platform philosophy extends to visuals |
| **Asset Organization** | Promotional images live in `src/assets/promo/` with descriptive names following the `{context}-{subject}.jpg` pattern |

**2. Update: `DEVELOPMENT_PHILOSOPHY.md`**

Add a new pillar and reference the visual standards:

```text
| **Showcase-First Visual Standard** | Every content section leads with imagery. Use the ShowcaseFeature pattern as baseline. Elevate or don't ship. |
```

Add to Quality Gates:
```text
- [ ] Uses ShowcaseFeature pattern for major content sections
- [ ] Has dedicated imagery (no text-only feature grids)
- [ ] Implements scroll-triggered animations
```

**3. Update: `.lovable/plan.md`**

Document this as the new baseline reference for future AI sessions.

---

### The New Standard Components

Document the component toolkit that enforces these standards:

| Component | Location | Purpose |
|-----------|----------|---------|
| `ShowcaseFeature` | `src/components/services/ShowcaseFeature.tsx` | Primary content block with image + stats + badges |
| `ScrollRevealSection` | `src/components/landing/ScrollRevealSection.tsx` | Wrapper for scroll-triggered reveals |
| `ServiceRoomView` | `src/components/services/ServiceRoomView.tsx` | Immersive service page wrapper |

---

### Visual Standards Doctrine Content

```markdown
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

Every service page, product page, and major landing section uses this:

Props:
- `image` - Required. AI-generated or professional imagery
- `icon` - LucideIcon for section identification
- `title` - Bold headline (2xl-4xl)
- `subtitle` - Badge text for categorization
- `description` - Detailed explanation
- `stats` - Array of { label, value } for metrics
- `techDetails` - Technology/capability badges
- `reversed` - Alternate layout direction

Usage:
{features.map((feature, index) => (
  <ShowcaseFeature
    key={feature.title}
    {...feature}
    reversed={index % 2 !== 0}
  />
))}

### ScrollRevealSection (Motion Wrapper)

Wrap any content block for scroll-triggered animation:
- Direction: up | down | left | right
- Delay: stagger for lists
- Margin: trigger point offset

---

## Asset Standards

### File Organization
src/assets/promo/
├── mixing-console-close.jpg
├── mixing-collaboration.jpg
├── mastering-eq-curve.jpg
├── ai-neural-network.jpg
└── {context}-{subject}.jpg

### Naming Convention
{context}-{subject}.jpg

Examples:
- mixing-console-close.jpg
- mastering-loudness-meter.jpg
- ai-instant-analysis.jpg
- community-arena-battle.jpg

### Generation Method
1. Dream Engine (Gemini 3 Pro Image) for AI generation
2. Professional photography where available
3. No stock photos without enhancement

### Image Requirements
- Aspect ratio: 16:9 (aspect-video)
- Quality: High resolution, optimized for web
- Style: Cinematic, professional, on-brand
- Loading: lazy by default

---

## Implementation Checklist

Before any page ships:

- [ ] Major content sections use ShowcaseFeature pattern
- [ ] Each feature has dedicated imagery (no placeholder icons)
- [ ] Scroll animations implemented (whileInView)
- [ ] Hover interactions on desktop (stat overlays)
- [ ] Mobile shows stats by default (no hidden data)
- [ ] Tech badges visible (floating or inline)
- [ ] Images lazy-loaded
- [ ] Alt text descriptive
- [ ] Alternating layout creates visual rhythm

---

## Migration Priority

Pages to upgrade to Showcase-First standard:

### High Priority (Phase 4)
- [ ] `/for-artists` - Portal page with benefits
- [ ] `/for-engineers` - Portal page with benefits
- [ ] `/how-it-works` - Platform explainer
- [ ] `/enterprise` - Enterprise info

### Medium Priority (Phase 5)
- [ ] `/community` - Hub sections
- [ ] `/pricing` - Plan comparisons
- [ ] `/about` - Company story

### Already Compliant
- [x] `/showcase` - Original reference implementation
- [x] `/services/mixing` - Upgraded
- [x] `/services/mastering` - Upgraded
- [x] `/services/ai-mastering` - Upgraded

---

## The Standard

If a page does not meet these standards, it is not ready for 2026.
We build forward. We elevate. We never go backwards.
```

---

### Files to Create

| File | Purpose |
|------|---------|
| `VISUAL_STANDARDS.md` | New visual building doctrine |

### Files to Modify

| File | Changes |
|------|---------|
| `DEVELOPMENT_PHILOSOPHY.md` | Add new pillar + quality gates |
| `.lovable/plan.md` | Update with visual standards reference |

---

### Technical Details

**New Pillar in DEVELOPMENT_PHILOSOPHY.md:**

```markdown
| **Showcase-First Visual Standard** | Every content section leads with imagery. Use the ShowcaseFeature pattern as baseline. No text-only feature grids. Elevate or don't ship. |
```

**New Quality Gates:**

```markdown
- [ ] Uses ShowcaseFeature pattern for major content sections
- [ ] Has dedicated imagery (no text-only feature grids)
- [ ] Implements scroll-triggered animations (whileInView)
- [ ] Hover interactions reveal stats on desktop
- [ ] Mobile displays stats by default
```

**Updated Summary Prompt:**

```markdown
Dream the future version first. Build it with 120% craft.
Own the core technology. No placeholders ever.
Showcase-First visuals. Imagery is mandatory.
Make it feel alive from first interaction.
Marathon pace, masterpiece quality.
Solve real problems for real people.
```

---

### Success Criteria

- Visual standards documented as formal doctrine
- DEVELOPMENT_PHILOSOPHY.md updated with new pillar
- Component toolkit documented for AI and team reference
- Migration priority established for remaining pages
- Future builds automatically follow this pattern
- The 2026 standard is locked in

---

### The Doctrine Statement

```text
2026 Visual Standard:
Showcase-First. Imagery is mandatory. Motion is meaning.
Text-only grids are deprecated. Hover reveals on desktop, visible stats on mobile.
Use the ShowcaseFeature pattern as baseline.
If it doesn't elevate, don't ship it.
We build forward. We never go backwards.
```

