

## Enhance Services Pages with Showcase-Style Imagery

### Goal

Transform the individual service pages (`MixingShowcase`, `MasteringShowcase`, `AIMastering`) to match the rich visual storytelling of the `/showcase` page by adding section-specific imagery with the alternating layout pattern, hover stat overlays, and tech detail badges.

---

### Current State vs Target

| Page | Current | Target |
|------|---------|--------|
| `/services/mixing` | Single background + text cards | Showcase-style feature sections with mixing-specific imagery |
| `/services/mastering` | Single background + text cards | Showcase-style feature sections with mastering-specific imagery |
| `/services/ai-mastering` | Plain cards, no imagery | Full visual overhaul with AI processing imagery |

---

### Implementation Approach

**Phase 1: Generate Service-Specific Imagery**

Create new promotional images using the Dream Engine (Gemini 3 Pro Image) or source high-quality assets for:

**Mixing Service (4-5 images):**
- `mixing-console-close.jpg` - Close-up of analog mixing console with glowing faders
- `mixing-collaboration.jpg` - Split-screen artist/engineer collaboration view
- `mixing-stem-separation.jpg` - Visual of audio stems being separated and organized
- `mixing-realtime-feedback.jpg` - Real-time waveform with chat/feedback overlay

**Mastering Service (4-5 images):**
- `mastering-eq-curve.jpg` - Parametric EQ with frequency curve visualization
- `mastering-loudness-meter.jpg` - LUFS metering with streaming platform targets
- `mastering-before-after.jpg` - Split waveform showing before/after transformation
- `mastering-stereo-field.jpg` - Stereo width analyzer visualization

**AI Processing Service (4-5 images):**
- `ai-neural-network.jpg` - Abstract neural network processing audio
- `ai-instant-analysis.jpg` - Track analysis dashboard with genre/BPM detection
- `ai-platform-optimize.jpg` - Multiple streaming platform logos with optimization targets
- `ai-quality-metrics.jpg` - Professional quality metrics dashboard

**Phase 2: Create Reusable Showcase Feature Component**

Extract the alternating feature layout from `Showcase.tsx` into a reusable component:

```text
src/components/services/ShowcaseFeature.tsx
```

Props:
- `image`: string (imported asset)
- `icon`: LucideIcon
- `title`: string
- `subtitle`: string (badge text)
- `description`: string
- `stats`: Array<{ label: string, value: string }>
- `techDetails`: string[]
- `reversed`: boolean (for alternating layout)

Features:
- Alternating flex direction based on `reversed` prop
- Image with hover stat overlay (slide-up on hover)
- Floating tech badges below image
- Icon + badge header
- Stats grid
- Tech detail badges
- Scroll-triggered animation via `whileInView`

**Phase 3: Integrate into Service Pages**

**MixingShowcase.tsx changes:**

Replace the current `GlassFeaturePanel` grid with `ShowcaseFeature` sections:

```text
Before (current):
- 4x GlassFeaturePanel cards in a grid
- No imagery, just icons and text

After (enhanced):
- 4 full-width ShowcaseFeature sections
- Alternating left/right image layout
- Each with dedicated mixing-specific imagery
- Hover overlays with mixing-specific stats
```

**MasteringShowcase.tsx changes:**

Same pattern - replace feature grid with `ShowcaseFeature` sections using mastering imagery.

**AIMastering.tsx changes:**

Full visual overhaul:
- Add `ServiceRoomView` wrapper for consistency
- Replace plain cards with `ShowcaseFeature` sections
- Add AI-specific imagery throughout

---

### Files to Create

