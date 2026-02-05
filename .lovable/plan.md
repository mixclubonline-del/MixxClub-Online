

# Producer Beat Marketplace & Purchase Flow
## Catalog Management, Beat Player, Pricing Tiers & Stripe Checkout

This plan enhances the Producer experience with a complete beat management system, immersive beat player, flexible licensing tiers, and end-to-end Stripe checkout flow.

---

## Current State Analysis

### Already Built
| Component | Status | Notes |
|-----------|--------|-------|
| `producer_beats` table | Complete | Full schema with pricing, licensing, status |
| `beat_purchases` table | Complete | Tracks sales with 70/30 split |
| `useProducerBeats` hook | Complete | CRUD operations for catalog |
| `useBeatMarketplace` hook | Complete | Filtering, search, pagination |
| `useBeatPurchase` hook | Complete | Checkout trigger |
| `useProducerSales` hook | Complete | Sales analytics |
| `BeatMarketplace` page | Complete | Browse/filter/search beats |
| `BeatDetailModal` | Complete | License selection + purchase |
| `LicenseSelector` | Complete | Lease vs Exclusive comparison |
| `BeatAudioPlayer` | Basic | No waveform visualization |
| `BeatCard` (Producer) | Complete | Catalog card with actions |
| `create-beat-checkout` edge function | Complete | Stripe session creation |
| `stripe-webhook` (beat handler) | Complete | Fulfillment logic added |
| `ProducerCatalogHub` | Partial | Grid view only, no upload |
| `ProducerSalesHub` | Complete | Overview + table |

### What's Missing
| Component | Purpose |
|-----------|---------|
| `BeatUploadModal` | Create/edit beats with file uploads |
| `BeatWaveformPlayer` | WaveSurfer-based player with scrubbing |
| `LicenseTermsEditor` | Producer sets custom license terms |
| `ProducerStorefrontPage` | Public producer beat catalog |
| `BeatBulkActions` | Multi-select operations |
| `BeatEditModal` | Edit existing beat metadata |
| `BeatAnalyticsCard` | Per-beat play/sale stats |
| `PricingTierPresets` | Quick price templates |
| Enhanced filters in Catalog | By status, sales, plays |

---

## Architecture

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                    PRODUCER BEAT ECOSYSTEM                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  PRODUCER CRM                      PUBLIC MARKETPLACE                   │
│  ┌─────────────────────┐          ┌─────────────────────┐              │
│  │  ProducerCatalogHub │          │   BeatMarketplace   │              │
│  │  - Beat Grid        │          │   - Browse/Filter   │              │
│  │  - Upload Button    │          │   - Search          │              │
│  │  - Status Tabs      │          │   - Play Preview    │              │
│  └──────────┬──────────┘          └──────────┬──────────┘              │
│             │                                │                          │
│             ▼                                ▼                          │
│  ┌─────────────────────┐          ┌─────────────────────┐              │
│  │   BeatUploadModal   │          │   BeatDetailModal   │              │
│  │   - Audio Upload    │          │   - Waveform Player │              │
│  │   - Cover Upload    │          │   - License Select  │              │
│  │   - Metadata Form   │          │   - Producer Info   │              │
│  │   - Pricing Setup   │          │   - Buy Button      │              │
│  └──────────┬──────────┘          └──────────┬──────────┘              │
│             │                                │                          │
│             ▼                                ▼                          │
│  ┌─────────────────────┐          ┌─────────────────────┐              │
│  │  producer_beats     │◄────────►│ create-beat-checkout│              │
│  │  (Supabase table)   │          │ (Edge Function)     │              │
│  └─────────────────────┘          └──────────┬──────────┘              │
│                                              │                          │
│                                              ▼                          │
│                                   ┌─────────────────────┐              │
│                                   │   Stripe Checkout   │              │
│                                   │   - Payment         │              │
│                                   │   - Redirect        │              │
│                                   └──────────┬──────────┘              │
│                                              │                          │
│                                              ▼                          │
│                                   ┌─────────────────────┐              │
│                                   │   stripe-webhook    │              │
│                                   │   - Insert purchase │              │
│                                   │   - Mark exclusive  │              │
│                                   │   - Notify producer │              │
│                                   └──────────┬──────────┘              │
│                                              │                          │
│                                              ▼                          │
│                                   ┌─────────────────────┐              │
│                                   │  beat_purchases     │              │
│                                   │  (Buyer Library)    │              │
│                                   └─────────────────────┘              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Beat Upload System

