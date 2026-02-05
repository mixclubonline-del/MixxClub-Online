

# Music Timeline Synchronization for Demo Phases

## Current State

The demo currently uses **timer-based progression**:
```typescript
// Lines 100-119: Phase auto-progression
const phase = DEMO_PHASES[currentPhase];
const progressInterval = setInterval(() => {
  const elapsed = Date.now() - startTime;
  const progress = Math.min((elapsed / phase.duration) * 100, 100);
  // ... advances phase when progress >= 100
}, 50);
```

This means phases advance based on fixed durations, **not** the music timeline. The audio hook already provides `analysis.currentTime` and `analysis.duration`, but they're unused for phase control.

---

## Solution: Music-Synced Phase Transitions

### Phase Timing Map (configurable)

Map each phase to a specific timestamp in the audio track:

| Phase | ID | Music Start | Music End | Emotional Beat |
|-------|-----|-------------|-----------|----------------|
| 1 | problem | 0:00 | 0:08 | Tension build |
| 2 | discovery | 0:08 | 0:18 | First drop |
| 3 | connection | 0:18 | 0:32 | Groove section |
| 4 | transformation | 0:32 | 0:48 | Peak energy |
| 5 | tribe | 0:48 | 1:00 | Warm resolution |
| 6 | invitation | 1:00+ | End | Hold until action |

These timestamps are estimates and should be tuned to the actual audio file's structure.

---

## Technical Implementation

### 1. Create `usePhaseSync` Hook

A dedicated hook that watches audio `currentTime` and triggers phase changes:

```text
src/hooks/usePhaseSync.ts

Input:
  - currentTime: number (from audio analysis)
  - isPlaying: boolean
  - phaseMarkers: { phaseId: string, startTime: number }[]
  - onPhaseChange: (phaseIndex: number) => void
  - enabled: boolean (whether sync is active)

Behavior:
  - Watches currentTime and compares to markers
  - Calls onPhaseChange when crossing a threshold
  - Handles seek (jumping backwards or forwards)
  - Calculates progress within current phase
  - Supports manual override when disabled

Returns:
  - currentPhaseIndex: number
  - phaseProgress: number (0-100)
  - syncEnabled: boolean
  - setSyncEnabled: (enabled: boolean) => void
```

### 2. Define Phase Markers Constant

Store music timestamps alongside phase definitions:

```typescript
const PHASE_MARKERS = [
  { id: 'problem',        startTime: 0,    endTime: 8   },
  { id: 'discovery',      startTime: 8,    endTime: 18  },
  { id: 'connection',     startTime: 18,   endTime: 32  },
  { id: 'transformation', startTime: 32,   endTime: 48  },
  { id: 'tribe',          startTime: 48,   endTime: 60  },
  { id: 'invitation',     startTime: 60,   endTime: 999 },
];
```

### 3. Update InsiderDemoExperience

Replace timer-based progression with music-synced progression:

**Remove**: The interval-based phase progression effect (lines 100-119)

**Add**: Integration with `usePhaseSync`:
```typescript
const { currentPhaseIndex, phaseProgress, syncEnabled, setSyncEnabled } = usePhaseSync({
  currentTime: analysis.currentTime,
  isPlaying,
  phaseMarkers: PHASE_MARKERS,
  onPhaseChange: (index) => setCurrentPhase(index),
  enabled: isAutoPlay
});
```

**Update**: Progress display to use music-synced `phaseProgress` instead of timer-based progress.

### 4. Handle Edge Cases

| Edge Case | Handling |
|-----------|----------|
| Audio loops (track restarts) | Detect currentTime jump back to 0, reset to phase 0 |
| User seeks forward | Jump to correct phase based on new currentTime |
| User seeks backward | Jump to correct phase based on new currentTime |
| Manual skip (skip button) | Temporarily disable sync, seek audio to phase startTime |
| Audio paused | Pause phase progression, maintain current phase |

### 5. Sync Skip Button with Audio

When user clicks skip or phase dots, also seek the audio:

```typescript
const skipToPhase = (index: number) => {
  const marker = PHASE_MARKERS[index];
  seek(marker.startTime); // Seek audio to phase start
  setCurrentPhase(index);
  setPhaseProgress(0);
};
```

---

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/hooks/usePhaseSync.ts` | Create | Music-timeline phase sync hook |
| `src/components/demo/InsiderDemoExperience.tsx` | Update | Replace timer progression with music sync, add PHASE_MARKERS, update skip logic |

---

## Hook Implementation Details

```text
usePhaseSync logic:

1. Find current phase:
   - Loop through phaseMarkers
   - Find marker where startTime <= currentTime < endTime
   - Return that phase index

2. Calculate progress:
   - progress = (currentTime - startTime) / (endTime - startTime) * 100
   - Clamp to 0-100

3. Detect phase change:
   - Compare newPhaseIndex to previous
   - If different, call onPhaseChange(newPhaseIndex)

4. Handle loop detection:
   - If currentTime suddenly drops below previous currentTime by > 2 seconds
   - Reset to phase 0

5. Ref for previous state:
   - previousTimeRef tracks last currentTime
   - previousPhaseRef tracks last phase index
```

---

## UI Enhancements

### Progress Bar

Update to show progress within current phase based on music position:
- Start of phase = 0%
- End of phase = 100%
- Smoothly animates as audio plays

### Phase Dots (left sidebar)

Add visual feedback for music-synced state:
- Active phase pulses with bass
- Clicking a dot seeks audio to that timestamp

### Skip Button

Now also seeks audio forward to next phase's start time.

---

## Validation Criteria

- Phase 1 (problem) plays from 0:00 to 0:08
- Phase 2 (discovery) starts exactly at the beat drop (~0:08)
- Phase 4 (transformation) hits during peak energy section
- Seeking audio forward/backward updates visible phase
- Skip button both advances phase AND seeks audio
- Audio loop resets demo to phase 1
- Pausing audio pauses phase progression
- Progress bar reflects actual audio position within phase

