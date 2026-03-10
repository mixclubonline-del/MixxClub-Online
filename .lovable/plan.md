

# Build Out Stub Pages: Engineer Profile, My Certifications, Battle Tournaments

## Summary

Three pages need to go from stubs/placeholders to functional UIs pulling real data from existing database tables.

## 1. Engineer Profile (`/engineer/:userId`)

**Current state**: "Coming Soon" placeholder card.
**Target**: Full profile page fetching real data from `profiles` + `engineer_profiles` + `engineer_reviews`.

**Implementation**:
- Rewrite `src/pages/EngineerProfile.tsx` to:
  - Query `profiles` by `id` (the `:userId` param) for name, avatar, bio, location, social links
  - Query `engineer_profiles` by `user_id` for specialties, genres, hourly rate, years experience, equipment list, rating, completed projects, availability status
  - Query `engineer_reviews` by `engineer_id` with joined `profiles` (client name) for the reviews list
  - Query `projects` by `engineer_id` with `status = 'completed'` for portfolio (recent completed projects)
- Layout sections:
  - **Hero**: Cover image, avatar, name, tagline, location, availability badge, verified badge
  - **Stats row**: Rating, completed projects, years experience, hourly rate
  - **Specialties & Genres**: Badge chips from `engineer_profiles`
  - **Equipment**: List from `equipment_list` array
  - **Portfolio**: Grid of completed projects (title, status, date)
  - **Reviews**: Star rating + review text cards with client avatar
  - **CTA**: "Book a Session" button linking to `/checkout` or `/services`
- Fallback: If no `engineer_profiles` row exists, show a minimal profile from `profiles` data only with a "Profile not yet set up" message

## 2. My Certifications (`/my-certifications`)

**Current state**: Already functional with hardcoded `CERTIFICATIONS` array, enrollment via `course_enrollments`, and community unlock overlay. This page is **already built**.

**Enhancement**: Wire the "Download" button to use `CertificateDisplay`'s PDF generation logic:
- In `handleDownloadCert`, query `certificates` table for the user's certificate for that course
- If found, generate the PDF using the same jsPDF logic from `CertificateDisplay`
- Minor fix: currently the download just shows a toast — make it actually produce a PDF

## 3. Battle Tournaments (`/battle-tournaments`)

**Current state**: Routes to generic `<ComingSoon />` page. The `TournamentBracket` component exists but is only used inside the Arena Hub.

**Implementation**:
- Create new `src/pages/BattleTournaments.tsx` page:
  - Query `battle_tournaments` for all tournaments (upcoming, active, completed) with tabs
  - **Upcoming tab**: Cards showing tournament name, start date, entry fee, prize pool, participant count, "Join" button
  - **Active tab**: Live tournaments with participant counts and status
  - **Completed tab**: Past tournaments with winners
  - Each tournament card mirrors the existing `TournamentBracket` component's card design
  - "Join Tournament" button calls `supabase.from('battle_tournaments').update()` to increment `current_participants` (basic — no payment flow yet)
- Update `src/routes/appRoutes.tsx`: Replace `<ComingSoon />` with the new `<BattleTournaments />` component (lazy loaded)

## Files Modified
- `src/pages/EngineerProfile.tsx` — full rewrite with real data
- `src/pages/MyCertifications.tsx` — wire PDF download from certificates table  
- `src/pages/BattleTournaments.tsx` — new page
- `src/routes/appRoutes.tsx` — update battle-tournaments route

