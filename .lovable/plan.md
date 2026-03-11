

# Engineer Profile Page — Full Redesign

## Current State

The page at `src/pages/EngineerProfile.tsx` is functional but visually flat — plain `Card` components, no glassmorphic styling, no animations, no immersive hero, and the "Book Session" CTA just links to `/services`. It doesn't match the 2026 Visual Doctrine or the polish level of the rest of MixxClub.

The `engineer_profiles` table has: `specialties`, `genres`, `equipment_list`, `hourly_rate`, `years_experience`, `availability_status`, `rating`, `completed_projects`, `portfolio_url`. There is no `daw` column — DAW setup will be a UI-only section derived from the equipment list (DAW names extracted) or displayed as a curated static section until a DB column is added.

Audio samples can be pulled from `audio_files` where `user_id` matches the engineer.

## Plan

### 1. Cinematic Hero Section
Replace the flat gradient banner + avatar card with a full-width immersive hero:
- Dark gradient backdrop with ambient glow orbs (matching utility page standard)
- Large avatar with glassmorphic border ring and pulse animation for "available" status
- Name, username, location, verification badge, and availability status overlaid
- Staggered entrance animations via framer-motion `whileInView`

### 2. Stats Bar (Glassmorphic)
Replace plain cards with a horizontal glass stat bar using `glass-mid` variant:
- Rating (star icon + number), Projects completed, Years experience, Hourly rate
- Each stat with subtle icon glow matching its accent color

### 3. Equipment & DAW Setup Section (NEW)
Split the existing equipment list into two visual groups:
- **DAW Setup**: Parse `equipment_list` for known DAW names (Pro Tools, Logic Pro, Ableton, FL Studio, Studio One, Cubase, Reaper) and display them as branded icon cards
- **Studio Gear**: Remaining equipment items displayed in a 2-column grid with `CheckCircle` icons inside glass cards
- If no DAW names are detected, show the full equipment list as before

### 4. Sample Work Audio Player (NEW)
Query `audio_files` where `user_id = engineerId`, limit 5:
- Display a mini playlist with track name, duration, and a play/pause button per track
- Use an `<audio>` element controlled via React state (no heavy library needed for simple playback)
- Glass card container with waveform-style decorative bars (CSS-only, similar to AudioDemoPlayer pattern)
- If no audio files exist, show an elegant empty state

### 5. Inline Booking Flow (replaces redirect)
Replace the "Book Session" link with an inline booking card at the bottom:
- Date picker (Shadcn Calendar in a Popover) for selecting session date
- Session type selector (Mixing / Mastering / Consultation) as radio-style badges
- Optional message textarea
- "Request Session" button that inserts into `collaboration_sessions` with `status: 'pending'`, `host_user_id: engineerId`, `scheduled_start: selectedDate`
- Requires auth — show a "Sign in to book" CTA if unauthenticated
- Success state with confetti or checkmark animation

### 6. Reviews Section Polish
- Add glass card styling and staggered entrance animations
- Keep existing data flow (engineer_reviews + joined profiles)

### 7. Portfolio Section Polish
- Add hover lift effect on project cards
- Keep existing data flow (projects where engineer_id matches)

## Technical Details

**Files modified:**
- `src/pages/EngineerProfile.tsx` — Full rewrite of the render, same data queries plus new `audio_files` query

**New query:**
```typescript
const { data: sampleTracks } = useQuery({
  queryKey: ['engineer-samples', userId],
  queryFn: async () => {
    const { data } = await supabase
      .from('audio_files')
      .select('id, file_name, file_path, duration_seconds')
      .eq('user_id', userId!)
      .order('created_at', { ascending: false })
      .limit(5);
    return data;
  },
  enabled: !!userId,
});
```

**Inline booking insert:**
```typescript
const { data } = await supabase.from('collaboration_sessions').insert({
  host_user_id: userId,
  title: `${sessionType} Session`,
  description: message,
  scheduled_start: selectedDate.toISOString(),
  status: 'pending',
});
```

**No database migrations needed.** All data sources already exist. The booking uses `collaboration_sessions` which already has RLS and the required columns.

**Dependencies used:** framer-motion (animations), date-fns (date formatting), existing Shadcn Calendar/Popover components, useAuth hook for auth gate on booking.

