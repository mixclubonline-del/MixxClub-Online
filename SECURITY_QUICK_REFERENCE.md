# MixClub Security Quick Reference

> **TL;DR**: Essential security patterns for MixClub developers. Read [SECURITY.md](./SECURITY.md) for comprehensive documentation.

## 🚨 Critical Security Rules

### 1. **NEVER Trust Client-Side Data**

```typescript
// ❌ WRONG: Client-side authorization
if (userRole === 'admin') {
  deleteUser(); // Can be bypassed!
}

// ✅ CORRECT: Server-side authorization via RLS
CREATE POLICY "Only admins can delete"
ON users FOR DELETE
USING (is_admin(auth.uid()));
```

### 2. **NEVER Store Roles on Profiles Table**

```sql
-- ❌ WRONG: Roles on profiles (can be manipulated)
ALTER TABLE profiles ADD COLUMN role TEXT;

-- ✅ CORRECT: Separate user_roles table
CREATE TABLE user_roles (
  user_id UUID REFERENCES auth.users(id),
  role app_role NOT NULL
);
```

### 3. **ALWAYS Use Security Definer Functions**

```sql
-- ✅ CORRECT: Prevents RLS recursion
CREATE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public  -- CRITICAL!
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = user_uuid AND role = 'admin'
  )
$$;
```

---

## 📋 Security Checklist for New Features

**Before merging ANY feature:**

- [ ] **RLS Policies**: All new tables have RLS enabled
- [ ] **Input Validation**: Client AND server-side validation (Zod + RLS)
- [ ] **Authorization**: Server-side checks via security definer functions
- [ ] **Secrets**: No hardcoded API keys (use environment variables)
- [ ] **Logging**: No PII or tokens in console.log statements
- [ ] **SQL Injection**: Only Supabase client methods (no raw SQL)
- [ ] **XSS**: No dangerouslySetInnerHTML with user content
- [ ] **Audit Trail**: Sensitive operations logged to audit_logs

---

## 🔐 Common Patterns

### Creating a New Protected Table

```sql
-- 1. Create table
CREATE TABLE my_sensitive_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  data JSONB
);

-- 2. Enable RLS
ALTER TABLE my_sensitive_data ENABLE ROW LEVEL SECURITY;

-- 3. Add policies
CREATE POLICY "Users can view their own data"
ON my_sensitive_data FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own data"
ON my_sensitive_data FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all"
ON my_sensitive_data FOR SELECT
USING (is_admin(auth.uid()));
```

### Input Validation with Zod

```typescript
import { z } from 'zod';

// Define schema
const formSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  amount: z.number().positive().max(100000),
});

// Validate before submission
const handleSubmit = async (formData) => {
  // Client-side validation (UX)
  const result = formSchema.safeParse(formData);
  if (!result.success) {
    toast.error(result.error.errors[0].message);
    return;
  }
  
  // Server validates via RLS (security)
  const { error } = await supabase
    .from('my_table')
    .insert(result.data);
};
```

### Secure Edge Function

```typescript
// supabase/functions/my-function/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authenticated user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    // Your logic here
    const result = await processData(user.id);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

### Webhook Validation

```typescript
// Stripe webhook validation
const signature = req.headers.get('stripe-signature');
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

const event = stripe.webhooks.constructEvent(
  body,
  signature,
  webhookSecret
);

// Event is now verified to come from Stripe
```

---

## 🚫 Security Anti-Patterns to Avoid

### ❌ Client-Side Security Decisions

```typescript
// BAD: Can be bypassed in DevTools
if (localStorage.getItem('isAdmin') === 'true') {
  showAdminPanel();
}

// GOOD: UI only, server validates
if (userRole === 'admin') {
  return <AdminPanel />; // Server RLS protects actual data
}
```

### ❌ Logging Sensitive Data

```typescript
// BAD: Leaks tokens
console.log('User session:', session);

// GOOD: Development-only, minimal info
if (import.meta.env.DEV) {
  console.log('Auth event:', event);
}
```

### ❌ Hardcoded Secrets

```typescript
// BAD: Committed to Git
const apiKey = 'sk_live_abc123';

// GOOD: Environment variable
const apiKey = import.meta.env.VITE_API_KEY;
```

### ❌ Raw SQL with User Input

```typescript
// BAD: SQL injection vulnerability
const query = `SELECT * FROM users WHERE email = '${userEmail}'`;

// GOOD: Parameterized query
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('email', userEmail);
```

### ❌ Missing RLS Policies

```sql
-- BAD: Table created without RLS
CREATE TABLE sensitive_data (id UUID, data TEXT);

-- GOOD: RLS enabled immediately
CREATE TABLE sensitive_data (id UUID, data TEXT);
ALTER TABLE sensitive_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "..." ON sensitive_data ...;
```

---

## 🔍 Testing Security

### Test RLS Policies

```typescript
// Test as different users
const testRLS = async () => {
  // 1. Create test users
  const user1 = await createTestUser('user1@test.com');
  const user2 = await createTestUser('user2@test.com');
  
  // 2. Insert data as user1
  const { data } = await supabase
    .auth.signIn({ email: 'user1@test.com' })
    .from('my_table')
    .insert({ data: 'secret' });
  
  // 3. Try to read as user2
  await supabase.auth.signIn({ email: 'user2@test.com' });
  const { data: leaked } = await supabase
    .from('my_table')
    .select('*');
  
  // 4. Verify user2 can't see user1's data
  expect(leaked).toHaveLength(0);
};
```

### Test Admin Privileges

```typescript
// Verify admin policies work
const testAdmin = async () => {
  // Login as admin
  const admin = await loginAsAdmin();
  
  // Should see all data
  const { data } = await supabase.from('my_table').select('*');
  expect(data.length).toBeGreaterThan(0);
  
  // Login as regular user
  await loginAsUser();
  
  // Should only see own data
  const { data: limited } = await supabase.from('my_table').select('*');
  expect(limited.length).toBeLessThan(data.length);
};
```

---

## 📚 Quick Links

- **Full Documentation**: [SECURITY.md](./SECURITY.md)
- **Supabase RLS Guide**: https://supabase.com/docs/guides/auth/row-level-security
- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **Security Review Findings**: See [SECURITY.md](./SECURITY.md#detailed-findings)

---

## 🆘 Security Incident?

1. **Immediate Action**: Disable affected account
   ```sql
   UPDATE auth.users SET banned_until = NOW() + INTERVAL '24 hours'
   WHERE id = 'user-id';
   ```

2. **Review Audit Logs**:
   ```sql
   SELECT * FROM audit_logs
   WHERE user_id = 'user-id'
   ORDER BY created_at DESC LIMIT 100;
   ```

3. **Contact**: security@mixclub.com (create this!)

---

## ✅ Pre-Commit Checklist

Before committing code with database changes:

```bash
# 1. Check for hardcoded secrets
git diff | grep -i "api_key\|secret\|password" 

# 2. Verify RLS policies exist
psql -c "SELECT tablename FROM pg_tables 
         WHERE schemaname = 'public' 
         AND tablename NOT IN (
           SELECT tablename FROM pg_policies
         );"

# 3. Check for console.log statements
git diff | grep "console.log"

# 4. Run security linter
npm run lint:security  # Add this script!
```

---

**Remember**: Security is not a feature, it's a foundation. When in doubt, ask!

**Last Updated**: January 2025
