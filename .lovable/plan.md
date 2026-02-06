

## Phase 4: Upgrade HowItWorks and Enterprise Pages to 2026 Visual Standards

### Current State Analysis

| Page | Current Pattern | Violation |
|------|-----------------|-----------|
| `/how-it-works` | `JourneyPath` with icon-only steps, no imagery | No imagery, text-only |
| `/enterprise` | Icon-only Card grids for features and pricing | No imagery, corporate sterile |

Both pages use legacy patterns that violate the 2026 doctrine: icon-only grids without dedicated imagery, no hover stat reveals, and no culture-authentic representation.

---

### Implementation Strategy

#### 1. HowItWorks Page Upgrade

**Current structure:**
- Uses `JourneyGateway` (role switcher) + `JourneyPath` (icon-only steps)
- Steps have icons, titles, descriptions, and time estimates
- No imagery at all

**Upgrade approach:**
- Replace `JourneyPath` with `ShowcaseJourney` (already built)
- Generate 10 new culturally-authentic images (5 artist path + 5 engineer path)
- Keep `JourneyGateway` for role switching (already has good interaction design)
- Add stats and tech details to each step

**New assets needed (10 images):**

| File Name | Subject | Prompt Context |
|-----------|---------|----------------|
| `journey-artist-upload.jpg` | Young Black artist uploading | Hip-hop aesthetic, bedroom studio, streetwear |
| `journey-artist-ai.jpg` | AI analyzing waveform | Neural network visualization, warm studio tones |
| `journey-artist-match.jpg` | Artist matched with engineer | Split view, diverse pairing, connection moment |
| `journey-artist-collab.jpg` | Real-time collaboration | Video call, DAW visible, authentic expression |
| `journey-artist-download.jpg` | Artist celebrating final track | Victory moment, streaming platforms visible |
| `journey-engineer-profile.jpg` | Hispanic engineer setting up profile | Professional studio, portfolio showcase |
| `journey-engineer-match.jpg` | Engineer reviewing opportunities | Project board, client cards visible |
| `journey-engineer-work.jpg` | Black engineer at SSL console | Focused expression, professional environment |
| `journey-engineer-earn.jpg` | Engineer receiving payment | Revenue dashboard, earnings visualization |
| `journey-cta-join.jpg` | Diverse group in studio | Celebration moment, community energy |

#### 2. Enterprise Page Upgrade

**Current structure:**
- Icon-only feature cards (6 features)
- Icon-only pricing cards (3 tiers)
- Comparison table (text-only)
- Corporate sterile aesthetic (slate-900 background, blue-600 accents)

**Upgrade approach:**
- Add hero imagery with culture-authentic enterprise context
- Replace feature grid with ShowcaseFeature alternating sections
- Keep pricing cards but add imagery context
- Update color scheme to match MixxClub brand (primary/secondary instead of corporate blue)

**New assets needed (6 images):**

| File Name | Subject | Prompt Context |
|-----------|---------|----------------|
| `enterprise-hero.jpg` | Label executives and artists together | Urban record label, diverse executives, modern office meets studio |
| `enterprise-team.jpg` | Team collaboration | Multi-person creative session, diverse creators |
| `enterprise-analytics.jpg` | Analytics dashboard on big screen | Data visualization, revenue charts, modern tech |
| `enterprise-contracts.jpg` | Digital contract signing | Professional but urban-elevated aesthetic |
| `enterprise-whitelabel.jpg` | Custom branded platform | Platform on multiple devices, brand customization |
| `enterprise-security.jpg` | Security/compliance visualization | Lock icons, data protection, trust |

---

### Technical Implementation

#### HowItWorks Page Changes

**File:** `src/pages/HowItWorks.tsx`

Replace the current step structure with `ShowcaseStep` format:

```typescript
// Before: Icon-only steps
const artistSteps = [
  { icon: Upload, title: "Upload Your Track", description: "...", time: "2 minutes" }
];

// After: ShowcaseStep with imagery and stats
const artistSteps: ShowcaseStep[] = [
  {
    image: journeyArtistUpload,
    icon: Upload,
    stepNumber: 1,
    title: "Upload Your Track",
    description: "Drop your stems or mixdown into our secure cloud. We support all major formats.",
    stats: [
      { label: "Formats", value: "15+" },
      { label: "Max Size", value: "2GB" },
      { label: "Time", value: "2 min" }
    ],
    techDetails: ["Lossless Upload", "Auto-Organize", "Secure Cloud"]
  }
];
```

**Replace JourneyPath call with ShowcaseJourney:**

