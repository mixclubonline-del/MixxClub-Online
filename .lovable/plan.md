

# Connect Matching Dashboard to Live Backend API
## Wire the Frontend to Real Engineer Matching Data

The current matching flow uses a Zustand store with hardcoded demo data instead of calling the production `match-engineers` Edge Function. This plan connects the frontend to the live backend to complete the Artist-to-Engineer matching flow.

---

## Current Gap Analysis

```text
CURRENT STATE (Broken Flow)
+------------------------+     +------------------------+     +------------------------+
| MatchingDashboard.tsx  | --> | matchingEngineStore.ts | --> | SAMPLE_ENGINEERS[]     |
| (Uses Zustand store)   |     | (5 hardcoded engineers)|     | (Static demo data)     |
+------------------------+     +------------------------+     +------------------------+

TARGET STATE (Working Flow)  
+------------------------+     +------------------------+     +------------------------+
| MatchingDashboard.tsx  | --> | useEngineerMatching()  | --> | match-engineers        |
| (Uses API hook)        |     | (New hook)             |     | (Edge Function)        |
+------------------------+     +------------------------+     +------------------------+
```

**Root Cause:** The `MatchingDashboard` component uses `useMatchingEngine()` which pulls from `matchingEngineStore.ts` - a Zustand store containing 5 hardcoded sample engineers. The real `match-engineers` Edge Function exists and works but is never called.

---

## Implementation Plan

### Phase 1: Create API-Connected Matching Hook

**File:** `src/hooks/useEngineerMatchingAPI.ts` (NEW)

A new hook that:
- Calls the `match-engineers` Edge Function
- Handles authentication headers
- Manages loading/error states
- Returns real engineer matches from the database

```typescript
// Key functionality:
const matchEngineers = async (criteria: MatchCriteria) => {
  const { data, error } = await supabase.functions.invoke('match-engineers', {
    body: {
      budgetRange: criteria.budget,
      genres: criteria.genres,
      projectType: criteria.projectType,
    },
  });
  return data.matches;
};
```

### Phase 2: Update MatchingDashboard Component

**File:** `src/pages/MatchingDashboard.tsx`

Changes:
- Replace `useMatchingEngine()` with new `useEngineerMatchingAPI()` hook
- Add project criteria input form (budget, genres, project type)
- Display real matches from database
- Keep existing UI/filtering components

```text
Before:
  const { engineers, projects, findMatches } = useMatchingEngine();
  const matches = findMatches(demoProject.id, 10);  // Static data

After:
  const { matches, loading, findMatches } = useEngineerMatchingAPI();
  const matches = await findMatches({ budget, genres, projectType });  // Real API
```

### Phase 3: Add Project Creation Integration

When a user selects an engineer match:
1. Create a project in `collaborative_projects` table
2. Link to the matched engineer
3. Create partnership record if not exists
4. Redirect to project workspace

**Flow:**
```text
Select Match → Create Partnership → Create Project → Navigate to Workspace
```

### Phase 4: Connect Upload to Matching Flow

**File:** `src/pages/AudioUpload.tsx`

After successful upload:
- Show "Find an Engineer" CTA
- Pass audio metadata to matching criteria
- Auto-detect genre from filename/metadata (future enhancement)

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/hooks/useEngineerMatchingAPI.ts` | CREATE | New hook for API-based matching |
| `src/pages/MatchingDashboard.tsx` | MODIFY | Wire to new hook, add criteria form |
| `src/components/matching/MatchCriteriaForm.tsx` | CREATE | Budget/genre/type selection UI |
| `src/components/matching/MatchCard.tsx` | MODIFY | Add "Hire Engineer" action |
| `src/pages/AudioUpload.tsx` | MODIFY | Add post-upload matching CTA |

---

## Technical Details

### New Hook Interface

```typescript
interface MatchCriteria {
  budgetRange: string;  // 'under-50' | '50-100' | '100-300' | '300-500' | '500+'
  genres: string[];
  projectType: string;  // 'mixing' | 'mastering' | 'production'
}

interface EngineerMatch {
  engineerId: string;
  engineerName: string;
  avatarUrl?: string;
  specialties: string[];
  genres: string[];
  experience: number;
  rating: number;
  completedProjects: number;
  hourlyRate: number;
  matchScore: number;
  matchingGenres: string[];
  portfolioUrl?: string;
}

interface UseEngineerMatchingAPI {
  matches: EngineerMatch[];
  loading: boolean;
  error: string | null;
  findMatches: (criteria: MatchCriteria) => Promise<void>;
  selectEngineer: (engineerId: string) => Promise<{ partnershipId: string; projectId: string }>;
}
```

### Database Integration

Uses existing tables:
- `engineer_profiles` (read - matching)
- `profiles` (read - names/avatars)
- `partnerships` (write - create partnership)
- `collaborative_projects` (write - create project)

---

## Migration Required

None - all required tables already exist:
- `engineer_profiles`
- `partnerships`
- `collaborative_projects`

---

## End-to-End Flow After Implementation

```text
1. Artist uploads track (/audio-upload)
      ↓
2. Clicks "Find an Engineer"
      ↓
3. Enters budget, selects genres (/matching)
      ↓
4. Sees matched engineers (from real database)
      ↓
5. Clicks "Hire" on preferred match
      ↓
6. Partnership created (partnerships table)
      ↓
7. Project created (collaborative_projects table)
      ↓
8. Redirected to project workspace
      ↓
9. Engineer notified (notifications table)
      ↓
10. Work completed, payment released
```

---

## Backward Compatibility

- Existing `useMatchingEngine()` hook remains for demo purposes
- New hook is opt-in, no breaking changes
- Existing MatchCard component receives same props

---

## Testing Checklist

After implementation:
- [ ] Can enter matching criteria (budget/genres)
- [ ] API returns real engineers from database
- [ ] Match scores display correctly
- [ ] Can select and hire an engineer
- [ ] Partnership record created
- [ ] Project record created
- [ ] Navigation to project workspace works
- [ ] Engineer receives notification

