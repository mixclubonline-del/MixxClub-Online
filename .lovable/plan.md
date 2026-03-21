

## Add Download/Preview to Version Timeline

### What Changes
Add download and preview buttons to each deliverable entry in the Version Timeline section of `ActiveWorkHub`. Uses signed URLs from the `engineer-deliverables` storage bucket (same pattern as `MixReviewInterface`).

### Plan

**1. `src/components/crm/ActiveWorkHub.tsx`**
- Import `Download`, `Eye` icons from lucide-react
- Import `createSignedUrl` from `@/lib/storage/signedUrls`
- Add a `handleDownload(filePath, fileName)` function that generates a signed URL and triggers browser download via a temporary `<a>` element
- Add a `handlePreview(filePath)` function that generates a signed URL and opens it in a new tab
- In the Version Timeline section (lines 222-241), add two icon buttons next to the status badge:
  - **Preview** (Eye icon) — opens signed URL in new tab (useful for audio files the browser can play)
  - **Download** (Download icon) — triggers file download
- Also add the same buttons to the Recent Deliverables section (lines 185-195)

### Technical Details
- Signed URL generation: `createSignedUrl('engineer-deliverables', filePath, 3600)` — 1 hour expiry
- Download trigger: create temporary `<a>` with `download` attribute and click it
- Both buttons are small icon buttons (`size="icon"`, `variant="ghost"`) to keep the timeline compact
- Loading state on individual buttons while URL generates using local state map
- `file_path` is already in the query results — no additional DB queries needed

### Files Changed
- `src/components/crm/ActiveWorkHub.tsx` — add download/preview handlers and buttons

