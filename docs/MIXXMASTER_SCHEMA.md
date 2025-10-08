# MixxMaster Database Schema

Complete database schema documentation for all MixxMaster tables.

## Overview

MixxMaster uses 6 core tables for session management, version control, and AI analysis:

1. `mixxmaster_sessions` - Main session storage
2. `mixxmaster_stems` - Individual audio stem records
3. `mixxmaster_versions` - Version control history
4. `mixxmaster_ai_metadata` - AI analysis results
5. `plugin_chain_templates` - Reusable plugin chains
6. `daw_plugin_mappings` - Cross-DAW plugin compatibility

## Schema Diagram

```
mixxmaster_sessions (1)
    ├── mixxmaster_stems (N)
    ├── mixxmaster_versions (N)
    └── mixxmaster_ai_metadata (N)

plugin_chain_templates (standalone)
daw_plugin_mappings (standalone)
```

## Tables

### 1. mixxmaster_sessions

Stores the main MixxMaster session manifest and metadata.

```sql
CREATE TABLE mixxmaster_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Manifest data (complete MixxMasterManifest as JSONB)
  manifest_data JSONB NOT NULL,
  
  -- Quick access fields (denormalized for query performance)
  session_name TEXT NOT NULL,
  artist TEXT,
  genre TEXT,
  version_number INTEGER DEFAULT 1,
  format_version TEXT NOT NULL DEFAULT '1.0',
  
  -- Integrity
  checksum TEXT NOT NULL, -- SHA-256 hash
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_format_version CHECK (format_version ~ '^\d+\.\d+(\.\d+)?$')
);

-- Indexes
CREATE INDEX idx_mixxmaster_sessions_project ON mixxmaster_sessions(project_id);
CREATE INDEX idx_mixxmaster_sessions_artist ON mixxmaster_sessions(artist);
CREATE INDEX idx_mixxmaster_sessions_genre ON mixxmaster_sessions(genre);
CREATE INDEX idx_mixxmaster_sessions_checksum ON mixxmaster_sessions(checksum);

-- Enable realtime
ALTER TABLE mixxmaster_sessions REPLICA IDENTITY FULL;
```

**Key Fields**:

- `manifest_data`: Complete JSONB manifest (see [Format Spec](./MIXXMASTER_FORMAT.md))
- `checksum`: SHA-256 hash for integrity verification
- `version_number`: Current version (auto-incremented)
- `format_version`: Semantic version of manifest format

**RLS Policies**:

```sql
-- Users can view sessions for their projects
CREATE POLICY "Users can view their project sessions"
ON mixxmaster_sessions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = mixxmaster_sessions.project_id
    AND (projects.client_id = auth.uid() OR projects.engineer_id = auth.uid())
  )
);

-- Users can create sessions for their projects
CREATE POLICY "Users can create sessions"
ON mixxmaster_sessions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = mixxmaster_sessions.project_id
    AND (projects.client_id = auth.uid() OR projects.engineer_id = auth.uid())
  )
);

-- Users can update sessions they created or for their projects
CREATE POLICY "Users can update their sessions"
ON mixxmaster_sessions FOR UPDATE
USING (
  created_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = mixxmaster_sessions.project_id
    AND (projects.client_id = auth.uid() OR projects.engineer_id = auth.uid())
  )
);
```

**Triggers**:

```sql
-- Auto-update updated_at timestamp
CREATE TRIGGER update_mixxmaster_sessions_updated_at
BEFORE UPDATE ON mixxmaster_sessions
FOR EACH ROW
EXECUTE FUNCTION update_mixxmaster_updated_at();
```

**Example Queries**:

