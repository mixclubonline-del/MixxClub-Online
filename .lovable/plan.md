

## Upgrade ForArtists & ForEngineers Portal Pages to 2026 Visual Standards

### Current State Analysis

Both portal pages currently use these **legacy patterns** that violate the 2026 doctrine:

| Component | Pattern | Violation |
|-----------|---------|-----------|
| `JourneyPreview` | Icon-only glass cards in a 3-column grid | No imagery, text-only feature grid |
| `FeatureGlassCards` | Icon-only CRM feature cards in a grid | No imagery, text-only feature grid |
| Revenue Tiers (Engineer) | Text-only tier cards | No imagery |
| `SessionPreview` | Animated mockup | Already compliant - interactive demo |
| `TransformationDemo` | Animated mockup | Already compliant - interactive demo |
| `RevenuePreview` | Animated mockup | Already compliant - interactive demo |
| `StudioPreview` | Animated mockup | Already compliant - interactive demo |

**What needs upgrading:**
1. **JourneyPreview** (ForArtists) - 6 journey steps need imagery
2. **FeatureGlassCards** (Both pages) - 6 CRM features per page need imagery
3. **Revenue Tiers** (ForEngineers) - 4 tier cards need imagery

**What stays intact:**
- `SessionPreview`, `TransformationDemo`, `RevenuePreview`, `StudioPreview` are already interactive animated demos that exceed the baseline standard

---

### Implementation Strategy

Rather than modifying the shared components (which may be used elsewhere), we will:

1. **Create new Showcase-based sections** directly in each page
2. **Replace the legacy component calls** with `ShowcaseFeature` arrays
3. **Generate 16 new promotional images** for the new content sections
4. **Maintain the existing animated demo components** (they exceed baseline)

---

### Phase 1: Generate Portal-Specific Imagery

**ForArtists Journey Images (6 images):**

| File Name | Subject | Generation Prompt |
|-----------|---------|-------------------|
| `artist-upload-cloud.jpg` | Upload experience | Cinematic view of artist uploading music to cloud platform, digital waveforms flowing upward, modern minimal interface, purple and cyan accents, 16:9 |
| `artist-ai-analysis.jpg` | AI session prep | AI analyzing audio waveform with neural network visualization, session notes appearing, futuristic interface, warm studio lighting, 16:9 |
| `artist-engineer-match.jpg` | Perfect match | Split view of artist and engineer profiles with matching algorithm visualization between them, connection lines, professional headshots, 16:9 |
| `artist-live-collab.jpg` | Real-time collaboration | Artist and engineer in video call working together, DAW visible, real-time waveform editing, global connection visualization, 16:9 |
| `artist-delivery.jpg` | Professional delivery | Multiple file formats floating (WAV, MP3, FLAC) with quality badges, professional packaging visualization, streaming platform logos, 16:9 |
| `artist-release-growth.jpg` | Release and growth | Music streaming on platforms with analytics dashboard, growth charts, global reach visualization, celebration moment, 16:9 |

**ForArtists CRM Images (4 images - consolidate 6 features into 4 showcase sections):**

| File Name | Subject |
|-----------|---------|
| `artist-crm-dashboard.jpg` | Artist dashboard with career metrics and momentum tracking |
| `artist-crm-sessions.jpg` | Session management interface with collaboration timeline |
| `artist-crm-projects.jpg` | Project tracker from upload to release with milestones |
| `artist-crm-community.jpg` | Community hub with achievements and connections |

**ForEngineers Images (6 images):**

| File Name | Subject |
|-----------|---------|
| `engineer-revenue-mixing.jpg` | Engineer receiving payment for mixing session, income visualization |
| `engineer-revenue-mastering.jpg` | Mastering chain with earnings counter, professional setup |
| `engineer-client-pipeline.jpg` | CRM deal pipeline with client cards and stages |
| `engineer-opportunities.jpg` | Global opportunity board with project listings |
| `engineer-tier-progression.jpg` | Tier progression ladder with unlocking benefits |
| `engineer-growth-coaching.jpg` | Mentorship session with growth metrics |

**Total: 16 new images** in `src/assets/promo/`

---

### Phase 2: Create ShowcaseJourney Component

A new variant of ShowcaseFeature optimized for journey/process flows:

**File:** `src/components/landing/ShowcaseJourney.tsx`

This component will display journey steps as full-width alternating image+content sections using the established ShowcaseFeature pattern.

