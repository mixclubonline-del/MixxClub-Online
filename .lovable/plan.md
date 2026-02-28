

# Brand Sweep Phase 3: Remaining 78 Source Files + 13 Edge Functions

## Scope

Previous passes fixed ~45 files. This pass covers the remaining **78 source files** and **13 edge function files** still containing "MixClub" (single-X) violations, plus lowercase `mixclub` in URLs, storage keys, and social links.

## Category A: Pages (~20 files)

| File | Violations | Fix |
|---|---|---|
| `src/pages/Contact.tsx` | SEO title/description "MixClub Support" | "Mixxclub" |
| `src/pages/Install.tsx` | "Install MixClub App" (5x) | "Mixxclub" |
| `src/pages/Waitlist.tsx` | Share text, SEO, body copy (6x) | "Mixxclub" |
| `src/pages/PublicProfile.tsx` | Helmet title/meta "MixClub" (3x) | "Mixxclub" |
| `src/pages/Community.tsx` | Title "MixClub City" | "Mixxclub City" |
| `src/pages/Premieres.tsx` | Title "MixClub Online" | "Mixxclub Online" |
| `src/pages/LivePage.tsx` | "MixClub Live" | "Mixxclub Live" |
| `src/pages/Achievements.tsx` | SEO title/desc (2x) | "Mixxclub" |
| `src/pages/Press.tsx` | SEO, body copy, `press@mixclub.com` | "Mixxclub", `press@mixxclubonline.com` |
| `src/pages/Privacy.tsx` | "MixClub Privacy Team", `privacy@mixclubonline.com` already correct but "MixClub" label needs fix | "Mixxclub" |
| `src/pages/PrimeBeatForge.tsx` | "MixClub's capabilities" | "Mixxclub" |
| `src/pages/ForEngineers.tsx` | "earning more on MixClub" | "Mixxclub" |
| `src/pages/MixClubHome.tsx` | Function name `MixClubHome` -- keep filename for route stability but fix JSDoc/comments | Update comments only |

## Category B: Components (~35 files)

| File | Violations | Fix |
|---|---|---|
| `src/components/home/SocialProofSection.tsx` | Testimonial quotes "MixClub" (4x) | "Mixxclub" |
| `src/components/home/LiveActivityFeed.tsx` | "Alex joined MixClub" | "Mixxclub" |
| `src/components/home/ValueProposition.tsx` | "MixClub:" pricing label | "Mixxclub:" |
| `src/components/home/HomeFooter.tsx` | Copyright "MixClub", social URLs (`mixclubhq`), `hello@mixclub.io`, `discord.gg/mixclub` | "Mixxclub", update URLs to `mixxclubhq`, `hello@mixxclubonline.com`, `discord.gg/mixxclub` |
| `src/components/home/CityPreview.tsx` | "Welcome to MixClub City" | "Mixxclub City" |
| `src/components/marketing/SocialShareButtons.tsx` | Title default, toast messages (5x) | "Mixxclub" |
| `src/components/marketing/PromotionalHero.tsx` | "MixClub: $50-150" | "Mixxclub" |
| `src/components/marketing/EmailCampaignManager.tsx` | "Welcome to MixClub!" | "Mixxclub" |
| `src/components/viral/ShareComponents.tsx` | Share text "on MixClub!" | "Mixxclub" |
| `src/components/community/PremiereStage.tsx` | "mastered on MixClub" | "Mixxclub" |
| `src/components/city/CityLayout.tsx` | "MixClub City Map" | "Mixxclub City Map" |
| `src/components/immersive/CityMapOverlay.tsx` | Comment + aria-label "MixClub City" | "Mixxclub City" |
| `src/components/partner/PartnerOnboarding.tsx` | "MixClub Partner Program" | "Mixxclub" |
| `src/components/crm/community/CommunityHub.tsx` | "MixClub community" | "Mixxclub" |
| `src/components/profile/HireModal.tsx` | "Sent via MixClub Hire" | "Mixxclub Hire" |
| `src/components/courses/CertificateDisplay.tsx` | PDF branding "MixClub Online" | "Mixxclub Online" |
| `src/components/demo/PrimeCharacter.tsx` | Alt text "Prime - MixClub Head Engineer" | "Mixxclub" |
| `src/components/WhyMixxclub.tsx` | Export name still `WhyMixClub` | Rename export to `WhyMixxclub` |
| `src/components/scene/StudioHallway.tsx` | JSDoc comment | "Mixxclub" |
| `src/components/distribution/RevenueSharing.tsx` | Referral copy + URL `mixclub.com` | "Mixxclub", `mixxclub.com` |
| `src/components/storefront/StorefrontSetup.tsx` | Check copy | "Mixxclub" |
| Other components with 1-2 violations each | ~15 more files based on search | "Mixxclub" |

