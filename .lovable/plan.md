

# Audit: Broken Navigation Links in CRM Components

## Findings

Cross-referenced every `navigate()` call in CRM components against the router. Found **4 broken routes** -- clicks that lead to a 404 or blank page.

---

## 1. `/sessions/create` -- Does Not Exist

**Where it's used:** `WelcomeExperience.tsx` (lines 45, 177)
- "Start Your First Session" button (artist welcome card)
- EmptyStatePrompt sessions action

**Correct route:** `/create-session`

**Fix:** In `src/components/crm/WelcomeExperience.tsx`, replace both instances of `navigate('/sessions/create')` with `navigate('/create-session')`.

---

## 2. `/job-board` -- Does Not Exist

**Where it's used:**
- `SavedJobsList.tsx` (lines 77, 105) -- "Browse Jobs" button and job detail link
- `RecommendedArtists.tsx` (lines 176, 264, 276) -- "Browse All Opportunities" and "View & Apply" buttons

**Correct route:** `/jobs`

**Fix:** In both files, replace all instances of `navigate('/job-board')` with `navigate('/jobs')`.
Also fix the query param variant: `navigate('/job-board?job=...')` becomes `navigate('/jobs?job=...')`.

---

## 3. `/profile/:id` -- Does Not Exist

**Where it's used:**
- `SavedMatches.tsx` (line 31) -- "View Profile" on saved matches
- `FanDay1sHub.tsx` (line 188) -- clicking an artist card
- `FanFeedHub.tsx` (lines 123, 133) -- "Day 1" and follow buttons
- `FanCommunitiesHub.tsx` (line 387) -- "View" button on community artist

**Correct route:** `/u/:username` (public profile route)

**Challenge:** These components pass a user UUID, but the public profile route uses a username slug. The safest fix is to route to `/u/${userId}` and have the PublicProfile page handle UUID-based lookups (it likely already does, or needs a small tweak).

**Fix:** In all 4 files, replace `navigate('/profile/${id}')` with `navigate('/u/${id}')`.

---

## 4. `/engineer-directory` -- Does Not Exist

**Where it's used:** `QuickActionLauncher.tsx` (line 55) -- "Find Engineer" quick action

**Correct route:** `/engineers`

**Fix:** In `src/components/crm/dashboard/QuickActionLauncher.tsx`, change `link: '/engineer-directory'` to `link: '/engineers'`.

---

## Summary Table

| Broken Route | Used In | Correct Route | Instances |
|---|---|---|---|
| `/sessions/create` | WelcomeExperience.tsx | `/create-session` | 2 |
| `/job-board` | SavedJobsList.tsx, RecommendedArtists.tsx | `/jobs` | 5 |
| `/profile/:id` | SavedMatches, FanDay1sHub, FanFeedHub, FanCommunitiesHub | `/u/:id` | 5 |
| `/engineer-directory` | QuickActionLauncher.tsx | `/engineers` | 1 |

**Total: 13 broken navigation calls across 6 files.**

## Files to Edit

1. `src/components/crm/WelcomeExperience.tsx` -- 2 fixes
2. `src/components/crm/SavedJobsList.tsx` -- 2 fixes
3. `src/components/crm/RecommendedArtists.tsx` -- 3 fixes
4. `src/components/crm/matches/SavedMatches.tsx` -- 1 fix
5. `src/components/crm/fan/FanDay1sHub.tsx` -- 1 fix
6. `src/components/crm/fan/FanFeedHub.tsx` -- 2 fixes
7. `src/components/crm/fan/FanCommunitiesHub.tsx` -- 1 fix
8. `src/components/crm/dashboard/QuickActionLauncher.tsx` -- 1 fix

All changes are string replacements in `navigate()` calls. No logic changes, no new files.