**Props:**
```typescript
interface ShowcaseJourneyProps {
  badge: { icon: ReactNode; text: string };
  title: string;
  subtitle: string;
  steps: ShowcaseStep[];
  variant: 'artist' | 'engineer';
}

interface ShowcaseStep {
  image: string;
  icon: LucideIcon;
  stepNumber: number;
  title: string;
  description: string;
  stats: Array<{ label: string; value: string }>;
  techDetails: string[];
}
```

**Key Features:**
- Alternating left/right layout per step
- Step number badge overlay on image
- Hover stat reveals on desktop
- Mobile-visible stats grid
- Scroll-triggered animations
- Variant-aware accent colors (primary for artist, secondary for engineer)

---

### Phase 3: Update ForArtists Page

**Replace:**
```tsx
<JourneyPreview
  badge={{ icon: <Star />, text: "Your Path to Success" }}
  title="From Upload to Release"
  ...
/>
```

**With:**
```tsx
<ShowcaseJourney
  badge={{ icon: <Star />, text: "Your Path to Success" }}
  title="From Upload to Release"
  subtitle="We've streamlined the entire production process."
  steps={artistJourneySteps}
  variant="artist"
/>
```

**Replace:**
```tsx
<FeatureGlassCards
  badge={{ icon: <Star />, text: "Your Command Center" }}
  title="This is YOUR Artist CRM"
  ...
/>
```

**With:**
```tsx
<section className="py-24 px-6">
  <div className="container mx-auto max-w-6xl space-y-24">
    <ScrollRevealSection className="text-center">
      <Badge>Your Command Center</Badge>
      <h2>This is YOUR Artist CRM</h2>
      <p>Everything you need to manage your music career.</p>
    </ScrollRevealSection>
    
    {artistCrmFeatures.map((feature, index) => (
      <ShowcaseFeature
        key={feature.title}
        {...feature}
        reversed={index % 2 !== 0}
      />
    ))}
  </div>
</section>
```

---

### Phase 4: Update ForEngineers Page

**Replace the Revenue Tiers section** (lines 111-151) with ShowcaseFeature sections displaying tier progression with imagery.

**Replace:**
```tsx
<FeatureGlassCards
  badge={{ icon: <Briefcase />, text: "Your Business HQ" }}
  title="This is YOUR Engineer CRM"
  ...
/>
```

**With:** ShowcaseFeature sections for engineer CRM benefits.

---

### Files to Create

