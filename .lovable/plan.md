

# Quick Start Funnel Analytics

## Goal

Instrument the Quick Start page and the immersive onboarding flow with funnel step events so we can compare conversion rates between the two paths. Events are persisted to a new `funnel_events` table and also fired through the existing client-side `analytics` singleton.

## Database: New `funnel_events` Table

```sql
CREATE TABLE public.funnel_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,           -- browser session fingerprint (no auth required)
  funnel_source text NOT NULL,        -- 'quick_start' | 'immersive'
  step text NOT NULL,                 -- 'landed' | 'role_selected' | 'auth_started' | 'auth_completed' | 'action_selected'
  step_data jsonb DEFAULT '{}',       -- role, auth method, action chosen, etc.
  created_at timestamptz DEFAULT now()
);
```

- RLS: INSERT allowed for `anon` and `authenticated` roles (write-only -- visitors must be able to log events before signing up). SELECT restricted to service role (backend queries only).
- No foreign keys to `auth.users` -- events are keyed by an ephemeral `session_id` generated client-side, so pre-auth visitors are tracked.

## Client-Side: Funnel Tracking Hook

Create `src/hooks/useFunnelTracking.ts`:

- Generates a stable `session_id` (stored in `sessionStorage`) on first call.
- Exposes `trackStep(step, stepData?)` which:
  1. Fires `analytics.track('funnel_step', { funnel_source, step, ...stepData })` (client-side queue, GA4-ready).
  2. Inserts a row into `funnel_events` via a fire-and-forget Supabase insert (no `await` blocking the UI).
- Accepts `funnelSource` as a parameter so the same hook works for both flows.

## QuickStart.tsx Integration

Wire `useFunnelTracking('quick_start')` into the existing step transitions:

| User action | Event fired |
|---|---|
| Page mounts | `landed` |
| Role card tapped | `role_selected` with `{ role }` |
| Auth form submitted / OAuth clicked | `auth_started` with `{ method: 'email' \| 'google' \| 'apple' }` |
| `onAuthStateChange` fires SIGNED_IN | `auth_completed` with `{ method, role }` |
| Action card tapped | `action_selected` with `{ action: 'upload' \| 'profile' \| 'browse' }` |

Five events, five lines of code added to existing handlers. No structural changes to the component.

## Immersive Flow Tagging (for comparison)

Add the same `useFunnelTracking('immersive')` calls at equivalent points in the existing immersive onboarding:
- `SceneFlow.tsx` mount fires `landed`.
- Role selection in the hallway/qualifier fires `role_selected`.
- Auth page fires `auth_started` / `auth_completed`.

This gives us an apples-to-apples funnel comparison between the two paths.

## Files

| File | Action |
|---|---|
| Migration SQL | Create `funnel_events` table + anon INSERT policy |
| `src/hooks/useFunnelTracking.ts` | New -- shared funnel tracking hook |
| `src/pages/QuickStart.tsx` | Edit -- add 5 `trackStep()` calls at step transitions |
| `src/components/home/SceneFlow.tsx` | Edit -- add `landed` event on mount |

## Querying Conversion Rates

Once populated, conversion comparison is a single SQL query:

```sql
SELECT
  funnel_source,
  COUNT(*) FILTER (WHERE step = 'landed') AS landed,
  COUNT(*) FILTER (WHERE step = 'auth_completed') AS converted,
  ROUND(
    COUNT(*) FILTER (WHERE step = 'auth_completed')::numeric /
    NULLIF(COUNT(*) FILTER (WHERE step = 'landed'), 0) * 100, 1
  ) AS conversion_pct
FROM funnel_events
GROUP BY funnel_source;
```

No dashboard UI in this pass -- the data is queryable from the backend tools immediately. A visual dashboard can be layered on top in a future pass.

