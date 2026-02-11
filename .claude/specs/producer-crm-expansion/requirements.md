# Requirements Document

## Introduction

The Producer CRM Expansion (Phases 3–4) extends MixxClub's Producer CRM with AI-powered collaboration discovery, seamless beat-to-session workflows, producer-branded live streaming, an end-to-end collaboration pipeline, and automatic multi-party revenue splitting. These features empower producers to find collaborators, launch sessions from beats, go live with producer-specific tools, and automatically distribute revenue across all partnership parties.

## Requirements

### Requirement 1: Producer AI Matching

**User Story:** As a producer, I want the AI matching system to recommend artists based on my beat catalog genres, so that I can find well-matched collaborators without manual searching.

#### Acceptance Criteria

1. WHEN the producer navigates to the Matches tab, THEN AIMatchesHub SHALL accept and render for userType `'producer'`.
2. WHEN the useProducerMatching hook is invoked with a producer's user ID, THEN the system SHALL score artists by computing genre overlap between the producer's published beats and each artist's profile genres.
3. IF the producer has no published beats, THEN the system SHALL return an empty match list without errors.
4. WHEN matches are loaded, THEN each match SHALL display the artist name, avatar, match score (0–100), and match reason.

---

### Requirement 2: MatchesHub Producer Support

**User Story:** As a producer, I want MatchesHub subtitle and search placeholder to reflect my role, so that the interface feels personalized.

#### Acceptance Criteria

1. WHEN `userType` is `'producer'`, THEN MatchesHub subtitle SHALL display "Find artists matched to your beats".
2. WHEN `userType` is `'producer'`, THEN the search placeholder SHALL display "Search artists...".

---

### Requirement 3: Beat-to-Session Pipeline

**User Story:** As a producer, I want to launch a collaboration session directly from one of my beats, so that the session is pre-configured with the beat's metadata (title, BPM, key, genre).

#### Acceptance Criteria

1. WHEN the producer views the Catalog tab, THEN a BeatSessionLauncher component SHALL be visible below the catalog hub.
2. WHEN the producer selects a beat, THEN the session title SHALL be pre-filled with the beat's title.
3. WHEN the producer selects a beat with BPM, key, and genre, THEN those fields SHALL be stored in the session's `session_state` JSON.
4. WHEN the producer confirms session creation, THEN a new `collaboration_sessions` row SHALL be inserted with `session_type: 'recording'`, `status: 'waiting'`, and the beat metadata.
5. IF session creation fails, THEN the system SHALL display a toast error and not navigate away.

---

### Requirement 4: Producer Go-Live Modal

**User Story:** As a producer, I want a producer-branded Go Live modal with beat-making stream type, beat featuring, watermarking, and purchase CTA, so that my live streams showcase my beats and drive sales.

#### Acceptance Criteria

1. WHEN the producer clicks Go Live in the CRM, THEN ProducerGoLiveModal SHALL open instead of the generic GoLiveModal.
2. WHEN the modal opens, THEN a "Beat Making" stream type option SHALL be available.
3. WHEN the producer enables "Feature a Beat", THEN a beat selector populated from `useProducerBeats` SHALL appear.
4. IF "Feature a Beat" is enabled, THEN toggles for "Beat Watermark" and "Purchase CTA" SHALL be visible.
5. WHEN the producer goes live with a featured beat, THEN the stream metadata SHALL include the beat ID and feature flags.
6. WHERE the ProducerGoLiveModal is rendered, THEN the UI theme SHALL use amber brand colors.

---

### Requirement 5: AI Collaboration Pipeline

**User Story:** As a producer, I want a guided 3-step pipeline (Find Match → Propose Deal → Launch Session) that creates both a partnership and a session in one flow, so that I can collaborate without switching between screens.

#### Acceptance Criteria

1. WHEN the producer navigates to the Matches tab, THEN AICollabPipeline SHALL render above MatchesHub.
2. WHEN Step 1 loads, THEN the system SHALL fetch the top 6 matches from `user_matches` ordered by `match_score` descending.
3. WHEN the producer selects a match, THEN the pipeline SHALL advance to Step 2 (Propose Deal).
4. WHILE on Step 2, THEN the producer SHALL be able to set a revenue split (10–90%), optionally attach a beat, enter a session title, and add notes.
5. IF the session title is empty, THEN the "Review & Launch" button SHALL be disabled.
6. WHEN the producer advances to Step 3, THEN a summary of partner, split, beat, and session title SHALL be displayed.
7. WHEN the producer confirms launch, THEN the system SHALL insert a `partnerships` row and a `collaboration_sessions` row.
8. IF either insert fails, THEN the system SHALL display a toast error and remain on Step 3.
9. WHEN both inserts succeed, THEN a success state SHALL appear with a "Start Another" reset button.

