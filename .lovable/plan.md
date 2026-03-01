

# Add "Try a Demo Beat" Button to TryItScene

## What It Does

Adds a secondary button in the upload phase that lets visitors skip the file upload step entirely. Tapping "Try a demo beat" fetches the test MP3 from storage and feeds it directly into the Velvet Curve mastering pipeline -- same flow, zero friction.

## Implementation

### File: `src/components/promo/scenes/TryItScene.tsx` (~25 lines added)

**New state + loader function:**
- Add `isLoadingDemo` boolean state to show a loading spinner on the demo button
- Add `handleDemoTrack` async function that:
  1. Downloads the file from the private `audio-files` bucket using `supabase.storage.from('audio-files').download('original_1772324337610_TEST MP3.mp3')`
  2. Converts the returned Blob into a `File` object (name: `Demo Beat.mp3`)
  3. Sets it as the active file via `setFile()`
  4. Immediately calls `handleMaster()` to start processing (no extra tap needed)

**UI placement:**
- Below the existing "Master My Track" button, add a divider ("or") and the demo button
- Button uses `variant="ghost"` styling with a Music icon, reading "Try a demo beat"
- When loading, button shows a spinner and "Loading demo..." text
- The demo button is only visible when no file has been selected yet (clean UX)

```text
[ Master My Track ]         (existing, disabled until file selected)
       ── or ──
[ Try a demo beat ]         (new, always enabled, ghost style)
```

**Mastering flow adjustment:**
- `handleMaster` currently guards on `if (!file) return` -- need to accept a `File` parameter override so `handleDemoTrack` can pass the file directly without waiting for a re-render after `setFile()`
- Signature becomes: `handleMaster(overrideFile?: File)` and uses `overrideFile ?? file` internally

### Storage Access

The `audio-files` bucket is private. The `supabase.storage.download()` method uses the anon key which works for public buckets but requires an RLS policy for private ones. Two options:

**Option A (recommended):** Add an RLS SELECT policy on `storage.objects` allowing anonymous read for the specific demo file path. This is safe because it's a single known file meant for public demo use.

```sql
CREATE POLICY "Allow anonymous read of demo beat"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'audio-files'
  AND name = 'original_1772324337610_TEST MP3.mp3'
);
```

**Option B:** Use a signed URL via an edge function. Heavier, unnecessary for a single public demo file.

Going with Option A -- minimal, secure, scoped to one file.

## File Summary

| Action | File | Change |
|--------|------|--------|
| Migrate | SQL | RLS policy for anonymous demo file read |
| Modify | `src/components/promo/scenes/TryItScene.tsx` | Demo button + loader + handleMaster param override |

