

# Remaining To-Dos & Incomplete Phases — Summary

Here's a consolidated view of everything that's still open across the project.

---

## 1. Pending Plan: Character Avatars in EcosystemFlow

**Source:** `.lovable/plan.md`

The approved-but-unimplemented plan to replace Lucide icons with character portraits (Rell, Jax, Prime, Nova) in the `EcosystemFlow.tsx` component and fix the SVG animation alignment by moving nodes into `<foreignObject>`.

**Status:** Ready to build.

---

## 2. CRM Workflow Phases (4-phase roadmap)

**Source:** `.agents/workflows/crm-phase*.md`

| Phase | Focus | Status |
|-------|-------|--------|
| **Phase 1** — Design Tokens | GlassPanel, HubHeader, StaggeredList components + migrate 3 hubs | Not started |
| **Phase 2** — Critical Features | NotificationsHub wiring, ScheduleHub (calendar), mobile responsiveness for 6+ hubs | Not started |
| **Phase 3** — UX Polish | HubSkeleton, EmptyState components, file version timeline, standardize loading/empty states across ~14 hubs | Not started |
| **Phase 4** — Advanced | Shared query hooks, Producer License Builder + Promo Codes + Featured Rotation, React.lazy() for all CRM pages | Not started |

---

## 3. Stub Pages (Phase 3 from Page Registry)

**Source:** `docs/PAGE_REGISTRY.md`

These routes exist but are placeholders:

- `/engineer/:userId` — Full engineer profiles with portfolios
- `/my-certifications` — Certification system
- `/integrations` — Third-party integrations
- `/battle-tournaments` — Tournament brackets

---

## 4. Feature-Flagged Pages (community-gated)

These are built but locked behind growth milestones:

- `/marketplace` — unlocks at 500 community members
- `/label-services` — unlocks at 100 completed projects
- `/ai-audio-intelligence` — unlocks at 1000 community members

---

## 5. Marketplace Backend Gaps

**Source:** `MARKETPLACE_BUILD_COMPLETE.md`

UI is built, but backend is incomplete:
- Backend API endpoints
- Stripe integration for purchases
- Database schema for products
- Product upload form
- Payment processing
- Analytics tracking

---

## 6. Revenue Backend (from Launch docs)

**Source:** `LAUNCH_120_COMPLETE.md`, `README_120_COMPLETE.md`

Three backend work items estimated at ~4 weeks total:
- **Stripe API + Database + Webhooks** (subscriptions) — ~2 weeks
- **Referral code verification + reward processing** — ~1 week
- **Usage enforcement middleware** (freemium limits) — ~1 week

---

## 7. Release Plan Phases

**Source:** `docs/release-plan.md`

| Phase | Milestone | Key Gaps |
|-------|-----------|----------|
| Phase 1 | 1.1 Subscriptions | Stripe end-to-end payment flow |
| Phase 1 | 1.2 CRM Workflows | Functional but needs CRM phase work above |
| Phase 1 | 1.3 Mixing/Mastering | Service → session → payment chain |
| Phase 2 | 2.1 AI Matching | Engineer discovery + session creation |
| Phase 2 | 2.2 Community | Feed/arena/leaderboard (mostly built) |
| Phase 2 | 2.3 Gamification | Referral loops, notification triggers |
| Phase 3 | 3.1 Courses | Tutorials + certifications (stub) |
| Phase 3 | 3.2 Partner/Marketplace | Marketplace backend (incomplete) |
| Phase 3 | 3.3 Enterprise | Landing + demo flow (mostly built) |

---

## Recommended Next Moves

Based on the "Prove the Loop" strategy from the project audit, the highest-impact work in priority order:

1. **CRM Phase 1 — Design Tokens** (visual consistency, unblocks phases 2-4)
2. **EcosystemFlow character avatars** (quick win, already planned)
3. **Stripe payment chain** (revenue-critical)
4. **CRM Phase 2 — Notifications + Calendar + Mobile** (fulfills landing page promises)

Which of these would you like to tackle?

