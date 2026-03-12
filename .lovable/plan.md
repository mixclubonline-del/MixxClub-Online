

# Fix Remaining Security Findings

## Summary

Two findings need action. The two "error" level items and the SECURITY DEFINER finding are already resolved. The remaining work targets **verbose error logging** (warn) and acknowledges the **public brand-assets bucket** (warn, intentional by design).

---

## Finding 1: Edge Functions Expose Internal Error Details (verbose_error_logging)

**Problem**: ~110 edge functions return raw `error.message` to clients, potentially leaking database schema, query structure, or system internals.

**Approach**: Create a shared `safeErrorResponse()` utility that maps known error patterns to safe messages and replaces everything else with a generic message. Then update all edge functions to use it.

### Step 1 — Update `_shared/error-handler.ts`

Add a `safeErrorResponse()` function that:
- Maps known safe patterns (rate limit, auth, validation, not found) to appropriate status codes and user-friendly messages
- For all other errors: returns `"An internal error occurred"` with status 500
- Logs the full error server-side via `console.error` (kept for debugging)
- Accepts CORS headers parameter

```text
safeErrorResponse(error, corsHeaders) → Response
  ├─ rate limit / 429     → 429 "Rate limit exceeded"
  ├─ auth / unauthorized  → 401 "Authentication required"  
  ├─ not found            → 404 "Resource not found"
  ├─ validation / missing → 400 "Invalid request"
  ├─ AppError (custom)    → error.statusCode + error.message (intentional)
  └─ everything else      → 500 "An internal error occurred"
```

### Step 2 — Update all ~110 edge functions

Replace the catch block pattern:
```typescript
// BEFORE (leaks internals)
return new Response(JSON.stringify({ error: error.message }), { status: 500 ... })

// AFTER (sanitized)
return safeErrorResponse(error, corsHeaders);
```

Priority order for updates:
1. **Payment/financial** functions (stripe-webhook, create-*-checkout, process-engineer-payout, etc.)
2. **Auth/admin** functions (delete-user-account, admin-*, create-demo-session)
3. **AI generation** functions (generate-*, chat-*, ai-*)
4. **All remaining** functions

### Step 3 — Preserve intentional user-facing errors

Some functions throw intentional user-facing errors (e.g., "Insufficient coins", "Gift not found"). These will be wrapped in `AppError` with explicit status codes so `safeErrorResponse` passes them through while sanitizing everything else.

---

## Finding 2: Brand Assets Bucket Public (public_brand_assets)

**Action**: No code change. This is intentional by design — the bucket stores public-facing brand imagery (logos, hero images). The finding will be marked as acknowledged. If draft/private assets need storage, a separate private bucket should be created in the future.

---

## Technical Details

- **Files modified**: `_shared/error-handler.ts` + ~110 `index.ts` files in `supabase/functions/`
- **No database changes** required
- **No breaking changes** — the error response shape stays `{ error: string }`, only the message content changes
- **Server-side logs preserved** — full error details still logged via `console.error` for debugging

