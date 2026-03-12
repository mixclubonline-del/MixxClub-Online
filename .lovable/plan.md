

# Conversation History Persistence for Prime Brain

## What We're Building

Prime Brain currently stores messages in React state only — they vanish on page refresh. We'll add a database-backed conversation system so admin chat history persists across sessions, with the ability to resume the last conversation or start a new one.

## Implementation

### Task 1: Database — `admin_conversations` and `admin_chat_messages` tables

```sql
CREATE TABLE public.admin_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT DEFAULT 'New Conversation',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.admin_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.admin_conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  tool_actions JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.admin_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_chat_messages ENABLE ROW LEVEL SECURITY;

-- Admin-only access
CREATE POLICY "Admins manage own conversations" ON public.admin_conversations
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') AND user_id = auth.uid())
  WITH CHECK (public.has_role(auth.uid(), 'admin') AND user_id = auth.uid());

CREATE POLICY "Admins manage own chat messages" ON public.admin_chat_messages
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.admin_conversations c
    WHERE c.id = conversation_id AND c.user_id = auth.uid()
    AND public.has_role(auth.uid(), 'admin')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.admin_conversations c
    WHERE c.id = conversation_id AND c.user_id = auth.uid()
    AND public.has_role(auth.uid(), 'admin')
  ));
```

### Task 2: Update `useAdminChat.ts`

- Add `conversationId` state — on mount, load the most recent conversation (or create one)
- After each user message + assistant response completes, persist both to `admin_chat_messages`
- Add `loadConversation(id)` to switch between past conversations
- Add `newConversation()` to start fresh
- Add `conversations` list query (title + updated_at, last 20)
- Auto-generate conversation title from the first user message (truncated to 60 chars)

### Task 3: Update `AdminPrimeBrainHub.tsx`

- Add a conversation sidebar/dropdown in the header showing past conversations
- "New Conversation" button
- Clicking a past conversation loads its messages
- Show conversation title in the header area

## File Impact
- **Create**: Migration for `admin_conversations` + `admin_chat_messages`
- **Edit**: `src/hooks/useAdminChat.ts` (persistence layer, conversation management)
- **Edit**: `src/components/admin/AdminPrimeBrainHub.tsx` (conversation list UI, new/switch conversation controls)

