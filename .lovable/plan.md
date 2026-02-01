

# Prime Fabric v0 - Flow Spine Implementation Plan

## Overview

Build the foundational **Flow System** (Prime Fabric nervous system) that will govern all navigation and state transitions in MixxClub City. This establishes the architectural law: **No UI component may call `navigate()` directly. All movement must go through `useFlow().setIntent(...)`**.

---

## Architecture Principles

```text
┌─────────────────────────────────────────────────────────────┐
│                       PRIME FABRIC                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    Flow System                       │   │
│  │                                                      │   │
│  │  flowStore.ts ──▶ flowResolver.ts ──▶ Navigation    │   │
│  │       ▲                                              │   │
│  │       │                                              │   │
│  │  useFlow() ◀── flowIntents.ts (Intent Types)        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  UI Layer (CityGates, Auth, Tower) ──▶ setIntent() only     │
└─────────────────────────────────────────────────────────────┘
```

**Flow is a system concern, not a UI concern.**

---

## Implementation Sequence

### 1. Create Core Fabric Directory Structure

**New Directory: `src/core/fabric/`**

Contains the nervous system files that will be harvested to the `fabric-core` branch.

**New File: `src/core/FABRIC_BOUNDARY.md`**

Architectural law document establishing the boundary:
- No UI component may call `navigate()` or modify route state directly
- All movement through MixxClub City must use `useFlow().setIntent(...)`
- Exceptions require explicit documentation and justification

### 2. Define Flow Intents

**New File: `src/core/fabric/flowIntents.ts`**

Define the intent vocabulary - the language of movement through the city:

```text
Intent Types:
├── ENTER_CITY          - First-time gate selection (artist/engineer)
├── ENTER_DISTRICT      - Navigate to a city district
├── ENTER_SESSION       - Join a collaboration session
├── AUTHENTICATE        - Sign in/sign up flow
├── COMPLETE_AUTH       - Auth success, route to destination
├── EXIT_TO_GATE        - Return to city gates
├── GO_BACK             - Browser back navigation
├── SWITCH_ROLE         - Hybrid user role switch
└── DEEP_LINK           - External/share link entry
```

Each intent carries:
- Type identifier
- Payload (role, district, destination, etc.)
- Source context (where the intent originated)
- Priority level (for conflict resolution)

### 3. Create Flow Store

**New File: `src/core/fabric/flowStore.ts`**

Zustand store managing flow state:

**State Shape:**
```text
{
  currentIntent: FlowIntent | null
  pendingIntent: FlowIntent | null
  intentHistory: FlowIntent[]
  resolvedRoute: string | null
  flowState: 'idle' | 'resolving' | 'transitioning' | 'blocked'
  blockingReason: string | null
  userContext: {
    role: 'artist' | 'engineer' | null
    isAuthenticated: boolean
    lastDistrict: string | null
  }
}
```

**Actions:**
- `setIntent(intent)` - Queue a navigation intent
- `resolveIntent()` - Process pending intent through resolver
- `blockFlow(reason)` - Halt flow (e.g., auth required)
- `unblockFlow()` - Resume after block resolved
- `clearIntent()` - Cancel pending intent
- `updateUserContext(ctx)` - Update role/auth state

### 4. Build Flow Resolver

**New File: `src/core/fabric/flowResolver.ts`**

Pure function logic that converts intents to resolved routes:

**Resolution Pipeline:**
1. **Validate Intent** - Check intent type and payload
2. **Check Auth Guard** - Does destination require authentication?
3. **Check Role Guard** - Does destination require specific role?
4. **Resolve Route** - Map intent to actual route path
5. **Trigger Transition** - Execute navigation with proper animation

**Guard System:**
```text
Intent → Auth Check → Role Check → Route Mapping → Navigation
           │              │
           ▼              ▼
      Block + Redirect   Block + Redirect
      to /auth           to role selector
```

### 5. Create useFlow Hook

**New File: `src/core/fabric/useFlow.ts`**

React hook providing Flow API to components:

```text
useFlow() returns:
├── setIntent(type, payload?)     - Primary navigation method
├── currentIntent                 - Active intent
├── flowState                     - Current state
├── isBlocked                     - Boolean for UI feedback
├── blockingReason                - Why flow is blocked
├── userContext                   - Role/auth state
├── canNavigateTo(district)       - Permission check
└── intentHistory                 - Recent navigation
```

