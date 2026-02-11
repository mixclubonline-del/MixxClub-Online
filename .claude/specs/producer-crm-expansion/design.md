# Design Document — Producer CRM Expansion (Phases 3–4)

## Overview

Extend the MixxClub Producer CRM with AI-powered features and revenue automation. Phase 3 ("Amplify") integrates AI matching for producers, a beat-to-session pipeline, and producer-branded live studio. Phase 4 ("Orchestrate") delivers an end-to-end AI collaboration pipeline and automatic multi-party revenue splitting with gift-revenue conversion.

**Scope:** 6 new components, 2 new hooks, 3 modified files.

---

## Architecture Design

### System Architecture Diagram

```mermaid
graph TB
    subgraph ProducerCRM["Producer CRM Page"]
        Tabs["Tab Router"]
    end

    subgraph Phase3["Phase 3: Amplify"]
        AIMatchesHub["AIMatchesHub (widened)"]
        BSL["BeatSessionLauncher"]
        PGL["ProducerGoLiveModal"]
        UPM["useProducerMatching hook"]
    end

    subgraph Phase4["Phase 4: Orchestrate"]
        ACP["AICollabPipeline"]
        ASD["AutoSplitDashboard"]
        UASR["useAutoSplitRevenue hook"]
    end

    subgraph SharedServices["Shared Services"]
        Supabase["Supabase DB"]
        Auth["useAuth"]
        ProdBeats["useProducerBeats"]
        PartEarn["usePartnershipEarnings (widened)"]
    end

    subgraph DB["Database Tables"]
        UM["user_matches"]
        PS["partnerships"]
        CS["collaboration_sessions"]
        RS["revenue_splits"]
        PB["producer_beats"]
        SG["stream_gifts"]
        LS["live_streams"]
    end

    Tabs --> AIMatchesHub & BSL & PGL & ACP & ASD

    AIMatchesHub --> UPM
    UPM --> UM & PB
    BSL --> ProdBeats --> PB
    BSL --> CS
    PGL --> ProdBeats
    PGL --> LS

    ACP --> UM & PS & CS
    ASD --> UASR
    UASR --> RS & PS & SG & LS

    PartEarn --> PS & RS

    Auth --> Supabase
```

### Data Flow Diagram

```mermaid
graph LR
    subgraph Matching
        A1[user_matches] -->|scored by genre overlap| A2[useProducerMatching]
        A3[producer_beats] -->|genre list| A2
        A2 --> A4[AIMatchesHub]
    end

    subgraph BeatPipeline
        B1[Published Beats] --> B2[BeatSessionLauncher]
        B2 -->|pre-fill title/BPM/key| B3[collaboration_sessions]
    end

    subgraph LiveStudio
        C1[Published Beats] --> C2[ProducerGoLiveModal]
        C2 -->|featured beat + watermark| C3[live_streams]
    end

    subgraph CollabPipeline
        D1[user_matches] --> D2[AICollabPipeline]
        D2 -->|Step 1: select match| D3[Deal Negotiation]
        D3 -->|Step 2: split + beat| D4[partnerships + sessions]
    end

    subgraph RevenueSplit
        E1[Revenue Event] --> E2[useAutoSplitRevenue]
        E3[stream_gifts] -->|coin aggregation| E2
        E2 -->|compute shares| E4[revenue_splits]
        E4 --> E5[AutoSplitDashboard]
    end
```

---

## Component Design

### AIMatchesHub (widened)

- **Responsibilities:** Display AI match recommendations for all 3 user types
- **Interfaces:** `userType: 'artist' | 'engineer' | 'producer'`
- **Dependencies:** `useAIMatching`, `useProducerMatching` (producer-specific scoring)

### useProducerMatching

- **Responsibilities:** Score artists based on genre overlap with producer's beat catalog
- **Interfaces:** `useProducerMatching(userId?: string) → { data, isLoading, error }`
- **Dependencies:** `user_matches` table, `producer_beats` table via Supabase

### BeatSessionLauncher

- **Responsibilities:** Launch collab sessions directly from beats with pre-filled metadata
- **Interfaces:** Self-contained (uses `useProducerBeats`, `useAuth`)
- **Dependencies:** `producer_beats`, `collaboration_sessions` tables

### ProducerGoLiveModal

- **Responsibilities:** Producer-branded go-live flow with beat selector, watermark, purchase CTA
- **Interfaces:** `open: boolean`, `onOpenChange: (open: boolean) => void`
- **Dependencies:** `useLiveStreamManager`, `useProducerBeats`

### AICollabPipeline

- **Responsibilities:** End-to-end collab orchestration: match → deal → launch
- **Interfaces:** `userType: 'artist' | 'engineer' | 'producer'`
- **Dependencies:** `user_matches`, `partnerships`, `collaboration_sessions`, `useProducerBeats`

### useAutoSplitRevenue

- **Responsibilities:** Automatic multi-party (2/3-way) revenue distribution + gift conversion
- **Interfaces:**
  - `distributeRevenue(partnershipId, totalAmount, source?, description?)` → `DistributionRecord`
  - `distributeGiftRevenue(streamId)` → `GiftRevenueBreakdown`
  - `fetchDistributionHistory()` → sets `distributions` state
- **Dependencies:** `partnerships`, `revenue_splits`, `stream_gifts`, `live_gifts`, `live_streams`

### AutoSplitDashboard

- **Responsibilities:** Visualize auto-split distributions with summary stats and feed
- **Interfaces:** `userType: 'artist' | 'engineer' | 'producer'`
- **Dependencies:** `useAutoSplitRevenue`

---

## Data Model

### Core Data Structures

