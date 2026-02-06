

# Phase 5: Role Selection Gateway

## The Gap

When users sign up via OAuth (Google/Apple), they never see the role selection UI because they bypass the signup form. The `AuthCallback.tsx` currently defaults them to `/onboarding/artist` without choice.

**Current Flow (Broken for OAuth):**
```text
OAuth → AuthCallback → /onboarding/artist (no choice!)
```

**Desired Flow:**
```text
OAuth → AuthCallback → /select-role (choose path) → /onboarding/{role}
```

---

## Implementation

### 1. Create RoleSelectionPage.tsx

A new page at `/select-role` that presents the four-path choice in an immersive, on-brand way:

| Role | Visual | Route After |
|------|--------|-------------|
| Artist | Purple/Pink gradient, Music icon | `/onboarding/artist` |
| Engineer | Cyan/Blue gradient, Headphones icon | `/onboarding/engineer` |
| Producer | Orange/Gold gradient, Disc3 icon | `/onboarding/producer` |
| Fan | Pink/Rose gradient, Heart icon | `/onboarding/fan` |

**Key Features:**
- Full-screen immersive design matching the ClubScene aesthetic
- Animated cards with role descriptions and key benefits
- Keyboard navigation (1-4 keys to select)
- Mobile-friendly with stacked layout
- Pre-inserts role into `user_roles` table on selection
- Shows attribution toast for new signup contribution

**Layout:**
```text
┌─────────────────────────────────────────────────────┐
│           "Choose Your Path in MixClub"            │
│                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │  🎤      │ │  🎧      │ │  🎹      │ │  ❤️    │ │
│  │ Artist   │ │ Engineer │ │ Producer │ │  Fan   │ │
│  │ Create & │ │ Mix &    │ │ Craft &  │ │Discover│ │
│  │ Release  │ │ Earn     │ │ Sell     │ │& Support│
│  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
│                                                     │
│        [Press 1-4 or click to continue]            │
└─────────────────────────────────────────────────────┘
```

---

### 2. Update AuthCallback.tsx

Modify the callback to route to `/select-role` instead of `/onboarding/artist`:

**Changes:**
- Line 50: Change `navigate('/onboarding/artist')` to `navigate('/select-role')`
- Add support for all 4 roles in the routing logic (lines 56-60)

```text
// Current:
if (profile.role === 'engineer') {
  navigate('/engineer-crm');
} else {
  navigate('/artist-crm');  // Catches everything else
}

// After:
switch (profile.role) {
  case 'producer': navigate('/producer-crm'); break;
  case 'engineer': navigate('/engineer-crm'); break;
  case 'fan': navigate('/fan-hub'); break;
  default: navigate('/artist-crm'); break;
}
```

---

### 3. Add Route Definition

Add the new page to the route configuration:

**File:** `src/routes/appRoutes.tsx`

```text
import RoleSelection from "@/pages/RoleSelection";

// In the routes:
<Route path="/select-role" element={<ProtectedRoute><RoleSelection /></ProtectedRoute>} />
```

---

### 4. Update Auth.tsx Role Insertion

Currently Auth.tsx only inserts `artist` or `engineer` roles on email signup:

```text
const roleToInsert = role === "artist" ? "artist" : "engineer";
```

This should respect all 4 roles:

```text
const roleToInsert = role; // Already validated as "artist" | "engineer" | "producer" | "fan"
```

---

## Technical Details

### RoleSelectionPage Component Structure

```text
RoleSelection.tsx
├── Background (immersive gradient matching ClubScene)
├── Header ("Welcome to MixClub City")
├── Role Cards Grid (2x2 on desktop, stacked on mobile)
│   ├── Artist Card (onClick → handleRoleSelect('artist'))
│   ├── Engineer Card (onClick → handleRoleSelect('engineer'))
│   ├── Producer Card (onClick → handleRoleSelect('producer'))
│   └── Fan Card (onClick → handleRoleSelect('fan'))
├── Keyboard Navigation Hook (1-4 keys)
└── handleRoleSelect(role):
    1. Insert into user_roles table
    2. Show attribution toast
    3. Navigate to /onboarding/{role}
```

### Database Operations

On role selection:
```sql
INSERT INTO user_roles (user_id, role) VALUES ($1, $2);
```

This mirrors what Auth.tsx does on email signup.

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/pages/RoleSelection.tsx` | Role gateway page with 4 path options |

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/AuthCallback.tsx` | Route to `/select-role` + fix role routing |
| `src/routes/appRoutes.tsx` | Add `/select-role` route |
| `src/pages/Auth.tsx` | Fix role insertion to support all 4 roles |

---

## User Experience Flow (After Implementation)

### Email Signup:
```text
/auth (signup mode) → Select role in form → /onboarding/{role} → /{role}-crm
```

### OAuth Signup (Google/Apple):
```text
/auth → OAuth redirect → /auth/callback → /select-role → /onboarding/{role} → /{role}-crm
```

### Returning User Login:
```text
/auth (login mode) → /auth/callback → /{role}-crm (based on existing role)
```

---

## Acceptance Criteria

- [ ] New OAuth users see role selection before onboarding
- [ ] All 4 roles (Artist, Engineer, Producer, Fan) are selectable
- [ ] Role is properly inserted into `user_roles` table
- [ ] AuthCallback correctly routes all 4 roles to their CRMs
- [ ] Email signup continues to work with all 4 roles
- [ ] Attribution toast shows on new signup
- [ ] Mobile-friendly layout
- [ ] Keyboard navigation works (1-4 keys)

