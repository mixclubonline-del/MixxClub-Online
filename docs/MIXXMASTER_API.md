# MixxMaster API Documentation

Complete API reference for all MixxMaster edge functions.

## Base URL

```
https://htvmkylgrrlaydhdbonl.supabase.co/functions/v1
```

## Authentication

All endpoints require Supabase authentication via Bearer token:

```typescript
headers: {
  'Authorization': `Bearer ${supabaseAnonKey}`,
  'Content-Type': 'application/json'
}
```

## Endpoints

### 1. Create Session

Creates a new MixxMaster session with audio stems and metadata.

**Endpoint**: `POST /mixxmaster-create`

**Request Body**:
```typescript
{
  project_id: string;          // Required: Parent project ID
  stems: Array<{               // Required: Array of audio stems
    name: string;              // Stem name
    storagePath: string;       // Path in Supabase Storage
    fileSize: number;          // File size in bytes
  }>;
  metadata?: {                 // Optional: Session metadata
    artist?: string;
    projectName?: string;
    genre?: string;
    bpm?: number;
    key?: string;
    tags?: string[];
    notes?: string;
  };
  sessionData?: {              // Optional: Mix chains, routing, tempo
    mixChains?: MixChainData;
    routing?: RoutingData;
    tempoMap?: TempoMapData;
  };
}
```

**Response** (200 OK):
```typescript
{
  success: true,
  sessionId: string,           // Unique session identifier
  manifest: MixxMasterManifest // Complete manifest with checksum
}
```

**Error Responses**:
```typescript
// 400 Bad Request
{
  error: "Missing required field: project_id"
}

// 500 Internal Server Error
{
  error: "Failed to create session",
  details: string
}
```

**Example**:
```typescript
const { data, error } = await supabase.functions.invoke('mixxmaster-create', {
  body: {
    project_id: '123e4567-e89b-12d3-a456-426614174000',
    stems: [
      {
        name: 'Lead Vocal.wav',
        storagePath: 'project-123/stems/lead-vocal.wav',
        fileSize: 15728640
      },
      {
        name: 'Drums.wav',
        storagePath: 'project-123/stems/drums.wav',
        fileSize: 20971520
      }
    ],
    metadata: {
      artist: 'Artist Name',
      projectName: 'New Song',
      genre: 'Hip Hop',
      bpm: 140
    }
  }
});
```

---

### 2. Parse/Import Session

Imports a MixxMaster manifest, validates it, and creates a new version.

**Endpoint**: `POST /mixxmaster-parse`

**Request Body**:
```typescript
{
  session_id: string;              // Required: Existing session ID
  manifest: MixxMasterManifest;    // Required: Complete manifest
  engineer_signature?: string;     // Optional: Base64 signature
  changes_summary: string;         // Required: Description of changes
}
```

**Response** (200 OK):
```typescript
{
  success: true,
  sessionId: string,
  versionNumber: number,           // New version number
  diff: {                          // Changes from previous version
    stems: {
      added: AudioStem[];
      removed: string[];           // Stem IDs
      modified: AudioStem[];
    };
  }
}
```

**Error Responses**:
```typescript
// 400 Bad Request
{
  error: "Invalid manifest structure"
}

// 401 Unauthorized
{
  error: "Checksum verification failed"
}

// 404 Not Found
{
  error: "Session not found"
}

// 500 Internal Server Error
{
  error: "Failed to parse manifest",
  details: string
}
```

**Example**:
```typescript
const { data, error } = await supabase.functions.invoke('mixxmaster-parse', {
  body: {
    session_id: '123e4567-e89b-12d3-a456-426614174000',
    manifest: importedManifest,
    engineer_signature: 'YWJjMTIzZGVmNDU2...',
    changes_summary: 'Added compression to vocals, adjusted EQ on drums'
  }
});

console.log(`Created version ${data.versionNumber}`);
console.log('Changes:', data.diff);
```

---

### 3. Export Session

Exports a MixxMaster session with optional audio stems and version selection.

**Endpoint**: `POST /mixxmaster-export`

**Request Body**:
```typescript
{
  session_id: string;          // Required: Session to export
  include_stems?: boolean;     // Optional: Include audio URLs (default: true)
  version_number?: number;     // Optional: Specific version (default: latest)
}
```

**Response** (200 OK):
```typescript
{
  exportPackage: {
    manifest: MixxMasterManifest;  // Complete manifest
    stems?: Array<{                // If include_stems = true
      name: string;
      url: string;                 // Signed download URL (expires in 1 hour)
      size: number;
    }>;
    aiAnalysis?: AIAnalysisData;   // Latest AI analysis if available
    exportedAt: string;            // ISO 8601 timestamp
  }
}
```

