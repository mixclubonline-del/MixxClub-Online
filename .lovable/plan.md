
Goal
- Fix the /auth page so it does not “refresh” (full page reload/navigation) on any click/keystroke, and so Email/Password + Google/Apple sign-in both work reliably.

What we know (from evidence)
- You report: typing, clicking, and even paste actions cause the page to refresh, in both the Lovable preview and a separate browser tab. That makes login and OAuth effectively unusable.
- In my controlled browser run, I can type into the Email field and click the Google button without a reload; therefore this is likely:
  1) environment- or cache/service-worker-specific, or
  2) caused by a global event handler that only triggers under certain conditions (browser, extensions, mobile/PWA mode, “pull-to-refresh”, etc.), or
  3) caused by a CSP (Content Security Policy) block that breaks a script needed for stable client runtime on your device.
- The project has a CSP meta tag in index.html (script-src does not include Lovable Cloud domains; no explicit script-src-elem). You previously saw CSP script blocking messages, which can break interactive flows like OAuth.
- The project uses vite-plugin-pwa with autoUpdate, so service worker/caching must be treated as a prime suspect for “refresh loop” behavior (a stale SW can keep serving old assets or trigger reload cycles).

Primary hypotheses (ranked)
H1 — Stale Service Worker / PWA cache loop
- A previously registered service worker (from earlier builds) can:
  - serve stale JS/CSS that doesn’t match the current HTML, causing hard reloads and broken events,
  - repeatedly “update” and reload clients,
  - create behavior that differs between devices and between preview/published URLs.
- This is consistent with: “works for me in a fresh agent session, broken for you in your browser.”

H2 — CSP blocking a required script (especially for OAuth / managed auth)
- Your CSP only allows script-src from:
  - self, unsafe-inline, unsafe-eval, js.stripe.com, paypal.com, cdn.gpteng.co, *.supabase.co
- If Lovable Cloud managed auth needs to load a script from a different Lovable domain, it will be blocked.
- CSP can also block module script elements more strictly in some browsers unless script-src-elem is set.

H3 — A global key/touch handler is triggering navigation/reload on any interaction
- The codebase has many global keydown listeners. Most ignore inputs, but we must confirm all do.
- Some mobile optimizations/pull-to-refresh patterns can accidentally create reloads when focus/scroll changes.

H4 — Unintended form submission / default browser navigation
- Less likely because buttons are mostly type="button" or outside forms, but we’ll still harden the auth page to eliminate any possibility that a click submits a form and causes a reload.

Plan (implementation sequence)

Phase 0 — Quick stabilization / user-side unblock (no code risk)
1) Clear service worker + storage for the site in your browser:
   - Chrome/Edge: DevTools → Application → Service Workers → “Unregister”
   - DevTools → Application → Storage → “Clear site data”
   - Then hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
2) Repeat on both:
   - preview URL (…lovable.app) and
   - the embedded/preview host (…lovableproject.com)
Why this first: if H1 is correct, this instantly fixes the “refresh on click/typing” symptom without any code change.

Phase 1 — Reproduce + pinpoint the exact reload trigger (minimal instrumentation)
We’ll add targeted, non-sensitive logging (DEV-only) to detect:
- whether we are getting actual full reloads (beforeunload/unload fired),
- whether a form submit is happening unexpectedly,
- whether navigation is being triggered by a global handler.
Concrete steps:
1) Add DEV-only listeners in main.tsx (or a small debug utility imported there):
   - window.addEventListener('beforeunload', …)
   - document.addEventListener('submit', …, true)
   - document.addEventListener('click', …, true) only logging when target is inside /auth and only when a reload happens soon after
2) Add a lightweight “AuthDebugBanner” in Auth.tsx (DEV-only) that shows:
   - current URL,
   - whether we detect SW controller presence (navigator.serviceWorker.controller),
   - whether PWA standalone mode is active.
Acceptance for this phase:
- We can definitively say: “it’s a form submit” vs “it’s an unload” vs “it’s a SW update reload” vs “it’s a navigation event.”

Phase 2 — Harden the Auth page against any default browser reloads (safe, reversible)
Regardless of root cause, we’ll harden /auth so it cannot accidentally reload due to event propagation quirks:
1) Stop key events from bubbling out of inputs on /auth
   - Add onKeyDownCapture={(e) => e.stopPropagation()} to the Email/Password inputs on Auth page.
   - This prevents any global keydown handlers (including ones we may have missed) from seeing those keystrokes.
2) Stop any accidental submit-triggered navigation
   - Ensure every non-submit button inside forms has type="button" (double-check any missed ones).
   - Add explicit e.preventDefault() for the social OAuth buttons too (even though they’re type="button") as belt-and-suspenders.
3) Ensure the “demo banner” and other clickable wrappers are not inside any <form> (currently they are not, but we will verify layout/DOM to avoid nested forms).
Acceptance:
- Typing in fields never triggers a navigation/reload.
- Clicking any button changes only React state (loading/errors) and never refreshes the document.

Phase 3 — Fix CSP so managed OAuth scripts and flows are not blocked (security-conscious)
1) Update index.html CSP meta to:
   - Add explicit script-src-elem matching script-src.
   - Allow the minimal set of additional script/connect domains needed for managed auth to work (we will base this on the exact blocked URL(s) you see in console).
2) Keep the CSP tight:
   - We won’t “open everything”; we’ll add only the domains we can justify from observed blocks.
3) Validate:
   - Google/Apple click initiates redirect reliably.
   - No more CSP blocked script messages in console for required auth assets.
Note:
- This phase requires you to provide (or we to capture) the exact blocked script URL(s) since your logs redacted them as <URL>.

Phase 4 — Service worker strategy: prevent “auto-update reload loops”
If Phase 0 or Phase 1 confirms SW involvement:
1) Change PWA registration behavior to reduce surprise reloads:
   - Prefer prompting or delayed update application rather than immediate auto-update reload.
2) In development/preview mode, consider disabling SW registration entirely to avoid dev-preview instability.
3) Add an in-app “Reset App Cache” action (DEV-only or behind a debug route) that:
   - unregisters SW,
   - clears caches,
   - reloads once.
Acceptance:
- No more “refresh on click/typing” after deployments.
- Updates do not interrupt active sessions (Flow-safe).

Clarifications needed (to avoid guessing)
- The exact blocked script URLs from the CSP error (the full domain is enough; you can redact the path).
- Which environment shows the issue:
  - Preview URL (…lovable.app), Published URL (mixxclub.lovable.app), or both?
- Browser + OS (Chrome/Safari/iOS/Android), and whether you’ve “installed” the app as a PWA.

Definition of done (acceptance criteria)
- On /auth:
  - You can click into Email and type normally without any page refresh.
  - Copy/paste works.
  - Clicking “Enter” signs in without reloading the document.
  - Clicking “Continue with Google/Apple” initiates the OAuth flow (redirect or popup as designed) without being blocked by CSP.
- No recurring console errors related to CSP blocks for required auth scripts.
- No SW-induced reload loop; updates are predictable and non-disruptive.

Pressure pass (120% reliability)
- Test on:
  - Desktop Chrome,
  - Mobile Safari (iOS),
  - Mobile Chrome (Android),
  - PWA-installed mode (if applicable).
- Confirm no global keyboard shortcuts interfere with typing on auth.
- Confirm auth still works with slow networks and with email confirmation enabled.

If you want me to continue implementing this fix in a new request, reply with:
1) the exact blocked script URL domains (from your CSP errors), and
2) whether the issue happens on preview, published, or both.
