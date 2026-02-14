

## Walkthrough Screenshot Capture Edge Function

### What It Does

A backend function that accepts a URL path (e.g. `/`, `/pricing`, `/how-it-works`), captures a full-page screenshot via a free external screenshot API, and stores the result in the `brand-assets` bucket with a timestamped filename. The asset is also recorded in the `brand_assets` database table for the dynamic asset system to pick up.

### Screenshot Approach

Edge functions can't run headless browsers (no Puppeteer/Playwright in Deno). Instead, we'll use **thum.io** -- a free, no-API-key-required screenshot service that returns a PNG from any public URL. No new secrets needed.

If thum.io quality isn't sufficient later, it can be swapped for a paid service (ScreenshotOne, Urlbox, etc.) with a single URL change.

### How It Works

```text
Client Request
  POST /capture-walkthrough-screenshot
  Body: { path: "/pricing", viewport: "desktop" }
        |
        v
Edge Function
  1. Validate auth (admin-only)
  2. Build full URL: https://mixxclub.lovable.app{path}
  3. Fetch screenshot from thum.io:
     https://image.thum.io/get/width/1920/crop/1080/noanimate/https://mixxclub.lovable.app/pricing
  4. Upload PNG bytes to brand-assets bucket:
     walkthrough/pricing_desktop_2026-02-14T120000.png
  5. Insert record into brand_assets table
  6. Return { ok: true, asset }
```

### New File: `supabase/functions/capture-walkthrough-screenshot/index.ts`

- Accepts `path` (required), `viewport` (optional: `desktop` | `mobile`, defaults to `desktop`), and `name` (optional label)
- Desktop viewport: 1920x1080; Mobile: 390x844
- Constructs the thum.io URL with width/crop parameters
- Downloads the PNG bytes server-side
- Uploads to `brand-assets` bucket under `walkthrough/` prefix
- Filename format: `walkthrough/{sanitized-path}_{viewport}_{ISO-timestamp}.png`
- Inserts into `brand_assets` table with `asset_context: 'walkthrough'`, linking to the public URL
- Admin-only: checks `user_roles` for `admin` role before proceeding

### Config Update: `supabase/config.toml`

Add the new function entry:
```
[functions.capture-walkthrough-screenshot]
verify_jwt = false
```

### No New Dependencies or Secrets

- thum.io is free and keyless
- Uses existing `brand-assets` bucket (public, already exists)
- Uses existing `brand_assets` table schema
- Follows the same pattern as `save-brand-asset` for storage upload and DB insert

### Viewport Options

| Viewport | Width | Crop Height | thum.io params |
|----------|-------|-------------|----------------|
| desktop  | 1920  | 1080        | `width/1920/crop/1080` |
| mobile   | 390   | 844         | `width/390/crop/844` |

### Usage Example

```typescript
// From admin panel or script
const { data } = await supabase.functions.invoke('capture-walkthrough-screenshot', {
  body: { 
    path: '/pricing', 
    viewport: 'desktop',
    name: 'Pricing Page - Desktop' 
  }
});
// Returns: { ok: true, asset: { id, public_url, ... } }
```

### Batch Walkthrough Support

The function handles one screenshot per call. For a full walkthrough (multiple pages), the client calls it in sequence:

```typescript
const routes = ['/', '/pricing', '/how-it-works', '/for-artists'];
for (const path of routes) {
  await supabase.functions.invoke('capture-walkthrough-screenshot', {
    body: { path, viewport: 'desktop', name: `Walkthrough - ${path}` }
  });
}
```

### What This Enables

- Prime can trigger walkthrough captures from any admin UI or directly via function call
- All screenshots land in the `brand-assets` bucket, queryable by `asset_context = 'walkthrough'`
- The existing `useDynamicAssets` hook can surface these in any admin review panel
- Timestamps on filenames create a visual changelog of the site over time

