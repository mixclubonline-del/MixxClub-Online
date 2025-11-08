# Phase 2: Database Deployment Guide

## Current Status

✅ **Database Migration Ready**  
✅ **All SQL Files Prepared**  
⏳ **Awaiting Deployment**

---

## 🚀 Deployment Steps

### Option 1: Deploy via Supabase CLI (Recommended)

```bash
# 1. Ensure you have SUPABASE_ACCESS_TOKEN set
export SUPABASE_ACCESS_TOKEN="your_access_token_here"

# 2. Link your project
cd /Users/mixxclub/raven-mix-ai
npx supabase link --project-ref htvmkylgrrlaydhdbonl

# 3. Push the migration
npx supabase db push
```

**To get your access token:**

1. Visit: <https://supabase.com/dashboard/account/tokens>
2. Create a new token or copy existing one
3. Set environment variable: `export SUPABASE_ACCESS_TOKEN="your_token"`

---

### Option 2: Deploy via Supabase Web Dashboard (Manual)

1. **Go to Supabase Dashboard**
   - <https://supabase.com/dashboard/project/htvmkylgrrlaydhdbonl>

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in left sidebar

3. **Copy Migration SQL**
   - Open: `/supabase/migrations/20251107_create_partnerships.sql`
   - Copy entire contents

4. **Execute in Supabase**
   - Paste into SQL Editor
   - Click "Run"
   - Wait for completion

---

### Option 3: Deploy via Direct Database Connection

```bash
# 1. Get your database connection string from Supabase
# Visit: https://supabase.com/dashboard/project/htvmkylgrrlaydhdbonl/settings/database

# 2. Connect via psql
psql "postgresql://[user]:[password]@[host]:[port]/postgres"

# 3. Copy and paste migration file contents
# File: /supabase/migrations/20251107_create_partnerships.sql
```

---

## 📋 What Gets Deployed

### 8 Tables Created

1. **partnerships** - Core partnership agreements
2. **collaborative_projects** - Projects within partnerships
3. **revenue_splits** - Revenue distribution records
4. **payment_links** - Shareable payment links
5. **project_milestones** - Project milestones and deliverables
6. **message_revenue_links** - Links messages to revenue
7. **partnership_metrics** - Denormalized analytics
8. **partnership_health** - Health scores and assessments

### 18 Performance Indexes

- Composite pair indexes for fast partnership lookups
- Status indexes for filtering
- Date indexes for sorting
- Foreign key indexes for joins

### 8 Row Level Security Policies

- All tables secured with auth.uid() validation
- Cross-user data access prevented
- Write permissions enforced

### 3 Helper Functions

- `get_partnership_metrics(user_id)`
- `calculate_partnership_health(partnership_id)`
- Auto-update trigger on revenue insertion

---

## ✅ Verification Steps

After deployment, verify success:

### 1. Check Tables Exist

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'partnership%' OR table_name = 'revenue_splits' OR table_name = 'payment_links' OR table_name = 'collaborative_projects' OR table_name = 'project_milestones' OR table_name = 'message_revenue_links';
```

Expected output:

```
partnership_health
partnership_metrics
partnerships
payment_links
project_milestones
message_revenue_links
revenue_splits
collaborative_projects
```

### 2. Check Indexes Created

```sql
SELECT indexname 
FROM pg_indexes 
WHERE tablename LIKE 'partnership%' OR tablename IN ('revenue_splits', 'payment_links', 'collaborative_projects', 'project_milestones', 'message_revenue_links');
```

Expected: 18 indexes

### 3. Check RLS Policies

```sql
SELECT * FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename LIKE 'partnership%' OR tablename IN ('revenue_splits', 'payment_links', 'collaborative_projects', 'project_milestones', 'message_revenue_links');
```

Expected: 8 policies

### 4. Check Functions

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND (routine_name LIKE '%partnership%' OR routine_name LIKE '%revenue%');
```

Expected functions:

- `get_partnership_metrics`
- `calculate_partnership_health`
- `trigger_update_partnership_revenue` (as trigger function)

---

## 🔧 If Something Goes Wrong

### Issue: "Cannot connect to Supabase"

**Solution:**

- Check internet connection
- Verify project_ref is correct: `htvmkylgrrlaydhdbonl`
- Confirm you have access to the project

### Issue: "Access token not provided"

**Solution:**

- Get token from: <https://supabase.com/dashboard/account/tokens>
- Set: `export SUPABASE_ACCESS_TOKEN="your_token"`

### Issue: "Migration already applied"

**Solution:**

- Run: `npx supabase migration list`
- Verify migration is listed in remote migrations
- Skip re-applying if already present

### Issue: "RLS Policy error"

**Solution:**

- Ensure all policies have proper auth.uid() references
- Check that users table exists in auth schema
- Verify Supabase auth is enabled

---

## 📊 Migration File Details

**Location:** `/supabase/migrations/20251107_create_partnerships.sql`  
**Size:** ~500 lines  
**Execution Time:** ~5 seconds  
**Risk Level:** 🟢 LOW (creates new tables only, no modifications to existing data)

---

## 🎯 Next Steps After Deployment

1. **Start Development Server**

   ```bash
   npm run dev
   ```

2. **Test Partnership Creation**
   - Navigate to: `http://localhost:3000/artist-crm?tab=earnings`
   - Click "New Partnership"
   - Create test partnership with engineer account

3. **Test Revenue Recording**
   - Record test revenue via Supabase console
   - Verify real-time updates in dashboard

4. **Verify Real-Time Subscriptions**
   - Open partnership in two browser windows
   - Record revenue in one window
   - Confirm update appears in other window within 1 second

5. **Run Test Suite**

   ```bash
   npm run test
   ```

---

## 📞 Support

If you encounter issues:

1. **Check logs:** `supabase logs` (requires linked project)
2. **Debug migration:** `npx supabase migration list --linked`
3. **Inspect schema:** Visit Supabase Dashboard SQL Editor
4. **Review migration file:** Open `/supabase/migrations/20251107_create_partnerships.sql`

---

## ✨ Deployment Success Indicators

✅ All 8 tables created  
✅ 18 indexes built  
✅ 8 RLS policies active  
✅ 3 functions deployed  
✅ No errors in deployment log  
✅ Real-time subscriptions working  
✅ Dashboard data loading  

**Status:** Ready to move to Phase 2 testing! 🚀