```sql
-- Get session with all details
SELECT * FROM mixxmaster_sessions
WHERE id = 'session-uuid';

-- Search sessions by artist
SELECT id, session_name, artist, genre, created_at
FROM mixxmaster_sessions
WHERE artist ILIKE '%Drake%'
ORDER BY created_at DESC;

-- Get sessions for a project
SELECT * FROM mixxmaster_sessions
WHERE project_id = 'project-uuid'
ORDER BY version_number DESC;

-- Get latest session version
SELECT * FROM mixxmaster_sessions
WHERE project_id = 'project-uuid'
ORDER BY version_number DESC
LIMIT 1;
```

---

### 2. mixxmaster_stems

Individual audio stem records with technical specifications and storage paths.

```sql
CREATE TABLE mixxmaster_stems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES mixxmaster_sessions(id) ON DELETE CASCADE,
  
  -- Identification
  stem_name TEXT NOT NULL,
  stem_category TEXT NOT NULL, -- 'vocals', 'drums', 'instruments', 'fx'
  
  -- Storage
  storage_path TEXT NOT NULL,
  bucket_name TEXT NOT NULL DEFAULT 'audio-files',
  
  -- Technical specs
  sample_rate INTEGER NOT NULL,
  bit_depth INTEGER NOT NULL,
  channels INTEGER NOT NULL DEFAULT 2,
  duration_seconds REAL NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  file_format TEXT NOT NULL, -- 'wav', 'aiff', 'flac'
  
  -- Visualization
  waveform_data JSONB, -- Peak data for visualization
  
  -- Metadata
  color TEXT, -- Hex color for UI
  gain_db REAL DEFAULT 0.0,
  pan REAL DEFAULT 0.0, -- -1.0 (left) to 1.0 (right)
  is_muted BOOLEAN DEFAULT false,
  is_soloed BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_stem_category CHECK (stem_category IN ('vocals', 'drums', 'instruments', 'fx')),
  CONSTRAINT valid_channels CHECK (channels > 0),
  CONSTRAINT valid_sample_rate CHECK (sample_rate > 0),
  CONSTRAINT valid_bit_depth CHECK (bit_depth IN (16, 24, 32)),
  CONSTRAINT valid_pan CHECK (pan >= -1.0 AND pan <= 1.0)
);

-- Indexes
CREATE INDEX idx_mixxmaster_stems_session ON mixxmaster_stems(session_id);
CREATE INDEX idx_mixxmaster_stems_category ON mixxmaster_stems(stem_category);
CREATE INDEX idx_mixxmaster_stems_path ON mixxmaster_stems(storage_path);

-- Enable realtime
ALTER TABLE mixxmaster_stems REPLICA IDENTITY FULL;
```

**Example Queries**:

```sql
-- Get all stems for a session
SELECT * FROM mixxmaster_stems
WHERE session_id = 'session-uuid'
ORDER BY stem_category, stem_name;

-- Get only vocal stems
SELECT * FROM mixxmaster_stems
WHERE session_id = 'session-uuid'
AND stem_category = 'vocals';

-- Calculate total session size
SELECT 
  session_id,
  SUM(file_size_bytes) as total_size_bytes,
  SUM(file_size_bytes) / (1024.0 * 1024.0) as total_size_mb
FROM mixxmaster_stems
WHERE session_id = 'session-uuid'
GROUP BY session_id;
```

---

### 3. mixxmaster_versions

Version control history tracking all changes to sessions.

```sql
CREATE TABLE mixxmaster_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES mixxmaster_sessions(id) ON DELETE CASCADE,
  
  -- Version info
  version_number INTEGER NOT NULL,
  
  -- Changes
  changes_summary TEXT NOT NULL,
  stem_changes JSONB, -- { added: [], removed: [], modified: [] }
  plugin_changes JSONB,
  routing_changes JSONB,
  
  -- Snapshot
  manifest_snapshot JSONB NOT NULL, -- Complete manifest at this version
  checksum TEXT NOT NULL,
  
  -- Attribution
  engineer_id UUID REFERENCES auth.users(id),
  engineer_signature TEXT, -- Optional cryptographic signature
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_session_version UNIQUE(session_id, version_number),
  CONSTRAINT positive_version CHECK (version_number > 0)
);

-- Indexes
CREATE INDEX idx_mixxmaster_versions_session ON mixxmaster_versions(session_id);
CREATE INDEX idx_mixxmaster_versions_engineer ON mixxmaster_versions(engineer_id);
CREATE INDEX idx_mixxmaster_versions_created ON mixxmaster_versions(created_at);

-- Trigger to auto-increment version number
CREATE TRIGGER increment_mixxmaster_version
BEFORE INSERT ON mixxmaster_versions
FOR EACH ROW
EXECUTE FUNCTION increment_mixxmaster_version();
```

