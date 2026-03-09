

# Regenerate Ecosystem Assets with Authentic Hip-Hop Culture

## Problem
The current 7 ecosystem images were generated with generic prompts that don't enforce the platform's cultural representation mandate: **50%+ African American, 25%+ Hispanic/Latino, streetwear styling, real studio/urban settings**. They need to be regenerated with culture-first prompts.

## Plan

Replace all 7 `brand_assets` images by generating new ones via the Dream Engine with culturally authentic prompts, then uploading to the same storage paths (overwriting the existing files).

### Updated Prompts (Culture-First)

| Context | New Prompt |
|---|---|
| `ecosystem_artist_pain` | A young Black rapper in a dim bedroom studio at 3am, Jordans kicked off, hoodie on, laptop showing dozens of unreleased tracks in Ableton, gold chain catching purple LED light, expression of creative frustration, lo-fi film grain, authentic hip-hop home studio setup |
| `ecosystem_engineer_pain` | A Black audio engineer with locs sitting alone in a professional home studio, Yamaha NS-10s on the desk, Pro Tools on dual monitors, acoustic foam walls, expensive outboard gear but an empty client chair, wearing a vintage rap tour tee, cyan/teal mood lighting, wasted potential |
| `ecosystem_producer_pain` | A young Latino producer in a fitted cap and streetwear at his beat-making station late at night, MPC and MIDI keyboard, YouTube analytics showing single-digit views on type beats, amber light from a desk lamp, stacks of hard drives full of beats nobody's heard, isolation |
| `ecosystem_fan_disconnect` | A young Black woman in streetwear scrolling her phone in a dark room, streaming app on screen showing an underground artist, double-tapping but feeling disconnected, rose/pink neon reflecting off her face, AirPods in, thousands of streams but zero real connection |
| `ecosystem_connection` | Four music creators in a cypher-like circle — a Black female rapper, a Latino producer on a laptop, a Black engineer at a portable rig, a fan holding up a phone recording — purple cyan amber and pink light beams connecting them, collaborative energy, authentic streetwear, warehouse studio vibe |
| `ecosystem_cycle` | Abstract cinematic visualization of a hip-hop economy ecosystem, vinyl records and 808 waveforms flowing in a circular pattern between silhouettes of rappers, producers, engineers and fans, all four brand colors (purple, cyan, amber, pink) blending, graffiti-textured energy, abundance |
| `ecosystem_cta` | Four glowing doorways in an underground warehouse venue, each a different color (purple for artists, cyan for engineers, amber for producers, rose for fans), fog machine haze, concert-style volumetric lighting, graffiti on the walls, cinematic wide shot, choose your path |

### Context Enhancement Update
Update `ecosystem_` in `dream-engine/index.ts` to include cultural guidance:
```
ecosystem_: "cinematic documentary photography, authentic hip-hop culture, African American and Latino representation, streetwear styling, real studio and urban settings, emotional storytelling, dramatic lighting, 8K quality, film grain"
```

### Execution
1. Update context enhancement string in `dream-engine/index.ts`
2. Generate 7 new images using `google/gemini-3-pro-image-preview` for highest quality
3. Upload each to the same `brand-assets/ecosystem/` paths (overwrite)
4. Update `brand_assets` rows with new timestamps

### Files Modified
- `supabase/functions/dream-engine/index.ts` — 1 line (context enhancement)

### No Other Code Changes
The `useEcosystemAssets` hook and all scene components remain unchanged — they'll pull the new images automatically.

