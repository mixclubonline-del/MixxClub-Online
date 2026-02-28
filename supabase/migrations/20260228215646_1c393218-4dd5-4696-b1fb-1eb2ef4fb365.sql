
CREATE TABLE public.funnel_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  funnel_source text NOT NULL,
  step text NOT NULL,
  step_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.funnel_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert funnel events"
  ON public.funnel_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "No direct reads"
  ON public.funnel_events FOR SELECT
  USING (false);

CREATE INDEX idx_funnel_events_source_step ON public.funnel_events (funnel_source, step);
CREATE INDEX idx_funnel_events_session ON public.funnel_events (session_id);
