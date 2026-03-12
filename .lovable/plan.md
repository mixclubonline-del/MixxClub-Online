

# Prime Brain Agentic Upgrade — Tool-Calling + Deep Platform Knowledge

## Current State

- **AdminPrimeBrainHub**: Chat UI with quick prompts, platform pulse metrics, calls `admin-chat-enhanced` edge function
- **admin-chat-enhanced**: Non-streaming, injects real-time DB metrics into system prompt, returns a single JSON response (no tool use)
- **prime-chat**: Streaming chat for public-facing Prime, separate system prompt, no tool-calling
- **Dream Engine API**: Full MCP-like API (`dream-engine-api`) with actions: `generate`, `list-contexts`, `get-live`, `get-capabilities`, `save`, `set-active`, `list-history`, `add-context`
- **Promo Studio**: `orchestrate-promo-campaign` function that chains generators across campaign phases

**Key gaps**: Prime can't *do* anything — no tool-calling, no Dream Engine access, no Promo Studio orchestration, no persistent memory, no action execution.

## What We're Building

Turn Prime Brain from a chat-only advisor into an **agentic assistant** that can:

1. **Call tools** — Dream Engine generation, Promo campaign orchestration, DB queries
2. **Persistent memory** — Store learnings/preferences per admin in a `prime_memory` table
3. **Action execution** — Prime can trigger real platform actions with confirmation
4. **Deep system knowledge** — Dream Engine capabilities, Promo phases, and campaign strategy baked into the prompt

## Implementation

### Task 1: Database — `prime_memory` table
New migration:

```sql
CREATE TABLE public.prime_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL, -- 'preference', 'learning', 'context', 'action_history'
  key TEXT NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, category, key)
);
ALTER TABLE public.prime_memory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage own memory" ON public.prime_memory
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') AND user_id = auth.uid())
  WITH CHECK (public.has_role(auth.uid(), 'admin') AND user_id = auth.uid());
```

### Task 2: Upgrade `admin-chat-enhanced` with Tool Calling

Rewrite the edge function to use **Lovable AI tool-calling** pattern:

- Define tools array with functions:
  - `dream_engine_generate` — params: mode (image/video/audio), prompt, context
  - `dream_engine_status` — params: none (lists capabilities + live assets)
  - `promo_campaign_launch` — params: phase, character, genre
  - `promo_campaign_status` — list active campaigns and their assets
  - `query_platform_metrics` — params: metric_type (users/revenue/sessions/waitlist)
  - `save_memory` — params: category, key, value (persist a learning)
  - `recall_memory` — params: category (retrieve stored knowledge)

- Use `tool_choice: "auto"` so Prime decides when to act
- Implement a **tool execution loop**: if the AI returns tool_calls, execute them server-side (calling dream-engine-api, orchestrate-promo-campaign, or querying DB), then feed results back to continue the conversation
- Switch to **streaming** for the final response after tool resolution
- Add Dream Engine + Promo Studio knowledge to the system prompt

### Task 3: Upgrade `useAdminChat` hook

- Switch from `supabase.functions.invoke` to raw `fetch` with SSE streaming (like the copilot pattern)
- Parse SSE tokens for real-time streaming in the chat UI
- Handle tool execution status messages (show "Generating image..." or "Launching campaign..." inline)
- Load persisted memories on init to inject into context

### Task 4: Upgrade `AdminPrimeBrainHub` UI

- Add **action cards** — when Prime executes a tool, show a styled result card (image preview, campaign status, metric chart)
- Add **tool execution indicator** — animated state showing "Prime is generating artwork..." with the Dream Engine icon
- Expand quick prompts with agentic ones: "Generate a new hero image", "Launch a character-launch campaign", "What did I ask about last week?"
- Add a **Memory panel** in the Quick Intelligence sidebar showing stored preferences/learnings

## Technical Details

### Tool Execution Loop (in edge function)
```text
1. User message → AI with tools
2. If response has tool_calls:
   a. Execute each tool (fetch dream-engine-api, query DB, etc.)
   b. Append tool results as tool messages
   c. Call AI again with updated messages
   d. Repeat until AI returns a text response (max 3 iterations)
3. Stream final text response to client
```

### Dream Engine Knowledge (added to system prompt)
- Available modes: image, video, audio, imageEdit
- Context system: brand assets organized by context prefix (hero, logo, social, etc.)
- Generation flow: generate → preview → save → set-active
- Promo phases: made-with-mixxclub, character-launch, challenge, insider-drip, grand-opening
- Characters: Prime (engineer), Jax (artist), Rell (producer), Nova (fan)

## File Impact

- **Create**: Migration for `prime_memory` table
- **Edit**: `supabase/functions/admin-chat-enhanced/index.ts` (add tool definitions + execution loop + streaming + memory + Dream Engine/Promo knowledge)
- **Edit**: `src/hooks/useAdminChat.ts` (SSE streaming, tool status handling, memory loading)
- **Edit**: `src/components/admin/AdminPrimeBrainHub.tsx` (action cards, tool indicators, expanded prompts, memory panel)