**1.1 Create `BeatUploadModal`**

**File:** `src/components/producer/BeatUploadModal.tsx`

Multi-step modal for creating/editing beats:

**Step 1: Audio Upload**
```typescript
interface BeatUploadStep1 {
  audioFile: File | null;
  coverImageFile: File | null;
  audioUrl?: string; // For editing
  coverImageUrl?: string;
}
```
- Drag-and-drop for audio (MP3, WAV)
- Auto-generate waveform preview
- Cover image upload with crop
- Progress indicator during upload

**Step 2: Beat Details**
```typescript
interface BeatDetails {
  title: string;
  bpm: number;
  key_signature: string;
  genre: string;
  tags: string[];
  description: string;
  mood: string[];
}
```
- Title (required)
- BPM with detection suggestion
- Key signature selector
- Genre dropdown (Hip Hop, Trap, R&B, etc.)
- Tags multi-select (up to 10)
- Description textarea
- Mood selector (Dark, Energetic, Chill, etc.)

**Step 3: Pricing & Licensing**
```typescript
interface PricingConfig {
  license_type: 'lease' | 'exclusive' | 'both';
  price_cents: number;
  exclusive_price_cents: number;
  usePreset?: 'budget' | 'standard' | 'premium';
}
```
- License type toggle (Lease/Exclusive/Both)
- Price inputs with cents conversion
- Preset buttons: Budget ($19.99/$199), Standard ($29.99/$299), Premium ($49.99/$499)
- Preview of what buyers see

**Step 4: Review & Publish**
- Summary of all fields
- Preview card
- "Save as Draft" or "Publish Now" buttons

**1.2 Update `ProducerCatalogHub`**

Add upload trigger:
```typescript
// Add floating action button
<Button onClick={() => setUploadModalOpen(true)}>
  <Plus /> Upload Beat
</Button>

// State management
const [uploadModalOpen, setUploadModalOpen] = useState(false);
const [editingBeat, setEditingBeat] = useState<ProducerBeat | null>(null);
```

**1.3 Create `BeatEditModal`**

Reuses `BeatUploadModal` in edit mode:
```typescript
<BeatUploadModal
  open={!!editingBeat}
  onOpenChange={() => setEditingBeat(null)}
  beat={editingBeat} // Pre-populate form
  mode="edit"
/>
```

---

### Phase 2: Enhanced Beat Player

**2.1 Create `BeatWaveformPlayer`**

**File:** `src/components/beats/BeatWaveformPlayer.tsx`

WaveSurfer-based player with:
```typescript
interface BeatWaveformPlayerProps {
  audioUrl: string;
  previewMode?: boolean; // Limits playback to 30 seconds
  onPlay?: () => void;
  onEnd?: () => void;
  className?: string;
}
```

Features:
- Full waveform visualization
- Click-to-seek scrubbing
- Play/pause with keyboard (spacebar)
- Current time / duration display
- Volume control with mute toggle
- Loop toggle for producers
- 30-second preview limit for non-purchasers

Implementation using existing Peaks.js pattern:
```typescript
import WaveSurfer from 'wavesurfer.js';

const wavesurfer = WaveSurfer.create({
  container: containerRef.current,
  waveColor: 'hsl(var(--muted))',
  progressColor: 'hsl(var(--primary))',
  cursorColor: 'hsl(var(--primary))',
  height: 80,
  normalize: true,
  backend: 'MediaElement',
});
```

**2.2 Integrate into `BeatDetailModal`**

Replace basic `BeatAudioPlayer`:
```typescript
// Before
<BeatAudioPlayer audioUrl={audioUrl} title={beat.title} />

// After
<BeatWaveformPlayer 
  audioUrl={audioUrl} 
  previewMode={true} 
  onEnd={() => toast.info('Purchase for full track')}
/>
```

**2.3 Add to `BeatCard` (Producer)**

Inline mini-waveform for quick preview:
```typescript
<BeatWaveformPlayer 
  audioUrl={beat.preview_url || beat.audio_url} 
  compact={true}
/>
```

---

### Phase 3: Pricing Tiers & License Management

