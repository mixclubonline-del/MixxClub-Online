

## Next Phases -- Final Arrangement Mastering Pass

Based on a thorough audit of the current codebase, here's where we stand and the remaining phases to ship a cohesive, professional product.

---

### What's Already Shipped

- Visual Doctrine pass on CRM hub pages (Portal, HubModule, HubGrid, StatusBar, ActivePanel -- all roles)
- Visual Doctrine pass on Fan Hub inner modules (Streak, Tier, Missions, Wallet, Leaderboard, Referrals)
- Cinematic entry funnel (Hallway, Demo, Club scenes)
- 4-role CRM parity (Artist, Engineer, Producer, Fan) with role-specific hub grids, AI guides, and backgrounds
- Unlockable celebration system (pulse indicator, confetti, attribution toasts)
- Immersive App Shell with energy-aware ambient visuals
- GOOGLE_AI_API_KEY updated with higher-quota key

---

### Phase 1: Visual Doctrine Pass -- Remaining Surfaces

**Target**: The Club Scene "rooms" (the pre-auth information experience) have not received the Visual Doctrine upgrade. These are the first thing prospective users see after the demo.

1. **ListeningRoom.tsx** -- Upgrade track cards to glassmorphic containers with hover-reactive glow, add `whileInView` stagger animations, enlarge the hero image section
2. **VaultRoom.tsx** -- Apply glassmorphism to unlock tier cards, add ambient glow per tier status (locked/current/unlocked), improve the progress visualization
3. **GreenRoom.tsx** -- Glassmorphic treatment, showcase-first imagery layout
4. **ControlRoom.tsx** -- Same treatment, role-aware color accents
5. **VIPBooth.tsx** -- Premium glass treatment with gold/amber accents befitting the VIP tier
6. **StageDoor.tsx** -- Cinematic full-bleed CTA upgrade, glassmorphic overlay on the final join button, ensure video background integration looks polished

**Estimated effort**: Medium (6 component files, pattern already established from CRM pass)

---

### Phase 2: Visual Doctrine Pass -- Dashboard Hub

**Target**: `EnhancedDashboardHub.tsx` (450 lines) is still using plain `Card` components with basic gradients. This is the primary workspace users see daily.

1. Convert all stat cards, revenue stream cards, and AI insight cards to glassmorphic containers with role-specific accent colors
2. Add `whileInView` scroll animations for the metrics grid
3. Upgrade PrimeBot Insights section with ambient glow and glassmorphic treatment
4. Add showcase imagery section at the top (career momentum hero visual)
5. Apply the same `ROLE_ACCENTS` pattern from `CRMHubModule.tsx`

**Estimated effort**: Medium (1 large file, well-defined pattern)

---

### Phase 3: Entry Funnel Hardening

**Target**: Ensure the full user journey from landing to CRM is seamless with no dead-ends.

1. **Role Selection page** (`RoleSelection.tsx`) -- Apply glassmorphic card treatment, add cinematic background (currently basic gradient), add role-specific ambient glow on hover
2. **Auth page** (`AuthWizard`) -- Verify visual consistency with the rest of the funnel; ensure the magic link flow has proper loading states and error handling
3. **Post-auth routing** -- Verify that after role selection and onboarding, users land in their correct CRM view with no redirect loops
4. **Logged-in redirect** -- Confirm authenticated users bypass Hallway/Demo and land directly in City or CRM

**Estimated effort**: Medium

---

### Phase 4: Producer and Fan Hub Inner Module Parity

**Target**: The Producer CRM inner modules (Catalog, Sales, Collabs, Revenue) and some Fan modules still use basic layouts. The Fan Hub visual pass covered wallet/missions, but the **FanFeedHub** is still a placeholder.

1. **ProducerCatalogHub** -- Glassmorphic beat cards with audio preview waveforms
2. **ProducerSalesHub** -- Already has SalesOverview/SalesTable; upgrade to glassmorphic table treatment
3. **ProducerCollabsHub** -- Glassmorphic collab cards with status indicators
4. **ProducerRevenueHub** -- Visual parity with the Artist/Engineer RevenueAnalyticsDashboard
5. **FanFeedHub** -- Replace the placeholder "TODO" with a real discovery feed skeleton (even if data-empty, the UI should feel alive with Nova character integration and shimmer placeholders)
6. **FanCuratorHub** -- Ensure curator mode UI has proper glassmorphic treatment

**Estimated effort**: Medium-High (multiple files, some need content creation beyond styling)

---

### Phase 5: End-to-End Flow Testing and Polish

**Target**: Pressure pass across the entire user journey.

1. Test the full funnel: Landing (/) -> Demo -> Club -> Auth -> Role Selection -> Onboarding -> CRM
2. Verify mobile responsiveness across all upgraded components (glassmorphic cards, backgrounds, ambient effects)
3. Check for console errors (currently seeing an Audio error on the home page)
4. Verify Dream Engine video generation works with new API key
5. Performance audit: ensure all the `framer-motion` animations and backdrop-blur effects don't cause jank on mid-tier devices
6. Verify navigation via `useFlowNavigation` is consistent and no stale `navigate()` calls remain

**Estimated effort**: Medium (testing and iteration, targeted fixes)

---

### Recommended Execution Order

```text
Phase 1 (Club Rooms Visual Pass)
  |
Phase 2 (Dashboard Hub Visual Pass)
  |
Phase 3 (Entry Funnel Hardening)
  |
Phase 4 (Producer/Fan Inner Modules)
  |
Phase 5 (E2E Testing + Polish)
```

Each phase is independent enough to ship incrementally, but Phase 5 should always follow any batch of visual changes to catch regressions.

---

### Which phase would you like to start with?

