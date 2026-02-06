

## Update GOOGLE_AI_API_KEY Secret

A single-step operation -- no code changes required.

### What happens

1. Trigger the secure secret input modal for `GOOGLE_AI_API_KEY`
2. You paste your new API key with higher quotas into the secure field
3. The secret is stored and becomes available to all edge functions that reference it:
   - `generate-video-gemini` (VEO 3.1 video generation)
   - `check-video-status` (VEO polling)
   - Any other function using `Deno.env.get("GOOGLE_AI_API_KEY")`
4. No code changes or redeployments needed -- edge functions pick up the new value automatically

### After update

We can immediately re-test VEO 3.1 video generation to confirm the higher quota key resolves the 429 errors.

