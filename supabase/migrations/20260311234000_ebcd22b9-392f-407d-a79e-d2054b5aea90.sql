
CREATE TABLE public.ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_name TEXT NOT NULL UNIQUE,
  description TEXT,
  variants JSONB NOT NULL DEFAULT '[{"name":"control","weight":50},{"name":"variant_a","weight":50}]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ab_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage ab_tests"
  ON public.ab_tests FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can read active ab_tests"
  ON public.ab_tests FOR SELECT TO anon, authenticated
  USING (is_active = true);
