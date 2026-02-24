

# Fix: Wire up `/sessions-browser` Route

## Problem

The `SessionsBrowser` page exists and works at `/sessions`, but **all CRM navigation links** (in `WelcomeExperience.tsx` and elsewhere) point to `/sessions-browser` -- a route that does not exist in the router. Result: blank page / 404.

## Solution

Add one line to `src/routes/appRoutes.tsx` -- a second `<Route>` entry that maps `/sessions-browser` to the same `SessionsBrowser` component:

```text
Current:
  /sessions          ->  SessionsBrowser   (works)
  /sessions-browser  ->  (nothing)         (broken)

After fix:
  /sessions          ->  SessionsBrowser   (works)
  /sessions-browser  ->  SessionsBrowser   (works)
```

## Technical Detail

In `src/routes/appRoutes.tsx`, immediately after line 134:

```typescript
<Route path="/sessions" element={<SessionsBrowser />} />
<Route path="/sessions-browser" element={<SessionsBrowser />} />   // <-- add this
```

One line. No other files need to change. All existing CRM navigation links (`WelcomeExperience.tsx` references) will resolve correctly.
