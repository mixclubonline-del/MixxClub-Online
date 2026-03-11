

# Fan Public Profile Page — `/fan/:userId`

## Overview

Create a cinematic public profile page for Fan users, consistent with the existing Artist, Producer, and Engineer profile pages. The page showcases supporter stats, Day 1 badges, community activity, and tier progression.

## Data Sources (already exist)

- **`profiles`** table — avatar, name, username, bio, location, member since
- **`fan_stats`** table — total_votes, total_comments, artists_supported, day1_badges, mixxcoinz_earned, engagement_streak, current_tier
- **`artist_day1s`** table — Day 1 artist records with recognition tiers and milestones
- **`user_activity`** table — public activity feed

## New File: `src/pages/FanProfile.tsx`

Mirrors `ProducerProfile.tsx` structure (~400 lines):

**Cinematic Hero** — Pink/magenta ambient orbs (fan accent color). Large avatar with gradient ring, display name, tier badge (Newcomer/Supporter/Advocate/Champion/Legend), location, bio.

**Stats Bar** — 4 glassmorphic cards:
- Artists Supported (from `fan_stats.artists_supported`)
- Day 1 Badges (from `fan_stats.day1_badges`)
- MixxCoinz Earned (from `fan_stats.mixxcoinz_earned`)
- Engagement Streak (from `fan_stats.engagement_streak`)

**Day 1 Collection** — Grid of artists the fan backed early (query `artist_day1s` where `fan_id = userId`), showing artist avatar, name, recognition tier badge, and milestone indicators (1K, 10K, Verified).

**Community Activity** — Recent public `user_activity` entries with icon mapping and relative timestamps (reuse `ProfileActivityFeed` component pattern).

**Loading/404 states** — Skeleton loading and "Fan Not Found" empty state, matching Producer profile pattern.

## Route Registration: `src/routes/appRoutes.tsx`

- Lazy import `FanProfile`
- Add route: `<Route path="/fan/:userId" element={<FanProfile />} />`
- Place alongside existing `/artist/:userId`, `/producer/:userId`, `/engineer/:userId`

## Data Queries (all client-side, no migrations needed)

1. Profile: `supabase.from('profiles').select('*').eq('id', userId)`
2. Fan stats: `supabase.from('fan_stats').select('*').eq('user_id', userId)`
3. Day 1 artists: `supabase.from('artist_day1s').select('*, profiles!artist_day1s_artist_id_fkey(...)').eq('fan_id', userId).order('created_at', { ascending: false }).limit(12)`
4. Activity: `supabase.from('user_activity').select('*').eq('user_id', userId).eq('is_public', true).order('created_at', { ascending: false }).limit(10)`

## Update PublicProfile Banner

In `src/pages/PublicProfile.tsx`, add a fan-role detection banner (pink accent) linking to `/fan/:userId`, consistent with the existing artist/producer/engineer role banners.

## Files Summary

| File | Action |
|------|--------|
| `src/pages/FanProfile.tsx` | Create — cinematic fan profile page |
| `src/routes/appRoutes.tsx` | Edit — add `/fan/:userId` route |
| `src/pages/PublicProfile.tsx` | Edit — add fan role banner |

