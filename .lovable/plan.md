

## Plan: Unlock All Role Preview Options + Full Account Access

### Problem
The admin Quick Actions bar only has "View as Artist" — missing Engineer, Producer, and Fan. Additionally, the user wants the full account view unlocked when previewing as any role.

### Changes

**1. `src/pages/AdminCRM.tsx`** — Add all 4 role preview quick actions

Replace the single "View as Artist" entry (lines 145-152) with four entries:
- View as Artist → `/artist-crm`
- View as Engineer → `/engineer-crm`
- View as Producer → `/producer-crm`
- View as Fan → `/fan-hub`

Each calls `enterPreview(role)` then navigates to the corresponding route. Add missing icon imports (Mic2, Headphones, Piano, Heart).

**2. Ensure full access in preview mode**

The CRM pages (`ArtistCRM.tsx`, `EngineerCRM.tsx`, `ProducerCRM.tsx`, `FanHub.tsx`) already bypass admin redirects when `isPreviewMode` is true — this is working correctly. No changes needed there.

The `AdminViewAsRole` component already supports all 4 roles, so the Dashboard tab's "View as Role" card will continue working as-is.

### Scope
- 1 file modified: `src/pages/AdminCRM.tsx`

