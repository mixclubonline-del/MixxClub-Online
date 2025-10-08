# MixxMaster Format Specification v1.0

## Overview

The `.mixxmaster` format is a universal session container designed for cross-DAW collaboration. It packages audio stems, mixing data, plugin chains, and AI analysis into a portable, verifiable format.

## Key Features

- **Cross-DAW Compatibility**: Works with Logic Pro X, FL Studio, Pro Tools, Ableton Live, and more
- **Version Control**: Track changes across session versions with detailed diffs
- **Integrity Verification**: SHA-256 checksums ensure data hasn't been tampered with
- **AI-Powered**: Includes spectral analysis, mixing suggestions, and plugin recommendations
- **Real-time Collaboration**: Multiple engineers can work on the same session simultaneously

## File Structure

### Storage Modes

MixxMaster supports three storage modes:

#### 1. Hybrid Mode (Recommended)
```
project-123/
├── session-abc.mixxmaster.json  # Manifest file
└── stems/
    ├── vocal-1.wav
    ├── drums-1.wav
    └── bass-1.wav
```
- Manifest stored in Supabase database
- Audio stems in Supabase Storage
- Best for cloud collaboration

#### 2. Full Package Mode
```
project-export.mixxmaster/
├── manifest.json
├── stems/
│   ├── vocal-1.wav
│   ├── drums-1.wav
│   └── bass-1.wav
└── metadata/
    └── analysis.json
```
- Self-contained archive
- Ideal for backups and transfers

#### 3. Reference-Only Mode
```json
{
  "version": "1.0",
  "storageMode": "reference_only",
  "audio": {
    "vocals": [
      {
        "id": "vocal-1",
        "name": "Lead Vocal",
        "storagePath": "https://cdn.example.com/stems/vocal-1.wav"
      }
    ]
  }
}
```
- Links to external audio files
- Smallest footprint

## Manifest Schema

### Root Structure

```typescript
interface MixxMasterManifest {
  // Core Metadata
  version: string;              // Format version (e.g., "1.0")
  sessionId: string;            // Unique session identifier
  projectId: string;            // Parent project ID
  createdAt: string;            // ISO 8601 timestamp
  updatedAt: string;            // ISO 8601 timestamp
  
  // Content
  audio: AudioStemCollection;   // All audio stems
  sessionData: SessionData;     // Mix chains, routing, tempo
  metadata: MixxMasterMetadata; // Artist info, version history
  
  // Integrity
  checksum: string;             // SHA-256 hash of entire manifest
}
```

### Audio Stem Collection

Audio stems are organized by category:

```typescript
interface AudioStemCollection {
  vocals: AudioStem[];      // Lead vocals, backing vocals, ad-libs
  drums: AudioStem[];       // Kick, snare, hi-hats, percussion
  instruments: AudioStem[]; // Bass, guitars, keys, synths
  fx: AudioStem[];          // Effects, atmospheres, transitions
}

interface AudioStem {
  id: string;               // Unique stem identifier
  name: string;             // Human-readable name
  storagePath: string;      // Path or URL to audio file
  
  // Technical Specifications
  sampleRate: number;       // Hz (e.g., 44100, 48000, 96000)
  bitDepth: number;         // Bits (16, 24, 32)
  channels: number;         // 1 = mono, 2 = stereo
  duration: number;         // Seconds
  fileSize: number;         // Bytes
  format: string;           // "wav", "aiff", "flac"
  
  // Visualization
  waveformData?: WaveformData;
  
  // Optional Metadata
  color?: string;           // Hex color for UI display
  gain?: number;            // dB adjustment
  pan?: number;             // -1.0 (left) to 1.0 (right)
  muted?: boolean;
  soloed?: boolean;
}
```

### Session Data

```typescript
interface SessionData {
  mixChains: MixChainData;      // Plugin chains per track/bus
  routing: RoutingData;         // Bus configuration & sends
  tempoMap: TempoMapData;       // Tempo, time signature, markers
  aiAnalysis: AIAnalysisData | null; // AI-generated insights
}
```

#### Mix Chains

