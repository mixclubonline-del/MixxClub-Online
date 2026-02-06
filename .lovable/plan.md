

# Fix: Remove Hardcoded OLD Supabase URLs

## Root Cause Analysis

The console errors show CORS failures and 400 errors because **two files have hardcoded URLs pointing to an OLD Supabase project** (`kbbrehnyqpulbxyesril`) that's no longer connected to this app. The current project uses `wmhwiwjxzpnnzckxezcu`.

**Evidence from Console:**
```text
kbbrehnyqpulbxyesril.supabase.co/rest/v1/profiles... CORS blocked
kbbrehnyqpulbxyesril.supabase.co/storage/v1/.../m8ucjp.mp3 → 400 error
```

## Files With Hardcoded OLD URLs

| File | Issue |
|------|-------|
| `src/hooks/useCollaboration.tsx` (line 52) | WebSocket URL hardcoded to old project |
| `src/hooks/useInsiderAudio.tsx` (line 14) | Audio file URL hardcoded to old storage bucket |
| `docs/launch-control-center/supabase-client.ts` | Documentation file with old credentials (not runtime issue, but confusing) |

## Fix Strategy

### 1. Fix useCollaboration.tsx

Replace hardcoded WebSocket URL with dynamic URL from environment:

```typescript
// BEFORE (line 52):
const wsUrl = `wss://kbbrehnyqpulbxyesril.supabase.co/functions/v1/...`;

// AFTER:
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const wsHost = supabaseUrl.replace('https://', 'wss://');
const wsUrl = `${wsHost}/functions/v1/collaboration-websocket?...`;
```

### 2. Fix useInsiderAudio.tsx

Replace hardcoded audio URL with dynamic storage URL:

```typescript
// BEFORE (line 14):
const AUDIO_URL = 'https://kbbrehnyqpulbxyesril.supabase.co/storage/v1/...';

// AFTER:
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const AUDIO_URL = `${SUPABASE_URL}/storage/v1/object/public/audio-files/insider-track.mp3`;
```

**Note:** The specific audio file (`1764786509897-m8ucjp.mp3`) was in the OLD project's storage and won't exist in the new project. We'll need to either:
- Upload a new audio file to the current project's storage
- Use a fallback/placeholder approach if no file exists
- Gracefully handle the missing file without errors

### 3. Update Documentation (Optional)

Update `docs/launch-control-center/supabase-client.ts` to use env vars or remove outdated credentials to prevent confusion.

## Implementation Details

### useCollaboration.tsx Changes

```typescript
// Line 2: Add import for env var access (already available via Vite)
// Lines 51-54: Replace hardcoded URL

const connect = useCallback(() => {
  // ... existing checks ...
  
  try {
    // Build WebSocket URL from environment variable
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const wsHost = supabaseUrl.replace('https://', 'wss://');
    const wsUrl = `${wsHost}/functions/v1/collaboration-websocket?sessionId=${sessionId}&userId=${userId}&userName=${encodeURIComponent(userName)}`;
    
    const ws = new WebSocket(wsUrl);
    // ... rest of connection logic ...
  }
}, [...]);
```

### useInsiderAudio.tsx Changes

```typescript
// Lines 14-16: Use dynamic URL with graceful fallback

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
// Insider audio track - uses audio-files bucket
// If no track is uploaded, audio features will be disabled gracefully
const AUDIO_URL = SUPABASE_URL 
  ? `${SUPABASE_URL}/storage/v1/object/public/audio-files/insider-track.mp3`
  : '';
```

Add error handling for missing audio:
```typescript
// In initAudio callback, handle missing file gracefully:
audio.onerror = (e) => {
  console.warn('Insider audio not available - feature disabled');
  setIsReady(false);
  setIsLoading(false);
};
```

## Files to Modify

| File | Change Summary |
|------|---------------|
| `src/hooks/useCollaboration.tsx` | Line 52: Dynamic WebSocket URL |
| `src/hooks/useInsiderAudio.tsx` | Line 14: Dynamic storage URL + error handling |

## Why This Fixes the Errors

1. **CORS errors disappear**: No more requests to `kbbrehnyqpulbxyesril` - all requests go to `wmhwiwjxzpnnzckxezcu`
2. **400 errors handled**: Missing audio file handled gracefully instead of throwing
3. **Environment-aware**: URLs automatically adapt to any Supabase project

## Acceptance Criteria

- [ ] No console errors referencing `kbbrehnyqpulbxyesril`
- [ ] WebSocket connections use current project URL
- [ ] Audio feature gracefully degrades if file missing
- [ ] Build completes without errors

