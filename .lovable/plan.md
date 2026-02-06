

## Admin Role Preview: "View as Role" Feature

### What This Does
Adds a **role preview switcher** to the Admin CRM that lets you instantly view the platform as any of the four roles (Artist, Engineer, Producer, Fan) without leaving the admin panel. This is purely a **visual preview mode** -- it does not change your actual roles or auth state. A persistent banner clearly marks when you're in preview mode, and one click returns you to the admin view.

### How It Works

The Admin Dashboard will get a new "View as Role" section in the Quick Actions area with four role buttons. Clicking one navigates you directly to that role's CRM page (`/artist-crm`, `/engineer-crm`, `/producer-crm`, `/fan-hub`) while setting a **preview flag** in local state. This flag:

1. **Bypasses the admin redirect** -- Currently, `ArtistCRM` and `EngineerCRM` both check `has_role('admin')` and redirect admins back to `/admin`. The preview flag tells these pages to skip that guard.
2. **Shows a floating preview banner** -- A persistent bar at the top of the screen says "Previewing as [Role] -- Exit Preview" so you always know you're in preview mode and can return to `/admin` instantly.

### Implementation Details

**1. New component: `AdminRolePreview.tsx`**
A floating banner component that renders when the admin is in preview mode. Displays the active preview role with its icon, a colored accent, and an "Exit Preview" button that clears the flag and navigates back to `/admin`.

**2. New component: `AdminViewAsRole.tsx`**
A card component rendered inside the Admin Dashboard with four role buttons (Artist, Engineer, Producer, Fan). Each button navigates to the corresponding CRM route while setting the preview state.

**3. State management via Zustand store**
A small `useAdminPreview` store that holds:
- `previewRole`: the role being previewed (`null` when not previewing)
- `isPreviewMode`: computed boolean
- `enterPreview(role)`: sets the preview role
- `exitPreview()`: clears it

Using Zustand (already installed) keeps this decoupled from the auth context -- the admin's actual roles and auth state are never modified. The store persists nothing to the database.

**4. Modify `ArtistCRM.tsx` and `EngineerCRM.tsx` admin guards**
Both pages currently have this pattern:
```text
const { data: isAdmin } = await supabase.rpc('has_role', { ... });
if (isAdmin) { navigate('/admin'); return; }
```
This will be wrapped with a check: if `isPreviewMode` is true, skip the redirect.

**5. Wire preview banner into `CRMPortal.tsx`**
The `AdminRolePreview` banner is added inside `CRMPortal` so it appears on every CRM page when preview mode is active.

**6. Add "View as Role" to Admin Dashboard**
The `AdminViewAsRole` card is added to `AdminDashboardHub.tsx` or wired as a quick action in `AdminCRM.tsx`.

### Security Notes
- No auth tokens or database roles are modified
- The preview is purely client-side visual navigation
- The admin's actual `user_roles` remain unchanged
- RLS policies still enforce the admin's actual permissions (admin can read all data via admin RLS policies anyway)
- Preview mode auto-clears on sign-out

### Files to Create
| File | Purpose |
|------|---------|
| `src/stores/useAdminPreview.ts` | Zustand store for preview state |
| `src/components/admin/AdminRolePreview.tsx` | Floating "Previewing as..." banner |
| `src/components/admin/AdminViewAsRole.tsx` | Role selection card for admin dashboard |

### Files to Modify
| File | Change |
|------|--------|
| `src/pages/ArtistCRM.tsx` | Skip admin redirect when in preview mode |
| `src/pages/EngineerCRM.tsx` | Skip admin redirect when in preview mode |
| `src/components/crm/CRMPortal.tsx` | Render `AdminRolePreview` banner when preview active |
| `src/components/admin/AdminDashboardHub.tsx` | Add `AdminViewAsRole` card |
| `src/pages/AdminCRM.tsx` | Add "View as Role" quick action |

### User Flow
```text
Admin Dashboard
    |
    |-- clicks "View as Artist"
    |
    v
Artist CRM loads (admin redirect bypassed)
    |-- preview banner visible: "Previewing as Artist -- Exit Preview"
    |-- admin can browse all Artist hubs
    |
    |-- clicks "Exit Preview"
    |
    v
Returns to /admin dashboard
```

