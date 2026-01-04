# MixClub Launch Control Center - Setup Guide

## Step 1: Create New Lovable Project

1. Go to [lovable.dev](https://lovable.dev)
2. Create new project named: **"MixClub Launch Control Center"**
3. Wait for project to initialize

## Step 2: Copy Files

Copy files in this order:

### A. Core Setup Files

1. Copy `package.json` from this folder
2. Copy `tailwind.config.ts` from main project
3. Copy `src/index.css` from main project
4. Copy `postcss.config.js` from main project

### B. Supabase Integration

1. Create folder: `src/integrations/supabase/`
2. Copy `supabase-client.ts` as `client.ts`
3. Copy `types.ts` from main project's `src/integrations/supabase/`

### C. UI Components

1. Copy entire `src/components/ui/` folder

### D. Admin Components

1. Copy entire `src/components/admin/` folder

### E. Hooks

Copy these files to `src/hooks/`:

- `useAuth.tsx`
- `useIsMobile.tsx`
- `useMobileDetect.tsx`
- `useToast.ts`
- `use-toast.ts`

### F. Lib Files

Copy to `src/lib/`:

- `utils.ts`
- `queryClient.ts`

### G. Pages

1. Copy `App.tsx` from this folder
2. Copy all Admin\*.tsx files from main project's `src/pages/`
3. Copy `Auth.tsx`, `AuthCallback.tsx`, `NotFound.tsx`, `AuditLog.tsx`

## Step 3: Configure Environment

The Supabase client is pre-configured to connect to:

- **Project ID**: kbbrehnyqpulbxyesril
- **URL**: https://kbbrehnyqpulbxyesril.supabase.co

Both apps share the same:

- Database tables
- Edge functions
- Storage buckets
- Authentication

## Step 4: Test

1. Run the new project
2. Navigate to `/auth` to login
3. Use admin credentials
4. Verify all admin pages load correctly

## Step 5: Cleanup Main Project (Optional)

After confirming Launch Control Center works:

1. Delete all `Admin*.tsx` pages from main project
2. Delete `src/components/admin/` folder
3. Remove admin routes from main `App.tsx`
4. Expected bundle size reduction: ~25-30%

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                   SUPABASE BACKEND                      │
│  Project: kbbrehnyqpulbxyesril                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │
│  │  Database   │ │   Storage   │ │ Edge Functions  │   │
│  │  (shared)   │ │  (shared)   │ │    (shared)     │   │
│  └─────────────┘ └─────────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────┘
              ▲                           ▲
              │                           │
    ┌─────────┴─────────┐       ┌────────┴────────┐
    │                   │       │                 │
    │   MixClub City    │       │ Launch Control  │
    │   (Main App)      │       │    Center       │
    │                   │       │  (Admin App)    │
    │ • Artist features │       │ • User mgmt     │
    │ • Engineer hub    │       │ • Analytics     │
    │ • Marketplace     │       │ • Payouts       │
    │ • Collaboration   │       │ • Security      │
    │                   │       │ • System config │
    └───────────────────┘       └─────────────────┘
```

## Security Considerations

- Launch Control Center should have its own custom domain
- Consider IP whitelisting for production
- Use stronger authentication (2FA) for admin access
- All admin actions are logged in `audit_logs` table