```typescript
// useProducerMatching return type
interface ProducerMatch {
  matchId: string;
  artistId: string;
  artistName: string;
  avatarUrl?: string;
  matchScore: number;       // 0–100
  genreOverlap: string[];   // shared genres
  matchReason?: string;
}

// useAutoSplitRevenue types
interface SplitParty {
  userId: string;
  role: 'artist' | 'engineer' | 'producer';
  percentage: number;
  amount: number;           // computed: totalAmount × percentage / 100
}

interface DistributionRecord {
  id: string;
  partnershipId: string;
  totalAmount: number;
  parties: SplitParty[];
  source: 'manual' | 'beat_sale' | 'session' | 'gift_revenue' | 'stream';
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
}

interface GiftRevenueBreakdown {
  streamId: string;
  totalCoins: number;
  coinRate: number;         // $0.01 per coin
  totalRevenue: number;
  parties: SplitParty[];
}

// BeatSessionLauncher session_state JSON
interface BeatSessionState {
  beat_id: string;
  beat_title: string;
  beat_bpm?: number;
  beat_key?: string;
  beat_genre?: string;
}
```

### Data Model Diagram

```mermaid
erDiagram
    partnerships {
        uuid id PK
        uuid artist_id FK
        uuid engineer_id FK
        uuid producer_id FK
        int artist_split
        int engineer_split
        int producer_percentage
        float artist_earnings
        float engineer_earnings
        float producer_earnings
        string status
    }

    revenue_splits {
        uuid id PK
        uuid partnership_id FK
        float total_amount
        float artist_percentage
        float engineer_percentage
        string description
        string status
    }

    collaboration_sessions {
        uuid id PK
        uuid host_user_id FK
        string title
        string session_type
        jsonb session_state
        string status
    }

    stream_gifts {
        uuid id PK
        uuid stream_id FK
        uuid gift_id FK
        int quantity
    }

    partnerships ||--o{ revenue_splits : has
    partnerships ||--o{ collaboration_sessions : launches
    live_streams ||--o{ stream_gifts : receives
```

---

## Business Process

### Process 1: AI Collaboration Pipeline (Match → Deal → Launch)

```mermaid
flowchart TD
    A[Producer opens Matches tab] --> B[AICollabPipeline loads user_matches]
    B --> C[Producer selects an artist match]
    C --> D[Deal screen: set split % + attach beat]
    D --> E[Producer sets session title + notes]
    E --> F[Review summary screen]
    F --> G{Launch?}
    G -->|Yes| H[Insert into partnerships table]
    H --> I[Insert into collaboration_sessions table]
    I --> J[Success state: 'Collab Launched!']
    G -->|No| D
```

### Process 2: Auto-Split Revenue Distribution

```mermaid
flowchart TD
    A[Revenue Event Triggered] --> B[distributeRevenue called]
    B --> C[Fetch partnership by ID]
    C --> D[Extract party IDs + split percentages]
    D --> E[Compute each party's amount]
    E --> F[Insert revenue_splits row]
    F --> G[Update partnership earnings columns]
    G --> H[Toast notification + update UI]
```

### Process 3: Gift Revenue Conversion

```mermaid
flowchart TD
    A[Stream ends / manual trigger] --> B[distributeGiftRevenue called]
    B --> C[Aggregate stream_gifts × coin_cost]
    C --> D{Total coins > 0?}
    D -->|No| E[Toast: No gift revenue]
    D -->|Yes| F[Convert coins → dollars at $0.01/coin]
    F --> G{Partnership attached?}
    G -->|Yes| H[Call distributeRevenue with gift_revenue source]
    G -->|No| I[Creator keeps 100%]
```

---

## Error Handling Strategy

| Component | Error Scenario | Handling |
|-----------|---------------|----------|
| `AICollabPipeline` | Match fetch fails | `console.error` + empty state UI |
| `AICollabPipeline` | Partnership/session creation fails | `toast.error` + stay on launch step |
| `BeatSessionLauncher` | Session creation fails | `toast.error` + reset dialog state |
| `ProducerGoLiveModal` | Stream start fails | `toast.error` (inherited from GoLiveModal pattern) |
| `useAutoSplitRevenue` | Partnership not found | Throws → caught → destructive toast |
| `useAutoSplitRevenue` | Revenue split insert fails | Throws → caught → destructive toast |
| `useAutoSplitRevenue` | Gift aggregation fails | Throws → caught → destructive toast |
| `usePartnershipEarnings` | Query fails | `console.error` + sets `error` state |

All DB operations use try/catch with user-facing toasts for failures and console.error for debugging.

---

## Testing Strategy

### Automated Tests

- **TypeScript compilation:** `npx tsc --noEmit` — verified exit 0 across all phases
- **Import resolution:** All new files resolve correctly via `@/` path aliases

### Manual Verification

- Producer CRM → **Matches tab**: AICollabPipeline stepper renders above MatchesHub
- Producer CRM → **Catalog tab**: BeatSessionLauncher renders below ProducerCatalogHub
- Producer CRM → **Earnings tab**: AutoSplitDashboard renders above CollaborativeEarnings
- Producer CRM → **Go Live button**: ProducerGoLiveModal shows Beat Making type + beat selector
- Pipeline flow: select match → set split → attach beat → launch → verify partnership + session rows created

### Integration Verification

- `usePartnershipEarnings` query includes `producer_id` — producers see their partnerships
- `useAutoSplitRevenue.distributeRevenue` correctly reads 3-way splits from partnership row
- `useAutoSplitRevenue.distributeGiftRevenue` aggregates coins and converts at $0.01/coin rate