**Trigger Function**:

```sql
CREATE OR REPLACE FUNCTION increment_mixxmaster_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version_number := COALESCE(
    (SELECT MAX(version_number) FROM mixxmaster_versions WHERE session_id = NEW.session_id),
    0
  ) + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Example Queries**:

```sql
-- Get version history for a session
SELECT 
  version_number,
  changes_summary,
  engineer_id,
  created_at
FROM mixxmaster_versions
WHERE session_id = 'session-uuid'
ORDER BY version_number DESC;

-- Get specific version
SELECT * FROM mixxmaster_versions
WHERE session_id = 'session-uuid'
AND version_number = 3;

-- Compare two versions (get diff)
SELECT 
  v1.version_number as version_from,
  v2.version_number as version_to,
  v2.stem_changes,
  v2.plugin_changes
FROM mixxmaster_versions v1
JOIN mixxmaster_versions v2 ON v1.session_id = v2.session_id
WHERE v1.session_id = 'session-uuid'
AND v1.version_number = 2
AND v2.version_number = 3;
```

---

### 4. mixxmaster_ai_metadata

AI analysis results from PrimeBot.

```sql
CREATE TABLE mixxmaster_ai_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES mixxmaster_sessions(id) ON DELETE CASCADE,
  
  -- Analysis results (see AIAnalysisData type)
  analysis_results JSONB NOT NULL,
  
  -- Processing metadata
  model_version TEXT NOT NULL DEFAULT 'primebot-v1.0',
  confidence_score REAL,
  processing_time_ms INTEGER,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_confidence CHECK (confidence_score >= 0 AND confidence_score <= 1)
);

-- Indexes
CREATE INDEX idx_mixxmaster_ai_session ON mixxmaster_ai_metadata(session_id);
CREATE INDEX idx_mixxmaster_ai_created ON mixxmaster_ai_metadata(created_at);
CREATE INDEX idx_mixxmaster_ai_model ON mixxmaster_ai_metadata(model_version);
```

**Example Queries**:

```sql
-- Get latest analysis for a session
SELECT * FROM mixxmaster_ai_metadata
WHERE session_id = 'session-uuid'
ORDER BY created_at DESC
LIMIT 1;

-- Get all analyses (to track improvements)
SELECT 
  created_at,
  confidence_score,
  processing_time_ms,
  jsonb_array_length(analysis_results->'mixingSuggestions') as suggestion_count
FROM mixxmaster_ai_metadata
WHERE session_id = 'session-uuid'
ORDER BY created_at DESC;

-- Extract specific analysis data
SELECT 
  analysis_results->'tonalAnalysis'->>'keySignature' as key,
  analysis_results->'tonalAnalysis'->>'tempo' as bpm,
  analysis_results->'emotionAnalysis'->>'mood' as mood
