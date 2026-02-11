

## Fix Build Error + Migration Guidance

### 1. Fix Build Error (immediate)

The barrel file `src/components/crm/growth/index.ts` imports `GrowthHub` as a **named export**, but `GrowthHub.tsx` uses `export default`. One-line fix:

**File:** `src/components/crm/growth/index.ts`
- Change: `export { GrowthHub } from './GrowthHub';`
- To: `export { default as GrowthHub } from './GrowthHub';`

This resolves the production build failure.

### 2. Backend Migration Checklist

When you connect the new Cloud backend:

| What | Auto-migrates? | Action needed |
|------|---------------|---------------|
| Database schema (tables, columns, types) | Yes | None -- migrations re-run |
| Database functions + triggers | Yes | None |
| RLS policies | Yes | None |
| Edge functions | Yes | Auto-deployed |
| Storage buckets | Yes | Bucket config re-created |
| Stored files (audio, images) | No | Re-upload if needed |
| Table data (rows) | No | Export before switching |
| Secrets (API keys) | No | Re-enter in new project |

### 3. Secrets to Re-Enter

Based on current configuration, these secrets need to be set on the new backend:

- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- STRIPE_PUBLISHABLE_KEY
- OPENAI_API_KEY
- GOOGLE_AI_API_KEY
- AUPHONIC_API_KEY
- COINBASE_COMMERCE_API_KEY
- REPLICATE_API_KEY
- RESEND_API_KEY
- PRINTFUL_API_KEY
- SUNO_API_KEY
- REMASTER_MEDIA_API_KEY
- LOVABLE_API_KEY

Connector-managed secrets (FIRECRAWL_API_KEY, ELEVENLABS_API_KEY) will need their connectors re-linked.

### 4. Post-Switch Verification

After connecting the new backend:
1. Confirm `.env` values update automatically (VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY)
2. Test auth flow (magic link signup/login)
3. Verify edge function deployment
4. Re-enter secrets via Cloud settings
5. Run the app end-to-end to confirm data operations work

