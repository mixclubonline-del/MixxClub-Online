# MixxMaster Developer Guide

Complete guide for integrating MixxMaster into your audio engineering platform.

## Table of Contents

1. [Installation & Setup](#installation--setup)
2. [Creating Sessions](#creating-sessions)
3. [Importing/Exporting](#importingexporting)
4. [Working with Edge Functions](#working-with-edge-functions)
5. [Real-time Collaboration](#real-time-collaboration)
6. [AI Analysis Integration](#ai-analysis-integration)
7. [Plugin Chain Templates](#plugin-chain-templates)
8. [Error Handling](#error-handling)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

## Installation & Setup

### Prerequisites

```bash
# Node.js 18+
node --version

# Supabase CLI (for local development)
npm install -g supabase

# Install dependencies
npm install
```

### Environment Variables

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

### Database Setup

The MixxMaster schema is automatically applied via migrations. To verify:

```bash
supabase db pull
```

Required tables:
- `mixxmaster_sessions`
- `mixxmaster_stems`
- `mixxmaster_versions`
- `mixxmaster_ai_metadata`
- `plugin_chain_templates`
- `daw_plugin_mappings`

## Creating Sessions

### Basic Session Creation

```typescript
import { supabase } from '@/integrations/supabase/client';
import { MixxMasterValidator } from '@/lib/mixxmaster/validator';

async function createMixxMasterSession(projectId: string, stems: File[]) {
  // 1. Upload audio stems to storage
  const uploadedStems = await Promise.all(
    stems.map(async (file) => {
      const stemPath = `${projectId}/stems/${file.name}`;
      const { error } = await supabase.storage
        .from('audio-files')
        .upload(stemPath, file);
      
      if (error) throw error;
      
      return {
        name: file.name,
        storagePath: stemPath,
        fileSize: file.size
      };
    })
  );
  
  // 2. Call edge function to create session
  const { data, error } = await supabase.functions.invoke('mixxmaster-create', {
    body: {
      project_id: projectId,
      stems: uploadedStems,
      metadata: {
        artist: 'Artist Name',
        projectName: 'Project Name',
        genre: 'Hip Hop'
      }
    }
  });
  
  if (error) throw error;
  
  return data;
}
```

### Advanced: With Plugin Chains

```typescript
const pluginChain = {
  master: {
    plugins: [
      {
        id: 'eq-master',
        name: 'FabFilter Pro-Q 3',
        type: 'equalizer',
        manufacturer: 'FabFilter',
        order: 0,
        bypass: false,
        parameters: {
          bands: [
            { frequency: 80, gain: -3, q: 1.0, type: 'high-pass' },
            { frequency: 5000, gain: 2, q: 0.7, type: 'bell' }
          ]
        }
      },
      {
        id: 'comp-master',
        name: 'Waves SSL G-Master',
        type: 'compressor',
        manufacturer: 'Waves',
        order: 1,
        bypass: false,
        parameters: {
          threshold: -12,
          ratio: 4,
          attack: 10,
          release: 100
        }
      }
    ]
  }
};

const { data } = await supabase.functions.invoke('mixxmaster-create', {
  body: {
    project_id: projectId,
    stems: uploadedStems,
    metadata: { /* ... */ },
    sessionData: {
      mixChains: pluginChain,
      routing: { buses: [], auxSends: [] },
      tempoMap: { bpm: 120, timeSignature: '4/4', markers: [] }
    }
  }
});
```

## Importing/Exporting

### Export Session

```typescript
async function exportSession(sessionId: string, includeStems: boolean = true) {
  const { data, error } = await supabase.functions.invoke('mixxmaster-export', {
    body: {
      session_id: sessionId,
      include_stems: includeStems
    }
  });
  
  if (error) throw error;
  
  // Download the export package
  const blob = new Blob([JSON.stringify(data.exportPackage, null, 2)], {
    type: 'application/json'
  });
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `session-${sessionId}.mixxmaster.json`;
  a.click();
  URL.revokeObjectURL(url);
}
```

### Import Session

```typescript
async function importSession(file: File) {
  // 1. Read and parse file
  const text = await file.text();
  const manifest = JSON.parse(text);
  
  // 2. Validate manifest structure
  const isValid = MixxMasterValidator.validateManifest(manifest);
  if (!isValid) {
    throw new Error('Invalid manifest format');
  }
  
  // 3. Verify checksum
  const checksumValid = await MixxMasterValidator.verifyChecksum(
    manifest,
    manifest.checksum
  );
  if (!checksumValid) {
    throw new Error('Checksum verification failed');
  }
  
  // 4. Call parse endpoint
  const { data, error } = await supabase.functions.invoke('mixxmaster-parse', {
    body: {
      session_id: manifest.sessionId,
      manifest: manifest,
      engineer_signature: 'optional-signature',
      changes_summary: 'Imported from external source'
    }
  });
  
  if (error) throw error;
  
  return data;
}
```

### Export Specific Version

```typescript
const { data } = await supabase.functions.invoke('mixxmaster-export', {
  body: {
    session_id: sessionId,
    version_number: 3, // Export version 3 specifically
    include_stems: true
  }
});
```

## Working with Edge Functions

### Available Edge Functions

#### 1. mixxmaster-create

Creates a new MixxMaster session.

```typescript
const { data, error } = await supabase.functions.invoke('mixxmaster-create', {
  body: {
    project_id: string,
    stems: Array<{
      name: string,
      storagePath: string,
      fileSize: number
    }>,
    metadata?: {
      artist: string,
      projectName: string,
      genre?: string
    },
    sessionData?: SessionData
  }
});

// Response:
{
  success: boolean,
  sessionId: string,
  manifest: MixxMasterManifest
}
```

#### 2. mixxmaster-parse

Imports a manifest and creates a new version.

```typescript
const { data, error } = await supabase.functions.invoke('mixxmaster-parse', {
  body: {
    session_id: string,
    manifest: MixxMasterManifest,
    engineer_signature?: string,
    changes_summary: string
  }
});

// Response:
{
  success: boolean,
  sessionId: string,
  versionNumber: number,
  diff: VersionDiff
}
```

#### 3. mixxmaster-export

Exports a session with optional stems.

```typescript
const { data, error } = await supabase.functions.invoke('mixxmaster-export', {
  body: {
    session_id: string,
    include_stems?: boolean, // default: true
    version_number?: number  // optional: specific version
  }
});

// Response:
{
  exportPackage: {
    manifest: MixxMasterManifest,
    stems?: Array<{ name: string, url: string }>,
    aiAnalysis?: AIAnalysisData,
    exportedAt: string
  }
}
```

#### 4. primebot-analyze

Triggers AI analysis on session stems.

```typescript
const { data, error } = await supabase.functions.invoke('primebot-analyze', {
  body: {
    session_id: string,
    stems: Array<{
      id: string,
      name: string,
      storagePath: string
    }>
  }
});

// Response:
{
  analysis: AIAnalysisData,
  processingTime: number
}
```

### Error Handling

```typescript
try {
  const { data, error } = await supabase.functions.invoke('mixxmaster-create', {
    body: { /* ... */ }
  });
  
  if (error) {
    // Edge function returned an error
    console.error('Edge function error:', error);
    throw error;
  }
  
  return data;
} catch (err) {
  // Network or other error
  console.error('Request failed:', err);
  throw err;
}
```

## Real-time Collaboration

### Subscribe to Session Updates

```typescript
import { useMixxMasterRealtime } from '@/hooks/useMixxMasterRealtime';

function SessionView({ sessionId }: { sessionId: string }) {
  const { session, isConnected } = useMixxMasterRealtime(sessionId);
  
  return (
    <div>
      <div>Connection: {isConnected ? 'Connected' : 'Disconnected'}</div>
      <div>Last Update: {session?.lastUpdate}</div>
      <div>Active Users: {session?.activeUsers.length}</div>
    </div>
  );
}
```

### Manual Realtime Subscription

```typescript
import { supabase } from '@/integrations/supabase/client';

const channel = supabase
  .channel(`mixxmaster-session-${sessionId}`)
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'mixxmaster_sessions',
      filter: `id=eq.${sessionId}`
    },
    (payload) => {
      console.log('Session updated:', payload.new);
      // Update UI with new data
    }
  )
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'mixxmaster_versions',
      filter: `session_id=eq.${sessionId}`
    },
    (payload) => {
      console.log('New version created:', payload.new);
      // Notify user of new version
    }
  )
  .subscribe();

// Cleanup
return () => {
  supabase.removeChannel(channel);
};
```

### Presence Tracking

```typescript
import { useRealtimePresence } from '@/hooks/useRealtimePresence';

function CollaborationView({ sessionId }: { sessionId: string }) {
  const { presence, updatePresence } = useRealtimePresence(`session-${sessionId}`);
  
  useEffect(() => {
    updatePresence({
      user_id: currentUserId,
      user_name: currentUserName,
      cursor_position: { x: 0, y: 0 },
      current_track: 'Lead Vocal'
    });
  }, []);
  
  return (
    <div>
      {presence.map((user) => (
        <div key={user.user_id}>
          {user.user_name} - working on {user.current_track}
        </div>
      ))}
    </div>
  );
}
```

## AI Analysis Integration

### Trigger Analysis

```typescript
async function analyzeSession(sessionId: string) {
  // 1. Get session stems
  const { data: session } = await supabase
    .from('mixxmaster_sessions')
    .select('manifest_data')
    .eq('id', sessionId)
    .single();
  
  const manifest = session.manifest_data as MixxMasterManifest;
  const stems = [
    ...manifest.audio.vocals,
    ...manifest.audio.drums,
    ...manifest.audio.instruments,
    ...manifest.audio.fx
  ];
  
  // 2. Call analysis endpoint
  const { data, error } = await supabase.functions.invoke('primebot-analyze', {
    body: {
      session_id: sessionId,
      stems: stems.map(stem => ({
        id: stem.id,
        name: stem.name,
        storagePath: stem.storagePath
      }))
    }
  });
  
  if (error) throw error;
  
  return data.analysis;
}
```

### Display AI Suggestions

```typescript
function AISuggestions({ sessionId }: { sessionId: string }) {
  const [suggestions, setSuggestions] = useState<MixingSuggestion[]>([]);
  
  useEffect(() => {
    fetchSuggestions();
  }, [sessionId]);
  
  async function fetchSuggestions() {
    const { data } = await supabase
      .from('ai_mixing_suggestions')
      .select('*')
      .eq('session_id', sessionId)
      .eq('applied', false)
      .order('confidence_score', { ascending: false });
    
    setSuggestions(data || []);
  }
  
  async function applySuggestion(suggestionId: string) {
    await supabase
      .from('ai_mixing_suggestions')
      .update({ applied: true, applied_at: new Date().toISOString() })
      .eq('id', suggestionId);
    
    fetchSuggestions();
  }
  
  return (
    <div>
      {suggestions.map(suggestion => (
        <div key={suggestion.id}>
          <h4>{suggestion.suggestion_title}</h4>
          <p>{suggestion.suggestion_description}</p>
          <button onClick={() => applySuggestion(suggestion.id)}>
            Apply
          </button>
        </div>
      ))}
    </div>
  );
}
```

## Plugin Chain Templates

### Create Template

```typescript
async function createPluginTemplate(
  name: string,
  pluginChain: PluginChain,
  category: string
) {
  const { data, error } = await supabase
    .from('plugin_chain_templates')
    .insert({
      creator_id: userId,
      template_name: name,
      plugin_chain_data: pluginChain,
      category: category,
      is_public: false
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}
```

### Browse Templates

```typescript
async function browseTemplates(category?: string) {
  let query = supabase
    .from('plugin_chain_templates')
    .select('*')
    .eq('is_public', true)
    .order('download_count', { ascending: false });
  
  if (category) {
    query = query.eq('category', category);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
}
```

### Apply Template

```typescript
async function applyTemplate(templateId: string, sessionId: string) {
  // 1. Get template
  const { data: template } = await supabase
    .from('plugin_chain_templates')
    .select('plugin_chain_data')
    .eq('id', templateId)
    .single();
  
  // 2. Update session with template's plugin chain
  const { data: session } = await supabase
    .from('mixxmaster_sessions')
    .select('manifest_data')
    .eq('id', sessionId)
    .single();
  
  const manifest = session.manifest_data as MixxMasterManifest;
  manifest.sessionData.mixChains = template.plugin_chain_data;
  
  // 3. Save updated manifest
  await supabase
    .from('mixxmaster_sessions')
    .update({ manifest_data: manifest })
    .eq('id', sessionId);
  
  // 4. Increment download count
  await supabase.rpc('increment_template_downloads', {
    template_id: templateId
  });
}
```

## Error Handling

### Common Error Patterns

```typescript
// 1. Checksum Verification Failure
try {
  const isValid = await MixxMasterValidator.verifyChecksum(manifest, checksum);
  if (!isValid) {
    throw new MixxMasterError(
      'Checksum verification failed',
      'INVALID_CHECKSUM',
      { sessionId: manifest.sessionId }
    );
  }
} catch (error) {
  if (error instanceof MixxMasterError) {
    console.error(`${error.code}: ${error.message}`, error.details);
    // Show user-friendly error message
  }
}

// 2. Missing Stems
try {
  const { data: stemExists } = await supabase.storage
    .from('audio-files')
    .list(stemPath);
  
  if (!stemExists || stemExists.length === 0) {
    throw new MixxMasterError(
      'Audio stem not found',
      'MISSING_STEM',
      { stemPath }
    );
  }
} catch (error) {
  // Handle missing stem error
}

// 3. Version Conflict
try {
  const { error } = await supabase.functions.invoke('mixxmaster-parse', {
    body: { /* ... */ }
  });
  
  if (error?.message.includes('version conflict')) {
    throw new MixxMasterError(
      'Version conflict detected',
      'VERSION_CONFLICT',
      { sessionId }
    );
  }
} catch (error) {
  // Resolve conflict or notify user
}
```

### Error Types

```typescript
class MixxMasterError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'MixxMasterError';
  }
}

// Error codes:
// - INVALID_CHECKSUM
// - MISSING_STEM
// - VERSION_CONFLICT
// - INVALID_MANIFEST
// - STORAGE_ERROR
// - NETWORK_ERROR
// - VALIDATION_ERROR
```

## Testing

### Unit Tests

```bash
npm run test
```

### Integration Tests

```bash
npm run test:integration
```

### Example Test

```typescript
import { describe, it, expect } from 'vitest';
import { MixxMasterValidator } from '@/lib/mixxmaster/validator';

describe('MixxMasterValidator', () => {
  it('should validate correct manifest', () => {
    const validManifest = { /* ... */ };
    expect(() => MixxMasterValidator.validateManifest(validManifest)).not.toThrow();
  });
});
```

## Troubleshooting

### Common Issues

**Issue**: Checksum always fails
```typescript
// Solution: Ensure consistent JSON serialization
const manifestString = JSON.stringify(manifest, Object.keys(manifest).sort());
```

**Issue**: Real-time updates not received
```typescript
// Solution: Check table replication status
await supabase
  .from('mixxmaster_sessions')
  .select('id')
  .limit(1); // This triggers replication setup
```

**Issue**: Large file uploads fail
```typescript
// Solution: Upload in chunks
const chunkSize = 5 * 1024 * 1024; // 5MB chunks
for (let i = 0; i < file.size; i += chunkSize) {
  const chunk = file.slice(i, i + chunkSize);
  await uploadChunk(chunk, i);
}
```

### Debug Mode

```typescript
// Enable verbose logging
localStorage.setItem('mixxmaster_debug', 'true');

// Check logs
console.log(localStorage.getItem('mixxmaster_logs'));
```

### Support

- [GitHub Issues](https://github.com/your-repo/issues)
- [Discord Community](https://discord.gg/your-server)
- Email: support@example.com

## Best Practices

1. **Always verify checksums** before importing
2. **Handle errors gracefully** with user-friendly messages
3. **Use TypeScript** for type safety
4. **Test edge cases** (missing stems, corrupt data, etc.)
5. **Implement retry logic** for network failures
6. **Cache AI analysis results** to reduce API calls
7. **Compress audio stems** for faster uploads
8. **Version your manifests** for backward compatibility

## Next Steps

- [API Documentation](./MIXXMASTER_API.md)
- [Format Specification](./MIXXMASTER_FORMAT.md)
- [User Guide](./MIXXMASTER_USER_GUIDE.md)
- [Database Schema](./MIXXMASTER_SCHEMA.md)

---

**Last Updated**: 2025-10-08  
**Version**: 1.0
