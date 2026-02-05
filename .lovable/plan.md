

# Wire CRM Matches Hub to Live Backend API
## Complete the Artist-to-Engineer Matching Integration

The `MatchingDashboard` now uses the live backend API, but the CRM-embedded matching components (`MatchesHub`, `AIMatchesHub`, `AIMatchRecommendations`, `SavedMatches`, `MatchRequests`) still use hardcoded demo data. This phase connects all matching components to the production backend.

---

## Current Gap Analysis

```text
WORKING (Live API)
+------------------------+
| MatchingDashboard.tsx  | --> useEngineerMatchingAPI --> match-engineers Edge Function
+------------------------+

STILL HARDCODED (Demo Data)
+------------------------+     +------------------------+     +------------------------+
| MatchesHub.tsx         |     | AIMatchRecommendations |     | SavedMatches.tsx      |
| (ArtistCRM tab)        |     | (3 static profiles)    |     | (3 static profiles)   |
+------------------------+     +------------------------+     +------------------------+
        |                              |                              |
        v                              v                              v
+------------------------+     +------------------------+     +------------------------+
| AIMatchesHub.tsx       |     | MatchRequests.tsx      |     | user_matches table    |
| (EngineerCRM tab)      |     | (4 static requests)    |     | (unused)              |
+------------------------+     +------------------------+     +------------------------+
```

---

## Implementation Plan

### Phase 1: Create Unified Matching Hook

**File:** `src/hooks/useMatchesAPI.ts` (NEW)

Extend the existing hook to support:
- Fetching saved matches from `user_matches` table
- Fetching match requests (incoming/outgoing)
- Saving/unsaving matches
- Real-time subscriptions for match updates

```typescript
interface UseMatchesAPI {
  // From existing hook
  findMatches: (criteria: MatchCriteria) => Promise<EngineerMatch[]>;
  hireEngineer: (engineerId: string, projectDetails: {...}) => Promise<HireResult>;
  
  // New capabilities
  savedMatches: SavedMatch[];
  matchRequests: { incoming: MatchRequest[]; outgoing: MatchRequest[] };
  saveMatch: (matchedUserId: string) => Promise<void>;
  unsaveMatch: (matchId: string) => Promise<void>;
  acceptRequest: (requestId: string) => Promise<void>;
  declineRequest: (requestId: string) => Promise<void>;
  sendRequest: (engineerId: string, message: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}
```

### Phase 2: Update CRM Match Components

**Files to Modify:**

| Component | Current State | Target State |
|-----------|---------------|--------------|
| `AIMatchRecommendations.tsx` | 3 hardcoded profiles | Uses `findMatches()` API |
| `SavedMatches.tsx` | 3 hardcoded profiles | Reads from `user_matches` table |
| `MatchRequests.tsx` | 4 hardcoded requests | Reads from `match_requests` table |
| `MatchesHub.tsx` | Passes static data | Connects child components to API |
| `AIMatchesHub.tsx` | Falls back to `generateSampleMatches()` | Uses API exclusively |

### Phase 3: Database Schema Check

**Required Tables:**

| Table | Status | Purpose |
|-------|--------|---------|
| `user_matches` | EXISTS | Stores saved matches |
| `match_requests` | NEEDS CHECK | Stores collaboration requests |
| `engineer_profiles` | EXISTS | Engineer data for matching |

If `match_requests` doesn't exist, create migration:

```sql
CREATE TABLE public.match_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  recipient_id UUID NOT NULL REFERENCES auth.users(id),
  message TEXT,
  project_type TEXT,
  budget_range TEXT,
  genres TEXT[],
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  created_at TIMESTAMPTZ DEFAULT now(),
  responded_at TIMESTAMPTZ,
  UNIQUE(sender_id, recipient_id, status)
);

ALTER TABLE public.match_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own requests"
  ON public.match_requests FOR SELECT
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can create requests"
  ON public.match_requests FOR INSERT
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Recipients can update request status"
  ON public.match_requests FOR UPDATE
  USING (recipient_id = auth.uid());
```

### Phase 4: Component Updates

**AIMatchRecommendations.tsx**

```typescript
// Before
const recommendations = [/* hardcoded array */];

// After
const { matches, loading, findMatches } = useEngineerMatchingAPI();

useEffect(() => {
  findMatches({
    budgetRange: '100-300',
    genres: userProfile?.genres || ['Hip-Hop'],
    projectType: 'mixing'
  });
}, [userProfile]);
```

**SavedMatches.tsx**

```typescript
// Before
const savedMatches = [/* hardcoded array */];

// After
const { savedMatches, unsaveMatch, loading } = useMatchesAPI();

// Render from real data
```

**MatchRequests.tsx**

```typescript
// Before
const incomingRequests = [/* hardcoded array */];
const outgoingRequests = [/* hardcoded array */];

// After
const { matchRequests, acceptRequest, declineRequest } = useMatchesAPI();
const { incoming, outgoing } = matchRequests;
```

---

## Files Summary

### New Files (1)

| File | Purpose |
|------|---------|
| `src/hooks/useMatchesAPI.ts` | Extended matching API hook |

### Modified Files (5)

| File | Changes |
|------|---------|
| `src/components/crm/matches/AIMatchRecommendations.tsx` | Wire to `findMatches()` API |
| `src/components/crm/matches/SavedMatches.tsx` | Wire to `user_matches` table |
| `src/components/crm/matches/MatchRequests.tsx` | Wire to `match_requests` table |
| `src/components/crm/matches/MatchesHub.tsx` | Pass API state to children |
| `src/components/crm/matches/AIMatchesHub.tsx` | Remove `generateSampleMatches()` fallback |

### Possible Migration (1)

| File | Purpose |
|------|---------|
| `match_requests` table migration | If table doesn't exist |

---

## End-to-End Flow After Implementation

```text
Artist CRM (/artist-crm?tab=matches)
         |
         v
+------------------+     +------------------+     +------------------+
| AI Recommendations| --> | Saved Matches   | --> | Match Requests   |
| (Live API)       |     | (user_matches)  |     | (match_requests) |
+------------------+     +------------------+     +------------------+
         |                       |                       |
         v                       v                       v
+------------------------------------------------------------------------+
|                     match-engineers Edge Function                       |
|                     engineer_profiles + profiles tables                 |
+------------------------------------------------------------------------+
```

---

## Testing Checklist

After implementation:
- [ ] AIMatchRecommendations shows real engineers from database
- [ ] Clicking "Save" adds match to `user_matches` table
- [ ] Saved Matches tab shows data from `user_matches`
- [ ] Removing a saved match updates the table
- [ ] Match Requests shows real incoming/outgoing requests
- [ ] Accepting a request creates a partnership
- [ ] Declining a request updates status
- [ ] Real-time updates work when new matches appear
- [ ] Empty states display correctly when no data exists

---

## Benefit Summary

| Metric | Before | After |
|--------|--------|-------|
| Data source | Hardcoded demo | Live database |
| Saved matches | Lost on refresh | Persistent |
| Match requests | Non-functional | Fully working |
| Real-time sync | None | Enabled |
| Consistency | 2 separate systems | 1 unified API |

