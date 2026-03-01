
# Generate Fresh Promo Funnel Brand Assets via Dream Engine

## What This Does

Creates a new `generate-promo-assets` edge function that batch-generates 6 cinematic background images (one per `/go` funnel scene) using the Lovable AI gateway (Gemini 3 Pro Image), then saves each as an active brand asset under the correct `promo_*` context. Once generated, the existing `usePromoAssets` hook will automatically pick them up -- no frontend changes needed.

## Scene Prompts

Each prompt is crafted to match the scene's narrative purpose and MixxClub's visual doctrine (cyberpunk studio aesthetic, purple/cyan palette, 8K cinematic):

| Scene | Context | Prompt Concept |
|-------|---------|----------------|
| Hook | `promo_hook` | Frustrated independent artist alone in a dimly lit bedroom studio, headphones around neck, staring at a laptop screen showing a rejected upload. Raw, emotional, cinematic. Purple-tinted shadows, single desk lamp light. |
| Answer | `promo_answer` | Split-screen composition: left side shows a phone uploading a track with a glowing progress bar, right side shows a professional mixing engineer in a high-end studio nodding approvingly. Connected by flowing light trails in cyan and purple. |
| Proof | `promo_proof` | Close-up macro shot of a professional studio mixing console with glowing VU meters peaking, waveforms visible on dual monitors behind it. Dramatic rim lighting, shallow depth of field. Cyberpunk color palette, purple and cyan neon reflections on brushed metal surfaces. |
| Try It | `promo_tryit` | Hands hovering over a futuristic holographic audio interface, dragging a music file into a glowing AI processing ring. Particles of sound visualized as cyan light streams. Dark studio environment, dramatic volumetric lighting. |
| Culture | `promo_culture` | Diverse group of young musicians and producers gathered in a neon-lit underground studio lounge. Some wearing headphones, one on a beat pad, another sketching album art. Purple and cyan ambient lighting, authentic streetwear, candid energy. Community vibe. |
| CTA | `promo_cta` | Epic wide shot of a futuristic music city skyline at golden hour, massive holographic MIXXCLUB logo floating above the buildings. Flying vehicles leaving light trails, atmospheric mist in lower levels. Cinematic matte painting style, purple and gold palette. |

## Technical Implementation

### New Edge Function: `supabase/functions/generate-promo-assets/index.ts`

- Uses service-role key (no user auth required) so it can be triggered by an admin or the agent
- `verify_jwt = false` in config.toml (same pattern as `orchestrate-promo-campaign`)
- For each scene:
  1. Calls Lovable AI gateway (`google/gemini-3-pro-image-preview`) with the crafted prompt
  2. Extracts the base64 image from the response
  3. Uploads to `brand-assets` storage bucket under `promo/` path
  4. Inserts into `brand_assets` table with `asset_context` set to the scene's primary context (e.g., `promo_hook`)
  5. Deactivates any previous asset with the same context before activating the new one
- Returns a summary of all generated assets (success/failure per scene)
- Includes error handling per scene so one failure does not block the others

### Config Update: `supabase/config.toml`

Add the function entry:
```toml
[functions.generate-promo-assets]
verify_jwt = false
```

### No Frontend Changes

The `usePromoAssets` hook already queries `brand_assets` for `promo_hook`, `promo_answer`, etc. as primary contexts. Once the assets exist in the DB with `is_active = true`, they will be served automatically on the next `/go` page load.

### No New Dependencies

Uses the Lovable AI gateway (pre-configured `LOVABLE_API_KEY`), the existing `brand-assets` storage bucket, and the existing `brand_assets` table.

## Execution Flow

1. Create the edge function with all 6 scene prompts hardcoded
2. Deploy it
3. Invoke it once to generate all 6 assets
4. Verify the assets appear in the DB and resolve correctly on `/go`

## Files

| Action | File |
|--------|------|
| Create | `supabase/functions/generate-promo-assets/index.ts` |

Estimated: ~180 lines, single file, zero frontend changes.
