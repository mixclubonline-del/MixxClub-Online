

# Phase 9: QA & Polish, Monetization Hardening, Mobile Hardening, Performance & Scale

Phase 9 is a **hardening phase** — no new features, only making everything already built production-ready. Organized into 4 parallel tracks across 6 sprints.

---

## Track A: QA & Polish (Sprints 1-2)

### Sprint 1 — Import/Route Audit & Dead Code Cleanup

**Goal**: Every route renders without errors, all new Sprint 1-5 components are properly wired.

- **Audit all Sprint 3-5 components**: Verify `LicenseComparisonModal`, `BeatAnalytics`, `SamplePackBuilder`, `LiveStreamView`, `StreamChat`, `SeasonBracket`, `TrophyCase`, `FanEngagementHub`, `ThreadedChat`, `MessageReactions`, `ChallengesHub`, `AdminAnalyticsDashboard`, `BrandingManager`, `BulkOperations`, `SessionTemplates` are all importable and render without crashes.
- **Fix broken references**: Check that all new hooks (`useSamplePacks`, `useBattleSeasons`, `useChallenges`, `useBrandConfig`, `useBulkActions`) reference correct table/column names from the actual database schema (types.ts).
- **Remove dead imports**: Scan for unused imports and orphaned components across `src/components` and `src/pages`.
- **Verify tab wiring**: Confirm `ProducerCatalogHub` Analytics/Packs tabs, `CommunityHub` Fan/Challenges tabs, `AdminCRM` Analytics/Branding/Bulk tabs all mount correctly.

### Sprint 2 — Mobile QA & RLS Stress Test

- **Mobile layout audit at 375px**: Test all new hubs (FanEngagementHub, ChallengesHub, LiveStreamView, SeasonBracket) for overflow, touch targets, safe area compliance.
- **RLS policy verification**: Run read queries against `sample_packs`, `message_reactions`, `community_challenges`, `challenge_submissions`, `battle_seasons`, `battle_season_entries`, `session_templates` as anonymous, authenticated, and owner to confirm policies work correctly.
- **Error boundary coverage**: Ensure all lazy-loaded routes have Suspense fallbacks and ErrorBoundary wrappers.
- **Empty state audit**: Verify every new hub shows `EmptyState` component (not blank screens) when data is absent.

---

## Track B: Monetization Hardening (Sprints 3-4)

### Sprint 3 — Stripe Checkout & Subscription Enforcement

**Goal**: Real payment flows work end-to-end.

- **Wire Stripe product/price IDs**: Connect `create-subscription-checkout`, `create-payment-checkout`, `create-beat-checkout`, `create-course-checkout` edge functions to actual Stripe product IDs (currently likely placeholder strings). Verify `check-subscription` returns correct tier mapping.
- **Enforce subscription gates**: Audit `useUsageEnforcement` to confirm it blocks actions (project creation, uploads, AI matching, collaborations, storage) when tier limits are reached. Verify `UsageLimitBanner` renders at 70%/90%/100% thresholds.
- **Customer portal flow**: Verify `customer-portal` edge function creates portal sessions and returns valid URLs. Wire "Manage Subscription" button in Settings.
- **Payment success/cancel flows**: Ensure `/payment-success` and `/payment-canceled` routes handle all payment types (subscription, beat purchase, course, mastering, mixing).

### Sprint 4 — Revenue Dashboard Accuracy & Webhook Hardening

- **Stripe webhook coverage**: Audit `stripe-webhook` edge function for handling: `checkout.session.completed`, `invoice.payment_succeeded`, `invoice.payment_failed`, `charge.refunded`, `charge.dispute.created`, `customer.subscription.updated/deleted`. Ensure each event updates the correct tables.
- **Revenue dashboard data integrity**: Verify `AdminAnalyticsDashboard` funnel/revenue charts pull from real `funnel_events`, `payments`, and `audit_logs` data — not mock data.
- **Beat marketplace 70/30 split**: Confirm `create-beat-checkout` applies platform fee and credits producer earnings correctly.
- **Payout pipeline**: Verify `process-engineer-payout`, `request-payout`, `scheduled-payout-processor` edge functions handle the full payout lifecycle.

---

## Track C: Mobile App Hardening (Sprint 5)

### Sprint 5 — Capacitor & PWA Production Readiness

- **Capacitor config audit**: Update `capacitor.config.ts` — the `server.url` currently points to the sandbox preview. For production builds, this should use the built `dist` folder (remove `server.url` or make it conditional).
- **Push notification wiring**: Verify `send-push-notification` edge function integrates with Capacitor's `PushNotifications` plugin. Add device token registration flow on login.
- **PWA service worker audit**: Fix the stale Supabase URL in `vite.config.ts` runtimeCaching (currently `htvmkylgrrlaydhdbonl` — should match the actual project `wmhwiwjxzpnnzckxezcu`). Update `navigateFallbackDenylist` to include `/payment-success`, `/payment-canceled`.
- **Offline sync improvements**: Verify `SyncIndicator` and offline queue in `MobileOptimizations` correctly retry failed mutations when connectivity returns.
- **Camera/filesystem integration**: Audit existing `@capacitor/camera` and `@capacitor/filesystem` usage for profile photo uploads and audio file management.

---

## Track D: Performance & Scale (Sprint 6)

### Sprint 6 — Bundle, Rendering, and Query Optimization

- **React.memo critical components**: Wrap high-frequency re-renders — `BeatCard`, `SessionCard`, `NotificationItem`, `MessageBubble`, `LeaderboardRow`, activity feed items. Currently only `GlassPanel` and `HubHeader` use `React.memo`.
- **Virtualize large lists**: Add `react-window` or intersection-observer virtualization to: beat catalog grid, notification list, activity feed, engineer directory, leaderboard tables.
- **Bundle size audit**: The `three-vendor` chunk (Three.js + R3F + Drei) is massive. Add dynamic import so it only loads on routes that use 3D (`/?scene=*`, city routes). Audit if `@huggingface/transformers` and `peaks.js` can be similarly deferred.
- **Database query optimization**: Add indexes for hot queries — `beat_plays` by `beat_id`, `notifications` by `user_id + is_read`, `activity_feed` by `is_public + created_at`, `funnel_events` by `event_name + created_at`.
- **Image lazy loading**: Add `loading="lazy"` to all avatar, cover art, and promotional images across hubs.
- **React Query tuning**: Audit `staleTime` and `refetchInterval` across all hooks — some Sprint 3-5 hooks may be refetching too aggressively.

---

## Sprint Sequence

| Sprint | Track | Focus |
|--------|-------|-------|
| 1 | A | Import/route audit, dead code cleanup |
| 2 | A | Mobile QA, RLS verification, empty states |
| 3 | B | Stripe checkout wiring, subscription gates |
| 4 | B | Webhook hardening, revenue accuracy |
| 5 | C | Capacitor/PWA production config, push notifications |
| 6 | D | React.memo, virtualization, bundle splitting, DB indexes |

---

## Technical Notes

- No new features — this phase is entirely about production readiness
- Sprint 1 should be done first as it unblocks all other tracks
- Sprints 2-5 can be parallelized after Sprint 1
- Sprint 6 (performance) benefits from having all QA fixes landed first
- New dependency needed: `react-window` for list virtualization in Sprint 6

