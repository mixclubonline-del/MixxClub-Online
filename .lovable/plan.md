

# Generate Replacement Promo Images via Pipeline

## What We're Replacing

Based on the visual audit, two journey images fall short of the 50%+ African American / 25%+ Hispanic/Latino representation standard:

| Asset File | Current Subject | Replacement |
|---|---|---|
| `artist-ai-analysis.jpg` (Step 2: AI Session Prep) | Non-representative subject | African American male engineer reviewing AI analysis on a monitor, streetwear (hoodie/chain), bedroom studio with LED ambient lighting |
| `artist-live-collab.jpg` (Step 4: Real-Time Collaboration) | Back-angle, unidentifiable | Hispanic/Latino male engineer with visible face, headphones around neck, gesturing at dual monitors in a professional studio, streetwear styling |

These images are used on `/for-artists`, `/for-producers`, and `/for-fans` pages.

## Implementation

### Step 1: Create a batch generation edge function caller
Build a small admin-only page or use the existing `generate-promo-image` edge function directly with two calls:

**Call 1 — `artist-ai-analysis` replacement:**
```
Prompt: "Photorealistic image of a young African American male music producer in a home studio, wearing a black hoodie and gold chain, reviewing AI-powered audio analysis on a 27-inch monitor showing waveforms and spectrograms. Purple and blue LED ambient lighting, professional microphone visible. Cinematic lighting, shallow depth of field. Urban hip-hop aesthetic."
Filename: "artist-ai-analysis-v2"
```

**Call 2 — `artist-live-collab` replacement:**
```
Prompt: "Photorealistic image of a young Hispanic/Latino male audio engineer with visible face, wearing streetwear (graphic tee, snapback cap), headphones around his neck, gesturing at dual monitors showing a DAW session with real-time collaboration UI. Professional recording studio with acoustic panels and rack gear. Warm studio lighting, cinematic composition. Urban music culture aesthetic."
Filename: "artist-live-collab-v2"
```

### Step 2: Download and replace local assets
After generation, the images will be in the `brand-assets` storage bucket. We then:
- Download the generated images
- Replace `src/assets/promo/artist-ai-analysis.jpg` and `src/assets/promo/artist-live-collab.jpg` with the new versions
- No import changes needed since filenames stay the same

### Step 3: Verify
Screenshot the `/for-artists` journey section to confirm the new images render correctly and meet cultural representation standards.

## Files Modified
- `src/assets/promo/artist-ai-analysis.jpg` — replaced with generated image
- `src/assets/promo/artist-live-collab.jpg` — replaced with generated image

No code changes required — the imports already reference these filenames.