FROM mixxmaster_ai_metadata
WHERE session_id = 'session-uuid'
ORDER BY created_at DESC
LIMIT 1;
```

---

### 5. plugin_chain_templates

Reusable plugin chain templates that users can apply to their tracks.

```sql
CREATE TABLE plugin_chain_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Ownership
  creator_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Template info
  template_name TEXT NOT NULL,
  template_description TEXT,
  category TEXT NOT NULL, -- 'vocal', 'drum', 'master', 'fx'
  
  -- Plugin chain data
  plugin_chain_data JSONB NOT NULL, -- PluginChain structure
  
  -- Marketplace
  is_public BOOLEAN DEFAULT false,
  price_credits INTEGER DEFAULT 0, -- 0 = free
  download_count INTEGER DEFAULT 0,
  rating_average REAL,
  rating_count INTEGER DEFAULT 0,
  
  -- Preview
  thumbnail_url TEXT,
  demo_audio_url TEXT,
  
  -- Tags
  tags TEXT[], -- ['hip-hop', 'vocal', 'autotune']
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_category CHECK (category IN ('vocal', 'drum', 'master', 'fx', 'instrument', 'mix_bus')),
  CONSTRAINT valid_price CHECK (price_credits >= 0),
  CONSTRAINT valid_rating CHECK (rating_average IS NULL OR (rating_average >= 0 AND rating_average <= 5))
);

-- Indexes
CREATE INDEX idx_plugin_templates_creator ON plugin_chain_templates(creator_id);
CREATE INDEX idx_plugin_templates_category ON plugin_chain_templates(category);
CREATE INDEX idx_plugin_templates_public ON plugin_chain_templates(is_public);
CREATE INDEX idx_plugin_templates_downloads ON plugin_chain_templates(download_count DESC);
CREATE INDEX idx_plugin_templates_rating ON plugin_chain_templates(rating_average DESC);
CREATE INDEX idx_plugin_templates_tags ON plugin_chain_templates USING GIN(tags);
```

**Example Queries**:

```sql
-- Browse popular public templates
SELECT 
  id, template_name, category, download_count, rating_average
FROM plugin_chain_templates
WHERE is_public = true
ORDER BY download_count DESC
LIMIT 20;

-- Search templates by tag
SELECT * FROM plugin_chain_templates
WHERE 'vocal' = ANY(tags)
AND is_public = true
ORDER BY rating_average DESC;

-- Get user's templates
SELECT * FROM plugin_chain_templates
WHERE creator_id = 'user-uuid'
ORDER BY created_at DESC;
```

---

### 6. daw_plugin_mappings

Cross-DAW plugin compatibility mappings.

```sql
CREATE TABLE daw_plugin_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Generic plugin info
  generic_plugin_name TEXT NOT NULL,
  generic_plugin_type TEXT NOT NULL, -- 'equalizer', 'compressor', etc.
  
  -- DAW-specific mapping
  daw_name TEXT NOT NULL, -- 'Logic Pro X', 'FL Studio', etc.
  native_plugin_id TEXT NOT NULL,
  native_plugin_name TEXT NOT NULL,
  
  -- Parameter mapping
  parameter_mappings JSONB NOT NULL, -- { generic_param: daw_param }
  
  -- Metadata
  compatibility_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_daw_mapping UNIQUE(generic_plugin_name, daw_name)
);

-- Indexes
CREATE INDEX idx_daw_mappings_generic ON daw_plugin_mappings(generic_plugin_name);
CREATE INDEX idx_daw_mappings_daw ON daw_plugin_mappings(daw_name);
CREATE INDEX idx_daw_mappings_type ON daw_plugin_mappings(generic_plugin_type);
```

**Example Queries**:

```sql
-- Get all mappings for a generic plugin
SELECT * FROM daw_plugin_mappings
WHERE generic_plugin_name = 'Generic Compressor'
ORDER BY daw_name;

-- Get Logic Pro X plugins only
SELECT * FROM daw_plugin_mappings
WHERE daw_name = 'Logic Pro X'
ORDER BY generic_plugin_type, generic_plugin_name;

-- Find equivalent plugin in another DAW
SELECT 
  d2.daw_name,
  d2.native_plugin_name,
  d2.native_plugin_id