**Error Responses**:
```typescript
// 400 Bad Request
{
  error: "Missing required field: session_id"
}

// 404 Not Found
{
  error: "Session not found"
}

// 404 Not Found
{
  error: "Version not found"
}

// 500 Internal Server Error
{
  error: "Failed to export session",
  details: string
}
```

**Example - Export Latest Version**:
```typescript
const { data, error } = await supabase.functions.invoke('mixxmaster-export', {
  body: {
    session_id: '123e4567-e89b-12d3-a456-426614174000',
    include_stems: true
  }
});

// Download manifest
const blob = new Blob([JSON.stringify(data.exportPackage.manifest, null, 2)], {
  type: 'application/json'
});
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'session-export.mixxmaster.json';
a.click();
```

**Example - Export Specific Version**:
```typescript
const { data, error } = await supabase.functions.invoke('mixxmaster-export', {
  body: {
    session_id: '123e4567-e89b-12d3-a456-426614174000',
    version_number: 3,  // Export version 3
    include_stems: false // Manifest only
  }
});
```

---

### 4. AI Analysis (PrimeBot)

Triggers AI-powered analysis of session stems, generating mixing suggestions and plugin recommendations.

**Endpoint**: `POST /primebot-analyze`

**Request Body**:
```typescript
{
  session_id: string;          // Required: Session to analyze
  stems: Array<{               // Required: Stems to analyze
    id: string;
    name: string;
    storagePath: string;
  }>;
}
```

**Response** (200 OK):
```typescript
{
  analysis: {
    spectralAnalysis: {
      frequencyDistribution: Array<{
        band: string;          // "sub", "low", "mid", "high", "air"
        energy: number;        // 0-1
        peakFrequency: number; // Hz
      }>;
      harmonicContent: {
        fundamental: number;   // Hz
        harmonics: number[];   // [2nd, 3rd, 4th, ...]
        thd: number;          // Total Harmonic Distortion (0-1)
      };
      problematicFrequencies: number[]; // Hz values
    };
    tonalAnalysis: {
      keySignature: string;    // "C Major", "A Minor"
      scaleType: string;       // "Major", "Minor", "Pentatonic"
      chordProgression: Array<{
        chord: string;         // "C", "Am", "F", "G"
        duration: number;      // Bars
        confidence: number;    // 0-1
      }>;
      tempo: number;           // Detected BPM
    };
    emotionAnalysis: {
      mood: string;            // "Energetic", "Melancholic", "Uplifting"
      energy: number;          // 0-1
      valence: number;         // 0-1 (negative to positive)
    };
    mixingSuggestions: Array<{
      type: string;            // "eq", "compression", "reverb", etc.
      target: string;          // Stem name
      description: string;
      parameters: object;      // Suggested plugin parameters
      priority: string;        // "high", "medium", "low"
      confidence: number;      // 0-1
    }>;
    pluginRecommendations: Array<{
      pluginName: string;
      manufacturer: string;
      type: string;            // "equalizer", "compressor", etc.
      reason: string;
      confidence: number;      // 0-1
    }>;
    processingMetadata: {
      modelVersion: string;    // "primebot-v1.0"
      confidence: number;      // Overall confidence (0-1)
      processingTime: number;  // Milliseconds
      timestamp: string;       // ISO 8601
    };
  };
  processingTime: number;      // Total processing time (ms)
}
```

**Error Responses**:
```typescript
// 400 Bad Request
{
  error: "Missing required field: session_id"
}

// 404 Not Found
{
  error: "Session not found"
}

// 500 Internal Server Error
{
  error: "Analysis failed",
  details: string
}
```

**Example**:
```typescript
// Get session stems
const { data: session } = await supabase
  .from('mixxmaster_sessions')
  .select('manifest_data')
  .eq('id', sessionId)
  .single();

const manifest = session.manifest_data as MixxMasterManifest;
const allStems = [
  ...manifest.audio.vocals,
  ...manifest.audio.drums,
  ...manifest.audio.instruments,
  ...manifest.audio.fx
];

// Trigger analysis
const { data, error } = await supabase.functions.invoke('primebot-analyze', {
  body: {
    session_id: sessionId,
    stems: allStems.map(stem => ({
      id: stem.id,
      name: stem.name,
      storagePath: stem.storagePath
    }))
  }
});

console.log('Analysis complete in', data.processingTime, 'ms');
console.log('Key:', data.analysis.tonalAnalysis.keySignature);
console.log('Suggestions:', data.analysis.mixingSuggestions.length);
```

---

## Rate Limits