| File | Purpose |
|------|---------|
| `src/assets/promo/artist-upload-cloud.jpg` | Journey step 1 |
| `src/assets/promo/artist-ai-analysis.jpg` | Journey step 2 |
| `src/assets/promo/artist-engineer-match.jpg` | Journey step 3 |
| `src/assets/promo/artist-live-collab.jpg` | Journey step 4 |
| `src/assets/promo/artist-delivery.jpg` | Journey step 5 |
| `src/assets/promo/artist-release-growth.jpg` | Journey step 6 |
| `src/assets/promo/artist-crm-dashboard.jpg` | CRM section |
| `src/assets/promo/artist-crm-sessions.jpg` | CRM section |
| `src/assets/promo/artist-crm-projects.jpg` | CRM section |
| `src/assets/promo/artist-crm-community.jpg` | CRM section |
| `src/assets/promo/engineer-revenue-streams.jpg` | Revenue showcase |
| `src/assets/promo/engineer-client-pipeline.jpg` | CRM section |
| `src/assets/promo/engineer-opportunities.jpg` | CRM section |
| `src/assets/promo/engineer-tier-progression.jpg` | Tiers showcase |
| `src/assets/promo/engineer-growth-coaching.jpg` | CRM section |
| `src/assets/promo/engineer-workspace-hero.jpg` | Business HQ |
| `src/components/landing/ShowcaseJourney.tsx` | Journey component |

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/ForArtists.tsx` | Replace JourneyPreview and FeatureGlassCards with ShowcaseFeature sections |
| `src/pages/ForEngineers.tsx` | Replace Revenue Tiers and FeatureGlassCards with ShowcaseFeature sections |
| `VISUAL_STANDARDS.md` | Mark `/for-artists` and `/for-engineers` as compliant |

---

### Technical Implementation Details

**ShowcaseJourney Component Structure:**

```tsx
export function ShowcaseJourney({ badge, title, subtitle, steps, variant }: ShowcaseJourneyProps) {
  const accentColor = variant === 'artist' ? 'primary' : 'secondary';
  
  return (
    <section className="py-24 px-6">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <ScrollRevealSection className="text-center mb-16">
          <Badge variant="outline" className="mb-4 bg-background/30 backdrop-blur-md">
            {badge.icon}
            <span className="ml-2">{badge.text}</span>
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">{title}</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
        </ScrollRevealSection>
        
        {/* Journey Steps as ShowcaseFeature sections */}
        <div className="space-y-24">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              className={`flex flex-col ${index % 2 !== 0 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-12 items-center`}
            >
              {/* Image with step number overlay */}
              <div className="flex-1 w-full relative group">
                <div className="relative overflow-hidden rounded-2xl border border-border/50 shadow-2xl">
                  <img 
                    src={step.image}
                    alt={step.title}
                    className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  
                  {/* Step number badge */}
                  <div className={`absolute top-4 left-4 w-12 h-12 rounded-full bg-${accentColor} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                    {step.stepNumber}
                  </div>
                  
                  {/* Hover stats overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-background via-background/90 to-transparent">
                    <div className="flex gap-4 flex-wrap">
                      {step.stats.map((stat) => (
                        <div key={stat.label} className="px-4 py-2 bg-background/95 backdrop-blur rounded-lg border border-border">
                          <div className="text-xs text-muted-foreground">{stat.label}</div>
                          <div className={`text-lg font-bold text-${accentColor}`}>{stat.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Floating tech badges */}
                <div className="absolute -bottom-4 -right-4 flex flex-wrap gap-2 max-w-xs">
                  {step.techDetails.slice(0, 2).map((detail) => (
                    <Badge key={detail} className={`bg-${accentColor}/20 text-${accentColor} border-${accentColor}/30 text-xs shadow-lg`}>
                      {detail}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Content side */}
              <div className="flex-1 w-full space-y-6">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl bg-${accentColor}/10 border border-${accentColor}/20`}>
                    <step.icon className={`w-6 h-6 text-${accentColor}`} />
                  </div>
                  <Badge variant="secondary">Step {step.stepNumber}</Badge>
                </div>
                
                <h3 className="text-3xl md:text-4xl font-bold">{step.title}</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">{step.description}</p>
                
                {/* Mobile stats grid */}
                <div className="grid grid-cols-3 gap-4 py-4 lg:hidden">
                  {step.stats.map((stat) => (
                    <div key={stat.label} className="text-center p-4 rounded-xl bg-muted/30 border border-border/50">
                      <div className={`text-2xl font-bold text-${accentColor}`}>{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>
                
                {/* Desktop stats grid */}
                <div className="hidden lg:grid grid-cols-3 gap-4 py-4">
                  {step.stats.map((stat) => (
                    <div key={stat.label} className="text-center p-4 rounded-xl bg-muted/30 border border-border/50">
                      <div className={`text-2xl font-bold text-${accentColor}`}>{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>
                
                {/* Tech details */}
                <div className="flex flex-wrap gap-2">
                  {step.techDetails.map((detail) => (
                    <Badge key={detail} variant="outline" className="text-xs">{detail}</Badge>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

### Data Structure Updates

**ForArtists Journey Steps (with imagery and stats):**

```tsx
const artistJourneySteps = [
  {
    image: artistUploadCloud,
    icon: Upload,
    stepNumber: 1,
    title: "Upload Your Track",
    description: "Drop your stems or mixdown into our secure cloud workspace. Supports all major formats with unlimited storage.",
    stats: [
      { label: "Formats", value: "15+" },
      { label: "Max Size", value: "2GB" },
      { label: "Storage", value: "∞" }
    ],
    techDetails: ["Lossless Upload", "Stem Detection", "Auto-Organize"]
  },
  // ... remaining 5 steps with similar structure
];
```

---

### Success Criteria

After implementation, both portal pages will:

- Use `ShowcaseFeature` or `ShowcaseJourney` for all major content sections
- Have dedicated AI-generated imagery for every feature
- Implement scroll-triggered reveals on all sections
- Display hover stat overlays on desktop
- Show stats by default on mobile
- Feature floating tech badges
- Create visual rhythm with alternating layouts
- Maintain the existing animated demo components (SessionPreview, TransformationDemo, RevenuePreview, StudioPreview)

---

### Rollout Sequence

1. **Generate all 16 images first** using Dream Engine
2. **Create ShowcaseJourney component**
3. **Update ForArtists.tsx** with new journey and CRM sections
4. **Update ForEngineers.tsx** with new tier and CRM sections
5. **Test responsive behavior** (mobile/tablet/desktop)
6. **Update VISUAL_STANDARDS.md** to mark pages as compliant
7. **Verify alternating layout rhythm** across all sections

