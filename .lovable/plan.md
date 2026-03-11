

# Reusable Usage Limit Warning Banner

## Component: `src/components/ui/UsageLimitBanner.tsx`

A single reusable component that accepts a feature key and renders contextual usage info with tier badge, progress bar, and upgrade CTA.

**Props:**
- `feature: string` — key from `useUsageEnforcement` (e.g. `'projects'`, `'audio_uploads'`, `'ai_matching'`)
- `label?: string` — human-readable feature name (defaults to formatted feature key)
- `variant?: 'inline' | 'banner'` — compact inline or full-width banner style
- `showAlways?: boolean` — if false (default), only shows when usage > 70%

**Behavior:**
- Uses `useUsageEnforcement` internally to get `tier`, `getFeatureUsage(feature)`
- Shows nothing if `showAlways=false` and usage < 70%
- At 70-89%: amber/warning style with "approaching limit" message
- At 90-99%: orange/urgent style
- At 100%: red/blocked style with "limit reached" message
- Unlimited features show nothing
- Upgrade button navigates to `/pricing?feature={feature}`
- Displays: tier badge, usage fraction (e.g. "8/10"), progress bar, remaining count

## Integration

Replace the inline limit-reached blocks in:
1. **`CreateProjectModal.tsx`** — replace the ~20-line inline warning block with `<UsageLimitBanner feature="projects" variant="banner" showAlways />`
2. **`AudioUpload.tsx`** — replace the inline limit banner with `<UsageLimitBanner feature="audio_uploads" variant="banner" showAlways />`
3. **`useEngineerMatchingAPI.ts`** — no UI change (toast-only), but export `matchingUsage` so consuming components can render `<UsageLimitBanner feature="ai_matching" />` if desired

## Design Tokens
- Uses glassmorphic card styling consistent with `GlassPanel` pattern
- Amber/orange/red gradient backgrounds matching the existing `FeatureGated` lock overlay aesthetic
- Progress bar reuses `<Progress />` component