FROM daw_plugin_mappings d1
JOIN daw_plugin_mappings d2 ON d1.generic_plugin_name = d2.generic_plugin_name
WHERE d1.daw_name = 'FL Studio'
AND d1.native_plugin_name = 'Fruity Compressor'
AND d2.daw_name = 'Logic Pro X';
```

## Database Functions

### Update Session Timestamp

```sql
CREATE OR REPLACE FUNCTION update_mixxmaster_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Increment Version Number

```sql
CREATE OR REPLACE FUNCTION increment_mixxmaster_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version_number := COALESCE(
    (SELECT MAX(version_number) FROM mixxmaster_versions WHERE session_id = NEW.session_id),
    0
  ) + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## Backup & Maintenance

### Backup Strategy

```sql
-- Daily backup of all MixxMaster tables
pg_dump -t mixxmaster_* -F c > mixxmaster_backup_$(date +%Y%m%d).dump

-- Restore
pg_restore -d database_name mixxmaster_backup_20251008.dump
```

### Cleanup Old Versions

```sql
-- Delete versions older than 1 year (keep at least 10 versions per session)
WITH sessions_to_clean AS (
  SELECT session_id, COUNT(*) as version_count
  FROM mixxmaster_versions
  GROUP BY session_id
  HAVING COUNT(*) > 10
)
DELETE FROM mixxmaster_versions
WHERE id IN (
  SELECT v.id
  FROM mixxmaster_versions v
  JOIN sessions_to_clean s ON v.session_id = s.session_id
  WHERE v.created_at < NOW() - INTERVAL '1 year'
  AND v.version_number < (
    SELECT MAX(version_number) - 10
    FROM mixxmaster_versions
    WHERE session_id = v.session_id
  )
);
```

## Performance Optimization

### Recommended Indexes

All indexes are already included in table definitions above, but here's a summary:

```sql
-- Session queries
CREATE INDEX IF NOT EXISTS idx_mixxmaster_sessions_project ON mixxmaster_sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_mixxmaster_sessions_checksum ON mixxmaster_sessions(checksum);

-- Stem queries
CREATE INDEX IF NOT EXISTS idx_mixxmaster_stems_session ON mixxmaster_stems(session_id);
CREATE INDEX IF NOT EXISTS idx_mixxmaster_stems_category ON mixxmaster_stems(stem_category);

-- Version queries
CREATE INDEX IF NOT EXISTS idx_mixxmaster_versions_session ON mixxmaster_versions(session_id);
CREATE INDEX IF NOT EXISTS idx_mixxmaster_versions_created ON mixxmaster_versions(created_at DESC);

-- AI metadata queries
CREATE INDEX IF NOT EXISTS idx_mixxmaster_ai_session ON mixxmaster_ai_metadata(session_id);
CREATE INDEX IF NOT EXISTS idx_mixxmaster_ai_created ON mixxmaster_ai_metadata(created_at DESC);

-- Template marketplace queries
CREATE INDEX IF NOT EXISTS idx_plugin_templates_downloads ON plugin_chain_templates(download_count DESC);
CREATE INDEX IF NOT EXISTS idx_plugin_templates_rating ON plugin_chain_templates(rating_average DESC);
```

## Migration Scripts

### From v1.0 to v2.0 (Future)

```sql
-- Example migration (when v2.0 is released)
ALTER TABLE mixxmaster_sessions
ADD COLUMN IF NOT EXISTS new_field TEXT;

-- Update existing rows
UPDATE mixxmaster_sessions
SET new_field = 'default_value'
WHERE new_field IS NULL;
```

## Related Documentation

- [Format Specification](./MIXXMASTER_FORMAT.md) - Manifest structure
- [API Documentation](./MIXXMASTER_API.md) - Edge functions
- [Developer Guide](./MIXXMASTER_DEV_GUIDE.md) - Integration guide
- [User Guide](./MIXXMASTER_USER_GUIDE.md) - End-user documentation

---

**Schema Version**: 1.0  
**Last Updated**: 2025-10-08  
**Status**: Production
