

# Generate & Upload Ecosystem Cinematic Assets

## What needs to happen

1. **Register `ecosystem_` context prefix** in `asset_contexts` table (required by the `validate_asset_context` trigger on `brand_assets`)
2. **Generate 7 cinematic images** via the `dream-engine-api` edge function using `action: "generate"` with `save: true` and `makeActive: true`
3. No code changes needed — `useEcosystemAssets` already queries `brand_assets` for these exact contexts

## Database insert

Insert one row into `asset_contexts`:
```sql
INSERT INTO asset_contexts (context_prefix, name, description, icon)
VALUES ('ecosystem_', 'Ecosystem Story', 'Cinematic backgrounds for the For Creatives ecosystem story page', '🎬');
```

## Also add `ecosystem_` to the dream engine context enhancements

Add an entry in `supabase/functions/dream-engine/index.ts` contextEnhancements so prompts get auto-enhanced:
```
ecosystem_: "cinematic documentary photography, emotional storytelling, music industry atmosphere, dramatic lighting, 8K quality, film grain"
```

## Generate 7 images via dream-engine-api

Call the `dream-engine-api` edge function 7 times with `action: "generate"`, `mode: "image"`, `save: true`, `makeActive: true`, and these specific prompts/contexts:

| Context | Prompt |
|---|---|
| `ecosystem_artist_pain` | A young Black artist alone in a dimly lit bedroom at 3am, laptop open showing a folder with dozens of unreleased tracks, headphones around their neck, purple/violet ambient lighting, expression of frustration and longing, lo-fi film aesthetic |
| `ecosystem_engineer_pain` | A mixing engineer sitting alone in a professional home studio, dual monitors glowing with Pro Tools, acoustic panels on walls, expensive gear everywhere but an empty client chair, cyan/teal mood lighting, feeling of wasted potential |
| `ecosystem_producer_pain` | A producer at their workstation late at night, YouTube Studio analytics on screen showing single-digit views on type beats, MIDI keyboard and monitors, amber/gold lighting, stacks of beats but no connections, isolation |
| `ecosystem_fan_disconnect` | A music fan scrolling their phone in a dark room, streaming app visible, double-tapping but feeling disconnected, rose/pink lighting reflecting off their face, thousands of streams but zero connection to the artist |
| `ecosystem_connection` | Split composition showing four music creators connecting through screens and technology, purple cyan amber and pink light beams converging in the center, moment of discovery and hope, collaborative energy emerging |
| `ecosystem_cycle` | Abstract cinematic visualization of a music economy ecosystem, flowing energy between creators, currency and music notes moving in a circular pattern, all four colors (purple, cyan, amber, pink) blending, sense of abundance and flow |
| `ecosystem_cta` | Four glowing doorways/portals side by side, each a different color (purple, cyan, amber, rose), inviting the viewer to choose their path, dramatic fog and volumetric lighting, cinematic wide shot, sense of possibility |

Each call uses `style: "cinematic"` and the dream engine will:
- Generate via Lovable AI (Gemini image model)
- Upload to `brand-assets` storage bucket
- Insert into `brand_assets` table with correct `asset_context`
- Set `is_active: true`

## Files modified
- `supabase/functions/dream-engine/index.ts` — add `ecosystem_` context enhancement (1 line)

## No other code changes
The `useEcosystemAssets` hook already queries for these exact contexts and will automatically display the images over the gradient fallbacks.

