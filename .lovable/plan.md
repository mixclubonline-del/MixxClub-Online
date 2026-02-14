

## Wire Press Kit Download Buttons

### Current State
- Press page (`src/pages/Press.tsx`) has 4 download buttons (Full Press Kit, Logo Pack, Screenshots, Fact Sheet) with no `onClick` handlers
- The `brand-assets` storage bucket exists and is public, but contains no `press/` files yet
- No existing press-kit download utility in the codebase

### Implementation

#### 1. Create a `usePressBrandAssets` hook (`src/hooks/usePressBrandAssets.ts`)

A small hook that:
- Accepts a subfolder name (e.g. `press/logos`, `press/screenshots`, `press/fact-sheet`, or `press/full-kit`)
- Lists files in `brand-assets` bucket under that path using `supabase.storage.from('brand-assets').list(path)`
- If files exist, generates a public URL and triggers a download (single file) or bundles them via JSZip (multiple files)
- If no files exist, shows a toast: **"Press kit coming soon -- check back shortly."**

#### 2. Update `src/pages/Press.tsx`

Wire each of the 4 buttons:

| Button | Storage Path | Behavior |
|--------|-------------|----------|
| Download Full Press Kit | `press/full-kit` | Download all files as zip, or toast if empty |
| Download Logos | `press/logos` | Download all logo files as zip, or toast if empty |
| Download Screenshots | `press/screenshots` | Download all screenshots as zip, or toast if empty |
| Download PDF | `press/fact-sheet` | Download single PDF, or toast if empty |

Each button gets:
- An `onClick` handler calling the hook's download function
- A loading/disabled state while fetching

#### 3. Toast style

Uses the existing `sonner` toast (already imported pattern on the page's sibling files) for the "coming soon" message -- keeps it consistent with the rest of the app.

### Technical Details

- **New file**: `src/hooks/usePressBrandAssets.ts`
- **Modified file**: `src/pages/Press.tsx`
- **No new dependencies** -- uses existing `jszip` (already installed) and `sonner` toast
- **No database or schema changes**
- **Storage convention**: assets go under `brand-assets/press/{logos,screenshots,fact-sheet,full-kit}/` -- when files are uploaded there later, the buttons will work automatically