**3.1 Create `LicenseTermsEditor`**

**File:** `src/components/producer/LicenseTermsEditor.tsx`

Producer configures custom license terms:
```typescript
interface LicenseTerms {
  lease: {
    streams: number; // Default 500,000
    credit_required: boolean;
    commercial_use: boolean;
    modifications_allowed: boolean;
    distribution_limit: number; // Default 10,000
    includes_stems: boolean;
    includes_trackouts: boolean;
  };
  exclusive: {
    full_ownership: boolean;
    credit_required: boolean;
    resale_rights: boolean;
    includes_stems: boolean;
    includes_trackouts: boolean;
    remove_from_store: boolean;
  };
}
```

UI:
- Two-column comparison
- Toggle switches for each term
- Number inputs for limits
- Live preview of license agreement

**3.2 Create `PricingTierPresets`**

**File:** `src/components/producer/PricingTierPresets.tsx`

Quick pricing templates:
```typescript
const PRESETS = {
  budget: { lease: 1999, exclusive: 19900, label: 'Budget' },
  standard: { lease: 2999, exclusive: 29900, label: 'Standard' },
  premium: { lease: 4999, exclusive: 49900, label: 'Premium' },
  pro: { lease: 9999, exclusive: 99900, label: 'Pro' },
};
```

Visual cards with one-click selection.

**3.3 Database: Store Custom Terms**

Add `custom_license_terms` JSONB column to `producer_beats`:
```sql
ALTER TABLE public.producer_beats
ADD COLUMN custom_license_terms jsonb DEFAULT NULL;
```

---

### Phase 4: Producer Storefront

**4.1 Create `/producer/:username/beats` Route**

**File:** `src/pages/ProducerStorefront.tsx`

Public-facing producer beat catalog:
```typescript
interface ProducerStorefrontProps {
  username: string;
}
```

Features:
- Producer profile header
- Beat grid with filters
- Featured beats section
- Contact/Hire button
- Social links
- Total catalog stats (beats, plays, sales)

**4.2 Link from Profile**

Add beats tab to public profile:
```typescript
// In PublicProfile.tsx
<TabsTrigger value="beats">
  <Music className="h-4 w-4 mr-2" />
  Beats ({beatCount})
</TabsTrigger>
```

---

### Phase 5: Bulk Operations & Analytics

**5.1 Create `BeatBulkActions`**

**File:** `src/components/producer/BeatBulkActions.tsx`

Multi-select operations:
```typescript
const bulkActions = [
  { label: 'Publish Selected', action: 'publish' },
  { label: 'Archive Selected', action: 'archive' },
  { label: 'Set Price', action: 'price' },
  { label: 'Delete Selected', action: 'delete' },
];
```

UI:
- Checkbox selection on cards
- Floating action bar when items selected
- Confirmation dialogs for destructive actions

**5.2 Create `BeatAnalyticsCard`**

**File:** `src/components/producer/BeatAnalyticsCard.tsx`

Per-beat performance:
```typescript
interface BeatAnalytics {
  plays: number;
  plays_trend: number; // % change week over week
  sales: number;
  revenue_cents: number;
  conversion_rate: number; // plays to sales
}
```

Visual card with:
- Mini line chart (last 7 days)
- Key metrics
- Compare to catalog average

**5.3 Add to `BeatCard` (Producer)**

Expandable analytics section:
```typescript
<Collapsible>
  <CollapsibleTrigger>
    <BarChart2 className="h-4 w-4" /> Analytics
  </CollapsibleTrigger>
  <CollapsibleContent>
    <BeatAnalyticsCard beatId={beat.id} />
  </CollapsibleContent>
</Collapsible>
```

---

### Phase 6: Enhanced Catalog Filters

**6.1 Update `ProducerCatalogHub`**

Add filter controls:
```typescript
interface CatalogFilters {
  status: 'all' | 'published' | 'draft' | 'archived';
  sortBy: 'newest' | 'oldest' | 'plays' | 'sales' | 'price';
  genre?: string;
  priceRange?: { min: number; max: number };
}
```

UI:
- Status tabs (already exist)
- Sort dropdown
- Genre filter
- Price range slider
- Search within catalog

**6.2 Add Search**

Real-time search across beat titles/tags:
```typescript
<Input
  placeholder="Search your beats..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
/>
```

---