## Category C: Libraries/Hooks/Utils (~10 files)

| File | Violations | Fix |
|---|---|---|
| `src/lib/journey-events.ts` | "on MixClub" (4x) | "Mixxclub" |
| `src/audio/effects/VelvetCurveProcessor.ts` | JSDoc "MixClub's" | "Mixxclub's" |
| `src/utils/stateManager.ts` | `STATE_PREFIX = 'mixclub_state_'` | `'mixxclub_state_'` |
| `src/services/PartnerService.ts` | `mixclub.com?ref=` URL | `mixxclub.com?ref=` |
| `src/routes/publicRoutes.tsx` | Comment "MixClub platform", variable `MixClubHome` | Fix comment; keep variable name (import path unchanged) |
| `src/routes/cityRoutes.tsx` | Comment "MixClub City" | "Mixxclub City" |

## Category D: Edge Functions (~8 remaining files)

| File | Violations | Fix |
|---|---|---|
| `supabase/functions/n8n-webhook-handler/index.ts` | `from: 'MixClub <noreply@mixclub.com>'` (4x), "Update from MixClub", comment | "Mixxclub", `noreply@mixxclubonline.com` |
| `supabase/functions/generate-invoice/index.ts` | `name: 'MixClub'`, `billing@mixclub.com` | "Mixxclub", `billing@mixxclubonline.com` |
| `supabase/functions/copilot-chat/index.ts` | System prompt "MixClub" | "Mixxclub" |
| `supabase/functions/prime-chat/index.ts` | System prompt "MixClub" (10+ occurrences) | "Mixxclub" |
| `supabase/functions/admin-chat-enhanced/index.ts` | System prompt "MixClub" (20+ occurrences), "MixClubOnline" | "Mixxclub", "Mixxclub Online" |
| `supabase/functions/prepare-session-package/index.ts` | "upload via Mixclub" | "Mixxclub" |
| `supabase/functions/send-attorney-notification-email/index.ts` | `from: "MixClub Legal"`, `mixclubonline@gmail.com` | "Mixxclub Legal" |
| `supabase/functions/dream-engine/index.ts` | Prompt keyword "MixClub narrative visual" | "Mixxclub" |

## Implementation Approach

### Batch 1: All remaining source files (src/)

Sweep all 78 files doing `MixClub` -> `Mixxclub` replacements. For URLs, emails, and social handles, apply domain-consistent updates:
- `@mixclub.com` / `@mixclub.io` -> `@mixxclubonline.com`
- `mixclubhq` social handles -> `mixxclubhq`
- `discord.gg/mixclub` -> `discord.gg/mixxclub`
- `mixclub.com` referral URLs -> `mixxclub.com`
- `mixclub_state_` storage prefix -> `mixxclub_state_`

### Batch 2: All remaining edge functions

Fix all 8 edge function files, then redeploy:
- `n8n-webhook-handler`
- `generate-invoice`
- `copilot-chat`
- `prime-chat`
- `admin-chat-enhanced`
- `prepare-session-package`
- `send-attorney-notification-email`
- `dream-engine`

### Batch 3: WhyMixxclub export rename

Update the component export in `WhyMixxclub.tsx` from `WhyMixClub` to `WhyMixxclub` and fix the import in `MobileLanding.tsx`.

### Verification

After all edits, run a final `MixClub` search across the entire project to confirm zero remaining violations (excluding migration SQL files which are immutable history).

## Files Changed

~78 source files + ~8 edge functions = **~86 files total** in this pass.

No structural changes, no new dependencies, no schema changes. Pure string replacements.