```typescript
interface MixChainData {
  master: PluginChain;
  [trackId: string]: PluginChain; // Per-track plugin chains
}

interface PluginChain {
  plugins: PluginInstance[];
}

interface PluginInstance {
  id: string;                   // Instance ID
  name: string;                 // Plugin name
  type: string;                 // "equalizer", "compressor", "reverb", etc.
  manufacturer?: string;        // "FabFilter", "Waves", "UAD", etc.
  order: number;                // Position in chain (0-based)
  bypass: boolean;              // Is plugin bypassed?
  
  // Parameters
  parameters: Record<string, any>; // Plugin-specific settings
  
  // DAW-Specific Mappings
  dawMappings?: {
    [daw: string]: DAWPluginMapping;
  };
}
```

#### Routing

```typescript
interface RoutingData {
  buses: BusConfiguration[];
  auxSends: AuxSendConfiguration[];
}

interface BusConfiguration {
  id: string;
  name: string;
  type: 'stereo' | 'mono' | 'surround';
  sends: string[]; // IDs of tracks sending to this bus
}
```

#### Tempo Map

```typescript
interface TempoMapData {
  bpm: number;                  // Beats per minute
  timeSignature: string;        // "4/4", "3/4", "7/8", etc.
  markers: TimeMarker[];        // Section markers
}

interface TimeMarker {
  position: number;             // Seconds or bars
  label: string;                // "Intro", "Verse 1", "Chorus"
  type: 'section' | 'tempo_change' | 'custom';
}
```

### AI Analysis Data

```typescript
interface AIAnalysisData {
  spectralAnalysis: {
    frequencyDistribution: FrequencyBand[];
    harmonicContent: HarmonicAnalysis;
    problematicFrequencies: number[]; // Hz
  };
  
  tonalAnalysis: {
    keySignature: string;       // "C Major", "A Minor"
    scaleType: string;          // "Major", "Minor", "Pentatonic"
    chordProgression: Chord[];
    tempo: number;              // Detected BPM
  };
  
  emotionAnalysis: {
    mood: string;               // "Energetic", "Melancholic", "Uplifting"
    energy: number;             // 0-1
    valence: number;            // 0-1 (negativity to positivity)
  };
  
  mixingSuggestions: MixingSuggestion[];
  pluginRecommendations: PluginRecommendation[];
  
  processingMetadata: {
    modelVersion: string;
    confidence: number;         // 0-1
    processingTime: number;     // Milliseconds
    timestamp: string;          // ISO 8601
  };
}
```

### Metadata

```typescript
interface MixxMasterMetadata {
  artist: string;
  projectName: string;
  genre?: string;
  bpm?: number;
  key?: string;
  
  versionHistory: VersionHistoryEntry[];
  source: {
    daw: string;                // "Logic Pro X", "FL Studio", etc.
    version: string;            // DAW version
  };
  
  tags: string[];               // ["hip-hop", "mixing", "mastering"]
  notes: string;                // Session notes
  
  engineerSignature?: string;   // Base64-encoded signature
}

interface VersionHistoryEntry {
  versionNumber: number;
  timestamp: string;
  engineerId: string;
  changesSummary: string;
  pluginChanges: PluginChange[];
  routingChanges?: any;
  stemChanges?: {
    added: string[];
    removed: string[];
    modified: string[];
  };
}
```

## Checksum Calculation

The checksum ensures data integrity and detects tampering.

### Algorithm

```typescript
async function calculateChecksum(manifest: Omit<MixxMasterManifest, 'checksum'>): Promise<string> {
  // 1. Sort keys alphabetically for deterministic output
  const manifestString = JSON.stringify(manifest, Object.keys(manifest).sort());
  
  // 2. Encode to UTF-8
  const encoder = new TextEncoder();
  const data = encoder.encode(manifestString);
  
  // 3. Calculate SHA-256 hash
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // 4. Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}
```

### Verification

```typescript
async function verifyChecksum(manifest: MixxMasterManifest, providedChecksum: string): Promise<boolean> {
  const { checksum, ...manifestWithoutChecksum } = manifest;
  const calculatedChecksum = await calculateChecksum(manifestWithoutChecksum);
  return calculatedChecksum === providedChecksum;
}
```

## Version Control

MixxMaster tracks changes between versions with detailed diffs.

### Version Diff Structure

```typescript
interface VersionDiff {
  stems: {
    added: AudioStem[];
    removed: string[];    // Stem IDs
    modified: AudioStem[];
  };
  plugins: {
    added: PluginInstance[];
    removed: string[];    // Plugin IDs
    modified: PluginInstance[];
  };
  parameters: {
    [pluginId: string]: {
      [paramName: string]: {
        old: any;
        new: any;
      };
    };
  };
}
```

