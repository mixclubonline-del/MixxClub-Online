
-- Navigation items table for admin-managed site navigation
CREATE TABLE public.nav_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  icon TEXT DEFAULT NULL,
  parent_id UUID REFERENCES public.nav_items(id) ON DELETE CASCADE DEFAULT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  open_in_new_tab BOOLEAN NOT NULL DEFAULT false,
  requires_auth BOOLEAN NOT NULL DEFAULT false,
  nav_group TEXT NOT NULL DEFAULT 'main',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.nav_items ENABLE ROW LEVEL SECURITY;

-- Public read for visible items
CREATE POLICY "Anyone can read visible nav items"
  ON public.nav_items FOR SELECT
  USING (is_visible = true);

-- Admin full read (including hidden)
CREATE POLICY "Admins can read all nav items"
  ON public.nav_items FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admin insert
CREATE POLICY "Admins can insert nav items"
  ON public.nav_items FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admin update
CREATE POLICY "Admins can update nav items"
  ON public.nav_items FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admin delete
CREATE POLICY "Admins can delete nav items"
  ON public.nav_items FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger
CREATE TRIGGER nav_items_updated_at
  BEFORE UPDATE ON public.nav_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