| Endpoint | Rate Limit | Note |
|----------|-----------|------|
| `/mixxmaster-create` | 10 req/min | Per user |
| `/mixxmaster-parse` | 20 req/min | Per user |
| `/mixxmaster-export` | 30 req/min | Per user |
| `/primebot-analyze` | 5 req/min | AI processing intensive |

## Error Handling

All endpoints follow consistent error format:

```typescript
{
  error: string,      // Human-readable error message
  code?: string,      // Error code (e.g., "INVALID_CHECKSUM")
  details?: any       // Additional error context
}
```

### Common HTTP Status Codes

- `200 OK` - Success
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Authentication failed
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

## Best Practices

### 1. Error Handling

```typescript
try {
  const { data, error } = await supabase.functions.invoke('mixxmaster-create', {
    body: { /* ... */ }
  });
  
  if (error) {
    // Edge function returned an error
    if (error.code === 'INVALID_CHECKSUM') {
      // Handle checksum error
    } else if (error.code === 'MISSING_STEM') {
      // Handle missing stem
    } else {
      // Generic error
    }
  }
  
  return data;
} catch (err) {
  // Network or other error
  console.error('Request failed:', err);
}
```

### 2. Retry Logic

```typescript
async function invokeWithRetry(
  functionName: string,
  body: any,
  maxRetries: number = 3
) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const { data, error } = await supabase.functions.invoke(functionName, { body });
      
      if (!error) return data;
      
      // Don't retry 4xx errors
      if (error.status >= 400 && error.status < 500) {
        throw error;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    } catch (err) {
      if (i === maxRetries - 1) throw err;
    }
  }
}
```

### 3. Progress Tracking

```typescript
async function createSessionWithProgress(
  projectId: string,
  stems: File[],
  onProgress: (progress: number) => void
) {
  onProgress(0);
  
  // Upload stems (60% of progress)
  const uploadedStems = [];
  for (let i = 0; i < stems.length; i++) {
    const stem = await uploadStem(stems[i]);
    uploadedStems.push(stem);
    onProgress(60 * (i + 1) / stems.length);
  }
  
  // Create session (remaining 40%)
  onProgress(60);
  const { data } = await supabase.functions.invoke('mixxmaster-create', {
    body: { project_id: projectId, stems: uploadedStems }
  });
  onProgress(100);
  
  return data;
}
```

### 4. Caching AI Analysis

```typescript
async function getOrAnalyzeSession(sessionId: string) {
  // Check if analysis exists
  const { data: existing } = await supabase
    .from('mixxmaster_ai_metadata')
    .select('analysis_results')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (existing && isAnalysisRecent(existing.created_at)) {
    return existing.analysis_results;
  }
  
  // Trigger new analysis
  const { data } = await supabase.functions.invoke('primebot-analyze', {
    body: { session_id: sessionId, stems: /* ... */ }
  });
  
  return data.analysis;
}

function isAnalysisRecent(timestamp: string, maxAge: number = 24 * 60 * 60 * 1000) {
  return Date.now() - new Date(timestamp).getTime() < maxAge;
}
```

## SDK Support

### JavaScript/TypeScript (Official)

```bash
npm install @supabase/supabase-js
```

### Python (Community)

```python
from supabase import create_client

client = create_client(SUPABASE_URL, SUPABASE_KEY)
response = client.functions.invoke('mixxmaster-create', {
  'body': { 'project_id': '...', 'stems': [...] }
})
```

### Go (Community)

```go
import "github.com/supabase/supabase-go"

client := supabase.NewClient(SUPABASE_URL, SUPABASE_KEY)
response, err := client.Functions.Invoke("mixxmaster-create", map[string]interface{}{
  "project_id": "...",
  "stems": []map[string]interface{}{...},
})
```

## Webhooks (Future)

Future versions will support webhooks for asynchronous notifications:

```typescript
// Subscribe to session events
POST /mixxmaster-webhooks/subscribe
{
  "events": ["session.created", "version.created", "analysis.completed"],
  "url": "https://your-app.com/webhook"
}

// Webhook payload
{
  "event": "analysis.completed",
  "sessionId": "...",
  "timestamp": "2025-10-08T12:00:00Z",
  "data": { /* analysis results */ }
}
```

## Versioning

Current API version: **v1**

Breaking changes will be released as new versions (v2, v3, etc.) with backward compatibility maintained for at least 6 months.

## Support

- [Developer Guide](./MIXXMASTER_DEV_GUIDE.md)
- [Format Specification](./MIXXMASTER_FORMAT.md)
- GitHub Issues: [Report bugs](https://github.com/your-repo/issues)
- Discord: [Join community](https://discord.gg/your-server)

---

**Last Updated**: 2025-10-08  
**API Version**: v1
