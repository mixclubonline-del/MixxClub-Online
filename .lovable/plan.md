

# Wire useUsageEnforcement into Project Creation & Audio Upload

The `useUsageEnforcement` hook already exists with full tier-limit logic, `canUseFeature()`, `getFeatureUsage()`, and `refreshUsage()`. It just needs to be wired into the two action points.

## Changes

### 1. `src/components/crm/projects/CreateProjectModal.tsx`
- Import `useUsageEnforcement`
- Before the form renders, check `canUseFeature('projects')` -- if limit reached, show an upgrade banner instead of the form with usage stats and a link to `/pricing`
- In `handleSubmit`, add a guard: if `!canUseFeature('projects')`, show a toast and return early
- After successful creation, call `refreshUsage()`
- Show usage indicator near the submit button (e.g., "2/3 projects used")

### 2. `src/pages/AudioUpload.tsx`
- Import `useUsageEnforcement`
- In `handleFiles`, before uploading, check `canUseFeature('audio_uploads')` -- if limit reached, show a toast with upgrade prompt and return early
- Also check if the number of files being uploaded would exceed the remaining limit, and cap or block accordingly
- After successful upload, call `refreshUsage()`
- Show a usage badge in the upload area header (e.g., "8/10 uploads used" for free tier)

### 3. No changes to `useUsageEnforcement.ts` itself
The hook is already complete with all needed methods.

