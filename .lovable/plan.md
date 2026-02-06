
## Rebuild the Admin CRM Panel

### Current Situation

The original admin panel (46 pages, 115+ components) was removed during the Launch Control Center split. What remains:
- Your account (`mixclubonline@gmail.com`) already has the `admin` role in the database
- The `has_role` RPC function works
- Auth routing already redirects admins to `/admin`
- Navigation components already define admin nav items (`/admin`, `/admin/users`, `/admin/sessions`, `/admin/analytics`)
- Two surviving admin components: `AdminSeedingPanel` and `PayoutProcessingControl`
- No admin page files exist, and no admin routes are registered

### What Gets Built

A focused, functional Admin CRM that follows the same hub-based architecture as the Artist/Engineer/Producer/Fan CRMs, locked to your email via server-side role validation.

---

### Security Model

Access is enforced at two levels:

1. **Database level** — Your account already has the `admin` role in `user_roles`. The `has_role` RPC function (security definer) validates this server-side. No client-side hacks can bypass it.

2. **Route level** — A new `AdminRoute` wrapper component will:
   - Check authentication (redirect to `/auth` if not logged in)
   - Call `has_role` RPC to verify admin status server-side
   - Show "Access Denied" for non-admin users
   - No email hardcoding in client code — the role in the database IS the source of truth

Your email is already mapped to admin. If you ever need to add another admin, you just insert a row in `user_roles`.

---

### Architecture: Admin CRM Hub Grid

Following the same CRM Portal pattern, the Admin CRM will have these hubs:

| Hub | Icon | Description | Data Source |
|-----|------|-------------|-------------|
| **Dashboard** | LayoutDashboard | Platform overview, key metrics | profiles, user_roles, sessions, payments |
| **Users** | Users | User management, roles, profiles | profiles, user_roles |
| **Sessions** | Headphones | All platform sessions | collaboration_sessions |
| **Revenue** | DollarSign | Payments, payouts, earnings | payments, engineer_payouts, revenue_analytics |
| **Content** | FileText | Audio files, beats, releases | audio_files, producer_beats, music_releases |
| **Community** | Globe | Activity feed, battles, achievements | activity_feed, battles, achievements |
| **Assets** | Image | Dream Engine, brand assets | brand_assets, asset_contexts |
| **System** | Settings | Seeding, payouts, security events | admin_security_events, payout_processing_logs |

---

### Files to Create

| File | Purpose |
|------|---------|
| `src/pages/AdminCRM.tsx` | Main admin CRM page with hub grid |
| `src/components/auth/AdminRoute.tsx` | Server-side admin role verification wrapper |
| `src/components/admin/AdminDashboardHub.tsx` | Platform overview with real database stats |
| `src/components/admin/AdminUsersHub.tsx` | User list with role management |
| `src/components/admin/AdminSessionsHub.tsx` | All platform sessions browser |
| `src/components/admin/AdminRevenueHub.tsx` | Revenue, payouts, financial overview |
| `src/components/admin/AdminContentHub.tsx` | Audio files, beats, releases management |
| `src/components/admin/AdminCommunityHub.tsx` | Activity feed, battles, community stats |
| `src/components/admin/AdminAssetsHub.tsx` | Brand assets and Dream Engine management |
| `src/components/admin/AdminSystemHub.tsx` | Seeding panel, payout processing, security |

### Files to Modify

| File | Changes |
|------|---------|
| `src/routes/appRoutes.tsx` | Add `/admin` route pointing to AdminCRM |
| `src/components/crm/CRMHubGrid.tsx` | Add admin hub definitions |
| `src/components/crm/CRMActivePanel.tsx` | Add admin hub title mappings |
| `src/components/crm/CRMPortal.tsx` | Support admin userType with background/glow |

---

### Technical Details

#### AdminRoute Component

```text
1. Check useAuth() for user existence
2. If not authenticated -> redirect to /auth
3. Call supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' })
4. If not admin -> show "Access Denied" page
5. If admin -> render children
```

No hardcoded emails in client code. The database role is the single source of truth.

#### AdminCRM Page Structure

Follows the same pattern as ArtistCRM/EngineerCRM:
- Uses `CRMPortal` wrapper with `userType="admin"`
- Hub grid with 8 admin-specific hubs
- Each hub renders its dedicated component when selected
- Stats bar shows platform-wide metrics (total users, active sessions, revenue)

#### Admin Dashboard Hub (Real Data)

Queries from actual database tables:
- Total user count from `profiles`
- Active sessions from `collaboration_sessions`
- Revenue totals from `payments`
- Recent signups from `profiles` (ordered by created_at)
- Role distribution from `user_roles`
- Recent activity from `activity_feed`

#### Admin Users Hub

- Paginated user list from `profiles`
- Role badges from `user_roles`
- Search by email/name
- Role assignment (insert/delete on `user_roles`)
- View user details

#### Admin System Hub

- Integrates existing `AdminSeedingPanel` component
- Integrates existing `PayoutProcessingControl` component
- Shows `admin_security_events` log
- Quick actions for common admin tasks

---

### Route Registration

Add to `appRoutes.tsx`:

```text
/admin          -> AdminCRM (wrapped in AdminRoute)
/admin/users    -> AdminCRM with ?tab=users (same page, different hub)
/admin/sessions -> AdminCRM with ?tab=sessions
/admin/revenue  -> AdminCRM with ?tab=revenue
```

All existing navigation components (MobileBottomNav, TabletSideNav, AppSidebar) already point to these paths, so they will work immediately.

---

### CRM Portal Updates

Add admin to the existing type maps in CRMPortal:

- **Background**: Reuse a dark, professional background (or generate a new one via Dream Engine)
- **Glow color**: `hsl(200 80% 50%)` — a distinct blue-cyan for admin
- **Status bar subtitle**: "Platform Command Center"

---

### Rollout Sequence

1. Create `AdminRoute` security wrapper
2. Create `AdminCRM` page with hub grid
3. Build each hub component with real database queries
4. Register routes in `appRoutes.tsx`
5. Update CRM shared components to support admin userType
6. Test login flow end-to-end with your admin account

---

### What This Is NOT

This is not a rebuild of the old 46-page admin system. This is a focused, hub-based Admin CRM that:
- Lives inside the main app (no separate project needed)
- Uses the same CRM Portal architecture as other roles
- Queries real database tables for live platform data
- Is secured by server-side role validation
- Can be extended hub-by-hub as needs grow

The old Launch Control Center docs remain as reference for future expansion.
