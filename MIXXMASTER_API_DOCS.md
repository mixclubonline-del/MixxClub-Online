# MixxMaster API Documentation

## Overview
MixxMaster is a comprehensive DAW session management and collaboration platform built on Supabase and React.

## Core Features

### 1. Session Management
Create, update, and manage mixing/mastering sessions with full version control.

**Create Session:**
```typescript
const { data, error } = await supabase.functions.invoke('mixxmaster-create', {
  body: {
    project_id: 'uuid',
    stems: [
      {
        name: 'Vocals',
        file_url: 'storage_url',
        category: 'vocals',
        volume: 0.8,
        pan: 0,
        effects: []
      }
    ],
    session_data: {
      tempo: 120,
      key: 'C Major',
      time_signature: '4/4'
    }
  }
});
```

### 2. Real-time Collaboration
Multiple users can work on the same session simultaneously.

**Subscribe to Changes:**
```typescript
const channel = supabase
  .channel(`session:${sessionId}`)
  .on('presence', { event: 'sync' }, () => {
    const users = channel.presenceState();
    console.log('Active users:', users);
  })
  .subscribe();
```

### 3. Version Control
Automatic versioning with ability to compare and restore previous versions.

**Create Version:**
```typescript
const { data, error } = await supabase
  .from('mixxmaster_versions')
  .insert({
    session_id: sessionId,
    manifest: currentManifest,
    version_notes: 'Updated vocal EQ'
  });
```

### 4. Audio Processing
AI-powered audio analysis and processing capabilities.

**Analyze Audio:**
```typescript
const { data, error } = await supabase.functions.invoke('primebot-analyze', {
  body: {
    session_id: sessionId,
    stems: stemsData
  }
});
```

## Database Schema

### mixxmaster_sessions
- `id` (uuid): Session identifier
- `project_id` (uuid): Associated project
- `manifest` (jsonb): Complete session state
- `checksum` (text): SHA-256 verification hash
- `created_at` (timestamp): Creation time
- `updated_at` (timestamp): Last update

### mixxmaster_stems
- `id` (uuid): Stem identifier
- `session_id` (uuid): Parent session
- `category` (text): Stem type (vocals, drums, etc)
- `volume` (numeric): Volume level (0-1)
- `pan` (numeric): Stereo position (-1 to 1)
- `effects` (jsonb): Applied effects chain

### mixxmaster_versions
- `id` (uuid): Version identifier
- `session_id` (uuid): Parent session
- `version_number` (integer): Auto-incrementing
- `manifest` (jsonb): Session state snapshot
- `version_notes` (text): Change description

## Edge Functions

### mixxmaster-create
Creates a new MixxMaster session with stems and metadata.

**Input:**
```typescript
{
  project_id: string;
  stems: Stem[];
  session_data: SessionData;
}
```

**Output:**
```typescript
{
  session_id: string;
  manifest: SessionManifest;
  checksum: string;
}
```

### mixxmaster-export
Exports session to various DAW formats (Logic Pro, Pro Tools, Ableton).

**Input:**
```typescript
{
  session_id: string;
  format: 'logic' | 'protools' | 'ableton';
}
```

**Output:**
```typescript
{
  download_url: string;
  format: string;
  file_size: number;
}
```

### primebot-analyze
AI-powered audio analysis for mixing suggestions.

**Input:**
```typescript
{
  session_id: string;
  stems: StemData[];
}
```

**Output:**
```typescript
{
  suggestions: Suggestion[];
  overall_quality: number;
  frequency_analysis: FrequencyData;
}
```

## Security & RLS Policies

### Session Access
- Users can only access sessions they created or are invited to
- Project engineers have read access to project sessions
- Admins have full access

### Collaboration
- Participants tracked via `session_participants` table
- Real-time presence managed through Supabase Realtime
- Changes logged with user attribution

## Performance Optimization

### Audio Processing
- Buffer pooling to reduce memory allocations
- Web Worker for CPU-intensive operations
- Lazy loading of audio data
- Throttled real-time updates

### Caching Strategy
- Session manifests cached in localStorage
- Audio waveforms cached in IndexedDB
- Presence state cached for 30 seconds

## Error Handling

**Common Errors:**
- `SESSION_NOT_FOUND`: Invalid session ID
- `INSUFFICIENT_PERMISSIONS`: User lacks access
- `INVALID_MANIFEST`: Corrupt session data
- `CHECKSUM_MISMATCH`: Data integrity error

**Error Recovery:**
```typescript
try {
  const { data, error } = await supabase
    .from('mixxmaster_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();
    
  if (error) throw error;
} catch (error) {
  // Fallback to cached version
  const cached = localStorage.getItem(`session:${sessionId}`);
  if (cached) return JSON.parse(cached);
}
```

## Best Practices

1. **Version Early, Version Often**: Create versions before major changes
2. **Use Checksums**: Always verify manifest integrity
3. **Batch Updates**: Group related changes to reduce database calls
4. **Handle Offline**: Cache sessions for offline work capability
5. **Monitor Performance**: Track audio processing latency

## Rate Limits
- Session creation: 10/minute per user
- Version creation: 20/minute per session
- Export requests: 5/minute per user
- Real-time updates: 100/second per session

## Support
For issues or questions, contact support@mixclubonline.com