### Phase 7: Mobile-Optimized Experience

**7.1 Responsive Beat Grid**

Adjust grid for mobile:
```typescript
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
```

**7.2 Touch-Friendly Player**

Larger touch targets for waveform scrubbing:
```typescript
<BeatWaveformPlayer
  touchMode={isMobile}
  height={isMobile ? 60 : 80}
/>
```

**7.3 Bottom Sheet for Modals**

Use Vaul drawer on mobile:
```typescript
{isMobile ? (
  <Drawer open={open} onOpenChange={onOpenChange}>
    <DrawerContent>{content}</DrawerContent>
  </Drawer>
) : (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>{content}</DialogContent>
  </Dialog>
)}
```

---

## File Summary

### New Files (11)

| File | Purpose |
|------|---------|
| `src/components/producer/BeatUploadModal.tsx` | Multi-step beat creation wizard |
| `src/components/producer/BeatEditModal.tsx` | Edit existing beat wrapper |
| `src/components/beats/BeatWaveformPlayer.tsx` | WaveSurfer-based audio player |
| `src/components/producer/LicenseTermsEditor.tsx` | Custom license configuration |
| `src/components/producer/PricingTierPresets.tsx` | Quick pricing templates |
| `src/components/producer/BeatBulkActions.tsx` | Multi-select operations |
| `src/components/producer/BeatAnalyticsCard.tsx` | Per-beat performance stats |
| `src/pages/ProducerStorefront.tsx` | Public producer beat catalog |
| `src/components/beats/index.ts` | Export beats components |
| `src/hooks/useBeatUpload.ts` | Audio/cover upload logic |
| Database migration | Add custom_license_terms column |

### Modified Files (7)

| File | Changes |
|------|---------|
| `src/components/crm/producer/ProducerCatalogHub.tsx` | Upload button, filters, search |
| `src/components/producer/BeatCard.tsx` | Analytics section, edit action |
| `src/components/marketplace/BeatDetailModal.tsx` | Waveform player integration |
| `src/components/producer/index.ts` | Export new components |
| `src/pages/PublicProfile.tsx` | Beats tab for producers |
| `src/App.tsx` | ProducerStorefront route |
| `src/hooks/useProducerBeats.ts` | Search/filter enhancements |

---

## Database Migration

```sql
-- Add custom license terms storage
ALTER TABLE public.producer_beats
ADD COLUMN IF NOT EXISTS custom_license_terms jsonb DEFAULT NULL;

-- Add index for marketplace searches
CREATE INDEX IF NOT EXISTS idx_producer_beats_search 
ON public.producer_beats USING gin(to_tsvector('english', title || ' ' || coalesce(description, '')));

-- Add composite index for filtering
CREATE INDEX IF NOT EXISTS idx_producer_beats_marketplace
ON public.producer_beats (status, genre, price_cents)
WHERE status = 'published';
```

---

## Rollout Sequence

1. **Phase A: Upload** - BeatUploadModal, file upload hooks, storage integration
2. **Phase B: Player** - BeatWaveformPlayer, integration with marketplace
3. **Phase C: Pricing** - License editor, presets, database column
4. **Phase D: Storefront** - Public producer page, profile integration
5. **Phase E: Bulk Ops** - Multi-select, bulk actions, analytics cards
6. **Phase F: Polish** - Mobile optimization, filters, search

---

## Technical Considerations

### File Upload Strategy
- Audio files → `audio-files` bucket (existing, public)
- Cover images → `brand-assets` bucket (existing, public)
- Generate preview URL for 30-second clips (or use same audio with frontend limit)

### Waveform Generation
- Use existing `generate-waveform` edge function
- Store waveform data as JSON in `producer_beats.waveform_data`

### Stripe Integration
- Existing `create-beat-checkout` handles session creation
- Existing `stripe-webhook` handles fulfillment
- 70/30 split already configured

### License Agreement
- Generate downloadable PDF with purchase
- Store custom terms in session metadata
- Include in purchase confirmation email

### Performance
- Lazy load waveform player
- Progressive image loading for covers
- Pagination for large catalogs (12 beats/page)

This plan creates a professional beat marketplace experience where Producers can easily manage their catalog, set flexible pricing, and track performance—while buyers enjoy an immersive discovery experience with instant checkout powered by Stripe.

