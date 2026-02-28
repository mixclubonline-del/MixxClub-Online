

# Typo Audit + Visual Duplicate Pass

## 1. Brand Name Spelling Violations

The canonical brand name is **Mixxclub** (two X's). There are **~150+ files** using the single-X "MixClub" variant. Here is every category of violation and the fix required:

### A. User-Facing Copy (highest priority -- visitors see these)

| File | Current (wrong) | Fix |
|---|---|---|
| `src/pages/Terms.tsx` | "MixClub" (8 occurrences), "MixClub Support", `legal@mixclubonline.com`, `support@mixclubonline.com` | Replace all with "Mixxclub", update emails to `legal@mixxclubonline.com` / `support@mixxclubonline.com` |
| `src/pages/FAQ.tsx` | "MixClub" (3 occurrences), `support@mixclub.com`, `1-800-MIXCLUB`, `mixclub faq` | Replace all with "Mixxclub", `support@mixxclub.com` -> `support@mixxclubonline.com`, `1-800-MIXXCLUB` |
| `src/pages/QuickStart.tsx` | "What brings you to MixClub?" | "What brings you to Mixxclub?" |
| `src/pages/RoleSelection.tsx` | "Welcome to MixClub", "move through MixClub" | Replace with "Mixxclub" |
| `src/pages/Crowd.tsx` | "The Crowd -- MixClub Online" (title) | "The Crowd -- Mixxclub Online" |
| `src/pages/Services.tsx` | "Services District -- MixClub Online" (title) | "Mixxclub Online" |
| `src/pages/AIMastering.tsx` | "AI Mastering -- MixClub Services" | "Mixxclub Services" |
| `src/pages/MixingShowcase.tsx` | "Mixing Studio -- MixClub Services", "Welcome to MixClub Professional Mixing" | "Mixxclub" |
| `src/pages/MasteringShowcase.tsx` | Check for same pattern | "Mixxclub" |
| `src/pages/AudioUpload.tsx` | "Upload music files to MixClub" | "Mixxclub" |
| `src/pages/Economy.tsx` | "MixxCoinz Economy \| MixClub" (title) | "Mixxclub" |
| `src/components/auth/steps/RoleStep.tsx` | "What brings you to MixClub?" | "Mixxclub" |
| `src/components/Contact.tsx` | `hello@mixclubonline.com` | `hello@mixxclubonline.com` |
| `src/components/GetStartedWizard.tsx` | "get started with Mixxclub" (lowercase c -- correct spelling but verify casing) | Already correct |
| `src/components/WhyMixClub.tsx` | Component name + "Why Choose MIXXCLUB" (display text is correct, but file/component name uses single-X) | Rename component to `WhyMixxclub` (file name + export) |
| `src/components/HowItWorks.tsx` | "How MIXXCLUB Works" (display correct), but internal references | Verify internal copy |
| `src/components/home/RevenuePreview.tsx` | "Before MixClub" / "With MixClub" | "Mixxclub" |
| `src/components/mixclub/MissionSection.tsx` | "MixClub Online transforms..." | "Mixxclub Online" |
| `src/components/mixclub/NetworkHero.tsx` | Check copy | "Mixxclub" |
| `src/components/landing/FloatingPrimeChat.tsx` | "MixClub" (6 occurrences in demo chat responses) | "Mixxclub" |

### B. Alt Text + Metadata (SEO / accessibility)

| File | Fix |
|---|---|
| `src/components/Navigation.tsx` | `alt="MixClub 3D Logo"` -> `alt="Mixxclub Logo"` |
| `src/components/layouts/AppStyleLayout.tsx` | `alt="MixClub"` (2x) -> `alt="Mixxclub"` |
| `src/components/hero/DynamicLogo.tsx` | `alt="MixClub 3D Logo"` -> `alt="Mixxclub Logo"` |
| `src/components/mobile/MobileEnhancedNav.tsx` | `alt="MixClub"` -> `alt="Mixxclub"` |
| `src/components/SplashScreen.tsx` | `alt="MixClub"` -> `alt="Mixxclub"` |
| `src/components/demo/InsiderDemoExperience.tsx` | `alt="MixClub"` (5x) -> `alt="Mixxclub"` |
| `src/components/waitlist/WaitlistCapture.tsx` | `alt="MixClub"` -> `alt="Mixxclub"` |
| `src/components/brand/AnimatedBrandLogo.tsx` | `alt="MixClub Logo"` -> `alt="Mixxclub Logo"` |
| `src/pages/AudioUpload.tsx` | `alt="MixClub"` -> `alt="Mixxclub"` |
| `src/lib/seo-schema.ts` | `email: "support@mixclub.com"` -> `support@mixxclubonline.com` |

### C. Backend / Edge Functions (emails users actually receive)

| File | Violations | Fix |
|---|---|---|
| `supabase/functions/send-welcome-email/index.ts` | "MixClub" (15+ occurrences), `from: 'MixClub'`, all `mixclubonline.com` URLs, subject lines, body copy | Replace every "MixClub" with "Mixxclub" |
| `supabase/functions/send-payment-receipt/index.ts` | `support@mixclubonline.com`, "MixClub" copy | "Mixxclub" |
| `supabase/functions/send-push-notification/index.ts` | `mixclubonline.com` links | Update domain references |
| `supabase/functions/send-attorney-notification-email/index.ts` | "MixClub Admin System", `mixclubonline@gmail.com` | "Mixxclub" |
| `supabase/functions/create-crypto-checkout/index.ts` | `name: 'MixClub - ...'` | "Mixxclub" |

### D. Internal / Code-Level (lower priority but still wrong)

| Item | Fix |
|---|---|
| `src/lib/reportGenerator.ts` | "MixClub Financial Report" -> "Mixxclub Financial Report" |
| `src/hooks/useGlobalAudio.ts` | `STORAGE_KEY = 'mixclub_audio_prefs'` -- cosmetic, but update to `mixxclub_audio_prefs` |
| `src/hooks/usePrimeMarketing.ts` | All prompt strings reference "MixClub" (6+ times) | "Mixxclub" |
| `src/config/socialMediaTemplates.ts` | "MixClub" in social post templates | "Mixxclub" |
| `src/components/payment/MultiPaymentModal.tsx` | "Thank you for using MixClub!" in PDF receipt | "Mixxclub" |
| `src/components/brand/LogoShowcase.tsx` | Download filename `mixclub-` | `mixxclub-` |
| `src/components/mobile/MobileEnhancedNav.tsx` | Image src uses `/lovable-uploads/mixclub-3d-logo.png` (may 404 -- other files use the asset import) | Switch to `import mixclub3DLogo from '@/assets/mixclub-3d-logo.png'` for consistency |

### E. File Names (rename consideration)

The asset file `src/assets/mixclub-3d-logo.png` is imported by **12 files**. Renaming the file to `mixxclub-3d-logo.png` is ideal but requires updating all 12 import paths. This is a single find-and-replace pass.

Similarly, `src/components/WhyMixClub.tsx` should become `WhyMixxclub.tsx`.

**Total brand name fixes: ~150+ string replacements across ~40 files + 6 edge functions.**

---

## 2. Duplicate Image Audit

Several images are used in multiple, contextually different locations. These are candidates for replacement with unique, context-appropriate imagery:

### Images used 2+ times in different contexts

| Image | Used In | Recommendation |
|---|---|---|
| `promo/studio-console-hero.jpg` | `StageDoor.tsx` (immersive entry), `PhaseBackground.tsx` (demo invitation phase) | Replace one with a distinct studio angle or entry-point shot |
| `promo/mixing-collaboration.jpg` | `PhaseBackground.tsx` (connection phase), `CommunityShowcase.tsx` (battles fallback), `MixingShowcase.tsx` | 3 uses -- replace community/battles with a battle-arena or community-specific image |
| `promo/before-after-master.jpg` | `Showcase.tsx` (tech features), `PhaseBackground.tsx` (problem phase) | Replace one with a waveform comparison or problem-statement visual |
| `promo/webrtc-collaboration.jpg` | `Showcase.tsx`, `PhaseBackground.tsx` (tribe phase) | Replace tribe phase with a community/tribe-specific image |
| `promo/mastering-before-after.jpg` | `MasteringShowcase.tsx`, `PhaseBackground.tsx` (transformation phase) | Acceptable overlap (same topic) but a unique "transformation reveal" image would be stronger |
| `promo/enterprise-whitelabel.jpg` | `Enterprise.tsx`, `CommunityShowcase.tsx` (merch fallback) | Replace merch fallback with actual merch/streetwear imagery |
| `promo/collaboration-hero.jpg` | `PhaseBackground.tsx` (discovery phase) | Only 1 use -- fine |
| `mixclub-3d-logo.png` | 12 files | Expected -- it's the logo. No issue. |

### Priority replacements (most impactful)

1. **`mixing-collaboration.jpg` in `CommunityShowcase.tsx`** -- Used as "battles" fallback. Should be a battle/competition image instead.
2. **`enterprise-whitelabel.jpg` in `CommunityShowcase.tsx`** -- Used as "merch" fallback. Should be streetwear/merch imagery.
3. **`studio-console-hero.jpg` in `PhaseBackground.tsx`** -- Used as "invitation" phase. Should be a welcoming/entry image, not a console close-up.

---

## 3. Implementation Plan

### Phase 1: Brand name sweep (bulk find-replace)

Touch ~45 files total:
- Replace all `MixClub` (case-sensitive) with `Mixxclub` in user-facing copy, alt text, SEO metadata, email templates, PDF generators, social templates, AI prompts
- Preserve `MIXXCLUB` (all-caps) where it appears as a display/logo treatment -- this is intentional and correct
- Preserve `Mixxclub` where already correct
- Update emails: standardize on `@mixxclubonline.com` domain
- Update phone: `1-800-MIXXCLUB`

### Phase 2: File renames

- `src/assets/mixclub-3d-logo.png` -> `src/assets/mixxclub-3d-logo.png` (update 12 imports)
- `src/assets/mixclub-robot-logo.png` -> `src/assets/mixxclub-robot-logo.png` (check usage)
- `src/components/WhyMixClub.tsx` -> `src/components/WhyMixxclub.tsx` (update import in `MobileLanding.tsx`)
- Fix `MobileEnhancedNav.tsx` to use asset import instead of hardcoded `/lovable-uploads/` path

### Phase 3: Image deduplication

Replace 3 duplicate-context images with distinct assets via the dynamic asset system (brand_assets table) or new static imports:

| Slot | Current duplicate | Replacement context |
|---|---|---|
| Community battles | `mixing-collaboration.jpg` | Battle arena / competition visual |
| Community merch | `enterprise-whitelabel.jpg` | Streetwear / merch display |
| Demo invitation phase | `studio-console-hero.jpg` | Welcoming entry / open door visual |

These can be generated via the existing AI image pipeline or sourced as new static assets.

### Phase 4: Edge function redeploy

After updating the 5 edge functions with corrected brand names, redeploy:
- `send-welcome-email`
- `send-payment-receipt`
- `send-push-notification`
- `send-attorney-notification-email`
- `create-crypto-checkout`

---

## Summary

| Category | Count | Severity |
|---|---|---|
| "MixClub" -> "Mixxclub" string fixes | ~150+ strings | High -- brand consistency |
| Alt text corrections | ~15 instances | Medium -- accessibility/SEO |
| Email/URL domain fixes | ~20 instances | High -- user-facing emails |
| File renames | 3 files | Low -- internal only |
| Duplicate images to replace | 3 images | Medium -- visual polish |
| Edge functions to redeploy | 5 functions | High -- live email content |

