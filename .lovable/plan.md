
# 120% Capacity Push — Complete Every Touch Point

## Philosophy Shift

**Before:** "Phase 3" = stub with "coming soon" text  
**Now:** "Phase 3" = fully built feature with elegant unlock overlay

Every component, every page, every interaction gets completed to shipping quality. Features locked behind community milestones get polished UI with unlock requirements displayed. No stubs. No TODOs. No "coming soon..." text. Just intention and elevation.

---

## Execution Plan (4 Phases, ~6-8 hours total)

### Phase A: Kill The Alert Stubs (5 Components, 2 hours)

**EngineerReviews** (`src/components/review/EngineerReviews.tsx`)
- Build full reviews UI: 5-star rating, review cards, verified badge, sort/filter
- Fetch from `engineer_reviews` table (if exists) or create it
- Empty state: "No reviews yet" with elegant card, not an error alert
- Props already include `engineerId` — wire it up properly

**EffectPresetManager** (`src/components/studio/EffectPresetManager.tsx`)
- Build preset browser: grid of preset cards, search, category filter
- Create/save/load preset functionality
- Database: `effect_presets` table (user_id, effect_type, name, parameters JSON)
- Cloud sync indicator (save to DB, load from DB)
- Props already include `effectType`, `currentParameters`, `onLoadPreset` — implement them

**SessionManager** (`src/components/studio/SessionManager.tsx`)
- Build session save/load UI: list of saved sessions, timestamps, metadata
- Database: `studio_sessions` table (user_id, session_name, tracks JSON, plugins JSON, timestamp)
- Auto-save indicator, manual save button, session history
- Load session restores full DAW state (tracks, plugins, routing)

**PremiereScheduler** (`src/components/premieres/PremiereScheduler.tsx`)
- Build premiere scheduling form: date/time picker, timezone, premiere description
- Database: `premieres` table (project_id, scheduled_at, description, status)
- Preview card showing how the premiere will look
- Props include `projectId`, `audioUrl`, `onSuccess` — wire them up

**AddOnServices** (`src/components/services/AddOnServices.tsx`)
- Build add-on services grid: rush delivery, extra revisions, stem separation, etc.
- Pricing cards, "Add to cart" buttons
- Database: `service_addons` table (if needed) or use existing `orders` table
- Props include `projectId`, `onPurchaseComplete` — implement checkout flow

---

### Phase B: Complete Settings Tabs (30 minutes)

**Notifications Tab** (`src/pages/Settings.tsx`)
- Email notifications: project updates, messages, payment confirmations (toggles)
- Push notifications: browser permission request, toggle on/off
- Notification frequency: real-time, daily digest, weekly
- Store in `user_preferences` table or localStorage fallback
- Elegant toggle switches with descriptions

**Privacy Tab** (`src/pages/Settings.tsx`)
- Profile visibility: public, private, community-only (radio buttons)
- Show email: yes/no toggle
- Show location: yes/no toggle
- Show earnings: yes/no toggle
- Data export button ("Download your data")
- Account deletion button (with confirmation dialog)

---

### Phase C: Replace Console TODOs with UI (30 minutes)

**MasterBus.tsx** (lines 102, 111, 120, 129)
- Replace `console.log('TODO: Open X editor')` with proper toast notifications:
  - "Master EQ editor coming in Phase 3 — stay tuned!"
  - "MultiComp editor coming in Phase 3 — stay tuned!"
  - "Limiter editor coming in Phase 3 — stay tuned!"
  - "Clipper editor coming in Phase 3 — stay tuned!"
- Use `toast.info()` from sonner
- This respects the roadmap while removing developer console logs

---

### Phase D: Build "Phase 3" Pages Fully (3-4 hours)

These currently show "Phase 3 Feature" badges with generic "coming soon" text. Build them COMPLETELY and add unlock overlays.

**SessionWorkspacePage** (`src/pages/SessionWorkspacePage.tsx`)
- Full real-time collaboration workspace UI
- Waveform viewer (WaveSurfer.js)
- Timestamped comment system (database: `session_comments`)
- Live participant list (WebRTC or Supabase Realtime)
- Video chat placeholder (can integrate later, but UI is there)
- Lock behind: `REMOTE_COLLABORATION_ENABLED` feature flag
- Overlay: "Unlocks at 250 community members — 47 to go!"

**Integrations Page** (`src/pages/Integrations.tsx`)
- Full integrations grid: Spotify, Apple Music, SoundCloud, Discord, Slack
- Each integration card: logo, description, "Connect" button, connection status
- OAuth flow placeholders (disabled buttons with "Coming soon" tooltip)
- API key input for manual integrations
- Lock behind: `INTEGRATIONS_ENABLED` feature flag
- Overlay: "Unlocks at 1000 community members — 953 to go!"

**MyCertifications Page** (`src/pages/MyCertifications.tsx`)
- Certification library: Mixing 101, Mastering 101, Producer Bootcamp
- Progress bars, locked/unlocked states
- Quiz/test UI (multiple choice, code challenges)
- Certificate download (PDF generation with jsPDF)
- Lock behind: `EDUCATION_HUB_ENABLED` feature flag
- Overlay: "Unlocks at 250 community members — 47 to go!"