---

### Requirement 6: Auto-Split Revenue Engine

**User Story:** As a producer in a partnership, I want revenue to be automatically split across all parties (2-way or 3-way) based on the partnership's configured percentages, so that earnings are distributed fairly without manual calculation.

#### Acceptance Criteria

1. WHEN `distributeRevenue` is called with a partnership ID and total amount, THEN the system SHALL read the partnership's party IDs and split percentages.
2. IF the partnership has an `artist_id`, `engineer_id`, AND `producer_id`, THEN the system SHALL perform a 3-way split.
3. IF the partnership has only `artist_id` and `engineer_id`, THEN the system SHALL perform a 2-way split.
4. WHEN shares are computed, THEN the system SHALL insert a `revenue_splits` row with the correct percentages.
5. WHEN shares are computed, THEN the system SHALL update each party's earnings column on the `partnerships` row.
6. IF the insert or update fails, THEN the system SHALL display a destructive toast and return null.

---

### Requirement 7: Gift Revenue Conversion

**User Story:** As a producer, I want gift coins received during streams to be automatically converted to dollar amounts and split across partnership collaborators, so that live stream gifts contribute to shared earnings.

#### Acceptance Criteria

1. WHEN `distributeGiftRevenue` is called with a stream ID, THEN the system SHALL aggregate all `stream_gifts` quantities × `live_gifts.coin_cost`.
2. IF total coins are 0 or less, THEN the system SHALL display a toast and return null.
3. WHEN total coins are positive, THEN the system SHALL convert at the rate of $0.01 per coin.
4. IF a partnership is attached to the stream's session, THEN the system SHALL call `distributeRevenue` with source `'gift_revenue'`.
5. IF no partnership is attached, THEN the creator SHALL keep 100% of the gift revenue.

---

### Requirement 8: Auto-Split Dashboard

**User Story:** As a producer, I want to see a dashboard of all automatic revenue distributions with summary stats, color-coded split bars, and a scrollable feed, so that I can monitor my earnings at a glance.

#### Acceptance Criteria

1. WHEN the producer navigates to the Earnings tab, THEN AutoSplitDashboard SHALL render above CollaborativeEarnings.
2. WHEN the dashboard loads, THEN it SHALL display 3 summary cards: Total Distributed, Your Share, and Gift Revenue.
3. WHEN distributions exist, THEN each distribution item SHALL show the total amount, source badge, status icon, time-ago stamp, and a color-coded split bar (indigo=artist, emerald=engineer, amber=producer).
4. IF no distributions exist, THEN the dashboard SHALL display an empty state message.
5. WHEN the refresh button is clicked, THEN `fetchDistributionHistory` SHALL be called.

---

### Requirement 9: Partnership Earnings Producer Support

**User Story:** As a producer, I want usePartnershipEarnings to include my partnerships and calculate my earnings correctly, so that the existing earnings views work for producers too.

#### Acceptance Criteria

1. WHEN fetching partnerships, THEN the query's OR clause SHALL include `producer_id.eq.{userId}`.
2. WHEN calculating total earnings for a producer, THEN the system SHALL sum `producer_earnings` from partnerships.
3. WHEN building top partners, THEN the system SHALL detect 3 roles (artist, engineer, producer) and show the correct partner label.

---

## Non-Functional Requirements

### NFR-1: Type Safety

- All new components and hooks SHALL pass `npx tsc --noEmit` with zero errors.

### NFR-2: Error Resilience

- All Supabase operations SHALL be wrapped in try/catch with user-facing toast notifications on failure.

### NFR-3: Performance

- Match loading SHALL be limited to 6 results maximum.
- Distribution history SHALL be limited to 20 results maximum.
- All lists SHALL use `overflow-y-auto` or `ScrollArea` for bounded rendering.

### NFR-4: Consistency

- All producer-specific UI elements SHALL use amber theme colors, consistent with the existing producer brand.
- All new components SHALL use shadcn/ui primitives and follow existing project conventions.