```tsx
// Before
<JourneyPath 
  steps={steps} 
  activeStep={activeStep}
  onStepClick={setActiveStep}
  variant={activeRole}
/>

// After
<ShowcaseJourney
  badge={{ icon: <Star />, text: "Your Journey" }}
  title={activeRole === "artist" ? "From Upload to Release" : "From Profile to Profit"}
  subtitle="Follow the path to professional sound"
  steps={activeRole === "artist" ? artistShowcaseSteps : engineerShowcaseSteps}
  variant={activeRole}
/>
```

#### Enterprise Page Changes

**File:** `src/pages/Enterprise.tsx`

1. **Add hero section with imagery**
2. **Replace feature grid with ShowcaseFeature sections**
3. **Update color scheme from corporate blue to brand primary**
4. **Add culturally-authentic imagery**

```tsx
// Replace the icon-only keyFeatures grid with ShowcaseFeature sections
const enterpriseFeatures = [
  {
    image: enterpriseTeam,
    icon: Users,
    title: "Team Management",
    subtitle: "Scale Your Operation",
    description: "Invite team members with role-based access. Manage your entire roster from one dashboard.",
    stats: [
      { label: "Team Size", value: "∞" },
      { label: "Roles", value: "10+" },
      { label: "SSO", value: "✓" }
    ],
    techDetails: ["RBAC", "SSO/LDAP", "Audit Logging"]
  },
  // ... more features
];

{enterpriseFeatures.map((feature, index) => (
  <ShowcaseFeature
    key={feature.title}
    {...feature}
    reversed={index % 2 !== 0}
  />
))}
```

---

### Files to Create

| File | Purpose |
|------|---------|
| `src/assets/promo/journey-artist-upload.jpg` | Artist upload step |
| `src/assets/promo/journey-artist-ai.jpg` | AI analysis step |
| `src/assets/promo/journey-artist-match.jpg` | Match step |
| `src/assets/promo/journey-artist-collab.jpg` | Collaboration step |
| `src/assets/promo/journey-artist-download.jpg` | Delivery step |
| `src/assets/promo/journey-engineer-profile.jpg` | Profile step |
| `src/assets/promo/journey-engineer-match.jpg` | Opportunities step |
| `src/assets/promo/journey-engineer-work.jpg` | Work step |
| `src/assets/promo/journey-engineer-earn.jpg` | Earnings step |
| `src/assets/promo/journey-cta-join.jpg` | CTA section |
| `src/assets/promo/enterprise-hero.jpg` | Enterprise hero |
| `src/assets/promo/enterprise-team.jpg` | Team feature |
| `src/assets/promo/enterprise-analytics.jpg` | Analytics feature |
| `src/assets/promo/enterprise-contracts.jpg` | Contracts feature |
| `src/assets/promo/enterprise-whitelabel.jpg` | White-label feature |
| `src/assets/promo/enterprise-security.jpg` | Security feature |

**Total: 16 new images**

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/HowItWorks.tsx` | Replace JourneyPath with ShowcaseJourney, add image imports |
| `src/pages/Enterprise.tsx` | Add hero imagery, replace feature grid with ShowcaseFeature, update color scheme |
| `VISUAL_STANDARDS.md` | Mark `/how-it-works` and `/enterprise` as compliant |

---

### Cultural Representation Requirements

All human-centric images will follow the Cultural Representation Standards:

**Journey Images (10):**
- Artist steps: Young African American and Hispanic creators
- Engineer steps: Veteran Black and Hispanic engineers
- Settings: Bedroom studios, professional consoles, urban environments
- Style: Streetwear, contemporary urban, authentic expression

**Enterprise Images (6):**
- Urban-elevated professional aesthetic (not corporate sterile)
- Diverse executives and creators in modern label/studio environments
- Mix of professional attire with urban influence (no suits without personality)

---

### Rollout Sequence

1. **Generate 16 culturally-authentic images** using Dream Engine
2. **Update HowItWorks.tsx** with ShowcaseJourney integration
3. **Update Enterprise.tsx** with ShowcaseFeature sections and brand colors
4. **Test responsive behavior** on mobile/tablet/desktop
5. **Update VISUAL_STANDARDS.md** to mark pages as compliant
6. **Verify alternating layout rhythm** and hover interactions

---

### Success Criteria

After implementation:

- Both pages use ShowcaseFeature/ShowcaseJourney patterns
- All content sections have dedicated, culturally-authentic imagery
- Scroll-triggered animations on all sections
- Hover stat reveals on desktop, visible stats on mobile
- Hip-hop culture properly represented (African American, Hispanic, Caribbean)
- No corporate sterility in enterprise page
- Brand colors (primary/secondary) instead of generic blue

---

### The 2026 Standard

```text
HowItWorks: The journey is visual. Every step has an image.
Enterprise: Enterprise-grade, culture-authentic. Not corporate sterile.
If it doesn't look like us, it doesn't ship.
```

