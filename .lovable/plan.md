

# Restore Marketing Pages as Door Destinations

## Rationale
The hallway doors should introduce visitors to the platform before asking for credentials. The `/for-artists` and `/for-engineers` pages already exist as rich marketing pages with CTAs that lead to auth. Sending unauthenticated users there first creates a warmer, more informative funnel.

## Change

**File: `src/components/scene/StudioHallwayV2.tsx`** — Update `handleDoorClick`:
- **Authenticated users**: Keep current behavior → `/home?path=artist|engineer`
- **Unauthenticated users**: Navigate to `/for-artists` (left door) or `/for-engineers` (right door) instead of `/auth?mode=signup&role=...`

This is a 2-line change in the `setTimeout` callback (line ~126):
```
navigate(`/for-${role}s`);
```

No other files need to change. The auth wizard's role pre-selection from URL params still works for any CTAs on the marketing pages that link to `/auth?role=artist`.

