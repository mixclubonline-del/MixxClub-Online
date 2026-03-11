

# Fix Admin "View as Role" Preview for All CRM Dashboards

## Problem

The "View as Role" feature in the Admin Dashboard (`AdminViewAsRole`) lets admins preview each role's CRM. It sets `isPreviewMode: true` in the `useAdminPreview` store and navigates to the target CRM route. However, the behavior is inconsistent across CRMs:

| CRM | Has admin guard? | Checks `isPreviewMode`? | Result for admin |
|-----|-----------------|------------------------|------------------|
| ArtistCRM | Yes | Yes | Works correctly |
| EngineerCRM | Yes | Yes | Works correctly |
| ProducerCRM | No guard at all | No | Works by accident (no redirect) but missing `useAdminPreview` import |
| FanHub | No guard at all | No | Works by accident but no preview banner shown |

The `CRMPortal` already renders `AdminRolePreview` (the top banner with "Exit Preview") when `isPreviewMode` is true, so the banner should already appear. The main fixes needed are:

1. **ProducerCRM**: Add the admin guard with `isPreviewMode` bypass (matching Artist/Engineer pattern)
2. **FanHub**: Add the admin guard with `isPreviewMode` bypass
3. Both will then consistently redirect non-preview admins back to `/admin` while allowing preview mode to work

## Changes

### 1. `src/pages/ProducerCRM.tsx`
- Import `useAdminPreview` and `supabase`
- Add `isPreviewMode` check in `useEffect`
- Add admin guard: if admin and not previewing, redirect to `/admin`
- This matches the exact pattern in ArtistCRM lines 99-117

### 2. `src/pages/FanHub.tsx`
- Import `useAdminPreview`, `supabase`, `useNavigate`, `toast`
- Add admin guard `useEffect` with `isPreviewMode` bypass
- Same pattern as above

Both are small edits (adding ~15 lines each) to bring them to parity with Artist and Engineer CRMs.