## DAW Compatibility Guide

### Supported DAWs

- Logic Pro X (10.7+)
- FL Studio (20.9+)
- Pro Tools (2022.12+)
- Ableton Live (11.3+)
- Studio One (6.0+)
- Reaper (6.70+)

### DAW Plugin Mappings

Each plugin in the manifest can include DAW-specific mappings:

```typescript
interface DAWPluginMapping {
  nativePluginId: string;       // DAW's internal plugin identifier
  parameterMap: Record<string, string>; // Generic param → DAW param
  presetData?: string;          // DAW-specific preset blob (base64)
}
```

Example:

```json
{
  "id": "comp-1",
  "name": "Compressor",
  "type": "compressor",
  "parameters": {
    "threshold": -12,
    "ratio": 4,
    "attack": 10,
    "release": 100
  },
  "dawMappings": {
    "Logic Pro X": {
      "nativePluginId": "com.apple.au.compressor",
      "parameterMap": {
        "threshold": "threshold",
        "ratio": "ratio",
        "attack": "attackTime",
        "release": "releaseTime"
      }
    },
    "FL Studio": {
      "nativePluginId": "Fruity Compressor",
      "parameterMap": {
        "threshold": "THRESHOLD",
        "ratio": "RATIO",
        "attack": "ATTACK",
        "release": "RELEASE"
      }
    }
  }
}
```

## Best Practices

### Audio File Formats

**Recommended**: WAV, 24-bit, 48kHz+
- Lossless quality
- Universal compatibility
- Reasonable file sizes

**Also Supported**: AIFF, FLAC
- AIFF: Mac-friendly alternative to WAV
- FLAC: Compressed lossless (smaller files)

**Not Recommended**: MP3, AAC, OGG
- Lossy compression
- Not suitable for professional mixing

### Stem Naming Conventions

```
Good:
- "Lead Vocal - Verse 1"
- "Kick Drum - Processed"
- "Bass - Sub Layer"

Bad:
- "audio_01.wav"
- "Track 3"
- "New Recording"
```

### Plugin Chain Organization

1. **Dynamics First**: Gates, compressors, limiters
2. **Tone Shaping**: EQs, filters
3. **Time-Based**: Delays, reverbs
4. **Modulation**: Chorus, flanger, phaser
5. **Special FX**: Distortion, bit crushing

### Version Control Tips

- Create versions after major mixing milestones
- Write detailed change summaries
- Tag versions (e.g., "rough-mix", "client-review", "final")

## Security Considerations

### Checksum Verification

**Always verify checksums** before importing:

```typescript
const isValid = await MixxMasterValidator.verifyChecksum(manifest, manifest.checksum);
if (!isValid) {
  throw new Error('Checksum verification failed - data may be corrupted or tampered');
}
```

### Engineer Signatures

Optional cryptographic signatures prove session authenticity:

```typescript
const signature = await signManifest(manifest, engineerPrivateKey);
manifest.metadata.engineerSignature = signature;
```

## Error Handling

Common errors and solutions:

| Error | Cause | Solution |
|-------|-------|----------|
| `INVALID_CHECKSUM` | Data corruption or tampering | Re-download session |
| `MISSING_STEMS` | Audio files not found | Check storage paths |
| `UNSUPPORTED_VERSION` | Manifest version too new | Update MixxMaster software |
| `INVALID_PLUGIN_CHAIN` | Malformed plugin data | Validate plugin chain structure |

## Migration Guide

### From v1.0 to v2.0 (Future)

When new versions are released, migration utilities will be provided:

```typescript
import { migrateManifest } from '@/lib/mixxmaster/migrator';

const v2Manifest = await migrateManifest(v1Manifest, '2.0');
```

## Resources

- [Developer Guide](./MIXXMASTER_DEV_GUIDE.md)
- [API Documentation](./MIXXMASTER_API.md)
- [User Guide](./MIXXMASTER_USER_GUIDE.md)
- [Database Schema](./MIXXMASTER_SCHEMA.md)

---

**Specification Version**: 1.0  
**Last Updated**: 2025-10-08  
**Status**: Stable
