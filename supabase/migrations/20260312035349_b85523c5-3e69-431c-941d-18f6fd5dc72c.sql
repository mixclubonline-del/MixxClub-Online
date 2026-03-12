
CREATE TABLE public.admin_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT DEFAULT 'New Conversation',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.admin_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.admin_conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  tool_actions JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_admin_conversations_user ON public.admin_conversations(user_id, updated_at DESC);
CREATE INDEX idx_admin_chat_messages_conversation ON public.admin_chat_messages(conversation_id, created_at ASC);

ALTER TABLE public.admin_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_chat_messages ENABLE ROW LEVEL SECURITY;

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

-- Trigger to auto-update updated_at on conversations
CREATE OR REPLACE FUNCTION public.update_admin_conversation_timestamp()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  UPDATE public.admin_conversations SET updated_at = now() WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_update_conversation_timestamp
  AFTER INSERT ON public.admin_chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_admin_conversation_timestamp();