| File | Purpose |
|------|---------|
| `src/assets/promo/mixing-console-close.jpg` | Feature image |
| `src/assets/promo/mixing-collaboration.jpg` | Feature image |
| `src/assets/promo/mixing-stem-separation.jpg` | Feature image |
| `src/assets/promo/mixing-realtime-feedback.jpg` | Feature image |
| `src/assets/promo/mastering-eq-curve.jpg` | Feature image |
| `src/assets/promo/mastering-loudness-meter.jpg` | Feature image |
| `src/assets/promo/mastering-before-after.jpg` | Feature image |
| `src/assets/promo/mastering-stereo-field.jpg` | Feature image |
| `src/assets/promo/ai-neural-network.jpg` | Feature image |
| `src/assets/promo/ai-instant-analysis.jpg` | Feature image |
| `src/assets/promo/ai-platform-optimize.jpg` | Feature image |
| `src/assets/promo/ai-quality-metrics.jpg` | Feature image |
| `src/components/services/ShowcaseFeature.tsx` | Reusable component |

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/MixingShowcase.tsx` | Replace feature grid with ShowcaseFeature sections |
| `src/pages/MasteringShowcase.tsx` | Replace feature grid with ShowcaseFeature sections |
| `src/pages/AIMastering.tsx` | Full visual overhaul with ServiceRoomView + ShowcaseFeature |

---

### Technical Details

**ShowcaseFeature Component Structure:**

```tsx
export function ShowcaseFeature({
  image,
  icon: Icon,
  title,
  subtitle,
  description,
  stats,
  techDetails,
  reversed = false,
  delay = 0
}: ShowcaseFeatureProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, delay }}
      className={`flex flex-col ${reversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-12 items-center`}
    >
      {/* Image Side with Hover Stats */}
      <div className="flex-1 relative group">
        <div className="relative overflow-hidden rounded-2xl border border-border/50 shadow-2xl">
          <img 
            src={image} 
            alt={title}
            className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-105"
          />
          
          {/* Stats overlay on hover */}
          <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-background via-background/80 to-transparent">
            <div className="flex gap-4 flex-wrap">
              {stats.map((stat) => (
                <div key={stat.label} className="px-4 py-2 bg-background/95 backdrop-blur rounded-lg border border-border">
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                  <div className="text-lg font-bold text-primary">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Floating tech badges */}
        <div className="absolute -bottom-4 -right-4 flex flex-wrap gap-2 max-w-xs">
          {techDetails.slice(0, 2).map((detail) => (
            <Badge key={detail} className="bg-primary/20 text-primary border-primary/30 text-xs">
              {detail}
            </Badge>
          ))}
        </div>
      </div>

      {/* Content Side */}
      <div className="flex-1 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <Badge variant="secondary">{subtitle}</Badge>
        </div>
        
        <h3 className="text-3xl md:text-4xl font-bold">{title}</h3>
        <p className="text-lg text-muted-foreground leading-relaxed">{description}</p>
        
        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-4 py-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center p-4 rounded-xl bg-muted/30 border border-border/50">
              <div className="text-2xl font-bold text-primary">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
        
        {/* Tech details */}
        <div className="flex flex-wrap gap-2">
          {techDetails.map((detail) => (
            <Badge key={detail} variant="outline" className="text-xs">{detail}</Badge>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
```

**Usage in MixingShowcase.tsx:**

```tsx
import mixingConsole from '@/assets/promo/mixing-console-close.jpg';
import mixingCollab from '@/assets/promo/mixing-collaboration.jpg';
// ... other imports

const mixingFeatures = [
  {
    image: mixingConsole,
    icon: Sliders,
    title: 'Professional Console',
    subtitle: 'Analog Warmth',
    description: 'Access the same mixing tools used in world-class studios...',
    stats: [
      { label: 'Channels', value: '64' },
      { label: 'Plugins', value: '200+' },
      { label: 'Sample Rate', value: '96kHz' }
    ],
    techDetails: ['SSL Emulation', 'Neve EQ', 'API Compression']
  },
  // ... more features
];

// In render:
<section className="space-y-32 mb-20">
  {mixingFeatures.map((feature, index) => (
    <ShowcaseFeature
      key={feature.title}
      {...feature}
      reversed={index % 2 !== 0}
      delay={0}
    />
  ))}
</section>
```

---

### Image Generation Prompts (for Dream Engine)

**Mixing Console Close:**
> Cinematic close-up of an analog mixing console in a professional recording studio, LED VU meters glowing, faders in position, warm studio lighting, shallow depth of field, 16:9 aspect ratio, photorealistic

**Mixing Collaboration:**
> Split-screen view of artist in home studio on left and audio engineer in professional studio on right, both wearing headphones, video call interface overlay, modern sleek design, 16:9 aspect ratio

**AI Neural Network Audio:**
> Abstract visualization of neural network processing audio waveforms, glowing nodes and connections, audio frequency spectrum flowing through network, cyberpunk color palette with purple and cyan, 16:9 aspect ratio

---

### Rollout Strategy

1. **Generate Images First**: Use Dream Engine or source assets before code changes
2. **Create Component**: Build `ShowcaseFeature.tsx` and test in isolation
3. **Integrate Incrementally**: Update one service page at a time
4. **Verify Responsiveness**: Test on mobile/tablet/desktop
5. **Performance Check**: Ensure lazy loading and optimized images

---

### Success Criteria

- Each service page has 4+ full-width feature sections with dedicated imagery
- Alternating left/right layout creates visual rhythm
- Hover interactions reveal stats on images
- Mobile responsive with stacked layout
- Page load performance maintained (lazy loading)
- Consistent visual language with Showcase page

