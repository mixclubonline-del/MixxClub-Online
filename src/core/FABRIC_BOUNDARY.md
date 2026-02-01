# Prime Fabric Boundary

## The Law

**No UI component may call `navigate()` or modify route state directly.**

All movement through MixxClub City must be done via:

```typescript
useFlow().setIntent(...)
```

## Reason

Flow is a **system concern**, not a **UI concern**.

Navigation decisions must flow through the Fabric layer where:
- Guards can validate auth/role requirements
- Transitions can be coordinated
- Analytics can capture structured intent data
- The Bloom Menu and ALS can react to flow state

## Architecture

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

## Exceptions

Any direct navigation calls require:
1. Explicit documentation in code comments
2. Justification for why Flow cannot be used
3. Approval from Prime Fabric maintainers

## Migration Path

Legacy `navigate()` calls should be refactored to:

```typescript
// Before
const navigate = useNavigate();
navigate('/city/tower');

// After
const { setIntent } = useFlow();
setIntent('ENTER_DISTRICT', { districtId: 'tower' });
```

## What This Unlocks

1. **Bloom Menu** hooks into `flowIntents` for contextual actions
2. **ALS** reflects `flowState` for navigation feedback
3. **Desktop app** becomes trivial (Vite + Tauri reads Flow events)
4. **Multi-device Flow sync** becomes possible (shared intent stream)
5. **Analytics** get structured navigation data (intents, not raw URLs)
6. **Guards** become centralized (auth, role, feature flags)