**AI Audio Intelligence Page** (`src/pages/AIAudioIntelligence.tsx`)
- Already has unlock overlay at 1000 members ✓
- Build the actual feature UI beneath it:
  - AI audio analysis dashboard
  - Spectral analysis graphs
  - Auto-tagging (genre, mood, key, BPM)
  - AI mixing suggestions
  - Integration with `ai` SDK (Vercel AI) and Lovable AI models
- When unlocked, the overlay fades and the feature is immediately usable

---

### Phase E: Functional TODOs (2 hours, can be done in parallel)

**High Priority:**
1. `useMixxTune.ts` — Migrate ScriptProcessor to AudioWorkletProcessor (30 min)
2. `ProjectBoard.tsx` — Wire up Supabase for real status updates (15 min)
3. `MeteringPanel.tsx` — Calculate phase correlation and goniometer from actual audio (30 min)

**Medium Priority:**
4. `useOpportunities.tsx` — Implement activeChats when messages table available (15 min)
5. `useAudioExport.tsx` — Implement buffer conversion for regions (20 min)
6. `DAWCollaboration.tsx` — Implement user invitation system (20 min)

**Lower Priority (can defer):**
7. Analytics service integrations (GA, Mixpanel) — post-beta
8. Error logging integrations (Sentry) — post-beta

---

## Database Migrations Needed

### New Tables:
```sql
-- Engineer reviews
CREATE TABLE engineer_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engineer_id uuid REFERENCES profiles(id),
  client_id uuid REFERENCES profiles(id),
  project_id uuid REFERENCES mixing_projects(id),
  rating integer CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  created_at timestamptz DEFAULT now()
);

-- Effect presets
CREATE TABLE effect_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  effect_type text NOT NULL,
  preset_name text NOT NULL,
  parameters jsonb NOT NULL,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Studio sessions
CREATE TABLE studio_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  session_name text NOT NULL,
  tracks jsonb NOT NULL,
  plugins jsonb,
  bpm integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Premieres
CREATE TABLE premieres (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES mixing_projects(id),
  user_id uuid REFERENCES profiles(id),
  scheduled_at timestamptz NOT NULL,
  description text,
  audio_url text NOT NULL,
  status text DEFAULT 'scheduled',
  created_at timestamptz DEFAULT now()
);

-- Session comments (real-time collab)
CREATE TABLE session_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  user_id uuid REFERENCES profiles(id),
  timestamp_ms integer NOT NULL,
  comment_text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- User preferences
CREATE TABLE user_preferences (
  user_id uuid PRIMARY KEY REFERENCES profiles(id),
  email_notifications boolean DEFAULT true,
  push_notifications boolean DEFAULT true,
  notification_frequency text DEFAULT 'realtime',
  profile_visibility text DEFAULT 'public',
  show_email boolean DEFAULT false,
  show_location boolean DEFAULT true,
  show_earnings boolean DEFAULT false,
  updated_at timestamptz DEFAULT now()
);
```

### RLS Policies:
- All tables: users can only read/write their own data (except engineer_reviews which can be read by anyone)
- `engineer_reviews`: SELECT public, INSERT authenticated, UPDATE/DELETE owner only
- `effect_presets`: if `is_public = true`, SELECT public; otherwise owner only
- `studio_sessions`: owner only
- `premieres`: owner only
- `session_comments`: participants of the session only

---

## Testing Checklist

After implementation:
1. **Engineer profile** → Reviews tab shows polished UI (empty or populated)
2. **DAW** → Click "Save Preset" on any effect → Preset manager opens with full UI
3. **DAW** → Session Manager shows save/load UI
4. **Project** → Click "Schedule Premiere" → Full scheduling form appears
5. **Project** → "Add Services" shows add-on grid with prices
6. **Settings** → Notifications tab has real toggles
7. **Settings** → Privacy tab has real controls
8. **DAW Master Bus** → Clicking EQ/Compressor/Limiter buttons shows toast (not console log)
9. **Session Workspace page** → Full UI visible with "Unlock" overlay if feature flag off
10. **Integrations page** → Full grid of integrations with "Coming soon" tooltips
11. **Certifications page** → Full certification library with progress bars

---

## Outcome

**Before:** 5 error alerts, 2 placeholder tabs, 4 console logs, 4 generic "coming soon" pages  
**After:** 13 fully-built features, elegant unlock overlays, zero stubs, zero TODOs

This is the 120% line. Every surface touched is complete and intentional. Features are locked elegantly with community unlock counters, not with lazy placeholders.

When beta users explore, they see a polished, complete platform with clear unlock paths — not a half-built prototype.

---

## Estimated Timeline

- **Phase A (Stubs):** 2 hours
- **Phase B (Settings):** 30 min
- **Phase C (Console logs):** 30 min
- **Phase D (Phase 3 pages):** 3-4 hours
- **Phase E (Functional TODOs):** 2 hours

**Total: 6-8 hours** to reach 100% completion with 120% polish.