**Integration with existing systems:**
- Publishes to `hubEventBus` on intent changes
- Triggers `pulseStore.detectFromRoute()` on navigation
- Respects `prefers-reduced-motion` for transitions

### 6. Refactor Primary Navigation Points

**Modify: `src/pages/city/CityGates.tsx`**
- Replace `navigate()` with `setIntent('ENTER_CITY', { role })`
- Flow resolver handles role storage and tower navigation

**Modify: `src/pages/Auth.tsx`**
- Replace `navigate()` with `setIntent('COMPLETE_AUTH', { destination, role })`
- Flow resolver handles role-based routing

**Modify: `src/pages/city/MixxTechTower.tsx`**
- Replace `navigate()` with `setIntent('ENTER_DISTRICT', { districtId })`
- Quick actions use flow intents

### 7. Add Flow Event Types

**Modify: `src/lib/hubEventBus.ts`**

Add flow-specific event types:
- `flow:intent_set` - Intent queued
- `flow:intent_resolved` - Intent processed successfully
- `flow:intent_blocked` - Intent blocked by guard
- `flow:transition_started` - Navigation animation started
- `flow:transition_completed` - Navigation complete

---

## File Changes Summary

### New Files (5)

```text
src/core/FABRIC_BOUNDARY.md           - Architectural law document
src/core/fabric/flowIntents.ts        - Intent type definitions
src/core/fabric/flowStore.ts          - Zustand flow state store
src/core/fabric/flowResolver.ts       - Intent-to-route resolver
src/core/fabric/useFlow.ts            - React hook for components
```

### Modified Files (4)

```text
src/pages/city/CityGates.tsx          - Use setIntent instead of navigate
src/pages/Auth.tsx                    - Use setIntent instead of navigate
src/pages/city/MixxTechTower.tsx      - Use setIntent instead of navigate
src/lib/hubEventBus.ts                - Add flow event types
```

---

## Technical Details

**Zustand Store Pattern:**
```typescript
export const useFlowStore = create<FlowStore>()(
  subscribeWithSelector((set, get) => ({
    // State
    currentIntent: null,
    // ...
    
    // Actions
    setIntent: (intent) => {
      set({ pendingIntent: intent, flowState: 'resolving' });
      get().resolveIntent();
    },
  }))
);
```

**Intent Type Safety:**
```typescript
type FlowIntentType =
  | 'ENTER_CITY'
  | 'ENTER_DISTRICT'
  | 'AUTHENTICATE'
  | 'COMPLETE_AUTH'
  // ...

interface FlowIntent<T = unknown> {
  type: FlowIntentType;
  payload: T;
  source: string;
  timestamp: number;
  priority: 'low' | 'normal' | 'high';
}
```

**Guard Resolution:**
```typescript
function resolveIntent(intent: FlowIntent, context: UserContext): ResolvedRoute | FlowBlock {
  // Auth guard
  if (requiresAuth(intent) && !context.isAuthenticated) {
    return { blocked: true, reason: 'auth_required', redirect: '/auth' };
  }
  // Role guard
  if (requiresRole(intent) && !hasRole(context, intent.payload.role)) {
    return { blocked: true, reason: 'role_mismatch', redirect: '/city' };
  }
  // Resolve to route
  return { route: mapIntentToRoute(intent), transition: getTransition(intent) };
}
```

**Hub Event Bus Integration:**
```typescript
// Publish on intent set
hubEventBus.publish('flow:intent_set', {
  type: intent.type,
  payload: intent.payload,
  source: intent.source,
}, 'flowStore');
```

---

## What This Unlocks

Once Flow is in place:

1. **Bloom Menu** can hook into `flowIntents` for contextual actions
2. **ALS** can reflect `flowState` for navigation feedback
3. **Desktop app** becomes trivial (Vite + Tauri reads Flow events)
4. **Multi-device Flow sync** becomes possible (shared intent stream)
5. **Analytics** get structured navigation data (intents, not raw URLs)
6. **Guards** become centralized (auth, role, feature flags)

---

## Expected Outcome

The Fabric v0 spine will:

1. Establish `src/core/fabric/` as the nervous system foundation
2. Create the architectural law document for future reference
3. Implement Flow Store with intent-based navigation
4. Refactor the three primary navigation points (Gates, Auth, Tower)
5. Integrate with existing Pulse and Event Bus systems
6. Make navigation harvestable to the `fabric-core` branch

**No visual changes** - this is infrastructure. The UI behaves identically, but navigation now flows through the system instead of being scattered across components.

